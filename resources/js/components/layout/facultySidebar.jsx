import { useState } from "react";
import { usePage } from "@inertiajs/react";
import Icon from "../common/icon";


const menuItems = [
  { label: "Dashboard", icon: "layout-dashboard", path: "/faculty/dashboard" },
  
  { label: "Task Management", icon: "clipboard-list", path: "/faculty/tasks" },
  { label: "Submissions", icon: "folder-check", path: "/faculty/submissions" },
  { label: "Results", icon: "chart-no-axes-column", path: "/faculty/results" },
  { label: "My Account", icon: "user-round", path: "/faculty/my-account" },
];

export default function FacultySidebar({ activeMenu = "Dashboard", onMenuChange, open = false }) {
  const { csrfToken } = usePage().props;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigation = (event, item) => {
    event.preventDefault();
    onMenuChange?.(item.label);
    if (item.path) window.location.href = item.path;
  };

  const handleLogout = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/faculty/logout";
    const token = csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    if (token) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "_token";
      input.value = token;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const menuClass = (active) => `group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A9E5D2]/60 ${active ? "border-[#A9E5D2]/20 bg-[#A9E5D2]/10 text-[#A9E5D2] shadow-[0_4px_20px_rgba(169,229,210,0.08)]" : "border-transparent text-white/65 hover:border-[#A9E5D2]/20 hover:bg-[#A9E5D2]/[0.09] hover:text-[#A9E5D2]"}`;

  return (
    <>
      <aside className={`fixed left-0 top-0 z-[60] flex h-screen w-[260px] shrink-0 flex-col overflow-hidden border-r border-white/[0.13] bg-[#071522]/95 shadow-[8px_0_40px_rgba(0,0,0,0.25)] backdrop-blur-[22px] transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"} min-[769px]:translate-x-0`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#477F73]/20 blur-[100px]" />
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#477F73]/15 blur-[110px]" />
        </div>
        <div className="relative shrink-0 border-b border-white/[0.08] px-6 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#A9E5D2]/30 bg-[#A9E5D2]/10 shadow-[0_0_18px_rgba(169,229,210,0.10)]">
              <img
                src="/images/accentra-logoo.png"
                alt="ACCENTRA Logo"
                className="h-full w-full rounded-full object-contain p-1"
              />
            </div>
            <div>
              <div className="text-[21px] font-bold tracking-tight text-white">ACCENTRA</div>
              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">Accounting System</div>
            </div>
          </div>
        </div>
        <nav aria-label="Faculty navigation" className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4 pt-5">
          <p className="mb-3 px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Main</p>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = activeMenu === item.label;
              return (
                <a key={item.label} href={item.path} aria-current={active ? "page" : undefined} onClick={(event) => handleNavigation(event, item)} className={menuClass(active)}>
                  <span aria-hidden="true" className={`absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#A9E5D2] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  <Icon name={item.icon} className={`relative z-10 h-[18px] w-[18px] shrink-0 ${active ? "text-[#A9E5D2]" : "text-white/40 group-hover:text-[#A9E5D2]"}`} />
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </div>
          <div className="mt-auto pt-8">
            <div className="mb-4 border-t border-white/[0.08]" />
            <button type="button" onClick={() => setShowLogoutModal(true)} className={menuClass(false)}>
              <Icon name="log-out" className="h-[18px] w-[18px] text-white/40 group-hover:text-[#A9E5D2]" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07111F]/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !isLoggingOut) setShowLogoutModal(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="faculty-logout-title" aria-describedby="faculty-logout-description" className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/[0.13] bg-gradient-to-br from-[#102437] to-[#071522] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/[0.10] px-6 py-5">
              <div className="flex items-center gap-3">
                <Icon name="log-out" className="h-5 w-5 text-[#A9E5D2]" />
                <div><h2 id="faculty-logout-title" className="font-semibold text-white">Log Out</h2><p className="mt-1 text-xs text-white/40">ACCENTRA · Faculty Portal</p></div>
              </div>
              <button type="button" disabled={isLoggingOut} onClick={() => setShowLogoutModal(false)} aria-label="Close logout confirmation" className="rounded-lg p-2 text-white/50 hover:bg-white/10"><Icon name="x" className="h-4 w-4" /></button>
            </div>
            <div className="px-6 py-6">
              <p id="faculty-logout-description" className="text-sm leading-6 text-white/70">Are you sure you want to log out of your account?</p>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-3"><Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#A9E5D2]/70" /><p className="text-xs leading-5 text-white/45">You will need to log in again to access your faculty dashboard.</p></div>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" disabled={isLoggingOut} onClick={() => setShowLogoutModal(false)} className="rounded-lg border border-white/[0.13] px-5 py-2.5 text-sm font-medium text-white/65 hover:bg-white/[0.08]">Cancel</button>
              <button type="button" disabled={isLoggingOut} onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 disabled:opacity-70"><Icon name="log-out" className="h-4 w-4" />{isLoggingOut ? "Logging out..." : "Log Out"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
