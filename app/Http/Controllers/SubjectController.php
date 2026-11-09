<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        return Inertia::render('subjectManagement', [
            'subjects' => Subject::orderBy('subject_name')->get(),
            'faculty' => Faculty::orderBy('name')->get(),
            'students' => Student::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_code' => 'required|string|max:50',
            'subject_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'catalogue' => 'required|in:faculty,student',
            'status' => 'required|in:Active,Inactive',
        ]);

        $code = strtoupper(trim($validated['subject_code']));
        $validated['subject_code'] = $code;

        // Prevent adding the same code twice from the currently selected tab.
        if (Subject::where('subject_code', $code)
            ->where('catalogue', $validated['catalogue'])
            ->exists()) {
            return back()->withErrors([
                'subject_code' => 'This subject code already exists.',
            ]);
        }

        // A subject is shared: keep one matching record in each catalogue.
        // If the other catalogue already has an older copy, synchronize it.
        DB::transaction(function () use ($validated, $code) {
            foreach (['faculty', 'student'] as $catalogue) {
                Subject::updateOrCreate(
                    [
                        'subject_code' => $code,
                        'catalogue' => $catalogue,
                    ],
                    [
                        'subject_name' => $validated['subject_name'],
                        'description' => $validated['description'] ?? null,
                        'status' => $validated['status'],
                    ]
                );
            }
        });

        return back()->with('success', 'Subject added to both Faculty and Student catalogues.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'subject_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('subjects', 'subject_code')
                    ->where('catalogue', 'faculty')
                    ->ignore(
                        Subject::where('subject_code', $subject->subject_code)
                            ->where('catalogue', 'faculty')
                            ->value('id')
                    ),
                Rule::unique('subjects', 'subject_code')
                    ->where('catalogue', 'student')
                    ->ignore(
                        Subject::where('subject_code', $subject->subject_code)
                            ->where('catalogue', 'student')
                            ->value('id')
                    ),
            ],
            'subject_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'catalogue' => 'required|in:faculty,student',
            'status' => 'required|in:Active,Inactive',
        ]);

        $newCode = strtoupper(trim($validated['subject_code']));
        $oldCode = $subject->subject_code;
        $oldName = $subject->subject_name;

        DB::transaction(function () use ($subject, $validated, $newCode, $oldCode, $oldName) {
            // Update both catalogue copies, preserving the existing paired record IDs.
            $matches = Subject::where('subject_code', $oldCode)->get();

            foreach ($matches as $match) {
                $match->update([
                    'subject_code' => $newCode,
                    'subject_name' => $validated['subject_name'],
                    'description' => $validated['description'] ?? null,
                    'status' => $validated['status'],
                ]);
            }

            // If an older database has only one copy, create the missing copy.
            foreach (['faculty', 'student'] as $catalogue) {
                Subject::firstOrCreate(
                    ['subject_code' => $newCode, 'catalogue' => $catalogue],
                    [
                        'subject_name' => $validated['subject_name'],
                        'description' => $validated['description'] ?? null,
                        'status' => $validated['status'],
                    ]
                );
            }

            if (strcasecmp(trim($oldName), trim($validated['subject_name'])) !== 0) {
                $this->replaceAssignedSubjectName($oldName, $validated['subject_name']);
            }
        });

        return back()->with('success', 'Subject updated in both Faculty and Student catalogues.');
    }

    public function destroy(Subject $subject)
    {
        $code = $subject->subject_code;
        $name = $subject->subject_name;

        DB::transaction(function () use ($code, $name) {
            // Deleting from either tab removes the shared subject from both.
            Subject::where('subject_code', $code)->delete();
            $this->removeAssignedSubjectName($name);
        });

        return back()->with('success', 'Subject deleted from both catalogues and its assignments were cleaned up.');
    }

    private function removeAssignedSubjectName(string $subjectName): void
    {
        foreach ([Faculty::class, Student::class] as $model) {
            $model::query()->whereNotNull('subjects')->get()->each(function ($person) use ($subjectName) {
                $current = is_array($person->subjects) ? $person->subjects : [];
                $updated = collect($current)
                    ->reject(fn ($name) => is_string($name)
                        && strcasecmp(trim($name), trim($subjectName)) === 0)
                    ->values()
                    ->all();

                if ($updated !== $current) {
                    $person->subjects = $updated;
                    $person->save();
                }
            });
        }
    }

    private function replaceAssignedSubjectName(string $oldName, string $newName): void
    {
        foreach ([Faculty::class, Student::class] as $model) {
            $model::query()->whereNotNull('subjects')->get()->each(function ($person) use ($oldName, $newName) {
                $current = is_array($person->subjects) ? $person->subjects : [];
                $updated = collect($current)
                    ->map(fn ($name) => is_string($name)
                        && strcasecmp(trim($name), trim($oldName)) === 0
                            ? $newName
                            : $name)
                    ->unique()
                    ->values()
                    ->all();

                if ($updated !== $current) {
                    $person->subjects = $updated;
                    $person->save();
                }
            });
        }
    }
}
