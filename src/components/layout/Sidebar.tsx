import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Sparkles,
  TrendingUp,
  Settings,
  ExternalLink,
  X,
  ShieldCheck,
} from 'lucide-react';

export type NavItem =
  | 'overview'
  | 'appointments'
  | 'customers'
  | 'professionals'
  | 'services'
  | 'finance'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  onOpenPublicBooking: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  barbershopName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPublicBooking,
  isMobileOpen,
  onCloseMobile,
  barbershopName,
}) => {
  const navItems: { id: NavItem; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'appointments', label: 'Agendamentos', icon: Calendar },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'professionals', label: 'Profissionais', icon: Scissors },
    { id: 'services', label: 'Serviços', icon: Sparkles },
    { id: 'finance', label: 'Financeiro', icon: TrendingUp },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#121212] border-r border-[#222222] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C49A5A] to-[#8C6B32] flex items-center justify-center text-[#090909] font-bold shadow-md shadow-[#C49A5A]/10">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Barber<span className="text-[#C49A5A]">Flow</span>
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium truncate max-w-[140px]">
                {barbershopName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-neutral-400 hover:text-white p-1 rounded-md"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo banner indicator */}
        <div className="mx-4 mt-3 px-3 py-1.5 rounded-lg bg-[#1B1B1B] border border-[#292929] flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C49A5A] shrink-0" />
          <span className="text-[10px] font-semibold tracking-wider text-neutral-300 uppercase">
            Demonstração | Dados Fictícios
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1B1B1B] text-[#C49A5A] border border-[#C49A5A]/30 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#181818]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C49A5A]' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action to switch to Client-facing Public Booking */}
        <div className="p-4 border-t border-[#222222] space-y-3">
          <button
            type="button"
            onClick={() => {
              onOpenPublicBooking();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1B1B1B] to-[#222222] border border-[#C49A5A]/40 text-xs font-semibold text-neutral-200 hover:text-white hover:border-[#C49A5A] transition-all group shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C49A5A]" />
              Página de Agendamento
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C49A5A] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* User profile footer */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-[#242424] border border-[#333333] flex items-center justify-center text-xs font-bold text-[#C49A5A]">
              BF
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Gestor da Unidade</p>
              <p className="text-[10px] text-neutral-500 truncate">demo@barberflow.io</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
