import { useEffect, useMemo, useState } from "react";



import { NotebookPen, Plus, Search, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight, CalendarDays, CheckCircle2, Clock3, AlertTriangle, Save, Send, Info, FileText, Calculator, RotateCcw, } from "lucide-react";



import StudentLayout from "../components/layout/studentLayout";



const seedAccounts = [

    { code: "101", title: "Cash", type: "Asset", nature: "Debit", status: "Active" },

    { code: "102", title: "Accounts Receivable", type: "Asset", nature: "Debit", status: "Active" },

    { code: "103", title: "Supplies", type: "Asset", nature: "Debit", status: "Active" },

    { code: "104", title: "Equipment", type: "Asset", nature: "Debit", status: "Active" },

    { code: "301", title: "Owner's Capital", type: "Equity", nature: "Credit", status: "Active" },

    { code: "401", title: "Sales Revenue", type: "Revenue", nature: "Credit", status: "Active" },

    { code: "501", title: "Electricity Expense", type: "Expense", nature: "Debit", status: "Active" },

];



const initialEntries = [

    { id: 1, ref: "JE-001", date: "2026-09-01", description: "Initial capital investment", status: "Posted", lines: [{ code: "101", title: "Cash", explanation: "Initial investment", debit: "100000", credit: "" }, { code: "301", title: "Owner's Capital", explanation: "Initial investment", debit: "", credit: "100000" }] },

    { id: 2, ref: "JE-002", date: "2026-09-03", description: "Purchased office supplies", status: "Posted", lines: [{ code: "103", title: "Supplies", explanation: "Purchased supplies", debit: "10000", credit: "" }, { code: "101", title: "Cash", explanation: "Paid in cash", debit: "", credit: "10000" }] },

    { id: 3, ref: "JE-003", date: "2026-09-05", description: "Sold school materials", status: "Draft", lines: [{ code: "101", title: "Cash", explanation: "Cash sale", debit: "20000", credit: "" }, { code: "401", title: "Sales Revenue", explanation: "Cash sale", debit: "", credit: "20000" }] },

    { id: 4, ref: "JE-004", date: "2026-09-08", description: "Paid monthly rent", status: "Posted", lines: [{ code: "501", title: "Rent Expense", explanation: "Monthly rent", debit: "15000", credit: "" }, { code: "101", title: "Cash", explanation: "Rent payment", debit: "", credit: "15000" }] },

    { id: 5, ref: "JE-005", date: "2026-09-10", description: "Purchased equipment on account", status: "Posted", lines: [{ code: "104", title: "Equipment", explanation: "Equipment purchase", debit: "25000", credit: "" }, { code: "102", title: "Accounts Payable", explanation: "Purchase on account", debit: "", credit: "25000" }] },

    { id: 6, ref: "JE-006", date: "2026-09-12", description: "Collected receivable from customer", status: "Posted", lines: [{ code: "101", title: "Cash", explanation: "Collection", debit: "12000", credit: "" }, { code: "102", title: "Accounts Receivable", explanation: "Customer payment", debit: "", credit: "12000" }] },

    { id: 7, ref: "JE-007", date: "2026-09-15", description: "Paid electricity bill", status: "Draft", lines: [{ code: "501", title: "Electricity Expense", explanation: "Utility bill", debit: "3500", credit: "" }, { code: "101", title: "Cash", explanation: "Cash payment", debit: "", credit: "3500" }] },

    { id: 8, ref: "JE-008", date: "2026-09-18", description: "Received service income", status: "Posted", lines: [{ code: "101", title: "Cash", explanation: "Service payment", debit: "8000", credit: "" }, { code: "401", title: "Sales Revenue", explanation: "Service income", debit: "", credit: "8000" }] },

    { id: 9, ref: "JE-009", date: "2026-09-21", description: "Purchased supplies for cash", status: "Draft", lines: [{ code: "103", title: "Supplies", explanation: "Office supplies", debit: "4500", credit: "" }, { code: "101", title: "Cash", explanation: "Cash purchase", debit: "", credit: "4500" }] },

    { id: 10, ref: "JE-010", date: "2026-09-25", description: "Owner additional investment", status: "Posted", lines: [{ code: "101", title: "Cash", explanation: "Additional investment", debit: "30000", credit: "" }, { code: "301", title: "Owner's Capital", explanation: "Additional capital", debit: "", credit: "30000" }] },

];



