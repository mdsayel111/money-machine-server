<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NetworkActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'actor_user_id',
        'action',
        'badge_text',
        'badge_type',
        'amount',
        'amount_prefix',
        'is_positive',
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

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
