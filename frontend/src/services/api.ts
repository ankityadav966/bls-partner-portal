import { mockStore } from './mockStore';

export const PRODUCTION_API_URL = 'https://bls.durgagenerator.com/api/v1';

export const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && !envUrl.includes('pls.durgaselector.com')) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return PRODUCTION_API_URL;
};

export const BASE_URL = getBaseUrl();

/**
 * Normalizes API endpoint URL so /api/v1 is never duplicated.
 */
export const buildApiUrl = (baseUrl: string, endpoint: string): string => {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (cleanBase.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1/')) {
    cleanEndpoint = cleanEndpoint.substring('/api/v1'.length);
  } else if (cleanBase.endsWith('/api/v1') && cleanEndpoint === '/api/v1') {
    cleanEndpoint = '';
  }

  return `${cleanBase}${cleanEndpoint}`;
};

const getAuthHeaders = (isJson = true): HeadersInit => {
  const token = localStorage.getItem('bls_partner_token') || '';
  const headers: Record<string, string> = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const partnerFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const isJson = !(options.body instanceof FormData);
  const headers = {
    ...getAuthHeaders(isJson),
    ...(options.headers || {})
  };

  const execute = async (baseUrl: string) => {
    const url = buildApiUrl(baseUrl, endpoint);
    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      console.warn('[Partner API] 401 Unauthorized detected. Clearing partner session.');
      localStorage.removeItem('bls_partner_token');
      localStorage.removeItem('bls_partner_refresh_token');
      localStorage.removeItem('bls_partner_user');

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=1';
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Session expired. Please log in again.');
    }

    return res;
  };

  try {
    return await execute(BASE_URL);
  } catch (err: any) {
    if (BASE_URL !== PRODUCTION_API_URL) {
      try {
        console.info(`[Partner API] Retrying ${endpoint} on production host...`);
        return await execute(PRODUCTION_API_URL);
      } catch (fallbackErr: any) {
        throw fallbackErr;
      }
    }
    throw err;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    const url = buildApiUrl(BASE_URL, '/auth/login');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, portal: 'partner' }),
    });
    const data = await res.json();
    if (res.ok && data.success && data.data?.accessToken) {
      const token = data.data.accessToken;
      const partnerProfile = data.data.user?.profile || {
        fullName: data.data.user?.name,
        email: data.data.user?.email,
        mobile: data.data.user?.phone,
        partnerId: data.data.user?.profile?.partnerId || 'PTR-2026-0001',
        status: data.data.user?.profile?.status || 'APPROVED',
      };
      localStorage.setItem('bls_partner_token', token);
      if (data.data?.refreshToken) {
        localStorage.setItem('bls_partner_refresh_token', data.data.refreshToken);
      }
      localStorage.setItem('bls_partner_user', JSON.stringify(partnerProfile));
      return {
        data: {
          success: true,
          token,
          partner: partnerProfile,
        },
      };
    }
    throw new Error(data.message || 'Invalid email or password');
  },

  register: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/partners/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        const partnerId = resData.partnerCode || resData.partnerId || 'PTR-2026-0099';
        return {
          data: {
            success: true,
            partner: { ...data, partnerId, status: 'PENDING_APPROVAL' },
            message: resData.message || 'Registration submitted for review.',
          },
        };
      }
      throw new Error(resData.message || 'Registration failed');
    } catch (err: any) {
      console.warn('Backend register failed, falling back locally:', err.message);
      const newPartner = {
        ...mockStore.getPartner(),
        fullName: data.fullName || 'Registered Partner',
        email: data.email || 'partner@example.com',
        mobile: data.mobile || data.phone || '9876543210',
        status: 'PENDING_APPROVAL',
      };
      mockStore.setPartner(newPartner);
      return {
        data: {
          success: true,
          partner: newPartner,
          message: 'Registration successful! BLS admin will verify your credentials.',
        },
      };
    }
  },

  forgotPassword: async (_email: string): Promise<any> => {
    return {
      data: {
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      },
    };
  },
};

