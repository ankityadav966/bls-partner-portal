import React from 'react';
import { RequestStatus, DocumentStatus, SettlementStatus, TicketStatus } from '../../types';

interface StatusBadgeProps {
  status: RequestStatus | DocumentStatus | SettlementStatus | TicketStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  const getStyle = (s: string) => {
    switch (s) {
      // Completed / Approved / Settled
      case 'COMPLETED':
      case 'APPROVED':
      case 'ACCEPTED':
      case 'SETTLED':
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      // In Progress / Processing / In Review
      case 'PROCESSING':
      case 'IN_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // Under Review
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      // Documents Pending / Reupload
      case 'DOCUMENTS_PENDING':
      case 'REUPLOAD_REQUIRED':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';

      // Pending Approval / Submitted / Open
      case 'SUBMITTED':
      case 'PENDING_APPROVAL':
      case 'PENDING':
      case 'OPEN':
      case 'UPLOADED':
        return 'bg-slate-100 text-slate-700 border-slate-200';

      // Suspended / Rejected / Closed
      case 'SUSPENDED':
      case 'REJECTED':
      case 'CLOSED':
        return 'bg-red-50 text-red-700 border-red-200';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatLabel = (s: string) => {
    return s.replace(/_/g, ' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border uppercase tracking-wider ${sizeClasses} ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>{formatLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;
