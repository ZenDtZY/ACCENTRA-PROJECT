<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;

class SectionController extends Controller
{
    // 1. View all sections
    
    public function index()
{
    $academicSettings = SystemSetting::where('key', 'academic')->first()?->value ?? [
        'academicYear' => '2026-2027',
        'defaultProgram' => 'Bachelor of Science in Accounting Information Systems',
        'yearLevels' => ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    ];

    return Inertia::render('sectionManagement', [
        'academicSettings' => $academicSettings,
        'availablePrograms' => [
            'Bachelor of Science in Accounting Information Systems',
            'Bachelor of Science in Entrepreneurship',
        ],
        'sections' => Section::with([
            'faculty',
            'students' => function ($query) {
                $query->where('status', 'Active')
                    ->orderBy('name');
            },
        ])
            ->withCount([
                'students as students_count' => function ($query) {
                    $query->where('status', 'Active');
                },
            ])
            ->orderBy('section_name')
            ->get(),

        'availableFaculty' => \App\Models\Faculty::where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'faculty_number', 'name']),
    ]);
}



    // 2. Add a section
    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:255|unique:sections,section_name',
            'course' => 'required|string|max:255',
            'year_level' => 'required|string|max:50',
            'school_year' => 'required|string|max:50',
            'status' => 'required|in:Active,Inactive',
            'faculty_id' => 'nullable|integer|exists:faculties,id',
        ]);

        Section::create($validated);

        ActivityLog::create([
            'actor' => 'Admin',
            'action' => 'created a section',
            'module' => 'Section Management',
            'description' => $validated['section_name'],
            'icon' => 'layers-3',
        ]);

        return redirect()
            ->route('sections')
            ->with('success', 'Section added successfully!');
    }

    // 3. View section information
    public function show(Section $section)
    {
        return response()->json($section);
    }

    // 4. Update a section
    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'section_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('sections', 'section_name')
                    ->ignore($section->id),
            ],
            'course' => 'required|string|max:255',
            'year_level' => 'required|string|max:50',
            'school_year' => 'required|string|max:50',
            'status' => 'required|in:Active,Inactive',
            'faculty_id' => 'nullable|integer|exists:faculties,id',
        ]);

        $section->update($validated);

        ActivityLog::create([
    'actor' => 'Admin',
    'action' => 'updated a section',
    'module' => 'Section Management',
    'description' => $section->section_name,
    'icon' => 'layout-list',
]);

        return redirect()
            ->route('sections')
            ->with('success', 'Section updated successfully!');
    }

    // 5. Delete a section
    
public function destroy(Section $section)
{
    $sectionName = $section->section_name;

    // Check whether this section has assigned tasks.
    $hasTasks = DB::table('tasks')
        ->where('section_id', $section->id)
        ->exists();

    if ($hasTasks) {
        return redirect()
            ->back()
            ->with('error', 'Cannot delete this section because it still has assigned tasks. Please reassign or remove those tasks first.');
    }

    $section->delete();

    ActivityLog::create([
        'actor' => 'Admin',
        'action' => 'deleted a section',
        'module' => 'Section Management',
        'description' => $sectionName,
        'icon' => 'trash-2',
    ]);

    return redirect()
        ->route('sections')
        ->with('success', 'Section deleted successfully.');
}


    // 6. Activate / Deactivate section
    public function updateStatus(Request $request, Section $section)
    {
        $validated = $request->validate([
            'status' => 'required|in:Active,Inactive',
        ]);

        $section->update($validated);

        ActivityLog::create([
    'actor' => 'Admin',
    'action' => $validated['status'] === 'Active'
        ? 'activated a section'
        : 'deactivated a section',
    'module' => 'Section Management',
    'description' => $section->section_name,
    'icon' => 'layers-3',
]);

        return redirect()
            ->route('sections')
            ->with('success', 'Section status updated successfully!');
    }
}
