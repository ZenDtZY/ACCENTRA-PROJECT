<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalEntry;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentJournalEntryController extends Controller
{
    /**
     * Display the student's journal entries and chart of accounts.
     */
    public function index(): Response
    {
        $student = Auth::guard('student')->user();

        abort_unless($student, 403);

        $accounts = ChartOfAccount::query()
            ->where('student_id', $student->id)
            ->orderBy('code')
            ->get();

        $entries = JournalEntry::query()
            ->where('student_id', $student->id)
            ->with('lines.chartOfAccount')
            ->latest('entry_date')
            ->latest('id')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'ref' => $entry->reference_no,
                    'date' => $entry->entry_date->format('Y-m-d'),
                    'description' => $entry->description,
                    'notes' => $entry->notes,
                    'status' => $entry->status,
                    'period' => $entry->period,
                    'lines' => $entry->lines->map(function ($line) {
                        return [
                            'id' => $line->id,
                            'account_id' => $line->chart_of_account_id,
                            'code' => $line->chartOfAccount->code,
                            'title' => $line->chartOfAccount->title,
                            'explanation' => $line->explanation,
                            'debit' => (float) $line->debit,
                            'credit' => (float) $line->credit,
                        ];
                    })->values(),
                ];
            });

        return Inertia::render('studentJournalEntries', [
            'accounts' => $accounts,
            'entries' => $entries,
        ]);
    }

    /**
     * Store a new journal entry and its lines.
     */
    public function store(Request $request): RedirectResponse
    {
        $student = Auth::guard('student')->user();

        abort_unless($student, 403);

        $validated = $this->validateEntry($request, $student->id);

        DB::transaction(function () use ($validated, $student) {
            // Lock the student row while generating the next reference number.
            Student::whereKey($student->id)->lockForUpdate()->firstOrFail();

            $latestEntry = JournalEntry::where('student_id', $student->id)
                ->latest('id')
                ->first();

            $nextNumber = $latestEntry
                ? ((int) preg_replace('/\D/', '', $latestEntry->reference_no)) + 1
                : 1;

            $entry = JournalEntry::create([
                'student_id' => $student->id,
                'reference_no' => 'JE-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT),
                'entry_date' => $validated['date'],
                'description' => $validated['description'],
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'],
                'period' => $validated['period'] ?? null,
            ]);

            $entry->lines()->createMany(
                $this->prepareLines($validated['lines'])
            );
        });

        return back()->with('success', 'Journal entry saved successfully.');
    }

    /**
     * Update an existing draft journal entry.
     */
    public function update(Request $request, JournalEntry $journalEntry): RedirectResponse
    {
        $student = Auth::guard('student')->user();

        abort_unless($student, 403);

        abort_unless(
            $journalEntry->student_id === $student->id,
            404
        );

        abort_if(
            $journalEntry->status === 'Posted',
            403,
            'Posted journal entries cannot be edited.'
        );

        $validated = $this->validateEntry($request, $student->id);

        DB::transaction(function () use ($journalEntry, $validated) {
            $journalEntry->update([
                'entry_date' => $validated['date'],
                'description' => $validated['description'],
                'notes' => $validated['notes'] ?? null,
                'status' => $validated['status'],
                'period' => $validated['period'] ?? null,
            ]);

            // Replace the old lines with the submitted lines.
            $journalEntry->lines()->delete();

            $journalEntry->lines()->createMany(
                $this->prepareLines($validated['lines'])
            );
        });

        return back()->with('success', 'Journal entry updated successfully.');
    }

    /**
     * Delete a draft journal entry.
     */
    public function destroy(JournalEntry $journalEntry): RedirectResponse
    {
        $student = Auth::guard('student')->user();

        abort_unless($student, 403);

        abort_unless(
            $journalEntry->student_id === $student->id,
            404
        );

        abort_if(
            $journalEntry->status === 'Posted',
            403,
            'Posted journal entries cannot be deleted.'
        );

        $journalEntry->delete();

        return back()->with('success', 'Journal entry deleted successfully.');
    }

    /**
     * Validate the journal entry and its account lines.
     */
    private function validateEntry(Request $request, int $studentId): array
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['Draft', 'Posted'])],
            'period' => ['nullable', 'string', 'max:255'],

            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_id' => [
                'required',
                'integer',
                Rule::exists('chart_of_accounts', 'id')
                    ->where('student_id', $studentId)
                    ->where('status', 'Active'),
            ],
            'lines.*.explanation' => ['nullable', 'string', 'max:255'],
            'lines.*.debit' => ['required', 'numeric', 'min:0'],
            'lines.*.credit' => ['required', 'numeric', 'min:0'],
        ]);

        foreach ($validated['lines'] as $index => $line) {
            $debit = (float) $line['debit'];
            $credit = (float) $line['credit'];

            if (($debit > 0 && $credit > 0) || ($debit == 0 && $credit == 0)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    "lines.$index.debit" =>
                        'Each account line must have either a debit or a credit amount, but not both.',
                ]);
            }
        }

        if ($validated['status'] === 'Posted') {
            $totalDebit = collect($validated['lines'])
                ->sum(fn ($line) => (float) $line['debit']);

            $totalCredit = collect($validated['lines'])
                ->sum(fn ($line) => (float) $line['credit']);

            if (round($totalDebit, 2) !== round($totalCredit, 2)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'lines' => 'A journal entry must have equal debit and credit totals before posting.',
                ]);
            }
        }

        return $validated;
    }

    /**
     * Prepare line data for database insertion.
     */
    private function prepareLines(array $lines): array
    {
        return collect($lines)->map(function ($line) {
            return [
                'chart_of_account_id' => $line['account_id'],
                'explanation' => $line['explanation'] ?? null,
                'debit' => $line['debit'],
                'credit' => $line['credit'],
            ];
        })->all();
    }
}