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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-3xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900 border border-brand-gold/30 text-brand-gold text-xs font-semibold mb-4 tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            BLS Partner Network
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Partner Registration Application
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
            Join BLS AND COMPANY's professional partner ecosystem for CAs, CSs, CMAs, Advocates, and Corporate Advisors across India.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal & Contact */}
            <div className="border-b border-slate-800 pb-6">
              <h3 className="text-base font-semibold text-brand-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-bold">1</span>
                Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="CA. Rajesh Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="rajesh@sharmaca.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                      placeholder="Jaipur"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">District *</label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                      placeholder="Jaipur"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Professional Details */}
            <div className="border-b border-slate-800 pb-6">
              <h3 className="text-base font-semibold text-brand-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-bold">2</span>
                Professional Credentials & Practice
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Profession / Practice Type *</label>
                  <select
                    value={formData.profession}
                    onChange={e => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                  >
                    <option value="Chartered Accountant">Chartered Accountant (CA)</option>
                    <option value="Company Secretary">Company Secretary (CS)</option>
                    <option value="Cost & Management Accountant">Cost & Management Accountant (CMA)</option>
                    <option value="Tax Practitioner / Advocate">Tax Practitioner / Advocate</option>
                    <option value="Financial & Business Consultant">Financial & Business Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Highest Qualification *</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="FCA, DISA (ICAI)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Firm / Office Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firmName}
                    onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="R. Sharma & Associates"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experience in Practice *</label>
                  <select
                    value={formData.businessExperience}
                    onChange={e => setFormData({ ...formData, businessExperience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
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
            <div className="border-b border-slate-800 pb-6">
              <h3 className="text-base font-semibold text-brand-gold uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-bold">3</span>
                Interested Services & Client Offerings *
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Select service lines you want to collaborate with BLS AND COMPANY on:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SERVICE_OPTIONS.map(srv => {
                  const checked = formData.interestedServices.includes(srv);
                  return (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => toggleService(srv)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-colors border ${
                        checked
                          ? 'bg-brand-gold/15 border-brand-gold text-white font-medium'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked ? 'bg-brand-gold border-brand-gold text-navy-950' : 'border-slate-600 bg-slate-800'
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
            <div className="border-b border-slate-800 pb-6">
              <h3 className="text-base font-semibold text-brand-gold uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center font-bold">4</span>
                Account Security
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portal Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="••••••••"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:border-brand-gold focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms acceptance */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-brand-gold focus:ring-brand-gold focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400 leading-relaxed">
                  I agree to the <span className="text-brand-gold font-medium">BLS Partner Code of Conduct</span>, Client Confidentiality NDA, and Commercial Terms. I confirm that all submitted details and qualifications are accurate and verifiable.
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/login"
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Already have an account? <span className="text-brand-gold underline font-medium">Sign in</span>
              </Link>
              <Button
                type="submit"
                variant="gold"
                size="lg"
                isLoading={loading}
                icon={<UserPlus className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 shadow-lg shadow-brand-gold/20"
              >
                Submit Partner Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
