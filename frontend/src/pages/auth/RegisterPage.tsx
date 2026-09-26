import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Building2, CheckCircle2, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const SERVICE_OPTIONS = [
  'GST Registration & Returns',
  'Income Tax & TDS Filing',
  'Company & LLP Incorporation',
  'ROC Annual Compliance',
  'PF & ESI Compliance',
  'Notice Assistance & Representation',
  'DPR & CMA Report Preparation',
  'Accounting & Virtual CFO Services'
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    qualification: '',
    profession: 'Chartered Accountant',
    firmName: '',
    businessExperience: '3-5 years',
    interestedServices: [] as string[],
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (srv: string) => {
    setFormData(prev => {
      const exists = prev.interestedServices.includes(srv);
      return {
        ...prev,
        interestedServices: exists
          ? prev.interestedServices.filter(s => s !== sVar(srv))
          : [...prev.interestedServices, srv]
      };
    });
  };

  const sVar = (val: string) => val;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Partner Terms and Professional NDA.');
      return;
    }

    if (formData.interestedServices.length === 0) {
      setError('Please select at least one interested service vertical.');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        qualification: formData.qualification,
        profession: formData.profession,
        firmName: formData.firmName,
        businessExperience: formData.businessExperience,
        interestedServices: formData.interestedServices,
        password: formData.password
      });

      navigate('/pending-approval');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-13 h-13 rounded-2xl bg-slate-900 text-amber-400 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-sm mb-3 border border-slate-800">
            B<span className="text-amber-500 text-lg">.</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-semibold mb-2 tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>BLS Partner Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Partner Registration Application
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Authorized onboarding for practicing Chartered Accountants, Company Secretaries, CMAs, Advocates, and Corporate Financial Advisors.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Step 1: Personal & Contact */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">01</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Personal & Contact Details
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="CA Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="rajesh@firm.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      placeholder="Jaipur"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">District *</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                      placeholder="Jaipur"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Professional Details */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">02</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Professional Credentials & Practice
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Profession / Practice Type *</label>
                  <select
                    value={formData.profession}
                    onChange={e => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  >
                    <option value="Chartered Accountant">Chartered Accountant (CA)</option>
                    <option value="Company Secretary">Company Secretary (CS)</option>
                    <option value="Cost & Management Accountant">Cost & Management Accountant (CMA)</option>
                    <option value="Tax Practitioner / Advocate">Tax Practitioner / Advocate</option>
                    <option value="Financial & Business Consultant">Financial & Business Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Highest Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="FCA, DISA (ICAI)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Firm / Office Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="Sharma & Associates"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience in Practice *</label>
                  <select
                    value={formData.businessExperience}
                    onChange={e => setFormData({ ...formData, businessExperience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  >
                    <option value="1-2 years">1 - 2 Years</option>
                    <option value="3-5 years">3 - 5 Years</option>
                    <option value="5-10 years">5 - 10 Years</option>
                    <option value="10+ years">10+ Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Interested Services */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">03</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Interested Services & Collaboration Areas *
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Select service lines you wish to collaborate with BLS AND COMPANY on:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICE_OPTIONS.map(srv => {
                  const checked = formData.interestedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                        checked
                          ? 'bg-amber-50/70 border-amber-400 text-slate-900 font-semibold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                        checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span>{srv}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Security & Credentials */}
            <div className="border-b border-slate-100 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">04</span>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Account Security
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Portal Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms acceptance */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to the <span className="text-slate-900 font-bold underline">BLS Partner Code of Professional Conduct</span>, Client Confidentiality NDA, and Collaboration Commercials. I confirm that all submitted details and qualifications are accurate and verifiable.
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/login"
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                Already have an account? <span className="text-amber-700 underline font-bold">Sign in here</span>
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                icon={<UserPlus className="w-4 h-4 text-amber-400" />}
                className="w-full sm:w-auto px-8"
              >
                Submit Partner Application
              </Button>
            </div>
          </form>
        </div>

        {/* Footer badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Multi-Tenant Partner Isolation • 256-Bit Encrypted Data Transfer</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
