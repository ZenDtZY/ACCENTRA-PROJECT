<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')
                ->constrained('students')
                ->cascadeOnDelete();

            $table->string('reference_no');
            $table->date('entry_date');
            $table->string('description');
            $table->text('notes')->nullable();
            $table->string('status')->default('Draft');
            $table->string('period')->nullable();

            $table->timestamps();

            $table->unique(['student_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
    }
};