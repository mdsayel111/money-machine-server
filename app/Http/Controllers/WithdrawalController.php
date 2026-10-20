<?php

namespace App\Http\Controllers;

use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');

        $withdrawals = WithdrawalRequest::when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->with(['user', 'payoutMethod', 'processor'])
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return inertia('withdrawals/index', [
            'withdrawals' => $withdrawals,
            'currentStatus' => $status,
        ]);
    }

    public function complete(Request $request, WithdrawalRequest $withdrawal)
    {
        if ($withdrawal->status === 'completed') {
            return redirect()->back()->withErrors(['status' => 'Withdrawal already completed.']);
        }

        $validated = $request->validate([
            'transaction_reference' => 'nullable|string|max:100',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $withdrawal->status = 'completed';
        $withdrawal->transaction_reference = $validated['transaction_reference'] ?? ('TXN-' . strtoupper(uniqid()));
        $withdrawal->admin_notes = $validated['admin_notes'] ?? 'Disbursed via automated payout gateway.';
        $withdrawal->processed_by = Auth::id();
        $withdrawal->processed_at = now();
        $withdrawal->save();

        // Update corresponding wallet transaction
        WalletTransaction::where('user_id', $withdrawal->user_id)
            ->where('reference_type', 'withdrawal_request')
            ->where('reference_id', $withdrawal->id)
            ->update([
                'status' => 'completed',
                'subtitle' => "Disbursed (Ref: {$withdrawal->transaction_reference})",
            ]);

        return redirect()->back()->with('success', 'Withdrawal marked as completed and disbursed.');
    }

    public function reject(Request $request, WithdrawalRequest $withdrawal)
    {
        if ($withdrawal->status === 'completed' || $withdrawal->status === 'rejected') {
            return redirect()->back()->withErrors(['status' => 'Withdrawal cannot be rejected in current state.']);
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        DB::transaction(function () use ($withdrawal, $validated) {
            // Refund funds to user
            $user = $withdrawal->user;
            $user->available_balance += $withdrawal->amount;
            $user->save();

            $withdrawal->status = 'rejected';
            $withdrawal->admin_notes = $validated['admin_notes'];
            $withdrawal->processed_by = Auth::id();
            $withdrawal->processed_at = now();
            $withdrawal->save();

            // Record refund transaction
            $user->transactions()->create([
                'title' => "Refund: Failed Withdrawal",
                'subtitle' => "Rejected: {$validated['admin_notes']}",
                'amount' => $withdrawal->amount,
                'is_positive' => true,
                'type' => 'withdrawal',
                'status' => 'completed',
                'reference_type' => 'withdrawal_refund',
                'reference_id' => $withdrawal->id,
            ]);
        });

        return redirect()->back()->with('success', 'Withdrawal rejected and amount refunded to user balance.');
    }
}
