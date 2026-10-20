<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'platform',
        'category',
        'tags',
        'reward',
        'reward_suffix',
        'time_estimate',
        'remaining_slots',
        'limit_notice',
        'description',
        'action_url',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'reward' => 'float',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TaskSubmission::class);
    }
}
