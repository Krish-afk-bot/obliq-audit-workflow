import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { Building2, User, Shield, LogOut, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';

export default function Navbar() {
  const { user, role, firmName, firmCode, logout, switchUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (email) => {
    setSwitching(true);
    setDropdownOpen(false);
    try {
      await switchUser(email);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Firm Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              OA
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">OBLIQ Audit</span>
              <span className="ml-1.5 text-xs font-semibold uppercase px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                FE-2 Eval
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200 text-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700">{firmName}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              {firmCode}
            </span>
          </div>
        </div>

        {/* Right: Quick Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={switching}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition"
              title="Switch demo persona"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Switch Demo Persona</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Quick Role Switcher
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Instantly simulate evaluation workflow personas
                  </p>
                </div>

                <div className="p-1 space-y-1">
                  {DEMO_PRESETS.map((preset) => {
                    const isCurrent = user?.email === preset.email;
                    return (
                      <button
                        key={preset.email}
                        onClick={() => handleSwitch(preset.email)}
                        className={`w-full text-left p-2.5 rounded-lg transition text-xs flex items-start justify-between ${
                          isCurrent
                            ? 'bg-teal-50/80 border border-teal-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <span>{preset.name}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                preset.role === 'REVIEWER'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {preset.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{preset.firmName}</div>
                          <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                            {preset.description}
                          </div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-teal-600 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</div>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded leading-tight ${
                    role === 'REVIEWER'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
