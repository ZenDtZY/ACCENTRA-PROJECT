<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('subject_code', 50);
            $table->string('subject_name');
            $table->text('description')->nullable();
            $table->enum('catalogue', ['faculty', 'student'])
                ->default('faculty');
            $table->enum('status', ['Active', 'Inactive'])
                ->default('Active');
            $table->timestamps();

            $table->unique(
                ['subject_code', 'catalogue'],
                'subjects_code_catalogue_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
