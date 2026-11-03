import { useEffect, useMemo, useState } from "react";


import { router, usePage } from "@inertiajs/react";


import { NotebookPen, Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Clock3, AlertTriangle, Save, Send, Info, FileText, Calculator, RotateCcw, } from "lucide-react";



import StudentLayout from "../components/layout/studentLayout";





const blankLine = () => ({

    account_id: "",

    code: "",

    title: "",

    explanation: "",

    debit: "",

    credit: "",

});



    const blankEntry = () => ({

        ref: "",

        date: new Date().toISOString().slice(0, 10),

        description: "",

        notes: "",

        status: "Draft",

        period: "End of Month",

        lines: [blankLine(), blankLine()],

    });



const money = n => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(n || 0));



const field = "w-full rounded-xl border border-white/10 bg-[#0B1728]/80 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#A9E5D2]/50 focus:ring-2 focus:ring-[#A9E5D2]/10";



const label = "mb-1.5 block text-xs font-semibold text-white/65";



function Panel({ title, icon: Icon, children, action }) {

    return <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#17283A]/95 via-[#101F30]/95 to-[#0B1728]/95 shadow-[0_12px_35px_rgba(0,0,0,.16)]">

        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">

            <div className="flex items-center gap-2.5">

                <Icon size={17} className="text-[#A9E5D2]" />

                <h2 className="text-sm font-semibold text-white">{title}</h2>

            </div>{action}</div>{children}</section>;

}



