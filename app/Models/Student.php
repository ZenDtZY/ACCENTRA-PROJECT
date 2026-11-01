<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'student_number',
    'user_id',
    'name',
    'email',
    'password',
    'course',
    'year_level',
    'section',
    'contact_number',
    'address',
    'status',
    'section_id',
    'subjects',
])]
#[Hidden(['password', 'remember_token'])]
class Student extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'students';

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'subjects' => 'array',
        ];
    }

    public function sectionRecord()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function chartOfAccounts(): HasMany
    {
        return $this->hasMany(ChartOfAccount::class);
    }
}
