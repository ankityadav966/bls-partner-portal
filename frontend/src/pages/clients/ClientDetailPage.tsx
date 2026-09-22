import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Edit,
  PlusCircle,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { clientService } from '../../services/api';
import { Client, ServiceRequest, DocumentItem } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import NewRequestModal from '../../components/forms/NewRequestModal';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<Client | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit client modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    businessName: '',
    clientType: 'Proprietorship',
    notes: ''
  });
  const [editLoading, setEditLoading] = useState(false);

  // New Request modal
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  const fetchClientDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await clientService.getById(id);
      if (res.data?.success) {
        const c = res.data.data.client;
        setClient(c);
        setRequests(res.data.data.requests || []);
        setDocuments(res.data.data.documents || []);

        setEditForm({
          fullName: c.fullName,
          phone: c.phone,
          email: c.email,
          city: c.city,
          businessName: c.businessName || '',
          clientType: c.clientType,
          notes: c.notes || ''
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Client record not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setEditLoading(true);
      await clientService.update(id, editForm);
      setIsEditOpen(false);
      fetchClientDetails();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update client details.');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <Clock className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-gold" />
        Loading confidential client ledger...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl space-y-4 shadow-xs">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-semibold text-slate-900">Client Not Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error || 'This client record does not exist or belongs to another partner.'}</p>
        <Link to="/clients">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Clients List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/clients"
            className="p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{client.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold">
                {client.clientType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client Portfolio File • Enrolled on {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="w-3.5 h-3.5" />}
            onClick={() => setIsEditOpen(true)}
          >
            Edit Info
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setIsNewRequestOpen(true)}
          >
            New Service Request
          </Button>
        </div>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
          Client Identification & Contact Ledgers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block mb-1">Business / Firm Entity</span>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-600" />
              <span>{client.businessName || 'Proprietorship / Individual'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block mb-1">Mobile Contact</span>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>{client.phone}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block mb-1">Official Email</span>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-slate-500 block mb-1">Operational City</span>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{client.city}</span>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Partner Internal Notes:</span>
            {client.notes}
          </div>
        )}
      </div>

      {/* Related Service Requests */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Service Requests History ({requests.length})
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsNewRequestOpen(true)}
          >
            Create Request
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No service requests filed for this client yet.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{req.requestId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{req.serviceName}</td>
                    <td className="py-3 px-4 text-slate-500">{req.serviceCategory}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{req.financialYear}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/service-requests/${req._id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Track Status
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Documents */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Client Documents Repository ({documents.length})
          </h3>
        </div>
        <div className="p-4">
          {documents.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No files uploaded for this client yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map(doc => (
                <div key={doc._id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block truncate max-w-[200px]">
                      {doc.originalName}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {doc.documentType} • {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                    <div className="mt-2">
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Client Information">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={editForm.fullName}
              onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business / Firm Entity Name</label>
            <input
              type="text"
              value={editForm.businessName}
              onChange={e => setEditForm({ ...editForm, businessName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Client Type *</label>
              <select
                value={editForm.clientType}
                onChange={e => setEditForm({ ...editForm, clientType: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              >
                <option value="Individual">Individual</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="LLP">LLP</option>
                <option value="Trust / Society">Trust / Society</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={editForm.city}
                onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={editLoading}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Request Modal with default client */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSuccess={fetchClientDetails}
        defaultClientId={client._id}
      />
    </div>
  );
};

export default ClientDetailPage;
