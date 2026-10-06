<?php

namespace Database\Factories;

use App\Models\ErrorLog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ErrorLog>
 */
class ErrorLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'app' => config('app.name'),
            'class' => $this->faker->randomElement([
                \RuntimeException::class,
                \InvalidArgumentException::class,
                \ErrorException::class,
            ]),
            'message' => $this->faker->sentence(),
            'file' => 'app/'.$this->faker->filePath(),
            'line' => $this->faker->numberBetween(1, 500),
            'trace' => '#0 '.$this->faker->filePath().'('.$this->faker->numberBetween(1, 500).'): {closure}()',
            'url' => $this->faker->optional()->url(),
            'method' => $this->faker->randomElement(['GET', 'POST', 'PUT', 'DELETE']),
            'user_id' => null,
            'ip' => $this->faker->optional()->ipv4(),
            'count' => 1,
            'context' => $this->faker->optional()->passthrough([
                'request_id' => (string) Str::uuid(),
            ]),
        ];
    }
}
