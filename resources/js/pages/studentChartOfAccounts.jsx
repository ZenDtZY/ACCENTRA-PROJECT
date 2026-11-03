import { useEffect, useMemo, useState } from "react";

import { BookOpen, Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight, Filter, Wallet, TrendingUp, Scale, CircleDollarSign, CalendarDays, Layers3, Info, CheckCircle2, AlertCircle, AlertTriangle, Save, NotebookPen, } from "lucide-react";

import StudentLayout from "../components/layout/studentLayout";

const TYPES = ["Asset", "Liability", "Equity", "Revenue", "Expense"];

const ACCOUNT_CODE_PREFIX = {
    Asset: "1",
    Liability: "2",
    Equity: "3",
    Revenue: "4",
    Expense: "5",
};

const generateAccountCode = (type, accountList, currentId = null) => {
    const prefix = ACCOUNT_CODE_PREFIX[type] || "9";
    const usedCodes = accountList
        .filter(account => account.id !== currentId)
        .map(account => String(account.code || ""))
        .filter(code => code.startsWith(prefix) && /^\d{3}$/.test(code))
        .map(Number);
    let nextNumber = Number(`${prefix}01`);
    while (usedCodes.includes(nextNumber)) {
        nextNumber += 1;
    }
    return String(nextNumber).padStart(3, "0");
};

const emptyForm = {
    code: "", title: "", type: "", nature: "Debit", accountGroup: "", period: "", description: "", status: "Active",
};

const initialAccounts = [
    { id: 1, code: "101", title: "Cash", type: "Asset", nature: "Debit", accountGroup: "ABC School Supplies", description: "Cash available for business operations.", status: "Active" },
    { id: 2, code: "102", title: "Accounts Receivable", type: "Asset", nature: "Debit", accountGroup: "ABC School Supplies", description: "Amounts collectible from customers.", status: "Active" },
    { id: 3, code: "103", title: "Supplies", type: "Asset", nature: "Debit", accountGroup: "ABC School Supplies", description: "Supplies used in business operations.", status: "Active" },
    { id: 4, code: "104", title: "Equipment", type: "Asset", nature: "Debit", accountGroup: "ABC School Supplies", description: "Equipment used in business operations.", status: "Active" },
    { id: 5, code: "301", title: "Owner's Capital", type: "Equity", nature: "Credit", accountGroup: "ABC School Supplies", description: "Owner's investment in the business.", status: "Active" },
    { id: 6, code: "401", title: "Sales Revenue", type: "Revenue", nature: "Credit", accountGroup: "ABC School Supplies", description: "Income earned from sales.", status: "Active" },
    { id: 7, code: "501", title: "Electricity Expense", type: "Expense", nature: "Debit", accountGroup: "ABC School Supplies", description: "Cost of electricity used by the business.", status: "Active" },
];

const money = (n) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(n || 0));

const field = "w-full rounded-xl border border-white/10 bg-[#0B1728]/80 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#A9E5D2]/50 focus:ring-2 focus:ring-[#A9E5D2]/10";

const label = "mb-1.5 block text-xs font-semibold text-white/65";

function Panel({ title, icon: Icon, children, className = "" }) {
    return <section className={`min-w-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#17283A]/95 via-[#101F30]/95 to-[#0B1728]/95 shadow-[0_12px_35px_rgba(0,0,0,.16)] ${className}`}>
        <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-4">
            <Icon size={17} className="text-[#A9E5D2]" />
            <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>{children}</section>;
}

