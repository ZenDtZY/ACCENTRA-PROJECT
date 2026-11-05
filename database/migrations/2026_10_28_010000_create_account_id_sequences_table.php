<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_id_sequences', function (Blueprint $table) {
            $table->string('account_type')->primary();
            $table->unsignedBigInteger('next_value');
        });

        DB::table('account_id_sequences')->insert([
            [
                'account_type' => 'Faculty',
                'next_value' => $this->nextNumber('faculties', 'faculty_number', 'FCT'),
            ],
            [
                'account_type' => 'Student',
                'next_value' => $this->nextNumber('students', 'student_number', 'STD'),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('account_id_sequences');
    }

    private function nextNumber(string $table, string $column, string $prefix): int
    {
        return DB::table($table)
            ->pluck($column)
            ->reduce(function (int $highest, string $identifier) use ($prefix): int {
                if (preg_match('/^'.preg_quote($prefix, '/').'-(\d+)$/i', $identifier, $matches)) {
                    return max($highest, (int) $matches[1]);
                }

                return $highest;
            }, 0) + 1;
    }
};