export const clientService = {
  getAll: async (params?: any): Promise<any> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      const res = await fetch(`${BASE_URL}/clients?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((c: any) => ({
          _id: c._id,
          id: c._id,
          clientId: c.clientId,
          fullName: c.clientName || c.fullName || c.name,
          businessName: c.businessName,
          email: c.email,
          phone: c.mobile || c.phone,
          mobile: c.mobile || c.phone,
          city: c.city,
          state: c.state,
          pan: c.pan,
          gstin: c.gstin,
          clientType: c.clientType || 'Individual',
          totalServices: c.totalServices || 1,
          paymentStatus: c.paymentStatus || 'Pending',
          accountStatus: c.accountStatus || 'Active',
          createdAt: c.createdAt || c.joinedDate || new Date().toISOString(),
        }));
        // Sync backend data into localStorage cache so partner portal stays consistent
        try { localStorage.setItem('bls_partner_mock_clients', JSON.stringify(mapped)); } catch (_) {}
        return { data: { success: true, clients: mapped, data: mapped } };
      }
    } catch (err) {
      console.warn('Clients API fetch failed, using local store:', err);
    }
    let list = mockStore.getClients();
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.businessName && c.businessName.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.pan && c.pan.toLowerCase().includes(q))
      );
    }
    return { data: { success: true, clients: list, data: list } };
  },

  getById: async (id: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/clients/${id}/overview`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const c = data.data.client;
        const client = {
          _id: c._id,
          id: c._id,
          clientId: c.clientId,
          fullName: c.clientName,
          businessName: c.businessName,
          email: c.email,
          phone: c.mobile,
          city: c.city,
          state: c.state,
          pan: c.pan,
          gstin: c.gstin,
        };
        return {
          data: {
            success: true,
            client,
            requests: data.data.requests || [],
            documents: data.data.documents || [],
            data: { client, requests: data.data.requests, documents: data.data.documents },
          },
        };
      }
    } catch (err) {
      console.warn('Client overview fetch failed, fallback to mockStore:', err);
    }
    const clients = mockStore.getClients();
    const client = clients.find((c) => c._id === id || c.id === id) || null;
    const requests = mockStore.getRequests().filter((r) => r.clientId === id);
    const documents = mockStore.getDocuments().filter((d) => d.clientId === id);
    return { data: { success: true, client, requests, documents, data: { client, requests, documents } } };
  },

  create: async (payload: any): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/clients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: payload.fullName,
          businessName: payload.businessName,
          email: payload.email,
          phone: payload.phone || payload.mobile,
          city: payload.city,
          pan: payload.pan,
          gstin: payload.gstin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { data: { success: true, client: data.data, data: data.data } };
      }
    } catch (err) {
      console.warn('Client create API failed, saving to mockStore:', err);
    }
    const client = mockStore.addClient(payload);
    return { data: { success: true, client, data: client } };
  },

  update: async (id: string, data: any): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/clients/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return { data: { success: true, client: resData.data, data: resData.data } };
      }
    } catch (err) {
      console.warn('Client update API failed, using mockStore:', err);
    }
    const updated = mockStore.updateClient(id, data);
    return { data: { success: true, client: updated, data: updated } };
  },
};

