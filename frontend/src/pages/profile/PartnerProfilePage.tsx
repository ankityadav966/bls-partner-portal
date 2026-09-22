import React, { useState } from 'react';
import {
  User,
  Shield,
  Building,
  Phone,
  Mail,
  MapPin,
  Award,
  CheckCircle2,
  Calendar,
  Lock,
  Save,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

export const PartnerProfilePage: React.FC = () => {
  const { partner, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    phone: partner?.phone || '',
    city: partner?.city || '',
    district: partner?.district || '',
    firmName: partner?.firmName || ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await profileService.update(formData);
      if (res.data?.success) {
        setSuccessMsg('Partner profile details updated successfully.');
        await refreshProfile();
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update partner profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          Partner Credential Vault
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Partner Identity & Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified member profile under the BLS AND COMPANY Professional Network.
        </p>
      </div>

      {/* Official Partner ID Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-amber-800 font-extrabold text-2xl shadow-xs">
              {partner?.fullName?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{partner?.fullName}</h2>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                {partner?.profession} • {partner?.qualification}
              </p>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{partner?.firmName || 'Self Practice'}</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1 font-semibold">
              Authorized Partner ID
            </span>
            <span className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">
              {partner?.partnerId || 'BLS-P-10024'}
            </span>
            <div className="mt-2 flex sm:justify-end">
              <StatusBadge status={partner?.status || 'APPROVED'} />
            </div>
          </div>
        </div>

        {/* Credentials Meta Row */}
        <div className="relative z-10 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 text-[11px] block">Practice Experience</span>
            <span className="text-slate-800 font-semibold">{partner?.businessExperience || '3-5 years'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Jurisdiction</span>
            <span className="text-slate-800 font-semibold">{partner?.city}, {partner?.district}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Verified Email</span>
            <span className="text-slate-800 font-semibold truncate block">{partner?.email}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Enrolled Date</span>
            <span className="text-slate-800 font-mono font-medium">
              {partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Update Permitted Contact & Firm Details
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Note: Partner ID, Email, and Regulatory Approval Status are permanently cryptographically locked by the BLS Compliance Secretariat.
        </p>

        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Locked Field: Partner ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Permanent Partner ID (Locked)
              </label>
              <input
                type="text"
                disabled
                value={partner?.partnerId || ''}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed"
              />
            </div>

            {/* Locked Field: Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Registered Email (Locked)
              </label>
              <input
                type="text"
                disabled
                value={partner?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs cursor-not-allowed"
              />
            </div>

            {/* Editable: Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Editable: Firm Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Firm / Office Name
              </label>
              <input
                type="text"
                value={formData.firmName}
                onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Editable: City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Operational City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Editable: District */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                District / State *
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              icon={<Save className="w-4 h-4 text-amber-400" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Selected Partner Service Offerings */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Partner Service Verticals
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Practice lines registered during partner onboarding:
        </p>

        <div className="flex flex-wrap gap-2">
          {(partner?.interestedServices || ['GST Registration & Returns', 'Income Tax & TDS Filing', 'Company & LLP Incorporation', 'ROC Annual Compliance']).map(srv => (
            <span
              key={srv}
              className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
            >
              {srv}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerProfilePage;
