<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyErrorLogApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = config('services.error_log_key');

        abort_unless(
            is_string($apiKey)
                && $apiKey !== ''
                && hash_equals($apiKey, (string) $request->header('X-Api-Key')),
            401,
        );

        return $next($request);
    }
}
