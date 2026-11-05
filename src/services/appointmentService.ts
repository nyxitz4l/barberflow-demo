import { Appointment, AppointmentStatus } from '../types';
import { storage, STORAGE_KEYS, initializeStorage } from './storageService';
import { INITIAL_APPOINTMENTS } from './mockData';
import { professionalService } from './professionalService';
import { customerService } from './customerService';
import { settingsService } from './settingsService';

// Time calculation helpers (minutes from midnight)
export const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Generates a random alphanumeric booking code like "BF-7482"
export const generateBookingCode = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BF-${randomNum}`;
};

export const appointmentService = {
  getAll: (): Appointment[] => {
    initializeStorage();
    const list = storage.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    // Sort descending by date and time
    return list.sort((a, b) => {
      const cmpDate = b.date.localeCompare(a.date);
      if (cmpDate !== 0) return cmpDate;
      return b.time.localeCompare(a.time);
    });
  },

  getById: (id: string): Appointment | undefined => {
    const list = appointmentService.getAll();
    return list.find((a) => a.id === id);
  },

  getByBookingCode: (code: string): Appointment | undefined => {
    const list = appointmentService.getAll();
    return list.find((a) => a.bookingCode.toUpperCase() === code.trim().toUpperCase());
  },

  getByCustomer: (customerId: string): Appointment[] => {
    const list = appointmentService.getAll();
    return list.filter((a) => a.customerId === customerId);
  },

  getByDate: (dateStr: string): Appointment[] => {
    const list = appointmentService.getAll();
    return list.filter((a) => a.date === dateStr);
  },

  // Checks if a given time slot and duration overlaps with an existing non-cancelled appointment
  isSlotOverlapping: (
    professionalId: string,
    date: string,
    time: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): boolean => {
    const list = appointmentService.getAll();
    const targetStart = timeToMinutes(time);
    const targetEnd = targetStart + durationMinutes;

    return list.some((apt) => {
      if (apt.id === excludeAppointmentId) return false;
      if (apt.professionalId !== professionalId) return false;
      if (apt.date !== date) return false;
      if (apt.status === 'cancelado') return false;

      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.serviceDuration;

      // Overlap occurs if start of one is before end of other and vice versa
      return targetStart < aptEnd && targetEnd > aptStart;
    });
  },

  // Computes available timeslots for a professional on a given date
  getAvailableTimeSlots: (
    professionalId: string,
    date: string,
    serviceDurationMinutes: number
  ): string[] => {
    const pro = professionalService.getById(professionalId);
    if (!pro || !pro.isActive) return [];

    const settings = settingsService.get();
    const targetDate = new Date(`${date}T12:00:00`);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday, 6 is Saturday

    // Check if the professional and the shop operate on this day
    if (!settings.workingDays.includes(dayOfWeek) || !pro.workingDays.includes(dayOfWeek)) {
      return [];
    }

    const startMinutes = timeToMinutes(pro.workingHours.start);
    const endMinutes = timeToMinutes(pro.workingHours.end);
    const interval = settings.appointmentIntervalMinutes || 30;

    const lunchStartMinutes = pro.workingHours.lunchStart ? timeToMinutes(pro.workingHours.lunchStart) : null;
    const lunchEndMinutes = pro.workingHours.lunchEnd ? timeToMinutes(pro.workingHours.lunchEnd) : null;

    const slots: string[] = [];
    const appointmentsOnDate = appointmentService
      .getAll()
      .filter((a) => a.date === date && a.professionalId === professionalId && a.status !== 'cancelado');

    for (let current = startMinutes; current + serviceDurationMinutes <= endMinutes; current += interval) {
      const slotEnd = current + serviceDurationMinutes;

      // Check lunch overlap
      if (lunchStartMinutes !== null && lunchEndMinutes !== null) {
        if (current < lunchEndMinutes && slotEnd > lunchStartMinutes) {
          continue;
        }
      }

      // Check appointment overlap
      const hasConflict = appointmentsOnDate.some((apt) => {
        const aptStart = timeToMinutes(apt.time);
        const aptEnd = aptStart + apt.serviceDuration;
        return current < aptEnd && slotEnd > aptStart;
      });

      if (!hasConflict) {
        slots.push(minutesToTime(current));
      }
    }

    return slots;
  },

  create: (
    data: Omit<Appointment, 'id' | 'bookingCode' | 'createdAt'>
  ): { success: boolean; appointment?: Appointment; error?: string } => {
    // Validate conflict
    const hasConflict = appointmentService.isSlotOverlapping(
      data.professionalId,
      data.date,
      data.time,
      data.serviceDuration
    );

    if (hasConflict) {
      return {
        success: false,
        error: `O profissional já possui um agendamento conflitante no horário ${data.time} no dia ${data.date}. Escolha outro horário.`,
      };
    }

    const list = appointmentService.getAll();
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      bookingCode: generateBookingCode(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    list.unshift(newAppointment);
    storage.setItem(STORAGE_KEYS.APPOINTMENTS, list);

    // If created with status 'concluido', record customer visit
    if (newAppointment.status === 'concluido') {
      customerService.recordVisit(newAppointment.customerId, newAppointment.servicePrice, newAppointment.date);
    }

    return { success: true, appointment: newAppointment };
  },

  update: (
    id: string,
    updates: Partial<Appointment>
  ): { success: boolean; appointment?: Appointment; error?: string } => {
    const list = appointmentService.getAll();
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) {
      return { success: false, error: 'Agendamento não encontrado.' };
    }

    const current = list[index];
    const professionalId = updates.professionalId ?? current.professionalId;
    const date = updates.date ?? current.date;
    const time = updates.time ?? current.time;
    const duration = updates.serviceDuration ?? current.serviceDuration;

    // Check conflict if time, date or professional changed
    if (
      (updates.time && updates.time !== current.time) ||
      (updates.date && updates.date !== current.date) ||
      (updates.professionalId && updates.professionalId !== current.professionalId)
    ) {
      const hasConflict = appointmentService.isSlotOverlapping(
        professionalId,
        date,
        time,
        duration,
        id
      );
      if (hasConflict) {
        return {
          success: false,
          error: `O profissional já possui um agendamento no horário ${time} em ${date}. Selecione outro horário.`,
        };
      }
    }

    const prevStatus = current.status;
    const updated = { ...current, ...updates };
    list[index] = updated;
    storage.setItem(STORAGE_KEYS.APPOINTMENTS, list);

    // If transitioned to 'concluido', record stats
    if (prevStatus !== 'concluido' && updated.status === 'concluido') {
      customerService.recordVisit(updated.customerId, updated.servicePrice, updated.date);
    }

    return { success: true, appointment: updated };
  },

  updateStatus: (id: string, status: AppointmentStatus): Appointment | null => {
    const res = appointmentService.update(id, { status });
    return res.success ? (res.appointment ?? null) : null;
  },

  delete: (id: string): boolean => {
    const list = appointmentService.getAll();
    const filtered = list.filter((a) => a.id !== id);
    if (filtered.length === list.length) return false;
    storage.setItem(STORAGE_KEYS.APPOINTMENTS, filtered);
    return true;
  },
};
