<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayoutMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'account_detail',
        'fee_percent',
        'processing_time',
        'icon_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'fee_percent' => 'float',
            'is_active' => 'boolean',
        ];
    }

    public function withdrawalRequests(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }
}
