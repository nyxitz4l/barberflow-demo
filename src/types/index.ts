export type AppointmentStatus = 'agendado' | 'confirmado' | 'concluido' | 'cancelado';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  lastVisitDate: string | null;
  totalSpent: number;
  createdAt: string;
  notes?: string;
}

export interface WorkingHours {
  start: string; // e.g. "09:00"
  end: string;   // e.g. "20:00"
  lunchStart?: string; // e.g. "12:00"
  lunchEnd?: string;   // e.g. "13:00"
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  bio: string;
  servicesOfferedIds: string[];
  workingHours: WorkingHours;
  workingDays: number[]; // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: 'Cabelo' | 'Barba' | 'Combos' | 'Tratamentos';
  isActive: boolean;
}

export interface Appointment {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface BarbershopSettings {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  openingTime: string;
  closingTime: string;
  workingDays: number[];
  appointmentIntervalMinutes: number;
  heroNotice: string;
  accentColor: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
