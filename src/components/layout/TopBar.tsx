import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Menu,
  Plus,
  FileText,
  Receipt,
  UserPlus,
  RefreshCw,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/formatters';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileSidebar }) => {
  const {
    activeView,
    activeEntityId,
    setActiveView,
    searchQuery,
    setSearchQuery,
    businessProfile,
    activities,
    quotations,
    invoices,
    openDocumentPreview,
    resetToDemoData,
    showConfirmDialog,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute view titles
  const getHeaderInfo = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of business performance and documents' };
      case 'quotations':
        return { title: 'Quotations', subtitle: 'Manage price quotes and proposals' };
      case 'quotation-new':
        return { title: 'New Quotation', subtitle: 'Create a professional quotation for a client' };
      case 'quotation-edit':
        return { title: 'Edit Quotation', subtitle: `Modifying quote ${activeEntityId || ''}` };
      case 'invoices':
        return { title: 'Invoices', subtitle: 'Manage billing, overdue accounts and payments' };
      case 'invoice-new':
        return { title: 'New Invoice', subtitle: 'Issue a new invoice to a client' };
      case 'invoice-edit':
        return { title: 'Edit Invoice', subtitle: `Modifying invoice ${activeEntityId || ''}` };
      case 'clients':
        return { title: 'Clients', subtitle: 'Client directory and billing histories' };
      case 'client-detail':
        return { title: 'Client Profile', subtitle: 'Client details, quotations and invoices' };
      case 'settings':
        return { title: 'Business Settings', subtitle: 'Profile, default terms, VAT and banking' };
      default:
        return { title: 'Bizora', subtitle: 'Business Management' };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleNotificationClick = (referenceId?: string) => {
    if (!referenceId) return;
    setShowNotifications(false);

    if (referenceId.startsWith('quo_') || referenceId.startsWith('QUO-')) {
      const q = quotations.find((item) => item.id === referenceId || item.quotationNumber === referenceId);
      if (q) openDocumentPreview('quote', q);
    } else if (referenceId.startsWith('inv_') || referenceId.startsWith('INV-')) {
      const inv = invoices.find((item) => item.id === referenceId || item.invoiceNumber === referenceId);
      if (inv) openDocumentPreview('invoice', inv);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{headerInfo.title}</h1>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{headerInfo.subtitle}</p>
        </div>
      </div>

      {/* Center: Universal Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes, invoices, clients..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions, notifications, profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick Create Dropdown */}
        <div className="relative" ref={quickRef}>
          <Button
            variant="indigo"
            size="sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            <span className="hidden sm:inline">Create</span>
          </Button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1.5 shadow-elevated z-50">
              <button
                onClick={() => {
                  setActiveView('quotation-new');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>New Quotation</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('invoice-new');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Receipt className="w-4 h-4 text-teal-600" />
                <span>New Invoice</span>
              </button>
              <button
                onClick={() => {
                  setActiveView('clients');
                  setShowQuickCreate(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserPlus className="w-4 h-4 text-slate-600" />
                <span>Add Client</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications / Activity Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Activity Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-elevated z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Recent Activity
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {activities.length} recorded
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No recent activities.</div>
                ) : (
                  activities.slice(0, 8).map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleNotificationClick(act.referenceId)}
                      className={`p-3.5 text-left transition-colors flex items-start gap-3 ${
                        act.referenceId ? 'hover:bg-slate-50 cursor-pointer' : ''
                      }`}
                    >
                      <div className="mt-0.5 rounded-lg p-1.5 bg-indigo-50 text-indigo-600 shrink-0">
                        {act.type === 'payment_recorded' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : act.type.startsWith('quote') ? (
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        ) : (
                          <Receipt className="w-3.5 h-3.5 text-teal-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate">{act.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatRelativeTime(act.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{act.description}</p>
                      </div>
                      {act.referenceId && <ExternalLink className="w-3 h-3 text-slate-300 shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate hidden sm:inline">
              {businessProfile.name}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900 text-teal-400 font-bold text-xs">
              {businessProfile.name.charAt(0) || 'B'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-elevated z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{businessProfile.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{businessProfile.email || 'Business Account'}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>Business Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    showConfirmDialog({
                      title: 'Restore Sample Demo Data?',
                      message: 'This will load sample clients, quotations and invoices for Kalahari Creative Studio. Ideal for testing and exploring Bizora.',
                      confirmLabel: 'Restore Demo Data',
                      onConfirm: resetToDemoData,
                    });
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span>Restore Demo Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
