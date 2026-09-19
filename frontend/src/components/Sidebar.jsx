import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShieldAlert, History, BookOpen, FileCheck2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { role, isReviewer, isStaff } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clients', label: 'Clients & Audits', icon: Users },
    { to: '/tenant-isolation', label: 'Tenant Isolation Demo', icon: ShieldAlert },
    { to: '/walkthrough', label: 'Evaluation Checklist', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Workflow Role Privileges Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <FileCheck2 className="w-4 h-4 text-teal-600" />
            <span>Active Role Capabilities</span>
          </div>
          <div className="text-slate-600 space-y-1 text-[11px]">
            {isStaff && (
              <>
                <p className="flex items-center gap-1 text-emerald-700 font-medium">
                  ✓ Can create clients & upload files
                </p>
                <p className="flex items-center gap-1 text-emerald-700 font-medium">
                  ✓ Can re-upload corrected versions
                </p>
                <p className="flex items-center gap-1 text-rose-600 font-medium">
                  ✗ Cannot approve or request correction
                </p>
              </>
            )}
            {isReviewer && (
              <>
                <p className="flex items-center gap-1 text-purple-700 font-medium">
                  ✓ Can start reviews on uploaded files
                </p>
                <p className="flex items-center gap-1 text-purple-700 font-medium">
                  ✓ Can approve or request correction
                </p>
                <p className="flex items-center gap-1 text-purple-700 font-medium">
                  ✓ Full audit timeline visibility
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        OBLIQ-in FE-2 Evaluation Prototype
      </div>
    </aside>
  );
}
