<?php

namespace Tests\Feature\Products;

use App\Models\ErrorLog;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

class ProductWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_open_the_product_demo(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('products.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('products/index')
                ->where('productCount', 0)
                ->where('errorCount', 0)
                ->has('products.data', 0),
            );
    }

    public function test_product_creation_persists_validated_values(): void
    {
        $payload = [
            'name' => 'Studio headphones',
            'description' => 'Closed-back monitoring headphones.',
            'price' => '129.95',
        ];

        $this->actingAs(User::factory()->create())
            ->post(route('products.store'), $payload)
            ->assertRedirect(route('products.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('products', $payload);
        $this->assertSame(1, Product::query()->count());
    }

    public function test_error_store_route_records_a_separate_error_without_creating_a_product(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('products.store-error'))
            ->assertRedirect(route('products.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('error_logs', [
            'class' => RuntimeException::class,
            'message' => 'Simulated error created from the product demo.',
            'context' => '{"source":"product-demo"}',
            'count' => 1,
        ]);
        $this->assertDatabaseCount('products', 0);
    }

    public function test_increment_route_deduplicates_errors_without_creating_a_product(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('products.store-increment'))
            ->assertRedirect(route('products.index'))
            ->assertSessionHasNoErrors();

        $this->post(route('products.store-increment'))
            ->assertRedirect(route('products.index'))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('error_logs', 1);
        $this->assertDatabaseHas('error_logs', [
            'message' => 'Simulated error created from the product demo.',
            'count' => 2,
        ]);
        $this->assertDatabaseCount('products', 0);
    }

    public function test_invalid_product_is_not_created(): void
    {
        $this->actingAs(User::factory()->create())
            ->from(route('products.index'))
            ->post(route('products.store'), [
                'name' => '',
                'price' => '-1',
            ])
            ->assertRedirect(route('products.index'))
            ->assertSessionHasErrors(['name', 'price']);

        $this->assertDatabaseCount('products', 0);
    }

    public function test_simulated_error_is_saved_and_redirects_back_to_the_demo(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('error-logs.simulate'), ['deduplicate' => 'false'])
            ->assertRedirect(route('products.index'));

        $this->assertDatabaseHas('error_logs', [
            'class' => RuntimeException::class,
            'message' => 'Simulated error created from the product demo.',
            'context' => '{"source":"product-demo"}',
        ]);
        $this->assertSame(1, ErrorLog::query()->count());
    }

    public function test_deduplicated_simulated_error_increments_the_matching_log(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('error-logs.simulate'), ['deduplicate' => 'true'])
            ->assertRedirect(route('products.index'));

        $this->post(route('error-logs.simulate'), ['deduplicate' => 'true'])
            ->assertRedirect(route('products.index'));

        $this->assertDatabaseCount('error_logs', 1);
        $this->assertDatabaseHas('error_logs', [
            'message' => 'Simulated error created from the product demo.',
            'count' => 2,
        ]);
    }
}
