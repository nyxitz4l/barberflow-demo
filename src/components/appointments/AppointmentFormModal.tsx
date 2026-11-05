import React, { useState, useEffect } from 'react';
import { Appointment, Customer, Professional, Service } from '../../types';
import { Modal } from '../ui/Modal';
import { appointmentService } from '../../services/appointmentService';
import { customerService } from '../../services/customerService';
import { useToast } from '../ui/Toast';
import { AlertCircle, Clock, Calendar as CalendarIcon, User, Scissors } from 'lucide-react';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  appointmentToEdit?: Appointment | null;
  professionals: Professional[];
  services: Service[];
  customers: Customer[];
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  appointmentToEdit,
  professionals,
  services,
  customers,
}) => {
  const { showToast } = useToast();

  const isEditing = Boolean(appointmentToEdit);

  // Form states
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [serviceId, setServiceId] = useState<string>('');
  const [professionalId, setProfessionalId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<Appointment['status']>('agendado');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available slots for selected professional + date + service
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Initialize or reset form
  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedCustomerId(appointmentToEdit.customerId);
      setCustomerMode('existing');
      setNewCustomerName(appointmentToEdit.customerName);
      setCustomerPhone(appointmentToEdit.customerPhone);
      setCustomerEmail(appointmentToEdit.customerEmail || '');
      setServiceId(appointmentToEdit.serviceId);
      setProfessionalId(appointmentToEdit.professionalId);
      setDate(appointmentToEdit.date);
      setTime(appointmentToEdit.time);
      setNotes(appointmentToEdit.notes || '');
      setStatus(appointmentToEdit.status);
    } else {
      // Default to first customer, service, professional
      if (customers.length > 0) {
        setSelectedCustomerId(customers[0].id);
        setCustomerPhone(customers[0].phone);
        setCustomerEmail(customers[0].email);
      }
      if (services.length > 0) {
        setServiceId(services[0].id);
      }
      if (professionals.length > 0) {
        setProfessionalId(professionals[0].id);
      }
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setNotes('');
      setStatus('agendado');
      setCustomerMode('existing');
      setNewCustomerName('');
    }
    setErrorMessage(null);
  }, [appointmentToEdit, isOpen, customers, services, professionals]);

  // When existing customer changes, sync phone & email
  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerPhone(found.phone);
      setCustomerEmail(found.email);
    }
  };

  // Recalculate available slots
  useEffect(() => {
    if (!professionalId || !date || !serviceId) return;
    const selectedSrv = services.find((s) => s.id === serviceId);
    const duration = selectedSrv ? selectedSrv.durationMinutes : 30;
    const slots = appointmentService.getAvailableTimeSlots(professionalId, date, duration);

    // If editing, make sure the current appointment time is included
    if (appointmentToEdit && appointmentToEdit.date === date && appointmentToEdit.professionalId === professionalId) {
      if (!slots.includes(appointmentToEdit.time)) {
        slots.push(appointmentToEdit.time);
        slots.sort();
      }
    }
    setAvailableSlots(slots);
  }, [professionalId, date, serviceId, services, appointmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const selectedSrv = services.find((s) => s.id === serviceId);
    const selectedPro = professionals.find((p) => p.id === professionalId);

    if (!selectedSrv) {
      setErrorMessage('Por favor, selecione um serviço.');
      return;
    }
    if (!selectedPro) {
      setErrorMessage('Por favor, selecione um profissional.');
      return;
    }
    if (!date) {
      setErrorMessage('Por favor, selecione uma data válida.');
      return;
    }
    if (!time) {
      setErrorMessage('Por favor, selecione um horário válido.');
      return;
    }

    let finalCustomerId = selectedCustomerId;
    let finalCustomerName = '';

    if (customerMode === 'new') {
      if (!newCustomerName.trim()) {
        setErrorMessage('Por favor, informe o nome do novo cliente.');
        return;
      }
      if (!customerPhone.trim()) {
        setErrorMessage('Por favor, informe o telefone do cliente.');
        return;
      }
      // Create new customer record
      const createdCustomer = customerService.create({
        name: newCustomerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || `${newCustomerName.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`,
        notes: 'Cadastrado via novo agendamento.',
      });
      finalCustomerId = createdCustomer.id;
      finalCustomerName = createdCustomer.name;
    } else {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (!found) {
        setErrorMessage('Cliente selecionado inválido.');
        return;
      }
      finalCustomerName = found.name;
    }

    if (isEditing && appointmentToEdit) {
      const res = appointmentService.update(appointmentToEdit.id, {
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone,
        customerEmail,
        professionalId: selectedPro.id,
        professionalName: selectedPro.name,
        serviceId: selectedSrv.id,
        serviceName: selectedSrv.name,
        servicePrice: selectedSrv.price,
        serviceDuration: selectedSrv.durationMinutes,
        date,
        time,
        status,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao atualizar agendamento.');
        return;
      }

      showToast('Agendamento atualizado com sucesso!', 'success');
      onSaved();
      onClose();
    } else {
      const res = appointmentService.create({
        customerId: finalCustomerId,
        customerName: finalCustomerName,
        customerPhone,
        customerEmail,
        professionalId: selectedPro.id,
        professionalName: selectedPro.name,
        serviceId: selectedSrv.id,
        serviceName: selectedSrv.name,
        servicePrice: selectedSrv.price,
        serviceDuration: selectedSrv.durationMinutes,
        date,
        time,
        status,
        notes,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erro ao criar agendamento.');
        return;
      }

      showToast('Novo agendamento realizado com sucesso!', 'success');
      onSaved();
      onClose();
    }
  };

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}
      subtitle="Preencha os dados abaixo. O sistema previne conflitos de horários duplicados."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Customer selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C49A5A]" />
              Cliente
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCustomerMode('existing')}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  customerMode === 'existing'
                    ? 'bg-[#C49A5A]/20 text-[#C49A5A] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Cadastrado
              </button>
              <button
                type="button"
                onClick={() => setCustomerMode('new')}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  customerMode === 'new'
                    ? 'bg-[#C49A5A]/20 text-[#C49A5A] font-semibold'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                + Novo
              </button>
            </span>
          </label>

          {customerMode === 'existing' ? (
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - {c.phone}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Nome completo do cliente"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
              <input
                type="text"
                placeholder="Telefone (ex: (11) 99999-9999)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>
          )}
        </div>

        {/* Service and Professional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#C49A5A]" />
              Serviço
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (R$ {s.price} · {s.durationMinutes}m)
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="text-[11px] text-neutral-400">
                Duração: {selectedService.durationMinutes} min · R$ {selectedService.price},00
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C49A5A]" />
              Profissional
            </label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
            >
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-[#C49A5A]" />
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C49A5A]" />
                Horário
              </span>
              <span className="text-[11px] text-[#C49A5A] font-medium">
                {availableSlots.length} livres
              </span>
            </label>

            {availableSlots.length > 0 ? (
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            )}
          </div>
        </div>

        {/* Status (especially when editing) */}
        {isEditing && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Status do Agendamento</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Appointment['status'])}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C49A5A]"
            >
              <option value="agendado">Aguardando Confirmação</option>
              <option value="confirmado">Confirmado</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">Observações adicionais (opcional)</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Corte navalhado fino, cliente com evento às 19h..."
            className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222222]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#1B1B1B] hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-all shadow-sm shadow-[#C49A5A]/20"
          >
            {isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