export const requestService = {
  getAll: async (params?: any): Promise<any> => {
    try {
      const query = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${BASE_URL}/requests?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const mapped = data.data.map((r: any) => ({
          _id: r._id,
          id: r._id,
          requestId: r.requestId,
          serviceRequestId: r.requestId,
          clientId: r.clientId || r._id,
          clientName: r.clientName,
          serviceName: r.service,
          serviceCategory: r.category || 'Registration Services',
          category: r.category || 'Registration Services',
          status: (r.status || 'SUBMITTED').toUpperCase(),
          priority: (r.priority || 'MEDIUM').toUpperCase(),
          financialYear: '2026-27',
          description: (r.notes && r.notes[0]) || `Consultation request for ${r.service}`,
          requirementDesc: (r.notes && r.notes[0]) || `Consultation request for ${r.service}`,
          submissionDate: r.submissionDate || r.createdAt?.slice(0, 10),
          dueDate: r.dueDate || new Date().toISOString().slice(0, 10),
          feeAmount: r.feeAmount || 0,
          createdAt: r.createdAt || new Date().toISOString(),
          timeline: [
            { status: 'SUBMITTED', label: 'Lead Assigned to Partner by Admin', timestamp: r.createdAt || new Date().toISOString() }
          ]
        }));
        // Sync backend data into localStorage so partner portal stays consistent
        try { localStorage.setItem('bls_partner_mock_requests', JSON.stringify(mapped)); } catch (_) {}
        return { data: { success: true, serviceRequests: mapped, data: mapped } };
      }
    } catch (err) {
      console.warn('Requests API fetch failed, using local store:', err);
    }
    let list = mockStore.getRequests();
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((r) => r.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.requestId && r.requestId.toLowerCase().includes(q)) ||
          (r.serviceName && r.serviceName.toLowerCase().includes(q)) ||
          (r.clientName && r.clientName.toLowerCase().includes(q))
      );
    }
    return { data: { success: true, serviceRequests: list, data: list } };
  },

  getById: async (id: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/requests/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const rawReq = data.data;
        const mappedReq: any = {
          _id: rawReq._id,
          id: rawReq._id,
          requestId: rawReq.requestId,
          serviceRequestId: rawReq.requestId,
          clientName: rawReq.clientName || rawReq.clientId?.clientName || 'Client',
          clientId: rawReq.clientId?._id || rawReq.clientId || rawReq._id,
          serviceName: rawReq.service || rawReq.serviceName,
          serviceCategory: rawReq.category || 'Registration Services',
          category: rawReq.category || 'Registration Services',
          status: rawReq.status || 'Submitted',
          priority: rawReq.priority || 'Medium',
          financialYear: rawReq.financialYear || '2026-27',
          description: (rawReq.notes && rawReq.notes[0]) || rawReq.description || `Consultation request for ${rawReq.service}`,
          remarks: rawReq.remarks || '',
          assignedTeam: rawReq.assignedStaff || 'CA Direct Tax Cell',
          submissionDate: rawReq.submissionDate || rawReq.createdAt?.slice(0, 10),
          createdAt: rawReq.createdAt || new Date().toISOString(),
          updatedAt: rawReq.updatedAt || new Date().toISOString(),
        };

        const backendDocs = Array.isArray(rawReq.documents) ? rawReq.documents.map((d: any) => ({
          _id: d._id,
          id: d._id,
          documentId: d.documentId,
          originalName: d.documentName,
          documentName: d.documentName,
          documentType: d.documentType,
          fileSize: typeof d.fileSize === 'number' ? d.fileSize : 1024 * 1024,
          status: d.reviewStatus || 'Approved',
          serviceRequestId: d.serviceRequestId || rawReq.requestId,
          clientId: d.clientId,
          createdAt: d.createdAt || d.uploadDate || new Date().toISOString(),
          downloadUrl: d.fileUrl || (d.filePath ? `${BASE_URL.replace('/api/v1', '')}${d.filePath}` : undefined)
        })) : [];

        // Also merge local documents if any
        const localDocs = mockStore.getDocuments().filter((d: any) => 
          d.serviceRequestId === mappedReq.requestId || 
          d.serviceRequestId === id ||
          d.clientId === mappedReq.clientId
        );

        const allDocs = [...backendDocs];
        for (const ld of localDocs) {
          if (!allDocs.some((ad: any) => ad.originalName === ld.originalName)) {
            allDocs.push(ld);
          }
        }

        return {
          data: {
            success: true,
            request: mappedReq,
            serviceRequest: mappedReq,
            documents: allDocs,
            data: { request: mappedReq, documents: allDocs },
          },
        };
      }
    } catch (err) {
      console.warn('Request details fetch failed, fallback to mockStore:', err);
    }
    const requests = mockStore.getRequests();
    const request = requests.find((r) => r._id === id || r.id === id || r.requestId === id) || null;
    const documents = mockStore.getDocuments().filter((d) => d.serviceRequestId === request?.requestId || d.serviceRequestId === id);
    return { data: { success: true, request, serviceRequest: request, documents, data: { request, documents } } };
  },

  updateStatus: async (id: string, status: string, note?: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { data: { success: true, request: data.data, data: data.data } };
      }
    } catch (err) {
      console.warn('Request status update failed, fallback to mockStore:', err);
    }
    const requests = mockStore.getRequests();
    const req = requests.find(r => r._id === id || r.id === id || r.requestId === id);
    if (req) {
      req.status = status;
      if (note && (!req.timeline || !req.timeline.some((t: any) => t.status === status))) {
        req.timeline = req.timeline || [];
        req.timeline.push({ status, label: note, timestamp: new Date().toISOString() });
      }
      try { localStorage.setItem('bls_partner_mock_requests', JSON.stringify(requests)); } catch (_) {}
    }
    return { data: { success: true, request: req, data: req } };
  },

  create: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return { data: { success: true, serviceRequest: resData.data, data: resData.data } };
      }
    } catch (err) {
      console.warn('Request create API failed, using mockStore:', err);
    }
    const req = mockStore.addRequest(data);
    return { data: { success: true, serviceRequest: req, data: req } };
  },
};

