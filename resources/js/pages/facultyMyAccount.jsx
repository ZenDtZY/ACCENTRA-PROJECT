import { useRef, useState } from "react";
import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    CalendarDays,
    Clock,
    ShieldCheck,
    LockKeyhole,
    Camera,
    Eye,
    EyeOff,
    Save,
    BookOpen,
    Pencil,
    CheckCircle2,
    AlertCircle,
    AtSign,
    Building2,
    ImagePlus,
} from "lucide-react";
import FacultyLayout from "../components/layout/facultyLayout";

const initialFacultyData = {
    facultyId: "FCT-001",
    name: "Cai Soriano",
    email: "cai.soriano@accentra.com",
    contactNo: "09123456789",
    specialization: "Accounting",
    address: "Malolos, Bulacan",
    username: "cai.soriano",
    role: "Faculty Member",
    status: "Active",
    dateRegistered: "July 27, 2026",
    lastLogin: "October 19, 2026",
    assignedSections: ["BSAIS 11CA", "BSAIS 21CA"],
};

const panelClass =
    "min-w-0 overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] transition-all duration-300 hover:border-[#A9E5D2]/20";

const inputClass =
    "w-full rounded-xl border border-white/[0.10] bg-[#071522]/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#A9E5D2]/45 focus:ring-4 focus:ring-[#A9E5D2]/[0.07] disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
    "mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-300";

const buttonPrimary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#A9E5D2] px-4 py-2.5 text-sm font-semibold text-[#102B2B] shadow-[0_5px_20px_rgba(169,229,210,0.10)] transition duration-200 hover:bg-[#C1F1E2] disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.045] px-4 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-[#A9E5D2]/30 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

function SectionCard({
    icon: Icon,
    title,
    description,
    action,
    children,
    className = "",
}) {
    return (
        <section className={`${panelClass} ${className}`}>
            <div className="flex flex-col gap-4 border-b border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/15 bg-[#A9E5D2]/[0.08] text-[#A9E5D2]">
                        <Icon size={19} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {action}
            </div>

            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

function EditableField({
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    type = "text",
    required = false,
    rows,
}) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>
                {label}
                {required && <span className="ml-1 text-rose-400">*</span>}
            </label>

            <div className="relative">
                {Icon && (
                    <Icon
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-3.5 text-slate-500"
                    />
                )}

                {rows ? (
                    <textarea
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        rows={rows}
                        className={`${inputClass} resize-y ${Icon ? "pl-10" : ""}`}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        required={required}
                        className={`${inputClass} ${Icon ? "pl-10" : ""}`}
                    />
                )}
            </div>
        </div>
    );
}

function ReadOnlyField({ label, icon: Icon, value }) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>{label}</label>

            <div className="flex min-h-[46px] items-center gap-3 rounded-xl border border-white/[0.07] bg-[#071522]/55 px-3.5 py-3">
                {Icon && (
                    <Icon size={16} className="shrink-0 text-slate-500" />
                )}
                <span className="break-words text-sm text-slate-300">
                    {value || "—"}
                </span>
            </div>
        </div>
    );
}

