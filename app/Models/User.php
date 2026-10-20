<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $phone
 * @property string|null $avatar_url
 * @property string $password
 * @property string $role
 * @property string|null $user_code
 * @property int|null $tier_id
 * @property string $tier_level
 * @property float $available_balance
 * @property float $today_earnings
 * @property float $pending_rewards
 * @property float $lifetime_earnings
 * @property int $level
 * @property int $level_progress
 * @property string|null $referral_code
 * @property int|null $referred_by_id
 * @property int $tasks_completed_count
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'user_code',
        'phone',
        'avatar_url',
        'tier_id',
        'tier_level',
        'available_balance',
        'today_earnings',
        'pending_rewards',
        'lifetime_earnings',
        'level',
        'level_progress',
        'referral_code',
        'referred_by_id',
        'tasks_completed_count',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'available_balance' => 'float',
            'today_earnings' => 'float',
            'pending_rewards' => 'float',
            'lifetime_earnings' => 'float',
            'level' => 'integer',
            'level_progress' => 'integer',
            'tasks_completed_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super-admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super-admin';
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(MembershipTier::class, 'tier_id');
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by_id');
    }

    public function directReferrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class)->orderBy('id', 'desc');
    }

    public function taskSubmissions(): HasMany
    {
        return $this->hasMany(TaskSubmission::class)->orderBy('id', 'desc');
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class)->orderBy('id', 'desc');
    }

    public function networkActivities(): HasMany
    {
        return $this->hasMany(NetworkActivity::class)->orderBy('id', 'desc');
    }

    /**
     * Credit funds to user wallet and record transaction
     */
    public function creditBalance(float $amount, string $title, string $type = 'task', ?string $subtitle = null, ?string $refType = null, ?int $refId = null): WalletTransaction
    {
        $this->available_balance += $amount;
        $this->lifetime_earnings += $amount;
        $this->today_earnings += $amount;
        $this->save();

        return $this->transactions()->create([
            'title' => $title,
            'subtitle' => $subtitle,
            'amount' => $amount,
            'is_positive' => true,
            'type' => $type,
            'status' => 'completed',
            'reference_type' => $refType,
            'reference_id' => $refId,
        ]);
    }

    /**
     * Debit funds from user wallet (e.g. for withdrawal or tier upgrade)
     */
    public function debitBalance(float $amount, string $title, string $type = 'withdrawal', ?string $subtitle = null, ?string $refType = null, ?int $refId = null): WalletTransaction
    {
        if ($this->available_balance < $amount) {
            throw new \RuntimeException('Insufficient balance.');
        }

        $this->available_balance -= $amount;
        $this->save();

        return $this->transactions()->create([
            'title' => $title,
            'subtitle' => $subtitle,
            'amount' => $amount,
            'is_positive' => false,
            'type' => $type,
            'status' => 'completed',
            'reference_type' => $refType,
            'reference_id' => $refId,
        ]);
    }
}
