import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Calendar,
  Briefcase,
  FileWarning,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { requestService } from '../../services/api';
import { ServiceRequest } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';

const PIPELINE_STEPS = [
  'Request Submitted',
  'Documents Received',
  'Under Processing',
  'Under Review',
  'Completed'
];

export const WorkTrackingPage: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE' | 'DOCS_PENDING' | 'COMPLETED'>('ALL');

  const fetchWork = async () => {
    try {
      setLoading(true);
      const res = await requestService.getAll();
      if (res.data?.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tracking records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWork();
  }, []);

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Documents Pending':
        return 1;
      case 'Processing':
        return 2;
      case 'In Review':
        return 3;
      case 'Completed':
        return 4;
      default:
        return 0;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch =
      r.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'ACTIVE') {
      return ['Submitted', 'Under Review', 'Processing', 'In Review'].includes(r.status);
    }
    if (filterMode === 'DOCS_PENDING') {
      return r.status === 'Documents Pending';
    }
    if (filterMode === 'COMPLETED') {
      return r.status === 'Completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            Operational Tracking Desk
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Progress & Live Timeline</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent real-time status direct from BLS central execution teams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={fetchWork}
          >
            Refresh Pipeline
          </Button>
        </div>
      </div>

      {/* Quick Filters Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Work ({requests.length})
          </button>
          <button
            onClick={() => setFilterMode('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === 'ACTIVE'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            In Processing ({requests.filter(r => ['Submitted', 'Under Review', 'Processing', 'In Review'].includes(r.status)).length})
          </button>
          <button
            onClick={() => setFilterMode('DOCS_PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === 'DOCS_PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Docs Pending ({requests.filter(r => r.status === 'Documents Pending').length})
          </button>
          <button
            onClick={() => setFilterMode('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterMode === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({requests.filter(r => r.status === 'Completed').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search request, client or service..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:border-amber-500 focus:bg-white focus:outline-none placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Tracker Cards List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-white border border-slate-200/80 rounded-xl text-slate-400 text-xs shadow-xs">
            <FolderOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No service cases match the current tracking filter.
          </div>
        ) : (
          filteredRequests.map(req => {
            const stepIdx = getStepIndex(req.status);
            const isCompleted = req.status === 'Completed';

            return (
              <div
                key={req._id}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
                      {req.requestId}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{req.serviceName}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Client: <strong className="text-slate-800 font-semibold">{req.clientName}</strong> • {req.serviceCategory} • Period: {req.financialYear}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <Link
                      to={`/service-requests/${req._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      Full Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Progress Step Bar */}
                <div className="py-5">
                  <div className="grid grid-cols-5 gap-2 relative">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const isPast = idx < stepIdx;
                      const isCurrent = idx === stepIdx;

                      return (
                        <div key={step} className="flex flex-col items-center text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] mb-2 transition-all ${
                              isCompleted || isPast
                                ? 'bg-emerald-600 text-white font-bold'
                                : isCurrent
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse font-bold'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {isCompleted || isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[11px] leading-tight font-medium ${
                              isCurrent ? 'text-amber-800 font-bold' : isPast || isCompleted ? 'text-slate-900 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      Assigned: <strong className="text-slate-700 font-semibold">{req.assignedTeam || 'CA Processing Desk'}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Submitted: <span className="font-mono text-slate-700">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {req.status === 'Documents Pending' && (
                    <div className="flex items-center gap-1 text-amber-800 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <FileWarning className="w-3.5 h-3.5 text-amber-600" /> Client Documentation Required
                    </div>
                  )}

                  <span className="font-mono text-[11px] text-slate-400">
                    Last active: {new Date(req.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WorkTrackingPage;
