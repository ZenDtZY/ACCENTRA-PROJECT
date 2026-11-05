import { useState } from "react";

import { Head, useForm, usePage } from "@inertiajs/react";


function FieldIcon({ type }) {

    if (type === "email") {

        return (

            <svg

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                strokeWidth="1.6"

                className="h-5 w-5"

                aria-hidden="true"

            >

                <rect x="3" y="4" width="18" height="16" rx="3" />

                <circle cx="8" cy="10" r="2" />

                <path d="M5.5 15a2.5 2.5 0 0 1 5 0" />

                <path d="M13 9h4M13 13h4M13 16h3" />

            </svg>

        );

    }

    return (

        <svg

            viewBox="0 0 24 24"

            fill="none"

            stroke="currentColor"

            strokeWidth="1.6"

            className="h-5 w-5"

            aria-hidden="true"

        >

            <rect x="5" y="10" width="14" height="11" rx="2.5" />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />

            <path d="M12 14v3" />

        </svg>

    );

}

export default function StudentLogin({ status }) {
    const { flash = {} } = usePage().props;
    const loginStatus = status || flash.success;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({

        email: "",

        password: "",

        remember: false,

    });

    const handleSubmit = (e) => {

        e.preventDefault();

        post("/student/login", {

            preserveScroll: true,

            onFinish: () => reset("password"),

        });

    };

    return (

        <>

            <Head title="Student Log In | ACCENTRA" />

            <main className="relative min-h-screen overflow-hidden bg-[#101F30] font-sans text-white selection:bg-[#8FD6BF]/30">

                {/* Background */}

                <div

                    className="absolute inset-0 scale-[1.02] bg-cover bg-center"

                    style={{

                        backgroundImage: "url('/images/login-bg.jpg')",

                    }}

                />

                {/* Cinematic overlays */}

                <div className="absolute inset-0 bg-[#10243A]/55" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#10243A]/90 via-[#10243A]/65 to-[#10243A]/30" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071522]/70 via-transparent to-[#071522]/20" />

                {/* Ambient green lighting */}

                <div className="pointer-events-none absolute -left-40 top-1/4 h-[450px] w-[450px] rounded-full bg-[#477F73]/25 blur-[140px]" />

                <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#75B8A6]/15 blur-[150px]" />

                {/* Subtle decorative grid */}

                <div

                    className="pointer-events-none absolute inset-0 opacity-[0.06]"

                    style={{

                        backgroundImage:

                            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",

                        backgroundSize: "80px 80px",

                    }}

                />

                <div className="relative z-10 mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-10 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-16 xl:px-24">

                    {/* Left branding */}

                    <section className="flex flex-col justify-center py-5 lg:-translate-y-6 lg:py-6">

                        <a

                            href="/"

                            aria-label="ACCENTRA home"

                            className="mb-10 flex w-fit items-center gap-3 sm:mb-12"

                        >

                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 transition duration-300 hover:scale-110">
                                <img
                                    src="/images/accentra-logoo.png"
                                    alt="ACCENTRA Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <span className="text-2xl font-semibold tracking-[0.2em] sm:text-3xl">

                                ACCENTRA

                            </span>

                        </a>

                        <div className="mb-5 flex items-center gap-3">

                            <span className="h-px w-9 bg-[#9CD6C5]" />

                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A9E5D2] sm:text-sm">

                                Accounting Information System

                            </p>

                        </div>

                        <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl xl:text-7xl">

                            Learn accounting

                            <span className="mt-2 block whitespace-nowrap bg-gradient-to-r from-[#B7E8D9] via-[#8FD6BF] to-[#65B49E] bg-clip-text pb-2 text-transparent">

                                Build your future

                            </span>

                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg">

                            Welcome to the ACCENTRA student portal. Access

                            your lessons, complete accounting tasks, submit

                            your work, and monitor your learning progress.

                        </p>

                    </section>

                    {/* Login card */}

                    <section className="mx-auto w-full max-w-[500px] lg:ml-auto">

                        <div className="relative overflow-hidden rounded-[28px] border border-white/25 bg-[#172B3C]/45 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-10 lg:p-11">

                            {/* Card highlight */}

                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

                            <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#75B8A6]/10 blur-[70px]" />

                            <div className="relative mb-8">

                                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#9CD6C5]/30 bg-[#9CD6C5]/10 text-[#A9E5D2]">

                                    <svg

                                        viewBox="0 0 24 24"

                                        fill="none"

                                        stroke="currentColor"

                                        strokeWidth="1.6"

                                        className="h-6 w-6"

                                        aria-hidden="true"

                                    >

                                        <path d="M15 3h6v6" />

                                        <path d="M10 14 21 3" />

                                        <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />

                                    </svg>

                                </div>

                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#A9E5D2]">

                                    Student Portal

                                </p>

                                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">

                                    Welcome Back

                                </h2>

                                <p className="mt-3 text-sm leading-6 text-white/65">

                                    Log in to your account to access your

                                    student dashboard.

                                </p>

                            </div>

                            {loginStatus && (

                                <div

                                    role="status"

                                    className="mb-5 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100"

                                >

                                    {loginStatus}

                                </div>

                            )}

                            <form

                                onSubmit={handleSubmit}

                                className="relative space-y-5"

                            >

                                {/* Email or Student Number */}

                                <div>

                                    <label

                                        htmlFor="email"

                                        className="mb-2.5 block text-sm font-medium text-white/90"

                                    >

                                        Student ID or Email:

                                    </label>

                                    <div

                                        className={`flex items-center rounded-xl border bg-[#071522]/25 transition duration-200 focus-within:bg-[#071522]/40 ${

                                            errors.email

                                                ? "border-red-300/80 focus-within:border-red-300"

                                                : "border-white/15 focus-within:border-[#9CD6C5]/70"

                                        }`}

                                    >

                                        <span className="pl-4 text-white/55">

                                            <FieldIcon type="email" />

                                        </span>

                                        <input

                                            id="email"

                                            type="text"

                                            name="email"

                                            autoComplete="username"

                                            autoFocus

                                            required

                                            value={data.email}

                                            onChange={(e) =>

                                                setData("email", e.target.value)

                                            }

                                            placeholder="Enter your student ID or email"

                                            aria-invalid={Boolean(errors.email)}

                                            aria-describedby={

                                                errors.email

                                                    ? "email-error"

                                                    : undefined

                                            }

                                            className="w-full border-0 bg-transparent px-3.5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:ring-0"

                                        />

                                    </div>

                                    {errors.email && (

                                        <p

                                            id="email-error"

                                            role="alert"

                                            className="mt-2 text-sm text-red-200"

                                        >

                                            {errors.email}

                                        </p>

                                    )}

                                </div>

                                {/* Password */}

                                <div>

                                    <label

                                        htmlFor="password"

                                        className="mb-2.5 block text-sm font-medium text-white/90"

                                    >

                                        Password:

                                    </label>

                                    <div

                                        className={`flex items-center rounded-xl border bg-[#071522]/25 transition duration-200 focus-within:bg-[#071522]/40 ${

                                            errors.password

                                                ? "border-red-300/80 focus-within:border-red-300"

                                                : "border-white/15 focus-within:border-[#9CD6C5]/70"

                                        }`}

                                    >

                                        <span className="pl-4 text-white/55">

                                            <FieldIcon type="password" />

                                        </span>

                                        <input

                                            id="password"

                                            type={

                                                showPassword

                                                    ? "text"

                                                    : "password"

                                            }

                                            name="password"

                                            autoComplete="current-password"

                                            required

                                            value={data.password}

                                            onChange={(e) =>

                                                setData(

                                                    "password",

                                                    e.target.value,

                                                )

                                            }

                                            placeholder="Enter your password"

                                            aria-invalid={Boolean(

                                                errors.password,

                                            )}

                                            aria-describedby={

                                                errors.password

                                                    ? "password-error"

                                                    : undefined

                                            }

                                            className="w-full border-0 bg-transparent px-3.5 py-4 text-sm text-white outline-none placeholder:text-white/35 focus:ring-0"

                                        />

                                        <button

                                            type="button"

                                            onClick={() =>

                                                setShowPassword(

                                                    (current) => !current,

                                                )

                                            }

                                            aria-label={

                                                showPassword

                                                    ? "Hide password"

                                                    : "Show password"

                                            }

                                            aria-pressed={showPassword}

                                            className="mr-2 flex items-center justify-center rounded-lg p-2 text-white/50 transition hover:text-[#A9E5D2] focus:outline-none focus:ring-2 focus:ring-[#9CD6C5]/50"

                                        >

                                            {showPassword ? (

                                                <svg

                                                    viewBox="0 0 24 24"

                                                    fill="none"

                                                    stroke="currentColor"

                                                    strokeWidth="1.7"

                                                    strokeLinecap="round"

                                                    strokeLinejoin="round"

                                                    className="h-5 w-5"

                                                    aria-hidden="true"

                                                >

                                                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />

                                                    <circle cx="12" cy="12" r="3" />

                                                </svg>

                                            ) : (

                                                <svg

                                                    viewBox="0 0 24 24"

                                                    fill="none"

                                                    stroke="currentColor"

                                                    strokeWidth="1.7"

                                                    strokeLinecap="round"

                                                    strokeLinejoin="round"

                                                    className="h-5 w-5"

                                                    aria-hidden="true"

                                                >

                                                    <path d="m3 3 18 18" />

                                                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

                                                    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9" />

                                                    <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.3 0 2.5-.3 3.6-.8" />

                                                </svg>

                                            )}

                                        </button>

                                    </div>

                                    {errors.password && (

                                        <p

                                            id="password-error"

                                            role="alert"

                                            className="mt-2 text-sm text-red-200"

                                        >

                                            {errors.password}

                                        </p>

                                    )}

                                </div>

                                {/* Remember and forgot password */}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm">

                                    <label className="flex cursor-pointer items-center gap-2.5 text-white/75">

                                        <input

                                            type="checkbox"

                                            name="remember"

                                            checked={data.remember}

                                            onChange={(e) =>

                                                setData(

                                                    "remember",

                                                    e.target.checked,

                                                )

                                            }

                                            className="h-4 w-4 rounded border-white/30 bg-white/10 text-[#528F80] focus:ring-[#9CD6C5] focus:ring-offset-0"

                                        />

                                        Remember me

                                    </label>

                                    <a

                                        href="/student/forgot-password"

                                        className="font-medium text-[#A9E5D2] underline-offset-4 transition hover:text-white hover:underline"

                                    >

                                        Forgot password?

                                    </a>

                                </div>

                                {/* Submit */}

                                <button

                                    type="submit"

                                    disabled={processing}

                                    className="group flex w-full items-center justify-center gap-3 rounded-xl border border-[#B7E8D9]/40 bg-gradient-to-r from-[#477F73] to-[#528F80] px-5 py-4 font-semibold text-white shadow-[0_8px_25px_rgba(40,100,85,0.25)] transition duration-300 hover:-translate-y-0.5 hover:from-[#548F80] hover:to-[#65A795] hover:shadow-[0_12px_32px_rgba(40,100,85,0.35)] focus:outline-none focus:ring-2 focus:ring-[#A9E5D2] focus:ring-offset-2 focus:ring-offset-[#172B3C] disabled:cursor-not-allowed disabled:opacity-60"

                                >

                                    <span>

                                        {processing

                                            ? "Logging in..."

                                            : "Log In"}

                                    </span>

                                    {!processing && (

                                        <svg

                                            viewBox="0 0 24 24"

                                            fill="none"

                                            stroke="currentColor"

                                            strokeWidth="1.8"

                                            className="h-5 w-5 transition-transform group-hover:translate-x-1"

                                            aria-hidden="true"

                                        >

                                            <path d="M5 12h14" />

                                            <path d="m13 6 6 6-6 6" />

                                        </svg>

                                    )}

                                </button>

                            </form>

                            {/* Card footer */}

                            <div className="mt-8 border-t border-white/15 pt-6">

                                <div className="flex items-center justify-center gap-2 text-center text-xs text-white/55">

                                    <svg

                                        viewBox="0 0 24 24"

                                        fill="none"

                                        stroke="currentColor"

                                        strokeWidth="1.5"

                                        className="h-4 w-4 shrink-0 text-[#9CD6C5]"

                                        aria-hidden="true"

                                    >

                                        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />

                                        <path d="m9 12 2 2 4-4" />

                                    </svg>

                                    <span>

                                        This portal is exclusively for

                                        authorized ACCENTRA students.

                                    </span>

                                </div>

                            </div>

                        </div>

                        <p className="mt-6 text-center text-xs text-white/50">

                            © {new Date().getFullYear()} ACCENTRA. All rights

                            reserved.

                        </p>

                    </section>

                </div>

            </main>

        </>

        );

}
