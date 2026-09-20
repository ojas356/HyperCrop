import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Layers, Bell, Radio, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/clusters', label: 'Clusters', icon: Layers },
  { to: '/alerts', label: 'Alerts', icon: Bell },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-14 flex items-center px-5 gap-6 shrink-0 z-50 relative">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2.5 no-underline mr-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold text-slate-900 tracking-tight">HyperCrop</span>
          <span className="text-[10px] text-slate-400 font-medium -mt-0.5">Hyperlocal Crop Intelligence</span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center gap-1 ml-4">
        {navLinks.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium no-underline transition-colors
                ${active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
          Monitoring Live
        </div>

        {/* Last updated */}
        <span className="text-[11px] text-slate-400">
          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {/* Notification bell */}
        <button className="relative p-1.5 rounded-md hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User + logout */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[12px] font-semibold text-slate-700">{user?.name ?? 'Officer'}</span>
            <span className="text-[10px] text-slate-400">Agriculture Officer</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="ml-1 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
