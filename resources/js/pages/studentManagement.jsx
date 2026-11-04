import { useEffect, useMemo, useState } from "react";

import { usePage, router } from "@inertiajs/react";



import {

  Search,

  Plus,

  Eye,

  Pencil,

  Trash2,

  UserCheck,

  UserX,

  Users,

  X,

  ChevronLeft,

  ChevronRight,

  Layers,
  BookOpen,

} from "lucide-react";



import Sidebar from "../components/layout/sidebar";

import Navbar from "../components/layout/navbar";

import MobileOverlay from "../components/layout/mobileOverlay";





// Subjects are sourced from faculty assignments, not demo data.



const labelClass = "mb-2 block text-xs font-semibold text-white/65";



const fieldClass =

  "h-10 w-full rounded-xl border border-white/15 bg-[#0A1B2A] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#A9E5D2]/40 focus:ring-2 focus:ring-[#A9E5D2]/10";



function ModalShell({ children, onClose, wide = false }) {

  return (

    <div

      className="fixed inset-0 z-[75] flex items-center justify-center overflow-y-auto bg-[#020912]/75 px-4 py-6 backdrop-blur-md"

      onMouseDown={onClose}

    >

      <div

        className={`my-auto w-full ${

          wide ? "max-w-3xl" : "max-w-lg"

        } overflow-hidden rounded-2xl border border-white/[0.13] bg-[#0E1A2A] shadow-[0_18px_55px_rgba(0,0,0,0.35)]`}

        onMouseDown={(event) => event.stopPropagation()}

      >

        {children}

      </div>

    </div>

  );

}



