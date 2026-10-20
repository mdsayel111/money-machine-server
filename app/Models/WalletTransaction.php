<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'subtitle',
        'amount',
        'is_positive',
        'type',
        'status',
        'reference_type',
        'reference_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'is_positive' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
