<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MembershipTier;
use App\Models\NetworkActivity;
use App\Models\PayoutMethod;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientApiController extends Controller
{
    /**
     * Helper to get active user (defaults to Rahat ERN-1024 if unauthenticated for testing/demo)
     */
    protected function resolveUser(Request $request): User
    {
        if ($request->user()) {
            return $request->user();
        }

        // Return the primary demo user for mobile webview client
        return User::where('user_code', 'ERN-1024')
            ->orWhere('email', 'rahat.chowdhury@email.com')
            ->first() ?? User::where('role', 'user')->first();
    }

    /**
     * GET /api/user/profile
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $directCount = User::where('referred_by_id', $user->id)->count();

        // Level 2 count
        $directIds = User::where('referred_by_id', $user->id)->pluck('id');
        $l2Count = User::whereIn('referred_by_id', $directIds)->count();
        $totalNetworkCount = $directCount + $l2Count;

        return response()->json([
            'id' => $user->user_code ?? "ERN-{$user->id}",
            'name' => $user->name,
            'email' => $user->email,
            'greeting' => 'GOOD MORNING,',
            'avatarUrl' => $user->avatar_url ?: '/avatars/rahat.jpg',
            'tier' => $user->tier_level,
            'availableBalance' => (float) $user->available_balance,
            'todayEarnings' => (float) $user->today_earnings,
            'pendingRewards' => (float) $user->pending_rewards,
            'level' => $user->level,
            'levelProgress' => $user->level_progress,
            'lifetimeEarnings' => (float) $user->lifetime_earnings,
            'directUsersCount' => $directCount,
            'networkUsersCount' => $totalNetworkCount,
            'referralCode' => $user->referral_code,
            'tasksCompletedCount' => $user->tasks_completed_count,
            'invitedCount' => $totalNetworkCount,
        ]);
    }

    /**
     * GET /api/tasks
     */
    public function getTasks(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $query = Task::where('is_active', true);

        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('platform', 'like', "%{$search}%");
            });
        }

        $allTasks = $query->orderBy('created_at', 'desc')->get();

        $featured = $allTasks->where('is_featured', true)->values()->map(function ($task) {
            return [
                'id' => (string) $task->id,
                'title' => $task->title,
                'platform' => $task->platform,
                'tags' => $task->tags ?? [],
                'reward' => (float) $task->reward,
                'rewardSuffix' => $task->reward_suffix,
                'timeEstimate' => $task->time_estimate,
                'limitNotice' => $task->limit_notice,
                'category' => $task->category,
                'isFeatured' => true,
                'actionUrl' => $task->action_url,
            ];
        });

        $marketplace = $allTasks->values()->map(function ($task) {
            return [
                'id' => (string) $task->id,
                'title' => $task->title,
                'platform' => $task->platform,
                'tags' => $task->tags ?? [],
                'reward' => (float) $task->reward,
                'rewardSuffix' => $task->reward_suffix,
                'timeEstimate' => $task->time_estimate,
                'remainingSlots' => $task->remaining_slots,
                'limitNotice' => $task->limit_notice,
                'category' => $task->category,
                'isFeatured' => (bool) $task->is_featured,
                'actionUrl' => $task->action_url,
            ];
        });

        return response()->json([
            'featured' => $featured,
            'marketplace' => $marketplace,
        ]);
    }

    /**
     * POST /api/tasks/{task}/submit
     */
    public function submitTask(Request $request, Task $task): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'proof_text' => 'nullable|string',
            'proof_image' => 'nullable|string',
        ]);

        $submission = TaskSubmission::create([
            'user_id' => $user->id,
            'task_id' => $task->id,
            'reward_amount' => $task->reward,
            'proof_text' => $validated['proof_text'] ?? 'Task completion proof submitted',
            'proof_image' => $validated['proof_image'] ?? null,
            'status' => 'pending',
        ]);

        // Add to pending rewards
        $user->pending_rewards += $task->reward;
        $user->tasks_completed_count += 1;
        $user->save();

        return response()->json([
            'message' => 'Task submission received! Reward is pending approval.',
            'submission_id' => $submission->id,
            'status' => 'pending',
            'reward' => (float) $task->reward,
        ]);
    }

    /**
     * GET /api/network
     */
    public function getNetwork(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $directMembers = User::where('referred_by_id', $user->id)->get();
        $directIds = $directMembers->pluck('id');

        $l2Members = User::whereIn('referred_by_id', $directIds)->get();
        $l2Ids = $l2Members->pluck('id');

        $l3Members = User::whereIn('referred_by_id', $l2Ids)->get();

        $directCount = $directMembers->count();
        $networkCount = $directCount + $l2Members->count() + $l3Members->count();

        // Commission levels
        $commissionLevels = [
            [
                'level' => 'L1',
                'title' => 'Direct Referrals',
                'activeMembers' => $directCount,
                'ratePercent' => 12.0,
                'badgeBg' => 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                'badgeTextColor' => 'text-emerald-600',
            ],
            [
                'level' => 'L2',
                'title' => 'Level 2 Network',
                'activeMembers' => $l2Members->count(),
                'ratePercent' => 5.0,
                'badgeBg' => 'bg-blue-50 text-blue-600 border border-blue-100',
                'badgeTextColor' => 'text-blue-600',
            ],
            [
                'level' => 'L3',
                'title' => 'Level 3 Network',
                'activeMembers' => $l3Members->count(),
                'ratePercent' => 2.0,
                'badgeBg' => 'bg-purple-50 text-purple-600 border border-purple-100',
                'badgeTextColor' => 'text-purple-600',
            ],
        ];

        // Recent network activities
        $activities = NetworkActivity::where('user_id', $user->id)
            ->with('actor')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => "act-{$act->id}",
                    'userName' => $act->actor ? $act->actor->name : 'Network Member',
                    'userAvatar' => $act->actor ? ($act->actor->avatar_url ?: '/avatars/tanvir.jpg') : '/avatars/tanvir.jpg',
                    'action' => $act->action,
                    'timeAgo' => $act->created_at->diffForHumans(),
                    'badgeText' => $act->badge_text,
                    'badgeType' => $act->badge_type,
                    'amount' => $act->amount ? (float) $act->amount : null,
                    'amountPrefix' => $act->amount_prefix,
                    'isPositive' => (bool) $act->is_positive,
                ];
            });

        // Network Tree Data
        $treeData = [
            'root' => [
                'id' => $user->user_code ?? "ERN-{$user->id}",
                'name' => 'YOU',
                'code' => 'ID: ' . ($user->user_code ?? "ERN-{$user->id}"),
                'avatarUrl' => $user->avatar_url ?: '/avatars/rahat.jpg',
                'tier' => $user->tier_level,
                'isCurrentUser' => true,
                'level' => 0,
            ],
            'level1Members' => $directMembers->map(function ($m) {
                $subCount = User::where('referred_by_id', $m->id)->count();
                return [
                    'id' => $m->user_code ?? "ERN-{$m->id}",
                    'name' => $m->name,
                    'code' => 'ID: ' . ($m->user_code ?? "ERN-{$m->id}"),
                    'avatarUrl' => $m->avatar_url ?: '/avatars/tanvir.jpg',
                    'tier' => $m->tier_level,
                    'l2Count' => $subCount,
                    'level' => 1,
                ];
            })->values(),
            'level2Members' => $l2Members->map(function ($m) {
                $parent = User::find($m->referred_by_id);
                return [
                    'id' => $m->user_code ?? "ERN-{$m->id}",
                    'name' => $m->name,
                    'referredBy' => $parent ? explode(' ', $parent->name)[0] : 'Member',
                    'avatarUrl' => $m->avatar_url ?: '/avatars/sumaiya.jpg',
                    'tier' => $m->tier_level,
                    'level' => 2,
                ];
            })->values(),
            'networkHealth' => [
                'activeMembers' => $networkCount > 0 ? $networkCount : 1,
                'totalMembers' => $networkCount,
                'growthMtdPercent' => 15.4,
                'commissionTaka' => 4250,
            ],
        ];

        return response()->json([
            'stats' => [
                'directCount' => $directCount,
                'networkCount' => $networkCount,
                'totalEarnings' => 8200.0,
                'weeklyCommissions' => 1840.0,
                'referralCode' => $user->referral_code,
            ],
            'commissionLevels' => $commissionLevels,
            'activities' => $activities,
            'tree' => $treeData,
        ]);
    }

    /**
     * GET /api/tiers
     */
    public function getTiers(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        $tiers = MembershipTier::where('is_active', true)->orderBy('price', 'asc')->get();

        $formatted = $tiers->map(function ($tier) use ($user) {
            $isCurrent = strtolower($tier->name) === strtolower($user->tier_level);
            return [
                'id' => $tier->slug,
                'name' => $tier->name,
                'subtitle' => $tier->subtitle,
                'priceText' => $tier->price_text,
                'isCurrent' => $isCurrent,
                'isActive' => $isCurrent,
                'dailyTasksLimit' => $tier->daily_tasks_limit === -1 ? 'Unlimited' : $tier->daily_tasks_limit,
                'referralCommission' => "{$tier->referral_commission_rate}% Referral commission",
                'withdrawalFee' => "{$tier->withdrawal_fee_percent}%",
                'vipSupport' => (bool) $tier->vip_support,
                'instantPayouts' => (bool) $tier->instant_payouts,
                'buttonLabel' => $isCurrent ? 'Active Membership' : "Upgrade to {$tier->name}",
                'buttonVariant' => $isCurrent ? 'active' : 'upgrade',
            ];
        });

        return response()->json([
            'tiers' => $formatted,
            'currentTier' => $user->tier_level,
        ]);
    }

    /**
     * POST /api/tiers/{slug}/upgrade
     */
    public function upgradeTier(Request $request, string $slug): JsonResponse
    {
        $user = $this->resolveUser($request);
        $tier = MembershipTier::where('slug', $slug)->firstOrFail();

        if (strtolower($user->tier_level) === strtolower($tier->name)) {
            return response()->json(['message' => 'You are already on this tier.'], 400);
        }

        if ($tier->price > 0 && $user->available_balance < $tier->price) {
            return response()->json([
                'message' => "Insufficient balance. Tier upgrade costs ৳ {$tier->price}, your balance is ৳ {$user->available_balance}."
            ], 422);
        }

        DB::transaction(function () use ($user, $tier) {
            if ($tier->price > 0) {
                $user->debitBalance(
                    $tier->price,
                    "Tier Upgrade: {$tier->name}",
                    'bonus',
                    "Upgraded membership to {$tier->name}",
                    'tier_upgrade',
                    $tier->id
                );
            }

            $user->tier_id = $tier->id;
            $user->tier_level = $tier->name;
            $user->save();

            // Notify sponsor/referrer if exists
            if ($user->referred_by_id) {
                NetworkActivity::create([
                    'user_id' => $user->referred_by_id,
                    'actor_user_id' => $user->id,
                    'action' => "upgraded to {$tier->name}",
                    'amount' => round($tier->price * 0.10, 2),
                    'badge_type' => 'warning',
                ]);
            }
        });

        return response()->json([
            'message' => "Successfully upgraded to {$tier->name} tier!",
            'tier' => $tier->name,
            'availableBalance' => (float) $user->available_balance,
        ]);
    }

    /**
     * GET /api/wallet
     */
    public function getWallet(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $transactions = WalletTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => "tx-{$tx->id}",
                    'title' => $tx->title,
                    'subtitle' => $tx->subtitle ?? '',
                    'amount' => (float) $tx->amount,
                    'isPositive' => (bool) $tx->is_positive,
                    'timestamp' => $tx->created_at->diffForHumans(),
                    'type' => $tx->type,
                    'status' => $tx->status,
                ];
            });

        $payoutMethods = PayoutMethod::where('is_active', true)->get()->map(function ($m) {
            return [
                'id' => $m->type,
                'name' => $m->name,
                'accountDetail' => $m->account_detail ?? '',
                'type' => $m->type,
                'feePercent' => (float) $m->fee_percent,
                'processingTime' => $m->processing_time,
            ];
        });

        return response()->json([
            'availableBalance' => (float) $user->available_balance,
            'todayEarnings' => (float) $user->today_earnings,
            'pendingRewards' => (float) $user->pending_rewards,
            'lifetimeEarnings' => (float) $user->lifetime_earnings,
            'breakdown' => [
                'taskEarnings' => 4200.0,
                'directReferrals' => 1840.0,
                'networkBonus' => 5210.0,
                'otherRewards' => 1200.0,
            ],
            'transactions' => $transactions,
            'payoutMethods' => $payoutMethods,
        ]);
    }

    /**
     * POST /api/wallet/withdraw
     */
    public function submitWithdrawal(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'payout_method' => 'required|string', // bkash, nagad, bank
            'account_number' => 'required|string|min:6',
            'amount' => 'required|numeric|min:100',
        ]);

        $amount = (float) $validated['amount'];

        if ($user->available_balance < $amount) {
            return response()->json([
                'message' => 'Insufficient balance for withdrawal.',
            ], 422);
        }

        $method = PayoutMethod::where('type', $validated['payout_method'])->first();
        $feePercent = $method ? $method->fee_percent : 2.50;
        $fee = round(($amount * $feePercent) / 100, 2);
        $netAmount = $amount - $fee;

        $withdrawal = DB::transaction(function () use ($user, $method, $validated, $amount, $fee, $netAmount) {
            $user->debitBalance(
                $amount,
                "Withdrawal (" . strtoupper($validated['payout_method']) . ")",
                'withdrawal',
                'Processing...',
                'withdrawal_request'
            );

            return WithdrawalRequest::create([
                'user_id' => $user->id,
                'payout_method_id' => $method ? $method->id : null,
                'payout_type' => $validated['payout_method'],
                'account_number' => $validated['account_number'],
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $netAmount,
                'status' => 'pending',
                'admin_notes' => 'Submitted by user via app',
            ]);
        });

        return response()->json([
            'message' => 'Withdrawal request submitted successfully!',
            'withdrawal_id' => $withdrawal->id,
            'net_amount' => $netAmount,
            'fee' => $fee,
            'status' => 'pending',
            'remaining_balance' => (float) $user->available_balance,
        ]);
    }
}
