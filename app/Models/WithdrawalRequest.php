<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payout_method_id',
        'payout_type',
        'account_number',
        'amount',
        'fee',
        'net_amount',
        'status',
        'transaction_reference',
        'processed_by',
        'admin_notes',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'fee' => 'float',
            'net_amount' => 'float',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payoutMethod(): BelongsTo
    {
        return $this->belongsTo(PayoutMethod::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
