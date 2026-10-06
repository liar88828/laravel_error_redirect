<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Throwable;

class ErrorLog
{
    /**
     * @param  array<string, mixed>  $context
     */
    public static function record(Throwable $e, array $context = [], bool $deduplicate = true): void
    {
        try {
            if ($deduplicate) {
                $existingError = DB::table('error_logs')
                    ->where('class', $e::class)
                    ->where('file', $e->getFile())
                    ->where('line', $e->getLine())
                    ->latest('id')
                    ->first(['id']);

                if ($existingError !== null) {
                    DB::table('error_logs')
                        ->where('id', $existingError->id)
                        ->increment('count', 1, ['updated_at' => now()]);

                    return;
                }
            }

            $req = app()->runningInConsole() ? null : request();

            DB::table('error_logs')->insert([
                'app' => config('app.name'),
                'class' => $e::class,
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'context' => $context ? json_encode($context) : null,
                'count' => 1,
                'url' => $req?->fullUrl(),
                'method' => $req?->method(),
                'user_id' => auth()->id(),
                'ip' => $req?->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (Throwable) {
        }
    }

    /**
     * Log a custom message without an exception.
     *
     * @param  array<string, mixed>  $context
     */
    public static function message(string $msg, array $context = []): void
    {
        self::record(new \RuntimeException($msg), $context);
    }
}
