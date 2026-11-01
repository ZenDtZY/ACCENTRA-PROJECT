<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chart_of_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('code', 3);
            $table->string('title');
            $table->string('type', 20);
            $table->string('nature', 10);
            $table->string('account_group');
            $table->string('period');
            $table->string('description', 250);
            $table->string('status', 10)->default('Active');
            $table->timestamps();

            $table->unique(['student_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chart_of_accounts');
    }
};
