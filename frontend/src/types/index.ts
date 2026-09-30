export type PartnerStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'REJECTED' | string;
export type RequestStatus = string;
export type DocumentStatus = string;
export type SettlementStatus = string;
export type TicketStatus = string;
export type ClientType = string;
export type PriorityLevel = string;
export type ServiceCategory = string;

export interface Partner {
  _id?: string;
  id?: string;
  partnerId: string;
  fullName: string;
  email: string;
  phone?: string;
  mobile?: string;
  city: string;
  district?: string;
  qualification: string;
  profession: string;
  firmName?: string;
  businessExperience?: string;
  interestedServices?: string[];
  status: PartnerStatus | string;
  createdAt?: string;
  approvedAt?: string;
}

export interface Client {
  _id?: string;
  id?: string;
  clientId?: string;
  partnerId?: string;
  fullName: string;
  businessName?: string;
  clientType: string;
  phone: string;
  mobile?: string;
  email: string;
  city: string;
  pan?: string;
  gstin?: string;
  notes?: string;
  createdAt: string;
}

export interface RequestTimelineStep {
  step?: string;
  status: string;
  label?: string;
  timestamp?: string;
  date?: string;
}

export interface ServiceRequest {
  _id?: string;
  id?: string;
  requestId: string;
  serviceRequestId?: string;
  partnerId?: string;
  clientId: string;
  clientName: string;
  serviceCategory: string;
  category?: string;
  serviceName: string;
  financialYear: string;
  priority: string;
  status: string;
  description?: string;
  requirementDesc?: string;
  assignedTeam?: string;
  remarks?: string;
  timeline?: RequestTimelineStep[];
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentItem {
  _id?: string;
  id?: string;
  documentId?: string;
  partnerId?: string;
  clientId?: string;
  clientName: string;
  requestId?: string;
  serviceRequestId?: string;
  documentType: string;
  originalName: string;
  fileName?: string;
  filePath?: string;
  downloadUrl?: string;
  fileSize: number;
  mimetype?: string;
  mimeType?: string;
  status: string;
  createdAt: string;
}

export interface CommercialRecord {
  _id?: string;
  id?: string;
  partnerId?: string;
  requestId: string;
  serviceRequestId?: string;
  serviceName: string;
  serviceTitle?: string;
  clientName?: string;
  amount: number;
  commercialAmount?: number;
  status: string;
  settlementStatus?: string;
  transactionRef?: string;
  settlementDate?: string | null;
  settledDate?: string | null;
  createdAt: string;
}

export interface TicketReply {
  _id?: string;
  senderName: string;
  name?: string;
  senderRole?: string;
  sender?: string;
  message: string;
  createdAt?: string;
  timestamp?: string;
}

export interface SupportTicket {
  _id?: string;
  id?: string;
  ticketId: string;
  partnerId?: string;
  category: string;
  subject: string;
  description: string;
  priority?: string;
  status: string;
  replies?: TicketReply[];
  createdAt: string;
}

export interface NotificationItem {
  _id?: string;
  id?: string;
  partnerId?: string;
  title: string;
  message: string;
  read?: boolean;
  isRead?: boolean;
  type?: string;
  link?: string;
  createdAt: string;
}

export type PartnerNotification = NotificationItem;

export interface DashboardStats {
  totalClients: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  documentsPending: number;
  settledPayout?: number;
  totalSettledPayout?: number;
  pendingPayout?: number;
}
