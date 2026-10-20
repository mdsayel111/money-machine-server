<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipTier extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'subtitle',
        'price',
        'price_text',
        'daily_tasks_limit',
        'referral_commission_rate',
        'withdrawal_fee_percent',
        'vip_support',
        'instant_payouts',
        'badge_bg',
        'badge_text_color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'daily_tasks_limit' => 'integer',
            'referral_commission_rate' => 'float',
            'withdrawal_fee_percent' => 'float',
            'vip_support' => 'boolean',
            'instant_payouts' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tier_id');
    }
}
