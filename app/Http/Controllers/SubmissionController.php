<?php

namespace App\Http\Controllers;

use App\Models\NetworkActivity;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SubmissionController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');

        $submissions = TaskSubmission::when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->with(['user', 'task', 'reviewer'])
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return inertia('submissions/index', [
            'submissions' => $submissions,
            'currentStatus' => $status,
        ]);
    }

    public function approve(Request $request, TaskSubmission $submission)
    {
        if ($submission->status !== 'pending') {
            return redirect()->back()->withErrors(['status' => 'Submission already processed.']);
        }

        DB::transaction(function () use ($submission, $request) {
            $user = $submission->user;
            $reward = $submission->reward_amount;

            // Credit balance
            $user->creditBalance(
                $reward,
                "Task Reward: {$submission->task->title}",
                'task',
                "Approved by admin",
                'task_submission',
                $submission->id
            );

            // Deduct from pending rewards if applicable
            if ($user->pending_rewards >= $reward) {
                $user->pending_rewards -= $reward;
            } else {
                $user->pending_rewards = 0;
            }
            $user->save();

            // Mark submission approved
            $submission->status = 'approved';
            $submission->reviewed_by = Auth::id();
            $submission->admin_notes = $request->input('admin_notes', 'Task verified and approved.');
            $submission->save();

            // Multi-level referral commission distribution
            // L1 Sponsor Commission (12%)
            if ($user->referred_by_id) {
                $l1User = User::find($user->referred_by_id);
                if ($l1User && $l1User->is_active) {
                    $l1Commission = round($reward * 0.12, 2);
                    if ($l1Commission > 0) {
                        $l1User->creditBalance(
                            $l1Commission,
                            "Referral Commission (L1)",
                            'referral',
                            "From {$user->name}'s task",
                            'task_commission',
                            $submission->id
                        );

                        NetworkActivity::create([
                            'user_id' => $l1User->id,
                            'actor_user_id' => $user->id,
                            'action' => 'earned commission',
                            'amount' => $l1Commission,
                            'badge_type' => 'success',
                        ]);
                    }

                    // L2 Sponsor Commission (5%)
                    if ($l1User->referred_by_id) {
                        $l2User = User::find($l1User->referred_by_id);
                        if ($l2User && $l2User->is_active) {
                            $l2Commission = round($reward * 0.05, 2);
                            if ($l2Commission > 0) {
                                $l2User->creditBalance(
                                    $l2Commission,
                                    "Network Commission (L2)",
                                    'referral',
                                    "From {$user->name}'s task",
                                    'task_commission',
                                    $submission->id
                                );
                            }
                        }
                    }
                }
            }
        });

        return redirect()->back()->with('success', 'Task submission approved and reward credited!');
    }

    public function reject(Request $request, TaskSubmission $submission)
    {
        if ($submission->status !== 'pending') {
            return redirect()->back()->withErrors(['status' => 'Submission already processed.']);
        }

        $validated = $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        $user = $submission->user;
        if ($user->pending_rewards >= $submission->reward_amount) {
            $user->pending_rewards -= $submission->reward_amount;
            $user->save();
        }

        $submission->status = 'rejected';
        $submission->reviewed_by = Auth::id();
        $submission->admin_notes = $validated['admin_notes'];
        $submission->save();

        return redirect()->back()->with('success', 'Task submission rejected.');
    }
}
