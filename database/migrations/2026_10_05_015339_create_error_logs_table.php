<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('error_logs', function (Blueprint $t) {
            $t->id();
            $t->string('app')->nullable();
            $t->string('class');
            $t->text('message');
            $t->string('file');
            $t->unsignedInteger('line');
            $t->longText('trace');
            $t->string('url', 2048)->nullable();
            $t->string('method', 10)->nullable();
            $t->unsignedBigInteger('user_id')->nullable();
            $t->string('ip', 45)->nullable();
            $t->string('count', 0)->default(0);
            $t->text('context')->nullable();
            $t->timestamps();
            $t->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('error_logs');
    }
};
