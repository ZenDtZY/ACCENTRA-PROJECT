<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetLink;
use App\Models\Student;
use App\Models\User;
use App\Support\PasswordSetupLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class PasswordResetLinkController extends Controller
{
    public function sendAdminResetLink(Request $request): RedirectResponse
    {
        return $this->sendResetLink($request, 'Admin');
    }

    public function sendFacultyResetLink(Request $request): RedirectResponse
    {
        return $this->sendResetLink($request, 'Faculty');
    }

    public function sendStudentResetLink(Request $request): RedirectResponse
    {
        return $this->sendResetLink($request, 'Student');
    }

    private function sendResetLink(Request $request, string $role): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $email = Str::lower(trim($validated['email']));
        $user = $this->eligibleUser($email, $role);

        if ($user) {
            $accountType = $role;
            $resetLink = app(PasswordSetupLink::class)->create($email, $accountType);

            try {
                Mail::to($user->email)->send(new PasswordResetLink(
                    $user->name,
                    $accountType,
                    $resetLink['url'],
                ));
            } catch (TransportExceptionInterface $exception) {
                DB::table('account_password_setup_tokens')
                    ->where('email', $email)
                    ->where('account_type', $accountType)
                    ->where('token_hash', $resetLink['tokenHash'])
                    ->delete();

                report($exception);

                throw ValidationException::withMessages([
                    'email' => 'We could not send the recovery email. Please contact the administrator to verify the email server settings.',
                ]);
            }
        }

        return back()->with(
            'status',
            'If an eligible account exists, a password reset link has been sent to its email address.',
        );
    }

    private function eligibleUser(string $email, string $role): User|Student|null
    {
        if ($role === 'Student') {
            return Student::query()
                ->whereRaw('LOWER(email) = ?', [$email])
                ->where('status', 'Active')
                ->first();
        }

        $query = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->where('role', $role);

        if ($role === 'Faculty') {
            $query->whereHas('faculty', fn ($faculty) => $faculty->where('status', 'Active'));
        }

        return $query->first();
    }
}
