import { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Search,
    Eye,
    Play,
    X,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    CheckCircle2,
    Clock3,
    AlertCircle,
    CalendarDays,
    BookOpen,
    RotateCcw,
    Download,
    FileText,
    ArrowLeft,
    Send,
    Users,
    Award,
    Upload,
    FolderOpen,
    ListChecks,
    Check,
} from "lucide-react";

import StudentLayout from "../components/layout/studentLayout";
const ENROLLED_SUBJECTS = [];


// --------------------------------------------------
// Shared styling
// --------------------------------------------------



function getSubjectLabel(task) {
    return String(task?.subject_name || task?.subjectName || "Unknown Subject").trim();
}


const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#091725] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-[#A9E5D2]/70 focus:ring-2 focus:ring-[#A9E5D2]/10";

const buttonSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40";

const buttonPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#A9E5D2] px-4 py-2.5 text-sm font-bold text-[#10251F] shadow-sm transition-all hover:bg-[#C0F0E1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

// Student Workspace 
const workspaceHeader =
    "flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.07] via-white/[0.035] to-[#A9E5D2]/[0.04] px-5 py-4 text-slate-100";

const workspaceCard =
    "overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.075] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]";

// --------------------------------------------------
// Date helpers
// --------------------------------------------------

function parseDate(value) {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const normalized = String(value).trim();
    if (!normalized) return null;

    const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        const [, year, month, day] = match;

        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getToday() {
    return startOfDay(new Date());
}

function isSameDay(first, second) {
    return (
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate()
    );
}

function formatDate(value) {
    const date = parseDate(value);
    if (!date) return "—";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// --------------------------------------------------
// Attachment helpers
// --------------------------------------------------

function getAttachmentName(attachment) {
    if (!attachment) return "";

    if (
        typeof File !== "undefined" &&
        attachment instanceof File
    ) {
        return attachment.name;
    }

    if (typeof attachment === "string") {
        try {
            return (
                decodeURIComponent(
                    attachment.split("?")[0].split("/").pop(),
                ) || "Attachment"
            );
        } catch {
            return attachment.split("/").pop() || "Attachment";
        }
    }

    return (
        attachment.name ||
        attachment.original_name ||
        attachment.originalName ||
        "Attachment"
    );
}

function getAttachmentUrl(attachment) {
    if (!attachment) return "";
    if (typeof attachment === "string") return attachment;

    return (
        attachment.url ||
        attachment.downloadUrl ||
        attachment.path ||
        attachment.file_path ||
        attachment.fileUrl ||
        attachment.attachmentUrl ||
        ""
    );
}

function downloadAttachment(attachment) {
    if (!attachment) {
        window.alert("No attachment is available for this task.");
        return;
    }

    let url = "";
    let revokeUrl = false;

    if (
        (typeof File !== "undefined" && attachment instanceof File) ||
        (typeof Blob !== "undefined" && attachment instanceof Blob)
    ) {
        url = URL.createObjectURL(attachment);
        revokeUrl = true;
    } else {
        url = getAttachmentUrl(attachment);
    }

    if (!url) {
        window.alert(
            "This attachment does not have an available download link.",
        );
        return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = getAttachmentName(attachment);
    link.rel = "noopener noreferrer";

    if (!revokeUrl) link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    link.remove();

    if (revokeUrl) {
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

function getFileExtension(filename = "") {
    const cleanName = filename.split("?")[0];
    const parts = cleanName.split(".");

    return parts.length > 1 ? parts.pop().toUpperCase() : "FILE";
}

function getFileIconColor(filename = "") {
    const extension = getFileExtension(filename);

    if (extension === "PDF") {
        return "border-rose-300/20 bg-rose-400/10 text-rose-300";
    }

    if (["DOC", "DOCX"].includes(extension)) {
        return "border-sky-300/20 bg-sky-400/10 text-sky-300";
    }

    if (["XLS", "XLSX", "CSV"].includes(extension)) {
        return "border-emerald-300/20 bg-emerald-400/10 text-emerald-300";
    }

    if (["PPT", "PPTX"].includes(extension)) {
        return "border-orange-300/20 bg-orange-400/10 text-orange-300";
    }

    if (["PNG", "JPG", "JPEG"].includes(extension)) {
        return "border-violet-300/20 bg-violet-400/10 text-violet-300";
    }

    return "border-white/10 bg-white/[0.06] text-slate-300";
}

// --------------------------------------------------
// Faculty task normalization
// --------------------------------------------------

function normalizeFacultyTask(task, index) {
    return {
        ...task,
        id: task.id ?? task.taskId ?? index + 1,
        title: task.title || task.taskTitle || "Untitled Task",
        topic: getSubjectLabel(task),
        subject_name: getSubjectLabel(task),
        lessonTopic: task.topic || "",
        subjectCode:
            task.subjectCode ||
            task.subject_code ||
            task.subject?.subject_code ||
            task.subject?.code ||
            ENROLLED_SUBJECTS.find((subject) => subject.name === getSubjectLabel(task))?.code ||
            "",
        subjectId: task.subject_id ?? task.subjectId ?? task.subject?.id ?? "",
        section:
            task.section ||
            task.assignedSection ||
            task.sectionName ||
            "My Section",
        dateCreated:
            task.dateCreated ||
            task.created_at ||
            task.datePosted ||
            task.createdAt ||
            task.postedAt ||
            "",
        dueDate: task.dueDate || task.due_date || task.due || "",
        points:
            task.points ??
            task.totalPoints ??
            task.maxPoints ??
            0,
        description: task.description || "",
        instructions: task.instructions || task.instruction || "",
        attachment:
            task.attachment ||
            task.attachment_url ||
            task.fileAttachment ||
            task.attachedFile ||
            task.file ||
            null,
        answer: task.answer || "",
        answerFile: task.answerFile || task.submission?.attachment_url || null,
        submissionStatus: task.submissionStatus || task.submission?.status || "Not Started",
    };
}

function getAvailableFacultyTasks(sourceTasks = []) {
    return (Array.isArray(sourceTasks) ? sourceTasks : [])
        .filter((task) => ["active", "published"].includes(String(task.status || "").toLowerCase()))
        .map((task, index) => ({
            ...normalizeFacultyTask(task, index),
            taskCode: task.taskCode || task.task_code || `TSK-${String(task.id).padStart(3, "0")}`,
        }));
}

// --------------------------------------------------
// Student submission status
// --------------------------------------------------

function getTaskStatus(task, today = getToday()) {
    const rawStatus = String(task.submissionStatus || "Not Started")
        .trim()
        .toLowerCase();

    if (["submitted", "completed", "released"].includes(rawStatus)) {
        return "Submitted";
    }

    const dueDate = parseDate(task.dueDate || task.due);

    if (dueDate && startOfDay(dueDate) < today) {
        return "Overdue";
    }

    if (
        ["in progress", "in-progress", "in_progress"].includes(rawStatus)
    ) {
        return "In Progress";
    }

    return "Not Started";
}

function getDatePosted(task) {
    return (
        task.datePosted ||
        task.dateCreated ||
        task.createdAt ||
        task.postedAt ||
        ""
    );
}

function isTaskInProgress(task) {
    const status = String(task.submissionStatus || "")
        .trim()
        .toLowerCase();

    return ["in progress", "in-progress", "in_progress"].includes(status);
}

// --------------------------------------------------
// Status badge
// --------------------------------------------------

function StatusBadge({ status }) {
    const styles = {
        "Not Started": "border-amber-300/20 bg-amber-400/10 text-amber-200",
        "In Progress": "border-sky-300/20 bg-sky-400/10 text-sky-200",
        Submitted: "border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2]",
        Overdue: "border-rose-300/20 bg-rose-400/10 text-rose-200",
    };

    const dots = {
        "Not Started": "bg-amber-300",
        "In Progress": "bg-sky-300",
        Submitted: "bg-[#A9E5D2]",
        Overdue: "bg-rose-300",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                styles[status] ||
                "border-[#CBD3DC] bg-white text-[#647181]"
            }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    dots[status] || "bg-[#7C8794]"
                }`}
            />
            {status}
        </span>
    );
}

// --------------------------------------------------
// Summary card 
// --------------------------------------------------

function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    gradient,
    borderColor,
    accentColor,
    iconBackground,
}) {
    return (
        <div
            className={`group relative min-w-0 overflow-hidden rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
        >
            <div
                className={`absolute bottom-0 left-0 h-1 w-full ${accentColor}`}
            />

            <div className="flex items-center gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBackground} text-white shadow-sm transition-transform group-hover:scale-105`}
                >
                    <Icon size={21} />
                </div>

                <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-400">
                        {title}
                    </span>
                    <span className="mt-1 block text-2xl font-bold tracking-tight text-white">
                        {value}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                        {description}
                    </span>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// Faculty attachment panel
// --------------------------------------------------

function AttachmentPanel({
    attachment,
    description = "Task resource provided by your faculty.",
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
            {attachment ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5 transition hover:border-[#A9E5D2]/30 hover:bg-white/[0.05]">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${getFileIconColor(
                                getAttachmentName(attachment),
                            )}`}
                        >
                            <FileText size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="break-all text-sm font-bold text-slate-100">
                                {getAttachmentName(attachment)}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-bold text-slate-300">
                                    {getFileExtension(
                                        getAttachmentName(attachment),
                                    )}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                    Faculty-provided file
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => downloadAttachment(attachment)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 px-4 py-2.5 text-sm font-bold text-[#A9E5D2] transition hover:bg-[#A9E5D2]/15"
                    >
                        <Download size={16} />
                        Download Attachment
                    </button>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-7 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400">
                        <FolderOpen size={22} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-200">
                        No attachment available
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                        {description}
                    </p>
                </div>
            )}
        </div>
    );
}

// --------------------------------------------------
// Student uploaded file card
// --------------------------------------------------

function StudentFileCard({ file, onRemove, disabled = false }) {
    if (!file) return null;

    const filename = getAttachmentName(file);
    const fileSize =
        typeof file.size === "number"
            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
            : "";

    return (
        <div className="rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.045] p-3.5">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${getFileIconColor(
                        filename,
                    )}`}
                >
                    <FileText size={21} />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="break-all text-sm font-bold text-slate-100">
                        {filename}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        {getFileExtension(filename)}
                        {fileSize ? ` · ${fileSize}` : ""}
                    </p>
                </div>

                {!disabled && (
                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Remove selected file"
                        title="Remove file"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-300 transition hover:bg-rose-400/10"
                    >
                        <X size={17} />
                    </button>
                )}
            </div>
        </div>
    );
}

// --------------------------------------------------
// Task details modal
// --------------------------------------------------

function TaskDetailsModal({ task, onClose, onStart, today }) {
    if (!task) return null;

    const status = getTaskStatus(task, today);

    const details = [
        ["Subject", getSubjectLabel(task)],
        ["Date Created", formatDate(getDatePosted(task))],
        ["Due Date", formatDate(task.dueDate)],
        ["Total Points", `${task.points} points`],
    ];

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#06111D]/80 p-4 backdrop-blur-md"
            onMouseDown={onClose}
        >
            <div
                className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.13] bg-[#0D1B2A] shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-white/10 bg-gradient-to-br from-[#142A43] via-[#102638] to-[#0D1B2A] px-6 py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2]">
                                <ClipboardList size={25} />
                            </div>

                            <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#C8D8E8]">
                                     Task Details
                                </span>
                                <h2 className="mt-1 break-words text-xl font-bold text-white">
                                    {task.title}
                                </h2>
                                <span className="mt-1.5 inline-block rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-[#D8E4EF]">
                                    {task.taskCode || "TSK-001"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            aria-label="Close task details"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[65vh] space-y-5 overflow-y-auto bg-gradient-to-br from-white/[0.045] to-white/[0.015] px-5 py-5 sm:px-6">
                    <section>
                        <h3 className="text-sm font-bold text-white">
                            Task & Academic Details
                        </h3>
                        <p className="mb-4 mt-0.5 text-xs text-slate-400">
                            These details reflect the task information provided by your faculty.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 sm:col-span-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Task Title
                                </span>
                                <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">
                                    {task.title}
                                </strong>
                            </div>

                            {details.map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5"
                                >
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {label}
                                    </span>
                                    <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">
                                        {value || "—"}
                                    </strong>
                                </div>
                            ))}

                            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Submission Status
                                </span>
                                <div className="mt-2">
                                    <StatusBadge status={status} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 sm:col-span-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Description
                                </span>
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                    {task.description || "No description provided."}
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 sm:col-span-2">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Instructions
                                </span>
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                    {task.instructions ||
                                        "No additional instructions provided."}
                                </p>
                            </div>
                        </div>
                    </section>

                    <AttachmentPanel attachment={task.attachment} />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 bg-[#0A1623] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        className={buttonSecondary}
                    >
                        Close
                    </button>

                    {status !== "Submitted" && (
                        <button
                            type="button"
                            onClick={() => onStart(task)}
                            className={buttonPrimary}
                        >
                            <Play size={15} />
                            {isTaskInProgress(task) ? "Continue Task" : "Start Task"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------
// Student Workspace
// --------------------------------------------------

function TaskWorkspace({ task, onClose, onSubmitTask, today }) {
    const [answerFile, setAnswerFile] = useState(task?.answerFile || null);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setAnswerFile(task?.answerFile || null);
        setConfirmSubmit(false);
        setSubmissionSuccess(false);
    }, [task?.id]);

    if (!task) return null;

    const status = getTaskStatus(task, today);
    const isSubmitted = status === "Submitted";

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            window.alert("File size must not exceed 10 MB.");
            event.target.value = "";
            return;
        }

        setAnswerFile(file);
    };

    const handleSubmit = () => {
        if (!answerFile) {
            window.alert(
                "Please attach your completed task file before submitting.",
            );
            return;
        }

        setConfirmSubmit(true);
    };

    const confirmSubmission = () => {
        setIsSubmitting(true);
        onSubmitTask(task, answerFile, {
            onSuccess: () => {
                setConfirmSubmit(false);
                setSubmissionSuccess(true);
                setIsSubmitting(false);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                window.alert(Object.values(errors || {}).flat().join("\n") || "Submission failed. Please try again.");
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const finishSubmission = () => {
        setSubmissionSuccess(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071321]">
            <div className="min-h-screen">
                {/* Workspace top bar */}
                <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A1623]/95 shadow-lg shadow-black/10 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                <BookOpen size={21} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#738396]">
                                    ACCENTRA · Student Workspace
                                </p>
                                <h1 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
                                    {task.title}
                                </h1>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className={buttonSecondary}
                        >
                            <ArrowLeft size={16} />
                            <span className="hidden sm:inline">Back to Tasks</span>
                            <span className="sm:hidden">Back</span>
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    
                    <section className="relative overflow-hidden rounded-3xl border border-white/[0.13] bg-gradient-to-br from-white/[0.10] via-[#102638] to-[#0D1B2A] p-6 text-white shadow-[0_18px_55px_rgba(0,0,0,0.25)] backdrop-blur-[22px] sm:p-8">
                        <div className="relative z-10">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
                                    {task.topic || "Accounting"}
                                </span>
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold text-white/90">
                                    {task.section || "My Section"}
                                </span>
                            </div>

                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                                <div className="max-w-3xl">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C8D8E8]">
                                        Task Workspace
                                    </p>
                                    <h2 className="mt-2 break-words text-2xl font-extrabold leading-tight sm:text-3xl">
                                        {task.title}
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                                        Review the task details and instructions,
                                        download any learning materials, and upload
                                        your completed work.
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-3">
                                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                            Total Points
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 text-lg font-bold text-white">
                                            <Award size={18} className="text-amber-200" />
                                            {task.points ?? 0} points
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                                            Due Date
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                                            <CalendarDays size={17} className="text-emerald-200" />
                                            {formatDate(task.dueDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/15 pt-5">
                                <span className="text-xs font-medium text-blue-100">
                                    {task.taskCode || "TSK-001"}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-white/40" />
                                <span className="text-xs text-blue-100">
                                    Posted {formatDate(getDatePosted(task))}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-white/40" />
                                <StatusBadge status={status} />
                            </div>
                        </div>
                    </section>

                    {/* Workspace cards */}
                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
                        <div className="space-y-6 xl:col-span-2">
                            {/* Task Overview */}
                            <section className={workspaceCard}>
                                <div className={workspaceHeader}>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                        <ClipboardList size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">
                                            Task Overview
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Academic and submission details
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 bg-transparent p-5 sm:grid-cols-2 sm:p-6">
                                    {[
                                        {
                                            label: "Task Title",
                                            value: task.title,
                                            icon: ClipboardList,
                                            iconStyle: "border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2]",
                                        },
                                        {
                                            label: "Topic / Subject",
                                            value: task.topic,
                                            icon: BookOpen,
                                            iconStyle: "border border-white/10 bg-white/[0.06] text-slate-300",
                                        },
                                        {
                                            label: "Assigned Section",
                                            value: task.section,
                                            icon: Users,
                                            iconStyle: "border border-white/10 bg-white/[0.06] text-slate-300",
                                        },
                                        {
                                            label: "Date Posted",
                                            value: formatDate(getDatePosted(task)),
                                            icon: CalendarDays,
                                            iconStyle: "border border-white/10 bg-white/[0.06] text-slate-300",
                                        },
                                    ].map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <div
                                                key={item.label}
                                                className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#A9E5D2]/30 hover:bg-white/[0.06]"
                                            >
                                                <div
                                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconStyle}`}
                                                >
                                                    <Icon size={17} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                        {item.label}
                                                    </p>
                                                    <p className="mt-1 break-words text-sm font-semibold text-slate-100">
                                                        {item.value || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Task Description */}
                            <section className={workspaceCard}>
                                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.025] to-[#A9E5D2]/[0.035] px-5 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100">
                                            Task Description
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Activity overview from your faculty
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#0B1927]/70 p-5 sm:p-6">
                                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                                            {task.description ||
                                                "No description provided by the faculty."}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Task Instructions */}
                            <section className={workspaceCard}>
                                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.025] to-[#A9E5D2]/[0.035] px-5 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                        <ListChecks size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100">
                                            Task Instructions
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Requirements and directions
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#0B1927]/70 p-5 sm:p-6">
                                    {task.instructions ? (
                                        <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                                                {task.instructions}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-7 text-center">
                                            <ListChecks
                                                size={25}
                                                className="mx-auto text-[#A9E5D2]"
                                            />
                                            <p className="mt-2 text-sm font-semibold text-slate-100">
                                                No additional instructions
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Follow any directions discussed by your faculty.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Compact red Deadline Reminder */}
                            <section className="rounded-xl border border-rose-300/20 bg-rose-400/[0.07] p-3.5 shadow-sm sm:p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-400/15 text-rose-300">
                                        <Clock3 size={17} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <h3 className="text-sm font-bold text-rose-200">
                                                Deadline Reminder
                                            </h3>

                                            <span className="rounded-full border border-rose-300/20 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                                                {isSubmitted ? "Submitted" : "Due Date"}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs font-semibold text-rose-200">
                                            {task.dueDate
                                                ? `Due on ${formatDate(task.dueDate)}`
                                                : "Check the deadline announced by your faculty"}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-rose-200/80">
                                            {isSubmitted
                                                ? "Your work has been submitted. Keep a copy for your records."
                                                : task.dueDate
                                                  ? `Submit your completed work on or before ${formatDate(task.dueDate)}.`
                                                  : "Confirm the due date with your faculty and submit on time."}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Right sidebar */}
                        <aside className="space-y-6">
                            {/* Learning Materials */}
                            <section className={workspaceCard}>
                                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.025] to-[#A9E5D2]/[0.035] px-5 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                        <FolderOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#A9E5D2]">
                                            Learning Materials
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-100">
                                            Files attached by your faculty
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-transparent p-4">
                                    <AttachmentPanel
                                        attachment={task.attachment}
                                        description="Your faculty has not attached a file to this task."
                                    />
                                    
                                </div>
                            </section>

                            {/* Submit Your Work */}
                            <section className={workspaceCard}>
                                <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-white/[0.06] via-white/[0.025] to-[#A9E5D2]/[0.035] px-5 py-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                        <Upload size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-100">
                                            Submit Your Work
                                        </h3>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Upload your completed task
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[#0B1927]/70 p-5">
                                    {isSubmitted ? (
                                        <div className="rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] p-4">
                                            <div className="flex items-center gap-2 text-emerald-300">
                                                <CheckCircle2 size={19} />
                                                <p className="text-sm font-bold">
                                                    Task Submitted
                                                </p>
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-slate-300">
                                                Your task has been marked as submitted.
                                            </p>

                                            {answerFile && (
                                                <div className="mt-4">
                                                    <StudentFileCard
                                                        file={answerFile}
                                                        disabled
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <label
                                                htmlFor="student-answer-file"
                                                className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-[#A9E5D2]/25 bg-[#A9E5D2]/[0.04] px-4 py-6 text-center transition hover:border-[#A9E5D2]/50 hover:bg-[#A9E5D2]/[0.08]"
                                            >
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-sm">
                                                    <Upload size={23} />
                                                </div>

                                                <span className="mt-3 text-sm font-bold text-[#C7F0E3]">
                                                    Choose a file to upload
                                                </span>
                                                <span className="mt-1 text-xs leading-5 text-slate-400">
                                                    PDF, Word, PowerPoint, Excel, JPG, or PNG
                                                </span>
                                                <span className="mt-1 text-[11px] font-medium text-slate-500">
                                                    Maximum file size: 10 MB
                                                </span>
                                            </label>

                                            <input
                                                id="student-answer-file"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />

                                            {answerFile && (
                                                <div className="mt-4">
                                                    <StudentFileCard
                                                        file={answerFile}
                                                        onRemove={() => {
                                                            setAnswerFile(null);

                                                            const input =
                                                                document.getElementById(
                                                                    "student-answer-file",
                                                                );

                                                            if (input) input.value = "";
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleSubmit}
                                                disabled={!answerFile}
                                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B3553] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#142A43] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Send size={16} />
                                                Submit Task
                                            </button>

                                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-slate-400">
                                                <AlertCircle
                                                    size={15}
                                                    className="mt-0.5 shrink-0 text-slate-400"
                                                />
                                                <p>
                                                    Double-check your selected file before submitting.
                                                    Only one file can be attached at a time.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>

            {/* Confirm submission modal */}
            {confirmSubmit && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#06111D]/80 p-4 backdrop-blur-md">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.13] bg-[#0D1B2A] shadow-2xl">
                        <div className="border-b border-white/10 bg-gradient-to-r from-[#142A43] to-[#0D1B2A] px-6 py-5 text-white">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2]">
                                <Send size={23} />
                            </div>
                            <h3 className="mt-4 text-xl font-bold">
                                Confirm Submission
                            </h3>
                            <p className="mt-1 text-sm leading-5 text-blue-100">
                                Review your file before submitting your task.
                            </p>
                        </div>

                        <div className="p-6 text-slate-300">
                            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Task
                                </p>
                                <p className="mt-1 break-words text-sm font-bold text-white">
                                    {task.title}
                                </p>

                                <div className="mt-4">
                                    <StudentFileCard file={answerFile} disabled />
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-6 text-[#738396]">
                                Are you sure you want to submit this file?
                                You will not be able to change it from this workspace after submission.
                            </p>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setConfirmSubmit(false)}
                                    className={buttonSecondary}
                                >
                                    Review File
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmSubmission}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A9E5D2] px-4 py-2.5 text-sm font-bold text-[#10251F] shadow-sm transition hover:bg-[#C0F0E1]"
                                >
                                    <CheckCircle2 size={16} />
                                    Confirm Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submitted Successfully modal */}
            {submissionSuccess && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#0C1C2D]/70 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submission-success-title"
                        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.13] bg-[#0D1B2A] text-center text-slate-200 shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
                    >
                        <div className="bg-[#1B3553] px-6 pb-8 pt-7 text-white">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 shadow-lg">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DDF2E5] text-emerald-300">
                                    <Check size={32} strokeWidth={3} />
                                </div>
                            </div>

                            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100">
                                ACCENTRA · Submission Status
                            </p>

                            <h2
                                id="submission-success-title"
                                className="mt-2 text-2xl font-extrabold"
                            >
                                Submitted Successfully!
                            </h2>

                            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-blue-100">
                                Your completed work has been submitted for this task.
                            </p>
                        </div>

                        <div className="px-6 py-6">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2]">
                                        <CheckCircle2 size={21} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Task Submitted
                                        </p>
                                        <p className="mt-1 break-words text-sm font-bold text-white">
                                            {task.title}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {task.taskCode || "TSK-001"}
                                        </p>
                                    </div>
                                </div>

                                {answerFile && (
                                    <div className="mt-4">
                                        <StudentFileCard file={answerFile} disabled />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/[0.07] p-3 text-left">
                                <CheckCircle2
                                    size={17}
                                    className="mt-0.5 shrink-0 text-emerald-300"
                                />
                                <p className="text-xs leading-5 text-slate-300">
                                    Your submission status is now marked as Submitted.
                                    Keep a copy of your uploaded file for your records.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={finishSubmission}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B3553] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#142A43]"
                            >
                                <Check size={17} />
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --------------------------------------------------
// Main Student My Tasks page
// --------------------------------------------------

export default function StudentTasks() {
    const pageProps = usePage().props || {};
    const providedTasks = Array.isArray(pageProps.facultyTasks)
        ? pageProps.facultyTasks
        : Array.isArray(pageProps.databaseTasks)
          ? pageProps.databaseTasks
          : Array.isArray(pageProps.tasks)
            ? pageProps.tasks
            : Array.isArray(pageProps.tasks?.data)
              ? pageProps.tasks.data
              : null;
    const [tasks, setTasks] = useState(() => getAvailableFacultyTasks(providedTasks));
    const enrolledSubjects = Array.isArray(pageProps.enrolledSubjects) ? pageProps.enrolledSubjects.map((subject) => ({
        id: typeof subject === "string" ? subject : subject.id,
        code: typeof subject === "string" ? "" : (subject.code || subject.subject_code || ""),
        name: typeof subject === "string" ? subject : (subject.name || subject.subject_name || "Unnamed Subject"),
    })) : [];

    useEffect(() => {
        setTasks(getAvailableFacultyTasks(providedTasks));
    }, [pageProps.facultyTasks, pageProps.databaseTasks, pageProps.tasks]);

    const [searchValue, setSearchValue] = useState("");
    const [topicFilter, setTopicFilter] = useState("Select Subject");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [dateFilter, setDateFilter] = useState("All Dates");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTask, setSelectedTask] = useState(null);
    const [workspaceTask, setWorkspaceTask] = useState(null);
    const [currentDate, setCurrentDate] = useState(getToday);

    const itemsPerPage = 5;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentDate(getToday());
        }, 60000);

        return () => window.clearInterval(interval);
    }, []);

    const getTasksForSubject = (subject) => tasks.filter((task) =>
        getSubjectLabel(task).toLowerCase() ===
        String(subject.name || "").trim().toLowerCase()
    );

    const selectSubject = (subject) => {
        setTopicFilter(subject.name);
        setSearchValue("");
        setStatusFilter("All Status");
        setDateFilter("All Dates");
        setCurrentPage(1);
    };

    const topics = useMemo(() => {
        const uniqueTopics = [
            ...new Set([
                ...enrolledSubjects.map((subject) => subject.name),
                ...tasks.map((task) => getSubjectLabel(task)).filter(Boolean),
            ]),
        ];

        return uniqueTopics.sort((a, b) => a.localeCompare(b));
    }, [tasks, enrolledSubjects]);

    const counts = useMemo(() => {
        const statuses = tasks.map((task) => getTaskStatus(task, currentDate));

        return {
            total: tasks.length,
            pending: statuses.filter(
                (status) =>
                    status === "Not Started" || status === "In Progress",
            ).length,
            completed: statuses.filter((status) => status === "Submitted").length,
            overdue: statuses.filter((status) => status === "Overdue").length,
        };
    }, [tasks, currentDate]);

    const filteredTasks = useMemo(() => {
        const search = searchValue.trim().toLowerCase();

        return tasks.filter((task) => {
            const taskStatus = getTaskStatus(task, currentDate);

            const matchesSearch =
                !search ||
                [
                    task.title,
                    task.topic,
                    task.subject,
                    task.section,
                    task.description,
                    task.instructions,
                    getAttachmentName(task.attachment),
                    task.taskCode || "TSK-001",
                ].some((value) =>
                    String(value || "").toLowerCase().includes(search),
                );

            const matchesTopic =
                topicFilter === "All Topics" ||
                topicFilter === "Select Subject" ||
                getSubjectLabel(task).toLowerCase() === topicFilter.trim().toLowerCase();

            const matchesStatus =
                statusFilter === "All Status" || taskStatus === statusFilter;

            const dueDate = parseDate(task.dueDate || task.due);
            let matchesDate = true;

            if (dateFilter !== "All Dates") {
                if (!dueDate) {
                    matchesDate = false;
                } else {
                    const due = startOfDay(dueDate);
                    const today = currentDate;

                    if (dateFilter === "Due Today") {
                        matchesDate = isSameDay(due, today);
                    }

                    if (dateFilter === "Due This Week") {
                        const weekEnd = new Date(today);
                        weekEnd.setDate(today.getDate() + 7);
                        matchesDate = due >= today && due <= weekEnd;
                    }

                    if (dateFilter === "Due This Month") {
                        matchesDate =
                            due.getMonth() === today.getMonth() &&
                            due.getFullYear() === today.getFullYear();
                    }

                    if (dateFilter === "Overdue") {
                        matchesDate = due < today && taskStatus !== "Submitted";
                    }

                    if (dateFilter === "Upcoming") {
                        matchesDate = due > today && taskStatus !== "Submitted";
                    }
                }
            }

            return (
                matchesSearch &&
                matchesTopic &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [
        tasks,
        searchValue,
        topicFilter,
        statusFilter,
        dateFilter,
        currentDate,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTasks.length / itemsPerPage),
    );

    const safePage = Math.min(currentPage, totalPages);

    const paginatedTasks = filteredTasks.slice(
        (safePage - 1) * itemsPerPage,
        safePage * itemsPerPage,
    );

    const clearFilters = () => {
        setSearchValue("");
        setTopicFilter("Select Subject");
        setStatusFilter("All Status");
        setDateFilter("All Dates");
        setCurrentPage(1);
    };

    const hasFilters =
        searchValue !== "" ||
        topicFilter !== "All Topics" ||
        statusFilter !== "All Status" ||
        dateFilter !== "All Dates";

    const openTask = (task) => setSelectedTask(task);
    const closeTask = () => setSelectedTask(null);

    const handleStartTask = (task) => {
        if (!task || getTaskStatus(task, currentDate) === "Submitted") {
            return;
        }

        const updatedTask = {
            ...task,
            submissionStatus: "In Progress",
        };

        setTasks((currentTasks) =>
            currentTasks.map((item) =>
                item.id === task.id ? updatedTask : item,
            ),
        );

        sessionStorage.setItem(
            "accentra_active_task",
            JSON.stringify({
                id: updatedTask.id,
                title: updatedTask.title,
                submissionStatus: "In Progress",
            }),
        );

        setSelectedTask(null);

        router.visit(
            `/student/accounting/chart-of-accounts?openAddAccount=1&taskId=${encodeURIComponent(
                updatedTask.id,
            )}`,
        );
    };

    const handleSubmitTask = (task, answerFile, callbacks = {}) => {
        if (!task?.id || !answerFile) return;
        router.post(`/student/tasks/${task.id}/submit`, { attachment: answerFile }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const submittedTask = {
                    ...task,
                    answerFile,
                    submissionStatus: "Submitted",
                    submittedAt: new Date().toISOString(),
                };
                setTasks((current) => current.map((item) => item.id === task.id ? submittedTask : item));
                setWorkspaceTask(submittedTask);
                callbacks.onSuccess?.();
            },
            onError: (errors) => callbacks.onError?.(errors),
            onFinish: () => callbacks.onFinish?.(),
        });
    };

    return (
        <StudentLayout
            activeMenu="Tasks"
            showPageInfo={false}
            showSearch={false}
        >
            <div className="mx-auto w-full max-w-[1600px]">
                {/* Page heading */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9E5D2]">
                            Academic Management
                        </span>

                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Subjects
                        </h1>

                        <p className="mt-1 text-sm text-slate-400">
                            View tasks assigned by your faculty, review instructions,
                            and submit your work before the deadline.
                        </p>
                    </div>
                </div>

                {/* Enrolled subjects */}
                <section className="mb-6 rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-bold text-white">Enrolled Subjects</h2>
                            <p className="mt-1 text-xs text-slate-400">Tasks are shown for these accounting and business subjects.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setTopicFilter("All Topics");
                                    setSearchValue("");
                                    setStatusFilter("All Status");
                                    setDateFilter("All Dates");
                                    setCurrentPage(1);
                                }}
                                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#A9E5D2]/30 hover:bg-[#A9E5D2]/[0.06] hover:text-[#A9E5D2]"
                            >
                                View all tasks
                            </button>
                            <span className="rounded-full border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] px-3 py-1 text-[10px] font-bold text-[#A9E5D2]">{enrolledSubjects.length} Subjects</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {enrolledSubjects.map((subject) => {
                            const subjectTaskCount = getTasksForSubject(subject).length;
                            const isSelected = topicFilter === subject.name;
                            return (
                                <button
                                    key={subject.code}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => selectSubject(subject)}
                                    className={`rounded-xl border p-3.5 text-left transition ${isSelected ? "border-[#A9E5D2]/40 bg-[#A9E5D2]/[0.08] shadow-[0_0_0_1px_rgba(169,229,210,0.08)]" : "border-white/10 bg-[#091725]/60 hover:border-white/20 hover:bg-white/[0.04]"}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-bold tracking-wider text-[#A9E5D2]">{subject.code}</span>
                                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                                            {subjectTaskCount} {subjectTaskCount === 1 ? "task" : "tasks"}
                                        </span>
                                    </div>
                                    <span className="mt-1 block text-sm font-semibold text-slate-100">{subject.name}</span>
                                    <span className="mt-2 block text-xs text-slate-400">{isSelected ? "Showing subject tasks" : "Click to view tasks"}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {topicFilter === "Select Subject" && (
                    <section className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.16] bg-gradient-to-br from-white/[0.05] to-white/[0.015] px-6 py-12 text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] text-[#A9E5D2]">
                            <BookOpen size={25} />
                        </div>
                        <h2 className="text-base font-bold text-white">Select a subject to view tasks</h2>
                        <p className="mt-1 max-w-md text-sm text-slate-400">Choose one of your enrolled subjects above. Its assigned tasks, status, and deadlines will appear here.</p>
                    </section>
                )}

                {/* Task list */}
                <section className={`overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.07] to-white/[0.02] shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] ${topicFilter === "Select Subject" ? "hidden" : ""}`}>
                    <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0C1B2A]/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-bold text-white">
                                Task List
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400">
                                Tasks and deadlines posted by your faculty
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
                            <ClipboardList size={14} />
                            {filteredTasks.length}{" "}
                            {filteredTasks.length === 1 ? "task" : "tasks"}
                        </span>
                    </div>

                    {/* Search and filters */}
                    <div className="border-b border-white/10 bg-[#091725]/70 px-5 py-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_190px_190px]">
                            <div className="relative min-w-0">
                                <Search
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(event) => {
                                        setSearchValue(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search tasks or topics..."
                                    aria-label="Search tasks"
                                    className="w-full rounded-xl border border-white/10 bg-[#091725] py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-[#A9E5D2]/70"
                                />
                            </div>

                            <select
                                value={topicFilter}
                                onChange={(event) => {
                                    setTopicFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-white/10 bg-[#091725] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition hover:border-white/20 focus:border-[#A9E5D2]/70 focus:ring-2 focus:ring-[#A9E5D2]/10 [color-scheme:dark]"
                                aria-label="Filter by topic"
                            >
                                <option value="All Topics">All Topics</option>
                                {topics.map((topic) => (
                                    <option key={topic} value={topic}>
                                        {topic}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-white/10 bg-[#091725] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition hover:border-white/20 focus:border-[#A9E5D2]/70 focus:ring-2 focus:ring-[#A9E5D2]/10 [color-scheme:dark]"
                                aria-label="Filter by status"
                            >
                                {[
                                    "All Status",
                                    "Not Started",
                                    "In Progress",
                                    "Submitted",
                                    "Overdue",
                                ].map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(event) => {
                                    setDateFilter(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-xl border border-white/10 bg-[#091725] px-3.5 py-2.5 text-sm text-slate-100 outline-none transition hover:border-white/20 focus:border-[#A9E5D2]/70 focus:ring-2 focus:ring-[#A9E5D2]/10 [color-scheme:dark]"
                                aria-label="Filter by due date"
                            >
                                {[
                                    "All Dates",
                                    "Due Today",
                                    "Due This Week",
                                    "Due This Month",
                                    "Upcoming",
                                    "Overdue",
                                ].map((date) => (
                                    <option key={date} value={date}>
                                        {date}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Task table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1200px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.04]">
                                    {[
                                        "#",
                                        "Task Title",
                                        "Subject",
                                        "Date Posted",
                                        "Due Date",
                                        "Status",
                                        "Action",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-slate-400"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/[0.07]">
                                {paginatedTasks.map((task, index) => {
                                    const status = getTaskStatus(task, currentDate);
                                    const isSubmitted = status === "Submitted";
                                    const canContinue = isTaskInProgress(task);

                                    return (
                                        <tr
                                            key={task.id}
                                            className="group transition-colors hover:bg-white/[0.04]"
                                        >
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-400">
                                                {(safePage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/25 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="max-w-[250px] truncate text-sm font-semibold text-slate-100">
                                                            {task.title}
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-slate-400">
                                                            {task.taskCode || "TSK-001"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex min-w-[180px] flex-col gap-1">
                                                    <span className="text-[10px] font-bold tracking-wider text-[#A9E5D2]">{task.subjectCode || task.subject_code || ""}</span>
                                                    <span className="text-sm text-slate-300">{getSubjectLabel(task)}</span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#526579]">
                                                    <CalendarDays size={15} className="text-slate-400" />
                                                    {formatDate(getDatePosted(task))}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 whitespace-nowrap text-sm text-[#526579]">
                                                    <CalendarDays size={15} className="text-slate-400" />
                                                    {formatDate(task.dueDate)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status={status} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        title="View task details"
                                                        aria-label={`View ${task.title}`}
                                                        onClick={() => openTask(task)}
                                                       className="
                                                        flex h-8 w-8 shrink-0 items-center justify-center
                                                        rounded-lg border border-white/10 bg-white/[0.05]
                                                        text-slate-200 transition-all duration-200
                                                        hover:border-[#A9E5D2]/30 hover:bg-[#A9E5D2]/10 hover:text-[#A9E5D2]
                                                        active:scale-95
                                            "
                                                    >   
                                                        <Eye size={15} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title={
                                                            task.attachment
                                                                ? "Download faculty attachment"
                                                                : "No attachment available"
                                                        }
                                                        aria-label={`Download attachment for ${task.title}`}
                                                        disabled={!task.attachment}
                                                        onClick={() =>
                                                            downloadAttachment(task.attachment)
                                                        }
                                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-[#A9E5D2]/30 hover:bg-[#A9E5D2]/10 hover:text-[#A9E5D2] disabled:cursor-not-allowed disabled:opacity-30"
                                                    >
                                                        <Download size={15} />
                                                    </button>

                                                    {!isSubmitted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleStartTask(task)}
                                                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-[#A9E5D2]/30 bg-[#A9E5D2] px-3.5 py-2 text-xs font-bold text-[#10251F] shadow-sm transition-all duration-200 hover:border-[#C0F0E1] hover:bg-[#C0F0E1] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#A9E5D2]/40"
                                                        >
                                                            {canContinue ? (
                                                                <RotateCcw size={13} />
                                                            ) : (
                                                                <Play size={13} />
                                                            )}
                                                            {canContinue ? "Continue" : "Start Task"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {paginatedTasks.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-16 text-center">
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] text-[#A9E5D2]">
                                                {hasFilters ? (
                                                    <Search size={23} />
                                                ) : (
                                                    <ClipboardList size={23} />
                                                )}
                                            </div>

                                            <h3 className="mt-4 text-sm font-bold text-[#243A52]">
                                                {hasFilters
                                                    ? "No matching tasks found"
                                                    : "No tasks available"}
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
                                                {hasFilters
                                                    ? "Try changing your search or filters to find a task."
                                                    : "Active tasks assigned by your faculty will appear here."}
                                            </p>

                                            {hasFilters && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#294B70] hover:text-[#1B3553]"
                                                >
                                                    <RotateCcw size={14} />
                                                    Clear filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-3 border-t border-white/10 bg-[#0C1B2A]/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">
                            Showing{" "}
                            <strong className="font-semibold text-slate-100">
                                {filteredTasks.length === 0
                                    ? 0
                                    : (safePage - 1) * itemsPerPage + 1}
                            </strong>{" "}
                            to{" "}
                            <strong className="font-semibold text-slate-100">
                                {Math.min(safePage * itemsPerPage, filteredTasks.length)}
                            </strong>{" "}
                            of{" "}
                            <strong className="font-semibold text-slate-100">
                                {filteredTasks.length}
                            </strong>{" "}
                            tasks
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                aria-label="Previous page"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    setCurrentPage((page) => Math.max(1, page - 1))
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#A9E5D2]/25 hover:bg-[#A9E5D2]/[0.07] hover:text-[#A9E5D2] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={17} />
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-xs font-semibold ${
                                        page === safePage
                                            ? "border-[#1B3553] bg-[#1B3553] text-white shadow-sm"
                                            : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#A9E5D2]/25 hover:bg-[#A9E5D2]/[0.07] hover:text-[#A9E5D2]"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                type="button"
                                aria-label="Next page"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.min(totalPages, page + 1),
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#A9E5D2]/25 hover:bg-[#A9E5D2]/[0.07] hover:text-[#A9E5D2] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={17} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            <TaskDetailsModal
                task={selectedTask}
                today={currentDate}
                onClose={closeTask}
                onStart={handleStartTask}
            />

            {workspaceTask && (
                <TaskWorkspace
                    key={workspaceTask.id}
                    task={workspaceTask}
                    today={currentDate}
                    onClose={() => setWorkspaceTask(null)}
                    onSubmitTask={handleSubmitTask}
                />
            )}
        </StudentLayout>
    );
}