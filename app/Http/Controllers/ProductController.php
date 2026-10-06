<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Models\ErrorLog;
use App\Models\Product;
use App\Support\ErrorLog as ErrorLogRecorder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'products' => Product::query()
                ->latest('id')
                ->paginate(8),
            'productCount' => Product::query()->count(),
            'errorCount' => ErrorLog::query()->count(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        if ($request->routeIs('products.store-error', 'products.store-increment')) {
            $deduplicate = $request->routeIs('products.store-increment');

            try {
                throw new RuntimeException('Simulated error created from the product demo.');
            } catch (RuntimeException $exception) {
                ErrorLogRecorder::record($exception, ['source' => 'product-demo'], deduplicate: $deduplicate);
            }

            Inertia::flash('toast', [
                'type' => $deduplicate ? 'success' : 'error',
                'message' => $deduplicate
                    ? 'Simulated error recorded with duplicate counting enabled.'
                    : 'A separate simulated error log was created.',
            ]);

            return to_route('products.index');
        }

        Product::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product created successfully.',
        ]);

        return to_route('products.index');
    }

    public function store_old(StoreProductRequest $request): RedirectResponse
    {
        if ($request->routeIs('products.store-error', 'products.store-increment')) {
            $deduplicate = $request->routeIs('products.store-increment');

            try {
                throw new RuntimeException('Simulated error created from the product demo.');
            } catch (RuntimeException $exception) {
                ErrorLogRecorder::record($exception, ['source' => 'product-demo'], deduplicate: $deduplicate);
            }

            Inertia::flash('toast', [
                'type' => $deduplicate ? 'success' : 'error',
                'message' => $deduplicate
                    ? 'Simulated error recorded with duplicate counting enabled.'
                    : 'A separate simulated error log was created.',
            ]);

            return to_route('products.index');
        }

        Product::query()->create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product created successfully.',
        ]);

        return to_route('products.index');
    }
}
