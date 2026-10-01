import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, PhoneCall, Mail, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export const PendingApprovalPage: React.FC = () => {
  const { partner, logout, refreshProfile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Verification In Progress
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">
            Account Pending Approval
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Welcome <strong className="text-brand-gold">{partner?.fullName || 'Partner'}</strong>. Your application for the BLS Professional Partner Network has been received and is currently under review by our Compliance Board.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-left text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-700/50">
              <span>Application ID</span>
              <span className="font-mono text-slate-200 font-semibold">{partner?.partnerId || 'APP-REVIEW'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-700/50">
              <span>Registered Email</span>
              <span className="text-slate-200">{partner?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-700/50">
              <span>Firm / Office</span>
              <span className="text-slate-200">{partner?.firmName || 'Self-Practicing'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Expected SLA</span>
              <span className="text-amber-400 font-medium">12 - 24 Business Hours</span>
            </div>
          </div>

          {/* Workflow stages */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-left">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Application Workflow
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Step 1: Partner Registration Submitted</span>
              </div>
              <div className="flex items-center gap-2.5 text-amber-400">
                <Clock className="w-4 h-4 flex-shrink-0 animate-spin" />
                <span>Step 2: Admin Credential & COP Verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Step 3: Partner ID & Secure Dashboard Activation</span>
              </div>
            </div>
          </div>

          {/* Help box */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-brand-gold" />
              <span>Partner Desk: +91 97843 43068</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold" />
              <span>partners@blscompany.com</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => refreshProfile()}
            >
              Check Status
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
