<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StudentLoginController extends Controller
{
    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required_without:login', 'string', 'max:255'],
            'login' => ['required_without:email', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $identifier = trim($validated['login'] ?? $validated['email']);

        $student = Student::query()
            ->where(function ($query) use ($identifier) {
                $query->whereRaw('UPPER(TRIM(student_number)) = ?', [Str::upper($identifier)])
                    ->orWhereRaw('LOWER(TRIM(email)) = ?', [Str::lower($identifier)]);
            })
            ->where('status', 'Active')
            ->first();

        if (! $student || ! $student->password || ! Hash::check($validated['password'], $student->password)) {
            throw ValidationException::withMessages([
                'email' => 'Invalid student ID or password.',
            ]);
        }

        Auth::guard('student')->login(
            $student,
            $request->boolean('remember')
        );

        // Regenerate the session to prevent session fixation.
        $request->session()->regenerate();

        return redirect()->route('student.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('student')->logout();
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('student.login');
    }
}