<?php

namespace Tests\Feature\ErrorLogs;

use App\Models\ErrorLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorLogPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_error_logs(): void
    {
        $this->get(route('error-logs.index'))
            ->assertRedirect(route('login'));
    }

    public function test_verified_user_can_view_error_logs(): void
    {
        ErrorLog::factory()->create([
            'message' => 'Payment provider timed out.',
            'count' => 3,
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('error-logs.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('error-logs/index')
                ->has('errorLogs.data', 1)
                ->where('errorLogs.data.0.message', 'Payment provider timed out.')
                ->where('errorLogs.data.0.count', 3),
            );
    }

    public function test_error_log_detail_includes_trace_and_context(): void
    {
        $errorLog = ErrorLog::factory()->create([
            'message' => 'Payment provider timed out.',
            'trace' => '#0 app/Services/PaymentService.php(42): request()',
            'context' => ['request_id' => 'request-abc'],
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('error-logs.show', $errorLog))
            ->assertInertia(fn (Assert $page) => $page
                ->component('error-logs/show')
                ->where('errorLog.message', 'Payment provider timed out.')
                ->where('errorLog.trace', '#0 app/Services/PaymentService.php(42): request()')
                ->where('errorLog.count', 1)
                ->where('errorLog.context.request_id', 'request-abc'),
            );
    }

    public function test_authenticated_user_can_resolve_an_error_log_from_the_page(): void
    {
        $errorLog = ErrorLog::factory()->create();

        $this->actingAs(User::factory()->create())
            ->from(route('error-logs.index'))
            ->patch(route('error-logs.resolve', $errorLog))
            ->assertRedirect(route('error-logs.index'));

        $this->assertNotNull($errorLog->fresh()->resolved_at);

        $this->from(route('error-logs.index'))
            ->patch(route('error-logs.resolve', $errorLog))
            ->assertRedirect(route('error-logs.index'));

        $this->assertNull($errorLog->fresh()->resolved_at);
    }

    public function test_authenticated_user_can_delete_an_error_log_from_the_page(): void
    {
        $errorLog = ErrorLog::factory()->create();

        $this->actingAs(User::factory()->create())
            ->from(route('error-logs.index'))
            ->delete(route('error-logs.destroy', $errorLog))
            ->assertRedirect(route('error-logs.index'));

        $this->assertDatabaseMissing('error_logs', ['id' => $errorLog->id]);
    }
}