function Badge({ children, tone = "green", showDot = true }) {
    const styles = { green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", red: "border-rose-400/20 bg-rose-400/10 text-rose-300", blue: "border-sky-400/20 bg-sky-400/10 text-sky-300", amber: "border-amber-400/20 bg-amber-400/10 text-amber-300" };
    return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${styles[tone]}`}>{showDot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}</span>;
}

function Modal({ title, onClose, children, footer }) {
    return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#07111F]/75 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div role="dialog" aria-modal="true" className="my-auto w-full max-w-[650px] overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172B40] to-[#091725] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-[#A9E5D2]/10 p-2 text-[#A9E5D2]">
                        <BookOpen size={17} />
                    </span>
                    <h2 className="font-semibold text-white">{title}</h2>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">
                    <X size={18} />
                </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>{footer && <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}</div>
    </div>;
}

export default function StudentChartOfAccounts() {
    const [accounts, setAccounts] = useState(() => {
        try {
            const saved = sessionStorage.getItem("accentra_student_accounts");
            const parsed = saved ? JSON.parse(saved) : null;
            return Array.isArray(parsed) ? parsed : initialAccounts;
        }
        catch {
            return initialAccounts;
        }
    });
    const [group, setGroup] = useState("ABC School Supplies");
    const [period, setPeriod] = useState("End of Month");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [groupFilter, setGroupFilter] = useState("All Groups");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(initialAccounts[0]);
    const [modal, setModal] = useState(false);
    const [viewOnly, setViewOnly] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [activeTask, setActiveTask] = useState(null);
    const [taskWorkflowAdd, setTaskWorkflowAdd] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    useEffect(() => {
        try {
            sessionStorage.setItem("accentra_student_accounts", JSON.stringify(accounts));
        }
        catch { }
    }, [accounts]);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("openAddAccount") === "1") {
            const taskId = params.get("taskId");
            let task = null;
            try {
                task = JSON.parse(sessionStorage.getItem("accentra_active_task") || "null");
            }
            catch { }
            const isTaskWorkflow = Boolean(task && taskId && String(task.id) === String(taskId));
            if (isTaskWorkflow) {
                setActiveTask(task);
                setTaskWorkflowAdd(true);
            }
            setForm({ ...emptyForm, code: "", accountGroup: "", period: "" });
            setViewOnly(false);
            setModal(true);
        }
    }, []);
    const pageSize = 7;
    const accountGroups = [...new Set(accounts.map(a => a.accountGroup).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const filtered = useMemo(() => accounts
        .filter(a => (a.title + " " + a.description + " " + (a.accountGroup || "")).toLowerCase().includes(search.toLowerCase()) && (typeFilter === "All Types" || a.type === typeFilter) && (groupFilter === "All Groups" || (a.accountGroup || "") === groupFilter)), [accounts, search, typeFilter, groupFilter]);
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
    const counts = TYPES.map(type => ({ type, count: accounts.filter(a => a.type === type).length }));
    const openAdd = () => {
        setTaskWorkflowAdd(false);
        setActiveTask(null);
        setForm({ ...emptyForm, code: "", accountGroup: "", period: "" });
        setViewOnly(false);
        setMessage("");
        setModal(true);
    };
    const openEdit = (a) => { setSelected(a); setForm({ id: a.id, code: a.code, title: a.title, type: a.type, nature: a.nature, accountGroup: a.accountGroup || "", period: a.period || period, description: a.description, status: a.status }); setViewOnly(false); setModal(true); };
    const openView = (a) => { setSelected(a); setForm({ id: a.id, code: a.code, title: a.title, type: a.type, nature: a.nature, accountGroup: a.accountGroup || "", period: a.period || period, description: a.description, status: a.status }); setViewOnly(true); setModal(true); };
    const save = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.type.trim() || !form.description.trim() || !form.accountGroup.trim() || !form.period.trim())
            return setMessage("Please complete the required account information.");
        const isNew = !form.id;
        const savedAccount = {
            ...form,
            id: form.id || Date.now(),
            code: form.id ? (form.code || generateAccountCode(form.type, accounts, form.id)) : generateAccountCode(form.type, accounts),
            title: form.title.trim(),
            accountGroup: form.accountGroup.trim(),
            period: form.period.trim(),
            description: form.description.trim(),
        };
        const updatedAccounts = isNew
            ? [...accounts, savedAccount]
            : accounts.map(a => a.id === form.id ? savedAccount : a);
        try {
            sessionStorage.setItem("accentra_student_accounts", JSON.stringify(updatedAccounts));
        }
        catch {
            setMessage("Unable to save the account to this session. Please try again.");
            return;
        }
        setAccounts(updatedAccounts);
        setGroup(savedAccount.accountGroup);
        setPeriod(savedAccount.period);
        setSelected(savedAccount);
        setMessage("");
        setModal(false);
        setTaskWorkflowAdd(false);
    };
    const remove = (a) => setDeleteTarget(a);
    const confirmDelete = () => {
        if (!deleteTarget) return;
        setAccounts(prev => prev.filter(x => x.id !== deleteTarget.id));
        if (selected?.id === deleteTarget.id) setSelected(null);
        setDeleteTarget(null);
    };
    const statCards = [
        { title: "Total Accounts", value: accounts.length, icon: BookOpen, color: "text-sky-300 bg-sky-400/10" },
        ...counts.slice(0, 4).map((x, i) => ({ title: x.type === "Revenue" ? "Revenue" : x.type === "Expense" ? "Expenses" : x.type + "s", value: x.count, icon: [Wallet, TrendingUp, Scale, CircleDollarSign][i], color: ["text-emerald-300 bg-emerald-400/10", "text-rose-300 bg-rose-400/10", "text-amber-300 bg-amber-400/10", "text-purple-300 bg-purple-400/10"][i] })),
    ];
    return <StudentLayout activeMenu="Chart of Accounts" title="Chart of Accounts" subtitle="Create and manage the accounts used in your accounting records" showPageInfo={false}
            showSearch={false}>
        <div className="space-y-5 text-white">
            <section className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <span className="inline-flex rounded-full border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A9E5D2]">Accounting Workspace</span>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Chart of Accounts</h1>
                    <p className="mt-1 text-sm text-white/50">Set up your account list before recording journal entries.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#A9E5D2] px-4 py-2.5 text-sm font-bold text-[#0B1728] transition hover:bg-[#c5f3e5]"
                    >
                        <Plus size={17} />
                        Add Account
                    </button>
                    <button
                        onClick={() => window.location.assign("/student/accounting/journal-entries")}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#A9E5D2]/30 px-4 py-2.5 text-sm font-semibold text-[#A9E5D2] transition hover:bg-[#A9E5D2]/10"
                    >
                        <NotebookPen size={17} />
                        Journal Entries
                    </button>
                </div>
            </section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{statCards.map((s) => <div key={s.title} className="rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#17283A]/90 to-[#0B1728]/90 p-4">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon size={18} />
                </div>
                <p className="text-[11px] text-white/45">{s.title}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
            </div>)}</div>
            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,.85fr)]">
                <Panel title={`Account List (${filtered.length})`} icon={BookOpen}>
                    <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center">
                        <div className="relative min-w-0 flex-[2]">
                            <Search className="absolute left-3 top-3 text-white/35" size={16} />
                            <input className={`${field} pl-9`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search account title or group..." />
                        </div>
                        <select className={`${field} lg:w-36`} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                            <option>All Types</option>{TYPES.map(type => <option key={type}>{type}</option>)}
                        </select>
                        <select className={`${field} lg:w-44`} value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}>
                            <option>All Groups</option>{accountGroups.map(accountGroup => <option key={accountGroup}>{accountGroup}</option>)}
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="bg-white/[0.035] text-[10px] uppercase tracking-wider text-white/40">
                                <tr>{["#", "Account Code", "Account Title", "Account Group", "Type", "Debit/Credit", "Status", "Actions"].map(h => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.06]">{shown.map((a, i) => <tr key={a.id} onClick={() => setSelected(a)} className={`cursor-pointer transition hover:bg-[#A9E5D2]/[0.04] ${selected?.id === a.id ? "bg-[#A9E5D2]/[0.055]" : ""}`}>
                                <td className="px-3 py-3 text-white/35">{(page - 1) * pageSize + i + 1}</td>
                                <td className="px-3 py-3 font-semibold text-[#A9E5D2]">{a.code || "—"}</td>
                                <td className="px-3 py-3 font-medium text-white/85">{a.title}</td>
                                <td className="px-3 py-3 text-white/55">{a.accountGroup || "—"}</td>
                                <td className="px-3 py-3">
                                    <Badge showDot={false} tone={a.type === "Asset" ? "green" : a.type === "Liability" ? "red" : a.type === "Equity" ? "amber" : "blue"}>{a.type}</Badge>
                                </td>
                                <td className="px-3 py-3 text-white/55">{a.nature}</td>
                                <td className="px-3 py-3">
                                    <Badge tone={a.status === "Active" ? "green" : "red"}>{a.status}</Badge>
                                </td>
                                <td className="px-3 py-3">
                                    <div className="flex gap-1">
                                        <button title="View" onClick={e => { e.stopPropagation(); openView(a); }} className="rounded-md bg-sky-400/10 p-1.5 text-sky-300 transition hover:bg-sky-400/20">
                                            <Eye size={14} />
                                        </button>
                                        <button title="Edit" onClick={e => { e.stopPropagation(); setSelected(a); setForm({ ...a, period: a.period || period }); setViewOnly(false); setModal(true); }} className="rounded-md bg-amber-400/10 p-1.5 text-amber-300 transition hover:bg-amber-400/20">
                                            <Pencil size={14} />
                                        </button>
                                        <button title="Delete" onClick={e => { e.stopPropagation(); remove(a); }} className="rounded-md bg-rose-400/10 p-1.5 text-rose-300 transition hover:bg-rose-400/20">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>)}{Array.from({ length: Math.max(0, pageSize - shown.length) }).map((_, i) => <tr key={`spacer-${i}`} aria-hidden="true" className="pointer-events-none"><td colSpan={8} className="h-[44px] border-0 p-0" /></tr>)}</tbody>
                        </table>{shown.length === 0 && <div className="flex h-[308px] items-center justify-center px-5 text-center text-sm text-white/40">No accounts found. Add an account or change your filters.</div>}</div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3">
                        <p className="text-[11px] text-white/40">Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} accounts</p>
                        <div className="flex items-center gap-1">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/10 p-2 text-white/60 disabled:opacity-25">
                                <ChevronLeft size={14} />
                            </button>
                            <span className="px-2 text-xs text-white/55">{page} / {pages}</span>
                            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/10 p-2 text-white/60 disabled:opacity-25">
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </Panel>
                <Panel title="Account Details" icon={Info}>
                    <div className="p-5">{selected ? <>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A9E5D2]/10 text-[#A9E5D2]">
                                    <Wallet size={21} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/40">Account Details</p>
                                    <h3 className="mt-0.5 font-bold">{selected.title}</h3>
                                </div>
                            </div>
                            <Badge tone={selected.status === "Active" ? "green" : "red"}>{selected.status}</Badge>
                        </div>
                        <div className="my-5 space-y-3 border-y border-white/[0.07] py-4 text-xs">
                            <div className="flex justify-between gap-3">
                                <span className="text-white/40">Account Code</span>
                                <span className="font-semibold text-[#A9E5D2]">{selected.code || "—"}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-white/40">Account Type</span>
                                <span>{selected.type}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-white/40">Debit/Credit Nature</span>
                                <span>{selected.nature}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-white/40">Account Group</span>
                                <span className="text-right">{selected.accountGroup || "Not set"}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                                <span className="text-white/40">Account Period</span>
                                <span className="text-right">{selected.period || period || "Not set"}</span>
                            </div>
                            <div>
                                <p className="mb-1 text-white/40">Description</p>
                                <p className="leading-5 text-white/75">{selected.description}</p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-[#A9E5D2]/10 bg-[#A9E5D2]/[0.045] p-3">
                            <p className="text-[11px] font-semibold text-[#A9E5D2]">Account Usage</p>
                            <p className="mt-1 text-[11px] leading-5 text-white/45">Journal entry balances and ledger totals will appear here after transactions are recorded.</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => openEdit(selected)} className="flex-1 rounded-lg border border-[#A9E5D2]/30 px-3 py-2.5 text-xs font-semibold text-[#A9E5D2] hover:bg-[#A9E5D2]/10">
                                <Pencil size={13} className="mr-1 inline" />Edit Account</button>
                            <button onClick={() => remove(selected)} className="rounded-lg border border-rose-400/25 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </> : <div className="py-12 text-center text-sm text-white/40">Select an account to view its details.</div>}</div>
                </Panel>
            </div>
        </div>
        {modal && <Modal title={viewOnly ? "Account Details" : form.id ? "Edit Account" : "Add Account"} onClose={() => { setModal(false); setMessage(""); setTaskWorkflowAdd(false); setActiveTask(null); }} footer={<>
            <button
                type="button"
                onClick={() => {
                    setModal(false);
                    setTaskWorkflowAdd(false);
                    setActiveTask(null);
                }}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5"
            >
                Close
            </button>
            {!viewOnly && <button
                type="submit"
                form="account-form"
                className="rounded-xl bg-[#A9E5D2] px-5 py-2.5 text-sm font-bold text-[#0B1728] hover:bg-[#c5f3e5]"
            >
                <Save size={15} className="mr-1.5 inline" />Save Account</button>}</>}>
            <form id="account-form" onSubmit={save} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={label}>Account Title <span className="text-rose-300">*</span>
                        </label>
                        <input disabled={viewOnly} className={field} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cash" required />
                    </div>
                    <div>
                        <label className={label}>Account Type <span className="text-rose-300">*</span>
                        </label>
                        <input disabled={viewOnly} className={field} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. Asset" required />
                    </div>
                    <div>
                        <label className={label}>Debit/Credit Nature <span className="text-rose-300">*</span>
                        </label>
                        <select disabled={viewOnly} className={field} value={form.nature} onChange={e => setForm({ ...form, nature: e.target.value })}>
                            <option>Debit</option>
                            <option>Credit</option>
                        </select>
                    </div>
                    <div>
                        <label className={label}>Account Group <span className="text-rose-300">*</span>
                        </label>
                        <input disabled={viewOnly} className={field} value={form.accountGroup || ""} onChange={e => setForm({ ...form, accountGroup: e.target.value })} placeholder="e.g. ABC School Supplies" required />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={label}>Account Period <span className="text-rose-300">*</span></label>
                        <input disabled={viewOnly} className={field} value={form.period || ""} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. End of Month" required />
                    </div>
                </div>
                <div>
                    <label className={label}>Description <span className="text-rose-300">*</span>
                    </label>
                    <textarea disabled={viewOnly} maxLength={250} rows={3} className={`${field} resize-none`} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Enter a short account description..." required />
                    <p className="mt-1 text-right text-[10px] text-white/35">{form.description.length}/250</p>
                </div>
{message && <p className="flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">
                    <AlertCircle size={15} />{message}</p>}</form>
        </Modal>}
        {deleteTarget && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#07111F]/75 p-4 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && setDeleteTarget(null)}>
            <div role="dialog" aria-modal="true" className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172B40] to-[#091725] shadow-2xl">
                <div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Confirm Delete</h2></div>
                <div className="flex items-start gap-3 p-5"><span className="rounded-xl bg-rose-400/10 p-3 text-rose-300"><AlertTriangle size={20} /></span><div><p className="text-sm font-semibold text-white">Delete {deleteTarget.title}?</p><p className="mt-1 text-xs leading-5 text-white/50">This account will be permanently removed from your Chart of Accounts. This action cannot be undone.</p></div></div>
                <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4"><button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5">Cancel</button><button onClick={confirmDelete} className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-400"><Trash2 size={15} className="mr-1.5 inline" />Delete Account</button></div>
            </div>
        </div>}
    </StudentLayout>;
}
