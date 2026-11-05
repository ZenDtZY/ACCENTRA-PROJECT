<?php

use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Auth\AccountPasswordSetupController;
use App\Http\Controllers\Auth\FacultyLoginController;
use App\Http\Controllers\Auth\FacultyPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\StudentLoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Faculty\TaskController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Faculty\FacultySectionController;
use App\Http\Controllers\Student\StudentTaskController;
use App\Http\Controllers\Student\ChartOfAccountsController;
use App\Http\Controllers\Student\StudentJournalEntryController;


// Public landing page
Route::inertia('/landingpage', 'landingPage')->name('landingpage');
Route::get('/system/manifest.webmanifest', [SettingsController::class, 'manifest'])
    ->name('system.manifest');


Route::get('/faculty/setup-password/{token}', [FacultyPasswordController::class, 'edit'])
    ->middleware('guest')->name('faculty.password.setup');
Route::post('/faculty/setup-password', [FacultyPasswordController::class, 'update'])
    ->middleware(['guest', 'throttle:5,1'])->name('faculty.password.update');
Route::get('/password/reset/{token}', [AccountPasswordSetupController::class, 'edit'])
    ->name('password.reset.edit');
Route::post('/password/reset/{token}', [AccountPasswordSetupController::class, 'update'])
    ->middleware('throttle:5,1')->name('password.reset.update');

// Admin authentication
Route::redirect('/', '/landingpage');
Route::middleware(['guest', 'admin.ip'])->group(function () {
    Route::inertia('/login', 'login')->name('login');
    Route::post('/login', [AdminLoginController::class, 'login'])
        ->middleware('throttle:5,1')->name('admin.login.submit');
});
Route::inertia('/forgot-password', 'forgotPassword')->name('password.request');
Route::post('/forgot-password/send-link', [PasswordResetLinkController::class, 'sendAdminResetLink'])
    ->middleware('throttle:3,1')->name('password.reset-link.send');
Route::post('/logout', [AdminLoginController::class, 'logout'])
    ->middleware('auth')->name('logout');

// Faculty authentication
Route::inertia('/faculty/login', 'facultyLogin')->name('faculty.login');
Route::post('/faculty/login', [FacultyLoginController::class, 'login'])
    ->middleware('throttle:5,1')->name('faculty.login.submit');
Route::inertia('/faculty/forgot-password', 'facultyForgotPassword')
    ->name('faculty.password.request');
Route::post('/faculty/forgot-password/send-link', [PasswordResetLinkController::class, 'sendFacultyResetLink'])
    ->middleware('throttle:3,1')->name('faculty.password.reset-link.send');
Route::post('/faculty/logout', [FacultyLoginController::class, 'logout'])
    ->middleware(['auth', 'faculty'])->name('faculty.logout');

// Student authentication
Route::middleware('guest:student,web')->group(function () {
    Route::inertia('/student/login', 'studentLogin')->name('student.login');
    Route::post('/student/login', [StudentLoginController::class, 'login'])
        ->middleware('throttle:5,1')->name('student.login.submit');
    Route::inertia('/student/forgot-password', 'studentForgotPassword')
        ->name('student.password.request');
});
Route::post('/student/forgot-password/send-link', [PasswordResetLinkController::class, 'sendStudentResetLink'])
    ->middleware('throttle:3,1')->name('student.password.reset-link.send');
Route::middleware(['auth:student,web', 'active.student'])->group(function () {
    Route::inertia('/student/dashboard', 'studentDashboard')->name('student.dashboard');
    Route::post('/student/logout', [StudentLoginController::class, 'logout'])->name('student.logout');
    Route::inertia('/student/content', 'studentContent')->name('student.content');
    Route::get('/student/tasks', [
    StudentTaskController::class,
    'index'
])->name('student.tasks');

Route::get('/student/tasks/{task}/attachment', [
    StudentTaskController::class,
    'downloadAttachment'
])->name('student.tasks.attachment');
    Route::get('/student/accounting/chart-of-accounts', [ChartOfAccountsController::class, 'index'])
        ->name('student.accounting.chart-of-accounts');
    Route::post('/student/accounting/chart-of-accounts', [ChartOfAccountsController::class, 'store'])
        ->name('student.accounting.chart-of-accounts.store');
    Route::put('/student/accounting/chart-of-accounts/{account}', [ChartOfAccountsController::class, 'update'])
        ->whereNumber('account')->name('student.accounting.chart-of-accounts.update');
    Route::delete('/student/accounting/chart-of-accounts/{account}', [ChartOfAccountsController::class, 'destroy'])
        ->whereNumber('account')->name('student.accounting.chart-of-accounts.destroy');
    
Route::get('/student/accounting/journal-entries', [
    StudentJournalEntryController::class,
    'index',
])->name('student.accounting.journal-entries');

Route::post('/student/accounting/journal-entries', [
    StudentJournalEntryController::class,
    'store',
])->name('student.accounting.journal-entries.store');

Route::put('/student/accounting/journal-entries/{journalEntry}', [
    StudentJournalEntryController::class,
    'update',
])->name('student.accounting.journal-entries.update');

Route::delete('/student/accounting/journal-entries/{journalEntry}', [
    StudentJournalEntryController::class,
    'destroy',
])->name('student.accounting.journal-entries.destroy');

    Route::inertia('/student/accounting/general-ledger', 'studentGeneralLedger')->name('student.accounting.general-ledger');
    Route::inertia('/student/accounting/trial-balance', 'studentTrialBalance')->name('student.accounting.trial-balance');
    Route::inertia('/student/accounting/income-sheet', 'studentIncomeSheet')->name('student.accounting.income-sheet');
    Route::inertia('/student/accounting/balance-sheet', 'studentBalanceSheet')->name('student.accounting.balance-sheet');
    Route::inertia('/student/submissions', 'studentSubmissions')->name('student.submissions');
    Route::inertia('/student/results', 'studentResults')->name('student.results');
    Route::inertia('/student/account', 'studentAccount')->name('student.account');
});

