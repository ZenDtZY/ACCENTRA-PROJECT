<?php

use App\Models\ChartOfAccount;
use App\Models\Student;

function chartOfAccountsStudent(array $attributes = []): Student
{
    return Student::create(array_merge([
        'student_number' => 'STU-'.fake()->unique()->numerify('#####'),
        'name' => 'Chart Student',
        'email' => fake()->unique()->safeEmail(),
        'course' => 'BS Accountancy',
        'year_level' => '1st Year',
        'status' => 'Active',
    ], $attributes));
}

function validChartAccount(array $attributes = []): array
{
    return array_merge([
        'title' => 'Cash',
        'type' => 'Asset',
        'nature' => 'Debit',
        'accountGroup' => 'ABC School Supplies',
        'period' => 'End of Month',
        'description' => 'Cash available for operations.',
        'status' => 'Active',
    ], $attributes);
}

it('renders persisted accounts and supports create, update, and delete', function () {
    $student = chartOfAccountsStudent();

    $this->actingAs($student, 'student')
        ->get(route('student.accounting.chart-of-accounts'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('studentChartOfAccounts')
            ->has('accounts', 0));

    $this->actingAs($student, 'student')
        ->post(route('student.accounting.chart-of-accounts.store'), validChartAccount())
        ->assertRedirect(route('student.accounting.chart-of-accounts'));

    $account = ChartOfAccount::where('student_id', $student->id)->firstOrFail();
    expect($account->code)->toBe('101')
        ->and($account->account_group)->toBe('ABC School Supplies');

    $this->put(route('student.accounting.chart-of-accounts.update', $account), validChartAccount([
        'title' => 'Petty Cash',
        'description' => 'Cash held for small purchases.',
    ]))->assertRedirect(route('student.accounting.chart-of-accounts'));

    expect($account->fresh()->title)->toBe('Petty Cash')
        ->and($account->fresh()->description)->toBe('Cash held for small purchases.');

    $this->delete(route('student.accounting.chart-of-accounts.destroy', $account))
        ->assertRedirect(route('student.accounting.chart-of-accounts'));

    $this->assertDatabaseMissing('chart_of_accounts', ['id' => $account->id]);
});

it('generates unique account codes per type and per student', function () {
    $student = chartOfAccountsStudent();
    $otherStudent = chartOfAccountsStudent();

    $this->actingAs($student, 'student')
        ->post(route('student.accounting.chart-of-accounts.store'), validChartAccount())
        ->assertRedirect();
    $this->post(route('student.accounting.chart-of-accounts.store'), validChartAccount([
        'title' => 'Accounts Receivable',
    ]))->assertRedirect();

    $this->actingAs($otherStudent, 'student')
        ->post(route('student.accounting.chart-of-accounts.store'), validChartAccount())
        ->assertRedirect();

    expect($student->chartOfAccounts()->orderBy('code')->pluck('code')->all())
        ->toBe(['101', '102'])
        ->and($otherStudent->chartOfAccounts()->value('code'))->toBe('101');
});

it('prevents students from viewing or changing another student account', function () {
    $student = chartOfAccountsStudent();
    $otherStudent = chartOfAccountsStudent();
    $account = $otherStudent->chartOfAccounts()->create(array_merge(
        validChartAccount(),
        ['code' => '101', 'account_group' => 'ABC School Supplies']
    ));

    $this->actingAs($student, 'student')
        ->get(route('student.accounting.chart-of-accounts'))
        ->assertInertia(fn ($page) => $page->has('accounts', 0));

    $this->put(route('student.accounting.chart-of-accounts.update', $account), validChartAccount())
        ->assertNotFound();

    $this->delete(route('student.accounting.chart-of-accounts.destroy', $account))
        ->assertNotFound();

    expect($account->fresh())->not->toBeNull();
});

it('validates account fields before saving', function () {
    $student = chartOfAccountsStudent();

    $this->actingAs($student, 'student')
        ->from(route('student.accounting.chart-of-accounts'))
        ->post(route('student.accounting.chart-of-accounts.store'), validChartAccount([
            'type' => 'Other',
            'nature' => 'Invalid',
            'title' => '',
        ]))
        ->assertSessionHasErrors(['title', 'type', 'nature']);

    expect($student->chartOfAccounts()->exists())->toBeFalse();
});

it('accepts account enum values regardless of letter case', function () {
    $student = chartOfAccountsStudent();

    $this->actingAs($student, 'student')
        ->post(route('student.accounting.chart-of-accounts.store'), validChartAccount([
            'type' => 'asset',
            'nature' => 'debit',
            'status' => 'active',
        ]))
        ->assertRedirect(route('student.accounting.chart-of-accounts'));

    $account = $student->chartOfAccounts()->firstOrFail();
    expect($account->type)->toBe('Asset')
        ->and($account->nature)->toBe('Debit')
        ->and($account->status)->toBe('Active');
});
