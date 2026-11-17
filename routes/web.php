<?php

use App\Http\Controllers\ErrorLogController;
use App\Http\Controllers\FirebaseTestController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth',
    // 'verified'
])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});
Route::get('/boom', fn () => throw new Exception('test error'));

Route::middleware(['auth',
    // 'verified'
])->group(function () {
    Route::inertia('api-simulator', 'api-simulator')->name('api-simulator');
    Route::get('products', [ProductController::class, 'index'])->name('products.index');
    Route::post('products', [ProductController::class, 'store'])->name('products.store');
    Route::post('products-error', [ProductController::class, 'store'])->name('products.store-error');
    Route::post('products-error-increment', [ProductController::class, 'store'])->name('products.store-increment');

    Route::get('error-logs', [ErrorLogController::class, 'index'])->name('error-logs.index');
    Route::get('error-logs/{errorLog}', [ErrorLogController::class, 'show'])->name('error-logs.show');
    Route::patch('error-logs/{errorLog}/resolve', [ErrorLogController::class, 'resolve'])->name('error-logs.resolve');
    Route::delete('error-logs/{errorLog}', [ErrorLogController::class, 'destroy'])->name('error-logs.destroy');
    Route::post('error-logs/simulate', [ErrorLogController::class, 'simulate'])->name('error-logs.simulate');

    Route::get('firebase-test', [FirebaseTestController::class, 'index'])->name('firebase-test.index');
    Route::get('firebase-test/status', [FirebaseTestController::class, 'status'])->name('firebase-test.status');
    Route::post('firebase-test/send', [FirebaseTestController::class, 'send'])->name('firebase-test.send');
});

require __DIR__.'/settings.php';
