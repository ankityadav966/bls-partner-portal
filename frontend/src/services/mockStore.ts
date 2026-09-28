// Complete in-memory client-side mock store with LocalStorage persistence
// Allows BLS Partner Portal to run 100% standalone as pure frontend without any backend

import { Partner, Client, ServiceRequest, DocumentItem, CommercialRecord, SupportTicket, NotificationItem, DashboardStats } from '../types';

const STORAGE_KEYS = {
  PARTNER: 'bls_partner_user',
  TOKEN: 'bls_partner_token',
  CLIENTS: 'bls_partner_mock_clients',
  REQUESTS: 'bls_partner_mock_requests',
  DOCUMENTS: 'bls_partner_mock_documents',
  COMMERCIALS: 'bls_partner_mock_commercials',
  TICKETS: 'bls_partner_mock_tickets',
  NOTIFICATIONS: 'bls_partner_mock_notifications'
};

const DEFAULT_PARTNER: Partner = {
  id: '',
  partnerId: '',
  fullName: 'Authorized Partner',
  email: '',
  mobile: '',
  city: '',
  district: '',
  qualification: 'Chartered Accountant',
  profession: 'Professional Partner',
  firmName: '',
  businessExperience: '',
  interestedServices: [
    'Taxation & Return Filing',
    'Notice & Representation',
    'Compliance Services',
    'Registration Services'
  ],
  status: 'APPROVED',
  createdAt: new Date().toISOString(),
  approvedAt: new Date().toISOString()
};

