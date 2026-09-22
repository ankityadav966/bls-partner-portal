import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import PendingApprovalPage from '../pages/auth/PendingApprovalPage';
import AccountSuspendedPage from '../pages/auth/AccountSuspendedPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Dashboard & App Pages
import PartnerDashboardPage from '../pages/dashboard/PartnerDashboardPage';
import ClientsListPage from '../pages/clients/ClientsListPage';
import ClientDetailPage from '../pages/clients/ClientDetailPage';
import RequestsListPage from '../pages/requests/RequestsListPage';
import RequestDetailPage from '../pages/requests/RequestDetailPage';
import DocumentCenterPage from '../pages/documents/DocumentCenterPage';
import WorkTrackingPage from '../pages/tracking/WorkTrackingPage';
import PayoutRecordsPage from '../pages/commercials/PayoutRecordsPage';
import SupportTicketsPage from '../pages/support/SupportTicketsPage';
import PartnerProfilePage from '../pages/profile/PartnerProfilePage';
import NotFoundPage from '../pages/notfound/NotFoundPage';

// Protected Route Guard with Approval Status enforcement
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, partner, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          <span className="font-semibold text-slate-700">Validating Partner Security Session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !partner) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle partner status
  if (partner.status === 'PENDING_APPROVAL') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (partner.status === 'SUSPENDED') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />
      <Route path="/account-suspended" element={<AccountSuspendedPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Partner Portal Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<PartnerDashboardPage />} />
        <Route path="clients" element={<ClientsListPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="service-requests" element={<RequestsListPage />} />
        <Route path="service-requests/:id" element={<RequestDetailPage />} />
        <Route path="requests" element={<RequestsListPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="documents" element={<DocumentCenterPage />} />
        <Route path="work-tracking" element={<WorkTrackingPage />} />
        <Route path="tracking" element={<WorkTrackingPage />} />
        <Route path="commercials" element={<PayoutRecordsPage />} />
        <Route path="support" element={<SupportTicketsPage />} />
        <Route path="profile" element={<PartnerProfilePage />} />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
