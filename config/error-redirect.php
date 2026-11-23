<?php

return [
    'table' => env('ERROR_REDIRECT_TABLE', 'error_logs'),
    'deduplicate' => env('ERROR_REDIRECT_DEDUPLICATE', true),
    'report_exceptions' => env('ERROR_REDIRECT_REPORT_EXCEPTIONS', false),

    'api' => [
        'enabled' => env('ERROR_REDIRECT_API_ENABLED', true),
        'prefix' => env('ERROR_REDIRECT_API_PREFIX', 'api/error-logs'),
        'middleware' => ['api', 'throttle:60,1', Unwahas\ErrorRedirect\Http\Middleware\VerifyApiKey::class],
        'key' => env('ERROR_REDIRECT_API_KEY'),
        'key_header' => env('ERROR_REDIRECT_API_KEY_HEADER', 'X-Error-Log-Key'),
        'per_page' => 5,
        'max_per_page' => 100,
    ],

    'firebase' => [
        'enabled' => env('ERROR_REDIRECT_FIREBASE_ENABLED', false),
        'credentials' => env('ERROR_REDIRECT_FIREBASE_CREDENTIALS'),
        'project_id' => env('ERROR_REDIRECT_FIREBASE_PROJECT_ID') ?: env('FIREBASE_WEB_PROJECT_ID'),
        'topic' => env('ERROR_REDIRECT_FIREBASE_TOPIC', 'error-logs'),
        'token' => env('ERROR_REDIRECT_FIREBASE_TOKEN'),
        'timeout' => (int) env('ERROR_REDIRECT_FIREBASE_TIMEOUT', 5),
        'token_uri' => env('ERROR_REDIRECT_FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
        'endpoint' => env('ERROR_REDIRECT_FIREBASE_ENDPOINT', 'https://fcm.googleapis.com/v1/projects/{project_id}/messages:send'),
        'web' => [
            'api_key' => env('FIREBASE_WEB_API_KEY'),
            'auth_domain' => env('FIREBASE_WEB_AUTH_DOMAIN'),
            'project_id' => env('FIREBASE_WEB_PROJECT_ID'),
            'storage_bucket' => env('FIREBASE_WEB_STORAGE_BUCKET'),
            'messaging_sender_id' => env('FIREBASE_WEB_MESSAGING_SENDER_ID'),
            'app_id' => env('FIREBASE_WEB_APP_ID'),
            'measurement_id' => env('FIREBASE_WEB_MEASUREMENT_ID'),
        ],
    ],
];