const DEFAULT_CLIENTS: Client[] = [];
const DEFAULT_REQUESTS: ServiceRequest[] = [];
const DEFAULT_DOCUMENTS: DocumentItem[] = [];
const DEFAULT_COMMERCIALS: CommercialRecord[] = [];
const DEFAULT_TICKETS: SupportTicket[] = [];
const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && Array.isArray(fallback)) {
      const missing = (fallback as any[]).filter(fb => !parsed.some((p: any) => (p.id && p.id === fb.id) || (p._id && p._id === fb._id) || (p.requestId && p.requestId === fb.requestId)));
      if (missing.length > 0) {
        const merged = [...missing, ...parsed];
        localStorage.setItem(key, JSON.stringify(merged));
        return merged as unknown as T;
      }
    }
    return parsed;
  } catch (e) {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export const mockStore = {
  getPartner: (): Partner => getStored(STORAGE_KEYS.PARTNER, DEFAULT_PARTNER),
  setPartner: (p: Partner) => setStored(STORAGE_KEYS.PARTNER, p),
  
  getClients: (): Client[] => getStored(STORAGE_KEYS.CLIENTS, DEFAULT_CLIENTS),
  addClient: (clientData: any): Client => {
    const clients = mockStore.getClients();
    const newClient: Client = {
      _id: 'client_' + Date.now(),
      id: 'client_' + Date.now(),
      partnerId: 'partner_001',
      fullName: clientData.fullName || '',
      businessName: clientData.businessName || '',
      clientType: clientData.clientType || 'Sole Proprietorship',
      phone: clientData.phone || clientData.mobile || '',
      mobile: clientData.phone || clientData.mobile || '',
      email: clientData.email || '',
      city: clientData.city || '',
      pan: clientData.pan || '',
      gstin: clientData.gstin || '',
      notes: clientData.notes || '',
      createdAt: new Date().toISOString()
    };
    clients.unshift(newClient);
    setStored(STORAGE_KEYS.CLIENTS, clients);
    return newClient;
  },
  updateClient: (id: string, updates: any): Client | null => {
    const clients = mockStore.getClients();
    const index = clients.findIndex(c => c._id === id || c.id === id);
    if (index === -1) return null;
    clients[index] = { ...clients[index], ...updates };
    setStored(STORAGE_KEYS.CLIENTS, clients);
    return clients[index];
  },

  getRequests: (): ServiceRequest[] => getStored(STORAGE_KEYS.REQUESTS, DEFAULT_REQUESTS),
  addRequest: (reqData: any): ServiceRequest => {
    const requests = mockStore.getRequests();
    const clients = mockStore.getClients();
    const matchedClient = clients.find(c => c._id === reqData.clientId || c.id === reqData.clientId);
    const newReq: ServiceRequest = {
      _id: 'req_' + Date.now(),
      id: 'req_' + Date.now(),
      requestId: 'SRN-2026-' + Math.floor(1000 + Math.random() * 9000),
      serviceRequestId: 'SRN-2026-' + Math.floor(1000 + Math.random() * 9000),
      partnerId: 'partner_001',
      clientId: reqData.clientId || '',
      clientName: matchedClient?.businessName || matchedClient?.fullName || reqData.clientName || 'Valued Client',
      serviceCategory: reqData.serviceCategory || reqData.category || 'Taxation & Return Filing',
      category: reqData.serviceCategory || reqData.category || 'Taxation & Return Filing',
      serviceName: reqData.serviceName || 'Custom Advisory & Filing',
      financialYear: reqData.financialYear || '2025-26',
      priority: reqData.priority || 'MEDIUM',
      status: 'SUBMITTED',
      description: reqData.description || reqData.requirementDesc || '',
      requirementDesc: reqData.description || reqData.requirementDesc || '',
      timeline: [
        { status: 'SUBMITTED', label: 'Request Submitted by Partner', timestamp: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };
    requests.unshift(newReq);
    setStored(STORAGE_KEYS.REQUESTS, requests);
    return newReq;
  },

  getDocuments: (): DocumentItem[] => getStored(STORAGE_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS),
  addDocument: (docData: any): DocumentItem => {
    const docs = mockStore.getDocuments();
    const newDoc: DocumentItem = {
      _id: 'doc_' + Date.now(),
      id: 'doc_' + Date.now(),
      documentId: 'DOC-' + Math.floor(100 + Math.random() * 900),
      partnerId: 'partner_001',
      clientId: docData.clientId || '',
      clientName: docData.clientName || 'Partner Client',
      serviceRequestId: docData.serviceRequestId || docData.requestId || 'SRN-GENERAL',
      requestId: docData.serviceRequestId || docData.requestId || 'SRN-GENERAL',
      documentType: docData.documentType || 'Uploaded Document',
      originalName: docData.originalName || docData.fileName || 'Uploaded_Doc.pdf',
      fileName: docData.originalName || docData.fileName || 'Uploaded_Doc.pdf',
      fileSize: docData.fileSize || 1024000,
      mimetype: docData.mimetype || 'application/pdf',
      mimeType: docData.mimetype || 'application/pdf',
      status: 'ACCEPTED',
      createdAt: new Date().toISOString()
    };
    docs.unshift(newDoc);
    setStored(STORAGE_KEYS.DOCUMENTS, docs);
    return newDoc;
  },

  getCommercials: (): CommercialRecord[] => getStored(STORAGE_KEYS.COMMERCIALS, DEFAULT_COMMERCIALS),
  
  getTickets: (): SupportTicket[] => getStored(STORAGE_KEYS.TICKETS, DEFAULT_TICKETS),
  addTicket: (tktData: any): SupportTicket => {
    const tickets = mockStore.getTickets();
    const newTicket: SupportTicket = {
      _id: 'tkt_' + Date.now(),
      id: 'tkt_' + Date.now(),
      ticketId: 'TKT-2026-' + Math.floor(100 + Math.random() * 900),
      partnerId: 'partner_001',
      category: tktData.category || 'General Support',
      subject: tktData.subject || '',
      priority: tktData.priority || 'MEDIUM',
      status: 'OPEN',
      description: tktData.description || '',
      replies: [
        {
          _id: 'rep_' + Date.now(),
          sender: 'partner',
          senderRole: 'partner',
          senderName: 'CA Rajesh Sharma',
          name: 'CA Rajesh Sharma',
          message: tktData.description || '',
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    tickets.unshift(newTicket);
    setStored(STORAGE_KEYS.TICKETS, tickets);
    return newTicket;
  },

  getNotifications: (): NotificationItem[] => getStored(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS),
  markNotificationRead: (id: string) => {
    const notifs = mockStore.getNotifications();
    const target = notifs.find(n => n._id === id || n.id === id);
    if (target) {
      target.read = true;
      target.isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  getStats: (): DashboardStats => {
    const clients = mockStore.getClients();
    const requests = mockStore.getRequests();
    const docs = mockStore.getDocuments();
    const commercials = mockStore.getCommercials();

    const pendingRequests = requests.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length;
    const completedRequests = requests.filter(r => r.status === 'COMPLETED').length;
    const documentsPending = requests.filter(r => r.status === 'DOCUMENTS_PENDING').length;
    
    const settledPayout = commercials
      .filter(c => c.status === 'SETTLED' || c.settlementStatus === 'SETTLED')
      .reduce((sum, c) => sum + (c.amount || c.commercialAmount || 0), 0);

    const pendingPayout = commercials
      .filter(c => c.status !== 'SETTLED' && c.settlementStatus !== 'SETTLED')
      .reduce((sum, c) => sum + (c.amount || c.commercialAmount || 0), 0);

    return {
      totalClients: clients.length,
      totalRequests: requests.length,
      pendingRequests,
      completedRequests,
      documentsPending,
      settledPayout,
      pendingPayout
    };
  }
};
