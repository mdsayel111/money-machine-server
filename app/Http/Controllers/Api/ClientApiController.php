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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientApiController extends Controller
{
    /**
     * Resolve active user dynamically from headers, query, or fallback demo
     */
    protected function resolveUser(Request $request): User
    {
        if ($request->user()) {
            return $request->user();
        }

        // Support X-User-Id, Bearer token, or query param
        $userId = $request->header('X-User-Id')
            ?? $request->header('Authorization')
            ?? $request->query('user_id');

        if ($userId) {
            // Clean "Bearer " if passed in Authorization header
            $cleanId = trim(str_ireplace('Bearer', '', $userId));
            $found = User::where('id', $cleanId)
                ->orWhere('user_code', $cleanId)
                ->orWhere('email', $cleanId)
                ->first();

            if ($found) {
                return $found;
            }
        }

        // Fallback demo user
        return User::where('user_code', 'ERN-1024')
            ->orWhere('email', 'rahat.chowdhury@email.com')
            ->first() ?? User::where('role', 'user')->first();
    }

    /**
     * POST /api/auth/register
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'referral_code' => 'nullable|string|max:50',
        ]);

        $sponsor = null;

        // If referral code is provided, look up the sponsor
        if (!empty($validated['referral_code'])) {
            $code = trim(strtoupper($validated['referral_code']));
            $sponsor = User::whereRaw('UPPER(referral_code) = ?', [$code])
                ->orWhereRaw('UPPER(user_code) = ?', [$code])
                ->first();

            if (!$sponsor) {
                return response()->json([
                    'message' => 'The referral code entered is invalid. Please double check or leave it empty.',
                    'errors' => ['referral_code' => ['Invalid referral code.']]
                ], 422);
            }
        }

        // Get default Silver tier
        $silverTier = MembershipTier::where('slug', 'silver')->first()
            ?? MembershipTier::first();

        // Generate unique user_code and referral_code
        $nextId = (User::max('id') ?? 1000) + 1;
        $userCode = 'ERN-' . $nextId;
        $newUserRefCode = 'EARN-' . strtoupper(Str::random(3)) . '-BD';

        // Welcome bonus for new sign up
        $welcomeBonus = 50.00;

        $user = DB::transaction(function () use ($validated, $sponsor, $silverTier, $userCode, $newUserRefCode, $welcomeBonus) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => 'user',
                'user_code' => $userCode,
                'tier_id' => $silverTier ? $silverTier->id : null,
                'tier_level' => $silverTier ? $silverTier->name : 'Silver',
                'available_balance' => $welcomeBonus,
                'today_earnings' => $welcomeBonus,
                'pending_rewards' => 0.00,
                'lifetime_earnings' => $welcomeBonus,
                'level' => 1,
                'level_progress' => 10,
                'referral_code' => $newUserRefCode,
                'referred_by_id' => $sponsor ? $sponsor->id : null,
                'tasks_completed_count' => 0,
                'avatar_url' => '/avatars/rahat.jpg',
                'is_active' => true,
            ]);

            // Record welcome bonus transaction
            $user->transactions()->create([
                'title' => 'Welcome Signup Bonus',
                'subtitle' => 'Granted upon account registration',
                'amount' => $welcomeBonus,
                'is_positive' => true,
                'type' => 'bonus',
                'status' => 'completed',
            ]);

            // If joined via sponsor referral code, record network activity and reward sponsor
            if ($sponsor) {
                // Activity notification for sponsor
                NetworkActivity::create([
                    'user_id' => $sponsor->id,
                    'actor_user_id' => $user->id,
                    'action' => 'joined your L1 network',
                    'badge_text' => 'NEW',
                    'badge_type' => 'new',
                    'amount' => 25.00,
                    'amount_prefix' => '+ ',
                    'is_positive' => true,
                ]);

                // Credit sponsor referral signup reward
                $sponsor->creditBalance(
                    25.00,
                    "Referral Bonus",
                    "referral",
                    "New direct member {$user->name} joined via your referral code ({$sponsor->referral_code})",
                    "referral_signup",
                    $user->id
                );
            }

            return $user;
        });

        return response()->json([
            'message' => 'Registration successful! ৳ 50.00 welcome bonus credited to your wallet.',
            'user' => [
                'id' => $user->user_code,
                'numeric_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'tier' => $user->tier_level,
                'availableBalance' => (float) $user->available_balance,
                'referralCode' => $user->referral_code,
                'referredBy' => $sponsor ? $sponsor->name : null,
            ],
            'token' => (string) $user->user_code,
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = trim($validated['email']);
        $user = User::where('email', $identifier)
            ->orWhere('user_code', $identifier)
            ->orWhere('phone', $identifier)
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email/phone or password.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is suspended. Please contact customer support.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful!',
            'user' => [
                'id' => $user->user_code ?? "ERN-{$user->id}",
                'numeric_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'tier' => $user->tier_level,
                'availableBalance' => (float) $user->available_balance,
                'referralCode' => $user->referral_code,
            ],
            'token' => (string) ($user->user_code ?? "ERN-{$user->id}"),
        ]);
    }

    /**
     * GET /api/auth/validate-referral
     */
    public function validateReferral(Request $request): JsonResponse
    {
        $code = trim(strtoupper($request->query('code', '')));
        if (!$code) {
            return response()->json(['valid' => false, 'message' => 'Code cannot be empty.']);
        }

        $sponsor = User::whereRaw('UPPER(referral_code) = ?', [$code])
            ->orWhereRaw('UPPER(user_code) = ?', [$code])
            ->first();

        if (!$sponsor) {
            return response()->json([
                'valid' => false,
                'message' => 'Referral code not found.',
            ]);
        }

        return response()->json([
            'valid' => true,
            'sponsor_name' => $sponsor->name,
            'sponsor_tier' => $sponsor->tier_level,
            'message' => "Valid referral! You will join {$sponsor->name}'s network.",
        ]);
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
            'phone' => $user->phone ?? '',
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
            'referralCode' => $user->referral_code ?? 'EARN-99X-BD',
            'tasksCompletedCount' => $user->tasks_completed_count,
            'invitedCount' => $totalNetworkCount,
        ]);
    }

    /**
     * POST|PUT /api/user/profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:30',
            'avatar_url' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'avatar_base64' => 'nullable|string',
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6',
        ]);

        $user->name = $validated['name'];
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        // Handle uploaded image file
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/avatars');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            $user->avatar_url = url('uploads/avatars/' . $filename);
        } elseif (!empty($validated['avatar_base64']) && str_starts_with($validated['avatar_base64'], 'data:image')) {
            // Handle base64 image data
            $base64Image = $validated['avatar_base64'];
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $raw = substr($base64Image, strpos($base64Image, ',') + 1);
                $ext = strtolower($type[1]);
                $binary = base64_decode($raw);
                if ($binary !== false) {
                    $filename = 'avatar_' . $user->id . '_' . time() . '.' . $ext;
                    $destinationPath = public_path('uploads/avatars');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $binary);
                    $user->avatar_url = url('uploads/avatars/' . $filename);
                }
            }
        } elseif (!empty($validated['avatar_url'])) {
            $user->avatar_url = $validated['avatar_url'];
        }

        if (!empty($validated['new_password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password does not match.',
                    'errors' => ['current_password' => ['Incorrect current password.']],
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->save();

        $directCount = User::where('referred_by_id', $user->id)->count();
        $directIds = User::where('referred_by_id', $user->id)->pluck('id');
        $l2Count = User::whereIn('referred_by_id', $directIds)->count();
        $totalNetworkCount = $directCount + $l2Count;

        return response()->json([
            'message' => 'Profile updated successfully!',
            'user' => [
                'id' => $user->user_code ?? "ERN-{$user->id}",
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
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
                'referralCode' => $user->referral_code ?? 'EARN-99X-BD',
                'tasksCompletedCount' => $user->tasks_completed_count,
                'invitedCount' => $totalNetworkCount,
            ],
        ]);
    }

    /**
     * POST /api/user/avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        $file = $request->file('avatar');
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $destinationPath = public_path('uploads/avatars');
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }
        $file->move($destinationPath, $filename);
        $avatarUrl = url('uploads/avatars/' . $filename);

        $user->avatar_url = $avatarUrl;
        $user->save();

        return response()->json([
            'message' => 'Profile picture uploaded successfully!',
            'avatar_url' => $avatarUrl,
        ]);
    }

    /**
     * POST /api/user/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'The current password you entered is incorrect.',
                'errors' => ['current_password' => ['Incorrect current password.']],
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Your password has been changed successfully! Please keep it safe.',
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

        // If user was referred by sponsor, record real-time activity for sponsor
        if ($user->referred_by_id) {
            $commEst = round($task->reward * 0.12, 2);
            NetworkActivity::create([
                'user_id' => $user->referred_by_id,
                'actor_user_id' => $user->id,
                'action' => "completed task: {$task->title}",
                'badge_text' => 'COMMISSION',
                'badge_type' => 'success',
                'amount' => $commEst > 0 ? $commEst : null,
                'amount_prefix' => '+ ',
                'is_positive' => true,
            ]);
        }

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

        // Recent network activities (Dynamic real-time query)
        $dbActivities = NetworkActivity::where('user_id', $user->id)
            ->with('actor')
            ->orderBy('created_at', 'desc')
            ->take(25)
            ->get();

        if ($dbActivities->isNotEmpty()) {
            $activities = $dbActivities->map(function ($act) {
                return [
                    'id' => "act-{$act->id}",
                    'userName' => $act->actor ? $act->actor->name : 'Network Member',
                    'userAvatar' => $act->actor ? ($act->actor->avatar_url ?: '/avatars/tanvir.jpg') : '/avatars/tanvir.jpg',
                    'action' => $act->action,
                    'timeAgo' => $act->created_at->diffForHumans(),
                    'timestamp' => $act->created_at->toISOString(),
                    'badgeText' => $act->badge_text,
                    'badgeType' => $act->badge_type,
                    'amount' => $act->amount ? (float) $act->amount : null,
                    'amountPrefix' => $act->amount_prefix,
                    'isPositive' => (bool) $act->is_positive,
                ];
            });
        } elseif ($directMembers->isNotEmpty()) {
            $avatars = ['/avatars/tanvir.jpg', '/avatars/sumaiya.jpg', '/avatars/kamal.jpg', '/avatars/nusrat.jpg'];
            $activities = $directMembers->take(6)->values()->map(function ($member, $idx) use ($avatars) {
                return [
                    'id' => "act-live-{$member->id}",
                    'userName' => $member->name,
                    'userAvatar' => $member->avatar_url ?: $avatars[$idx % count($avatars)],
                    'action' => 'joined your L1 referral network',
                    'timeAgo' => $member->created_at ? $member->created_at->diffForHumans() : 'Recently',
                    'timestamp' => $member->created_at ? $member->created_at->toISOString() : now()->toISOString(),
                    'badgeText' => 'L1 DIRECT',
                    'badgeType' => 'new',
                    'amount' => 25.00,
                    'amountPrefix' => '+ ',
                    'isPositive' => true,
                ];
            });
        } else {
            $activities = collect([]);
        }

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
                'totalEarnings' => (float) WalletTransaction::where('user_id', $user->id)->where('type', 'referral')->sum('amount'),
                'weeklyCommissions' => (float) WalletTransaction::where('user_id', $user->id)->where('type', 'referral')->where('created_at', '>=', now()->subDays(7))->sum('amount') ?: 1840.0,
                'referralCode' => $user->referral_code ?? 'EARN-99X-BD',
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
        $filterType = $request->query('type'); // 'all', 'task', 'referral', 'bonus', 'withdrawal', 'deposit', or 'earnings'
        $search = $request->query('search');

        $query = WalletTransaction::where('user_id', $user->id);

        if ($filterType === 'earnings') {
            $query->whereIn('type', ['task', 'referral', 'bonus', 'deposit'])->where('is_positive', true);
        } elseif ($filterType === 'withdrawals') {
            $query->where('type', 'withdrawal');
        } elseif ($filterType && $filterType !== 'all') {
            $query->where('type', $filterType);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')
            ->take(100)
            ->get()
            ->map(function ($tx) {
                return [
                    'id' => "tx-{$tx->id}",
                    'title' => $tx->title,
                    'subtitle' => $tx->subtitle ?? ucfirst($tx->type),
                    'amount' => (float) $tx->amount,
                    'isPositive' => (bool) $tx->is_positive,
                    'timestamp' => $tx->created_at->diffForHumans(),
                    'dateFormatted' => $tx->created_at->format('M d, Y • h:i A'),
                    'date' => $tx->created_at->format('M d, Y'),
                    'time' => $tx->created_at->format('h:i A'),
                    'type' => $tx->type,
                    'status' => $tx->status ?? 'completed',
                    'referenceType' => $tx->reference_type,
                    'referenceId' => $tx->reference_id,
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

        // Dynamic breakdown sums from ledger
        $taskSum = (float) WalletTransaction::where('user_id', $user->id)->where('type', 'task')->where('is_positive', true)->sum('amount');
        $referralSum = (float) WalletTransaction::where('user_id', $user->id)->where('type', 'referral')->sum('amount');
        $bonusSum = (float) WalletTransaction::where('user_id', $user->id)->where('type', 'bonus')->sum('amount');
        $depositSum = (float) WalletTransaction::where('user_id', $user->id)->where('type', 'deposit')->sum('amount');
        $withdrawalSum = (float) WithdrawalRequest::where('user_id', $user->id)->where('status', 'completed')->sum('amount');

        $isDemoSponsor = $user->user_code === 'ERN-1024';

        // Recent withdrawal requests
        $withdrawalRequests = WithdrawalRequest::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get()
            ->map(function ($w) {
                return [
                    'id' => "w-{$w->id}",
                    'method' => strtoupper($w->payout_type),
                    'accountNumber' => $w->account_number,
                    'amount' => (float) $w->amount,
                    'fee' => (float) $w->fee,
                    'netAmount' => (float) $w->net_amount,
                    'status' => $w->status,
                    'reference' => $w->transaction_reference,
                    'date' => $w->created_at->diffForHumans(),
                    'dateTime' => $w->created_at->format('M d, Y • h:i A'),
                ];
            });

        return response()->json([
            'availableBalance' => (float) $user->available_balance,
            'todayEarnings' => (float) $user->today_earnings,
            'pendingRewards' => (float) $user->pending_rewards,
            'lifetimeEarnings' => (float) $user->lifetime_earnings,
            'breakdown' => [
                'taskEarnings' => $taskSum > 0 ? $taskSum : ($isDemoSponsor ? 4200.0 : 0.0),
                'directReferrals' => $referralSum > 0 ? $referralSum : ($isDemoSponsor ? 1840.0 : 0.0),
                'networkBonus' => $bonusSum > 0 ? $bonusSum : ($isDemoSponsor ? 5210.0 : 0.0),
                'depositSum' => $depositSum,
                'otherRewards' => $isDemoSponsor ? 1200.0 : 0.0,
                'totalWithdrawn' => $withdrawalSum,
            ],
            'transactions' => $transactions,
            'withdrawalRequests' => $withdrawalRequests,
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

    /**
     * POST /api/wallet/deposit
     */
    public function submitDeposit(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);

        $validated = $request->validate([
            'method' => 'required|string', // bkash, nagad, rocket, bank
            'account_number' => 'required|string|min:6',
            'amount' => 'required|numeric|min:50',
            'transaction_id' => 'required|string|min:4',
        ]);

        $amount = (float) $validated['amount'];
        $trxId = strtoupper(trim($validated['transaction_id']));
        $method = strtoupper($validated['method']);

        $tx = DB::transaction(function () use ($user, $validated, $amount, $trxId, $method) {
            return $user->creditBalance(
                $amount,
                "Deposit via {$method}",
                'deposit',
                "TrxID: {$trxId} • From: {$validated['account_number']}",
                'deposit_payment',
                null
            );
        });

        return response()->json([
            'message' => "Deposit of ৳ {$amount} via {$method} credited successfully!",
            'transaction_id' => "tx-{$tx->id}",
            'new_balance' => (float) $user->available_balance,
            'amount' => $amount,
        ]);
    }
}
