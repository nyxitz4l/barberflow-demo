import React, { useState, useMemo } from 'react';
import { Customer, Professional, Service, Appointment, BarbershopSettings } from '../../types';
import { appointmentService } from '../../services/appointmentService';
import { customerService } from '../../services/customerService';
import { useToast } from '../../components/ui/Toast';
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  LayoutDashboard,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface PublicBookingPageProps {
  settings: BarbershopSettings;
  services: Service[];
  professionals: Professional[];
  onAppointmentBooked: () => void;
  onBackToAdmin: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export const PublicBookingPage: React.FC<PublicBookingPageProps> = ({
  settings,
  services,
  professionals,
  onAppointmentBooked,
  onBackToAdmin,
}) => {
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Booking state
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('any'); // 'any' or specific pro ID
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // default to tomorrow or today
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Confirmation result
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Only active services and professionals
  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);
  const activeProfessionals = useMemo(() => professionals.filter((p) => p.isActive), [professionals]);

  const selectedService = useMemo(
    () => activeServices.find((s) => s.id === selectedServiceId),
    [activeServices, selectedServiceId]
  );

  // Determine actual professional assigned
  const resolvedProfessional = useMemo(() => {
    if (selectedProfessionalId !== 'any') {
      return activeProfessionals.find((p) => p.id === selectedProfessionalId);
    }
    // If 'any', find first available who performs the service
    return activeProfessionals.find((p) =>
      selectedService ? p.servicesOfferedIds.includes(selectedService.id) : true
    ) || activeProfessionals[0];
  }, [selectedProfessionalId, activeProfessionals, selectedService]);

  // Compute available dates (next 14 days)
  const availableDates = useMemo(() => {
    const dates: { dateStr: string; dayName: string; dayNum: number; monthName: string; isAvailable: boolean }[] = [];
    const now = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isShopOpen = settings.workingDays.includes(dayOfWeek);

      dates.push({
        dateStr,
        dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        isAvailable: isShopOpen,
      });
    }
    return dates;
  }, [settings.workingDays]);

  // Compute available time slots for selected date & professional
  const availableSlots = useMemo(() => {
    if (!resolvedProfessional || !selectedDate || !selectedService) return [];

    return appointmentService.getAvailableTimeSlots(
      resolvedProfessional.id,
      selectedDate,
      selectedService.durationMinutes
    );
  }, [resolvedProfessional, selectedDate, selectedService]);

  // Steps validation
  const canGoToStep2 = Boolean(selectedServiceId);
  const canGoToStep3 = Boolean(selectedProfessionalId);
  const canGoToStep4 = Boolean(selectedDate && selectedTime);
  const canGoToStep5 = Boolean(customerName.trim().length >= 3 && customerPhone.trim().length >= 8);

  const handleNextStep = () => {
    setBookingError(null);
    if (currentStep === 1 && !canGoToStep2) {
      showToast('Selecione um serviço para continuar.', 'error');
      return;
    }
    if (currentStep === 2 && !canGoToStep3) {
      showToast('Selecione um profissional para continuar.', 'error');
      return;
    }
    if (currentStep === 3 && !canGoToStep4) {
      showToast('Escolha a data e um horário disponível.', 'error');
      return;
    }
    if (currentStep === 4 && !canGoToStep5) {
      showToast('Informe seu nome e telefone para contato.', 'error');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    setBookingError(null);
    if (currentStep > 1 && currentStep < 6) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !resolvedProfessional) return;

    // Check if customer already exists or create new
    const existing = customerService.getAll().find(
      (c) => c.phone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
    );

    let customerId = existing ? existing.id : '';
    if (!existing) {
      const created = customerService.create({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`,
        notes: 'Cliente agendou via portal público.',
      });
      customerId = created.id;
    }

    // Create appointment
    const res = appointmentService.create({
      customerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      professionalId: resolvedProfessional.id,
      professionalName: resolvedProfessional.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmado',
      notes: notes.trim() || 'Agendamento online via BarberFlow',
    });

    if (!res.success || !res.appointment) {
      setBookingError(res.error || 'Não foi possível confirmar o agendamento.');
      showToast(res.error || 'Erro no agendamento.', 'error');
      return;
    }

    setConfirmedAppointment(res.appointment);
    setCurrentStep(6);
    onAppointmentBooked();
    showToast('Agendamento realizado com sucesso!', 'success');
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedServiceId('');
    setSelectedProfessionalId('any');
    setSelectedTime('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setNotes('');
    setConfirmedAppointment(null);
  };

  const copyCode = () => {
    if (confirmedAppointment?.bookingCode) {
      navigator.clipboard?.writeText(confirmedAppointment.bookingCode);
      showToast('Código copiado para a área de transferência!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col font-['DM_Sans']">
      {/* Top Demo Banner */}
      <div className="bg-[#141414] border-b border-[#222222] px-4 py-2 text-center text-xs text-neutral-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#C49A5A]" />
        <span className="font-bold tracking-wide uppercase text-[#C49A5A]">
          DEMONSTRAÇÃO | DADOS FICTÍCIOS
        </span>
        <span className="hidden md:inline text-neutral-500">·</span>
        <span className="hidden md:inline text-neutral-400">
          Nenhuma reserva, cobrança ou comunicação real é realizada.
        </span>
      </div>

      {/* Main Public Header */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-b border-[#222222] px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C49A5A] to-[#8C6B32] flex items-center justify-center text-[#090909] font-bold shadow-md shadow-[#C49A5A]/10">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Barber<span className="text-[#C49A5A]">Flow</span>
              </span>
              <p className="text-[11px] text-neutral-400 font-medium truncate">
                {settings.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToAdmin}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#292929] rounded-xl transition-all shadow-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#C49A5A]" />
              <span>Painel Administrativo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <section className="relative bg-[#111111] border-b border-[#222222] overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/barber_hero_interior_1793885694995.jpg"
            alt="Barbearia BarberFlow"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/80 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1815] border border-[#C49A5A]/30 text-xs font-semibold text-[#C49A5A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agendamento Online Instantâneo</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Reserve seu horário com os mestres da navalha
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {settings.tagline}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C49A5A]" />
                {settings.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C49A5A]" />
                {settings.phone}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-step progress bar */}
      <div className="bg-[#121212] border-b border-[#222222] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
          {[
            { step: 1, label: 'Serviço' },
            { step: 2, label: 'Barbeiro' },
            { step: 3, label: 'Data & Hora' },
            { step: 4, label: 'Seus Dados' },
            { step: 5, label: 'Revisão' },
            { step: 6, label: 'Confirmação' },
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div key={s.step} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-colors ${
                    isCurrent
                      ? 'bg-[#C49A5A] text-[#090909]'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-[#1e1e1e] text-neutral-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.step}
                </div>
                <span
                  className={`hidden sm:inline font-medium transition-colors ${
                    isCurrent ? 'text-white font-bold' : isCompleted ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {s.label}
                </span>
                {s.step < 6 && <div className="hidden md:block w-6 h-[1px] bg-[#292929] ml-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {bookingError && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Disponibilidade</p>
              <p className="mt-0.5 text-neutral-300">{bookingError}</p>
            </div>
          </div>
        )}

        {/* ================= STEP 1: SELECT SERVICE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                1. Escolha o Serviço
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Selecione o corte, barba ou combo desejado para o seu atendimento
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeServices.map((srv) => {
                const isSelected = selectedServiceId === srv.id;

                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedServiceId(srv.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#181612] border-[#C49A5A] shadow-md shadow-[#C49A5A]/10 ring-1 ring-[#C49A5A]'
                        : 'bg-[#121212] border-[#242424] hover:border-[#383838] hover:bg-[#151515]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-[#C49A5A] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2b2b2b]">
                          {srv.category}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#C49A5A] bg-[#C49A5A] text-[#090909]'
                              : 'border-neutral-600 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{srv.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#222222] flex items-center justify-between">
                      <span className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C49A5A]" />
                        {srv.durationMinutes} min
                      </span>
                      <span className="text-base font-bold text-[#C49A5A] tabular-nums">
                        R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })},00
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 2: SELECT PROFESSIONAL ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                2. Escolha o Profissional
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Serviço selecionado: <strong className="text-white">{selectedService?.name}</strong> (R$ {selectedService?.price}, {selectedService?.durationMinutes} min)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option: Any Professional */}
              <div
                onClick={() => setSelectedProfessionalId('any')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  selectedProfessionalId === 'any'
                    ? 'bg-[#181612] border-[#C49A5A] shadow-md shadow-[#C49A5A]/10 ring-1 ring-[#C49A5A]'
                    : 'bg-[#121212] border-[#242424] hover:border-[#383838]'
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#222222] to-[#161616] border border-[#2d2d2d] flex items-center justify-center text-[#C49A5A] shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Qualquer profissional disponível</h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedProfessionalId === 'any'
                          ? 'border-[#C49A5A] bg-[#C49A5A] text-[#090909]'
                          : 'border-neutral-600'
                      }`}
                    >
                      {selectedProfessionalId === 'any' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Maior variedade de horários livres no dia
                  </p>
                </div>
              </div>

              {/* Specific Barbers */}
              {activeProfessionals.map((pro) => {
                const isSelected = selectedProfessionalId === pro.id;

                return (
                  <div
                    key={pro.id}
                    onClick={() => setSelectedProfessionalId(pro.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'bg-[#181612] border-[#C49A5A] shadow-md shadow-[#C49A5A]/10 ring-1 ring-[#C49A5A]'
                        : 'bg-[#121212] border-[#242424] hover:border-[#383838]'
                    }`}
                  >
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-[#2d2d2d] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white truncate">{pro.name}</h3>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#C49A5A] bg-[#C49A5A] text-[#090909]'
                              : 'border-neutral-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-xs text-[#C49A5A] font-medium">{pro.specialty}</p>
                      <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                        {pro.workingHours.start} às {pro.workingHours.end}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 3: DATE & TIME ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                3. Selecione a Data e Horário
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Atendimento com: <strong className="text-white">{resolvedProfessional?.name}</strong> · Duração: {selectedService?.durationMinutes} min
              </p>
            </div>

            {/* Date horizontal strip selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C49A5A]" />
                Próximas datas disponíveis
              </label>

              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.dateStr;

                  if (!item.isAvailable) {
                    return (
                      <div
                        key={item.dateStr}
                        className="flex flex-col items-center justify-center w-16 h-20 rounded-2xl bg-[#141414] border border-[#222222] opacity-40 shrink-0 cursor-not-allowed"
                      >
                        <span className="text-[10px] text-neutral-500 uppercase">{item.dayName}</span>
                        <span className="text-base font-bold text-neutral-500 tabular-nums">{item.dayNum}</span>
                        <span className="text-[9px] text-neutral-600">Fechado</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedTime(''); // reset time when date changes
                      }}
                      className={`flex flex-col items-center justify-center w-16 h-20 rounded-2xl border transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#C49A5A] text-[#090909] border-[#C49A5A] shadow-md shadow-[#C49A5A]/20 scale-105'
                          : 'bg-[#141414] border-[#242424] text-white hover:border-[#383838]'
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-[#090909]' : 'text-neutral-400'}`}>
                        {item.dayName}
                      </span>
                      <span className="text-lg font-bold tabular-nums my-0.5">
                        {item.dayNum}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-[#090909]/80 font-medium' : 'text-neutral-400'}`}>
                        {item.monthName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots grid */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C49A5A]" />
                  Horários Livres no Dia
                </label>
                <span className="text-xs text-neutral-400">
                  {availableSlots.length} horários disponíveis
                </span>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#141414] border border-[#242424] text-center space-y-2">
                  <Clock className="w-8 h-8 text-neutral-500 mx-auto" />
                  <p className="text-xs text-neutral-300 font-semibold">
                    Nenhum horário livre restante para este profissional na data selecionada.
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Tente selecionar outra data na barra acima ou selecione &quot;Qualquer profissional disponível&quot;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold tabular-nums transition-all border ${
                          isSelected
                            ? 'bg-[#C49A5A] text-[#090909] border-[#C49A5A] shadow-md shadow-[#C49A5A]/20 scale-105'
                            : 'bg-[#141414] text-white border-[#262626] hover:border-[#383838] hover:bg-[#181818]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 4: CUSTOMER INFO ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                4. Seus Dados de Contato
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Utilizaremos estas informações apenas para simular seu voucher de agendamento
              </p>
            </div>

            <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#C49A5A]" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Como gostaria de ser chamado?"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#181818] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#C49A5A]" />
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C49A5A]" />
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#181818] border border-[#292929] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Preferências ou Observações (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alguma recomendação sobre corte, barba ou estilo?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#181818] border border-[#292929] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: REVIEW ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                5. Revisão do Agendamento
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Confira os detalhes abaixo antes de concluir a sua reserva
              </p>
            </div>

            <div className="bg-[#121212] border border-[#242424] p-6 rounded-2xl space-y-5">
              {/* Service & Pro summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222222] gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-[#C49A5A] uppercase tracking-wider">
                    Serviço Escolhido
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedService?.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{selectedService?.description}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-2xl font-extrabold text-[#C49A5A] tabular-nums block">
                    R$ {selectedService?.price},00
                  </span>
                  <span className="text-xs text-neutral-400">{selectedService?.durationMinutes} minutos</span>
                </div>
              </div>

              {/* Grid details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-1">
                  <span className="text-neutral-500 font-semibold block">Profissional:</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={resolvedProfessional?.avatar}
                      alt={resolvedProfessional?.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-[#333]"
                    />
                    <span className="font-bold text-white">{resolvedProfessional?.name}</span>
                  </div>
                  <span className="text-[11px] text-[#C49A5A] block">{resolvedProfessional?.specialty}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-1">
                  <span className="text-neutral-500 font-semibold block">Data & Horário:</span>
                  <div className="text-sm font-bold text-white tabular-nums">
                    {selectedDate} às {selectedTime}
                  </div>
                  <span className="text-[11px] text-neutral-400 block">Duração: {selectedService?.durationMinutes} min</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-1">
                  <span className="text-neutral-500 font-semibold block">Cliente:</span>
                  <div className="font-bold text-white">{customerName}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{customerPhone}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-1">
                  <span className="text-neutral-500 font-semibold block">Local de Atendimento:</span>
                  <div className="font-semibold text-white">{settings.name}</div>
                  <div className="text-[11px] text-neutral-400 truncate">{settings.address}</div>
                </div>
              </div>

              {notes && (
                <div className="p-3 bg-[#161616] border border-[#242424] rounded-xl text-xs text-neutral-300">
                  <span className="text-neutral-500 font-semibold block">Observações:</span>
                  {notes}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 6: CONFIRMATION SUCCESS ================= */}
        {currentStep === 6 && confirmedAppointment && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Agendamento Confirmado!
              </h2>
              <p className="text-xs text-neutral-400">
                Seu horário foi reservado com sucesso no sistema BarberFlow
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-[#121212] border border-[#C49A5A]/30 p-6 rounded-2xl text-left space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-neutral-500">
                    Código da Reserva
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-mono font-bold text-[#C49A5A]">
                      {confirmedAppointment.bookingCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                      title="Copiar código"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] font-semibold text-emerald-300">
                  Confirmado
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-semibold text-white">{confirmedAppointment.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span className="text-neutral-400">Serviço:</span>
                  <span className="font-semibold text-white">{confirmedAppointment.serviceName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span className="text-neutral-400">Profissional:</span>
                  <span className="font-semibold text-white">{confirmedAppointment.professionalName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span className="text-neutral-400">Data e Horário:</span>
                  <span className="font-bold text-[#C49A5A] tabular-nums">
                    {confirmedAppointment.date} às {confirmedAppointment.time}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">Valor Estimado:</span>
                  <span className="font-bold text-white tabular-nums">
                    R$ {confirmedAppointment.servicePrice},00
                  </span>
                </div>
              </div>

              {/* Notice */}
              <div className="pt-2 text-[11px] text-neutral-500 italic text-center">
                * Demonstração interativa de portfólio. Nenhuma notificação por SMS ou cobrança real foi realizada.
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#292929] rounded-xl transition-colors"
              >
                Fazer Novo Agendamento
              </button>

              <button
                type="button"
                onClick={onBackToAdmin}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-all shadow-md shadow-[#C49A5A]/20"
              >
                <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
                <span>Ver no Painel do Barbeiro</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Step Buttons (Steps 1 to 5) */}
        {currentStep < 6 && (
          <div className="flex items-center justify-between pt-8 border-t border-[#222222] mt-8">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentStep === 1
                  ? 'text-neutral-600 bg-transparent cursor-not-allowed'
                  : 'text-neutral-300 hover:text-white bg-[#181818] border border-[#292929] hover:bg-[#222222]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] transition-all shadow-sm shadow-[#C49A5A]/20"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] transition-all shadow-md shadow-[#C49A5A]/20"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar Agendamento</span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="mt-auto py-6 border-t border-[#1e1e1e] bg-[#0c0c0c] text-center text-xs text-neutral-500 px-4">
        <p>
          BarberFlow &copy; {new Date().getFullYear()} · Sistema de Gestão e Agendamento para Barbearias
        </p>
        <p className="text-[11px] text-neutral-600 mt-1">
          Esta é uma demonstração interativa. Os dados apresentados são fictícios e as operações são simuladas localmente.
        </p>
      </footer>
    </div>
  );
};
