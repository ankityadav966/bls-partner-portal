import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Download,
  Calendar,
  ExternalLink,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { requestService } from '../../services/api';
import { ServiceRequest } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import NewRequestModal from '../../components/forms/NewRequestModal';

export const RequestsListPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await requestService.getAll();
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || r.serviceCategory === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredRequests.length === 0) return;
    const headers = ['Request ID', 'Client Name', 'Service Name', 'Category', 'Period', 'Status', 'Priority', 'Submission Date'];
    const rows = filteredRequests.map(r => [
      `"${r.requestId}"`,
      `"${r.clientName}"`,
      `"${r.serviceName}"`,
      `"${r.serviceCategory}"`,
      `"${r.financialYear}"`,
      `"${r.status}"`,
      `"${r.priority}"`,
      `"${new Date(r.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BLS_Service_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            Compliance & Advisory Cases
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests ({requests.length})</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit assignments for your clients directly into the BLS CA Processing Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={exportToCSV}
            disabled={filteredRequests.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4 text-amber-400" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            New Service Request
          </Button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request ID, client or service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Categories</option>
            <option value="Registration Services">Registration Services</option>
            <option value="Taxation & Return Filing">Taxation & Return Filing</option>
            <option value="Compliance Services">Compliance Services</option>
            <option value="Notice & Representation">Notice & Representation</option>
            <option value="Business & Advisory Services">Business & Advisory Services</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Documents Pending">Documents Pending</option>
            <option value="Processing">Processing</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchRequests}
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Service & Vertical</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No service requests match current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.requestId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.clientName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{req.serviceName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{req.serviceCategory}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {req.financialYear}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        req.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : req.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/service-requests/${req._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchRequests}
      />
    </div>
  );
};

export default RequestsListPage;
