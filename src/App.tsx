import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { QuotationFormPage } from './pages/QuotationFormPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { InvoiceFormPage } from './pages/InvoiceFormPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeView } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'quotations':
        return <QuotationsPage />;
      case 'quotation-new':
      case 'quotation-edit':
        return <QuotationFormPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'invoice-new':
      case 'invoice-edit':
        return <InvoiceFormPage />;
      case 'clients':
        return <ClientsPage />;
      case 'client-detail':
        return <ClientDetailPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <AppLayout>{renderActiveView()}</AppLayout>;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
