import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PartnerNotification } from '../../types';

interface PartnerHeaderProps {
  onOpenSidebar: () => void;
  onOpenNewRequest: () => void;
}

export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  onOpenSidebar,
  onOpenNewRequest
}) => {
  const { partner, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/all/read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // Quiet fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between shadow-2xs">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients or requests..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/service-requests?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors"
          />
        </div>
      </div>

      {/* Right: Partner Actions, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick New Request Button */}
        <button
          type="button"
          onClick={onOpenNewRequest}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <span>+ New Request</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-navy-950 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                  Partner Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-gold-600 hover:text-gold-700 cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 ${
                        !n.isRead ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-navy-950 block">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setIsNotifOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] text-gold-600 hover:text-gold-700 font-semibold mt-2"
                        >
                          <span>View docket</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-navy-950 text-gold-400 font-bold text-xs flex items-center justify-center border border-navy-800 shrink-0">
              {partner?.fullName?.charAt(0) || 'P'}
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-navy-950 block leading-tight">
                {partner?.fullName || 'Partner'}
              </span>
              <span className="text-[10px] font-mono font-semibold text-gold-600 block">
                {partner?.partnerId || 'BLS Partner'}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in divide-y divide-slate-100 text-xs">
              <div className="p-3 bg-slate-50/70">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Signed in as</span>
                <span className="font-bold text-navy-950 block truncate">{partner?.email}</span>
                <span className="text-[11px] font-mono text-gold-600 font-semibold mt-0.5 block">{partner?.partnerId}</span>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-navy-950 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Credentials</span>
                </Link>
                <Link
                  to="/support"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-navy-950 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Desk Support</span>
                </Link>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-semibold text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
