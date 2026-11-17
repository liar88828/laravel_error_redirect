<?php

namespace Tests\Feature\ErrorLogs;

use App\Models\ErrorLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorLogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_returns_paginated_error_logs_as_json_with_count(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        ErrorLog::factory()->create([
            'message' => 'External service failed.',
            'count' => 4,
        ]);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->getJson(route('api.error-logs.index'))
            ->assertOk()
            ->assertJsonPath('data.0.message', 'External service failed.')
            ->assertJsonPath('data.0.count', 4)
            ->assertJsonStructure(['data', 'current_page', 'last_page', 'total']);
    }

    public function test_api_rejects_requests_without_a_valid_api_key(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $this->getJson(route('api.error-logs.index'))
            ->assertUnauthorized();
    }

    public function test_latest_id_is_available_as_json(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $errorLog = ErrorLog::factory()->create();

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->getJson(route('api.error-logs.latest-id'))
            ->assertOk()
            ->assertExactJson(['id' => $errorLog->id]);
    }

    public function test_new_error_logs_returns_only_records_after_the_given_id(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $cursor = ErrorLog::factory()->create(['message' => 'Already seen.']);
        $newErrorLog = ErrorLog::factory()->create(['message' => 'New failure.']);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->getJson(route('api.error-logs.new', ['after_id' => $cursor->id]))
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $newErrorLog->id)
            ->assertJsonPath('0.message', 'New failure.');
    }

    public function test_api_returns_a_single_error_log_as_json(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $errorLog = ErrorLog::factory()->create(['message' => 'External service failed.']);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->getJson(route('api.error-logs.show', ['id' => $errorLog->id]))
            ->assertOk()
            ->assertJsonPath('id', $errorLog->id)
            ->assertJsonPath('message', 'External service failed.');
    }

    public function test_api_returns_not_found_for_a_missing_error_log(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->getJson(route('api.error-logs.show', ['id' => 999]))
            ->assertNotFound();
    }

    public function test_api_resolves_an_error_log(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $errorLog = ErrorLog::factory()->create();

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->patchJson(route('api.error-logs.resolve', ['id' => $errorLog->id]))
            ->assertOk()
            ->assertJsonPath('id', $errorLog->id)
            ->assertJsonStructure(['id', 'resolved_at']);

        $this->assertNotNull($errorLog->fresh()->resolved_at);
    }

    public function test_api_deletes_an_error_log(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $errorLog = ErrorLog::factory()->create();

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->deleteJson(route('api.error-logs.destroy', ['id' => $errorLog->id]))
            ->assertNoContent();

        $this->assertDatabaseMissing('error_logs', ['id' => $errorLog->id]);
    }

    public function test_api_returns_not_found_when_resolving_a_missing_error_log(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->patchJson(route('api.error-logs.resolve', ['id' => 999]))
            ->assertNotFound();
    }

    public function test_api_returns_not_found_when_deleting_a_missing_error_log(): void
    {
        config(['error-redirect.api.key' => 'test-api-key']);

        $this->withHeader('X-Error-Log-Key', 'test-api-key')
            ->deleteJson(route('api.error-logs.destroy', ['id' => 999]))
            ->assertNotFound();
    }
}
