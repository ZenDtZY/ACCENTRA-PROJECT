import { useRef, useState } from 'react';

import { usePage } from '@inertiajs/react';

import Icon from '../common/icon';

import SystemLogo from '../common/systemLogo';

const menuItems = [

    {

        label: 'Dashboard',

        icon: 'layout-dashboard',

        path: '/student/dashboard',

    },

    

    

    {

        label: 'My Tasks',

        icon: 'clipboard-list',

        path: '/student/tasks',

    },

];

const accountingItems = [

    {

        label: 'Chart of Accounts',

        icon: 'book-open',

        path: '/student/accounting/chart-of-accounts',

    },

    {

        label: 'Journal Entries',

        icon: 'notebook-pen',

        path: '/student/accounting/journal-entries',

    },

    {

        label: 'General Ledger',

        icon: 'book-copy',

        path: '/student/accounting/general-ledger',

    },

    {

        label: 'Trial Balance',

        icon: 'scale',

        path: '/student/accounting/trial-balance',

    },

    {

        label: 'Income Sheet',

        icon: 'chart-no-axes-column',

        path: '/student/accounting/income-sheet',

    },

    {

        label: 'Balance Sheet',

        icon: 'landmark',

        path: '/student/accounting/balance-sheet',

    },

];

const bottomMenuItems = [

    {

        label: 'Submissions',

        icon: 'folder-check',

        path: '/student/submissions',

    },

    {

        label: 'Results',

        icon: 'chart-no-axes-column',

        path: '/student/results',

    },

    {

        label: 'My Account',

        icon: 'user-round',

        path: '/student/account',

    },

];

