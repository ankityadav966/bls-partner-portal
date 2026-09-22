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
  id: 'partner_001',
  partnerId: 'BLS-P-10024',
  fullName: 'CA Rajesh Sharma',
  email: 'partner@blscompany.com',
  mobile: '9829012345',
  city: 'Jaipur',
  district: 'Jaipur',
  qualification: 'Chartered Accountant (FCA)',
  profession: 'Practicing Chartered Accountant',
  firmName: 'Sharma & Associates',
  businessExperience: '8+ Years',
  interestedServices: [
    'Taxation & Return Filing',
    'Notice & Representation',
    'Compliance Services',
    'Registration Services'
  ],
  status: 'APPROVED',
  createdAt: '2026-01-10T10:00:00Z',
  approvedAt: '2026-01-11T12:00:00Z'
};

const DEFAULT_CLIENTS: Client[] = [
  {
    _id: 'client_101',
    id: 'client_101',
    partnerId: 'partner_001',
    fullName: 'Vikramaditya Rathore',
    businessName: 'Rathore Steels & Logistics Pvt Ltd',
    clientType: 'Private Limited Company',
    phone: '9828001122',
    mobile: '9828001122',
    email: 'vikram@rathoresteels.in',
    city: 'Jaipur',
    pan: 'AAACR1234F',
    gstin: '08AAACR1234F1Z5',
    notes: 'Monthly GST return & Quarterly TDS filing client.',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    _id: 'client_102',
    id: 'client_102',
    partnerId: 'partner_001',
    fullName: 'Manish Khandelwal',
    businessName: 'Khandelwal Agro Enterprises',
    clientType: 'Partnership Firm',
    phone: '9414002233',
    mobile: '9414002233',
    email: 'manish@khandelwalagro.com',
    city: 'Jobner',
    pan: 'AABFK9876C',
    gstin: '08AABFK9876C1Z9',
    notes: 'Applied for CC bank loan CMA dossier.',
    createdAt: '2026-02-14T11:30:00Z'
  },
  {
    _id: 'client_103',
    id: 'client_103',
    partnerId: 'partner_001',
    fullName: 'Pooja Agarwal',
    businessName: 'Agarwal Tech Innovations LLP',
    clientType: 'Limited Liability Partnership',
    phone: '9783004455',
    mobile: '9783004455',
    email: 'pooja@agarwaltech.io',
    city: 'Jaipur',
    pan: 'AABCA4321D',
    gstin: '08AABCA4321D1ZB',
    notes: 'Startup ROC Annual filings & GST audit.',
    createdAt: '2026-03-01T09:15:00Z'
  },
  {
    _id: 'client_104',
    id: 'client_104',
    partnerId: 'partner_001',
    fullName: 'Suresh Kumar Verma',
    businessName: 'Verma Stone Crusher & Minerals',
    clientType: 'Sole Proprietorship',
    phone: '9829007788',
    mobile: '9829007788',
    email: 'suresh@vermaminerals.in',
    city: 'Dausa',
    pan: 'AMKPV5544R',
    gstin: '08AMKPV5544R1Z1',
    notes: 'GST ASMT-10 scrutiny notice assistance required.',
    createdAt: '2026-03-10T14:20:00Z'
  }
];