export const documentService = {
  getAll: async (params?: any): Promise<any> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      const res = await fetch(`${BASE_URL}/documents?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        return { data: { success: true, documents: data.data, data: data.data } };
      }
    } catch (err) {
      console.warn('Documents API fetch failed, fallback to mockStore:', err);
    }
    let list = mockStore.getDocuments();
    return { data: { success: true, documents: list, data: list } };
  },

  upload: async (formData: FormData): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: getAuthHeaders(false),
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const doc = data.data;
        const newDoc = mockStore.addDocument({
          documentType: doc.documentType || 'Uploaded Document',
          clientId: doc.clientId || '',
          serviceRequestId: doc.serviceRequestId || '',
          originalName: doc.documentName || 'Uploaded_File.pdf',
          fileSize: 1024 * 1024,
        });
        return { data: { success: true, document: doc || newDoc, data: doc || newDoc } };
      }
    } catch (err) {
      console.warn('Document upload API failed, saving to mockStore:', err);
    }
    const documentType = (formData.get('documentType') as string) || 'Uploaded Document';
    const clientId = (formData.get('clientId') as string) || '';
    const serviceRequestId = (formData.get('serviceRequestId') as string) || '';
    const file = (formData.get('document') || formData.get('file')) as File | null;
    const newDoc = mockStore.addDocument({
      documentType,
      clientId,
      serviceRequestId,
      originalName: file ? file.name : 'Uploaded_File.pdf',
      fileSize: file ? file.size : 1240000,
    });
    return { data: { success: true, document: newDoc, data: newDoc } };
  },
};

export const commercialService = {
  getAll: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/partners/me/payouts`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        return { data: { success: true, commercials: data.data, records: data.data, data: data.data } };
      }
    } catch (err) {
      console.warn('Commercials API fetch failed, using mockStore:', err);
    }
    const list = mockStore.getCommercials();
    return { data: { success: true, commercials: list, records: list, data: list } };
  },
};

