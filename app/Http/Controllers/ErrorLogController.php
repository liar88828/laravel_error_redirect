<?php

namespace App\Http\Controllers;

use App\Models\ErrorLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Unwahas\ErrorRedirect\Support\ErrorLog as ErrorLogRecorder;

class ErrorLogController extends Controller
{
    public function resolve(ErrorLog $errorLog): RedirectResponse
    {
        ErrorLog::query()
            ->whereKey($errorLog->id)
            ->update(['resolved_at' => $errorLog->resolved_at === null ? now() : null]);

        return back();
    }

    public function destroy(ErrorLog $errorLog): RedirectResponse
    {
        $errorLog->delete();

        return back();
    }

    public function index(): Response
    {
        return Inertia::render('error-logs/index', [
            'errorLogs' => ErrorLog::query()
                ->select([
                    'id',
                    'app',
                    'class',
                    'message',
                    'file',
                    'line',
                    'url',
                    'method',
                    'user_id',
                    'ip',
                    'count',
                    'resolved_at',
                    'created_at',
                ])
                ->with('user:id,name')
                ->latest('id')
                ->paginate(5),
        ]);
    }

    public function show(ErrorLog $errorLog): Response
    {
        return Inertia::render('error-logs/show', [
            'errorLog' => $errorLog->load('user:id,name'),
        ]);
    }

    public function simulate(Request $request): RedirectResponse
    {
        $deduplicate = $request->boolean('deduplicate');

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
}