function Status({ value }) { const s = value === "Posted" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : value === "Draft" ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-rose-400/20 bg-rose-400/10 text-rose-300"; return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${s}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{value}</span>; }



function EntryModal({ entry, accounts, onClose, onSave, readOnly = false }) {

    const [form, setForm] = useState(entry);

    const [error, setError] = useState("");

    const debit = form.lines.reduce((n, x) => n + Number(x.debit || 0), 0);

    const credit = form.lines.reduce((n, x) => n + Number(x.credit || 0), 0);

    const balanced = debit > 0 && Math.abs(debit - credit) < 0.005;

    const updateLine = (index, key, value) => setForm(prev => ({ ...prev, lines: prev.lines.map((line, i) => i === index ? { ...line, [key]: value } : line) }));


    const chooseAccount = (index, code) => {

    const account = accounts.find(

        (a) => String(a.code) === String(code)

    );



    setForm((prev) => ({

        ...prev,

        lines: prev.lines.map((line, i) =>

            i === index

                ? {

                    ...line,

                    account_id: account?.id || "",

                    code: account?.code || "",

                    title: account?.title || "",

                }

                : line

        ),

    }));

};


    const save = (status) => {

        const transactionDate = String(form.date ?? "").trim();

const transactionDescription = String(form.description ?? "").trim();



if (!transactionDate || !transactionDescription) {

    console.log("Journal Entry Form:", form);



    return setError("Enter the transaction date and description.");

}

        if (form.lines.length < 2 || form.lines.some(l => !l.code || (!Number(l.debit) && !Number(l.credit))))

            return setError("Add at least two complete journal lines with an account and an amount.");

        if (form.lines.some(l => Number(l.debit) > 0 && Number(l.credit) > 0))

            return setError("A journal line cannot contain both debit and credit amounts.");

        if (status === "Posted" && !balanced)

            return setError("The journal entry cannot be posted because total debit and credit are not equal.");

        if (debit !== credit && status === "Posted")

            return setError("Please balance the journal entry before posting.");

        onSave({ ...form, status });

    };

    return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#07111F]/80 p-3 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>

        <div role="dialog" aria-modal="true" className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172B40] to-[#091725] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                <div className="flex items-center gap-3">

                    <span className="rounded-lg bg-[#A9E5D2]/10 p-2 text-[#A9E5D2]">

                        <NotebookPen size={18} />

                    </span>

                    <div>

                        <h2 className="font-semibold text-white">{readOnly ? "Journal Entry Details" : form.id ? "Edit Journal Entry" : "New Journal Entry"}</h2>

                        <p className="mt-0.5 text-[11px] text-white/40">Record the debit and credit effects of a transaction.</p>

                    </div>

                </div>

                <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white">

                    <X size={18} />

                </button>

            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5">

                <div className="grid gap-4 sm:grid-cols-3">

                    <div>

                        <label className={label}>Reference No.</label>

                        <input disabled className={field} value={form.ref || "Auto-generated when saved"} />

                    </div>

                    <div>

                        <label className={label}>Transaction Date *</label>

                        <input

                            disabled={readOnly}

                            type="date"

                            className={field}

                            value={form.date ?? ""}

                            onChange={(e) =>

                                setForm((prev) => ({

                                    ...prev,

                                    date: e.target.value,

                                }))

                            }

                        />

                    </div>

                    <div>

                        <label className={label}>Description *</label>

                        <input

                        disabled={readOnly}

                        type="text"

                        className={field}

                        value={form.description ?? ""}

                        onChange={(e) =>

                            setForm((prev) => ({

                                ...prev,

                                description: e.target.value,

                            }))

                        }

                        placeholder="e.g. Purchased office supplies"

                    />

                    </div>

                </div>

                <div className="overflow-hidden rounded-xl border border-white/10">

                    <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">

                        <div className="flex items-center gap-2">

                            <FileText size={15} className="text-[#A9E5D2]" />

                            <span className="text-xs font-semibold">Journal Entry Lines</span>

                        </div>{!readOnly && <button onClick={() => setForm(p => ({ ...p, lines: [...p.lines, blankLine()] }))} className="inline-flex items-center gap-1 rounded-lg border border-[#A9E5D2]/25 px-2.5 py-1.5 text-[11px] font-semibold text-[#A9E5D2] hover:bg-[#A9E5D2]/10">

                            <Plus size={13} /> Add Row</button>}</div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1050px] text-left text-xs">

                            <thead className="bg-white/[0.025] text-[10px] uppercase text-white/40">

                                <tr>

                                    <th className="px-3 py-3">#</th>

                                    <th className="px-3 py-3">Date</th>

                                    <th className="px-3 py-3">Account Title</th>

                                    <th className="px-3 py-3">Account Code/Name</th>

                                    <th className="px-3 py-3">Description</th>

                                    <th className="px-3 py-3">Debit (₱)</th>

                                    <th className="px-3 py-3">Credit (₱)</th>

                                    {!readOnly && <th className="px-3 py-3">Action</th>}

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-white/[0.06]">{form.lines.map((line, i) => <tr key={i}>

                                <td className="px-3 py-2.5 text-white/40">{i + 1}</td>

                                <td className="whitespace-nowrap px-3 py-2.5 text-white/55">

                                    {form.date || "—"}

                                </td>

                                <td className="px-3 py-2.5">

                                    <input

                                        disabled={readOnly}

                                        className={field}

                                        value={line.title}

                                        onChange={e => updateLine(i, "title", e.target.value)}

                                        placeholder="Enter account title"

                                    />

                                </td>

                                <td className="w-[220px] px-3 py-2.5">


                                    <select

                                        disabled={readOnly}

                                        className={field}

                                        value={line.code}

                                        onChange={(e) => chooseAccount(i, e.target.value)}

                                    >

                                        <option value="">Select account</option>



                                        {accounts

                                            .filter((a) => a.status === "Active")

                                            .map((a) => (

                                                <option key={a.id} value={a.code}>

                                                    {a.code} — {a.title}

                                                </option>

                                            ))}

                                    </select>

                                {line.title && <p className="mt-1 text-[10px] text-white/40">{line.title}</p>}</td>


                                <td className="px-3 py-2.5">

                                    <input disabled={readOnly} className={field} value={line.explanation} onChange={e => updateLine(i, "explanation", e.target.value)} placeholder="Description" />

                                </td>

                                <td className="px-3 py-2.5">

                                    <input disabled={readOnly} type="number" min="0" step="0.01" className={field} value={line.debit} onChange={e => updateLine(i, "debit", e.target.value)} placeholder="0.00" />

                                </td>

                                <td className="px-3 py-2.5">

                                    <input disabled={readOnly} type="number" min="0" step="0.01" className={field} value={line.credit} onChange={e => updateLine(i, "credit", e.target.value)} placeholder="0.00" />

                                </td>{!readOnly && <td className="px-3 py-2.5">

                                    <button disabled={form.lines.length <= 2} onClick={() => setForm(p => ({ ...p, lines: p.lines.filter((_, idx) => idx !== i) }))} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-25">

                                        <Trash2 size={14} />

                                    </button>

                                </td>}</tr>)}</tbody>

                            <tfoot className="border-t border-white/10 bg-white/[0.035] font-semibold">

                                <tr>

                                    <td colSpan="5" className="px-3 py-3 text-right text-white/60">TOTAL</td>

                                    <td className="px-3 py-3 text-white">{money(debit)}</td>

                                    <td className="px-3 py-3 text-white">{money(credit)}</td>{!readOnly && <td />}</tr>

                            </tfoot>

                        </table>

                    </div>

                </div>

                <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${balanced ? "border-emerald-400/20 bg-emerald-400/[0.07]" : "border-amber-400/20 bg-amber-400/[0.06]"}`}>

                    <div className="flex items-center gap-2">{balanced ? <CheckCircle2 className="text-emerald-300" size={18} /> : <AlertTriangle className="text-amber-300" size={18} />}<div>

                        <p className={`text-xs font-semibold ${balanced ? "text-emerald-200" : "text-amber-200"}`}>{balanced ? "Balanced Entry" : "Entry Not Balanced"}</p>

                        <p className="mt-0.5 text-[10px] text-white/45">{balanced ? "Total debit and credit are equal." : `Difference: ${money(Math.abs(debit - credit))}`}</p>

                    </div>

                    </div>

                    <div className="flex gap-4 text-xs">

                        <span className="text-white/50">Debit <b className="ml-1 text-white">{money(debit)}</b>

                        </span>

                        <span className="text-white/50">Credit <b className="ml-1 text-white">{money(credit)}</b>

                        </span>

                    </div>

                </div>

                <div>

                    <label className={label}>Notes (Optional)</label>

                    <textarea disabled={readOnly} rows={2} className={`${field} resize-none`} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Add additional information..." />

                </div>{error && <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}</div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-between">

                <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5">{readOnly ? "Close" : "Cancel"}</button>{!readOnly && <div className="flex flex-col gap-2 sm:flex-row">

                    <button onClick={() => save("Draft")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/5">

                        <Save size={15} /> Save as Draft</button>

                    <button onClick={() => save("Posted")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A9E5D2] px-5 py-2.5 text-sm font-bold text-[#0B1728] hover:bg-[#c5f3e5]">

                        <Send size={15} /> Post Entry</button>

                </div>}</div>

        </div>

    </div>;

}



export default function StudentJournalEntries() {

    const { entries: databaseEntries = [], accounts: databaseAccounts = [] } =

    usePage().props;



const entries = Array.isArray(databaseEntries) ? databaseEntries : [];



const accounts = Array.isArray(databaseAccounts)

    ? databaseAccounts

    : [];

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All Statuses");

    const [from, setFrom] = useState("");

    const [to, setTo] = useState("");

    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [selected, setSelected] = useState(null);

    const [period, setPeriod] = useState("End of Month");

    const [activeTask, setActiveTask] = useState(() => {

        try {

            return JSON.parse(sessionStorage.getItem("accentra_active_task") || "null");

        }

        catch {

            return null;

        }

    });





    const pageSize = 10;

    const filtered = useMemo(() => entries.filter(e => (e.ref + " " + e.description + " " + e.lines.map(line => line.title || "").join(" ")).toLowerCase().includes(search.toLowerCase()) && (statusFilter === "All Statuses" || e.status === statusFilter) && (!from || e.date >= from) && (!to || e.date <= to)), [entries, search, statusFilter, from, to]);

    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

    const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

    const totalPosted = entries.filter(e => e.status === "Posted").length;

    const totalDraft = entries.filter(e => e.status === "Draft").length;

    const unbalanced = entries.filter(e => { const d = e.lines.reduce((n, l) => n + Number(l.debit || 0), 0); const c = e.lines.reduce((n, l) => n + Number(l.credit || 0), 0); return Math.abs(d - c) >= .005; }).length;

    const openNew = () => {

    setModal({

        mode: "edit",

        entry: blankEntry(),

    });

};

    useEffect(() => {

        const params = new URLSearchParams(window.location.search);

        if (params.get("openCreateEntry") === "1") {

            const nextNumber = Math.max(

                0,

                ...entries.map(entry => Number(entry.ref?.split("-")[1]) || 0),

            ) + 1;

            setModal({

                mode: "edit",

                entry: {

                    ...blankEntry(),

                    ref: `JE-${String(nextNumber).padStart(3, "0")}`,

                },

            });

            params.delete("openCreateEntry");

            const query = params.toString();

            window.history.replaceState(

                {},

                "",

                `${window.location.pathname}${query ? `?${query}` : ""}`,

            );

        }

    }, []);

    const saveEntry = (entry) => {

    const payload = {

        date: entry.date,

        description: entry.description,

        notes: entry.notes || null,

        status: entry.status,

        period: entry.period || period,

        lines: entry.lines.map((line) => ({

            account_id: line.account_id,

            explanation: line.explanation || null,

            debit: Number(line.debit || 0),

            credit: Number(line.credit || 0),

        })),

    };



    const options = {

        preserveScroll: true,



        onSuccess: () => {

            console.log("Journal entry saved successfully.");

            setModal(null);

        },



        onError: (errors) => {

            console.error("Journal Entry Validation Errors:", errors);



            const messages = Object.values(errors).flat().join("\n");



            window.alert(

                messages || "Unable to save journal entry. Check your inputs."

            );

        },



        onFinish: () => {

            console.log("Journal entry request finished.");

        },

    };



    if (entry.id) {

        router.put(

            `/student/accounting/journal-entries/${entry.id}`,

            payload,

            options

        );

    } else {

        router.post(

            "/student/accounting/journal-entries",

            payload,

            options

        );

    }

};

    const deleteEntry = (entry) => {

        if (entry.status === "Posted") return;

        setDeleteTarget(entry);

    };

    const confirmDelete = () => {

    if (!deleteTarget) return;



    router.delete(

        `/student/accounting/journal-entries/${deleteTarget.id}`,

        {

            preserveScroll: true,



            onSuccess: () => {

                if (selected?.id === deleteTarget.id) {

                    setSelected(null);

                }



                setDeleteTarget(null);

            },

        }

    );

};

    const resetFilters = () => { setSearch(""); setStatusFilter("All Statuses"); setFrom(""); setTo(""); setPage(1); };

    const stats = [{ title: "Total Entries", value: entries.length, icon: NotebookPen, color: "text-sky-300 bg-sky-400/10" }, { title: "Posted Entries", value: totalPosted, icon: CheckCircle2, color: "text-emerald-300 bg-emerald-400/10" }, { title: "Draft Entries", value: totalDraft, icon: Clock3, color: "text-amber-300 bg-amber-400/10" }, { title: "Unbalanced Entries", value: unbalanced, icon: AlertTriangle, color: "text-rose-300 bg-rose-400/10" }];

    return <StudentLayout activeMenu="Journal Entries" title="Journal Entries" subtitle="Create, review, and manage your accounting transactions" showPageInfo={false}

            showSearch={false}>

        <div className="space-y-5 text-white">

            <section className="flex flex-wrap items-end justify-between gap-3">

                <div>

                    <span className="inline-flex rounded-full border border-[#A9E5D2]/20 bg-[#A9E5D2]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#A9E5D2]">Accounting Workspace</span>

                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Journal Entries</h1>

                    <p className="mt-1 text-sm text-white/50">Record business transactions using your Chart of Accounts.</p>

                </div>

                <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-[#A9E5D2] px-4 py-2.5 text-sm font-bold text-[#0B1728] hover:bg-[#c5f3e5]">

                    <Plus size={17} /> New Journal Entry</button>

            </section>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(s => <div key={s.title} className="rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#17283A]/90 to-[#0B1728]/90 p-4">

                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>

                    <s.icon size={18} />

                </div>

                <p className="text-[11px] text-white/45">{s.title}</p>

                <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>

            </div>)}</div>


            <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#17283A]/90 to-[#0B1728]/90 p-4">

                <div className="grid gap-3 sm:grid-cols-2">

                    <div>

                        <label className={label}>Account Group</label>

                        <input

                        disabled

                        value={accounts.find(a => a.account_group)?.account_group || "No Account Group"}

                        className={`${field} opacity-75`}

                    />

                    </div>

                    <div>

                        <label className={label}>Account Period</label>

                        <input value={period} onChange={e => setPeriod(e.target.value)} className={field} />

                    </div>

                </div>



            </section>


            <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]">

                <Panel title={`Journal Entry List (${filtered.length})`} icon={NotebookPen}>

                    <div className="grid items-end gap-3 border-b border-white/[0.07] p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">

                        <div className="relative min-w-0">

                            <Search size={15} className="absolute left-3 top-3 text-white/35" />

                            <input className={`${field} pl-9`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search reference or description..." />

                        </div>

                        <div>

                            <label className={label}>Date From</label>

                            <input type="date" className={field} value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} />

                        </div>

                        <div>

                            <label className={label}>Date To</label>

                            <input type="date" className={field} value={to} onChange={e => { setTo(e.target.value); setPage(1); }} />

                        </div>

                        <div>

                            <select className={`${field} min-w-0`} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>

                                <option>All Statuses</option>

                                <option>Draft</option>

                                <option>Posted</option>

                            </select>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[820px] text-left text-xs">

                            <thead className="bg-white/[0.035] text-[10px] uppercase tracking-wider text-white/40">

                                <tr>{["#", "Reference No.", "Date", "Account Title", "Description", "Total Debit", "Total Credit", "Status", "Action"].map(x => <th key={x} className="px-3 py-3">{x}</th>)}</tr>

                            </thead>

                            <tbody className="divide-y divide-white/[0.06]">{shown.map((e, i) => {

                                const d = e.lines.reduce((n, l) => n + Number(l.debit || 0), 0); const c = e.lines.reduce((n, l) => n + Number(l.credit || 0), 0); return <tr key={e.id} onClick={() => setSelected(e)} className={`cursor-pointer hover:bg-[#A9E5D2]/[0.04] ${selected?.id === e.id ? "bg-[#A9E5D2]/[0.05]" : ""}`}>

                                    <td className="px-3 py-3 text-white/35">{(page - 1) * pageSize + i + 1}</td>

                                    <td className="px-3 py-3 font-semibold text-white/80">{e.ref}</td>

                                    <td className="whitespace-nowrap px-3 py-3 text-white/55">{new Date(`${e.date}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}</td>

                                    <td className="max-w-[180px] px-3 py-3 text-white/70">

                                        <div className="max-w-[180px] space-y-1">

                                            {e.lines.map((line, lineIndex) => (

                                                <div key={lineIndex} className="truncate">{line.title?.trim() || "—"}</div>

                                            ))}

                                        </div>

                                    </td>

                                    <td className="max-w-[180px] truncate px-3 py-3 text-white/70">{e.description}</td>

                                    <td className="whitespace-nowrap px-3 py-3 text-white/65">{money(d)}</td>

                                    <td className="whitespace-nowrap px-3 py-3 text-white/65">{money(c)}</td>

                                    <td className="px-3 py-3">

                                        <Status value={e.status} />

                                    </td>

                                    <td className="px-3 py-3">

                                        <div className="flex gap-1">

                                            <button title="View" onClick={ev => { ev.stopPropagation(); setSelected(e); setModal({ mode: "view", entry: e }); }} className="rounded-md bg-sky-400/10 p-1.5 text-sky-300 transition hover:bg-sky-400/20">

                                                <Eye size={14} />

                                            </button>

                                            <button title="Edit" disabled={e.status === "Posted"} onClick={ev => { ev.stopPropagation(); setModal({ mode: "edit", entry: e }); }} className="rounded-md bg-sky-400/10 p-1.5 text-sky-300 transition hover:bg-sky-400/20 disabled:opacity-25">

                                                <Pencil size={14} />

                                            </button>

                                            <button title="Delete" disabled={e.status === "Posted"} onClick={ev => { ev.stopPropagation(); deleteEntry(e); }} className="rounded-md bg-rose-400/10 p-1.5 text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-25">

                                                <Trash2 size={14} />

                                            </button>

                                        </div>

                                    </td>

                                </tr>;

                            })}{Array.from({ length: Math.max(0, pageSize - shown.length) }).map((_, i) => <tr key={`spacer-${i}`} aria-hidden="true" className="pointer-events-none"><td colSpan={9} className="h-[44px] border-0 p-0" /></tr>)}</tbody>

                        </table>{shown.length === 0 && <div className="flex h-[440px] items-center justify-center px-5 text-center text-sm text-white/40">No journal entries found.</div>}</div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3">

                        <p className="text-[11px] text-white/40">Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} entries</p>

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

                <Panel title="Journal Entry Details" icon={FileText}>{selected ? <div className="p-5">

                    <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A9E5D2]/10 text-[#A9E5D2]">

                                <FileText size={20} />

                            </div>

                            <div>

                                <h3 className="font-bold">{selected.ref}</h3>

                                <p className="mt-0.5 text-xs text-white/50">{selected.description}</p>

                            </div>

                        </div>

                        <Status value={selected.status} />

                    </div>

                    <div className="my-5 space-y-3 border-y border-white/[0.07] py-4 text-xs">

                        <div className="flex justify-between gap-3">

                            <span className="text-white/40">Transaction Date</span>

                            <span>{selected.date}</span>

                        </div>

                        <div className="flex justify-between gap-3">

                            <span className="text-white/40">Account Period</span>

                            <span>{period}</span>

                        </div>

                        <div className="flex justify-between gap-3">

                            <span className="text-white/40">Created Date</span>

                            <span>—</span>

                        </div>

                        <div className="flex justify-between gap-3">

                            <span className="text-white/40">Last Updated</span>

                            <span>—</span>

                        </div>

                    </div>

                    <p className="mb-2 text-xs font-semibold text-white/75">Journal Entry Lines</p>

                    <div className="space-y-2">{selected.lines.map((l, i) => <div key={i} className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">

                        <p className="text-xs font-semibold text-white/80">{l.code} · {l.title}</p>

                        <div className="mt-2 flex justify-between gap-3 text-[11px]">

                            <span className="text-white/40">Debit: {money(l.debit)}</span>

                            <span className="text-white/40">Credit: {money(l.credit)}</span>

                        </div>

                    </div>)}</div>

                    <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs">

                        <div className="flex justify-between">

                            <span className="text-white/45">Total Debit</span>

                            <b>{money(selected.lines.reduce((n, l) => n + Number(l.debit || 0), 0))}</b>

                        </div>

                        <div className="mt-2 flex justify-between">

                            <span className="text-white/45">Total Credit</span>

                            <b>{money(selected.lines.reduce((n, l) => n + Number(l.credit || 0), 0))}</b>

                        </div>

                    </div>

                    <button onClick={() => setModal({ mode: "view", entry: selected })} className="mt-4 w-full rounded-lg border border-[#A9E5D2]/25 px-3 py-2.5 text-xs font-semibold text-[#A9E5D2] hover:bg-[#A9E5D2]/10">

                        <Eye size={13} className="mr-1 inline" />View Full Entry</button>

                </div> : <div className="p-10 text-center text-sm text-white/40">Select an entry to view its details.</div>}</Panel>

            </div>

        </div>

        {modal && <EntryModal key={modal.entry.id || modal.entry.ref} entry={modal.entry} accounts={accounts} readOnly={modal.mode === "view"} onClose={() => setModal(null)} onSave={saveEntry} />}

        {deleteTarget && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#07111F]/75 p-4 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && setDeleteTarget(null)}>

            <div role="dialog" aria-modal="true" className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172B40] to-[#091725] shadow-2xl">

                <div className="border-b border-white/10 px-5 py-4"><h2 className="text-sm font-semibold text-white">Confirm Delete</h2></div>

                <div className="flex items-start gap-3 p-5"><span className="rounded-xl bg-rose-400/10 p-3 text-rose-300"><AlertTriangle size={20} /></span><div><p className="text-sm font-semibold text-white">Delete {deleteTarget.ref}?</p><p className="mt-1 text-xs leading-5 text-white/50">This journal entry will be permanently removed. This action cannot be undone.</p></div></div>

                <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4"><button onClick={() => setDeleteTarget(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5">Cancel</button><button onClick={confirmDelete} className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-400"><Trash2 size={15} className="mr-1.5 inline" />Delete Entry</button></div>

            </div>

        </div>}

    </StudentLayout>;

}
