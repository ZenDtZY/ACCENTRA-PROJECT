<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class FacultyPasswordController extends Controller
{
    public function edit(Request $request, string $token)
    {
        return Inertia::render('facultySetupPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                PasswordRule::min(8),
            ],
        ]);

        $user = User::where('email', $validated['email'])
            ->where('role', 'Faculty')
            ->whereHas('faculty', function ($query) {
                $query->where('status', 'Active');
            })
            ->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'Invalid or inactive faculty account.',
            ]);
        }

        $status = Password::reset(
            $validated,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }

        return redirect()
            ->route('faculty.login')
            ->with('success', 'Password created successfully. Please log in.');
    }
}