export default function StudentManagement() {

  const {

    students: databaseStudents = [],

    availableSections = [],
    availableSubjects = [],
    nextStudentId = "",
    flash = {},

   } = usePage().props;

















  const [students, setStudents] = useState([]);





useEffect(() => {

    const records = Array.isArray(databaseStudents)

        ? databaseStudents

        : databaseStudents?.data ?? [];



    const updatedStudents = records.map((student) => ({

        ...student,

        databaseId: student.id,

        id: student.student_number,

        yearLevel: student.year_level,

        contactNumber: student.contact_number ?? "",

        sectionId: student.section_id ?? "",

        section: student.section_record?.section_name

            ?? student.section

            ?? "Unassigned",

        dateAdded: student.created_at

            ? new Date(student.created_at).toLocaleDateString()

            : "",

    }));



    setStudents(updatedStudents);

}, [databaseStudents]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeMenu, setActiveMenu] = useState("Students");









  const [searchValue, setSearchValue] = useState("");



  const [sectionFilter, setSectionFilter] = useState("All Sections");

  const [yearFilter, setYearFilter] = useState("All Year Levels");

  const [statusFilter, setStatusFilter] = useState("All Status");



  const [modalType, setModalType] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);



  const [deleteStudent, setDeleteStudent] = useState(null);
  const [assignStudent, setAssignStudent] = useState(null);
  const [assignSubjects, setAssignSubjects] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);





  const [currentPage, setCurrentPage] = useState(1);



  const studentsPerPage = 5;



  const [formData, setFormData] = useState({

    id: "",

    name: "",

    email: "",

    section: "",

    course: "BS Accounting Information System",

    subjects: [],

    yearLevel: "",

    contactNumber: "",

    address: "",

    sectionId: "",

  });



  /* FILTER OPTIONS */



  const sections = useMemo(

    () => [

      ...new Set(

        students.map((student) => student.section).filter(Boolean)

      ),

    ],

    [students]

  );



  const yearLevels = useMemo(

    () => [

      ...new Set(

        students.map((student) => student.yearLevel).filter(Boolean)

      ),

    ],

    [students]

  );



  const activeSubjects = useMemo(

    () => availableSubjects.map((subject, index) => typeof subject === "string" ? { id: subject, name: subject, code: "", description: "", status: "Active" } : { id: subject.id ?? index, name: subject.name ?? subject.subject_name, code: subject.code ?? "", description: subject.description ?? "", status: "Active" }).filter(subject => subject.name),

    [availableSubjects]

  );



  /* FILTERED STUDENTS */



  const filteredStudents = useMemo(() => {

    const query = searchValue.trim().toLowerCase();



    return students.filter((student) => {

      const studentSubjects = Array.isArray(student.subjects)

        ? student.subjects

        : student.subject

          ? [student.subject]

          : [];



      const searchableValues = [

        student.id,

        student.name,

        student.email,

        student.section,

        student.course,

        student.yearLevel,

        student.status,

        ...studentSubjects,

        ...studentSubjects.map((subjectName) => {

          const subject = activeSubjects.find(

            (item) =>

              item.name.toLowerCase() === subjectName.toLowerCase() ||

              item.code.toLowerCase() === subjectName.toLowerCase()

          );



          return subject ? subject.code : "";

        }),

      ];



      const matchesSearch =

        !query ||

        searchableValues

          .filter(Boolean)

          .join(" ")

          .toLowerCase()

          .includes(query);



      const matchesSection =

        sectionFilter === "All Sections" ||

        student.section === sectionFilter;



      const matchesYear =

        yearFilter === "All Year Levels" ||

        student.yearLevel === yearFilter;



        const matchesStatus =



        statusFilter === "All Status" ||

        student.status === statusFilter;



      return (

        matchesSearch &&

        matchesSection &&

        matchesYear &&

        matchesStatus

      );

    });

  }, [

    students,

    searchValue,

    sectionFilter,

    yearFilter,

    statusFilter,

  ]);



  /* PAGINATION */



  const totalPages = Math.max(

    1,

    Math.ceil(filteredStudents.length / studentsPerPage)

  );



  const safeCurrentPage = Math.min(currentPage, totalPages);



  const startIndex = (safeCurrentPage - 1) * studentsPerPage;



  const paginatedStudents = filteredStudents.slice(

    startIndex,

    startIndex + studentsPerPage

  );



  /* HELPERS */



  const resetFilters = () => {

    setSearchValue("");

    setSectionFilter("All Sections");

    setYearFilter("All Year Levels");

    setStatusFilter("All Status");

    setCurrentPage(1);

  };



  const handleMenuChange = (menu) => {

    setActiveMenu(menu);



    if (window.innerWidth <= 768) {

      setSidebarOpen(false);

    }

  };



  const getInitials = (name = "") => {

    return name

      .trim()

      .split(/\s+/)

      .filter(Boolean)

      .map((part) => part[0])

      .slice(0, 2)

      .join("")

      .toUpperCase();

  };



  const getStudentSubjects = (student) => {

    if (Array.isArray(student?.subjects)) {

      return student.subjects;

    }



    return student?.subject ? [student.subject] : [];

  };



  /* MODALS */



  const openAddModal = () => {

    setFormData({ id: nextStudentId, name: "", email: "", section: "", course: "BS Accounting Information System", subjects: [], yearLevel: "", contactNumber: "", address: "", sectionId: "", status: "Active" });

    setSelectedStudent(null);

    setModalType("add");

  };



  const openEditModal = student => {

    setSelectedStudent(student);

    setFormData({ id: student.id ?? "", name: student.name ?? "", email: student.email ?? "", section: student.section ?? "", course: student.course ?? "", subjects: getStudentSubjects(student), yearLevel: student.yearLevel ?? "", contactNumber: student.contactNumber ?? "", address: student.address ?? "", sectionId: student.sectionId ?? student.section_id ?? "", status: student.status ?? "Active" });

    setModalType("edit");

  };



  const openViewModal = (student) => {

    setSelectedStudent(student);

    setModalType("view");

  };



  const closeModal = () => {

    setModalType(null);

    setSelectedStudent(null);

  };



  const handleFormChange = (event) => {

    const { name, value } = event.target;



    setFormData((previous) => ({

      ...previous,

      [name]: value,

    }));

  };



  const toggleSubject = (subjectName) => {

    setFormData((previous) => {

      const currentSubjects = previous.subjects ?? [];

      const isSelected = currentSubjects.includes(subjectName);



      return {

        ...previous,

        subjects: isSelected

          ? currentSubjects.filter((name) => name !== subjectName)

          : [...currentSubjects, subjectName],

      };

    });

  };



  /* ADD & EDIT STUDENT */





