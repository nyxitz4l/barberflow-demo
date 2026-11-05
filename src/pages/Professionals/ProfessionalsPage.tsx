import React, { useState } from 'react';
import { Professional, Service, Appointment } from '../../types';
import {
  Scissors,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  CalendarDays,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

interface ProfessionalsPageProps {
  professionals: Professional[];
  services: Service[];
  appointments: Appointment[];
  onCreateProfessional: (data: Omit<Professional, 'id'>) => void;
  onUpdateProfessional: (id: string, updates: Partial<Professional>) => void;
  onToggleStatus: (id: string) => void;
}

export const ProfessionalsPage: React.FC<ProfessionalsPageProps> = ({
  professionals,
  services,
  appointments,
  onCreateProfessional,
  onUpdateProfessional,
  onToggleStatus,
}) => {
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [selectedProForSchedule, setSelectedProForSchedule] = useState<Professional | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('19:00');
  const [lunchStart, setLunchStart] = useState('12:30');
  const [lunchEnd, setLunchEnd] = useState('13:30');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedWorkingDays, setSelectedWorkingDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const weekDays = [
    { day: 0, label: 'Dom' },
    { day: 1, label: 'Seg' },
    { day: 2, label: 'Ter' },
    { day: 3, label: 'Qua' },
    { day: 4, label: 'Qui' },
    { day: 5, label: 'Sex' },
    { day: 6, label: 'Sáb' },
  ];

  const handleOpenCreate = () => {
    setEditingProfessional(null);
    setName('');
    setSpecialty('Especialista em Cortes Masculinos');
    setBio('Barbeiro experiente dedicado ao visual masculino com perfeição técnica.');
    setAvatar('/src/assets/images/barber_master_alexandre_1793885694614.jpg');
    setStartHour('09:00');
    setEndHour('19:00');
    setLunchStart('12:30');
    setLunchEnd('13:30');
    setSelectedServiceIds(services.map((s) => s.id));
    setSelectedWorkingDays([1, 2, 3, 4, 5, 6]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pro: Professional) => {
    setEditingProfessional(pro);
    setName(pro.name);
    setSpecialty(pro.specialty);
    setBio(pro.bio);
    setAvatar(pro.avatar);
    setStartHour(pro.workingHours.start);
    setEndHour(pro.workingHours.end);
    setLunchStart(pro.workingHours.lunchStart || '12:30');
    setLunchEnd(pro.workingHours.lunchEnd || '13:30');
    setSelectedServiceIds(pro.servicesOfferedIds);
    setSelectedWorkingDays(pro.workingDays);
    setIsFormOpen(true);
  };

  const handleToggleDay = (day: number) => {
    if (selectedWorkingDays.includes(day)) {
      setSelectedWorkingDays(selectedWorkingDays.filter((d) => d !== day));
    } else {
      setSelectedWorkingDays([...selectedWorkingDays, day].sort());
    }
  };

  const handleToggleService = (srvId: string) => {
    if (selectedServiceIds.includes(srvId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srvId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, srvId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('O nome do profissional é obrigatório.', 'error');
      return;
    }
    if (selectedWorkingDays.length === 0) {
      showToast('Selecione ao menos um dia de atendimento.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      specialty: specialty.trim(),
      bio: bio.trim(),
      avatar: avatar || '/src/assets/images/barber_master_alexandre_1793885694614.jpg',
      servicesOfferedIds: selectedServiceIds,
      workingHours: {
        start: startHour,
        end: endHour,
        lunchStart,
        lunchEnd,
      },
      workingDays: selectedWorkingDays,
      isActive: editingProfessional ? editingProfessional.isActive : true,
    };

    if (editingProfessional) {
      onUpdateProfessional(editingProfessional.id, payload);
      showToast('Dados do profissional atualizados.', 'success');
    } else {
      onCreateProfessional(payload);
      showToast('Novo profissional cadastrado com sucesso!', 'success');
    }

    setIsFormOpen(false);
  };

  // Schedule for selected professional
  const proAppointments = appointments.filter(
    (a) => selectedProForSchedule && a.professionalId === selectedProForSchedule.id && a.status !== 'cancelado'
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#121212] border border-[#222222] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Equipe de Barbeiros ({professionals.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gerencie horários individuais de atendimento e especialidades
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-colors shadow-sm shadow-[#C49A5A]/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Barbeiro</span>
        </button>
      </div>

      {/* Grid of Professionals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {professionals.map((pro) => {
          const proServices = services.filter((s) => pro.servicesOfferedIds.includes(s.id));
          const completedCount = appointments.filter(
            (a) => a.professionalId === pro.id && a.status === 'concluido'
          ).length;

          return (
            <div
              key={pro.id}
              className={`bg-[#121212] border rounded-2xl p-5 flex flex-col justify-between transition-all relative overflow-hidden ${
                pro.isActive ? 'border-[#292929] hover:border-[#3a3a3a]' : 'border-neutral-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Header with avatar & status */}
                <div className="flex items-start gap-3.5 mb-4">
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-[#292929] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white truncate">{pro.name}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleStatus(pro.id);
                          showToast(
                            `Status de ${pro.name} alterado para ${pro.isActive ? 'Inativo' : 'Ativo'}.`,
                            'info'
                          );
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                          pro.isActive
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {pro.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                    <p className="text-xs text-[#C49A5A] font-medium mt-0.5">{pro.specialty}</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {completedCount} atendimentos realizados
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-neutral-400 line-clamp-3 mb-4 leading-relaxed">
                  {pro.bio}
                </p>

                {/* Working hours & days */}
                <div className="p-3 bg-[#161616] border border-[#222222] rounded-xl space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-[#C49A5A]" />
                      Horário:
                    </span>
                    <span className="font-semibold tabular-nums text-white">
                      {pro.workingHours.start} às {pro.workingHours.end}
                    </span>
                  </div>

                  {pro.workingHours.lunchStart && (
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Almoço:</span>
                      <span className="tabular-nums">
                        {pro.workingHours.lunchStart} - {pro.workingHours.lunchEnd}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-[#222222]">
                    <span>Dias:</span>
                    <div className="flex gap-1">
                      {weekDays.map((w) => (
                        <span
                          key={w.day}
                          className={`px-1 py-0.2 rounded text-[10px] font-medium ${
                            pro.workingDays.includes(w.day)
                              ? 'text-[#C49A5A] bg-[#C49A5A]/10 font-bold'
                              : 'text-neutral-600'
                          }`}
                        >
                          {w.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Services performed */}
                <div className="space-y-1.5 mb-5">
                  <span className="text-[11px] text-neutral-500 uppercase font-semibold tracking-wider">
                    Serviços Habilitados ({proServices.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proServices.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-[#1B1B1B] text-neutral-300 border border-[#292929]"
                      >
                        {s.name}
                      </span>
                    ))}
                    {proServices.length > 3 && (
                      <span className="text-[11px] px-1.5 py-0.5 text-neutral-500">
                        +{proServices.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#222222] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProForSchedule(pro)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#181818] hover:bg-[#202020] border border-[#292929] rounded-xl transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#C49A5A]" />
                  <span>Ver Agenda</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(pro)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
                  title="Editar profissional"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProfessional ? 'Editar Barbeiro' : 'Novo Barbeiro'}
        subtitle="Configure perfil profissional, jornada e serviços atribuídos."
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Nome do Barbeiro</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rafael Viana"
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Especialidade / Título</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ex: Master Fade & Navalha"
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Biografia / Apresentação</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
              required
            />
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400">Início</label>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-2 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400">Término</label>
              <input
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-2 py-1.5 text-xs text-white"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400">Almoço Início</label>
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-2 py-1.5 text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400">Almoço Fim</label>
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-2 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Working days checkboxes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Dias de Trabalho</label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((w) => (
                <button
                  key={w.day}
                  type="button"
                  onClick={() => handleToggleDay(w.day)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedWorkingDays.includes(w.day)
                      ? 'bg-[#C49A5A]/20 border-[#C49A5A] text-[#C49A5A] font-bold'
                      : 'bg-[#181818] border-[#292929] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services list */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Serviços que executa</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {services.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleToggleService(srv.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-left text-xs border transition-colors ${
                      isSelected
                        ? 'bg-[#1e1e1e] border-[#C49A5A]/50 text-white'
                        : 'bg-[#161616] border-[#262626] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span className="truncate pr-1">{srv.name}</span>
                    <span className="text-[10px] text-[#C49A5A] shrink-0 font-medium">R$ {srv.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222222]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#1B1B1B] hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-all shadow-sm shadow-[#C49A5A]/20"
            >
              {editingProfessional ? 'Salvar Alterações' : 'Cadastrar Barbeiro'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Individual Schedule Viewer Modal */}
      <Modal
        isOpen={Boolean(selectedProForSchedule)}
        onClose={() => setSelectedProForSchedule(null)}
        title={selectedProForSchedule ? `Agenda Individual: ${selectedProForSchedule.name}` : ''}
        subtitle="Grade de atendimentos futuros programados para este profissional"
        maxWidth="lg"
      >
        {selectedProForSchedule && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#181818] border border-[#292929] rounded-xl">
              <img
                src={selectedProForSchedule.avatar}
                alt={selectedProForSchedule.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">{selectedProForSchedule.name}</p>
                <p className="text-xs text-[#C49A5A]">{selectedProForSchedule.specialty}</p>
                <p className="text-[11px] text-neutral-400">
                  Horário: {selectedProForSchedule.workingHours.start} às {selectedProForSchedule.workingHours.end}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C49A5A]" />
                Atendimentos Agendados ({proAppointments.length})
              </h4>

              {proAppointments.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">
                  Nenhum agendamento ativo no momento para este barbeiro.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {proAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 bg-[#181818] border border-[#262626] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500">{apt.bookingCode}</span>
                        <div className="font-semibold text-white">{apt.customerName}</div>
                        <div className="text-[11px] text-neutral-400">
                          {apt.serviceName} ({apt.serviceDuration} min)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white tabular-nums block">
                          {apt.date} às {apt.time}
                        </span>
                        <StatusBadge status={apt.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#222222] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProForSchedule(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#1B1B1B] hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