function PasswordField({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
}) {
    return (
        <div className="min-w-0">
            <label className={labelClass}>{label}</label>

            <div className="relative">
                <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-3.5 text-slate-500"
                />

                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${inputClass} pl-10 pr-12`}
                    autoComplete="new-password"
                />

                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-[#A9E5D2]"
                >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            </div>
        </div>
    );
}

function MyAccount() {
    const [faculty, setFaculty] = useState(initialFacultyData);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordMessageType, setPasswordMessageType] = useState("");
    const fileInputRef = useRef(null);

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const updateFacultyField = (field, value) => {
        setFaculty((prev) => ({
            ...prev,
            [field]: value,
        }));
        setProfileMessage("");
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setProfileMessage("Please select a valid image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setProfileMessage("Image size must not exceed 5MB.");
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setProfileMessage("");
        };

        reader.readAsDataURL(file);
    };

    const handleProfileSubmit = (event) => {
        event.preventDefault();
        setProfileMessage("Profile information updated successfully.");
    };

    const updatePasswordField = (field, value) => {
        setPasswords((prev) => ({
            ...prev,
            [field]: value,
        }));
        setPasswordMessage("");
        setPasswordMessageType("");
    };

    const handlePasswordSubmit = (event) => {
        event.preventDefault();

        if (
            !passwords.currentPassword ||
            !passwords.newPassword ||
            !passwords.confirmPassword
        ) {
            setPasswordMessageType("error");
            setPasswordMessage("Please complete all password fields.");
            return;
        }

        if (passwords.newPassword.length < 8) {
            setPasswordMessageType("error");
            setPasswordMessage(
                "Your new password must be at least 8 characters long."
            );
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordMessageType("error");
            setPasswordMessage("Your new passwords do not match.");
            return;
        }
    
        setPasswordMessageType("success");
        setPasswordMessage("Password updated successfully.");

        setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const getInitials = (name) =>
        name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    return (
                    <FacultyLayout 
                    showPageInfo={false}
                    showSearch={false}
                    activeMenu="My Account"> 

              <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8 text-white">
                {/* Page heading */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#A9E5D2]">
                            Faculty Workspace
                        </span>

                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            My Account
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                            Manage your faculty profile, review account
                            information, and maintain your account security.
                        </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3.5 py-2.5 text-xs font-medium text-emerald-300">
                        <ShieldCheck size={16} />
                        Secure Faculty Account
                    </div>
                </div>
                                                               
                {/* Profile cover */}
                <section className={`${panelClass} relative`}>
                    <div className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-br from-[#1B4B4A]/55 via-[#163345]/65 to-[#101D30]/80 px-5 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
                        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-[#A9E5D2]/[0.08] blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-teal-500/[0.08] blur-3xl" />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="relative w-fit shrink-0">
                                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#A9E5D2]/35 bg-[#071522] text-2xl font-bold text-[#A9E5D2] shadow-[0_12px_35px_rgba(0,0,0,0.30)] sm:h-28 sm:w-28 sm:text-3xl">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Faculty profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            getInitials(faculty.name)
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        aria-label="Change profile picture"
                                        className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#A9E5D2]/30 bg-[#A9E5D2] text-[#102B2B] shadow-lg transition hover:scale-105 hover:bg-[#C1F1E2]"
                                    >
                                        <Camera size={17} />
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A9E5D2]/80">
                                        Faculty Profile
                                    </p>

                                    <h2 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                        {faculty.name}
                                    </h2>

                                    <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm text-slate-300">
                                        <Mail
                                            size={15}
                                            className="shrink-0 text-[#A9E5D2]"
                                        />
                                        {faculty.email}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-slate-200">
                                            {faculty.facultyId}
                                        </span>

                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {faculty.status}
                                        </span>

                                        <span className="rounded-lg border border-[#A9E5D2]/15 bg-[#A9E5D2]/[0.06] px-2.5 py-1 text-xs font-medium text-[#A9E5D2]">
                                            {faculty.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    document
                                        .getElementById("personal-information")
                                        ?.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        })
                                }
                                className={`${buttonSecondary} shrink-0 self-start lg:self-center`}
                            >
                                <Pencil size={15} />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                        <div className="flex items-center gap-3 p-5 sm:px-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/15 bg-[#A9E5D2]/[0.07] text-[#A9E5D2]">
                                <GraduationCap size={19} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                    Specialization
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-white">
                                    {faculty.specialization || "Not specified"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-5 sm:px-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.07] text-sky-300">
                                <BookOpen size={19} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                    Assigned Sections
                                </p>
                                <p className="mt-1 text-sm font-semibold text-white">
                                    {faculty.assignedSections.length} Sections
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-5 sm:px-6">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07] text-violet-300">
                                <CalendarDays size={19} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                                    Member Since
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-white">
                                    {faculty.dateRegistered}
                                </p>
                            </div>
                        </div>
                    </div>

                </section>

                {/* Personal information */}
                <div id="personal-information" className="scroll-mt-6">
                    <SectionCard
                        icon={UserRound}
                        title="Personal Information"
                        description="Update your personal details and contact information."
                        
                    >
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Faculty ID
                                    </label>
                                    <div className="relative">
                                        <UserRound
                                            size={17}
                                            className="pointer-events-none absolute left-3.5 top-3.5 text-slate-500"
                                        />
                                        <input
                                            type="text"
                                            value={faculty.facultyId}
                                            disabled
                                            className={`${inputClass} pl-10`}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        Faculty ID cannot be changed.
                                    </p>
                                </div>

                                <EditableField
                                    label="Full Name"
                                    icon={UserRound}
                                    value={faculty.name}
                                    onChange={(e) =>
                                        updateFacultyField("name", e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                    required
                                />

                                <EditableField
                                    label="Email Address"
                                    icon={Mail}
                                    type="email"
                                    value={faculty.email}
                                    onChange={(e) =>
                                        updateFacultyField("email", e.target.value)
                                    }
                                    placeholder="Enter your email address"
                                    required
                                />

                                <EditableField
                                    label="Contact Number"
                                    icon={Phone}
                                    value={faculty.contactNo}
                                    onChange={(e) =>
                                        updateFacultyField(
                                            "contactNo",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your contact number"
                                />

                                <EditableField
                                    label="Specialization"
                                    icon={GraduationCap}
                                    value={faculty.specialization}
                                    onChange={(e) =>
                                        updateFacultyField(
                                            "specialization",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your specialization"
                                />

                                <EditableField
                                    label="Address"
                                    icon={MapPin}
                                    value={faculty.address}
                                    onChange={(e) =>
                                        updateFacultyField("address", e.target.value)
                                    }
                                    placeholder="Enter your address"
                                />
                            </div>

                            {profileMessage && (
                                <div
                                    role="status"
                                    className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                                        profileMessage.toLowerCase().includes("success")
                                            ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                                            : "border-amber-400/20 bg-amber-400/[0.07] text-amber-200"
                                    }`}
                                >
                                    {profileMessage.toLowerCase().includes("success") ? (
                                        <CheckCircle2
                                            size={17}
                                            className="mt-0.5 shrink-0"
                                        />
                                    ) : (
                                        <AlertCircle
                                            size={17}
                                            className="mt-0.5 shrink-0"
                                        />
                                    )}
                                    <span>{profileMessage}</span>
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFaculty(initialFacultyData);
                                        setProfileMessage("");
                                    }}
                                    className={buttonSecondary}
                                >
                                    Reset Changes
                                </button>

                                <button type="submit" className={buttonPrimary}>
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </SectionCard>
                </div>

                {/* Account information */}
                <SectionCard
                    icon={ShieldCheck}
                    title="Account Information"
                    description="Review your account details and assigned teaching sections."
                >
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <ReadOnlyField
                            label="Username"
                            icon={AtSign}
                            value={faculty.username}
                        />
                        <ReadOnlyField
                            label="Role"
                            icon={ShieldCheck}
                            value={faculty.role}
                        />
                        <ReadOnlyField
                            label="Account Status"
                            icon={CheckCircle2}
                            value={faculty.status}
                        />
                        <ReadOnlyField
                            label="Date Registered"
                            icon={CalendarDays}
                            value={faculty.dateRegistered}
                        />
                        <ReadOnlyField
                            label="Last Login"
                            icon={Clock}
                            value={faculty.lastLogin}
                        />
                        <ReadOnlyField
                            label="Account Type"
                            icon={Building2}
                            value="Faculty Account"
                        />
                    </div>

                    <div className="mt-7 border-t border-white/[0.08] pt-6">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/[0.07] text-sky-300">
                                <BookOpen size={17} />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">
                                    Assigned Sections
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Sections currently assigned to your account.
                                </p>
                            </div>
                        </div>

                        {faculty.assignedSections.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {faculty.assignedSections.map((section, index) => (
                                    <div
                                        key={`${section}-${index}`}
                                        className="flex items-center gap-3 rounded-xl border border-white/[0.09] bg-white/[0.025] p-4 transition hover:border-[#A9E5D2]/20 hover:bg-white/[0.045]"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#A9E5D2]/15 bg-[#A9E5D2]/[0.07] text-[#A9E5D2]">
                                            <BookOpen size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-white">
                                                {section}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Assigned section
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-8 text-center">
                                <BookOpen
                                    size={24}
                                    className="mx-auto text-slate-500"
                                />
                                <p className="mt-2 text-sm font-medium text-slate-300">
                                    No assigned sections
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Your assigned sections will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* Change password */}
                <SectionCard
                    icon={LockKeyhole}
                    title="Change Password"
                    description="Keep your account secure by using a strong password."
                    action={
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200">
                            <ShieldCheck size={12} />
                            Security
                        </span>
                    }
                >
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <PasswordField
                                label="Current Password"
                                value={passwords.currentPassword}
                                onChange={(e) =>
                                    updatePasswordField(
                                        "currentPassword",
                                        e.target.value
                                    )
                                }
                                show={showPasswords.currentPassword}
                                onToggle={() =>
                                    togglePasswordVisibility("currentPassword")
                                }
                                placeholder="Enter current password"
                            />

                            <div className="hidden md:block" />

                            <PasswordField
                                label="New Password"
                                value={passwords.newPassword}
                                onChange={(e) =>
                                    updatePasswordField(
                                        "newPassword",
                                        e.target.value
                                    )
                                }
                                show={showPasswords.newPassword}
                                onToggle={() =>
                                    togglePasswordVisibility("newPassword")
                                }
                                placeholder="Enter new password"
                            />

                            <PasswordField
                                label="Confirm New Password"
                                value={passwords.confirmPassword}
                                onChange={(e) =>
                                    updatePasswordField(
                                        "confirmPassword",
                                        e.target.value
                                    )
                                }
                                show={showPasswords.confirmPassword}
                                onToggle={() =>
                                    togglePasswordVisibility("confirmPassword")
                                }
                                placeholder="Re-enter new password"
                            />
                        </div>

                        {passwordMessage && (
                            <div
                                role="status"
                                className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                                    passwordMessageType === "success"
                                        ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300"
                                        : "border-rose-400/20 bg-rose-400/[0.07] text-rose-300"
                                }`}
                            >
                                {passwordMessageType === "success" ? (
                                    <CheckCircle2
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                    />
                                ) : (
                                    <AlertCircle
                                        size={17}
                                        className="mt-0.5 shrink-0"
                                    />
                                )}
                                <span>{passwordMessage}</span>
                            </div>
                        )}

                        <div className="flex justify-end border-t border-white/[0.08] pt-5">
                            <button type="submit" className={buttonPrimary}>
                                <LockKeyhole size={16} />
                                Update Password
                            </button>
                        </div>
                    </form>
                </SectionCard>

               </div>
        </FacultyLayout>
    );
}

export default MyAccount;
