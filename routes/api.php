<?php

use App\Http\Controllers\Api\ClientApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Money Machine Client API Routes
|--------------------------------------------------------------------------
*/

// Auth & Onboarding Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [ClientApiController::class, 'register']);
    Route::post('/login', [ClientApiController::class, 'login']);
    Route::get('/validate-referral', [ClientApiController::class, 'validateReferral']);
});

Route::post('/register', [ClientApiController::class, 'register']);
Route::post('/login', [ClientApiController::class, 'login']);
Route::get('/validate-referral', [ClientApiController::class, 'validateReferral']);

Route::prefix('v1')->group(function () {
    // User Profile
    Route::get('/user/profile', [ClientApiController::class, 'getProfile']);
    Route::post('/user/profile', [ClientApiController::class, 'updateProfile']);
    Route::put('/user/profile', [ClientApiController::class, 'updateProfile']);
    Route::post('/user/avatar', [ClientApiController::class, 'uploadAvatar']);
    Route::post('/user/change-password', [ClientApiController::class, 'changePassword']);

    // Tasks Marketplace
    Route::get('/tasks', [ClientApiController::class, 'getTasks']);
    Route::post('/tasks/{task}/submit', [ClientApiController::class, 'submitTask']);

    // Referral & Network Tree
    Route::get('/network', [ClientApiController::class, 'getNetwork']);

    // Membership Tiers
    Route::get('/tiers', [ClientApiController::class, 'getTiers']);
    Route::post('/tiers/{slug}/upgrade', [ClientApiController::class, 'upgradeTier']);

    // Wallet & Transactions
    Route::get('/wallet', [ClientApiController::class, 'getWallet']);
    Route::post('/wallet/withdraw', [ClientApiController::class, 'submitWithdrawal']);
    Route::post('/wallet/deposit', [ClientApiController::class, 'submitDeposit']);
});

// Root API fallbacks
Route::get('/user/profile', [ClientApiController::class, 'getProfile']);
Route::post('/user/profile', [ClientApiController::class, 'updateProfile']);
Route::put('/user/profile', [ClientApiController::class, 'updateProfile']);
Route::post('/user/avatar', [ClientApiController::class, 'uploadAvatar']);
Route::post('/user/change-password', [ClientApiController::class, 'changePassword']);
Route::get('/tasks', [ClientApiController::class, 'getTasks']);
Route::post('/tasks/{task}/submit', [ClientApiController::class, 'submitTask']);
Route::get('/network', [ClientApiController::class, 'getNetwork']);
Route::get('/tiers', [ClientApiController::class, 'getTiers']);
Route::post('/tiers/{slug}/upgrade', [ClientApiController::class, 'upgradeTier']);
Route::get('/wallet', [ClientApiController::class, 'getWallet']);
Route::post('/wallet/withdraw', [ClientApiController::class, 'submitWithdrawal']);
Route::post('/wallet/deposit', [ClientApiController::class, 'submitDeposit']);

