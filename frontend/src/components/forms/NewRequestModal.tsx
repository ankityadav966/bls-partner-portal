import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Client, ServiceCategory, PriorityLevel } from '../../types';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedClientId?: string;
  defaultClientId?: string;
}

const serviceCatalog: Record<ServiceCategory, string[]> = {
  'Registration Services': [
    'Private Limited Company Registration',
    'Limited Liability Partnership (LLP) Registration',
    'GST New Registration',
    'MSME (Udyam) Registration',
    'Import Export Code (IEC)',
    'Trademark & Brand Registration'
  ],
  'Taxation & Return Filing': [
    'Income Tax Return (ITR) Filing',
    'GST Monthly / Quarterly Return (GSTR-1 & 3B)',
    'TDS Quarterly Return Filing (Form 24Q/26Q)',
    'Tax Audit Assistance (Sec 44AB)',
    'Advance Tax Computation & Filing'
  ],
  'Compliance Services': [
    'Annual MCA / ROC Compliance (AOC-4 & MGT-7)',
    'Director KYC (DIR-3 KYC)',
    'PF & ESI Monthly Compliance & ECR',
    'Statutory Audit Readiness Dossier',
    'Secretarial Documentation & Minutes'
  ],
  'Notice & Representation': [
    'Income Tax Scrutiny / Sec 148 Reassessment Reply',
    'GST Scrutiny & Notice Reply (ASMT-10 / DRC-01)',
    'Faceless Appeal Drafting & Representation',
    'TDS Default Rectification on TRACES'
  ],
  'Business & Advisory Services': [
    'CMA Data Report for Bank Loan / CC Limit',
    'Detailed Project Report (DPR)',
    'Startup Valuation & Pitch Financial Modeling',
    'Virtual CFO & Strategic Advisory'
  ]
};

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
  defaultClientId
}) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(defaultClientId || preselectedClientId || '');
  const [category, setCategory] = useState<ServiceCategory>('Taxation & Return Filing');
  const [serviceName, setServiceName] = useState<string>('GST Monthly / Quarterly Return (GSTR-1 & 3B)');
  const [financialYear, setFinancialYear] = useState<string>('2025-26');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [requirementDesc, setRequirementDesc] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      const targetId = defaultClientId || preselectedClientId;
      if (targetId) {
        setSelectedClientId(targetId);
      }
    }
  }, [isOpen, preselectedClientId, defaultClientId]);

  // When category changes, default to first service in list
  useEffect(() => {
    if (serviceCatalog[category] && serviceCatalog[category].length > 0) {
      setServiceName(serviceCatalog[category][0]);
    }
  }, [category]);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      if (res.data.success) {
        setClients(res.data.clients || []);
        if (!preselectedClientId && res.data.clients.length > 0 && !selectedClientId) {
          setSelectedClientId(res.data.clients[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedClientId) {
      setError('Please select or add a client first.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/service-requests', {
        clientId: selectedClientId,
        category,
        serviceName,
        financialYear,
        priority,
        requirementDesc
      });

      if (res.data.success) {
        onClose();
        if (onSuccess) onSuccess();
        navigate(`/service-requests/${res.data.serviceRequest.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request. Please verify inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Service Request"
      subtitle="Initiate professional filing, audit, notice reply, or advisory docket for your client."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Client Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Select Client *
          </label>
          {clients.length === 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              No clients found in your account. Please add a client first from the Clients section.
            </div>
          ) : (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.businessName || c.fullName} ({c.clientType}) - {c.city}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Category & Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Service Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              {Object.keys(serviceCatalog).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Specific Service *
            </label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              {(serviceCatalog[category] || []).map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Year & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Financial / Assessment Year
            </label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              <option value="2025-26">FY 2025-26 / AY 2026-27</option>
              <option value="2024-25">FY 2024-25 / AY 2025-26</option>
              <option value="2023-24">FY 2023-24 / AY 2024-25</option>
              <option value="2022-23">FY 2022-23 / AY 2023-24</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Docket Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
            >
              <option value="LOW">Low (Standard SLA)</option>
              <option value="MEDIUM">Medium (Recommended)</option>
              <option value="HIGH">High (Approaching Deadline)</option>
              <option value="URGENT">Urgent (Statutory Notice Due)</option>
            </select>
          </div>
        </div>

        {/* Description / Specific instructions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Requirement Details / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Brief scope, notice DIN, bank limit specifics, or special instructions..."
            value={requirementDesc}
            onChange={(e) => setRequirementDesc(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            size="sm"
            isLoading={isLoading}
            disabled={clients.length === 0}
          >
            Generate Service Docket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewRequestModal;
