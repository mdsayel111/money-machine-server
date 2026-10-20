<?php

namespace App\Http\Controllers;

use App\Models\MembershipTier;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalTasks = Task::where('is_active', true)->count();
        $pendingSubmissions = TaskSubmission::where('status', 'pending')->count();
        $pendingWithdrawals = WithdrawalRequest::where('status', 'pending')->count();
        $totalDistributed = WalletTransaction::where('type', 'task')->where('is_positive', true)->sum('amount');
        $totalCommissions = WalletTransaction::where('type', 'referral')->sum('amount');
        $totalWithdrawn = WithdrawalRequest::where('status', 'completed')->sum('amount');

        $recentSubmissions = TaskSubmission::with(['user', 'task'])
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        $recentWithdrawals = WithdrawalRequest::with('user')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        $tierDistribution = MembershipTier::withCount('users')->get();

        return inertia('dashboard/index', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalTasks' => $totalTasks,
                'pendingSubmissions' => $pendingSubmissions,
                'pendingWithdrawals' => $pendingWithdrawals,
                'totalDistributed' => (float) $totalDistributed,
                'totalCommissions' => (float) $totalCommissions,
                'totalWithdrawn' => (float) $totalWithdrawn,
            ],
            'recentSubmissions' => $recentSubmissions,
            'recentWithdrawals' => $recentWithdrawals,
            'tierDistribution' => $tierDistribution,
        ]);
    }
}
