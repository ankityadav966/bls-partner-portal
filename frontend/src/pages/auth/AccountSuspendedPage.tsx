import React from 'react';
import { Ban, PhoneCall, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const AccountSuspendedPage: React.FC = () => {
  const { partner, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-6">
            <Ban className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Account Inactive / Suspended
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Portal Access Restricted
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Partner account for <strong className="text-white">{partner?.fullName || 'Partner'}</strong> ({partner?.partnerId || 'ID'}) has been temporarily placed on hold by the compliance administration.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left text-xs space-y-2 text-slate-400">
            <p>
              Common reasons include pending document re-verification, expired professional credentials, or compliance audit flags.
            </p>
            <p>
              To appeal or restore full dashboard privileges, please reach out to the BLS Partner Secretariat:
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 text-xs text-slate-300 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-gold" />
              <span>compliance@blscompany.com</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-brand-gold" />
              <span>Direct Hotline: +91 97843 43068</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="md"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={logout}
            >
              Sign Out to Public Website
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSuspendedPage;
