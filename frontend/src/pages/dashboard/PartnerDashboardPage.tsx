import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  FileWarning,
  Coins,
  ArrowRight,
  UserPlus,
  PlusCircle,
  Upload,
  Headphones,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/api';
import { DashboardStats, ServiceRequest, Client, NotificationItem } from '../../types';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import AddClientModal from '../../components/forms/AddClientModal';
import NewRequestModal from '../../components/forms/NewRequestModal';
import UploadDocumentModal from '../../components/forms/UploadDocumentModal';
import CreateTicketModal from '../../components/forms/CreateTicketModal';

export const PartnerDashboardPage: React.FC = () => {
  const { partner } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res: any = await dashboardService.getStats();
      const payload: any = res.data?.data || res.data || {};
      if (payload.stats) {
        setStats(payload.stats);
      }
      setRecentRequests(payload.recentRequests || []);
      setRecentClients(payload.recentClients || []);
      setPendingDocs(payload.pendingDocumentsList || []);
      setNotifications(payload.notifications || []);
    } catch (err) {
      console.error('Failed to load partner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-50 via-blue-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-bold tracking-wider uppercase font-mono">
                {partner?.partnerId || 'BLS PARTNER'}
              </span>
              <span className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-amber-700">{partner?.fullName}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
              {partner?.firmName ? `${partner.firmName} • ` : ''}{partner?.qualification} — Manage client filings, initiate new advisory cases, and track live status.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={fetchDashboardData}
            >
              Sync Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-4 h-4 text-amber-400" />}
              onClick={() => setIsNewRequestOpen(true)}
            >
              New Service Request
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Responsive Grid with Zero Overflow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Clients"
          value={stats?.totalClients ?? 0}
          subtitle="Managed in portfolio"
          icon={<Users className="w-4 h-4" />}
          variant="gold"
        />
        <StatCard
          title="Total Requests"
          value={stats?.totalRequests ?? 0}
          subtitle="Service cases created"
          icon={<Briefcase className="w-4 h-4" />}
          variant="blue"
        />
        <StatCard
          title="In Progress"
          value={stats?.pendingRequests ?? 0}
          subtitle="Under processing/review"
          icon={<Clock className="w-4 h-4" />}
          variant="warning"
        />
        <StatCard
          title="Completed"
          value={stats?.completedRequests ?? 0}
          subtitle="Successfully filed/resolved"
          icon={<CheckCircle2 className="w-4 h-4" />}
          variant="success"
        />
        <StatCard
          title="Docs Pending"
          value={stats?.documentsPending ?? 0}
          subtitle="Client upload required"
          icon={<FileWarning className="w-4 h-4" />}
          variant="danger"
        />
        <StatCard
          title="Settled Payout"
          value={`₹${((stats?.settledPayout ?? 0) / 1000).toFixed(1)}k`}
          subtitle={`₹${((stats?.pendingPayout ?? 0) / 1000).toFixed(1)}k Pending`}
          icon={<Coins className="w-4 h-4" />}
          variant="gold"
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          Partner Quick Actions
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5 text-amber-600" />}
            onClick={() => setIsAddClientOpen(true)}
          >
            Add New Client
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5 text-blue-600" />}
            onClick={() => setIsNewRequestOpen(true)}
          >
            Create Request
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={() => setIsUploadDocOpen(true)}
          >
            Upload Documents
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Headphones className="w-3.5 h-3.5 text-purple-600" />}
            onClick={() => setIsTicketOpen(true)}
          >
            Contact Support
          </Button>
        </div>
      </div>

      {/* Pending Documents Warning Banner if any */}
      {pendingDocs.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Action Needed: Pending Client Documents
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingDocs.length} service request{pendingDocs.length > 1 ? 's are' : ' is'} on hold pending KYC, Bank Statement, or DSC documents from clients.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setIsUploadDocOpen(true)}
          >
            Resolve Documents
          </Button>
        </div>
      )}

      {/* Main Grid: Recent Requests & Work Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Service Requests */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Service Requests Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Service Requests
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live operational status from BLS Compliance Team
                </p>
              </div>
              <Link
                to="/service-requests"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-semibold">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No service requests created yet. Click "New Service Request" to begin.
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {req.requestId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="font-semibold text-slate-900">{req.clientName}</div>
                          <div className="text-[11px] text-slate-500">{req.financialYear}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold text-slate-900">{req.serviceName}</span>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{req.serviceCategory}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/service-requests/${req._id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Clients */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Clients
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exclusive client records linked to your Partner ID
                </p>
              </div>
              <Link
                to="/clients"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 transition-colors"
              >
                Manage Clients <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentClients.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No clients enrolled yet. Use "Add New Client" to start building your client base.
                </div>
              ) : (
                recentClients.map(client => (
                  <div key={client._id} className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 font-bold text-xs">
                        {client.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{client.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {client.businessName && <span>{client.businessName} • </span>}
                          <span>{client.city}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-semibold">{client.clientType}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/clients/${client._id}`}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Notifications & Commercial Summary */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Activity Stream
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Live updates</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  All caught up! No new notifications.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} className={`p-3.5 text-xs transition-colors ${n.read ? 'opacity-75' : 'bg-blue-50/30'}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BLS Dedicated Help Desk */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Dedicated Partner Desk</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Need priority handling on a complex litigation notice, ROC delay, or customized corporate structure? Reach your assigned Partner Manager.
              </p>
              <div className="pt-2">
                <Button
                  variant="gold"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setIsTicketOpen(true)}
                >
                  Raise Priority Support Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <UploadDocumentModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <CreateTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default PartnerDashboardPage;
