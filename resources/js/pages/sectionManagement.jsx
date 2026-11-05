import { useEffect, useMemo, useState } from "react";

import { usePage, router } from "@inertiajs/react";

import {

  Search,

  Plus,

  Eye,

  Pencil,

  Trash2,

  Users,


  UserCheck,

  UserX,

  Layers,

  X,

  ChevronLeft,

  ChevronRight,


} from "lucide-react";



import Sidebar from "../components/layout/sidebar";

import Navbar from "../components/layout/navbar";

import MobileOverlay from "../components/layout/mobileOverlay";



export default function SectionManagement() {



  const mapSection = (section) => ({
    databaseId: section.id,
    id: `SEC-${String(section.id).padStart(4, "0")}`,
    name: section.section_name,
    program: section.course,
    yearLevel: section.year_level,
    schoolYear: section.school_year,
    students: Number(section.students_count ?? 0),

    studentMembers: (section.students ?? []).map((student) => ({
        id: student.student_number || String(student.id),
        name: student.name,
        email: student.email,
        yearLevel: student.year_level,
        status: student.status,
    })),

    status: section.status,
    dateCreated: section.created_at,
    lastUpdated: section.updated_at,
});



    const {
        sections: databaseSections = [],
        academicSettings = {
            academicYear: "2026-2027",
            defaultProgram: "Bachelor of Science in Accounting Information Systems",
            yearLevels: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        },
        availablePrograms = [],
    } = usePage().props;



    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [activeMenu, setActiveMenu] = useState("Sections");



    const [sections, setSections] = useState(() =>

        databaseSections.map(mapSection)

    );



    useEffect(() => {

        setSections(databaseSections.map(mapSection));

    }, [databaseSections]);



  const [searchValue, setSearchValue] = useState("");

  const [programFilter, setProgramFilter] = useState("");

  const [yearLevelFilter, setYearLevelFilter] = useState("");

  const [statusFilter, setStatusFilter] = useState("");



  const [modalType, setModalType] = useState(null);

  const [selectedSection, setSelectedSection] = useState(null);

  const [deleteSection, setDeleteSection] = useState(null);




  const [studentSearch, setStudentSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const sectionsPerPage = 5;





const [formData, setFormData] = useState({

    name: "",

    program: "",

    yearLevel: "",

    schoolYear: academicSettings.academicYear,


    students: 0,

    status: "Active",


});



  const getInitials = (name = "") => {

    const cleanName = name.trim();

    if (!cleanName || cleanName === "Unassigned") return "—";

    const parts = cleanName.split(/\s+/);

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();

  };



  const getAssignedStudents = (sectionId) => {
    const section = sections.find(
        (item) => item.id === sectionId
    );

    if (!section) return [];

    return (section.studentMembers ?? []).filter(
        (student) => student.status === "Active"
    );
};

  const getFilteredAssignedStudents = () => {
    if (!selectedSection) return [];
    const query = studentSearch.trim().toLowerCase();
    return getAssignedStudents(selectedSection.id).filter((student) =>
      !query || `${student.id} ${student.name} ${student.email} ${student.yearLevel} ${student.status}`.toLowerCase().includes(query)
    );
  };

  const programs = useMemo(

    () => [...new Set([...availablePrograms, ...sections.map((section) => section.program)])],

    [availablePrograms, sections]

  );

  const yearLevels = useMemo(

    () => [...new Set([...academicSettings.yearLevels, ...sections.map((section) => section.yearLevel)])],

    [academicSettings.yearLevels, sections]

  );



  const filteredSections = useMemo(() => {

    const query = searchValue.trim().toLowerCase();

    return sections.filter((section) => {

      const matchesSearch =

        !query ||

        [

          section.id,

          section.name,

          section.program,

          section.yearLevel,


          section.students,

          section.status,

        ]

          .join(" ")

          .toLowerCase()

          .includes(query);

      const matchesProgram = !programFilter || section.program === programFilter;

      const matchesYearLevel = !yearLevelFilter || section.yearLevel === yearLevelFilter;

      const matchesStatus = !statusFilter || section.status === statusFilter;

      return matchesSearch && matchesProgram && matchesYearLevel && matchesStatus;

    });

  }, [sections, searchValue, programFilter, yearLevelFilter, statusFilter]);



  const totalSections = sections.length;

  const activeSections = sections.filter((section) => section.status === "Active").length;

  const inactiveSections = sections.filter((section) => section.status === "Inactive").length;

  const totalStudents = sections.reduce(

    (total, section) => total + Number(section.students || 0),

    0

  );



  const totalPages = Math.max(1, Math.ceil(filteredSections.length / sectionsPerPage));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * sectionsPerPage;

  const paginatedSections = filteredSections.slice(startIndex, startIndex + sectionsPerPage);



  const handleMenuChange = (menu) => {

    setActiveMenu(menu);

    if (window.innerWidth <= 768) setSidebarOpen(false);

  };



  /* =========================

     MODALS

  ========================= */





const openAddModal = () => {

    setFormData({

        name: "",

        program: academicSettings.defaultProgram,
        yearLevel: academicSettings.yearLevels[0] ?? "",
        schoolYear: academicSettings.academicYear,

    
        students: 0,

        status: "Active",

    
    });

    setSelectedSection(null);

    setModalType("add");

};





  const openViewModal = (section) => {

    setSelectedSection(section);

    setStudentSearch("");

    setModalType("view");

  };



  const openEditModal = (section) => {

    setSelectedSection(section);

    setFormData({

        name: section.name,

        program: section.program,

        yearLevel: section.yearLevel,

        schoolYear: section.schoolYear || academicSettings.academicYear,


        students: section.students,

        status: section.status,


    });

    setModalType("edit");

};



  const closeModal = () => {

    setModalType(null);

    setSelectedSection(null);

    setStudentSearch("");

  };



  const handleFormChange = (event) => {

    const { name, value } = event.target;

    setFormData((current) => ({ ...current, [name]: value }));

  };





const handleSubmit = (event) => {

    event.preventDefault();



    const payload = {

        section_name: formData.name,

        course: formData.program,

        year_level: formData.yearLevel,

        school_year: formData.schoolYear,

        status: formData.status,

    };



    const options = {

        preserveScroll: true,



        onSuccess: () => {

            closeModal();

        },



        onError: (errors) => {

            console.error("Section validation errors:", errors);

            alert(Object.values(errors).join("\n"));

        },

    };



    if (modalType === "add") {

        router.post("/sections", payload, options);

    } else if (

        modalType === "edit" &&

        selectedSection?.databaseId

    ) {

        router.put(

            `/sections/${selectedSection.databaseId}`,

            payload,

            options

        );

    }

};



  /* =========================

     STATUS

  ========================= */





const toggleSectionStatus = (section) => {

    if (!section?.databaseId) return;



    const newStatus =

        section.status === "Active" ? "Inactive" : "Active";



    router.patch(

        `/sections/${section.databaseId}/status`,

        {

            status: newStatus,

        },

        {

            preserveScroll: true,



            onSuccess: () => {

                setSelectedSection((current) =>

                    current?.databaseId === section.databaseId

                        ? { ...current, status: newStatus }

                        : current

                );

            },



            onError: (errors) => {

                console.error("Section status error:", errors);

                alert(

                    Object.values(errors).join("\n") ||

                    "Unable to update section status."

                );

            },

        }

    );

};





  /* =========================

     DELETE

  ========================= */





const confirmDelete = () => {

    if (!deleteSection?.databaseId) {

        console.error("Missing database ID:", deleteSection);

        alert("Cannot delete: Section database ID is missing.");

        return;

    }



    console.log("Deleting section:", deleteSection.databaseId);



    router.delete(`/sections/${deleteSection.databaseId}`, {

        preserveScroll: true,



        onSuccess: () => {

            console.log("Section deleted successfully");

            setDeleteSection(null);

        },



        onError: (errors) => {

            console.error("Delete failed:", errors);

            alert("Unable to delete section.");

        },

    });

};



  const resetFilters = () => {

    setSearchValue("");

    setProgramFilter("");

    setYearLevelFilter("");

    setStatusFilter("");

    setCurrentPage(1);

  };



  const hasActiveFilters = searchValue || programFilter || yearLevelFilter || statusFilter;



  const inputClass =

    "w-full rounded-xl border border-white/15 bg-[#0A1B2A]/80 px-3.5 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-white/35 hover:border-white/25 focus:border-[#A9E5D2]/60 focus:ring-4 focus:ring-[#A9E5D2]/10 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-white/40";

  const labelClass = "mb-1.5 block text-xs font-semibold text-white/65";

  const panelClass =

    "overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]";

  const modalOverlay =

    "fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#020912]/75 px-4 py-6 backdrop-blur-md";

  const modalCard =

    "my-auto w-full overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]";

  const modalHeader =

    "flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-[#142A43] via-[#18354B] to-[#234D50] px-5 py-5 sm:px-6";

  const modalField =

    "rounded-xl border border-white/[0.13] bg-[#0A1B2A]/70 p-3.5";



  const StatusBadge = ({ status }) => {

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

        {status}

      </span>

    );

  };



  const SummaryCard = ({ label, value, note, icon: Icon, accent }) => (

    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] transition duration-300 hover:-translate-y-1 hover:border-white/20">

      <div className={`absolute -right-7 -top-7 h-24 w-24 rounded-full blur-2xl ${accent}`} />

      <div className="relative flex items-start justify-between gap-3">

        <div>

          <p className="text-xs font-semibold text-white/55">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>

          <p className="mt-1 text-[11px] text-white/35">{note}</p>

        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#A9E5D2]/20 bg-[#477F73]/25 text-[#A9E5D2] transition group-hover:scale-105">

          <Icon size={21} />

        </div>

      </div>

      <div className={`absolute bottom-0 left-0 h-[2px] w-full ${accent.replace("bg-", "bg-")}`} />

    </div>

  );



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

          <div className="flex items-center justify-between gap-4 max-[640px]:items-start max-[640px]:flex-col">

            <div className="min-w-0">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A9E5D2]">

                <span className="h-1.5 w-1.5 rounded-full bg-[#A9E5D2]" />

                Administration

              </span>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">

                Section Management

              </h1>

              <p className="mt-1 text-sm text-white/55">

                Manage academic sections and student membership.

              </p>

            </div>

          <button

            type="button"

            onClick={openAddModal}

            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_18px_rgba(71,127,115,0.22)] transition hover:bg-[#568F81] active:scale-[0.98] max-[640px]:w-full"

          >

            <Plus size={18} />

            Add Section

          </button>

        </div>



        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard label="Total Sections" value={totalSections} note="All academic sections" icon={Layers} accent="bg-[#6F91B5]/20" />

          <SummaryCard label="Active Sections" value={activeSections} note="Currently active" icon={UserCheck} accent="bg-emerald-400/20" />

          <SummaryCard label="Inactive Sections" value={inactiveSections} note="Currently inactive" icon={UserX} accent="bg-slate-400/20" />

          <SummaryCard label="Total Students" value={totalStudents} note="Across all sections" icon={Users} accent="bg-[#75A99A]/20" />

        </section>



        <section className={panelClass}>

           <div className="border-b border-white/10 px-5 py-4 sm:px-6">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="h-5 w-1 rounded-full bg-[#A9E5D2]" />



                    <h2 className="text-[15px] font-bold tracking-tight text-white">

                      Section List

                    </h2>

                  </div>



                  <p className="mt-1 pl-3 text-xs text-white/45">

                    View and manage sections.

                  </p>

                </div>



                 <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/55">

                  {filteredSections.length}{" "}

                  {filteredSections.length === 1 ? "record" : "records"}

                </span>

              </div>

          </div>



          <div className="border-b border-white/10 px-5 py-4 sm:px-6">

            <div className="flex flex-wrap gap-3">

              <div className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#0D1929] px-3.5 text-white/55 transition focus-within:border-[#75A99A]/50 focus-within:ring-4 focus-within:ring-[#75A99A]/10">

                <Search size={17} className="shrink-0" />

                <input

                  type="text"

                  value={searchValue}

                  onChange={(event) => { setSearchValue(event.target.value); setCurrentPage(1); }}

                  placeholder="Search sections..."

                  className="min-w-0 flex-1 border-white/[0.14] bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"

                />

                {searchValue && (

                  <button type="button" onClick={() => { setSearchValue(""); setCurrentPage(1); }} className="rounded-md p-1 text-white/55 hover:bg-white/10 hover:text-white" aria-label="Clear search">

                    <X size={15} />

                  </button>

                )}

              </div>

              <select value={programFilter} onChange={(event) => { setProgramFilter(event.target.value); setCurrentPage(1); }} className="h-11 min-w-[180px] rounded-xl border border-white/[0.08] bg-[#0D1929] px-3 text-sm text-slate-300 outline-none focus:border-[#A9E5D2]/60">

                <option value="">All Programs</option>

                {programs.map((program) => <option key={program} value={program}>{program}</option>)}

              </select>

              <select value={yearLevelFilter} onChange={(event) => { setYearLevelFilter(event.target.value); setCurrentPage(1); }} className="h-11 min-w-[155px] rounded-xl border border-white/[0.08] bg-[#0D1929] px-3 text-sm text-slate-300 outline-none focus:border-[#A9E5D2]/60">

                <option value="">All Year Levels</option>

                {yearLevels.map((year) => <option key={year} value={year}>{year}</option>)}

              </select>

              <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="h-11 min-w-[135px] rounded-xl border border-white/[0.08] bg-[#0D1929] px-3 text-sm text-slate-300 outline-none focus:border-[#A9E5D2]/60">

                <option value="">All Status</option>

                <option value="Active">Active</option>

                <option value="Inactive">Inactive</option>

              </select>

            </div>

          </div>



          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[820px] border-collapse">

              <thead>

                  <tr className="border-b border-white/10 bg-white/[0.035]">

                  {["Section Name", "Program", "Year Level", "No. of Students", "Status", "Actions"].map((heading) => (

                    <th key={heading} className={`px-5 py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-white/35 ${heading === "Actions" ? "text-center" : "text-left"}`}>{heading}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {paginatedSections.length > 0 ? paginatedSections.map((section) => {

                  const isActive = section.status === "Active";

  
                  return (

                    <tr key={section.id} className="border-b border-white/[0.055] transition-colors last:border-b-0 hover:bg-white/[0.025]">

                      <td className="px-5 py-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#75A99A]/15 bg-[#477F73]/20 text-[#A9E5D2]"><Layers size={17} /></div>

                          <div className="min-w-0">

                            <p className="whitespace-nowrap text-sm font-semibold text-slate-100">{section.name}</p>

                            <p className="mt-1 text-[11px] text-white/35">{section.id}</p>

                          </div>

                        </div>

                      </td>

                      <td className="max-w-[220px] px-5 py-4"><span className="block truncate text-sm text-slate-300" title={section.program}>{section.program}</span></td>

                      <td className="px-5 py-4 text-sm text-slate-300">{section.yearLevel}</td>

                      

                      <td className="px-5 py-4 text-center text-sm font-semibold text-slate-200">{section.students}</td>

                      <td className="px-5 py-4"><StatusBadge status={section.status} /></td>

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-1.5">

                          <button type="button" title="View" aria-label={`View ${section.name}`} onClick={() => openViewModal(section)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#75A99A]/30 hover:bg-[#477F73]/20 hover:text-[#B5D5CB] active:scale-95"><Eye size={16} /></button>

                          <button type="button" title="Edit" aria-label={`Edit ${section.name}`} onClick={() => openEditModal(section)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-400/[0.06] text-sky-300 transition hover:bg-sky-400/15 active:scale-95"><Pencil size={16} /></button>

                          <button type="button" title={isActive ? "Deactivate" : "Activate"} aria-label={isActive ? `Deactivate ${section.name}` : `Activate ${section.name}`} onClick={() => toggleSectionStatus(section)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.06] text-amber-300 transition hover:bg-amber-400/15 active:scale-95">{isActive ? <UserX size={16} /> : <UserCheck size={16} />}</button>

                          <button type="button" title="Delete" aria-label={`Delete ${section.name}`} onClick={() => setDeleteSection(section)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/[0.06] text-rose-300 transition hover:bg-rose-400/15 active:scale-95"><Trash2 size={16} /></button>

                        </div>

                      </td>

                    </tr>

                  );

                }) : (

                  <tr><td colSpan={6} className="px-5 py-16 text-center">

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/55"><Layers size={25} /></div>

                      <strong className="mt-4 text-sm font-semibold text-slate-200">No sections found</strong>

                      <span className="mt-1 text-xs text-white/35">Try adjusting your search or filters.</span>

                      {hasActiveFilters && <button type="button" onClick={resetFilters} className="mt-3 text-xs font-semibold text-[#A9E5D2] hover:text-white">Clear filters</button>}

                    </div>

                  </td></tr>

                )}

              </tbody>

            </table>

          </div>



          {filteredSections.length > 0 && (

            <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] bg-[#101D2F]/60 px-5 py-4 max-[600px]:flex-col max-[600px]:items-start">

              <span className="text-xs text-white/35">Showing <span className="font-semibold text-slate-300">{startIndex + 1}–{Math.min(startIndex + sectionsPerPage, filteredSections.length)}</span> of <span className="font-semibold text-slate-300">{filteredSections.length}</span> sections</span>

              <div className="flex items-center gap-1.5">

                <button type="button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={17} /></button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (

                  <button type="button" key={page} onClick={() => setCurrentPage(page)} className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${page === safeCurrentPage ? "border-[#75A99A]/40 bg-[#477F73] text-white shadow-lg shadow-[#36534E]/20" : "border-white/10 bg-white/[0.03] text-white/55 hover:bg-white/[0.08] hover:text-white"}`}>{page}</button>

                ))}

                <button type="button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={17} /></button>

              </div>

            </div>

          )}

        </section>

        </div>

      </main>



      {/* VIEW MODAL */}

      {modalType === "view" && selectedSection && (

        <div className={modalOverlay} onClick={closeModal}>

          <div className={`${modalCard} max-w-6xl`} onClick={(event) => event.stopPropagation()}>

            <div className={modalHeader}>

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]"><Layers size={25} /></div>

                <div className="min-w-0">

                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">Section Information</p>

                  <h2 className="mt-1 text-xl font-bold text-white">{selectedSection.name}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300">{selectedSection.id}</span><StatusBadge status={selectedSection.status} /></div>

                </div>

              </div>

              <button type="button" onClick={closeModal} aria-label="Close modal" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>

            </div>



            <div className="grid grid-cols-1 gap-5 bg-[#0E1A2A] p-5 lg:grid-cols-2">

              <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071522]/70">

                <div className="border-b border-white/[0.07] px-4 py-4"><h3 className="text-sm font-bold text-white">Section Details</h3><p className="mt-1 text-xs text-white/35">Academic information.</p></div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">

                  {[

                    ["Section Name", selectedSection.name],

                    ["Program", selectedSection.program],

                    ["Year Level", selectedSection.yearLevel],

                    
                    ["No. of Students", selectedSection.students],

                  ].map(([label, value]) => <div key={label} className={modalField}><span className={labelClass}>{label}</span><strong className="block break-words text-sm font-semibold text-slate-100">{value}</strong></div>)}

                  <div className={modalField}><span className={labelClass}>Status</span><StatusBadge status={selectedSection.status} /></div>

                  <div className={modalField}><span className={labelClass}>Date Created</span><strong className="block text-sm font-semibold text-slate-100">{selectedSection.dateCreated || "—"}</strong></div>

                  <div className={modalField}><span className={labelClass}>Last Updated</span><strong className="block text-sm font-semibold text-slate-100">{selectedSection.lastUpdated || "—"}</strong></div>

                </div>

              </section>



              <section className="overflow-hidden rounded-xl border border-white/10 bg-[#071522]/70">

                <div className="border-b border-white/[0.07] px-4 py-4"><h3 className="text-sm font-bold text-white">Student Members</h3><p className="mt-1 text-xs text-white/35">View students assigned to this section.</p></div>

                <div className="border-b border-white/[0.07] bg-[#101D2F]/70 p-4">

                  <div className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0D1929] px-3 text-white/55 focus-within:border-[#75A99A]/50">

                    <Search size={16} /><input type="text" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search students..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600" />

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[420px] border-collapse">

                    <thead><tr className="border-b border-white/[0.07] bg-[#17273B]/80"><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">Student</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">Year Level</th><th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-white/35">Status</th></tr></thead>

                    <tbody>

                      {getFilteredAssignedStudents().length > 0 ? getFilteredAssignedStudents().map((student) => (

                        <tr key={student.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">

                          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/20 text-xs font-bold text-[#B5D5CB]">{getInitials(student.name)}</div><div className="min-w-0"><p className="text-sm font-semibold text-slate-200">{student.name}</p><p className="text-[11px] text-white/35">{student.id}</p><p className="break-all text-[11px] text-white/35">{student.email}</p></div></div></td>

                          <td className="px-4 py-3 text-sm text-slate-300">{student.yearLevel}</td>

                          <td className="px-4 py-3"><div className="flex items-center gap-2"><StatusBadge status={student.status} /></div></td>

                        </tr>

                      )) : (

                        <tr><td colSpan={3} className="px-4 py-12 text-center"><div className="flex flex-col items-center"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55"><Users size={22} /></div><strong className="mt-3 text-sm text-slate-200">{studentSearch.trim() ? "No matching students" : "No students assigned"}</strong><p className="mt-1 text-xs text-white/35">{studentSearch.trim() ? "Try another search term." : "No student records were provided for this section."}</p></div></td></tr>

                      )}

                    </tbody>

                  </table>

                </div>

                <div className="border-t border-white/[0.07] bg-[#101D2F]/60 px-4 py-3"><p className="text-xs text-white/35">{getAssignedStudents(selectedSection.id).length} {getAssignedStudents(selectedSection.id).length === 1 ? "student" : "students"} assigned</p></div>

              </section>

            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4">

              <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white">Close</button>

              <button type="button" onClick={() => { const sectionToEdit = selectedSection; closeModal(); openEditModal(sectionToEdit); }} className="inline-flex items-center gap-2 rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#568F81]"><Pencil size={16} /> Edit Section</button>

            </div>

          </div>

        </div>

      )}



      {/* ADD / EDIT MODAL */}

      {(modalType === "add" || modalType === "edit") && (

        <div className={modalOverlay} onClick={closeModal}>

          <div className={`${modalCard} max-w-3xl`} onClick={(event) => event.stopPropagation()}>

            <div className={modalHeader}>

              <div className="flex items-center gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]"><Layers size={23} /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">User Management</p><h2 className="mt-1 text-xl font-bold text-white">{modalType === "add" ? "Add Section" : "Edit Section"}</h2><p className="mt-1 text-xs text-white/55">{modalType === "add" ? "Create a new academic section." : "Update section information."}</p></div></div>

              <button type="button" onClick={closeModal} aria-label="Close modal" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="bg-[#0E1A2A] px-6 py-6">

                <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#75A99A]/15 bg-[#477F73]/10 px-4 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#477F73] text-white"><Layers size={18} /></div><div><h3 className="text-sm font-bold text-white">Section Information</h3><p className="mt-0.5 text-xs text-white/35">Enter the academic section details below.</p></div></div>

                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#071522]/70 p-5 shadow-xl sm:grid-cols-2">

                  <div className={modalField}><label className={labelClass}>Section Name</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. BSAIS-1A" required className={inputClass} /></div>

                  <div className={modalField}><label className={labelClass}>Program</label><select name="program" value={formData.program} onChange={handleFormChange} required className={inputClass}><option value="">Select Program</option>{programs.map((program) => <option key={program} value={program}>{program}</option>)}</select></div>

                  <div className={modalField}><label className={labelClass}>Year Level</label><select name="yearLevel" value={formData.yearLevel} onChange={handleFormChange} required className={inputClass}><option value="">Select Year Level</option>{yearLevels.map((year) => <option key={year} value={year}>{year}</option>)}</select></div>


                  <div className={modalField}><label className={labelClass}>No. of Students</label><div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70">{modalType === "edit" ? formData.students : 0}</div><p className="mt-1.5 text-[10px] text-white/35">The count updates automatically when students are assigned.</p></div>

                  <div className={modalField}><label className={labelClass}>School Year</label><input type="text" name="schoolYear" value={formData.schoolYear} onChange={handleFormChange} placeholder={academicSettings.academicYear} required className={inputClass} /></div>

                  <div className={modalField}><label className={labelClass}>Status</label><select name="status" value={formData.status} onChange={handleFormChange} className={inputClass}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>

                </div>

              </div>

              <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4">

                <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white">Cancel</button>

                <button type="submit" className="rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#568F81]">{modalType === "add" ? "Add Section" : "Save Changes"}</button>

              </div>

            </form>

          </div>

        </div>

      )}



      {/* DELETE MODAL */}

     {deleteSection && (

        <div

          className="

            fixed

            inset-0

            z-[80]

            flex

            items-center

            justify-center

            bg-[#020912]/75

            px-4 py-6

            backdrop-blur-md

          "

          onMouseDown={() => setDeleteSection(null)}

        >

          <div

            className="

              w-full

              max-w-md

              rounded-2xl

              border

              border-white/[0.13]

              bg-gradient-to-br from-white/[0.105] to-white/[0.025]

              p-6

              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.35)]

              backdrop-blur-[22px]

            "

            onMouseDown={(event) =>

              event.stopPropagation()

            }

          >

            <div

              className="

                flex

                h-12

                w-12

                items-center

                justify-center

                rounded-xl

                border

                border-red-300/20

                bg-red-400/10

                text-red-500

              "

            >

              <Trash2 size={23} />

            </div>



            <h2 className="mt-4 text-lg font-bold text-white">

              Delete Section?

            </h2>



            <p className="mt-2 text-sm leading-6 text-white/65">

              Are you sure you want to delete{" "}

              <strong className="font-semibold text-white/85">

                {deleteSection.name}

              </strong>

              ? This action cannot be undone.

            </p>



            <div className="mt-6 flex justify-end gap-2">

              <button

                type="button"

                onClick={() => setDeleteSection(null)}

                className="

                  h-10

                  rounded-xl

                  border

                  border-white/[0.14]

                  bg-[#102337]

                  px-4

                  text-xs

                  font-semibold

                  text-white/75

                  transition-all

                  hover:bg-[#102337]/[0.08]

                "

              >

                Cancel

              </button>



              <button

                type="button"

                onClick={confirmDelete}

                className="

                  h-10

                  rounded-xl

                  bg-red-400/100

                  px-4

                  text-xs

                  font-semibold

                  text-white

                  shadow-sm

                  transition-all

                  hover:bg-red-600

                  hover:shadow-md

                "

              >

                Delete Section

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