const handleSubmit = (event) => {

    event.preventDefault();

    const studentData = {
      subjects: formData.subjects ?? [],

      student_number: formData.id,

      name: formData.name,

      email: formData.email,

      course: formData.course,

      year_level: formData.yearLevel,

      section_id: formData.sectionId ? Number(formData.sectionId) : null,

      section: availableSections.find(section => String(section.id) === String(formData.sectionId))?.section_name ?? "",

      contact_number: formData.contactNumber,

      address: formData.address,

      status: formData.status || "Active",

    };

    const options = {

      preserveScroll: true,

      onSuccess: () => {

        closeModal();

        setCurrentPage(1);

        router.reload({ only: ["students"], preserveScroll: true });

      },

      onError: errors => alert(Object.values(errors).join("\n") || "Unable to save student."),

    };

    if (modalType === "add") router.post("/students", studentData, options);

    if (modalType === "edit") {

      if (!selectedStudent?.databaseId) return alert("Student database ID is missing.");

      router.put(`/students/${selectedStudent.databaseId}`, studentData, options);

    }

  };



  const toggleAccountStatus = student => {

    if (!student.databaseId) return;

    const status = student.status === "Active" ? "Inactive" : "Active";

    router.patch(`/students/${student.databaseId}/status`, { status }, {

      preserveScroll: true,

      onSuccess: () => {

        setStudents(prev => prev.map(item => item.databaseId === student.databaseId ? { ...item, status } : item));

        setSelectedStudent(prev => prev?.databaseId === student.databaseId ? { ...prev, status } : prev);

      },

      onError: errors => alert(Object.values(errors).join("\n") || "Unable to update status."),

    });

  };



  const confirmDelete = () => {

    if (!deleteStudent?.databaseId) return;

    router.delete(`/students/${deleteStudent.databaseId}`, {

      preserveScroll: true,

      onSuccess: () => {

        if (selectedStudent?.databaseId === deleteStudent.databaseId) closeModal();

        setDeleteStudent(null);

        setCurrentPage(1);

      },

      onError: errors => alert(Object.values(errors).join("\n") || "Unable to delete student."),

    });

  };



  const openAssignSubjects = (student) => {
    setAssignStudent(student);
    setAssignSubjects(getStudentSubjects(student));
  };

  const saveAssignedSubjects = () => {
    if (!assignStudent?.databaseId) return;
    setAssignSaving(true);
    router.put(`/students/${assignStudent.databaseId}/subjects`, { subjects: assignSubjects }, {
      preserveScroll: true,
      onSuccess: () => {
        setAssignStudent(null);
        router.reload({ only: ["students"], preserveScroll: true });
      },
      onError: errors => alert(Object.values(errors).join("\n") || "Unable to assign subjects."),
      onFinish: () => setAssignSaving(false),
    });
  };

  /* RESET CREDENTIALS */



  const hasActiveFilters =

    searchValue ||

    sectionFilter !== "All Sections" ||

    yearFilter !== "All Year Levels" ||

    statusFilter !== "All Status";



  return (

    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#071522] font-sans text-white">

      <div aria-hidden="true" className="pointer-events-none fixed inset-0">

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />

        <div className="absolute -left-36 top-16 h-[420px] w-[420px] rounded-full bg-[#477F73]/25 blur-[120px]" />

        <div className="absolute right-[-100px] top-[-60px] h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[130px]" />

        <div className="absolute bottom-[-100px] left-[35%] h-[320px] w-[480px] rounded-full bg-[#477F73]/10 blur-[110px]" />

      </div>



      {/* SIDEBAR */}



      <Sidebar

        activeMenu={activeMenu}

        onMenuChange={handleMenuChange}

        open={sidebarOpen}

      />



      <MobileOverlay

        open={sidebarOpen}

        onClose={() => setSidebarOpen(false)}

      />



      {/* MAIN CONTENT */}



      <main className="relative z-10 ml-[260px] min-h-screen w-[calc(100%-260px)] min-w-0 px-[30px] py-[25px] transition-all duration-300 max-[1100px]:px-6 max-[768px]:ml-0 max-[768px]:w-full max-[768px]:px-[18px] max-[768px]:py-[18px] max-[480px]:px-[14px] max-[480px]:py-[14px]">

        <Navbar

          onMenuToggle={() => setSidebarOpen(true)}

          showPageInfo={false}

          showSearch={false}

        />



        <div className="mt-6 min-w-0 space-y-5">

          {/* FLASH MESSAGES */}
{flash.error && (
    <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        {flash.error}
    </div>
)}

{flash.success && (
    <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        {flash.success}
    </div>
)}

          {/* PAGE HEADER */}



          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">

            <div className="min-w-0">

              <span className="inline-flex items-center gap-2 rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A9E5D2]">

                <span className="h-1.5 w-1.5 rounded-full bg-[#A9E5D2]" />

                Administration

              </span>



              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">

                Student Management

              </h1>



              <p className="mt-1 text-sm text-white/55">

                Manage student accounts, academic details, and enrollment information.

              </p>

            </div>



            <button

              type="button"

              onClick={openAddModal}

              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#477F73] px-4 text-sm font-semibold text-white transition hover:bg-[#36534E] max-[640px]:w-full max-[640px]:justify-center"

            >

              <Plus size={17} />

              Add Student

            </button>

          </div>



          {/* SUMMARY CARDS */}



          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {[

              {

                label: "Total Students",

                value: students.length,

                icon: Users,

                accent: "navy",

                note: "Student accounts",

              },

              {

                label: "Active Accounts",

                value: students.filter((student) => student.status === "Active").length,

                icon: UserCheck,

                accent: "mint",

                note: "Currently active",

              },

              {

                label: "Inactive Accounts",

                value: students.filter((student) => student.status === "Inactive").length,

                icon: UserX,

                accent: "slate",

                note: "Currently inactive",

              },

              {

                label: "Sections",

                value: sections.length,

                icon: Layers,

                accent: "blue",

                note: "Available sections",

              },

            ].map(({ label, value, icon: Icon, accent, note }) => {

              const tones = {

                navy: "bg-[#294B70]/25 text-[#C4D9F0] border-[#7292B4]/20",

                mint: "bg-[#477F73]/25 text-[#A9E5D2] border-[#A9E5D2]/20",

                slate: "bg-slate-400/10 text-slate-300 border-slate-300/15",

                blue: "bg-sky-400/10 text-sky-200 border-sky-200/15",

              };



              return (

                <div

                  key={label}

                  className="group relative rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px] transition duration-300 hover:-translate-y-1 hover:border-white/20"

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



                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${tones[accent]}`}>

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



          {/* STUDENT LIST CARD */}



          <section className="overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-[22px]">

            <div className="border-b border-white/10 px-5 py-4 sm:px-6">

              <div className="flex items-start justify-between gap-3">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="h-5 w-1 rounded-full bg-[#A9E5D2]" />

                    <h2 className="text-[15px] font-bold tracking-tight text-white">

                      Student List

                    </h2>

                  </div>

                  <p className="mt-1 pl-3 text-xs text-white/45">

                    View and manage student accounts.

                  </p>

                </div>



                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/55">

                  {filteredStudents.length}{" "}

                  {filteredStudents.length === 1 ? "record" : "records"}

                </span>

              </div>

            </div>



            {/* FILTERS */}



            <div className="flex flex-wrap gap-3 border-b border-white/[0.09] p-5">

              <div className="flex h-10 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-white/[0.14] bg-[#071522]/70 px-3.5 text-white/50 transition-all duration-200 focus-within:border-[#36534E]/30 focus-within:bg-[#102337] focus-within:ring-4 focus-within:ring-[#36534E]/5">

                <Search size={18} className="shrink-0" />



                <input

                  type="text"

                  placeholder="Search students or subjects..."

                  value={searchValue}

                  onChange={(event) => {

                    setSearchValue(event.target.value);

                    setCurrentPage(1);

                  }}

                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white/85 outline-none placeholder:text-white/35"

                />



                {searchValue && (

                  <button

                    type="button"

                    aria-label="Clear search"

                    onClick={() => {

                      setSearchValue("");

                      setCurrentPage(1);

                    }}

                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/[0.10] hover:text-white/85"

                  >

                    <X size={15} />

                  </button>

                )}

              </div>



              <select

                value={sectionFilter}

                onChange={(event) => {

                  setSectionFilter(event.target.value);

                  setCurrentPage(1);

                }}

                className="h-10 min-w-[160px] rounded-xl border border-white/[0.14] bg-[#0A1B2A] px-3 text-sm text-white/75 outline-none transition-all focus:border-[#A9E5D2]/40 focus:bg-[#102337] focus:ring-4 focus:ring-[#A9E5D2]/10"

              >

                <option>All Sections</option>

                {sections.map((section) => (

                  <option key={section} value={section}>

                    {section}

                  </option>

                ))}

              </select>



              <select

                value={yearFilter}

                onChange={(event) => {

                  setYearFilter(event.target.value);

                  setCurrentPage(1);

                }}

                className="h-10 min-w-[160px] rounded-xl border border-white/[0.14] bg-[#0A1B2A] px-3 text-sm text-white/75 outline-none transition-all focus:border-[#A9E5D2]/40 focus:bg-[#102337] focus:ring-4 focus:ring-[#A9E5D2]/10"

              >

                <option>All Year Levels</option>

                {yearLevels.map((year) => (

                  <option key={year} value={year}>

                    {year}

                  </option>

                ))}

              </select>



              <select

                value={statusFilter}

                onChange={(event) => {

                  setStatusFilter(event.target.value);

                  setCurrentPage(1);

                }}

                className="h-10 min-w-[140px] rounded-xl border border-white/[0.14] bg-[#0A1B2A] px-3 text-sm text-white/75 outline-none transition-all focus:border-[#A9E5D2]/40 focus:bg-[#102337] focus:ring-4 focus:ring-[#A9E5D2]/10"

              >

                <option>All Status</option>

                <option>Active</option>

                <option>Inactive</option>

              </select>



              {hasActiveFilters && (

                <button

                  type="button"

                  onClick={resetFilters}

                  className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/65 transition hover:bg-white/[0.08] hover:text-white"

                >

                  Clear Filters

                </button>

              )}

            </div>



            {/* TABLE */}



            <div className="w-full overflow-x-auto">

              <table className="w-full min-w-[980px] border-collapse">

                <thead>

                  <tr className="border-b border-white/10 bg-white/[0.035]">

                    {[

                      "Student ID",

                      "Name",

                      "Section",

                      "Year Level",

                      "Status",

                      "Date Added",

                      "Actions",

                    ].map((heading) => (

                      <th

                        key={heading}

                        className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/40 ${

                          heading === "Actions" ? "text-center" : "text-left"

                        }`}

                      >

                        {heading}

                      </th>

                    ))}

                  </tr>

                </thead>



                <tbody>

                  {paginatedStudents.length > 0 ? (

                    paginatedStudents.map((student) => (

                      <tr

                        key={student.id}

                        className="border-b border-white/[0.07] transition-colors last:border-b-0 hover:bg-white/[0.035]"

                      >

                        <td className="px-5 py-4">

                          <span className="text-xs font-semibold text-white/65">

                            {student.id}

                          </span>

                        </td>



                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 min-w-9 items-center justify-center rounded-full border border-[#A9E5D2]/20 bg-[#477F73]/20 text-[11px] font-bold text-[#A9E5D2] transition-transform duration-200 hover:scale-105">

                              {getInitials(student.name)}

                            </div>



                            <div className="flex min-w-0 flex-col">

                              <strong className="whitespace-nowrap text-sm font-semibold text-white">

                                {student.name}

                              </strong>

                              <small className="mt-0.5 whitespace-nowrap text-xs text-white/50">

                                {student.email}

                              </small>

                            </div>

                          </div>

                        </td>



                        <td className="px-5 py-4 text-sm font-medium text-white/75">

                          {student.section}

                        </td>



                        <td className="px-5 py-4 text-sm text-white/75">

                          {student.yearLevel}

                        </td>



                        <td className="px-5 py-4">

                          <span

                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-none ${

                              student.status === "Active"

                                ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-300"

                                : "border-white/[0.14] bg-white/[0.06] text-white/65"

                            }`}

                          >

                            <span

                              className={`h-1.5 w-1.5 rounded-full ${

                                student.status === "Active"

                                  ? "bg-emerald-400"

                                  : "bg-gray-400"

                              }`}

                            />

                            {student.status}

                          </span>

                        </td>



                        <td className="whitespace-nowrap px-5 py-4 text-sm text-white/65">

                          {student.dateAdded || "—"}

                        </td>



                        <td className="px-5 py-4">

                          <div className="flex items-center justify-center gap-1.5">

                            <button

                              type="button"

                              title="View Student"

                              aria-label="View Student"

                              onClick={() => openViewModal(student)}

                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#75A99A]/30 hover:bg-[#477F73]/20 hover:text-[#B5D5CB] active:scale-95"

                            >

                              <Eye size={17} />

                            </button>



                            <button type="button" title="Assign Subjects" aria-label="Assign Subjects" onClick={() => openAssignSubjects(student)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#A9E5D2]/20 bg-[#477F73]/15 text-[#A9E5D2] transition hover:bg-[#477F73]/30 active:scale-95">
                              <BookOpen size={17} />
                            </button>

                            <button

                              type="button"

                              title="Edit Student"

                              aria-label="Edit Student"

                              onClick={() => openEditModal(student)}

                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-400/15 bg-sky-400/[0.06] text-sky-300 transition hover:bg-sky-400/15 active:scale-95"

                            >

                              <Pencil size={17} />

                            </button>



                            <button

                              type="button"

                              title={student.status === "Active" ? "Deactivate Account" : "Activate Account"}

                              aria-label={student.status === "Active" ? "Deactivate Account" : "Activate Account"}

                              onClick={() => toggleAccountStatus(student)}

                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.06] text-amber-300 transition hover:bg-amber-400/15 active:scale-95"

                            >

                              {student.status === "Active" ? (

                                <UserX size={17} />

                              ) : (

                                <UserCheck size={17} />

                              )}

                            </button>



                            <button

                              type="button"

                              title="Delete Student"

                              aria-label="Delete Student"

                              onClick={() => setDeleteStudent(student)}

                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-400/15 bg-rose-400/[0.06] text-rose-300 transition hover:bg-rose-400/15 active:scale-95"

                            >

                              <Trash2 size={17} />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>

                      <td colSpan={7} className="px-5 py-16 text-center">

                        <div className="flex flex-col items-center justify-center">

                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/50">

                            <Users size={28} />

                          </div>

                          <strong className="mt-4 text-sm font-semibold text-white/85">

                            No students found

                          </strong>

                          <span className="mt-1 text-xs text-white/50">

                            Try changing your search or filters.

                          </span>

                        </div>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>



            {/* PAGINATION */}



            {filteredStudents.length > 0 && (

              <div className="flex items-center justify-between gap-4 border-t border-white/[0.09] px-5 py-4 max-[600px]:flex-col max-[600px]:items-start">

                <span className="text-xs text-white/50">

                  Showing {startIndex + 1} to{" "}

                  {Math.min(startIndex + studentsPerPage, filteredStudents.length)}{" "}

                  of {filteredStudents.length}

                </span>



                <div className="flex items-center gap-1.5">

                  <button

                    type="button"

                    disabled={safeCurrentPage === 1}

                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.14] bg-[#102337] text-white/65 transition-all hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"

                  >

                    <ChevronLeft size={16} />

                  </button>



                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (

                    <button

                      type="button"

                      key={page}

                      onClick={() => setCurrentPage(page)}

                      className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all duration-200 ${

                        safeCurrentPage === page

                          ? "bg-[#477F73] text-white shadow-sm"

                          : "border border-white/[0.14] bg-[#102337] text-white/65 hover:bg-white/[0.08] hover:text-white"

                      }`}

                    >

                      {page}

                    </button>

                  ))}



                  <button

                    type="button"

                    disabled={safeCurrentPage === totalPages}

                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}

                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.14] bg-[#102337] text-white/65 transition-all hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"

                  >

                    <ChevronRight size={16} />

                  </button>

                </div>

              </div>

            )}

          </section>

        </div>

      </main>





