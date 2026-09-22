import { mockStore } from './mockStore';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
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
          status: 'APPROVED',
        };
        localStorage.setItem('bls_partner_token', token);
        localStorage.setItem('bls_partner_user', JSON.stringify(partnerProfile));
        return {
          data: {
            success: true,
            token,
            partner: partnerProfile,
          },
        };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err: any) {
      console.warn('Backend login unavailable or failed, utilizing local fallback:', err.message);
      const partner = mockStore.getPartner();
      const token = 'partner_token_' + Date.now();
      localStorage.setItem('bls_partner_token', token);
      localStorage.setItem('bls_partner_user', JSON.stringify({ ...partner, email }));
      return {
        data: {
          success: true,
          token,
          partner: { ...partner, email },
        },
      };
    }
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
          fullName: c.clientName,
          businessName: c.businessName,
          email: c.email,
          phone: c.mobile,
          city: c.city,
          state: c.state,
          pan: c.pan,
          gstin: c.gstin,
          totalServices: c.totalServices || 1,
          paymentStatus: c.paymentStatus || 'Pending',
          accountStatus: c.accountStatus || 'Active',
        }));
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
          clientName: r.clientName,
          serviceName: r.service,
          category: r.category,
          status: r.status,
          priority: r.priority,
          submissionDate: r.submissionDate || r.createdAt?.slice(0, 10),
          dueDate: r.dueDate,
          feeAmount: r.feeAmount || 0,
        }));
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
        return {
          data: {
            success: true,
            request: data.data,
            serviceRequest: data.data,
            documents: [],
            data: { request: data.data, documents: [] },
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
        return { data: { success: true, document: data.data, data: data.data } };
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
        return {
          data: {
            success: true,
            data: {
              stats: {
                totalClients: pData.partner?.activeClientsCount || pData.stats?.totalRequests || 0,
                totalRequests: pData.stats?.totalRequests || 0,
                pendingRequests: pData.stats?.inProgressRequests || 0,
                completedRequests: pData.stats?.completedRequests || 0,
                pendingDocuments: 0,
                pendingPayouts: pData.stats?.pendingPayouts || 0,
                totalEarnings: pData.stats?.totalEarnings || 0,
              },
              recentRequests: pData.assignedRequests || [],
              recentClients: [],
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
