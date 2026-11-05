<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentJournalEntryController extends Controller
{
    public function index(): Response
    {
        $student = Auth::guard('student')->user();
        abort_unless($student, 403);

        $accounts = ChartOfAccount::query()
            ->where('student_id', $student->id)
            ->orderBy('code')
            ->get();

        $records = JournalEntry::query()
            ->where('student_id', $student->id)
            ->with('lines.chartOfAccount')
            ->latest('entry_date')
            ->latest('id')
            ->get();

        // New reports share report_uuid. Older entries have no report_uuid and
        // are exposed as one-entry reports, so existing data remains visible.
        $reports = $records->groupBy(
            fn (JournalEntry $entry) => $entry->report_uuid ?: 'legacy-' . $entry->id
        )->map(function (Collection $group) {
            /** @var JournalEntry $first */
            $first = $group->first();

            $children = $group->sortBy('id')->values()->map(function (JournalEntry $entry) {
                return [
                    'id' => $entry->id,
                    'ref' => $entry->reference_no,
                    'date' => $entry->entry_date?->format('Y-m-d'),
                    'description' => $entry->description,
                    'notes' => $entry->notes,
                    'status' => $entry->status,
                    'lines' => $entry->lines->map(function ($line) {
                        return [
                            'id' => $line->id,
                            'account_id' => $line->chart_of_account_id,
                            'code' => $line->chartOfAccount?->code,
                            'title' => $line->chartOfAccount?->title,
                            'explanation' => $line->explanation,
                            'debit' => (float) $line->debit,
                            'credit' => (float) $line->credit,
                        ];
                    })->values(),
                ];
            });

            return [
                // The first child ID is the stable route key for update/delete.
                'id' => $first->id,
                'ref' => $first->report_reference_no ?: $first->reference_no,
                'date' => $children->first()['date'] ?? null,
                'description' => $first->report_title ?: ($children->count() . ' transactions'),
                'companyName' => $first->company_name,
                'reportTitle' => $first->report_title,
                'period' => $first->period,
                'status' => $first->status,
                'entries' => $children,
            ];
        })->values();

        return Inertia::render('studentJournalEntries', [
            'accounts' => $accounts,
            'entries' => $reports,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $student = Auth::guard('student')->user();
        abort_unless($student, 403);

        $validated = $this->validateReport($request, (int) $student->id);

        DB::transaction(function () use ($validated, $student) {
            Student::whereKey($student->id)->lockForUpdate()->firstOrFail();

            $latest = JournalEntry::query()
                ->where('student_id', $student->id)
                ->latest('id')
                ->first();

            $lastReference = $latest?->report_reference_no ?: $latest?->reference_no;
            $nextNumber = $lastReference
                ? ((int) preg_replace('/\D/', '', $lastReference)) + 1
                : 1;

            $reportReference = 'JE-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
            $reportUuid = (string) Str::uuid();

            foreach ($validated['entries'] as $index => $item) {
                $childReference = $index === 0
                    ? $reportReference
                    : $reportReference . '-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);

                $entry = JournalEntry::create([
                    'student_id' => $student->id,
                    'reference_no' => $childReference,
                    'report_uuid' => $reportUuid,
                    'report_reference_no' => $reportReference,
                    'company_name' => $validated['companyName'] ?? null,
                    'report_title' => $validated['reportTitle'] ?? null,
                    'entry_date' => $item['date'],
                    'description' => $item['description'],
                    'notes' => $item['notes'] ?? null,
                    'status' => $validated['status'],
                    'period' => $validated['period'] ?? null,
                ]);

                $entry->lines()->createMany($this->prepareLines($item['lines']));
            }
        });

        return back()->with('success', 'Journal report saved successfully.');
    }

    public function update(Request $request, JournalEntry $journalEntry): RedirectResponse
    {
        $student = Auth::guard('student')->user();
        abort_unless($student, 403);
        abort_unless((int) $journalEntry->student_id === (int) $student->id, 404);

        $group = $this->reportQuery($journalEntry, (int) $student->id)->get();

        $validated = $this->validateReport($request, (int) $student->id);

        DB::transaction(function () use ($journalEntry, $student, $group, $validated) {
            $reportUuid = $journalEntry->report_uuid ?: (string) Str::uuid();
            $reportReference = $journalEntry->report_reference_no ?: $journalEntry->reference_no;

            $existing = $group->sortBy('id')->values();

            foreach ($validated['entries'] as $index => $item) {
                $childReference = $index === 0
                    ? $reportReference
                    : $reportReference . '-' . str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);

                $attributes = [
                    'student_id' => $student->id,
                    'reference_no' => $childReference,
                    'report_uuid' => $reportUuid,
                    'report_reference_no' => $reportReference,
                    'company_name' => $validated['companyName'] ?? null,
                    'report_title' => $validated['reportTitle'] ?? null,
                    'entry_date' => $item['date'],
                    'description' => $item['description'],
                    'notes' => $item['notes'] ?? null,
                    'status' => $validated['status'],
                    'period' => $validated['period'] ?? null,
                ];

                if (isset($existing[$index])) {
                    $entry = $existing[$index];
                    $entry->update($attributes);
                    $entry->lines()->delete();
                } else {
                    $entry = JournalEntry::create($attributes);
                }

                $entry->lines()->createMany($this->prepareLines($item['lines']));
            }

            // Remove only surplus draft children belonging to this report.
            foreach ($existing->slice(count($validated['entries'])) as $surplus) {
                $surplus->lines()->delete();
                $surplus->delete();
            }
        });

        return back()->with('success', 'Journal report updated successfully.');
    }

    public function destroy(JournalEntry $journalEntry): RedirectResponse
    {
        $student = Auth::guard('student')->user();
        abort_unless($student, 403);
        abort_unless((int) $journalEntry->student_id === (int) $student->id, 404);

        $group = $this->reportQuery($journalEntry, (int) $student->id)->get();

        DB::transaction(function () use ($group) {
            foreach ($group as $entry) {
                $entry->lines()->delete();
                $entry->delete();
            }
        });

        return back()->with('success', 'Journal report deleted successfully.');
    }

    private function reportQuery(JournalEntry $entry, int $studentId)
    {
        $query = JournalEntry::query()->where('student_id', $studentId);

        return $entry->report_uuid
            ? $query->where('report_uuid', $entry->report_uuid)
            : $query->whereKey($entry->id);
    }

    private function validateReport(Request $request, int $studentId): array
    {
        $validated = $request->validate([
            'companyName' => ['nullable', 'string', 'max:255'],
            'reportTitle' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['Draft', 'Posted'])],
            'entries' => ['required', 'array', 'min:1'],
            'entries.*.date' => ['required', 'date'],
            'entries.*.description' => ['required', 'string', 'max:255'],
            'entries.*.notes' => ['nullable', 'string'],
            'entries.*.lines' => ['required', 'array', 'min:2'],
            'entries.*.lines.*.account_id' => [
                'required',
                'integer',
                Rule::exists('chart_of_accounts', 'id')
                    ->where('student_id', $studentId)
                    ->where('status', 'Active'),
            ],
            'entries.*.lines.*.explanation' => ['nullable', 'string', 'max:255'],
            'entries.*.lines.*.debit' => ['required', 'numeric', 'min:0'],
            'entries.*.lines.*.credit' => ['required', 'numeric', 'min:0'],
        ]);

        $overallDebit = 0.0;
        $overallCredit = 0.0;

        foreach ($validated['entries'] as $entryIndex => $item) {
            $debit = 0.0;
            $credit = 0.0;

            foreach ($item['lines'] as $lineIndex => $line) {
                $lineDebit = (float) $line['debit'];
                $lineCredit = (float) $line['credit'];

                if (($lineDebit > 0 && $lineCredit > 0) || ($lineDebit == 0 && $lineCredit == 0)) {
                    throw ValidationException::withMessages([
                        "entries.$entryIndex.lines.$lineIndex.debit" =>
                            'Each line must contain either a debit or a credit amount, but not both.',
                    ]);
                }

                $debit += $lineDebit;
                $credit += $lineCredit;
            }

            $overallDebit += $debit;
            $overallCredit += $credit;

            if ($validated['status'] === 'Posted' && ($debit <= 0 || abs($debit - $credit) >= 0.005)) {
                throw ValidationException::withMessages([
                    "entries.$entryIndex.lines" =>
                        'Every transaction must balance individually before the report can be posted.',
                ]);
            }
        }

        if (
            $validated['status'] === 'Posted' &&
            ($overallDebit <= 0 || abs($overallDebit - $overallCredit) >= 0.005)
        ) {
            throw ValidationException::withMessages([
                'entries' => 'The complete journal report must have equal total debit and credit before posting.',
            ]);
        }

        return $validated;
    }

    private function prepareLines(array $lines): array
    {
        return collect($lines)->map(fn (array $line) => [
            'chart_of_account_id' => $line['account_id'],
            'explanation' => $line['explanation'] ?? null,
            'debit' => $line['debit'],
            'credit' => $line['credit'],
        ])->all();
    }
}