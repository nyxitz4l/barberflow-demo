import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Professional, Service, Appointment, BarbershopSettings } from './types';
import { customerService } from './services/customerService';
import { professionalService } from './services/professionalService';
import { serviceService } from './services/serviceService';
import { appointmentService } from './services/appointmentService';
import { settingsService } from './services/settingsService';
import { initializeStorage } from './services/storageService';

import { ToastProvider, useToast } from './components/ui/Toast';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AppointmentFormModal } from './components/appointments/AppointmentFormModal';

// Pages
import { DashboardOverview } from './pages/Dashboard/DashboardOverview';
import { AppointmentsPage } from './pages/Appointments/AppointmentsPage';
import { CustomersPage } from './pages/Customers/CustomersPage';
import { ProfessionalsPage } from './pages/Professionals/ProfessionalsPage';
import { ServicesPage } from './pages/Services/ServicesPage';
import { FinancePage } from './pages/Finance/FinancePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { PublicBookingPage } from './pages/PublicBooking/PublicBookingPage';

function BarberFlowApp() {
  const { showToast } = useToast();

  // Mode: 'admin' or 'public_booking'
  const [appMode, setAppMode] = useState<'admin' | 'public_booking'>('admin');
  const [currentTab, setCurrentTab] = useState<NavItem>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core domain data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<BarbershopSettings>(() => settingsService.get());

  // Appointment Form Modal state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  // Reload all data from local storage
  const reloadData = useCallback(() => {
    setCustomers(customerService.getAll());
    setProfessionals(professionalService.getAll(true));
    setServices(serviceService.getAll(true));
    setAppointments(appointmentService.getAll());
    setSettings(settingsService.get());
  }, []);

  useEffect(() => {
    initializeStorage();
    reloadData();
  }, [reloadData]);

  // Handlers for appointments
  const handleOpenNewAppointment = () => {
    setAppointmentToEdit(null);
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (apt: Appointment) => {
    setAppointmentToEdit(apt);
    setIsAppointmentModalOpen(true);
  };

  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    appointmentService.updateStatus(id, status);
    reloadData();
  };

  const handleDeleteAppointment = (id: string) => {
    appointmentService.delete(id);
    reloadData();
  };

  // Handlers for customers
  const handleCreateCustomer = (
    data: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent' | 'lastVisitDate'>
  ) => {
    customerService.create(data);
    reloadData();
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    customerService.update(id, updates);
    reloadData();
  };

  const handleDeleteCustomer = (id: string) => {
    customerService.delete(id);
    reloadData();
  };

  // Handlers for professionals
  const handleCreateProfessional = (data: Omit<Professional, 'id'>) => {
    professionalService.create(data);
    reloadData();
  };

  const handleUpdateProfessional = (id: string, updates: Partial<Professional>) => {
    professionalService.update(id, updates);
    reloadData();
  };

  const handleToggleProStatus = (id: string) => {
    professionalService.toggleStatus(id);
    reloadData();
  };

  // Handlers for services
  const handleCreateService = (data: Omit<Service, 'id'>) => {
    serviceService.create(data);
    reloadData();
  };

  const handleUpdateService = (id: string, updates: Partial<Service>) => {
    serviceService.update(id, updates);
    reloadData();
  };

  const handleDeleteService = (id: string) => {
    serviceService.delete(id);
    reloadData();
  };

  const handleToggleServiceStatus = (id: string) => {
    serviceService.toggleStatus(id);
    reloadData();
  };

  // Handlers for settings
  const handleUpdateSettings = (updates: Partial<BarbershopSettings>) => {
    const updated = settingsService.update(updates);
    setSettings(updated);
  };

  const handleRestoreDemoData = () => {
    settingsService.restoreDemoData();
    reloadData();
  };

  // If viewing the public client booking portal:
  if (appMode === 'public_booking') {
    return (
      <PublicBookingPage
        settings={settings}
        services={services}
        professionals={professionals}
        onAppointmentBooked={reloadData}
        onBackToAdmin={() => setAppMode('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col font-['DM_Sans'] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenPublicBooking={() => setAppMode('public_booking')}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        barbershopName={settings.name}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNewAppointment={handleOpenNewAppointment}
          onOpenPublicBooking={() => setAppMode('public_booking')}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <DashboardOverview
              appointments={appointments}
              customers={customers}
              professionals={professionals}
              services={services}
              onOpenNewAppointment={handleOpenNewAppointment}
              onNavigateToAppointments={() => setCurrentTab('appointments')}
              onNavigateToCustomers={() => setCurrentTab('customers')}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsPage
              appointments={appointments}
              customers={customers}
              professionals={professionals}
              services={services}
              onOpenNewAppointment={handleOpenNewAppointment}
              onEditAppointment={handleEditAppointment}
              onUpdateStatus={handleUpdateStatus}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              customers={customers}
              appointments={appointments}
              onCreateCustomer={handleCreateCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {currentTab === 'professionals' && (
            <ProfessionalsPage
              professionals={professionals}
              services={services}
              appointments={appointments}
              onCreateProfessional={handleCreateProfessional}
              onUpdateProfessional={handleUpdateProfessional}
              onToggleStatus={handleToggleProStatus}
            />
          )}

          {currentTab === 'services' && (
            <ServicesPage
              services={services}
              onCreateService={handleCreateService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
              onToggleStatus={handleToggleServiceStatus}
            />
          )}

          {currentTab === 'finance' && (
            <FinancePage appointments={appointments} services={services} />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRestoreDemoData={handleRestoreDemoData}
            />
          )}
        </main>
      </div>

      {/* Appointment Create/Edit Modal */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSaved={reloadData}
        appointmentToEdit={appointmentToEdit}
        professionals={professionals.filter((p) => p.isActive)}
        services={services.filter((s) => s.isActive)}
        customers={customers}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BarberFlowApp />
    </ToastProvider>
  );
}
