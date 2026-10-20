<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SubmissionController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TierController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WithdrawalController;
use Illuminate\Support\Facades\Route;

// Guest Auth Routes
Route::get('login', [AuthController::class, 'showLogin'])->name('login');
Route::post('login', [AuthController::class, 'login'])->name('login.store');

// Authenticated Admin Protected Routes
Route::middleware(['auth'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/', function () {
        return redirect()->route('dashboard');
    });

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users & Referral Tree
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');

    // Tasks Management
    Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::patch('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // Task Submissions Review & Commission Payouts
    Route::get('submissions', [SubmissionController::class, 'index'])->name('submissions.index');
    Route::post('submissions/{submission}/approve', [SubmissionController::class, 'approve'])->name('submissions.approve');
    Route::post('submissions/{submission}/reject', [SubmissionController::class, 'reject'])->name('submissions.reject');

    // Withdrawal Requests Review & Payout
    Route::get('withdrawals', [WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('withdrawals/{withdrawal}/complete', [WithdrawalController::class, 'complete'])->name('withdrawals.complete');
    Route::post('withdrawals/{withdrawal}/reject', [WithdrawalController::class, 'reject'])->name('withdrawals.reject');

    // Membership Tiers Configuration
    Route::get('tiers', [TierController::class, 'index'])->name('tiers.index');
    Route::get('tiers/{tier}', [TierController::class, 'show'])->name('tiers.show');
    Route::patch('tiers/{tier}', [TierController::class, 'update'])->name('tiers.update');

    // Financial Audit Transactions Ledger
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions.index');
});
