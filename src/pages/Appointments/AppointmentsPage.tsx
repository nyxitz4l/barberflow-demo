import React, { useState, useMemo } from 'react';
import { Appointment, Customer, Professional, Service } from '../../types';
import {
  Search,
  Filter,
  Calendar,
  List,
  Plus,
  Clock,
  User,
  Scissors,
  Check,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/Toast';

interface AppointmentsPageProps {
  appointments: Appointment[];
  customers: Customer[];
  professionals: Professional[];
  services: Service[];
  onOpenNewAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDeleteAppointment: (id: string) => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  appointments,
  professionals,
  onOpenNewAppointment,
  onEditAppointment,
  onUpdateStatus,
  onDeleteAppointment,
}) => {
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Delete confirm state
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Search by customer or booking code
      if (
        searchTerm &&
        !apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !apt.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !apt.customerPhone.includes(searchTerm)
      ) {
        return false;
      }

      // Filter by professional
      if (filterProfessional !== 'all' && apt.professionalId !== filterProfessional) {
        return false;
      }

      // Filter by status
      if (filterStatus !== 'all' && apt.status !== filterStatus) {
        return false;
      }

      // Filter by date
      if (filterDate && apt.date !== filterDate) {
        return false;
      }

      return true;
    });
  }, [appointments, searchTerm, filterProfessional, filterStatus, filterDate]);

  // Group appointments by date for calendar/day view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((apt) => {
      if (!groups[apt.date]) groups[apt.date] = [];
      groups[apt.date].push(apt);
    });
    // Sort keys descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((d) => ({
      date: d,
      items: groups[d].sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }, [filteredAppointments]);

  const handleDelete = () => {
    if (!appointmentToDelete) return;
    onDeleteAppointment(appointmentToDelete.id);
    showToast('Agendamento excluído com sucesso.', 'info');
    setAppointmentToDelete(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter and Controls Toolbar */}
      <div className="bg-[#121212] border border-[#222222] p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou código (ex: BF-9412)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-[#292929] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C49A5A]"
          />
        </div>

        {/* Right: Filters & View mode toggle & CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Professional filter */}
          <div className="relative">
            <select
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#C49A5A]"
            >
              <option value="all">Todos os Barbeiros</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-[#C49A5A]"
            >
              <option value="all">Todos os Status</option>
              <option value="agendado">Aguardando</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Date filter */}
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-[#181818] border border-[#292929] rounded-xl px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-[#C49A5A]"
          />

          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              className="text-[11px] text-[#C49A5A] hover:underline px-1"
            >
              Limpar data
            </button>
          )}

          {/* View toggle (List vs Calendar) */}
          <div className="flex items-center p-1 bg-[#181818] border border-[#292929] rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-[#292929] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-[#292929] text-white shadow-xs' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Visualização por Dias/Calendário"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          {/* New Appointment CTA */}
          <button
            type="button"
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-colors shadow-sm shadow-[#C49A5A]/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo</span>
          </button>
        </div>
      </div>

      {/* View Mode: List */}
      {viewMode === 'list' && (
        <div className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-neutral-400 font-semibold border-b border-[#222222]">
                <tr>
                  <th className="py-3 px-5">Código</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Serviço</th>
                  <th className="py-3 px-4">Profissional</th>
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-500">
                      Nenhum agendamento encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#161616]/60 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-neutral-400">
                        {apt.bookingCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{apt.customerName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{apt.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-neutral-200">
                        {apt.serviceName}
                        <span className="block text-[11px] text-neutral-500">{apt.serviceDuration} min</span>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-300">
                        {apt.professionalName}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white tabular-nums">{apt.time}</div>
                        <div className="text-[11px] text-neutral-400">{apt.date}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#C49A5A] tabular-nums">
                        R$ {apt.servicePrice},00
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick status cycle */}
                          {apt.status === 'agendado' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateStatus(apt.id, 'confirmado');
                                showToast(`Agendamento ${apt.bookingCode} confirmado!`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-sky-300 hover:text-sky-200 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 rounded-lg transition-colors"
                              title="Confirmar"
                            >
                              Confirmar
                            </button>
                          )}
                          {apt.status === 'confirmado' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateStatus(apt.id, 'concluido');
                                showToast(`Agendamento ${apt.bookingCode} finalizado com sucesso!`, 'success');
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 rounded-lg transition-colors"
                              title="Concluir Atendimento"
                            >
                              Concluir
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEditAppointment(apt)}
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Editar agendamento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel / Delete button */}
                          {apt.status !== 'cancelado' && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateStatus(apt.id, 'cancelado');
                                showToast(`Agendamento ${apt.bookingCode} cancelado.`, 'info');
                              }}
                              className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition-colors"
                              title="Cancelar agendamento"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setAppointmentToDelete(apt)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode: Calendar / Days Groups */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          {groupedByDate.length === 0 ? (
            <div className="bg-[#121212] border border-[#222222] p-12 text-center text-neutral-500 rounded-2xl">
              Nenhum agendamento encontrado para esta visualização.
            </div>
          ) : (
            groupedByDate.map((group) => {
              const dObj = new Date(`${group.date}T12:00:00`);
              const dateHeading = dObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div key={group.date} className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-[#161616] border-b border-[#222222] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C49A5A]" />
                      <h3 className="text-xs font-bold text-white capitalize">{dateHeading}</h3>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      {group.items.length} agendamento{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {group.items.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-[#181818] border border-[#292929] hover:border-[#383838] p-4 rounded-xl transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">
                              {apt.bookingCode}
                            </span>
                            <h4 className="text-sm font-semibold text-white">{apt.customerName}</h4>
                            <p className="text-xs text-neutral-400">{apt.customerPhone}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#C49A5A] tabular-nums block">
                              {apt.time}
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              {apt.serviceDuration} min
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#242424] text-xs space-y-1">
                          <div className="flex items-center justify-between text-neutral-300">
                            <span className="flex items-center gap-1.5 text-neutral-400">
                              <Scissors className="w-3.5 h-3.5 text-[#C49A5A]" />
                              Serviço:
                            </span>
                            <span className="font-medium">{apt.serviceName}</span>
                          </div>

                          <div className="flex items-center justify-between text-neutral-300">
                            <span className="flex items-center gap-1.5 text-neutral-400">
                              <User className="w-3.5 h-3.5 text-[#C49A5A]" />
                              Barbeiro:
                            </span>
                            <span className="font-medium">{apt.professionalName}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#242424]">
                          <StatusBadge status={apt.status} />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditAppointment(apt)}
                              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#252525]"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {apt.status !== 'concluido' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateStatus(apt.id, 'concluido');
                                  showToast('Agendamento concluído!', 'success');
                                }}
                                className="px-2 py-0.5 text-[10px] font-medium text-emerald-300 bg-emerald-950/40 rounded border border-emerald-800/40"
                              >
                                Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(appointmentToDelete)}
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Agendamento"
        description={`Tem certeza que deseja excluir o agendamento ${appointmentToDelete?.bookingCode} de ${appointmentToDelete?.customerName}? Esta ação é irreversível.`}
        confirmText="Sim, Excluir"
        isDestructive={true}
      />
    </div>
  );
};