const DEFAULT_REQUESTS: ServiceRequest[] = [
  {
    _id: 'req_201',
    id: 'req_201',
    requestId: 'SRN-2026-0814',
    serviceRequestId: 'SRN-2026-0814',
    partnerId: 'partner_001',
    clientId: 'client_104',
    clientName: 'Verma Stone Crusher & Minerals',
    serviceCategory: 'Notice & Representation',
    category: 'Notice & Representation',
    serviceName: 'GST Scrutiny & Notice Reply (ASMT-10)',
    financialYear: '2024-25',
    priority: 'HIGH',
    status: 'PROCESSING',
    description: 'DRC-01A intimation regarding Input Tax Credit mismatch in GSTR-2B vs 3B.',
    requirementDesc: 'DRC-01A intimation regarding Input Tax Credit mismatch in GSTR-2B vs 3B.',
    timeline: [
      { status: 'SUBMITTED', label: 'Request Submitted by Partner', timestamp: '2026-03-11T10:00:00Z' },
      { status: 'UNDER_REVIEW', label: 'Assigned to BLS Indirect Tax Desk', timestamp: '2026-03-11T14:30:00Z' },
      { status: 'PROCESSING', label: 'Factual Reconciliation & ASMT-11 Drafting In Progress', timestamp: '2026-03-12T11:00:00Z' }
    ],
    createdAt: '2026-03-11T10:00:00Z'
  },
  {
    _id: 'req_202',
    id: 'req_202',
    requestId: 'SRN-2026-0792',
    serviceRequestId: 'SRN-2026-0792',
    partnerId: 'partner_001',
    clientId: 'client_102',
    clientName: 'Khandelwal Agro Enterprises',
    serviceCategory: 'Business & Advisory Services',
    category: 'Business & Advisory Services',
    serviceName: 'CMA Data Report for Bank Loan',
    financialYear: '2025-26',
    priority: 'MEDIUM',
    status: 'IN_REVIEW',
    description: '₹1.50 Cr Cash Credit limit proposal for Punjab National Bank Jobner branch.',
    requirementDesc: '₹1.50 Cr Cash Credit limit proposal for Punjab National Bank Jobner branch.',
    timeline: [
      { status: 'SUBMITTED', label: 'Request Submitted', timestamp: '2026-03-05T09:30:00Z' },
      { status: 'UNDER_REVIEW', label: 'Financial Statements Verified', timestamp: '2026-03-05T15:00:00Z' },
      { status: 'PROCESSING', label: 'MPBF Ratio & Cash Flow Modeling Completed', timestamp: '2026-03-07T16:00:00Z' },
      { status: 'IN_REVIEW', label: 'Final Dossier Internal Verification', timestamp: '2026-03-09T10:00:00Z' }
    ],
    createdAt: '2026-03-05T09:30:00Z'
  },
  {
    _id: 'req_203',
    id: 'req_203',
    requestId: 'SRN-2026-0740',
    serviceRequestId: 'SRN-2026-0740',
    partnerId: 'partner_001',
    clientId: 'client_101',
    clientName: 'Rathore Steels & Logistics Pvt Ltd',
    serviceCategory: 'Compliance Services',
    category: 'Compliance Services',
    serviceName: 'Annual MCA / ROC Compliance (AOC-4 & MGT-7)',
    financialYear: '2024-25',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    description: 'Financial statements upload and director KYC verification.',
    requirementDesc: 'Financial statements upload and director KYC verification.',
    timeline: [
      { status: 'SUBMITTED', label: 'Request Initiated', timestamp: '2026-02-15T11:00:00Z' },
      { status: 'PROCESSING', label: 'Forms AOC-4 & MGT-7 Drafted', timestamp: '2026-02-18T14:00:00Z' },
      { status: 'COMPLETED', label: 'Filed on MCA V3 Portal with SRN Acknowledgement', timestamp: '2026-02-22T17:30:00Z' }
    ],
    createdAt: '2026-02-15T11:00:00Z'
  },
  {
    _id: 'req_204',
    id: 'req_204',
    requestId: 'SRN-2026-0850',
    serviceRequestId: 'SRN-2026-0850',
    partnerId: 'partner_001',
    clientId: 'client_103',
    clientName: 'Agarwal Tech Innovations LLP',
    serviceCategory: 'Registration Services',
    category: 'Registration Services',
    serviceName: 'Startup India & MSME Udyam Registration',
    financialYear: '2025-26',
    priority: 'LOW',
    status: 'DOCUMENTS_PENDING',
    description: 'Aadhaar OTP verification and NIC code tagging pending.',
    requirementDesc: 'Aadhaar OTP verification and NIC code tagging pending.',
    timeline: [
      { status: 'SUBMITTED', label: 'Request Submitted', timestamp: '2026-03-14T12:00:00Z' },
      { status: 'DOCUMENTS_PENDING', label: 'Electricity bill & partner declaration requested', timestamp: '2026-03-15T10:00:00Z' }
    ],
    createdAt: '2026-03-14T12:00:00Z'
  }
];

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    _id: 'doc_301',
    id: 'doc_301',
    documentId: 'DOC-901',
    partnerId: 'partner_001',
    clientId: 'client_104',
    clientName: 'Verma Stone Crusher & Minerals',
    serviceRequestId: 'SRN-2026-0814',
    requestId: 'SRN-2026-0814',
    documentType: 'Notice Copy (ASMT-10)',
    originalName: 'GST_Notice_ASMT10_Verma.pdf',
    fileName: 'GST_Notice_ASMT10_Verma.pdf',
    fileSize: 1428000,
    mimetype: 'application/pdf',
    mimeType: 'application/pdf',
    status: 'ACCEPTED',
    createdAt: '2026-03-11T10:05:00Z'
  },
  {
    _id: 'doc_302',
    id: 'doc_302',
    documentId: 'DOC-902',
    partnerId: 'partner_001',
    clientId: 'client_102',
    clientName: 'Khandelwal Agro Enterprises',
    serviceRequestId: 'SRN-2026-0792',
    requestId: 'SRN-2026-0792',
    documentType: 'Audited Financials (3 Yrs)',
    originalName: 'Financials_2022_2025_Khandelwal.pdf',
    fileName: 'Financials_2022_2025_Khandelwal.pdf',
    fileSize: 2840000,
    mimetype: 'application/pdf',
    mimeType: 'application/pdf',
    status: 'ACCEPTED',
    createdAt: '2026-03-05T09:40:00Z'
  },
  {
    _id: 'doc_303',
    id: 'doc_303',
    documentId: 'DOC-903',
    partnerId: 'partner_001',
    clientId: 'client_101',
    clientName: 'Rathore Steels & Logistics Pvt Ltd',
    serviceRequestId: 'SRN-2026-0740',
    requestId: 'SRN-2026-0740',
    documentType: 'ROC Filing Acknowledgement (SRN)',
    originalName: 'AOC4_SRN_Acknowledgement.pdf',
    fileName: 'AOC4_SRN_Acknowledgement.pdf',
    fileSize: 620000,
    mimetype: 'application/pdf',
    mimeType: 'application/pdf',
    status: 'ACCEPTED',
    createdAt: '2026-02-22T17:35:00Z'
  }
];

