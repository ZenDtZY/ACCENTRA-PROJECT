<?php

use App\Mail\NewAccountCredentials;
use App\Models\Faculty;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportException;

function signInAsAccountAdmin(): User
{
    $admin = User::factory()->create(['role' => 'Admin']);
    test()->actingAs($admin);

    return $admin;
}

it('shows the next faculty and student IDs in their creation forms', function () {
    signInAsAccountAdmin();

    $this->get(route('faculty'))
        ->assertInertia(fn ($page) => $page
            ->component('facultyManagement')
            ->where('nextFacultyId', 'FCT-001'));

    $this->get(route('students'))
        ->assertInertia(fn ($page) => $page
            ->component('studentManagement')
            ->where('nextStudentId', 'STD-001'));
});

it('creates a faculty account and emails a password setup link', function () {
    Mail::fake();
    config(['app.url' => 'https://app.accentra.test']);
    signInAsAccountAdmin();

    $this->from(route('faculty'))
        ->post(route('faculty.store'), [
            'name' => 'New Faculty',
            'email' => 'new.faculty@example.com',
            'specialization' => 'Accounting',
            'subjects' => ['Fundamentals of Accounting', 'Auditing'],
            'status' => 'Active',
        ])
        ->assertRedirect(route('faculty'));

    $faculty = Faculty::where('email', 'new.faculty@example.com')->firstOrFail();
    $user = User::where('email', $faculty->email)->firstOrFail();
    $setupUrl = null;

    Mail::assertSent(NewAccountCredentials::class, function (NewAccountCredentials $mail) use ($faculty, &$setupUrl) {
        $setupUrl = $mail->setupUrl;

        return $mail->hasTo($faculty->email)
            && $mail->accountType === 'Faculty'
            && $mail->setupUrl !== ''
            && $mail->loginId === 'FCT-001'
            && $mail->accountDetails['Specialization'] === 'Accounting'
            && $mail->accountDetails['Assigned subjects'] === 'Fundamentals of Accounting, Auditing';
    });

    expect($user->role)->toBe('Faculty')
        ->and($faculty->faculty_number)->toBe('FCT-001')
        ->and($faculty->subjects)->toBe(['Fundamentals of Accounting', 'Auditing'])
        ->and($faculty->user_id)->toBe($user->id)
        ->and($user->password)->not->toBeEmpty()
        ->and(parse_url($setupUrl, PHP_URL_HOST))->toBe('app.accentra.test');

    $token = basename(parse_url($setupUrl, PHP_URL_PATH));
    expect(DB::table('account_password_setup_tokens')
        ->where('email', $faculty->email)
        ->where('account_type', 'Faculty')
        ->value('token_hash'))->toBe(hash('sha256', $token));

    $password = 'A-strong-faculty-password-23';
    $this->post(route('password.reset.update', ['token' => $token]), [
        'password' => $password,
        'password_confirmation' => $password,
    ])->assertRedirect(route('faculty.login'));

    $this->post(route('faculty.login.submit'), [
        'email' => $faculty->faculty_number,
        'password' => $password,
    ])->assertRedirect(route('faculty.dashboard'));
});

it('updates assigned subjects for an existing faculty member', function () {
    $admin = signInAsAccountAdmin();
    $faculty = Faculty::create([
        'faculty_number' => 'FCT-100',
        'name' => 'Existing Faculty',
        'email' => 'existing.faculty@example.com',
        'specialization' => 'Accounting',
        'subjects' => ['Auditing'],
        'status' => 'Active',
    ]);

    $this->put(route('faculty.update', $faculty), [
        'name' => $faculty->name,
        'email' => $faculty->email,
        'specialization' => $faculty->specialization,
        'status' => $faculty->status,
        'subjects' => ['Auditing', 'Taxation'],
    ])->assertRedirect(route('faculty'));

    expect($faculty->fresh()->subjects)->toBe(['Auditing', 'Taxation']);
});