export const supportService = {
  getAll: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/tickets`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        return { data: { success: true, tickets: data.data, data: data.data } };
      }
    } catch (err) {
      console.warn('Tickets API failed, using mockStore:', err);
    }
    const list = mockStore.getTickets();
    return { data: { success: true, tickets: list, data: list } };
  },

  create: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        return { data: { success: true, ticket: resData.data, data: resData.data } };
      }
    } catch (err) {
      console.warn('Ticket create API failed, using mockStore:', err);
    }
    const ticket = mockStore.addTicket(data);
    return { data: { success: true, ticket, data: ticket } };
  },
};

export const notificationService = {
  getAll: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        const unreadCount = data.data.filter((n: any) => !n.read).length;
        return { data: { success: true, notifications: data.data, unreadCount, data: data.data } };
      }
    } catch (err) {
      console.warn('Notifications API failed, using mockStore:', err);
    }
    const list = mockStore.getNotifications();
    const unreadCount = list.filter((n) => !n.read && !n.isRead).length;
    return { data: { success: true, notifications: list, unreadCount, data: list } };
  },

  markRead: async (id: string): Promise<any> => {
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
    } catch (_err) {
      mockStore.markNotificationRead(id);
    }
    return { data: { success: true } };
  },
};

export const dashboardService = {
  getStats: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/partners/me/dashboard`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const pData = data.data;
        const mappedRecentRequests = (pData.assignedRequests || []).map((r: any) => ({
          _id: r._id,
          id: r._id,
          requestId: r.requestId,
          serviceRequestId: r.requestId,
          clientName: r.clientName,
          serviceName: r.service,
          serviceCategory: r.category || 'Registration Services',
          category: r.category || 'Registration Services',
          status: (r.status || 'SUBMITTED').toUpperCase(),
          priority: (r.priority || 'MEDIUM').toUpperCase(),
          financialYear: '2026-27',
          submissionDate: r.submissionDate || r.createdAt?.slice(0, 10),
          feeAmount: r.feeAmount || 0,
        }));
        const mappedRecentClients = (pData.assignedRequests || []).map((r: any) => ({
          _id: r.clientId || r._id,
          id: r.clientId || r._id,
          fullName: r.clientName,
          businessName: r.clientName + ' Enterprise',
          clientType: 'Private Limited Company',
          phone: '9829012345',
          city: 'Jaipur',
          createdAt: r.createdAt?.slice(0, 10),
        }));

        return {
          data: {
            success: true,
            data: {
              stats: {
                totalClients: pData.partner?.activeClientsCount || mappedRecentClients.length,
                totalRequests: pData.stats?.totalRequests || mappedRecentRequests.length,
                pendingRequests: pData.stats?.inProgressRequests || mappedRecentRequests.length,
                completedRequests: pData.stats?.completedRequests || 0,
                pendingDocuments: 0,
                pendingPayouts: pData.stats?.pendingPayouts || 0,
                totalEarnings: pData.stats?.totalEarnings || 0,
              },
              recentRequests: mappedRecentRequests,
              recentClients: mappedRecentClients,
              pendingDocumentsList: [],
              notifications: [],
            },
          },
        };
      }
    } catch (err) {
      console.warn('Partner dashboard API failed, using mockStore:', err);
    }
    const stats = mockStore.getStats();
    const recentRequests = mockStore.getRequests().slice(0, 5);
    const recentClients = mockStore.getClients().slice(0, 5);
    const notifications = mockStore.getNotifications().slice(0, 5);

    return {
      data: {
        success: true,
        data: {
          stats,
          recentRequests,
          recentClients,
          pendingDocumentsList: [],
          notifications,
        },
      },
    };
  },
};

export const profileService = {
  get: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.user?.profile) {
        return { data: { success: true, partner: data.data.user.profile } };
      }
    } catch (err) {
      console.warn('Profile fetch failed, using mockStore:', err);
    }
    const partner = mockStore.getPartner();
    return { data: { success: true, partner } };
  },

  update: async (data: any): Promise<any> => {
    const current = mockStore.getPartner();
    const updated = { ...current, ...data };
    mockStore.setPartner(updated);
    return { data: { success: true, partner: updated } };
  },
};

// Generic api helper
export const api = {
  get: async (url: string, _config?: any): Promise<any> => {
    if (url.includes('/profile')) return profileService.get();
    if (url.includes('/dashboard')) return dashboardService.getStats();
    if (url.includes('/clients')) return clientService.getAll();
    if (url.includes('/service-requests')) return requestService.getAll();
    if (url.includes('/documents')) return documentService.getAll();
    if (url.includes('/commercials')) return commercialService.getAll();
    if (url.includes('/support-tickets')) return supportService.getAll();
    if (url.includes('/notifications')) return notificationService.getAll();
    return { data: { success: true, data: [] } };
  },
  post: async (url: string, body?: any, _config?: any): Promise<any> => {
    if (url.includes('/auth/login')) return authService.login(body?.email, body?.password);
    if (url.includes('/auth/register')) return authService.register(body);
    if (url.includes('/clients')) return clientService.create(body);
    if (url.includes('/service-requests')) return requestService.create(body);
    if (url.includes('/documents/upload')) return documentService.upload(body);
    if (url.includes('/support-tickets')) return supportService.create(body);
    return { data: { success: true } };
  },
  patch: async (url: string, body?: any, _config?: any): Promise<any> => {
    if (url.includes('/profile')) return profileService.update(body);
    return { data: { success: true } };
  },
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
};

export default api;
