<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            if (! Schema::hasColumn('journal_entries', 'report_uuid')) {
                $table->uuid('report_uuid')->nullable()->index();
            }

            if (! Schema::hasColumn('journal_entries', 'report_reference_no')) {
                $table->string('report_reference_no', 50)->nullable()->index();
            }

            if (! Schema::hasColumn('journal_entries', 'company_name')) {
                $table->string('company_name')->nullable();
            }

            if (! Schema::hasColumn('journal_entries', 'report_title')) {
                $table->string('report_title')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('journal_entries', function (Blueprint $table) {
            foreach (['report_uuid', 'report_reference_no', 'company_name', 'report_title'] as $column) {
                if (Schema::hasColumn('journal_entries', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