// Admin portal
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/settings/general', [SettingsController::class, 'general'])->name('settings.general');
    Route::post('/settings/general', [SettingsController::class, 'updateGeneral'])->name('settings.general.update');
    Route::get('/settings/academic', [SettingsController::class, 'academic'])->name('settings.academic');
    Route::post('/settings/academic', [SettingsController::class, 'updateAcademic'])->name('settings.academic.update');
    Route::get('/settings/information', [SettingsController::class, 'information'])->name('settings.information');
    // Student Management
    Route::get('/students', [StudentController::class, 'index'])
        ->name('students');

    Route::post('/students', [StudentController::class, 'store'])
        ->name('students.store');

    Route::put('/students/{student}', [StudentController::class, 'update'])
        ->name('students.update');

    // Assign Subjects to Student
    Route::put('/students/{student}/subjects', [
        StudentController::class,
        'assignSubjects'
    ])->name('students.subjects');

    Route::patch('/students/{student}/status', [
        StudentController::class,
        'updateStatus'
    ])->name('students.status');

    Route::delete('/students/{student}', [
        StudentController::class,
        'destroy'
    ])->name('students.destroy');

    Route::patch('/students/{student}/status', [StudentController::class, 'updateStatus'])->name('students.status');
    Route::delete('/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');

    Route::get('/faculty', [FacultyController::class, 'index'])->name('faculty');
    Route::post('/faculty', [FacultyController::class, 'store'])->name('faculty.store');
    Route::get('/faculty/{faculty}', [FacultyController::class, 'show'])->whereNumber('faculty')->name('faculty.show');
    Route::put('/faculty/{faculty}', [FacultyController::class, 'update'])->name('faculty.update');
    Route::patch('/faculty/{faculty}/status', [FacultyController::class, 'updateStatus'])->name('faculty.status');
    Route::delete('/faculty/{faculty}', [FacultyController::class, 'destroy'])->name('faculty.destroy');
    Route::put('/faculty/{faculty}/sections', [FacultyController::class, 'assignSections'])->name('faculty.sections');

    Route::get('/sections', [SectionController::class, 'index'])->name('sections');
    Route::post('/sections', [SectionController::class, 'store'])->name('sections.store');
    Route::get('/sections/{section}', [SectionController::class, 'show'])->name('sections.show');
    Route::put('/sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::patch('/sections/{section}/status', [SectionController::class, 'updateStatus'])->name('sections.status');
    Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
});

// Faculty portal
Route::middleware(['auth', 'faculty'])->group(function () {
    Route::inertia('/faculty/dashboard', 'facultyDashboard')->name('faculty.dashboard');
    Route::inertia('/faculty/content', 'contentManagement')->name('faculty.content');
    Route::get('/faculty/sections', [
    FacultySectionController::class,
    'index'
])->name('faculty.portal.sections');
    Route::inertia('/faculty/submissions', 'facultySubmissions')->name('faculty.submissions');
    Route::inertia('/faculty/my-account', 'facultyMyAccount')->name('faculty.my-account');

    Route::get('/faculty/tasks', [TaskController::class, 'index'])->name('faculty.tasks');
    Route::get('/faculty/tasks/{task}/attachment', [TaskController::class, 'downloadAttachment'])->name('faculty.tasks.attachment');
    Route::post('/faculty/tasks', [TaskController::class, 'store'])->name('faculty.tasks.store');
    Route::post('/faculty/tasks/{id}', [TaskController::class, 'update'])->whereNumber('id')->name('faculty.tasks.update');
    Route::patch('/faculty/tasks/{id}/publish', [TaskController::class, 'publish'])->whereNumber('id')->name('faculty.tasks.publish');
    Route::patch('/faculty/tasks/{id}/cancel', [TaskController::class, 'cancel'])->whereNumber('id')->name('faculty.tasks.cancel');
    Route::delete('/faculty/tasks/{id}', [TaskController::class, 'destroy'])->whereNumber('id')->name('faculty.tasks.destroy');
    });

// Student Sections
Route::middleware(['auth:student,web', 'active.student'])->group(function () {
    Route::inertia('/student/sections', 'studentMySection')
        ->name('student.sections');
});

   

