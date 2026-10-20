<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->input('search', ''));
        $tier = $request->input('tier');

        $users = User::when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('user_code', 'like', "%{$search}%")
                      ->orWhere('referral_code', 'like', "%{$search}%");
                });
            })
            ->when($tier, function ($query, $tier) {
                $query->where('tier_level', $tier);
            })
            ->with(['tier', 'referrer'])
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        $tiers = MembershipTier::all();

        return inertia('users/index', [
            'users' => $users,
            'tiers' => $tiers,
            'filters' => [
                'search' => $search,
                'tier' => $tier,
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'tier',
            'referrer',
            'directReferrals.tier',
            'transactions',
            'taskSubmissions.task',
            'withdrawalRequests',
        ]);

        $tiers = MembershipTier::all();

        return inertia('users/show', [
            'user' => $user,
            'tiers' => $tiers,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'tier_level' => 'required|string',
            'available_balance' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
        ]);

        $tier = MembershipTier::where('name', $validated['tier_level'])->first();
        if ($tier) {
            $user->tier_id = $tier->id;
        }

        $user->tier_level = $validated['tier_level'];
        $user->available_balance = $validated['available_balance'];
        $user->is_active = $validated['is_active'];
        $user->save();

        return redirect()->back()->with('success', 'User updated successfully.');
    }
}
