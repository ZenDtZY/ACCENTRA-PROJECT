<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class FacultyLoginController extends Controller
{
    public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => ['required', 'string', 'max:255'],
        'password' => ['required', 'string'],
    ]);

    $identifier = trim($credentials['email']);

    // Find faculty using Faculty ID or Email
    $faculty = Faculty::query()
        ->where(function ($query) use ($identifier) {
            $query->whereRaw(
                'UPPER(TRIM(faculty_number)) = ?',
                [strtoupper($identifier)]
            )->orWhereRaw(
                'LOWER(TRIM(email)) = ?',
                [strtolower($identifier)]
            );
        })
        ->first();

    // Check faculty account
    if (!$faculty || $faculty->status !== 'Active') {
        throw ValidationException::withMessages([
            'email' => 'Invalid faculty ID, email, or inactive account.',
        ]);
    }

    // Find associated user
    $user = User::query()
        ->whereKey($faculty->user_id)
        ->where('role', 'Faculty')
        ->first();

    if (!$user) {
        throw ValidationException::withMessages([
            'email' => 'Faculty account is not properly linked to a user account.',
        ]);
    }

    // Authenticate using the associated user's email
    $authenticated = Auth::attempt([
        'email' => $user->email,
        'password' => $credentials['password'],
        'role' => 'Faculty',
    ], $request->boolean('remember'));

    if (!$authenticated) {
        throw ValidationException::withMessages([
            'email' => 'Invalid faculty ID, email, or password.',
        ]);
    }

    $request->session()->regenerate();

    return redirect()->route('faculty.dashboard');
}

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('faculty.login');
    }
}
