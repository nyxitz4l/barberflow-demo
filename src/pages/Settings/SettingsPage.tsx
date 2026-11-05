import React, { useState } from 'react';
import { BarbershopSettings } from '../../types';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Palette,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/Toast';

interface SettingsPageProps {
  settings: BarbershopSettings;
  onUpdateSettings: (updates: Partial<BarbershopSettings>) => void;
  onRestoreDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onRestoreDemoData,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [description, setDescription] = useState(settings.description);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [openingTime, setOpeningTime] = useState(settings.openingTime);
  const [closingTime, setClosingTime] = useState(settings.closingTime);
  const [workingDays, setWorkingDays] = useState<number[]>(settings.workingDays);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(settings.appointmentIntervalMinutes);
  const [heroNotice, setHeroNotice] = useState(settings.heroNotice);

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const weekDays = [
    { day: 0, label: 'Domingo' },
    { day: 1, label: 'Segunda-feira' },
    { day: 2, label: 'Terça-feira' },
    { day: 3, label: 'Quarta-feira' },
    { day: 4, label: 'Quinta-feira' },
    { day: 5, label: 'Sexta-feira' },
    { day: 6, label: 'Sábado' },
  ];

  const handleToggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name,
      tagline,
      description,
      phone,
      email,
      address,
      openingTime,
      closingTime,
      workingDays,
      appointmentIntervalMinutes: intervalMinutes,
      heroNotice,
    });
    showToast('Configurações salvas com sucesso!', 'success');
  };

  const handleConfirmRestore = () => {
    onRestoreDemoData();
    showToast('Dados da demonstração restaurados com sucesso!', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Form Card */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-[#121212] border border-[#222222] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222222]">
            <Store className="w-5 h-5 text-[#C49A5A]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Identidade da Barbearia
              </h2>
              <p className="text-xs text-neutral-400">
                Informações visíveis no painel administrativo e na página pública de agendamento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Nome do Estabelecimento</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Slogan / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Apresentação Institucional</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C49A5A]" />
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C49A5A]" />
                E-mail Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C49A5A]" />
              Endereço Fictício
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
              required
            />
          </div>
        </div>

        {/* Section 2: Operating Schedule & Intervals */}
        <div className="bg-[#121212] border border-[#222222] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222222]">
            <Clock className="w-5 h-5 text-[#C49A5A]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Horários de Atendimento & Grade
              </h2>
              <p className="text-xs text-neutral-400">
                Regras de funcionamento para cálculo automático de horários livres no agendamento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Abertura</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Fechamento</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Intervalo da Grade (min)</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos (Recomendado)</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              Dias de Atendimento da Barbearia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {weekDays.map((w) => (
                <button
                  key={w.day}
                  type="button"
                  onClick={() => handleToggleDay(w.day)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors ${
                    workingDays.includes(w.day)
                      ? 'bg-[#1e1e1e] border-[#C49A5A] text-white'
                      : 'bg-[#161616] border-[#262626] text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <span className="block">{w.label}</span>
                  <span className="text-[10px] text-[#C49A5A]">
                    {workingDays.includes(w.day) ? 'Aberto' : 'Fechado'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Public Page Banner Customization */}
        <div className="bg-[#121212] border border-[#222222] p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#222222]">
            <Palette className="w-5 h-5 text-[#C49A5A]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Destaque da Página Pública
              </h2>
              <p className="text-xs text-neutral-400">
                Mensagem personalizada em destaque para os clientes
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Mensagem de Destaque / Aviso aos Clientes</label>
            <input
              type="text"
              value={heroNotice}
              onChange={(e) => setHeroNotice(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-all shadow-sm shadow-[#C49A5A]/20"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* Dangerous/Data Zone: Restore Demo Data */}
      <div className="bg-[#141212] border border-red-900/40 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Restaurar Dados da Demonstração
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl leading-relaxed">
            Se você fez muitos testes ou criou cadastros experimentais, pode retornar todos os clientes (15), profissionais (3), serviços (6) e agendamentos para o estado inicial fictício.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRestoreModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/50 rounded-xl transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restaurar Dados Originais</span>
        </button>
      </div>

      {/* Confirm Restore Modal */}
      <ConfirmModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleConfirmRestore}
        title="Restaurar Base de Demonstração?"
        description="Esta ação substituirá todos os dados gravados no navegador pelos 15 clientes, 3 barbeiros, 6 serviços e histórico original. Tem certeza que deseja continuar?"
        confirmText="Sim, Restaurar Demonstração"
        isDestructive={true}
      />
    </div>
  );
};
