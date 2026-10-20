<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return inertia('auth/login');
    }

    public function login(Request $request)
    {
        $identifier = trim($request->input('username') ?? $request->input('email') ?? '');
        $password = (string) $request->input('password', '');

        if (!$identifier || !$password) {
            throw ValidationException::withMessages([
                'username' => 'Username/email and password are required.',
            ]);
        }

        // Support login by email or user_code/username
        $field = filter_var($identifier, FILTER_VALIDATE_EMAIL) ? 'email' : 'user_code';

        if (Auth::attempt([$field => $identifier, 'password' => $password], $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        }

        throw ValidationException::withMessages([
            'username' => 'The provided credentials do not match our records.',
        ]);
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return inertia('auth/register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users,email',
            'username' => 'nullable|string|max:50|unique:users,user_code',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $nextId = (User::max('id') ?? 1000) + 1;
        $userCode = !empty($validated['username']) ? trim($validated['username']) : 'ADM-' . $nextId;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'user_code' => $userCode,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'available_balance' => 0.00,
            'today_earnings' => 0.00,
            'pending_rewards' => 0.00,
            'lifetime_earnings' => 0.00,
            'level' => 1,
            'level_progress' => 10,
            'referral_code' => 'ADMIN-' . strtoupper(substr(md5((string) $nextId), 0, 6)),
            'is_active' => true,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
