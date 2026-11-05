import React from 'react';
import { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs: Record<AppointmentStatus, { label: string; textClass: string; bgClass: string }> = {
    agendado: {
      label: 'Aguardando',
      textClass: 'text-amber-400',
      bgClass: 'bg-amber-400/10 border-amber-400/20',
    },
    confirmado: {
      label: 'Confirmado',
      textClass: 'text-sky-400',
      bgClass: 'bg-sky-400/10 border-sky-400/20',
    },
    concluido: {
      label: 'Concluído',
      textClass: 'text-emerald-400',
      bgClass: 'bg-emerald-400/10 border-emerald-400/20',
    },
    cancelado: {
      label: 'Cancelado',
      textClass: 'text-neutral-400',
      bgClass: 'bg-neutral-800/60 border-neutral-700/30',
    },
  };

  const config = configs[status] || configs.agendado;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md border ${config.bgClass} ${config.textClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{config.label}</span>
    </span>
  );
};
