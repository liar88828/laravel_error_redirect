<?php

namespace Database\Seeders;

use App\Models\ErrorLog;
use Illuminate\Database\Seeder;

class ErrorLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ErrorLog::factory()->count(10)->create();
    }
}
