<?php

namespace App\Models;

use Database\Factories\ErrorLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Unwahas\ErrorRedirect\Models\ErrorLog as BaseErrorLog;

/**
 * @property-read User|null $user
 */
class ErrorLog extends BaseErrorLog
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
}
