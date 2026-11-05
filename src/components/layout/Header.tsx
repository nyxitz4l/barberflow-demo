import React from 'react';
import { Menu, Plus, ExternalLink, Calendar } from 'lucide-react';
import { NavItem } from './Sidebar';

interface HeaderProps {
  currentTab: NavItem;
  onOpenMobileSidebar: () => void;
  onOpenNewAppointment: () => void;
  onOpenPublicBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenNewAppointment,
  onOpenPublicBooking,
}) => {
  const titles: Record<NavItem, { title: string; subtitle: string }> = {
    overview: {
      title: 'Visão Geral',
      subtitle: 'Painel gerencial de desempenho e operações diárias',
    },
    appointments: {
      title: 'Agendamentos',
      subtitle: 'Controle de horários, profissionais e status dos atendimentos',
    },
    customers: {
      title: 'Clientes',
      subtitle: 'Base de clientes cadastrados, histórico e fidelidade',
    },
    professionals: {
      title: 'Profissionais',
      subtitle: 'Equipe de barbeiros, especialidades e jornadas de trabalho',
    },
    services: {
      title: 'Serviços',
      subtitle: 'Catálogo de procedimentos, preços e tempos de execução',
    },
    finance: {
      title: 'Financeiro',
      subtitle: 'Faturamento simulado, ticket médio e rentabilidade dos serviços',
    },
    settings: {
      title: 'Configurações',
      subtitle: 'Parâmetros da barbearia e restauração dos dados da demonstração',
    },
  };

  const currentInfo = titles[currentTab] || titles.overview;

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-[#090909]/90 backdrop-blur-md border-b border-[#222222] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + breadcrumb title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden text-neutral-400 hover:text-white p-2 rounded-lg bg-[#141414] border border-[#262626]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              {currentInfo.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 capitalize px-2 py-0.5 rounded bg-[#161616] border border-[#262626]">
              <Calendar className="w-3 h-3 text-[#C49A5A]" />
              {todayFormatted}
            </span>
          </div>
          <p className="hidden md:block text-xs text-neutral-400 mt-0.5">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenPublicBooking}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#141414] hover:bg-[#1C1C1C] border border-[#292929] rounded-xl transition-colors"
        >
          <span>Página Pública</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C49A5A]" />
        </button>

        <button
          type="button"
          onClick={onOpenNewAppointment}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-all shadow-sm shadow-[#C49A5A]/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Agendamento</span>
        </button>
      </div>
    </header>
  );
};