const DEFAULT_COMMERCIALS: CommercialRecord[] = [
  {
    _id: 'comm_401',
    id: 'comm_401',
    partnerId: 'partner_001',
    serviceRequestId: 'SRN-2026-0740',
    requestId: 'SRN-2026-0740',
    serviceName: 'Annual MCA / ROC Compliance',
    serviceTitle: 'Annual MCA / ROC Compliance',
    clientName: 'Rathore Steels & Logistics Pvt Ltd',
    amount: 4500,
    commercialAmount: 4500,
    status: 'SETTLED',
    settlementStatus: 'SETTLED',
    transactionRef: 'NEFT/SBI/20260228/88921',
    settlementDate: '2026-02-28T16:00:00Z',
    settledDate: '2026-02-28T16:00:00Z',
    createdAt: '2026-02-22T17:30:00Z'
  },
  {
    _id: 'comm_402',
    id: 'comm_402',
    partnerId: 'partner_001',
    serviceRequestId: 'SRN-2026-0792',
    requestId: 'SRN-2026-0792',
    serviceName: 'CMA Data Report for Bank Loan',
    serviceTitle: 'CMA Data Report for Bank Loan',
    clientName: 'Khandelwal Agro Enterprises',
    amount: 6000,
    commercialAmount: 6000,
    status: 'PROCESSING',
    settlementStatus: 'PROCESSING',
    transactionRef: 'Pending Final Verification',
    settlementDate: null,
    settledDate: null,
    createdAt: '2026-03-09T10:00:00Z'
  },
  {
    _id: 'comm_403',
    id: 'comm_403',
    partnerId: 'partner_001',
    serviceRequestId: 'SRN-2026-0814',
    requestId: 'SRN-2026-0814',
    serviceName: 'GST Notice Reply (ASMT-10)',
    serviceTitle: 'GST Notice Reply (ASMT-10)',
    clientName: 'Verma Stone Crusher & Minerals',
    amount: 5000,
    commercialAmount: 5000,
    status: 'PENDING',
    settlementStatus: 'PENDING',
    transactionRef: 'Awaiting Order Clearance',
    settlementDate: null,
    settledDate: null,
    createdAt: '2026-03-11T10:00:00Z'
  }
];

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    _id: 'tkt_501',
    id: 'tkt_501',
    ticketId: 'TKT-2026-104',
    partnerId: 'partner_001',
    category: 'Service Processing Query',
    subject: 'Expedited Review Needed for Bank CMA Format',
    priority: 'HIGH',
    status: 'RESOLVED',
    description: 'Bank credit officer requested addition of DSCR sensitivity table in Form II.',
    replies: [
      { _id: 'rep_1', sender: 'partner', senderRole: 'partner', senderName: 'CA Rajesh Sharma', name: 'CA Rajesh Sharma', message: 'Please add 10% sensitivity variation in DSCR as per PNB norms.', timestamp: '2026-03-07T10:00:00Z', createdAt: '2026-03-07T10:00:00Z' },
      { _id: 'rep_2', sender: 'bls_support', senderRole: 'admin', senderName: 'BLS Credit Advisory Team', name: 'BLS Credit Advisory Team', message: 'Updated CMA dossier with revised sensitivity tab has been uploaded to your documents vault.', timestamp: '2026-03-07T14:30:00Z', createdAt: '2026-03-07T14:30:00Z' }
    ],
    createdAt: '2026-03-07T10:00:00Z'
  }
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    _id: 'notif_601',
    id: 'notif_601',
    partnerId: 'partner_001',
    title: 'Draft Notice Reply Uploaded',
    message: 'Draft ASMT-11 reply for Verma Stone Crusher is available for review.',
    type: 'service_update',
    link: '/service-requests/req_201',
    read: false,
    isRead: false,
    createdAt: '2026-03-12T11:05:00Z'
  },
  {
    _id: 'notif_602',
    id: 'notif_602',
    partnerId: 'partner_001',
    title: 'Commercial Settlement Processed',
    message: 'Commercial settlement of ₹4,500 for SRN-2026-0740 has been credited via NEFT.',
    type: 'payout',
    link: '/commercials',
    read: true,
    isRead: true,
    createdAt: '2026-02-28T16:15:00Z'
  },
  {
    _id: 'notif_603',
    id: 'notif_603',
    partnerId: 'partner_001',
    title: 'Welcome to BLS Partner Network',
    message: 'Your partner registration has been verified and approved. Partner ID: BLS-P-10024.',
    type: 'account',
    link: '/profile',
    read: true,
    isRead: true,
    createdAt: '2026-01-11T12:00:00Z'
  }
];

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
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
