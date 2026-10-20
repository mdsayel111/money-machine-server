<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use Illuminate\Http\Request;

class TierController extends Controller
{
    public function index()
    {
        $tiers = MembershipTier::withCount('users')->orderBy('price', 'asc')->get();

        return inertia('tiers/index', [
            'tiers' => $tiers,
        ]);
    }

    public function show(MembershipTier $tier)
    {
        return response()->json($tier);
    }

    public function update(Request $request, MembershipTier $tier)
    {
        $validated = $request->validate([
            'subtitle' => 'required|string',
            'price' => 'required|numeric|min:0',
            'price_text' => 'required|string',
            'daily_tasks_limit' => 'required|integer',
            'referral_commission_rate' => 'required|numeric|min:0|max:100',
            'withdrawal_fee_percent' => 'required|numeric|min:0|max:100',
            'vip_support' => 'boolean',
            'instant_payouts' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $tier->update($validated);

        return redirect()->back()->with('success', 'Membership tier updated successfully.');
    }
}
