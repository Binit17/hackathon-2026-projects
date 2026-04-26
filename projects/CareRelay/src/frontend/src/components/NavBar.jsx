import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Activity } from 'lucide-react';

const links = [
  { to: '/', label: 'Snapshot' },
  { to: '/history', label: 'Deep Dive' },
  { to: '/card', label: 'ID Card' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-teal-600' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          <span className="font-bold text-teal-600 text-lg tracking-tight">CareRelay</span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2 text-slate-500 hover:text-slate-800"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