it('creates a student account and emails a password setup link', function () {
    Mail::fake();
    signInAsAccountAdmin();

    $section = Section::create([
        'section_name' => 'BSACCT-1A',
        'course' => 'BS Accountancy',
        'year_level' => '1st Year',
        'school_year' => '2026-2027',
        'status' => 'Active',
    ]);

    $this->from(route('students'))
        ->post(route('students.store'), [
            'name' => 'New Student',
            'email' => 'new.student@example.com',
            'course' => 'BS Accountancy',
            'year_level' => '1st Year',
            'section_id' => $section->id,
            'section' => $section->section_name,
            'status' => 'Active',
        ])
        ->assertRedirect(route('students'));

    $student = Student::where('email', 'new.student@example.com')->firstOrFail();
    $setupUrl = null;

    Mail::assertSent(NewAccountCredentials::class, function (NewAccountCredentials $mail) use ($student, &$setupUrl) {
        $setupUrl = $mail->setupUrl;

        return $mail->hasTo($student->email)
            && $mail->accountType === 'Student'
            && $mail->setupUrl !== ''
            && $mail->loginId === 'STD-001'
            && $mail->accountDetails['Course'] === 'BS Accountancy'
            && $student->password !== '';
    });
    expect($student->student_number)->toBe('STD-001');

    $token = basename(parse_url($setupUrl, PHP_URL_PATH));
    expect(DB::table('account_password_setup_tokens')
        ->where('email', $student->email)
        ->where('account_type', 'Student')
        ->value('token_hash'))->toBe(hash('sha256', $token));

    $password = 'A-strong-student-password-23';
    $this->post(route('password.reset.update', ['token' => $token]), [
        'password' => $password,
        'password_confirmation' => $password,
    ])->assertRedirect(route('student.login'));

    Auth::guard('web')->logout();

    $this->post(route('student.login.submit'), [
        'email' => $student->student_number,
        'password' => $password,
    ])->assertRedirect(route('student.dashboard'));
});

it('does not create a faculty account when the credentials email cannot be sent', function () {
    signInAsAccountAdmin();

    $pendingMail = Mockery::mock();
    $pendingMail->shouldReceive('send')
        ->once()
        ->andThrow(new TransportException('SMTP authentication failed.'));

    Mail::shouldReceive('to')
        ->once()
        ->with('new.faculty@example.com')
        ->andReturn($pendingMail);

    $this->from(route('faculty'))
        ->post(route('faculty.store'), [
            'name' => 'New Faculty',
            'email' => 'new.faculty@example.com',
            'specialization' => 'Accounting',
            'status' => 'Active',
        ])
        ->assertSessionHasErrors('email');

    expect(Faculty::where('email', 'new.faculty@example.com')->exists())->toBeFalse()
        ->and(User::where('email', 'new.faculty@example.com')->exists())->toBeFalse();
});

it('does not create a student account when the credentials email cannot be sent', function () {
    signInAsAccountAdmin();

    $section = Section::create([
        'section_name' => 'BSACCT-1A',
        'course' => 'BS Accountancy',
        'year_level' => '1st Year',
        'school_year' => '2026-2027',
        'status' => 'Active',
    ]);

    $pendingMail = Mockery::mock();
    $pendingMail->shouldReceive('send')
        ->once()
        ->andThrow(new TransportException('SMTP authentication failed.'));

    Mail::shouldReceive('to')
        ->once()
        ->with('new.student@example.com')
        ->andReturn($pendingMail);

    $this->from(route('students'))
        ->post(route('students.store'), [
            'name' => 'New Student',
            'email' => 'new.student@example.com',
            'course' => 'BS Accountancy',
            'year_level' => '1st Year',
            'section_id' => $section->id,
            'section' => $section->section_name,
            'status' => 'Active',
        ])
        ->assertSessionHasErrors('email');

    expect(Student::where('email', 'new.student@example.com')->exists())->toBeFalse();
});
