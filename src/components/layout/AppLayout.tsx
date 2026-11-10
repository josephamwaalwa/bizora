import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DocumentPreviewModal } from '../documents/DocumentPreviewModal';
import { RecordPaymentModal } from '../documents/RecordPaymentModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ToastContainer } from '../common/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <TopBar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <DocumentPreviewModal />
      <RecordPaymentModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
};
