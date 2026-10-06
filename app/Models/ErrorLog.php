<?php

namespace App\Models;

use Database\Factories\ErrorLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $app
 * @property string $class
 * @property string $message
 * @property string $file
 * @property int $line
 * @property string $trace
 * @property string|null $url
 * @property string|null $method
 * @property int|null $user_id
 * @property string|null $ip
 * @property int $count
 * @property array<string, mixed>|null $context
 * @property Carbon|null $resolved_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'app',
    'class',
    'message',
    'file',
    'line',
    'trace',
    'url',
    'method',
    'user_id',
    'ip',
    'count',
    'context',
])]
class ErrorLog extends Model
{
    /** @use HasFactory<ErrorLogFactory> */
    use HasFactory;

    /**
     * Get the user associated with the error log, if any.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'line' => 'integer',
            'user_id' => 'integer',
            'count' => 'integer',
            'context' => 'array',
            'resolved_at' => 'datetime',
        ];
    }
}
