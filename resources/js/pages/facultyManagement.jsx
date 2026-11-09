import { useEffect, useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UserRoundCheck,
  UserRoundX,
  GraduationCap,
} from "lucide-react";

import Sidebar from "../components/layout/sidebar";
import Navbar from "../components/layout/navbar";
import MobileOverlay from "../components/layout/mobileOverlay";

const mapFaculty = (member) => ({
    databaseId: member.id,
    id: member.faculty_number,
    subjects: Array.isArray(member.subjects) ? member.subjects : [],
    name: member.name,
    email: member.email,
    specialization: member.specialization,
    contactNumber: member.contact_number || "",
    address: member.address || "",
    status: member.status,
    dateAdded: member.created_at
        ? new Date(member.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
          })
        : "",
});

const glassCard =
  "overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]";

const fieldClass =
  "w-full rounded-xl border border-white/20 bg-[#0B1D2D] px-3.5 py-2.5 text-sm font-medium text-white shadow-inner outline-none transition placeholder:text-white/55 hover:border-[#A9E5D2]/40 focus:border-[#A9E5D2]/75 focus:bg-[#102A3D] focus:ring-4 focus:ring-[#A9E5D2]/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-[#102337] disabled:text-white/60";

const labelClass = "mb-1.5 block text-xs font-semibold text-white/65";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(71,127,115,0.22)] transition hover:bg-[#568F81] active:scale-[0.98]";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:bg-white/[0.10] hover:text-white";

const iconButton =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-white/65 transition hover:border-white/25 hover:bg-white/[0.10] hover:text-white active:scale-95";

function ModalShell({ children, onClose, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#020912]/75 px-4 py-6 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <div
        className={`${glassCard} my-auto max-h-[90vh] w-full ${
          wide ? "max-w-3xl" : "max-w-lg"
        } overflow-y-auto`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function DetailCard({ label, children }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
      <span className={labelClass}>{label}</span>
      <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">
        {children || "—"}
      </strong>
    </div>
  );
}

// Supports multiple subjects and legacy single-subject records.
function getFacultySubjects(member) {
  if (Array.isArray(member?.subjects)) {
    return member.subjects
      .map((subject) =>
        typeof subject === "string" ? subject : subject?.name
      )
      .filter(Boolean);
  }

  if (Array.isArray(member?.subject)) {
    return member.subject
      .map((subject) =>
        typeof subject === "string" ? subject : subject?.name
      )
      .filter(Boolean);
  }

  if (member?.subject) {
    return [
      typeof member.subject === "string"
        ? member.subject
        : member.subject?.name,
    ].filter(Boolean);
  }

  return [];
}

export default function FacultyManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Faculty");
const {
    faculty: databaseFaculty = [],
    availableSubjects: databaseSubjects = [],
    nextFacultyId = "",
} = usePage().props;

// Subjects are loaded from the database by FacultyController.
const activeSubjects = databaseSubjects
    .filter((subject) => subject.status === "Active")
    .map((subject) => ({
        id: subject.id,
        code: subject.subject_code ?? subject.code ?? "",
        name: subject.subject_name ?? subject.name ?? "",
        description: subject.description ?? "",
    }));

const [faculty, setFaculty] = useState(() =>
    databaseFaculty.map(mapFaculty)
);


useEffect(() => {
    setFaculty(databaseFaculty.map(mapFaculty));
}, [databaseFaculty]);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalType, setModalType] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [deleteFaculty, setDeleteFaculty] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const facultyPerPage = 5;

  const [formData, setFormData] = useState({
    id: nextFacultyId,
    name: "",
    email: "",
    specialization: "",
    subjects: [],
    contactNumber: "",
    address: "",
    status: "Active",
    dateAdded: "",
  });

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const filteredFaculty = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return faculty.filter((member) => {
      const searchableValues = [
        member.id,
        member.name,
        member.email,
        member.specialization,
        member.contactNumber,
        member.address,
        getFacultySubjects(member).join(" "),
        member.status,
      ];

      const matchesSearch =
        !query ||
        searchableValues
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [faculty, searchValue, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFaculty.length / facultyPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * facultyPerPage;

  const paginatedFaculty = filteredFaculty.slice(
    startIndex,
    startIndex + facultyPerPage
  );

  const totalFaculty = faculty.length;

  const activeFaculty = faculty.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveFaculty = faculty.filter(
    (member) => member.status === "Inactive"
  ).length;

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const openAddModal = () => {
    setFormData({
      id: nextFacultyId,
      name: "",
      email: "",
      specialization: "",
      subjects: [],
      contactNumber: "",
      address: "",
      status: "Active",
      dateAdded: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    });

    setSelectedFaculty(null);
    setModalType("add");
  };

  const openEditModal = (member) => {
    setSelectedFaculty(member);

    setFormData({
      ...member,
      subjects: getFacultySubjects(member),
    });

    setModalType("edit");
  };

  const openViewModal = (member) => {
    setSelectedFaculty(member);
    setModalType("view");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedFaculty(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const toggleSubject = (subjectName) => {
    setFormData((current) => {
      const selectedSubjects = Array.isArray(current.subjects)
        ? current.subjects
        : [];

      return {
        ...current,
        subjects: selectedSubjects.includes(subjectName)
          ? selectedSubjects.filter((name) => name !== subjectName)
          : [...selectedSubjects, subjectName],
      };
    });
  };

  

  


const handleSubmit = (event) => {
    event.preventDefault();

    // ADD / EDIT FACULTY
    const payload = {
        name: formData.name,
        email: formData.email,
        specialization: formData.specialization,
        subjects: formData.subjects || [],
        contact_number: formData.contactNumber || null,
        address: formData.address || null,
        status: formData.status,
    };

    const options = {
        preserveScroll: true,

        onSuccess: () => {
            closeModal();
        },

        onError: (errors) => {
            console.error("Faculty errors:", errors);
            alert(Object.values(errors).join("\n"));
        },
    };

    if (modalType === "add") {
        router.post("/faculty", payload, options);
    }

    if (modalType === "edit" && selectedFaculty?.databaseId) {
        router.put(
            `/faculty/${selectedFaculty.databaseId}`,
            payload,
            options
        );
    }
};


  


  /* =======================================================
     ACCOUNT STATUS
  ======================================================= */

  
const toggleAccountStatus = (member) => {
    const newStatus =
        member.status === "Active" ? "Inactive" : "Active";

    router.patch(
        `/faculty/${member.databaseId}/status`,
        { status: newStatus },
        {
            preserveScroll: true,

            onError: (errors) => {
                console.error(errors);
                alert("Unable to update faculty status.");
            },
        }
    );
};


  /* =======================================================
     DELETE
  ======================================================= */

  
const confirmDelete = () => {
    if (!deleteFaculty?.databaseId) {
        alert("Faculty database ID is missing.");
        return;
    }

    router.delete(`/faculty/${deleteFaculty.databaseId}`, {
        preserveScroll: true,

        onSuccess: () => {
            setDeleteFaculty(null);
        },

        onError: (errors) => {
            console.error("Delete faculty failed:", errors);
            alert(Object.values(errors).join("\n"));
        },
    });
};


  const summaryCards = [
    {
      label: "Total Faculty",
      value: totalFaculty,
      icon: Users,
      accent: "navy",
      note: "Faculty accounts",
    },
    {
      label: "Active Accounts",
      value: activeFaculty,
      icon: UserRoundCheck,
      accent: "mint",
      note: "Currently active",
    },
    {
      label: "Inactive Accounts",
      value: inactiveFaculty,
      icon: UserRoundX,
      accent: "slate",
      note: "Currently inactive",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#071522] font-sans text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />

        <div className="absolute -left-36 top-16 h-[420px] w-[420px] rounded-full bg-[#477F73]/25 blur-[120px]" />

        <div className="absolute right-[-100px] top-[-60px] h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" />

        <div className="absolute bottom-[-100px] left-[35%] h-[320px] w-[480px] rounded-full bg-[#477F73]/10 blur-[110px]" />
      </div>

      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        open={sidebarOpen}
      />

      <MobileOverlay
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="relative z-10 ml-[260px] min-h-screen w-[calc(100%-260px)] min-w-0 px-[30px] py-[25px] transition-all duration-300 max-[1100px]:px-6 max-[768px]:ml-0 max-[768px]:w-full max-[768px]:px-[18px] max-[768px]:py-[18px] max-[480px]:px-[14px] max-[480px]:py-[14px]">
        <Navbar
          onMenuToggle={() => setSidebarOpen(true)}
          showPageInfo={false}
          showSearch={false}
        />

        <div className="mt-6 min-w-0 space-y-5">
          {/* Page Heading */}
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A9E5D2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A9E5D2]" />
                Administration
              </span>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Faculty Management
              </h1>

              <p className="mt-1 text-sm text-white/55">
                Manage faculty accounts and academic details.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className={`${primaryButton} h-10 shrink-0 max-[640px]:w-full`}
            >
              <Plus size={17} />
              Add Faculty
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map(({ label, value, icon: Icon, accent, note }) => {
              const tones = {
                navy: "bg-[#294B70]/25 text-[#C4D9F0] border-[#7292B4]/20",
                mint: "bg-[#477F73]/25 text-[#A9E5D2] border-[#A9E5D2]/20",
                slate: "bg-slate-400/10 text-slate-300 border-slate-300/15",
                blue: "bg-sky-400/10 text-sky-200 border-sky-200/15",
              };

              return (
                <div
                  key={label}
                  className={`${glassCard} group relative p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20`}
                >
                  <div className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-white/[0.06]" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-white/55">
                        {label}
                      </span>

                      <strong className="mt-2 block text-3xl font-bold tracking-tight text-white">
                        {value}
                      </strong>

                      <span className="mt-1.5 block text-[11px] text-white/35">
                        {note}
                      </span>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tones[accent]}`}
                    >
                      <Icon size={21} />
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 h-px w-full ${
                      accent === "mint" ? "bg-[#A9E5D2]/40" : "bg-white/10"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Faculty List */}
          <section className={`${glassCard} min-w-0`}>
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-[#A9E5D2]" />
                    <h2 className="text-[15px] font-bold tracking-tight text-white">
                      Faculty List
                    </h2>
                  </div>

                  <p className="mt-1 pl-3 text-xs text-white/45">
                    View and manage faculty accounts.
                  </p>
                </div>

                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/55">
                  {filteredFaculty.length}{" "}
                  {filteredFaculty.length === 1 ? "record" : "records"}
                </span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_160px] md:items-center">
                <div className="flex h-10 min-w-0 items-center gap-2.5 rounded-xl border border-white/10 bg-[#071522]/70 px-3.5 text-white/45 transition focus-within:border-[#A9E5D2]/40 focus-within:ring-4 focus-within:ring-[#A9E5D2]/[0.07]">
                  <Search size={17} className="shrink-0" />

                  <input
                    type="text"
                    value={searchValue}
                    onChange={(event) => {
                      setSearchValue(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search faculty or subjects..."
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    setCurrentPage(1);
                  }}
                  className={fieldClass}
                >
                  <option value="All" className="bg-[#0A1B2A]">
                    All Status
                  </option>
                  <option value="Active" className="bg-[#0A1B2A]">
                    Active
                  </option>
                  <option value="Inactive" className="bg-[#0A1B2A]">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {/* Faculty Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.035]">
                    {[
                      "Faculty ID",
                      "Name",
                      "Status",
                      "Date Added",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.13em] text-white/40 ${
                          heading === "Actions" ? "text-center" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {paginatedFaculty.length > 0 ? (
                    paginatedFaculty.map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/[0.035]"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-md border border-[#A9E5D2]/15 bg-[#477F73]/10 px-2 py-1 text-[11px] font-bold text-[#A9E5D2]">
                            {member.id}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A9E5D2]/15 bg-[#477F73]/20 text-xs font-bold text-[#A9E5D2]">
                              {getInitials(member.name)}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white/90">
                                {member.name}
                              </div>

                              <div className="mt-0.5 truncate text-xs text-white/40">
                                {member.email}
                              </div>

                              <div className="mt-1 text-[10px] text-[#A9E5D2]/75">
                                {getFacultySubjects(member).length} subject(s)
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-none ${
                              member.status === "Active"
                                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/[0.14] bg-white/[0.06] text-white/65"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                member.status === "Active"
                                  ? "bg-emerald-400"
                                  : "bg-gray-400"
                              }`}
                            />
                            {member.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-middle text-sm text-white/50">
                          {member.dateAdded || "—"}
                        </td>

                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View"
                              onClick={() => openViewModal(member)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#75A99A]/30 hover:bg-[#477F73]/20 hover:text-[#B5D5CB] active:scale-95"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              title="Edit"
                              onClick={() => openEditModal(member)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-400/[0.06] text-sky-300 transition hover:bg-sky-400/15 active:scale-95"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              title={
                                member.status === "Active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              onClick={() => toggleAccountStatus(member)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.06] text-amber-300 transition hover:bg-amber-400/15 active:scale-95"
                            >
                              {member.status === "Active" ? (
                                <UserX size={15} />
                              ) : (
                                <UserCheck size={15} />
                              )}
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() => setDeleteFaculty(member)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/[0.06] text-rose-300 transition hover:bg-rose-400/15 active:scale-95"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-14 text-center">
                        <div className="mx-auto flex max-w-xs flex-col items-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/35">
                            <Users size={24} />
                          </div>

                          <strong className="text-sm font-semibold text-white/80">
                            No faculty found
                          </strong>

                          <span className="mt-1 text-xs text-white/40">
                            Try changing your search or filters.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredFaculty.length > 0 && (
              <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black/10 px-5 py-4 max-[600px]:flex-col max-[600px]:items-start sm:px-6">
                <span className="text-xs font-medium text-white/45">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(
                    startIndex + facultyPerPage,
                    filteredFaculty.length
                  )}{" "}
                  of {filteredFaculty.length}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-30`}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                        safeCurrentPage === page
                          ? "border-[#A9E5D2]/25 bg-[#477F73] text-white shadow-[0_3px_10px_rgba(71,127,115,0.2)]"
                          : "border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-30`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* VIEW FACULTY MODAL */}
      {modalType === "view" && selectedFaculty && (
        <ModalShell onClose={closeModal} wide>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]">
                <GraduationCap size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">
                  Faculty Information
                </p>

                <h2 className="mt-1 break-words text-xl font-bold text-white">
                  {selectedFaculty.name}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300">
                    {selectedFaculty.id || "No ID"}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                      selectedFaculty.status === "Active"
                        ? "border-[#A9E5D2]/20 bg-[#477F73]/15 text-[#A9E5D2]"
                        : "border-white/10 bg-white/[0.05] text-white/60"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedFaculty.status === "Active"
                          ? "bg-[#A9E5D2]"
                          : "bg-white/40"
                      }`}
                    />
                    {selectedFaculty.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={19} />
            </button>
          </div>

          <div className="bg-[#0E1A2A] p-5">
            <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071522]/70">
              <div className="border-b border-white/[0.07] px-4 py-4">
                <h3 className="text-sm font-bold text-white">
                  Faculty Details
                </h3>
                <p className="mt-1 text-xs text-white/35">
                  Personal and academic information.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                <DetailCard label="Faculty ID">
                  {selectedFaculty.id}
                </DetailCard>

                <DetailCard label="Full Name">
                  {selectedFaculty.name}
                </DetailCard>

                <DetailCard label="Email Address">
                  {selectedFaculty.email}
                </DetailCard>

                <DetailCard label="Contact Number">
                  {selectedFaculty.contactNumber}
                </DetailCard>

                <DetailCard label="Account Status">
                  {selectedFaculty.status || "Unknown"}
                </DetailCard>

                <DetailCard label="Date Added">
                  {selectedFaculty.dateAdded}
                </DetailCard>

                {/* ASSIGNED SUBJECTS */}
                <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 sm:col-span-2">
                  <span className={labelClass}>Assigned Subjects</span>

                  {getFacultySubjects(selectedFaculty).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getFacultySubjects(selectedFaculty).map(
                        (subjectName) => {
                          const subject = activeSubjects.find(
                            (item) => item.name === subjectName
                          );

                          return (
                            <span
                              key={subjectName}
                              className="inline-flex flex-wrap items-center gap-2 rounded-lg border border-[#A9E5D2]/15 bg-[#477F73]/10 px-3 py-2 text-xs font-medium text-[#B5D5CB]"
                            >
                              {subject && (
                                <span className="font-bold text-[#A9E5D2]">
                                  {subject.code}
                                </span>
                              )}
                              {subjectName}
                            </span>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-white/45">
                      No subjects assigned.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 sm:col-span-2">
                  <span className={labelClass}>Address</span>
                  <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">
                    {selectedFaculty.address || "—"}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4 max-[480px]:flex-col">
            <button
              type="button"
              onClick={() => openEditModal(selectedFaculty)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Pencil size={17} />
              Edit Faculty
            </button>

            <button
              type="button"
              onClick={closeModal}
              className={primaryButton}
            >
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {/* ADD / EDIT FACULTY MODAL */}
      {(modalType === "add" || modalType === "edit") && (
        <ModalShell onClose={closeModal} wide>
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]">
                  <Users size={23} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">
                    User Management
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {modalType === "add" ? "Add Faculty" : "Edit Faculty"}
                  </h2>

                  <p className="mt-1 text-xs text-white/55">
                    {modalType === "add"
                      ? "Create a new faculty account."
                      : "Update faculty information."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="max-h-[70vh] overflow-y-auto bg-[#0E1A2A] px-6 py-6">
                {/* Faculty Information Header */}
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#75A99A]/15 bg-[#477F73]/10 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#477F73] text-white">
                    <Users size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Faculty Information
                    </h3>

                    <p className="mt-0.5 text-xs text-white/35">
                      Enter the faculty account details below.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#071522]/70 p-5 shadow-xl sm:grid-cols-2">
                  {/* Faculty ID */}
                  <div>
                    <label htmlFor="faculty-id" className={labelClass}>
                      Faculty ID
                    </label>

                    <input
                      id="faculty-id"
                      name="id"
                      value={formData.id}
                      placeholder="Generated when saved"
                      readOnly
                      className={fieldClass}
                    />
                    {modalType === "add" && (
                      <p className="mt-1.5 text-xs text-white/45">
                        This ID will be assigned when you save the account.
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="faculty-name" className={labelClass}>
                      Full Name
                    </label>

                    <input
                      id="faculty-name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Enter full name"
                      required
                      className={fieldClass}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="faculty-email" className={labelClass}>
                      Email Address
                    </label>

                    <input
                      id="faculty-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="faculty@accentra.edu"
                      required
                      className={fieldClass}
                    />
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label htmlFor="faculty-contact" className={labelClass}>
                      Contact Number
                    </label>

                    <input
                      id="faculty-contact"
                      name="contactNumber"
                      value={formData.contactNumber || ""}
                      onChange={handleFormChange}
                      placeholder="09XXXXXXXXX"
                      required
                      className={fieldClass}
                    />
                  </div>

                  {/* Specialization */}
                  <div>
                    <label
                      htmlFor="faculty-specialization"
                      className={labelClass}
                    >
                      Specialization
                    </label>

                    <input
                      id="faculty-specialization"
                      name="specialization"
                      value={formData.specialization || ""}
                      onChange={handleFormChange}
                      placeholder="Enter specialization"
                      className={fieldClass}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="faculty-status" className={labelClass}>
                      Status
                    </label>

                    <select
                      id="faculty-status"
                      name="status"
                      value={formData.status || "Active"}
                      onChange={handleFormChange}
                      required
                      className={fieldClass}
                    >
                      <option value="Active" className="bg-[#0A1B2A]">
                        Active
                      </option>
                      <option value="Inactive" className="bg-[#0A1B2A]">
                        Inactive
                      </option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor="faculty-address" className={labelClass}>
                      Address
                    </label>

                    <input
                      id="faculty-address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleFormChange}
                      placeholder="Enter complete address"
                      className={fieldClass}
                    />
                  </div>
                </div>

                {/* Assigned Subjects - separate section at the bottom */}
                <div className="mt-5 rounded-2xl border border-white/10 bg-[#071522]/70 p-5 shadow-xl">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Assigned Subjects
                      </h3>

                      <p className="mt-1 text-xs text-white/40">
                        Select all subjects assigned to this faculty member.
                      </p>
                    </div>

                    <span className="rounded-lg border border-[#A9E5D2]/20 bg-[#477F73]/15 px-2.5 py-1.5 text-xs font-semibold text-[#A9E5D2]">
                      {(formData.subjects || []).length} selected
                    </span>
                  </div>

                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-[#0A1B2A] p-3">
                    {activeSubjects.length > 0 ? activeSubjects.map((subject) => {
                      const selectedSubjects = Array.isArray(formData.subjects)
                        ? formData.subjects
                        : [];

                      const checked = selectedSubjects.includes(subject.name);

                      return (
                        <label
                          key={subject.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                            checked
                              ? "border-[#A9E5D2]/30 bg-[#477F73]/15"
                              : "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.06]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSubject(subject.name)}
                            className="mt-1 h-4 w-4 shrink-0 accent-[#477F73]"
                          />

                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-white/90">
                              {subject.name}
                            </span>

                            <span className="mt-1 block text-xs text-white/45">
                              {subject.code} · {subject.description}
                            </span>
                          </span>
                        </label>
                      );
                    }) : (
                      <p className="px-3 py-6 text-center text-sm text-white/45">
                        No active subjects found. Add or activate subjects in Subject Management.
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-white/40">
                    You can select more than one subject for each faculty member.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4 max-[480px]:flex-col">
                <button
                  type="button"
                  onClick={closeModal}
                  className={secondaryButton}
                >
                  Cancel
                </button>

                <button type="submit" className={primaryButton}>
                  {modalType === "add" ? "Add Faculty" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </ModalShell>
      )}

      {/* DELETE FACULTY MODAL */}
      {deleteFaculty && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020912]/75 px-4 py-6 backdrop-blur-md"
          onMouseDown={() => setDeleteFaculty(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-[22px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-400">
              <Trash2 size={23} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-white">
              Delete Faculty?
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/65">
              Are you sure you want to delete{" "}
              <strong className="font-semibold text-white/85">
                {deleteFaculty.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteFaculty(null)}
                className="h-10 rounded-xl border border-white/[0.14] bg-[#102337] px-4 text-xs font-semibold text-white/75 transition-all hover:bg-white/[0.08]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="h-10 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md"
              >
                Delete Faculty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