export default function StudentSidebar({

    activeMenu = 'Dashboard',

    onMenuChange,

    open = false,

}) {

    const { csrfToken } = usePage().props;

    const logoutFormRef = useRef(null);

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [accountingOpen, setAccountingOpen] = useState(() =>

        accountingItems.some((item) => item.label === activeMenu),

    );

    const handleNavigation = (event, item) => {

        event.preventDefault();

        onMenuChange?.(item.label);

        if (item.path) {

            window.location.href = item.path;

        }

    };

    const itemClasses = (active) =>

        `group relative flex w-full items-center gap-3 rounded-xl

    px-4 py-3 text-sm font-medium transition-all duration-200

    ${

        active

            ? 'border border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-[0_4px_20px_rgba(169,229,210,0.08)]'

            : 'border border-transparent text-white/65 hover:border-[#A9E5D2]/20 hover:bg-[#A9E5D2]/[0.09] hover:text-[#A9E5D2]'

    }`;

    const confirmLogout = () => {

        if (isLoggingOut) return;

        setIsLoggingOut(true);

        logoutFormRef.current?.requestSubmit();

    };

    const renderMenuItem = (item) => {

        const active = activeMenu === item.label;

        return (

            <a

                href={item.path}

                key={item.label}

                aria-current={active ? 'page' : undefined}

                className={itemClasses(active)}

                onClick={(event) => handleNavigation(event, item)}

            >

                {active && (

                    <span className="absolute top-1/2 bottom-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#A9E5D2]" />

                )}

                <Icon

                    name={item.icon}

                    className={`h-[18px] w-[18px] shrink-0 ${

                        active

                            ? 'text-[#A9E5D2]'

                            : 'text-white/40 group-hover:text-[#A9E5D2]'

                    }`}

                />

                <span>{item.label}</span>

            </a>

        );

    };

    return (

        <>

            <aside

                className={`fixed top-0 left-0 z-[60] flex h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-white/[0.13] bg-[#071522]/95 shadow-[8px_0_40px_rgba(0,0,0,0.25)] backdrop-blur-[22px] transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} min-[769px]:translate-x-0`}

            >

                {/* Background */}

                <div className="pointer-events-none absolute inset-0 overflow-hidden">

                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#36534E]/20 blur-3xl" />

                    <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#294B70]/25 blur-3xl" />

                </div>

                {/* Logo */}

                <div className="relative shrink-0 px-6 pt-7 pb-7">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#A9E5D2]/30 bg-[#A9E5D2]/10 shadow-[0_0_18px_rgba(169,229,210,0.10)]">

                            <SystemLogo />

                        </div>

                        <div>

                            <div className="text-[21px] font-bold tracking-tight text-white">

                                ACCENTRA

                            </div>

                            <div className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8FA3BA] uppercase">

                                Accounting System

                            </div>

                        </div>

                    </div>

                </div>

                {/* Student Navigation */}

                <nav className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">

                    {menuItems.map(renderMenuItem)}

                    {/* Accounting Dropdown */}

                    <button

                        type="button"

                        aria-expanded={accountingOpen}

                        onClick={() =>

                            setAccountingOpen((previous) => !previous)

                        }

                        className={itemClasses(

                            accountingItems.some(

                                (item) => item.label === activeMenu,

                            ),

                        )}

                    >

                        {accountingItems.some(

                            (item) => item.label === activeMenu,

                        ) && (

                            <span className="absolute top-1/2 bottom-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#A9E5D2]" />

                        )}

                        <Icon

                            name="calculator"

                            className={`h-[18px] w-[18px] shrink-0 ${

                                accountingItems.some(

                                    (item) => item.label === activeMenu,

                                )

                                    ? 'text-[#A9E5D2]'

                                    : 'text-white/40 group-hover:text-[#A9E5D2]'

                            }`}

                        />

                        <span className="flex-1 text-left">Accounting</span>

                        <Icon

                            name="chevron-down"

                            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${

                                accountingOpen ? 'rotate-180' : ''

                            }`}

                        />

                    </button>

                    {accountingOpen && (

                        <div className="ml-4 flex flex-col gap-1 border-l border-white/10 pl-3">

                            {accountingItems.map((item) => {

                                const active = activeMenu === item.label;

                                return (

                                    <a

                                        key={item.label}

                                        href={item.path}

                                        aria-current={

                                            active ? 'page' : undefined

                                        }

                                        onClick={(event) =>

                                            handleNavigation(event, item)

                                        }

                                        className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12px] font-medium transition-all duration-200 ${

                                            active

                                                ? 'bg-white text-[#142A43] shadow-[0_3px_12px_rgba(0,0,0,0.10)]'

                                                : 'border border-transparent text-white/65 hover:border-[#A9E5D2]/20 hover:bg-[#A9E5D2]/[0.09] hover:text-[#A9E5D2]'

                                        }`}

                                    >

                                        <Icon

                                            name={item.icon}

                                            className={`h-4 w-4 shrink-0 ${

                                                active

                                                    ? 'text-[#A9E5D2]'

                                                    : 'text-white/40 group-hover:text-[#A9E5D2]'

                                            }`}

                                        />

                                        <span>{item.label}</span>

                                    </a>

                                );

                            })}

                        </div>

                    )}

                    {bottomMenuItems.map(renderMenuItem)}

                </nav>

                {/* Logout */}

                <div className="relative shrink-0 border-t border-white/10 px-3 py-4">

                    <button

                        type="button"

                        onClick={() => setShowLogoutModal(true)}

                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#C7D2E0] transition-colors hover:bg-white/[0.08] hover:text-white"

                    >

                        <Icon

                            name="log-out"

                            className="h-[18px] w-[18px] shrink-0 text-[#8FA3BA] group-hover:text-white"

                        />

                        <span>Logout</span>

                    </button>

                </div>

            </aside>

            <form

                ref={logoutFormRef}

                action="/student/logout"

                method="POST"

                hidden

            >

                <input type="hidden" name="_token" value={csrfToken} />

            </form>

            {/* Logout Confirmation Modal */}

            {showLogoutModal && (

                <div

                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07111F]/60 p-4 backdrop-blur-sm"

                    onMouseDown={(event) => {

                        if (

                            event.target === event.currentTarget &&

                            !isLoggingOut

                        ) {

                            setShowLogoutModal(false);

                        }

                    }}

                >

                    <div

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="logout-modal-title"

                        aria-describedby="logout-modal-description"

                        className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#DCE3EA] bg-white shadow-[0_24px_70px_rgba(7,17,31,0.25)]"

                    >

                        {/* Navy Header */}

                        <div className="flex items-center justify-between border-b border-white/10 bg-[#102437] px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-[#D5A2A2]">

                                    <Icon

                                        name="log-out"

                                        className="h-[18px] w-[18px]"

                                    />

                                </div>

                                <div>

                                    <h2

                                        id="logout-modal-title"

                                        className="text-base font-semibold tracking-tight text-white"

                                    >

                                        Log Out

                                    </h2>

                                    <p className="mt-1 text-[11px] font-medium tracking-wide text-[#A9B8C9]">

                                        ACCENTRA · Student Portal

                                    </p>

                                </div>

                            </div>

                            <button

                                type="button"

                                aria-label="Close logout confirmation"

                                disabled={isLoggingOut}

                                onClick={() => setShowLogoutModal(false)}

                                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#A9B8C9] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"

                            >

                                <Icon name="x" className="h-4 w-4" />

                            </button>

                        </div>

                        <div className="bg-white px-6 py-6">

                            <p

                                id="logout-modal-description"

                                className="text-sm leading-6 text-[#405166]"

                            >

                                Are you sure you want to log out of your

                                account?

                            </p>

                            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E5EAF0] bg-[#F6F8FA] px-4 py-3">

                                <Icon

                                    name="info"

                                    className="mt-0.5 h-4 w-4 shrink-0 text-[#71869B]"

                                />

                                <p className="text-xs leading-5 text-[#718096]">

                                    You will need to log in again to access your

                                    student dashboard.

                                </p>

                            </div>

                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-[#E7ECF1] bg-white px-6 py-4 sm:flex-row sm:justify-end">

                            <button

                                type="button"

                                disabled={isLoggingOut}

                                onClick={() => setShowLogoutModal(false)}

                                className="rounded-lg border border-[#D5DEE7] bg-white px-5 py-2.5 text-sm font-medium text-[#40566E] transition-colors hover:bg-[#F3F6F8] disabled:cursor-not-allowed disabled:opacity-50"

                            >

                                Cancel

                            </button>

                            <button

                                type="button"

                                disabled={isLoggingOut}

                                onClick={confirmLogout}

                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#A50104] bg-[#A50104] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#590004] disabled:cursor-not-allowed disabled:opacity-70"

                            >

                                <Icon name="log-out" className="h-4 w-4" />

                                {isLoggingOut ? 'Logging out...' : 'Log Out'}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}