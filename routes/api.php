<?php

use App\Http\Controllers\Api\ClientApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Money Machine Client API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // User Profile
    Route::get('/user/profile', [ClientApiController::class, 'getProfile']);

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
});

// Root API fallbacks for direct compatibility
Route::get('/user/profile', [ClientApiController::class, 'getProfile']);
Route::get('/tasks', [ClientApiController::class, 'getTasks']);
Route::post('/tasks/{task}/submit', [ClientApiController::class, 'submitTask']);
Route::get('/network', [ClientApiController::class, 'getNetwork']);
Route::get('/tiers', [ClientApiController::class, 'getTiers']);
Route::post('/tiers/{slug}/upgrade', [ClientApiController::class, 'upgradeTier']);
Route::get('/wallet', [ClientApiController::class, 'getWallet']);
Route::post('/wallet/withdraw', [ClientApiController::class, 'submitWithdrawal']);
