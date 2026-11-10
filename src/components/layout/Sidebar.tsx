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
  PlusCircle,
  Building2,
} from 'lucide-react';
import type { ActiveView } from '../../types';

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

  // Pending counts
  const pendingQuotesCount = quotations.filter((q) => q.status === 'sent' || q.status === 'draft').length;
  const unpaidInvoicesCount = invoices.filter((i) => i.status !== 'paid').length;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'quotations',
      label: 'Quotations',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      badge: pendingQuotesCount,
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: <Receipt className="w-5 h-5 shrink-0" />,
      badge: unpaidInvoicesCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="w-5 h-5 shrink-0" />,
      badge: clients.length,
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'settings',
      label: 'Business Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
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
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-navy-900 text-slate-300 transition-all duration-200 ease-in-out border-r border-navy-800 lg:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4.5 border-b border-navy-800">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => handleNavClick('dashboard')}
          >
            {/* Bizora Geometric Brandmark */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 text-white font-bold shadow-md shadow-indigo-500/20">
              <span className="text-lg tracking-tight font-extrabold">B</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold tracking-tight text-white leading-tight">Bizora</span>
                <span className="text-[10px] text-teal-400 font-medium tracking-wide">Business Made Simpler</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Actions (when expanded) */}
        {!isCollapsed && (
          <div className="px-3.5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNavClick('quotation-new')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Quote</span>
              </button>
              <button
                onClick={() => handleNavClick('invoice-new')}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold text-teal-300 bg-navy-800 hover:bg-navy-700 border border-teal-500/30 rounded-lg transition-all"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>New Invoice</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {!isCollapsed ? 'Menu' : '•••'}
          </div>
          {navItems.map((item) => {
            const active = isCurrentActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      active ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Business Profile Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          <div
            onClick={() => handleNavClick('settings')}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-navy-800/80 cursor-pointer transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-800 border border-navy-700 text-teal-400 font-semibold text-xs overflow-hidden">
              {businessProfile.logoUrl ? (
                <img src={businessProfile.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-teal-400" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{businessProfile.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span className="truncate">{businessProfile.defaultCurrency} (N$)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