{/* VIEW STUDENT MODAL */}

{modalType === "view" && selectedStudent && (

    <ModalShell onClose={closeModal} wide>

        <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">

            <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]">

                    <Users size={25} />

                </div>



                <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">

                        Student Information

                    </p>



                    <h2 className="mt-1 break-words text-xl font-bold text-white">

                        {selectedStudent.name || "Unnamed Student"}

                    </h2>



                    <div className="mt-2 flex flex-wrap items-center gap-2">

                        <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-300">

                            {selectedStudent.id || "No ID"}

                        </span>



                        <span

                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${

                                selectedStudent.status === "Active"

                                    ? "border-[#A9E5D2]/20 bg-[#477F73]/15 text-[#A9E5D2]"

                                    : "border-white/10 bg-white/[0.05] text-white/60"

                            }`}

                        >

                            <span

                                className={`h-1.5 w-1.5 rounded-full ${

                                    selectedStudent.status === "Active"

                                        ? "bg-[#A9E5D2]"

                                        : "bg-white/40"

                                }`}

                            />

                            {selectedStudent.status || "Unknown"}

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

                        Student Details

                    </h3>

                    <p className="mt-1 text-xs text-white/35">

                        Personal and academic information.

                    </p>

                </div>



                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">

                    {[

                        ["Student ID", selectedStudent.id || "—"],

                        ["Full Name", selectedStudent.name || "—"],

                        ["Email Address", selectedStudent.email || "—"],

                        ["Course", selectedStudent.course || "—"],

                        ["Section", selectedStudent.section || "—"],

                        ["Year Level", selectedStudent.yearLevel || "—"],

                        ["Contact Number", selectedStudent.contactNumber || "—"],

                        ["Account Status", selectedStudent.status || "Unknown"],

                        ["Date Added", selectedStudent.dateAdded || "—"],

                        ["Address", selectedStudent.address || "—"],

                    ].map(([label, value]) => (

                        <div

                            key={label}

                            className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3"

                        >

                            <span className={labelClass}>{label}</span>

                            <strong className="mt-1 block break-words text-sm font-semibold text-slate-100">

                                {value}

                            </strong>

                        </div>

                    ))}



                    {/* ASSIGNED SUBJECTS */}

                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3 sm:col-span-2">

                        <span className={labelClass}>

                            Assigned Subjects

                        </span>



                        {getStudentSubjects(selectedStudent).length > 0 ? (

                            <div className="mt-2 flex flex-wrap gap-2">

                                {getStudentSubjects(selectedStudent).map(

                                    (subjectName) => {

                                        const subject = activeSubjects.find(

                                            (item) =>

                                                item.name === subjectName

                                        );



                                        return (

                                            <span

                                                key={subjectName}

                                                className="inline-flex items-center gap-2 rounded-lg border border-[#A9E5D2]/15 bg-[#477F73]/10 px-3 py-2 text-xs font-medium text-[#B5D5CB]"

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

                            <p className="text-sm text-white/45">

                                No subjects assigned.

                            </p>

                        )}

                    </div>

                </div>

            </section>

        </div>



        <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4 max-[480px]:flex-col">

            <button

                type="button"

                onClick={() => openEditModal(selectedStudent)}

                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"

            >

                <Pencil size={17} />

                Edit Student

            </button>



            <button

                type="button"

                onClick={closeModal}

                className="rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#568F81]"

            >

                Close

            </button>

        </div>

    </ModalShell>

)}







{/* ADD / EDIT STUDENT MODAL */}

{(modalType === "add" || modalType === "edit") && (

  <ModalShell onClose={closeModal} wide>

    <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#B5D5CB]">

          <Users size={23} />

        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">User Management</p>

          <h2 className="mt-1 text-xl font-bold text-white">{modalType === "add" ? "Add Student" : "Edit Student"}</h2>

          <p className="mt-1 text-xs text-white/55">{modalType === "add" ? "Create a new student account." : "Update student information."}</p>

        </div>

      </div>

      <button type="button" onClick={closeModal} aria-label="Close modal" className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white">

        <X size={19} />

      </button>

    </div>

    <form onSubmit={handleSubmit}>

      <div className="max-h-[70vh] overflow-y-auto bg-[#0E1A2A] px-6 py-6">

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#75A99A]/15 bg-[#477F73]/10 px-4 py-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#477F73] text-white"><Users size={18} /></div>

          <div>

            <h3 className="text-sm font-bold text-white">Student Information</h3>

            <p className="mt-0.5 text-xs text-white/35">Enter the student account details below.</p>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#071522]/70 p-5 shadow-xl sm:grid-cols-2">

          <div>

            <label htmlFor="student-id" className={labelClass}>Student ID</label>

            <input id="student-id" name="id" value={formData.id ?? ""} readOnly placeholder="Generated when saved" className={fieldClass} />

            {modalType === "add" && <p className="mt-1.5 text-xs text-white/45">The ID is assigned automatically by the system.</p>}

          </div>

          {[

            ["Full Name", "name", "text", true],

            ["Email Address", "email", "email", true],

            ["Course", "course", "text", true],

            ["Contact Number", "contactNumber", "text", false],

            ["Address", "address", "text", false],

          ].map(([label, name, type, required]) => (

            <div key={name}>

              <label htmlFor={`student-${name}`} className={labelClass}>{label}</label>

              <input id={`student-${name}`} name={name} type={type} value={formData[name] ?? ""} onChange={handleFormChange} required={required} className={fieldClass} />

            </div>

          ))}

          <div>

            <label htmlFor="student-section" className={labelClass}>Section</label>

            <select id="student-section" name="sectionId" value={formData.sectionId ?? ""} onChange={handleFormChange} className={fieldClass}>

              <option value="">Unassigned</option>

              {availableSections.map((section) => (

                <option key={section.id} value={section.id}>{section.section_name}</option>

              ))}

            </select>

          </div>

          <div>

            <label htmlFor="student-year" className={labelClass}>Year Level</label>

            <select id="student-year" name="yearLevel" value={formData.yearLevel ?? ""} onChange={handleFormChange} required className={fieldClass}>

              <option value="">Select Year Level</option>

              {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => <option key={year} value={year}>{year}</option>)}

            </select>

          </div>

          <div>

            <label htmlFor="student-status" className={labelClass}>Account Status</label>

            <select id="student-status" name="status" value={formData.status ?? "Active"} onChange={handleFormChange} className={fieldClass}>

              <option value="Active">Active</option>

              <option value="Inactive">Inactive</option>

            </select>

          </div>

        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-[#071522]/70 p-5">

          <h3 className="text-sm font-bold text-white">Assigned Subjects</h3>

          <p className="mt-1 text-xs text-white/45">Choose the subjects associated with this student.</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

            {activeSubjects.map((subject) => (

              <label key={subject.id} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]">

                <input type="checkbox" checked={(formData.subjects ?? []).includes(subject.name)} onChange={() => toggleSubject(subject.name)} className="mt-1 h-4 w-4 shrink-0 accent-[#477F73]" />

                <span className="min-w-0">

                  <span className="block text-sm font-semibold text-white/90">{subject.name}</span>

                  <span className="mt-1 block text-xs text-white/45">{subject.code} · {subject.description}</span>

                </span>

              </label>

            ))}

          </div>

          <p className="mt-3 text-xs text-[#A9E5D2]">{(formData.subjects ?? []).length} subject(s) selected</p>

          <p className="mt-1 text-xs text-white/40">Subject selections will be saved to the student account.</p>

        </div>

      </div>

      <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4 max-[480px]:flex-col">

        <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08] hover:text-white">Cancel</button>

        <button type="submit" className="rounded-xl border border-[#A9E5D2]/20 bg-[#477F73] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#568F81]">{modalType === "add" ? "Add Student" : "Save Changes"}</button>

      </div>

    </form>

  </ModalShell>

)}



{/* ASSIGN SUBJECTS MODAL */}
      {assignStudent && (
        <ModalShell onClose={() => !assignSaving && setAssignStudent(null)} wide>
          <div className="flex items-center justify-between border-b border-white/10 bg-[#102337] px-6 py-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A9E5D2]">Student Enrollment</p>
              <h2 className="mt-1 text-xl font-bold text-white">Assign Subjects</h2>
              <p className="mt-1 text-xs text-white/55">{assignStudent.name} · {assignStudent.id}</p>
            </div>
            <button type="button" onClick={() => setAssignStudent(null)} disabled={assignSaving} aria-label="Close" className="text-white/70 hover:text-white"><X size={20} /></button>
          </div>
          <div className="max-h-[65vh] overflow-y-auto bg-[#0E1A2A] p-6">
            <p className="mb-4 text-sm text-white/55">Choose subjects assigned to this student. Published tasks also require a matching section.</p>
            {activeSubjects.length === 0 ? (
              <p className="rounded-xl border border-white/10 p-4 text-sm text-white/55">No faculty subjects are available yet. Assign subjects to faculty first.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeSubjects.map(subject => (
                  <label key={subject.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]">
                    <input type="checkbox" checked={assignSubjects.includes(subject.name)} onChange={() => setAssignSubjects(previous => previous.includes(subject.name) ? previous.filter(name => name !== subject.name) : [...previous, subject.name])} className="mt-1 h-4 w-4 accent-[#477F73]" />
                    <span className="text-sm text-white/90">{subject.name}</span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-4 text-xs text-[#A9E5D2]">{assignSubjects.length} subject(s) selected</p>
          </div>
          <div className="flex justify-end gap-2 border-t border-white/10 bg-[#071522]/70 px-6 py-4">
            <button type="button" disabled={assignSaving} onClick={() => setAssignStudent(null)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70">Cancel</button>
            <button type="button" disabled={assignSaving} onClick={saveAssignedSubjects} className="rounded-xl bg-[#477F73] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{assignSaving ? "Saving..." : "Save Subjects"}</button>
          </div>
        </ModalShell>
      )}

      {/* DELETE CONFIRMATION */}



      {deleteStudent && (

        <div

          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#020912]/75 px-4 py-6 backdrop-blur-md"

          onMouseDown={() => setDeleteStudent(null)}

        >

          <div

            className="w-full max-w-md rounded-2xl border border-white/[0.13] bg-gradient-to-br from-white/[0.105] to-white/[0.025] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-[22px]"

            onMouseDown={(event) => event.stopPropagation()}

          >

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-300/20 bg-red-400/10 text-red-400">

              <Trash2 size={23} />

            </div>



            <h2 className="mt-4 text-lg font-bold text-white">

              Delete Student?

            </h2>



            <p className="mt-2 text-sm leading-6 text-white/65">

              Are you sure you want to delete{" "}

              <strong className="font-semibold text-white/85">

                {deleteStudent.name}

              </strong>

              ? This action cannot be undone.

            </p>



            <div className="mt-6 flex justify-end gap-2">

              <button

                type="button"

                onClick={() => setDeleteStudent(null)}

                className="h-10 rounded-xl border border-white/[0.14] bg-[#102337] px-4 text-xs font-semibold text-white/75 transition-all hover:bg-white/[0.08]"

              >

                Cancel

              </button>



              <button

                type="button"

                onClick={confirmDelete}

                className="h-10 rounded-xl bg-red-500 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md"

              >

                Delete Student

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}
