import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { Partner } from '../types';

interface AuthContextType {
  partner: Partner | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; status?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [partner, setPartner] = useState<Partner | null>(() => {
    const saved = localStorage.getItem('bls_partner_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    const defaultPartner: Partner = {
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
    localStorage.setItem('bls_partner_user', JSON.stringify(defaultPartner));
    return defaultPartner;
  });

  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('bls_partner_token');
    if (saved) return saved;
    const defaultToken = 'mock_jwt_token_bls_partner_active';
    localStorage.setItem('bls_partner_token', defaultToken);
    return defaultToken;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    refreshProfile();
  }, []);

  const refreshProfile = async () => {
    try {
      const res: any = await api.get('/profile');
      if (res.data?.success && res.data?.partner) {
        setPartner(res.data.partner);
        localStorage.setItem('bls_partner_user', JSON.stringify(res.data.partner));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res: any = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { token: receivedToken, partner: receivedPartner } = res.data;
        setToken(receivedToken);
        setPartner(receivedPartner);
        localStorage.setItem('bls_partner_token', receivedToken);
        localStorage.setItem('bls_partner_user', JSON.stringify(receivedPartner));
        return { success: true, status: receivedPartner.status };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify your credentials.'
      };
    }
  };

  const register = async (data: any) => {
    try {
      const res: any = await api.post('/auth/register', data);
      if (res.data?.success) {
        const { token: receivedToken, partner: receivedPartner } = res.data;
        setToken(receivedToken);
        setPartner(receivedPartner);
        localStorage.setItem('bls_partner_token', receivedToken);
        localStorage.setItem('bls_partner_user', JSON.stringify(receivedPartner));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    setPartner(null);
    setToken(null);
    localStorage.removeItem('bls_partner_token');
    localStorage.removeItem('bls_partner_user');
  };

  return (
    <AuthContext.Provider
      value={{
        partner,
        token,
        isAuthenticated: !!token && !!partner,
        isLoading,
        loading: isLoading,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
