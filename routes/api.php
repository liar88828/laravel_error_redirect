<?php

use App\Http\Controllers\ErrorLogController;
use App\Http\Controllers\FirebaseTestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
// routes/api.php
Route::get('/ping', function (Request $request) {
    return 'pong';
});

Route::middleware([
    'throttle:60,1',
])->prefix('error-logs')->name('api.error-logs.')->group(function () {
    Route::get('/', [ErrorLogController::class, 'indexApi'])->name('index');
    Route::get('/new', [ErrorLogController::class, 'newSince'])->name('new');
    Route::get('/latest-id', [ErrorLogController::class, 'latestId'])->name('latest-id');
    Route::get('/notifications/count', [ErrorLogController::class, 'notificationCount'])->name('notifications.count');
    Route::get('/firebase/status', [FirebaseTestController::class, 'status'])->name('firebase.status');
    Route::post('/firebase/test', [FirebaseTestController::class, 'send'])->name('firebase.test');
    Route::get('/{id}', [ErrorLogController::class, 'showApi'])->whereNumber('id')->name('show');
    Route::patch('/{id}/resolve', [ErrorLogController::class, 'resolveApi'])->whereNumber('id')->name('resolve');
    Route::delete('/{id}', [ErrorLogController::class, 'destroyApi'])->whereNumber('id')->name('destroy');
});
