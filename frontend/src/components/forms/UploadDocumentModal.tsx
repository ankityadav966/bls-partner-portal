import React, { useState, useEffect } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { api } from '../../services/api';
import { Client, ServiceRequest } from '../../types';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedClientId?: string;
  preselectedRequestId?: string;
  defaultClientId?: string;
  defaultRequestId?: string;
}

const documentTypes = [
  'PAN / Aadhaar of Director or Proprietor',
  'Electricity Bill / Address Proof / NOC',
  'Bank Statement (Last 6–12 Months)',
  'Income Tax Return / Form 16 / 26AS',
  'Audited Balance Sheet & Profit & Loss',
  'Purchase & Sales Ledger Extract',
  'GST Notice Copy (ASMT-10 / DRC-01)',
  'Incorporation Certificate / MOA / AOA',
  'Partnership Deed / LLP Agreement',
  'Supporting Exhibits / Other Statutory File'
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
  preselectedRequestId,
  defaultClientId,
  defaultRequestId
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [clientId, setClientId] = useState<string>(defaultClientId || preselectedClientId || '');
  const [serviceRequestId, setServiceRequestId] = useState<string>(defaultRequestId || preselectedRequestId || 'GENERAL_VAULT');
  const [documentType, setDocumentType] = useState<string>(documentTypes[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadClientsAndRequests();
      const targetC = defaultClientId || preselectedClientId;
      const targetR = defaultRequestId || preselectedRequestId;
      if (targetC) setClientId(targetC);
      if (targetR) setServiceRequestId(targetR);
    }
  }, [isOpen, preselectedClientId, preselectedRequestId, defaultClientId, defaultRequestId]);

  const loadClientsAndRequests = async () => {
    try {
      const [resC, resR] = await Promise.all([
        api.get('/clients'),
        api.get('/service-requests')
      ]);
      if (resC.data.success) {
        setClients(resC.data.clients || []);
        if (!preselectedClientId && !defaultClientId && resC.data.clients.length > 0) {
          setClientId(resC.data.clients[0].id || resC.data.clients[0]._id);
        }
      }
      if (resR.data.success) {
        setRequests(resR.data.serviceRequests || []);
      }
    } catch (err) {
      console.error('Failed to load clients/requests for document upload:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('File size exceeds the 15 MB limit. Please compress or select a smaller file.');
        setSelectedFile(null);
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    if (!clientId) {
      setError('Please select the client this document belongs to.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document', selectedFile);
      formData.append('title', selectedFile.name);
      formData.append('clientId', clientId);
      formData.append('serviceRequestId', serviceRequestId);
      formData.append('documentType', documentType);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.data?.message || 'Upload failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please check file format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Secure Document"
      subtitle="Authorized vault storage for confidential client financial and identity papers."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Client Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Client *
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName || c.fullName} - {c.city}
              </option>
            ))}
          </select>
        </div>

        {/* Related Service Request */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Link to Service Request (Optional)
          </label>
          <select
            value={serviceRequestId}
            onChange={(e) => setServiceRequestId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
          >
            <option value="GENERAL_VAULT">General Client Vault (Not linked to specific SRN)</option>
            {requests
              .filter((r) => !clientId || r.clientId === clientId)
              .map((r) => (
                <option key={r.id} value={r.serviceRequestId}>
                  {r.serviceRequestId} — {r.serviceName} ({r.financialYear})
                </option>
              ))}
          </select>
        </div>

        {/* Document Classification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Document Category / Purpose *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 font-medium"
          >
            {documentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* File Drop Area */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Select File (PDF, JPG, PNG, Excel - Max 15 MB) *
          </label>
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-2xl bg-slate-50 hover:bg-gold-50/20 transition-all cursor-pointer text-center">
            <UploadCloud className="w-8 h-8 text-gold-600 mb-2" />
            <span className="text-xs font-bold text-navy-950">
              {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Encrypted storage under BLS Partner Vault'}
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.zip"
              className="hidden"
            />
          </label>
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
            disabled={!selectedFile || clients.length === 0}
          >
            Upload to Vault
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;
