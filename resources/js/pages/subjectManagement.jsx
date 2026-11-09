import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  UserRound,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";
import MobileOverlay from "../components/layout/mobileOverlay";

const panelClass =
  "overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]";

const fieldClass =
  "w-full rounded-xl border border-white/20 bg-[#0B1D2D] px-3.5 py-2.5 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-white/55 hover:border-[#A9E5D2]/40 focus:border-[#A9E5D2]/75 focus:bg-[#102A3D] focus:ring-4 focus:ring-[#A9E5D2]/15";

const labelClass = "mb-1.5 block text-xs font-semibold text-white/65";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(71,127,115,0.22)] transition hover:bg-[#568F81] active:scale-[0.98]";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.10] hover:text-white";

function ModalShell({ children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020912]/75 px-4 py-6 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className={`${panelClass} my-auto max-h-[90vh] w-full ${wide ? "max-w-6xl" : "max-w-lg"} overflow-y-auto`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-slate-400/20 bg-slate-400/10 text-white/55"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
      {status || "—"}
    </span>
  );
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "—";
}

function getInitialAssignments(records) {
  const initial = {};
  records.forEach((person) => {
    const values = Array.isArray(person.subjects)
      ? person.subjects.map((item) => typeof item === "string" ? item : item?.name)
      : Array.isArray(person.subject)
        ? person.subject.map((item) => typeof item === "string" ? item : item?.name)
        : person.subject
          ? [typeof person.subject === "string" ? person.subject : person.subject?.name]
          : [];
    initial[person.id] = values.filter(Boolean);
  });
  return initial;
}

export default function SubjectManagement() {
  const { subjects: databaseSubjects = [], faculty = [], students = [] } = usePage().props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Subject");

  const [catalogueType, setCatalogueType] = useState("faculty");

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalType, setModalType] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteSubject, setDeleteSubject] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [subjectForm, setSubjectForm] = useState({
    id: "",
    code: "",
    name: "",
    description: "",
  });

  const isFaculty = catalogueType === "faculty";
  const subjects = databaseSubjects
    .filter((subject) => (subject.catalogue || "faculty") === catalogueType)
    .map((subject) => ({
      ...subject,
      id: subject.id,
      code: subject.subject_code,
      name: subject.subject_name,
    }));
  const people = isFaculty ? faculty : students;
  const assignments = useMemo(
    () => getInitialAssignments(people),
    [people]
  );
  const peopleTypeLabel = isFaculty ? "Faculty" : "Students";

  const filteredSubjects = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return subjects.filter((subject) =>
      [subject.code, subject.name, subject.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [subjects, searchValue]);

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredSubjects.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedSubjects = filteredSubjects.slice(startIndex, startIndex + itemsPerPage);

  const assignedPeopleCount = people.filter((person) =>
    (assignments[person.id] || []).length > 0
  ).length;

  const selectedMembers = useMemo(() => {
    if (!selectedSubject) return [];
    const query = memberSearch.trim().toLowerCase();
    return people.filter((person) =>
      (assignments[person.id] || []).some(
        (subjectName) => subjectName.toLowerCase() === selectedSubject.name.toLowerCase()
      )
    ).filter((person) =>
      !query ||
      [person.id, person.name, person.email, person.section, person.yearLevel, person.specialization]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [selectedSubject, people, assignments, memberSearch]);

  const getAssignedCount = (subject) =>
    people.filter((person) =>
      (assignments[person.id] || []).some(
        (subjectName) => subjectName.toLowerCase() === subject.name.toLowerCase()
      )
    ).length;

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const getTodayDate = () =>
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const openAddSubject = () => {
    setSubjectForm({ id: "", code: "", name: "", description: "", status: "Active" });
    setSelectedSubject(null);
    setModalType("add-subject");
  };

  const openViewSubject = (subject) => {
    setSelectedSubject(subject);
    setMemberSearch("");
    setModalType("view-subject");
  };

  const openEditSubject = (subject) => {
    setSelectedSubject(subject);
    setSubjectForm({ id: subject.id, code: subject.code, name: subject.name, description: subject.description || "", status: subject.status || "Active" });
    setModalType("edit-subject");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedSubject(null);
    setMemberSearch("");
  };

  const handleSubjectFormChange = (event) => {
    const { name, value } = event.target;
    setSubjectForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubjectSubmit = (event) => {
    event.preventDefault();

    const duplicateCode = subjects.some(
      (subject) =>
        subject.code.trim().toLowerCase() === subjectForm.code.trim().toLowerCase() &&
        String(subject.id) !== String(subjectForm.id)
    );

    if (duplicateCode) {
      window.alert("A subject with this subject code already exists in this catalogue.");
      return;
    }

    const payload = {
      subject_code: subjectForm.code.trim().toUpperCase(),
      subject_name: subjectForm.name.trim(),
      description: subjectForm.description.trim(),
      catalogue: catalogueType,
      status: subjectForm.status || "Active",
    };

    if (modalType === "add-subject") {
      router.post("/subjects", payload, {
        preserveScroll: true,
        onSuccess: closeModal,
      });
    } else {
      router.put(`/subjects/${subjectForm.id}`, payload, {
        preserveScroll: true,
        onSuccess: closeModal,
      });
    }
  };

  const confirmDeleteSubject = () => {
    if (!deleteSubject) return;

    router.delete(`/subjects/${deleteSubject.id}`, {
      preserveScroll: true,
      onSuccess: () => setDeleteSubject(null),
    });
  };

  const resetFilters = () => {
    setSearchValue("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(searchValue);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#071522] font-sans text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />
        <div className="absolute -left-36 top-16 h-[420px] w-[420px] rounded-full bg-[#477F73]/25 blur-[120px]" />
        <div className="absolute right-[-100px] top-[-60px] h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" />
        <div className="absolute bottom-[-100px] left-[35%] h-[320px] w-[480px] rounded-full bg-[#477F73]/10 blur-[110px]" />
      </div>

      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} open={sidebarOpen} />
      <MobileOverlay open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative z-10 ml-[260px] min-h-screen w-[calc(100%-260px)] min-w-0 px-[30px] py-[25px] transition-all duration-300 max-[1100px]:px-6 max-[768px]:ml-0 max-[768px]:w-full max-[768px]:px-[18px] max-[768px]:py-[18px] max-[480px]:px-[14px] max-[480px]:py-[14px]">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} showPageInfo={false} showSearch={false} />

        <div className="mt-6 min-w-0 space-y-5">
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A9E5D2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A9E5D2]" />
                Administration
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Subject Management</h1>
              <p className="mt-1 text-sm text-white/55">
                Manage the shared subject list for Faculty and Students.
              </p>
            </div>
            <button type="button" onClick={openAddSubject} className={`${primaryButton} h-10 shrink-0 max-[640px]:w-full`}>
              <Plus size={17} />
              Add Subject
            </button>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                label: "Total Subjects",
                value: subjects.length,
                note: `Subjects in the ${isFaculty ? "faculty" : "student"} catalogue`,
                icon: BookOpen,
                accent: "border-[#A9E5D2]/20 bg-[#477F73]/20 text-[#A9E5D2]",
              },
              {
                label: isFaculty ? "Assigned Faculty" : "Assigned Students",
                value: assignedPeopleCount,
                note: `With ${isFaculty ? "faculty" : "student"} subject assignments`,
                icon: isFaculty ? GraduationCap : Users,
                accent: "border-sky-200/15 bg-sky-400/10 text-sky-200",
              },
            ].map(({ label, value, note, icon: Icon, accent }) => (
              <div key={label} className={`${panelClass} group relative min-h-[96px] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20`}>
                <div className="absolute -right-4 -top-5 h-16 w-16 rounded-full bg-white/[0.025] blur-2xl" />
                <div className="relative flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-white/55">{label}</span>
                    <strong className="mt-1 block text-2xl font-bold tracking-tight text-white">{value}</strong>
                    <span className="mt-0.5 block text-[10px] text-white/35">{note}</span>
                  </div>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accent}`}>
                    <Icon size={19} />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-px w-full bg-[#A9E5D2]/30" />
              </div>
            ))}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-white/10 bg-[#071522]/70 p-1">
              <button
                type="button"
                onClick={() => { setCatalogueType("faculty"); setCurrentPage(1); setSearchValue(""); }}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  isFaculty ? "bg-[#477F73] text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <GraduationCap size={15} />
                Faculty
              </button>
              <button
                type="button"
                onClick={() => { setCatalogueType("student"); setCurrentPage(1); setSearchValue(""); }}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  !isFaculty ? "bg-[#477F73] text-white" : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <UserRound size={15} />
                Students
              </button>
            </div>
            <span className="text-xs font-medium text-white/40">Subject List / {peopleTypeLabel}</span>
          </div>

          <section className={`${panelClass} min-w-0`}>
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-[#A9E5D2]" />
                    <h2 className="text-[15px] font-bold tracking-tight text-white">
                      {isFaculty ? "Subject List" : "Subject List"}
                    </h2>
                  </div>
                  <p className="mt-1 pl-3 text-xs text-white/45">
                    View and manage subjects for {isFaculty ? "faculty members" : "students"}.
                  </p>
                </div>
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/55">
                  {filteredSubjects.length} {filteredSubjects.length === 1 ? "record" : "records"}
                </span>
              </div>
            </div>

            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex h-10 min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-[#071522]/70 px-3.5 text-white/45 transition focus-within:border-[#A9E5D2]/40 focus-within:ring-4 focus-within:ring-[#A9E5D2]/[0.07]">
                <Search size={17} className="shrink-0" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => { setSearchValue(event.target.value); setCurrentPage(1); }}
                  placeholder="Search subject code, name, or description..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
                {searchValue && (
                  <button type="button" onClick={() => { setSearchValue(""); setCurrentPage(1); }} className="rounded-md p-1 text-white/45 transition hover:bg-white/10 hover:text-white" aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed border-collapse">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[25%]" />
                  <col className="w-[30%]" />
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead>
                  <tr className="h-12 border-b border-white/10 bg-white/[0.035]">
                    {["Subject Code", "Subject Name", "Description", "Assigned", "Actions"].map((heading) => (
                      <th key={heading} className={`px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-white/40 ${heading === "Actions" ? "text-center" : ""}`}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubjects.length > 0 ? paginatedSubjects.map((subject) => (
                    <tr key={subject.id} className="h-[82px] border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/[0.035]">
                      <td className="px-5 py-4 align-middle">
                        <span className="whitespace-nowrap rounded-md border border-[#A9E5D2]/15 bg-[#477F73]/10 px-2 py-1 text-[11px] font-bold text-[#A9E5D2]">{subject.code}</span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="line-clamp-2 text-sm font-semibold leading-5 text-white/90">{subject.name}</div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <p className="line-clamp-2 max-h-10 overflow-hidden text-xs leading-5 text-white/50">{subject.description || "No description provided."}</p>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-white/65">
                          <Users size={13} />
                          {getAssignedCount(subject)}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" title="View" aria-label={`View ${subject.name}`} onClick={() => openViewSubject(subject)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#75A99A]/30 hover:bg-[#477F73]/20 hover:text-[#B5D5CB] active:scale-95"><Eye size={15} /></button>
                          <button type="button" title="Edit" aria-label={`Edit ${subject.name}`} onClick={() => openEditSubject(subject)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-400/[0.06] text-sky-300 transition hover:bg-sky-400/15 active:scale-95"><Pencil size={15} /></button>
                          <button type="button" title="Delete" aria-label={`Delete ${subject.name}`} onClick={() => setDeleteSubject(subject)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/[0.06] text-rose-300 transition hover:bg-rose-400/15 active:scale-95"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-14 text-center">
                        <div className="mx-auto flex max-w-xs flex-col items-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35"><BookOpen size={24} /></div>
                          <strong className="text-sm font-semibold text-white/80">No subjects found</strong>
                          <span className="mt-1 text-xs text-white/40">Try another search or add a subject to this list.</span>
                          {hasActiveFilters && <button type="button" onClick={resetFilters} className="mt-3 text-xs font-semibold text-[#A9E5D2] hover:text-white">Clear search</button>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredSubjects.length > 0 && (
              <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/10 px-5 py-4 max-[600px]:flex-col max-[600px]:items-start sm:px-6">
                <span className="text-xs font-medium text-white/45">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSubjects.length)} of {filteredSubjects.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button type="button" aria-label="Previous page" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/65 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={16} /></button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${safeCurrentPage === page ? "border-[#A9E5D2]/25 bg-[#477F73] text-white shadow-[0_3px_10px_rgba(71,127,115,0.2)]" : "border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.08] hover:text-white"}`}>{page}</button>
                  ))}
                  <button type="button" aria-label="Next page" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-white/65 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {modalType === "view-subject" && selectedSubject && (
        <ModalShell onClose={closeModal} wide>
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-[#142A43] via-[#18354B] to-[#234D50] px-5 py-5 sm:px-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]"><BookOpen size={25} /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">Subject Information</p>
                <h2 className="mt-1 text-xl font-bold text-white">{selectedSubject.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300">{selectedSubject.code}</span>
                  <span className="rounded-md border border-[#A9E5D2]/20 bg-[#477F73]/15 px-2 py-1 text-xs font-semibold text-[#B5D5CB]">{peopleTypeLabel} Catalogue</span>
                </div>
              </div>
            </div>
            <button type="button" onClick={closeModal} aria-label="Close modal" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>
          </div>

          <div className="grid grid-cols-1 gap-5 bg-[#0E1A2A] p-5 lg:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071522]/70">
              <div className="border-b border-white/[0.07] px-4 py-4">
                <h3 className="text-sm font-bold text-white">Subject Details</h3>
                <p className="mt-1 text-xs text-white/35">Subject information in the {isFaculty ? "faculty" : "student"} catalogue.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                {[
                  ["Subject Code", selectedSubject.code],
                  ["Subject Name", selectedSubject.name],
                  ["Catalogue", peopleTypeLabel],
                  ["Assigned", `${getAssignedCount(selectedSubject)} ${isFaculty ? "faculty" : "students"}`],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                    <span className={labelClass}>{label}</span>
                    <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">{value}</strong>
                  </div>
                ))}
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 sm:col-span-2">
                  <span className={labelClass}>Description</span>
                  <strong className="mt-1 block break-words text-sm font-semibold leading-6 text-slate-100">{selectedSubject.description || "No description provided."}</strong>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071522]/70">
              <div className="border-b border-white/[0.07] px-4 py-4">
                <h3 className="text-sm font-bold text-white">{isFaculty ? "Assigned Faculty" : "Enrolled Students"}</h3>
                <p className="mt-1 text-xs text-white/35">List of {isFaculty ? "faculty members" : "students"} assigned to this subject.</p>
              </div>
              <div className="border-b border-white/[0.07] bg-[#101D2F]/70 p-4">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0D1929] px-3 text-white/55 focus-within:border-[#75A99A]/50">
                  <Search size={16} />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder={`Search ${isFaculty ? "faculty" : "students"}...`}
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>
              <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-[#17273B]/80">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">{isFaculty ? "Faculty Member" : "Student"}</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">{isFaculty ? "Specialization" : "Section / Year"}</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMembers.length > 0 ? selectedMembers.map((person) => (
                      <tr key={person.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/20 text-xs font-bold text-[#B5D5CB]">{getInitials(person.name)}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-200">{person.name}</p>
                              <p className="text-[11px] text-white/35">{person.id}</p>
                              {person.email && <p className="break-all text-[11px] text-white/35">{person.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-300">
                          {isFaculty ? person.specialization || "—" : `${person.section || "No section"}${person.yearLevel ? ` · ${person.yearLevel}` : ""}`}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={person.status} /></td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45"><Users size={22} /></div>
                            <strong className="mt-3 text-sm text-slate-200">{memberSearch.trim() ? "No matching records" : `No ${isFaculty ? "faculty" : "students"} assigned`}</strong>
                            <p className="mt-1 text-xs text-white/35">{memberSearch.trim() ? "Try another search term." : `No ${isFaculty ? "faculty members" : "students"} are currently assigned to this subject.`}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/[0.07] bg-[#101D2F]/60 px-4 py-3">
                <p className="text-xs text-white/35">{getAssignedCount(selectedSubject)} {isFaculty ? "faculty members" : "students"} assigned</p>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4">
            <button type="button" onClick={() => openEditSubject(selectedSubject)} className={secondaryButton}><Pencil size={16} /> Edit Subject</button>
            <button type="button" onClick={closeModal} className={primaryButton}>Close</button>
          </div>
        </ModalShell>
      )}

      {(modalType === "add-subject" || modalType === "edit-subject") && (
        <ModalShell onClose={closeModal}>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]"><BookOpen size={22} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">{isFaculty ? "Faculty Catalogue" : "Student Catalogue"}</p>
                <h2 className="mt-1 text-xl font-bold text-white">{modalType === "add-subject" ? "Add Subject" : "Edit Subject"}</h2>
                <p className="mt-1 text-xs text-white/55">{modalType === "add-subject" ? "Add this subject to both Faculty and Student catalogues." : "Update the selected subject details."}</p>
              </div>
            </div>
            <button type="button" onClick={closeModal} aria-label="Close modal" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>
          </div>
          <form onSubmit={handleSubjectSubmit}>
            <div className="bg-[#0E1A2A] px-6 py-6">
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#75A99A]/15 bg-[#477F73]/10 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#477F73] text-white"><BookOpen size={18} /></div>
                <div>
                  <h3 className="text-sm font-bold text-white">Subject Information</h3>
                  <p className="mt-0.5 text-xs text-white/35">Provide the subject code, name, and description.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#071522]/70 p-5 shadow-xl">
                <div>
                  <label htmlFor="subject-code" className={labelClass}>Subject Code</label>
                  <input id="subject-code" name="code" value={subjectForm.code} onChange={handleSubjectFormChange} placeholder="e.g. ACC101" required className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="subject-name" className={labelClass}>Subject Name</label>
                  <input id="subject-name" name="name" value={subjectForm.name} onChange={handleSubjectFormChange} placeholder="Enter subject name" required className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="subject-description" className={labelClass}>Description</label>
                  <textarea id="subject-description" name="description" value={subjectForm.description} onChange={handleSubjectFormChange} placeholder="Enter a short subject description" rows={4} className={`${fieldClass} resize-y`} />
                </div>
                <div>
                  <label htmlFor="subject-status" className={labelClass}>Status</label>
                  <select id="subject-status" name="status" value={subjectForm.status || "Active"} onChange={handleSubjectFormChange} className={fieldClass}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4 max-[480px]:flex-col">
              <button type="button" onClick={closeModal} className={secondaryButton}>Cancel</button>
              <button type="submit" className={primaryButton}>{modalType === "add-subject" ? "Add Subject" : "Save Changes"}</button>
            </div>
          </form>
        </ModalShell>
      )}

      {deleteSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020912]/75 px-4 py-6 backdrop-blur-md" onMouseDown={() => setDeleteSubject(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-[22px]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-400"><Trash2 size={23} /></div>
            <h2 className="mt-4 text-lg font-bold text-white">Delete Subject?</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Are you sure you want to delete <strong className="font-semibold text-white/85">{deleteSubject.name}</strong> from the {catalogueType} subject list? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteSubject(null)} className="h-10 rounded-xl border border-white/[0.14] bg-[#102337] px-4 text-xs font-semibold text-white/75 transition-all hover:bg-white/[0.08]">Cancel</button>
              <button type="button" onClick={confirmDeleteSubject} className="h-10 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md">Delete Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
