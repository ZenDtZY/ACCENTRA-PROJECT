<?php


namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudentTaskController extends Controller
{
    private function currentStudent(): Student
    {
        $user = Auth::user();
        // The project may authenticate students through the student guard
        // or through the linked users table on the web guard.
        $student = $user instanceof Student
            ? $user
            : Student::where('user_id', $user?->id)->first();

        abort_unless($student && $student->status === 'Active', 403);

        return $student;
    }

    private function visibleTasks(Student $student)
    {
        $subjects = collect($student->subjects ?? [])
            ->filter(fn ($subject) => is_string($subject) && trim($subject) !== '')
            ->map(fn ($subject) => trim($subject))
            ->unique()
            ->values()
            ->all();

        return Task::query()
            ->where('status', 'Active')

            // Include tasks assigned to this student's section
            // AND tasks available to all sections.
            ->where(function ($query) use ($student) {
                $query->whereNull('section_id')
                    ->orWhere('section_id', $student->section_id);
            })

            // Only show tasks for subjects the student is enrolled in.
            ->whereIn('subject_name', $subjects);
    }

    public function index()
    {
        $student = $this->currentStudent();

        $subjects = collect($student->subjects ?? [])
            ->filter(fn ($name) => is_string($name) && trim($name) !== '')
            ->map(fn ($name) => trim($name))
            ->unique()
            ->values();

        $tasks = $this->visibleTasks($student)
            ->with('section:id,section_name')
            ->latest()
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'subject_name' => $task->subject_name,
                'subject_id' => $task->subject_name,
                'topic' => $task->topic,
                'section_id' => $task->section_id,
                'section' => $task->section_id === null
                    ? 'All Sections'
                    : $task->section?->section_name,
                'due_date' => $task->due_date?->format('Y-m-d'),
                'points' => $task->points,
                'description' => $task->description,
                'instructions' => $task->instructions,
                'status' => $task->status,
                'created_at' => $task->created_at?->toIso8601String(),
                'attachment' => $task->attachment_path ? [
                    'name' => $task->attachment_name,
                    'url' => route('student.tasks.attachment', $task->id),
                ] : null,
            ])
            ->values()
            ->all();

        return Inertia::render('studentTasks', [
            'tasks' => $tasks,
            'enrolledSubjects' => $subjects->map(fn ($name) => [
                'id' => $name,
                'code' => '',
                'name' => $name,
            ])->all(),
        ]);
    }

    public function downloadAttachment(Task $task)
    {
        $student = $this->currentStudent();

        // Students can only download attachments from tasks
        // they are authorized to see.
        abort_unless(
            $this->visibleTasks($student)->whereKey($task->id)->exists(),
            404
        );

        abort_unless($task->attachment_path, 404);

        $disk = Storage::disk('local');

        abort_unless($disk->exists($task->attachment_path), 404);

        return response()->download(
            $disk->path($task->attachment_path),
            $task->attachment_name ?: basename($task->attachment_path)
        );
    }
}
