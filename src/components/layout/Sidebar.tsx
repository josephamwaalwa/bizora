import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ActiveView } from '../../types';
import { getLogoOptions } from '../../utils/logo';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { activeView, setActiveView, quotations, invoices, clients, businessProfile } = useApp();
  const logoOptions = getLogoOptions(businessProfile);

  const pendingQuotesCount = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status !== 'paid').length;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />,
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: <FileText className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />,
      badge: pendingQuotesCount,
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <Receipt className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />,
      badge: unpaidInvoicesCount,
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />,
      badge: clients.length,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />,
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    onCloseMobile();
  };

  const isCurrentActive = (id: ActiveView) => {
    if (activeView === id) return true;
    if (id === 'quotations' && (activeView === 'quotation-new' || activeView === 'quotation-edit')) return true;
    if (id === 'invoices' && (activeView === 'invoice-new' || activeView === 'invoice-edit')) return true;
    if (id === 'clients' && activeView === 'client-detail') return true;
    return false;
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-900/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-navy-900 text-slate-200 transition-all duration-150 ease-in-out lg:static select-none ${
          isCollapsed ? 'w-[76px]' : 'w-[248px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`flex h-16 items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavClick('dashboard')}
          >
            <img src="/favicon.svg" alt="Bizora" className="h-8 w-8 shrink-0" />
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="block text-[16px] font-semibold tracking-[-0.02em] text-white leading-none">
                  Bizora
                </span>
                <span className="mt-1 block text-[12px] text-slate-400 leading-none">
                  Financial desk
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-5 pb-4 pt-2">
            <p className="mb-2 text-[12px] text-slate-400">Create</p>
            <div className="flex flex-col">
              <button
                onClick={() => handleNavClick('quotation-new')}
                className="py-1.5 text-left text-[15px] text-slate-200 hover:text-white"
              >
                New quotation
              </button>
              <button
                onClick={() => handleNavClick('invoice-new')}
                className="py-1.5 text-left text-[15px] text-slate-200 hover:text-white"
              >
                New invoice
              </button>
            </div>
          </div>
        )}

        <div className={`flex-1 overflow-y-auto pb-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {!isCollapsed && (
            <div className="px-2 pb-2 pt-4 text-[12px] text-slate-400">Workspace</div>
          )}
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isCurrentActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex w-full items-center gap-3 px-2 py-2.5 text-left text-[15px] transition-colors ${
                    active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={active ? 'text-indigo-400' : 'text-slate-400'}>{item.icon}</span>
                  {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`num text-[13px] ${active ? 'text-white' : 'text-slate-400'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`border-t border-white/10 ${isCollapsed ? 'p-3' : 'p-4'}`}>
          <div
            onClick={() => handleNavClick('settings')}
            className={`flex cursor-pointer items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div
              className="flex shrink-0 items-center justify-center overflow-hidden text-[14px] font-medium text-white"
              style={{
                width: `${Math.min(48, logoOptions.size)}px`,
                height: `${Math.min(48, logoOptions.size)}px`,
                backgroundColor: businessProfile.logoUrl ? logoOptions.backgroundColor : undefined,
              }}
            >
              {businessProfile.logoUrl ? (
                <img
                  src={businessProfile.logoUrl}
                  alt={`${businessProfile.name} logo`}
                  className="h-full w-full"
                  style={{
                    objectFit: logoOptions.fit,
                    objectPosition: `${logoOptions.alignment} center`,
                    padding: `${logoOptions.padding}px`,
                  }}
                />
              ) : (
                businessProfile.name.charAt(0) || 'B'
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-white">{businessProfile.name}</p>
                <p className="truncate text-[13px] text-slate-400">
                  {businessProfile.defaultCurrency} · {businessProfile.currencySymbol}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
