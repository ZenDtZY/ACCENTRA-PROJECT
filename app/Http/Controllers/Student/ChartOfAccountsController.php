<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ChartOfAccountsController extends Controller
{
    private function currentStudent(): Student
    {
        $user = Auth::user();
        $student = $user instanceof Student
            ? $user
            : Student::where('user_id', $user?->id)->first();

        abort_unless($student && $student->status === 'Active', 403);

        return $student;
    }

    public function index()
    {
        $accounts = $this->currentStudent()
            ->chartOfAccounts()
            ->orderBy('code')
            ->get()
            ->map(fn (ChartOfAccount $account) => $this->present($account))
            ->values()
            ->all();

        return Inertia::render('studentChartOfAccounts', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $student = $this->currentStudent();
        $data = $this->validateAccount($request, $student);

        DB::transaction(function () use ($student, $data) {
            Student::query()->whereKey($student->id)->lockForUpdate()->firstOrFail();

            if (empty($data['code'])) {
                $data['code'] = $this->generateCode($student, $data['type']);
            }

            $student->chartOfAccounts()->create($data);
        });

        return to_route('student.accounting.chart-of-accounts');
    }

    public function update(Request $request, int $account)
    {
        $student = $this->currentStudent();
        $account = $student->chartOfAccounts()->findOrFail($account);
        $data = $this->validateAccount($request, $student, $account);

        $account->update($data);

        return to_route('student.accounting.chart-of-accounts');
    }

    public function destroy(int $account)
{
    $chartOfAccount = $this->currentStudent()
        ->chartOfAccounts()
        ->findOrFail($account);

    DB::transaction(function () use ($chartOfAccount) {
        // Delete journal entry lines referencing this account
        DB::table('journal_entry_lines')
            ->where('chart_of_account_id', $chartOfAccount->id)
            ->delete();

        // Delete the chart of account
        $chartOfAccount->delete();
    });

    return to_route('student.accounting.chart-of-accounts')
        ->with('success', 'Account deleted successfully.');
}

    private function validateAccount(
        Request $request,
        Student $student,
        ?ChartOfAccount $account = null
    ): array {
        $normalized = [
            'account_group' => $request->input('accountGroup', $request->input('account_group')),
        ];

        foreach ([
            'type' => ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
            'nature' => ['Debit', 'Credit'],
            'status' => ['Active', 'Inactive'],
        ] as $field => $allowedValues) {
            $value = $request->input($field);
            if (is_string($value)) {
                foreach ($allowedValues as $allowedValue) {
                    if (strcasecmp(trim($value), $allowedValue) === 0) {
                        $normalized[$field] = $allowedValue;
                        break;
                    }
                }
            }
        }

        $request->merge($normalized);

        return $request->validate([
            'code' => [
                'nullable',
                'string',
                'size:3',
                'regex:/^\d{3}$/',
                Rule::unique('chart_of_accounts', 'code')
                    ->where('student_id', $student->id)
                    ->ignore($account?->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', Rule::in(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'])],
            'nature' => ['required', 'string', Rule::in(['Debit', 'Credit'])],
            'account_group' => ['required', 'string', 'max:255'],
            'period' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:250'],
            'status' => ['required', 'string', Rule::in(['Active', 'Inactive'])],
        ]);
    }

    private function generateCode(Student $student, string $type): string
    {
        $prefix = [
            'Asset' => '1',
            'Liability' => '2',
            'Equity' => '3',
            'Revenue' => '4',
            'Expense' => '5',
        ][$type];

        $usedCodes = $student->chartOfAccounts()
            ->where('code', 'like', $prefix.'%')
            ->pluck('code')
            ->all();

        for ($number = 1; $number <= 99; $number++) {
            $code = $prefix.str_pad((string) $number, 2, '0', STR_PAD_LEFT);

            if (! in_array($code, $usedCodes, true)) {
                return $code;
            }
        }

        throw ValidationException::withMessages([
            'code' => 'No account codes remain for this account type.',
        ]);
    }

    private function present(ChartOfAccount $account): array
    {
        return [
            'id' => $account->id,
            'code' => $account->code,
            'title' => $account->title,
            'type' => $account->type,
            'nature' => $account->nature,
            'accountGroup' => $account->account_group,
            'period' => $account->period,
            'description' => $account->description,
            'status' => $account->status,
        ];
    }
}
