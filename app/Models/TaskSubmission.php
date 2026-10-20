<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'reward_amount',
        'proof_text',
        'proof_image',
        'status',
        'reviewed_by',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'reward_amount' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
