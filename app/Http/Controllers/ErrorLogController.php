<?php

namespace App\Http\Controllers;

use App\Models\ErrorLog;
use App\Support\ErrorLog as ErrorLogRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class ErrorLogController extends Controller
{
    private function requestedAppName(Request $request): ?string
    {
        $appName = $request->header('X-App-Name') ?? $request->query('app');

        return is_string($appName) && trim($appName) !== '' ? trim($appName) : null;
    }

    public function indexApi(Request $request): JsonResponse
    {
        $appName = $this->requestedAppName($request);

        return response()->json(
            DB::table('error_logs')
                ->when($appName !== null, fn ($query) => $query->where('app', $appName))
                ->select('id', 'app', 'class', 'message', 'file', 'line', 'url', 'method', 'count', 'resolved_at', 'created_at')
                ->orderByDesc('id')
                ->paginate(5),
        );
    }

    public function newSince(Request $request): JsonResponse
    {
        $appName = $this->requestedAppName($request);

        return response()->json(
            DB::table('error_logs')
                ->when($appName !== null, fn ($query) => $query->where('app', $appName))
                ->where('id', '>', $request->integer('after_id'))
                ->orderBy('id')
                ->limit(20)
                ->get(['id', 'app', 'class', 'message', 'count', 'resolved_at', 'created_at']),
        );
    }

    public function latestId(Request $request): JsonResponse
    {
        $appName = $this->requestedAppName($request);

        return response()->json([
            'id' => (int) DB::table('error_logs')
                ->when($appName !== null, fn ($query) => $query->where('app', $appName))
                ->max('id'),
        ]);
    }

    public function showApi(int $id): JsonResponse
    {
        return response()->json(
            DB::table('error_logs')->find($id) ?? abort(404),
        );
    }

    public function resolve(ErrorLog $errorLog): RedirectResponse
    {
        $this->setResolvedState($errorLog, $errorLog->resolved_at === null);

        return back();
    }

    public function resolveApi(int $id): JsonResponse
    {
        $errorLog = ErrorLog::query()->findOrFail($id);

        return response()->json($this->setResolvedState($errorLog, $errorLog->resolved_at === null));
    }

    private function setResolvedState(ErrorLog $errorLog, bool $resolved): ErrorLog
    {
        ErrorLog::query()
            ->whereKey($errorLog->id)
            ->update(['resolved_at' => $resolved ? now() : null]);

        return $errorLog->refresh();
    }

    public function destroyApi(int $id): HttpResponse
    {
        $this->deleteErrorLog(ErrorLog::query()->findOrFail($id));

        return response()->noContent();
    }

    public function destroy(ErrorLog $errorLog): RedirectResponse
    {
        $this->deleteErrorLog($errorLog);

        return back();
    }

    private function deleteErrorLog(ErrorLog $errorLog): void
    {
        $errorLog->delete();
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

    public function notificationCount(Request $request): JsonResponse
    {
        $appName = $this->requestedAppName($request);
        $query = ErrorLog::query()
            ->when($appName !== null, fn ($q) => $q->where('app', $appName))
            ->whereNull('resolved_at');

        $count = (clone $query)->count();
        $latest = $query->latest('id')->first();

        return response()->json([
            'count' => $count,
            'latest' => $latest?->only(['id', 'class', 'app', 'message']),
        ]);
    }
}
