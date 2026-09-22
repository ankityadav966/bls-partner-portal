import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { PartnerSidebar } from './PartnerSidebar';
import { PartnerHeader } from './PartnerHeader';
import { NewRequestModal } from '../forms/NewRequestModal';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex font-sans antialiased">
      {/* Fixed Sidebar */}
      <PartnerSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Navbar */}
        <PartnerHeader
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewRequest={() => setIsNewRequestModalOpen(true)}
        />

        {/* Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openNewRequestModal: () => setIsNewRequestModalOpen(true) }} />
        </main>
      </div>

      {/* Global New Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSuccess={() => {
          setIsNewRequestModalOpen(false);
        }}
      />
    </div>
  );
};

export default DashboardLayout;