const getReportEntries = report => report?.entries?.length ? report.entries : [report];

const getReportTotals = report => getReportEntries(report).reduce((totals, item) => ({
    debit: totals.debit + item.lines.reduce((n, line) => n + Number(line.debit || 0), 0),
    credit: totals.credit + item.lines.reduce((n, line) => n + Number(line.credit || 0), 0),
}), { debit: 0, credit: 0 });

const groupedInitialEntries = initialEntries.map(item => ({
    ...item,
    entries: [{ ...item, lines: item.lines.map(line => ({ ...line })) }],
}));

const blankLine = () => ({ code: "", title: "", explanation: "", debit: "", credit: "" });



const blankEntry = () => ({ ref: "", date: new Date().toISOString().slice(0, 10), description: "", notes: "", status: "Draft", lines: [blankLine(), blankLine()] });



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

    const [form, setForm] = useState(() => ({

        companyName: entry.companyName || "",

        reportTitle: entry.reportTitle || "",

        period: entry.period || "",

        entries: entry.entries || [{

            id: entry.id,

            ref: entry.ref,

            date: entry.date || new Date().toISOString().slice(0, 10),

            description: entry.description || "",

            notes: entry.notes || "",

            status: entry.status || "Draft",

            lines: (entry.lines || [blankLine(), blankLine()]).map(line => ({ ...line })),

        }],

    }));

    const [error, setError] = useState("");

    const [showRemoveSuccess, setShowRemoveSuccess] = useState(false);

    const updateEntry = (entryIndex, key, value) => setForm(prev => ({

        ...prev,

        entries: prev.entries.map((item, i) => i === entryIndex ? { ...item, [key]: value } : item),

    }));

    const updateLine = (entryIndex, lineIndex, key, value) => setForm(prev => ({

        ...prev,

        entries: prev.entries.map((item, i) => i === entryIndex ? {

            ...item,

            lines: item.lines.map((line, j) => j === lineIndex ? { ...line, [key]: value } : line),

        } : item),

    }));

    const chooseAccount = (entryIndex, lineIndex, code) => {

        const account = accounts.find(item => item.code === code);

        setForm(prev => ({

            ...prev,

            entries: prev.entries.map((item, i) => i === entryIndex ? {

                ...item,

                lines: item.lines.map((line, j) => j === lineIndex ? { ...line, code, title: account?.title || "" } : line),

            } : item),

        }));

    };

    const totalsFor = item => ({

        debit: item.lines.reduce((n, line) => n + Number(line.debit || 0), 0),

        credit: item.lines.reduce((n, line) => n + Number(line.credit || 0), 0),

    });

    const save = status => {
        let overallDebit = 0;
        let overallCredit = 0;

        for (let i = 0; i < form.entries.length; i++) {
            const item = form.entries[i];
            const { debit, credit } = totalsFor(item);
            overallDebit += debit;
            overallCredit += credit;

            if (!item.date || !item.description.trim()) return setError(`Entry ${i + 1}: Enter the date and entry title.`);
            if (item.lines.length < 2 || item.lines.some(line => !line.code || (!Number(line.debit) && !Number(line.credit))))
                return setError(`Entry ${i + 1}: Add at least two complete account lines with an account and an amount.`);
            if (item.lines.some(line => Number(line.debit) > 0 && Number(line.credit) > 0))
                return setError(`Entry ${i + 1}: A line cannot contain both debit and credit amounts.`);
            if (item.lines.some(line => Number(line.debit) < 0 || Number(line.credit) < 0))
                return setError(`Entry ${i + 1}: Debit and credit amounts cannot be negative.`);
            if (status === "Posted" && !(debit > 0 && Math.abs(debit - credit) < 0.005))
                return setError(`Entry ${i + 1} is not balanced. Balance each entry before posting.`);
        }

        if (status === "Posted" && !(overallDebit > 0 && Math.abs(overallDebit - overallCredit) < 0.005))
            return setError("The overall journal report is not balanced. Total debit and total credit must be equal before posting.");

        const children = form.entries.map((item, index) => ({
            ...item,
            ref: item.ref || (index === 0 ? entry.ref : `${entry.ref || "JE"}-${index + 1}`),
            companyName: form.companyName,
            reportTitle: form.reportTitle,
            period: form.period,
            status,
            notes: item.notes || "",
        }));

        onSave({
            id: entry.id,
            ref: entry.ref,
            date: children[0]?.date || new Date().toISOString().slice(0, 10),
            description: `${children.length} transactions`,
            companyName: form.companyName,
            reportTitle: form.reportTitle,
            period: form.period,
            status,
            entries: children,
        });
    };

    return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#07111F]/80 p-3 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>

        <div role="dialog" aria-modal="true" className="my-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#172B40] to-[#091725] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                <div className="flex items-center gap-3">

                    <span className="rounded-lg bg-[#A9E5D2]/10 p-2 text-[#A9E5D2]"><NotebookPen size={18} /></span>

                    <div>

                        <h2 className="font-semibold text-white">{readOnly ? "Journal Entry Details" : entry.id ? "Edit Journal Entry" : "New Journal Entries"}</h2>

                        <p className="mt-0.5 text-[11px] text-white/40">Record each transaction and balance every entry individually.</p>

                    </div>

                </div>

                <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-white"><X size={18} /></button>

            </div>

            <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5">

                <div className="grid gap-4 sm:grid-cols-3">

                    <div><label className={label}>Company Name</label><input disabled={readOnly} className={field} value={form.companyName} onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))} placeholder="Enter company name" /></div>

                    <div><label className={label}>Title of Report</label><input disabled={readOnly} className={field} value={form.reportTitle} onChange={e => setForm(prev => ({ ...prev, reportTitle: e.target.value }))} placeholder="e.g. Chart of Accounts" /></div>

                    <div><label className={label}>Period</label><input disabled={readOnly} className={field} value={form.period} onChange={e => setForm(prev => ({ ...prev, period: e.target.value }))} placeholder="End of Month" /></div>

                </div>



                {form.entries.map((item, entryIndex) => {

                    const { debit, credit } = totalsFor(item);

                    const hasEntryInput = item.lines.some(line => line.code || String(line.debit ?? "").trim() !== "" || String(line.credit ?? "").trim() !== "");
                    const balanced = debit > 0 && Math.abs(debit - credit) < 0.005;

                    return <section key={item.id || entryIndex} className="space-y-4 rounded-xl border border-white/10 p-4">

                        <div className="grid gap-3 sm:grid-cols-2">

                            <div><label className={label}>Entry Title</label><input disabled={readOnly} className={field} value={item.description} onChange={e => updateEntry(entryIndex, "description", e.target.value)} placeholder="e.g. Starting Capital" /></div>

                            <div><label className={label}>Date</label><input disabled={readOnly} type="date" className={field} value={item.date} onChange={e => updateEntry(entryIndex, "date", e.target.value)} /></div>

                        </div>

                        <div className="space-y-3 rounded-lg border border-white/10 p-3">

                            {item.lines.map((line, lineIndex) => <div key={lineIndex} className="grid items-end gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,.7fr)_minmax(0,.7fr)_auto]">

                                <div><label className={label}>Account Title</label><select disabled={readOnly} className={field} value={line.code} onChange={e => chooseAccount(entryIndex, lineIndex, e.target.value)}><option value="">Select account</option>{accounts.filter(account => account.status === "Active").map(account => <option key={account.code} value={account.code}>{account.code} - {account.title}</option>)}</select></div>

                                <div><label className={label}>Debit (₱)</label><input disabled={readOnly} type="number" min="0" step="0.01" className={field} value={line.debit} onChange={e => updateLine(entryIndex, lineIndex, "debit", e.target.value)} placeholder="0.00" /></div>

                                <div><label className={label}>Credit (₱)</label><input disabled={readOnly} type="number" min="0" step="0.01" className={field} value={line.credit} onChange={e => updateLine(entryIndex, lineIndex, "credit", e.target.value)} placeholder="0.00" /></div>

                                {!readOnly && <button disabled={item.lines.length <= 2} onClick={() => setForm(prev => ({ ...prev, entries: prev.entries.map((entryItem, i) => i === entryIndex ? { ...entryItem, lines: entryItem.lines.filter((_, j) => j !== lineIndex) } : entryItem) }))} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10 disabled:opacity-25"><Trash2 size={14} /></button>}

                            </div>)}

                            {!readOnly && <button onClick={() => setForm(prev => ({ ...prev, entries: prev.entries.map((entryItem, i) => i === entryIndex ? { ...entryItem, lines: [...entryItem.lines, blankLine()] } : entryItem) }))} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-[11px] font-semibold text-white/75 hover:bg-white/5"><Plus size={13} /> Add Line</button>}

                        </div>

                        <div><label className={label}>Explanation</label><textarea disabled={readOnly} rows={2} className={`${field} resize-none`} value={item.notes} onChange={e => updateEntry(entryIndex, "notes", e.target.value)} placeholder="Explain this transaction..." /></div>

                        {hasEntryInput && <div className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${balanced ? "border-emerald-400/20 bg-emerald-400/[0.07]" : "border-amber-400/20 bg-amber-400/[0.06]"}`}>

                            <div className="flex items-center gap-2">{balanced ? <CheckCircle2 className="text-emerald-300" size={18} /> : <AlertTriangle className="text-amber-300" size={18} />}<div><p className={`text-xs font-semibold ${balanced ? "text-emerald-200" : "text-amber-200"}`}>{balanced ? "Balanced Entry" : "Entry Not Balanced"}</p><p className="mt-0.5 text-[10px] text-white/45">{balanced ? "Total debit and credit are equal." : `Difference: ${money(Math.abs(debit - credit))}`}</p></div></div>

                            <div className="flex gap-4 text-xs"><span className="text-white/50">Total Debits <b className="ml-1 text-white">{money(debit)}</b></span><span className="text-white/50">Total Credits <b className="ml-1 text-white">{money(credit)}</b></span></div>

                        </div>}

                    </section>;

                })}

                {(() => {
                    const hasAnyEntryInput = form.entries.some(item => item.lines.some(line => line.code || String(line.debit ?? "").trim() !== "" || String(line.credit ?? "").trim() !== ""));
                    if (!hasAnyEntryInput) return null;
                    const overall = form.entries.reduce((totals, item) => {
                        const itemTotals = totalsFor(item);
                        return { debit: totals.debit + itemTotals.debit, credit: totals.credit + itemTotals.credit };
                    }, { debit: 0, credit: 0 });
                    const balanced = overall.debit > 0 && Math.abs(overall.debit - overall.credit) < 0.005;
                    return <div className={`rounded-xl border p-4 ${balanced ? "border-emerald-400/20 bg-emerald-400/[0.07]" : "border-amber-400/20 bg-amber-400/[0.06]"}`}>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {balanced ? <CheckCircle2 size={18} className="text-emerald-300" /> : <AlertTriangle size={18} className="text-amber-300" />}
                                <div><p className="text-xs font-semibold text-white">Overall Journal Report Balance</p>
                                <p className="mt-0.5 text-[10px] text-white/45">{balanced ? "Combined debit and credit are equal." : `Overall difference: ${money(Math.abs(overall.debit - overall.credit))}`}</p></div>
                            </div>
                            <span className={`text-xs font-bold ${balanced ? "text-emerald-300" : "text-amber-300"}`}>{balanced ? "Balanced" : "Not Balanced"}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-lg bg-black/10 p-3"><p className="text-white/45">Overall Total Debit</p><b className="mt-1 block text-white">{money(overall.debit)}</b></div>
                            <div className="rounded-lg bg-black/10 p-3"><p className="text-white/45">Overall Total Credit</p><b className="mt-1 block text-white">{money(overall.credit)}</b></div>
                        </div>
                    </div>;
                })()}

                {!readOnly && <div className="flex flex-wrap items-center gap-2">

                    <button onClick={() => setForm(prev => ({ ...prev, entries: [...prev.entries, { ...blankEntry(), ref: "" }] }))} className="inline-flex items-center gap-2 rounded-lg border border-[#A9E5D2]/25 px-3 py-2.5 text-xs font-semibold text-[#A9E5D2] hover:bg-[#A9E5D2]/10"><Plus size={14} /> Add Another Entry</button>

                    <button disabled={form.entries.length <= 1} onClick={() => { setForm(prev => ({ ...prev, entries: prev.entries.slice(0, -1) })); setShowRemoveSuccess(true); }} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={14} /> Remove Entry</button>



                </div>}

                {error && <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3 text-xs text-rose-200">{error}</p>}

            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-5 py-4 sm:flex-row sm:justify-between">

                <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/65 hover:bg-white/5">{readOnly ? "Close" : "Cancel"}</button>

                {!readOnly && <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => save("Draft")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/5"><Save size={15} /> Save as Draft</button><button onClick={() => save("Posted")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#A9E5D2] px-5 py-2.5 text-sm font-bold text-[#0B1728] hover:bg-[#c5f3e5]"><Send size={15} /> Validate &amp; Post Entries</button></div>}

            </div>

        </div>

        {showRemoveSuccess && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#07111F]/75 p-4 backdrop-blur-sm">

            <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-[#172B40] to-[#091725] p-6 text-center shadow-2xl">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">

                    <CheckCircle2 size={28} />

                </div>

                <h3 className="mt-4 text-base font-semibold text-white">Entry Removed Successfully</h3>

                <p className="mt-2 text-xs leading-5 text-white/50">The entry has been removed from this journal report.</p>

                <button onClick={() => setShowRemoveSuccess(false)} className="mt-5 w-full rounded-xl bg-[#A9E5D2] px-4 py-2.5 text-sm font-bold text-[#0B1728] hover:bg-[#c5f3e5]">Okay</button>

            </div>

        </div>}

    </div>;

}



export default function StudentJournalEntries() {

    const [entries, setEntries] = useState(groupedInitialEntries);

    const [accounts, setAccounts] = useState(() => {

        try {

            const saved = sessionStorage.getItem("accentra_student_accounts");

            const parsed = saved ? JSON.parse(saved) : null;

            return Array.isArray(parsed) ? parsed : seedAccounts;

        }

        catch {

            return seedAccounts;

        }

    });

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("All Status");

    const [from, setFrom] = useState("");

    const [to, setTo] = useState("");

    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [selected, setSelected] = useState(groupedInitialEntries[0]);

    const [period, setPeriod] = useState("End of Month");

    const [activeTask, setActiveTask] = useState(() => {

        try {

            return JSON.parse(sessionStorage.getItem("accentra_active_task") || "null");

        }

        catch {

            return null;

        }

    });

    useEffect(() => {

        const loadAccounts = () => {

            try {

                const saved = sessionStorage.getItem("accentra_student_accounts");

                const parsed = saved ? JSON.parse(saved) : null;

                if (Array.isArray(parsed)) {

                    setAccounts(parsed);

                }

            }

            catch {

      

            }

        };

        loadAccounts();

        window.addEventListener("focus", loadAccounts);

        window.addEventListener("storage", loadAccounts);

        return () => {

            window.removeEventListener("focus", loadAccounts);

            window.removeEventListener("storage", loadAccounts);

        };

    }, []);

    const pageSize = 10;

    const filtered = useMemo(() => entries.filter(e => {
        const children = getReportEntries(e);
        const searchText = [e.ref, e.description, ...children.flatMap(item => [item.description, ...item.lines.map(line => line.title || "")])].join(" ").toLowerCase();
        const dates = children.map(item => item.date).filter(Boolean);
        return searchText.includes(search.toLowerCase()) &&
            (statusFilter === "All Status" || e.status === statusFilter) &&
            (!from || dates.some(date => date >= from)) &&
            (!to || dates.some(date => date <= to));
    }), [entries, search, statusFilter, from, to]);
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

    const shown = filtered.slice((page - 1) * pageSize, page * pageSize);

    const totalPosted = entries.filter(e => e.status === "Posted").length;
    const totalDraft = entries.filter(e => e.status === "Draft").length;
    const unbalanced = entries.reduce((count, report) => count + getReportEntries(report).filter(item => {
        const debit = item.lines.reduce((n, line) => n + Number(line.debit || 0), 0);
        const credit = item.lines.reduce((n, line) => n + Number(line.credit || 0), 0);
        return !(debit > 0 && Math.abs(debit - credit) < 0.005);
    }).length, 0);
    const openNew = () => setModal({ mode: "edit", entry: { ...blankEntry(), ref: `JE-${String(Math.max(0, ...entries.map(e => Number(e.ref?.split("-")[1]) || 0)) + 1).padStart(3, "0")}` } });

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

    const saveEntry = report => {
        const saved = {
            ...report,
            id: report.id || Date.now(),
            ref: report.ref || `JE-${String(entries.length + 1).padStart(3, "0")}`,
        };
        setEntries(prev => {
            const index = prev.findIndex(existing => existing.id === saved.id);
            if (index >= 0) return prev.map(existing => existing.id === saved.id ? saved : existing);
            return [...prev, saved];
        });
        setSelected(saved);
        setModal(null);
    };

    const deleteEntry = (entry) => {

        if (entry.status === "Posted") return;

        setDeleteTarget(entry);

    };

    const confirmDelete = () => {

        if (!deleteTarget) return;

        setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));

        if (selected?.id === deleteTarget.id) setSelected(null);

        setDeleteTarget(null);

    };

    const resetFilters = () => { setSearch(""); setStatusFilter("All Status"); setFrom(""); setTo(""); setPage(1); };

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

                                <option>All Status</option>

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
                                const children = getReportEntries(e);
                                const { debit: d, credit: c } = getReportTotals(e);
                                const accountTitles = [...new Set(children.flatMap(item => item.lines.map(line => line.title?.trim()).filter(Boolean)))];
                                const dateLabel = new Date(`${e.date || children[0]?.date}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" });
                                const description = `${children.length} transactions`;
                                return <tr key={e.id} onClick={() => setSelected(e)} className={`cursor-pointer hover:bg-[#A9E5D2]/[0.04] ${selected?.id === e.id ? "bg-[#A9E5D2]/[0.05]" : ""}`}>
                                    <td className="px-3 py-3 text-white/35">{(page - 1) * pageSize + i + 1}</td>
                                    <td className="px-3 py-3 font-semibold text-white/80">{e.ref}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-white/55">{dateLabel}</td>
                                    <td className="max-w-[180px] px-3 py-3 text-white/70"><div className="max-w-[180px] space-y-1">{accountTitles.slice(0, 4).map((title, lineIndex) => <div key={lineIndex} className="truncate">{title}</div>)}{accountTitles.length > 4 && <div className="text-white/35">+{accountTitles.length - 4} more</div>}</div></td>
                                    <td className="max-w-[180px] truncate px-3 py-3 text-white/70">{description}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-white/65">{money(d)}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-white/65">{money(c)}</td>
                                    <td className="px-3 py-3"><Status value={e.status} /></td>
                                    <td className="px-3 py-3"><div className="flex gap-1">
                                        <button title="View" onClick={ev => { ev.stopPropagation(); setSelected(e); setModal({ mode: "view", entry: e }); }} className="rounded-md bg-sky-400/10 p-1.5 text-sky-300 transition hover:bg-sky-400/20"><Eye size={14} /></button>
                                        <button title="Edit" disabled={e.status === "Posted"} onClick={ev => { ev.stopPropagation(); setModal({ mode: "edit", entry: e }); }} className="rounded-md bg-sky-400/10 p-1.5 text-sky-300 transition hover:bg-sky-400/20 disabled:opacity-25"><Pencil size={14} /></button>
                                        <button title="Delete" disabled={e.status === "Posted"} onClick={ev => { ev.stopPropagation(); deleteEntry(e); }} className="rounded-md bg-rose-400/10 p-1.5 text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-25"><Trash2 size={14} /></button>
                                    </div></td>
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

                <Panel title="Journal Entry Details" icon={FileText}>{selected ? (() => {
                    const firstEntry = getReportEntries(selected)[0];
                    const debit = firstEntry.lines.reduce((n, line) => n + Number(line.debit || 0), 0);
                    const credit = firstEntry.lines.reduce((n, line) => n + Number(line.credit || 0), 0);
                    const balanced = debit > 0 && Math.abs(debit - credit) < 0.005;
                    return <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A9E5D2]/10 text-[#A9E5D2]"><FileText size={20} /></div>
                                <div><h3 className="font-bold">{selected.ref}</h3><p className="mt-0.5 text-xs text-white/50">{firstEntry.description || "Journal Entry"}</p></div>
                            </div>
                            <Status value={selected.status} />
                        </div>
                        <div className="my-5 space-y-3 border-y border-white/[0.07] py-4 text-xs">
                            <div className="flex justify-between gap-3"><span className="text-white/40">Date</span><span>{firstEntry.date || selected.date || "—"}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-white/40">Company Name</span><span>{selected.companyName || "—"}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-white/40">Title of Report</span><span>{selected.reportTitle || "—"}</span></div>
                            <div className="flex justify-between gap-3"><span className="text-white/40">Account Period</span><span>{selected.period || period}</span></div>
                        </div>
                        <div className="space-y-2">
                            {firstEntry.lines.map((line, lineIndex) => <div key={lineIndex} className="rounded-lg border border-white/[0.06] p-3">
                                <p className="text-xs font-semibold text-white/80">{line.code} · {line.title}</p>
                                <div className="mt-2 flex justify-between gap-3 text-[11px]"><span className="text-white/40">Debit: {money(line.debit)}</span><span className="text-white/40">Credit: {money(line.credit)}</span></div>
                            </div>)}
                        </div>
                        {firstEntry.notes && <p className="mt-3 text-[11px] text-white/55"><span className="font-semibold text-white/70">Explanation: </span>{firstEntry.notes}</p>}
                        <div className={`mt-4 rounded-xl border p-3 text-xs ${balanced ? "border-emerald-400/20 bg-emerald-400/[0.07]" : "border-amber-400/20 bg-amber-400/[0.06]"}`}>
                            <div className="mb-2 flex items-center justify-between"><b className="text-white">Entry Balance</b><span className={balanced ? "text-emerald-300" : "text-amber-300"}>{balanced ? "Balanced" : "Not Balanced"}</span></div>
                            <div className="flex justify-between"><span className="text-white/45">Total Debit</span><b>{money(debit)}</b></div>
                            <div className="mt-2 flex justify-between"><span className="text-white/45">Total Credit</span><b>{money(credit)}</b></div>
                            <div className="mt-2 flex justify-between"><span className="text-white/45">Difference</span><b>{money(Math.abs(debit - credit))}</b></div>
                        </div>
                        <button onClick={() => setModal({ mode: "view", entry: selected })} className="mt-4 w-full rounded-lg border border-[#A9E5D2]/25 px-3 py-2.5 text-xs font-semibold text-[#A9E5D2] hover:bg-[#A9E5D2]/10"><Eye size={13} className="mr-1 inline" />View Full Details</button>
                    </div>;
                })() : <div className="p-10 text-center text-sm text-white/40">Select an entry to view its details.</div>}</Panel>
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
