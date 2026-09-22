import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  FolderLock,
  GitPullRequest,
  Receipt,
  HelpCircle,
  User,
  LogOut,
  X,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PartnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewRequest: () => void;
}

export const PartnerSidebar: React.FC<PartnerSidebarProps> = ({
  isOpen,
  onClose,
  onOpenNewRequest
}) => {
  const { partner, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Clients', to: '/clients', icon: Users },
    { label: 'Service Requests', to: '/service-requests', icon: FileSpreadsheet },
    { label: 'Document Vault', to: '/documents', icon: FolderLock },
    { label: 'Work Tracking', to: '/work-tracking', icon: GitPullRequest },
    { label: 'Commercials & Payout', to: '/commercials', icon: Receipt },
    { label: 'Support Desk', to: '/support', icon: HelpCircle },
    { label: 'My Profile', to: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col border-r border-slate-200/90 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-extrabold text-xl flex items-center justify-center shadow-xs">
              B<span className="text-xs">.</span>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-base block leading-tight">
                BLS & COMPANY
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block mt-0.5">
                Partner Portal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Partner Identity Pill */}
        {partner && (
          <div className="px-5 pt-4 pb-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Partner Reference
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {partner.partnerId}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        )}

        {/* Quick Action Button */}
        <div className="px-5 py-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNewRequest();
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create Service Request</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-200/80">
                {partner?.fullName?.charAt(0) || 'P'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate block">
                  {partner?.fullName || 'Partner'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block font-medium">
                  {partner?.firmName || 'BLS Partner'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
