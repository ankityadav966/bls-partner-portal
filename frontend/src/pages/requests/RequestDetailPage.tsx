import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Building,
  UserCheck,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Headphones,
  AlertCircle
} from 'lucide-react';
import { requestService, documentService } from '../../services/api';
import { ServiceRequest, DocumentItem } from '../../types';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import UploadDocumentModal from '../../components/forms/UploadDocumentModal';
import CreateTicketModal from '../../components/forms/CreateTicketModal';

const TIMELINE_STEPS = [
  'Request Submitted',
  'Documents Received',
  'Under Processing',
  'Under Review',
  'Completed'
];

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  const fetchRequestDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await requestService.getById(id);
      if (res.data?.success) {
        setRequest(res.data.data.request);
        setDocuments(res.data.data.documents || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to retrieve service request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        <Clock className="w-6 h-6 mx-auto animate-spin mb-2 text-brand-gold" />
        Retrieving case timeline and compliance logs...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-base font-semibold text-white">Service Request Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error || 'This service request does not exist or belongs to another partner.'}</p>
        <Link to="/requests">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate current timeline index
  const getTimelineIndex = (status: string) => {
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

  const currentStepIdx = getTimelineIndex(request.status);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/service-requests"
            className="p-2 rounded-lg bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                {request.requestId}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {request.serviceName}
              </h1>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Client: <span className="text-slate-900 font-semibold">{request.clientName}</span> • Submitted on {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Headphones className="w-3.5 h-3.5 text-purple-600" />}
            onClick={() => setIsTicketOpen(true)}
          >
            Need Help on Case?
          </Button>
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

      {/* Visual Workflow Progress Timeline */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-6">
          Official Case Processing Pipeline
        </h3>

        <div className="relative">
          {/* Progress bar background line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 hidden md:block" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-amber-500 hidden md:block transition-all duration-500"
            style={{ width: `${(currentStepIdx / (TIMELINE_STEPS.length - 1)) * 90}%` }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isCompleted = request.status === 'Completed';

              return (
                <div key={step} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all ${
                      isCompleted || isPast
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isCurrent
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted || isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <span
                      className={`text-xs block font-semibold ${
                        isCurrent ? 'text-amber-800 font-bold' : isPast || isCompleted ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      {isCurrent ? 'In progress' : isPast ? 'Done' : 'Awaiting'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Case Details & Team Assignment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Scope & Requirement */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
              Engagement Scope & Description
            </h3>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/70 leading-relaxed">
                {request.description || 'No detailed instructions provided by partner.'}
              </div>

              {request.remarks && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900">
                  <span className="text-[11px] font-bold text-blue-800 block uppercase tracking-wider mb-1">
                    Compliance Secretariat Note:
                  </span>
                  {request.remarks}
                </div>
              )}
            </div>
          </div>

          {/* Attached Documents */}
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Associated Working Documents ({documents.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => setIsUploadOpen(true)}
              >
                Upload File
              </Button>
            </div>

            <div className="p-4">
              {documents.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No files uploaded for this service request yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div
                      key={doc._id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-900">{doc.originalName}</div>
                          <div className="text-[11px] text-slate-500">
                            {doc.documentType} • {(doc.fileSize / 1024).toFixed(0)} KB • Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={doc.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata & Team */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Engagement Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500">
                <span>Service Vertical</span>
                <span className="text-slate-900 font-semibold text-right">{request.serviceCategory}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500">
                <span>Assessment Period</span>
                <span className="font-mono text-amber-700 font-bold">{request.financialYear}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500">
                <span>Priority Level</span>
                <span className="font-semibold text-slate-900">{request.priority}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500">
                <span>Assigned BLS Team</span>
                <span className="text-slate-900 font-semibold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                  {request.assignedTeam || 'CA Direct Tax Cell'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Last Updated</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  {new Date(request.updatedAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* SLA Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold uppercase text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              SLA Standard
            </div>
            <p className="leading-relaxed">
              BLS Central Processing adheres to strict ICAI & MCA statutory timelines. Status updates and filing acknowledgments are auto-dispatched to your registered partner email.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchRequestDetails}
        defaultRequestId={request.requestId}
        defaultClientId={request.clientId}
      />
      <CreateTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        onSuccess={fetchRequestDetails}
      />
    </div>
  );
};

export default RequestDetailPage;
