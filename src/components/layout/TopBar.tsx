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
} from 'lucide-react';
import { Button } from '../common/Button';
import { formatRelativeTime } from '../../utils/formatters';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileSidebar }) => {
  const {
    activeView,
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

  const viewLabel: Record<string, string> = {
    dashboard: 'Overview',
    quotations: 'Quotations',
    'quotation-new': 'New quotation',
    'quotation-edit': 'Edit quotation',
    invoices: 'Invoices',
    'invoice-new': 'New invoice',
    'invoice-edit': 'Edit invoice',
    clients: 'Clients',
    'client-detail': 'Client',
    settings: 'Settings',
  };

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
    <header className="topbar sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-line bg-paper px-5 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1 text-ink-secondary hover:text-ink"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="truncate text-[15px] text-ink-secondary lg:hidden">{viewLabel[activeView] || 'Bizora'}</p>
      </div>

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or clients"
            className="field pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={quickRef}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQuickCreate(!showQuickCreate)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">New</span>
          </Button>

          {showQuickCreate && (
            <div className="absolute right-0 z-50 mt-2 w-52 border border-line bg-white py-1 shadow-modal">
              <button
                onClick={() => {
                  setActiveView('quotation-new');
                  setShowQuickCreate(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-paper"
              >
                <FileText className="h-4 w-4 text-ink-muted" />
                Quotation
              </button>
              <button
                onClick={() => {
                  setActiveView('invoice-new');
                  setShowQuickCreate(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-paper"
              >
                <Receipt className="h-4 w-4 text-ink-muted" />
                Invoice
              </button>
              <button
                onClick={() => {
                  setActiveView('clients');
                  setShowQuickCreate(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-paper"
              >
                <UserPlus className="h-4 w-4 text-ink-muted" />
                Client
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center text-ink-secondary hover:text-ink"
            title="Activity"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
            {activities.length > 0 && (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-copper" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 z-50 mt-2 w-[22rem] border border-line bg-white shadow-modal">
              <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
                <span className="text-[16px] font-medium text-ink">Activity</span>
                <span className="text-[13px] text-ink-muted">{activities.length} records</span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="px-5 py-8 text-[15px] text-ink-secondary">No recorded events.</div>
                ) : (
                  activities.slice(0, 6).map((act) => (
                    <div
                      key={act.id}
                      onClick={() => handleNotificationClick(act.referenceId)}
                      className={`border-b border-line px-5 py-4 last:border-b-0 ${
                        act.referenceId ? 'cursor-pointer hover:bg-paper' : ''
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-[15px] font-medium text-ink">{act.title}</p>
                        <span className="shrink-0 text-[13px] text-ink-muted">
                          {formatRelativeTime(act.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-[14px] leading-snug text-ink-secondary">{act.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 py-1 pl-1"
          >
            <span className="hidden max-w-[160px] truncate text-[15px] text-ink sm:inline">
              {businessProfile.name}
            </span>
            <div className="flex h-9 w-9 items-center justify-center bg-ink text-[14px] font-medium text-white">
              {businessProfile.name.charAt(0) || 'B'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-50 mt-2 w-64 border border-line bg-white py-1 shadow-modal">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-[15px] font-medium text-ink">{businessProfile.name}</p>
                <p className="truncate text-[13px] text-ink-secondary">{businessProfile.email}</p>
              </div>
              <button
                onClick={() => {
                  setActiveView('settings');
                  setShowProfileMenu(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-paper"
              >
                <Building className="h-4 w-4 text-ink-muted" />
                Business settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  showConfirmDialog({
                    title: 'Restore demo data?',
                    message:
                      'This will reset sample Namibian agency data (Kalahari Creative Studio) for testing and exploring Bizora.',
                    confirmLabel: 'Restore demo data',
                    onConfirm: resetToDemoData,
                  });
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-paper"
              >
                <RefreshCw className="h-4 w-4 text-ink-muted" />
                Restore demo data
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
