import { Head, useForm } from "@inertiajs/react";

import {

    Mail,

    ArrowRight,

    CheckCircle2,

    CircleAlert,

    LockKeyhole,

} from "lucide-react";



export default function FacultyForgotPassword() {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        email: "",
    });
    const submitted = wasSuccessful;
    const message =
        "If the address is registered, check your inbox for password reset instructions.";
    const error = errors.email;
    const email = data.email;

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/faculty/forgot-password/send-link", { preserveScroll: true });
    };

    const inputClass = `w-full rounded-xl border bg-[#071522]/25 py-4 pl-12 pr-4

        text-sm text-white outline-none transition duration-200

        placeholder:text-white/35 focus:bg-[#071522]/40

        ${

            error

                ? "border-red-300/80 focus:border-red-300"

                : "border-white/15 focus:border-[#9CD6C5]/70"

        }`;



    return (

        <>

            <Head title="Forgot Password | ACCENTRA Faculty" />



            <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#101F30] font-sans text-white selection:bg-[#8FD6BF]/30">

                <div

                    className="absolute inset-0 scale-[1.02] bg-cover bg-center"

                    style={{

                        backgroundImage: "url('/images/login-bg.jpg')",

                    }}

                />



                <div className="absolute inset-0 bg-[#10243A]/60" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#10243A]/90 via-[#10243A]/65 to-[#10243A]/40" />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071522]/75 via-transparent to-[#071522]/30" />



                <div className="pointer-events-none absolute -left-40 top-1/4 h-[450px] w-[450px] rounded-full bg-[#477F73]/25 blur-[140px]" />

                <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#75B8A6]/15 blur-[150px]" />



                <div

                    className="pointer-events-none absolute inset-0 opacity-[0.06]"

                    style={{

                        backgroundImage:

                            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",

                        backgroundSize: "80px 80px",

                    }}

                />



                <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">

                    <a

                        href="/faculty/login"

                        aria-label="ACCENTRA Faculty Login"

                        className="flex w-fit items-center gap-3"

                    >
                       <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 transition duration-300 hover:scale-110">
                            <img
                                src="/images/accentra-logoo.png"
                                alt="ACCENTRA Logo"
                                className="h-full w-full object-contain"
                                
                            />
                        </div>



                        <div>

                            <span className="text-xl font-semibold tracking-[0.2em] text-white sm:text-2xl">

                                ACCENTRA

                            </span>

                            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">

                                Accounting Information System

                            </p>

                        </div>

                    </a>



                    <div className="hidden items-center gap-2 text-xs font-medium text-white/60 sm:flex">

                        <LockKeyhole

                            size={15}

                            className="text-[#A9E5D2]"

                        />

                        Secure Account Recovery

                    </div>

                </header>



                <section className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8">

                    <div className="w-full max-w-[480px]">

                        <div className="relative overflow-hidden rounded-[28px] border border-white/25 bg-[#172B3C]/50 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-10">

                            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

                            <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#75B8A6]/10 blur-[70px]" />



                            <div className="relative">

                                <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9CD6C5]/30 bg-[#9CD6C5]/10 text-[#A9E5D2]">

                                    {submitted ? (

                                        <CheckCircle2

                                            size={27}

                                            strokeWidth={1.7}

                                        />

                                    ) : (

                                        <Mail

                                            size={27}

                                            strokeWidth={1.7}

                                        />

                                    )}

                                </div>



                                {submitted ? (

                                    <>

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#A9E5D2]">

                                            Faculty Account Recovery

                                        </p>



                                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">

                                            Request Submitted

                                        </h1>



                                        <p className="mt-4 text-sm leading-7 text-white/65">

                                            Your password reset request has been submitted successfully. Please follow the instructions provided to regain access to your account.

                                        </p>



                                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#9CD6C5]/20 bg-[#9CD6C5]/10 p-4">

                                            <CheckCircle2

                                                size={18}

                                                className="mt-0.5 shrink-0 text-[#A9E5D2]"

                                            />



                                            <p className="break-all text-sm leading-6 text-white/75">

                                                Email address:{" "}

                                                <span className="font-semibold text-white">

                                                    {email}

                                                </span>

                                            </p>

                                        </div>



                                        <p className="mt-4 text-xs leading-5 text-white/50">

                                            {message}

                                        </p>



                                        <a

                                            href="/faculty/login"

                                            className="group mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-[#B7E8D9]/40 bg-gradient-to-r from-[#477F73] to-[#528F80] px-5 py-4 font-semibold text-white shadow-[0_8px_25px_rgba(40,100,85,0.25)] transition duration-300 hover:-translate-y-0.5 hover:from-[#548F80] hover:to-[#65A795] focus:outline-none focus:ring-2 focus:ring-[#A9E5D2]"

                                        >

                                            Return to Faculty Login

                                            <ArrowRight

                                                size={18}

                                                className="transition-transform group-hover:translate-x-1"

                                            />

                                        </a>

                                    </>

                                ) : (

                                    <>

                                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#A9E5D2]">

                                            Faculty Portal

                                        </p>



                                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">

                                            Forgot Password?

                                        </h1>



                                        <p className="mt-4 text-sm leading-7 text-white/65">

                                            Enter the email address associated

                                            with your faculty account to

                                            initiate a password recovery

                                            request. Ensure that the information

                                            provided is accurate.

                                        </p>



                                        <form

                                            onSubmit={handleSubmit}

                                            className="mt-8"

                                        >

                                            <label

                                                htmlFor="email"

                                                className="mb-2.5 block text-sm font-medium text-white/90"

                                            >

                                                Email Address

                                            </label>



                                            <div className="relative">

                                                <Mail

                                                    size={19}

                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45"

                                                    aria-hidden="true"

                                                />



                                                <input

                                                    id="email"

                                                    name="email"

                                                    type="email"

                                                    autoComplete="email"

                                                    autoFocus

                                                    placeholder="you@accentra.com"

                                                    value={data.email}
                                                    onChange={(event) =>
                                                        setData("email", event.target.value)
                                                    }
                                                    required

                                                    className={inputClass}

                                                    aria-invalid={Boolean(error)}

                                                    aria-describedby={

                                                        error

                                                            ? "email-error"

                                                            : undefined

                                                    }

                                                />

                                            </div>



                                            {error && (

                                                <p

                                                    id="email-error"

                                                    role="alert"

                                                    className="mt-2 flex items-center gap-2 text-sm text-red-200"

                                                >

                                                    <CircleAlert size={15} />

                                                    {error}

                                                </p>

                                            )}



                                            <button

                                                type="submit"
                                                disabled={processing}

                                                className="group mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-[#B7E8D9]/40 bg-gradient-to-r from-[#477F73] to-[#528F80] px-5 py-4 font-semibold text-white shadow-[0_8px_25px_rgba(40,100,85,0.25)] transition duration-300 hover:-translate-y-0.5 hover:from-[#548F80] hover:to-[#65A795] hover:shadow-[0_12px_32px_rgba(40,100,85,0.35)] focus:outline-none focus:ring-2 focus:ring-[#A9E5D2] focus:ring-offset-2 focus:ring-offset-[#172B3C]"

                                            >

                                                {processing ? "Sending..." : "Send Recovery Email"}

                                                <ArrowRight

                                                    size={18}

                                                    className="transition-transform duration-200 group-hover:translate-x-1"

                                                />

                                            </button>

                                        </form>



                                        <div className="mt-7 border-t border-white/15 pt-6 text-center">

                                            <a

                                                href="/faculty/login"

                                                className="inline-flex items-center gap-2 text-sm font-medium text-white/65 transition hover:text-[#A9E5D2]"

                                            >

                                                <ArrowRight

                                                    size={15}

                                                    className="rotate-180"

                                                />

                                                Back to Faculty Login

                                            </a>

                                        </div>

                                    </>

                                )}

                            </div>

                        </div>



                        <div className="mt-6 flex items-start justify-center gap-3 px-2">

                            <LockKeyhole

                                size={16}

                                className="mt-0.5 shrink-0 text-[#A9E5D2]/70"

                            />



                            <p className="max-w-sm text-xs leading-5 text-white/50">

                                For your security, use only the email address

                                associated with your ACCENTRA faculty account.

                            </p>

                        </div>

                    </div>

                </section>

            </main>

        </>
    );
}
