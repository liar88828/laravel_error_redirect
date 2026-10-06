<?php

namespace Tests\Feature\ErrorLogs;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ApiSimulatorPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_api_simulator(): void
    {
        $this->get(route('api-simulator'))
            ->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_the_api_simulator(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('api-simulator'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('api-simulator'),
            );
    }
}
