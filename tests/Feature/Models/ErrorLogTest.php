<?php

namespace Tests\Feature\Models;

use App\Models\ErrorLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ErrorLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_error_log_with_cast_values(): void
    {
        $errorLog = ErrorLog::factory()->create([
            'count' => '7',
            'context' => ['source' => 'factory'],
        ]);

        $this->assertModelExists($errorLog);
        $this->assertSame(7, $errorLog->count);
        $this->assertSame(['source' => 'factory'], $errorLog->context);
    }
}
