<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Unwahas\ErrorRedirect\Support\FirebaseNotifier;

class FirebaseTestController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('firebase-test', [
            'initialStatus' => FirebaseNotifier::status(),
        ]);
    }

    public function status(): JsonResponse
    {
        return response()->json(FirebaseNotifier::status());
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['nullable', 'string'],
            'topic' => ['nullable', 'string'],
            'title' => ['nullable', 'string', 'max:200'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = FirebaseNotifier::sendTestNotification(
            token: $validated['token'] ?? null,
            topic: $validated['topic'] ?? null,
            message: $validated['message'] ?? 'Test Firebase notification from Laravel UI',
            title: $validated['title'] ?? null,
        );

        return response()->json($result, $result['sent'] ? 200 : 422);
    }
}
