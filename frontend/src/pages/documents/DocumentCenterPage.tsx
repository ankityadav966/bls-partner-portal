import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  FileCheck,
  Shield
} from 'lucide-react';
import { documentService, BASE_URL } from '../../services/api';
import { DocumentItem } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import UploadDocumentModal from '../../components/forms/UploadDocumentModal';

export const DocumentCenterPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getAll();
      if (res.data?.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load partner documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.requestId && d.requestId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'ALL' || d.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || d.documentType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDownload = (doc: DocumentItem) => {
    // Downloads securely via direct secure cloud URL or authorized backend token
    if ((doc as any).fileUrl) {
      window.open((doc as any).fileUrl, '_blank');
      return;
    }
    const token = localStorage.getItem('bls_partner_token') || '';
    const downloadUrl = `${BASE_URL}/documents/${doc._id || doc.id}/download?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Encrypted Document Vault
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Repository ({documents.length})</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly authorized storage. Client files are encrypted and accessible only with valid Partner authorization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search document name, client or request..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Under Review">Under Review</option>
            <option value="Accepted">Accepted / Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Re-upload Required">Re-upload Required</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Document Types</option>
            <option value="PAN Card">PAN Card</option>
            <option value="Aadhaar Card">Aadhaar Card</option>
            <option value="Bank Statement">Bank Statement</option>
            <option value="GST Certificate">GST Certificate</option>
            <option value="Form 16 / 26AS">Form 16 / 26AS</option>
            <option value="Balance Sheet & PnL">Balance Sheet & PnL</option>
            <option value="MOA & AOA">MOA & AOA</option>
            <option value="Digital Signature Token (DSC)">Digital Signature Token (DSC)</option>
            <option value="Other">Other Evidence</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchDocuments}
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No documents found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900 max-w-[200px] truncate">
                            {doc.originalName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {doc.mimetype}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {doc.clientName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">
                      {doc.requestId || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {doc.documentType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Download className="w-3.5 h-3.5 text-slate-600" />}
                        onClick={() => handleDownload(doc)}
                      >
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDocuments}
      />
    </div>
  );
};

export default DocumentCenterPage;
