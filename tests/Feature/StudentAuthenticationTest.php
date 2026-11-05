<?php

use App\Mail\PasswordResetLink;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Exception\TransportException;

function createActiveStudent(array $attributes = []): Student
{
    return Student::create(array_merge([
        'student_number' => 'STU-1001',
        'name' => 'Test Student',
        'email' => 'student@example.com',
        'course' => 'BS Accountancy',
        'year_level' => '1st Year',
        'status' => 'Active',
    ], $attributes));
}

it('allows a student to set a password through an email link and log in', function () {
    Mail::fake();
    $student = createActiveStudent();

    $this->get(route('student.login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('studentLogin')
            ->where('csrfToken', csrf_token()));

    $this->from(route('student.password.request'))
        ->post(route('student.password.reset-link.send'), ['email' => $student->email])
        ->assertRedirect(route('student.password.request'));

    $tokenRecord = DB::table('account_password_setup_tokens')
        ->where('email', $student->email)
        ->first();

    $resetUrl = null;
    Mail::assertSent(PasswordResetLink::class, function (PasswordResetLink $mail) use (&$resetUrl) {
        $resetUrl = $mail->resetUrl;

        return $mail->accountType === 'Student';
    });

    $token = basename(parse_url($resetUrl, PHP_URL_PATH));
    expect($tokenRecord)->not->toBeNull()
        ->and($tokenRecord->token_hash)->toBe(hash('sha256', $token));

    $password = 'A-strong-student-password-23';

    $this->post(route('password.reset.update', ['token' => $token]), [
            'password' => $password,
            'password_confirmation' => $password,
        ])
        ->assertRedirect(route('student.login'))
        ->assertSessionHas('success', 'Password updated successfully. Please log in.');

    $this->get(route('student.login'))
        ->assertInertia(fn ($page) => $page
            ->where('flash.success', 'Password updated successfully. Please log in.'));

    expect(Hash::check($password, $student->fresh()->password))->toBeTrue();

    $this->post(route('student.login.submit'), [
        'email' => $student->email,
        'password' => $password,
        'remember' => true,
    ])->assertRedirect(route('student.dashboard'));

    $this->assertAuthenticatedAs($student, 'student');

    $this->get(route('student.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('studentDashboard'));
});

it('allows a student to log in with their student number', function () {
    $password = 'A-strong-student-password-23';
    $student = createActiveStudent([
        'password' => Hash::make($password),
    ]);

    $this->post(route('student.login.submit'), [
        'login' => strtolower($student->student_number),
        'password' => $password,
    ])->assertRedirect(route('student.dashboard'));

    $this->assertAuthenticatedAs($student, 'student');
});

it('does not issue a password reset link for inactive student records', function () {
    Mail::fake();
    $student = createActiveStudent(['status' => 'Inactive']);

    $this->from(route('student.password.request'))
        ->post(route('student.password.reset-link.send'), ['email' => $student->email])
        ->assertRedirect(route('student.password.request'))
        ->assertSessionHas('status');

    Mail::assertNothingSent();
    expect(DB::table('account_password_setup_tokens')->where('account_type', 'Student')->exists())->toBeFalse();
});

it('shows an error and removes the reset token if the mail transport fails', function () {
    $student = createActiveStudent();
    $pendingMail = Mockery::mock();
    $pendingMail->shouldReceive('send')
        ->once()
        ->andThrow(new TransportException('SMTP authentication failed.'));

    Mail::shouldReceive('to')
        ->once()
        ->with($student->email)
        ->andReturn($pendingMail);

    $this->from(route('student.password.request'))
        ->post(route('student.password.reset-link.send'), ['email' => $student->email])
        ->assertSessionHasErrors([
            'email' => 'We could not send the recovery email. Please contact the administrator to verify the email server settings.',
        ]);

    expect(DB::table('account_password_setup_tokens')->where('account_type', 'Student')->exists())->toBeFalse();
});

it('rejects a student login if no password has been set', function () {
    $student = createActiveStudent();

    $this->from(route('student.login'))
        ->post(route('student.login.submit'), [
            'email' => $student->email,
            'password' => 'anything',
        ])
        ->assertSessionHasErrors('email');

    $this->assertGuest('student');
});

it('logs a student out of the student guard', function () {
    $student = createActiveStudent([
        'password' => Hash::make('A-strong-student-password-23'),
    ]);

    $this->actingAs($student, 'student')
        ->post(route('student.logout'))
        ->assertRedirect(route('student.login'));

    $this->assertGuest('student');
});

it('logs out a student who was deactivated after signing in', function () {
    $student = createActiveStudent();
    $this->actingAs($student, 'student');
    $student->update(['status' => 'Inactive']);

    $this->get(route('student.dashboard'))
        ->assertRedirect(route('student.login'));

    $this->assertGuest('student');
});
