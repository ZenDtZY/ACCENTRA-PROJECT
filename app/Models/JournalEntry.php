<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends Model
{
    protected $fillable = [
        'student_id',
        'reference_no',
        'report_uuid',
        'report_reference_no',
        'company_name',
        'report_title',
        'entry_date',
        'description',
        'notes',
        'status',
        'period',
    ];

    protected $casts = [
        'entry_date' => 'date',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalEntryLine::class);
    }
}

