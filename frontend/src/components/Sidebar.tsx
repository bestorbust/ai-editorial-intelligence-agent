import { NavLink } from "react-router-dom";
import { LayoutDashboard, Lightbulb, Newspaper, Tags, X } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/opportunities", label: "Opportunities", icon: Lightbulb },
  { to: "/stories", label: "Stories", icon: Newspaper },
  { to: "/topics", label: "Topics", icon: Tags },
  { to: "/history", label:"History", icon:Newspaper}
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: Props) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[--color-sidebar] text-[--color-sidebar-ink] transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[--color-accent] font-serif text-lg text-white">
              Æ
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">AI Editorial OS</div>
              <div className="text-[10px] uppercase tracking-widest text-[--color-sidebar-muted]">
                Intelligence
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[--color-sidebar-muted] hover:bg-[--color-sidebar-hover] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[--color-sidebar-hover] text-white"
                    : "text-[--color-sidebar-muted] hover:bg-[--color-sidebar-hover] hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 px-5 py-4 text-[11px] text-[--color-sidebar-muted]">
          Backend refreshes automatically every ~30 min.
        </div>
      </aside>
    </>
  );
}
