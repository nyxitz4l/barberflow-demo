import React, { useState, useMemo } from 'react';
import { Customer, Appointment } from '../../types';
import {
  Search,
  Plus,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  Scissors,
  Clock,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { StatusBadge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';

interface CustomersPageProps {
  customers: Customer[];
  appointments: Appointment[];
  onCreateCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent' | 'lastVisitDate'>) => void;
  onUpdateCustomer: (id: string, updates: Partial<Customer>) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  appointments,
  onCreateCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [customers, searchTerm]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormPhone(customer.phone);
    setFormEmail(customer.email);
    setFormNotes(customer.notes || '');
    setIsFormOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Nome e telefone são obrigatórios.', 'error');
      return;
    }

    if (editingCustomer) {
      onUpdateCustomer(editingCustomer.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`,
        notes: formNotes.trim(),
      });
      showToast('Cliente atualizado com sucesso!', 'success');
    } else {
      onCreateCustomer({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`,
        notes: formNotes.trim(),
      });
      showToast('Cliente cadastrado com sucesso!', 'success');
    }

    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!customerToDelete) return;
    onDeleteCustomer(customerToDelete.id);
    showToast('Cliente removido do cadastro.', 'info');
    setCustomerToDelete(null);
  };

  // Appointment history for selected customer
  const customerAppointments = useMemo(() => {
    if (!selectedCustomerForHistory) return [];
    return appointments.filter((a) => a.customerId === selectedCustomerForHistory.id);
  }, [selectedCustomerForHistory, appointments]);

  return (
    <div className="space-y-5">
      {/* Search and Action Bar */}
      <div className="bg-[#121212] border border-[#222222] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181818] border border-[#292929] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#C49A5A]"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Total: <strong className="text-white">{filteredCustomers.length}</strong> clientes
          </span>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-colors shadow-sm shadow-[#C49A5A]/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Cadastrar Cliente</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-neutral-400 font-semibold border-b border-[#222222]">
              <tr>
                <th className="py-3 px-5">Cliente</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Visitas</th>
                <th className="py-3 px-4">Última Visita</th>
                <th className="py-3 px-4">Total Gasto</th>
                <th className="py-3 px-4">Desde</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#161616]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1e1e1e] border border-[#2d2d2d] flex items-center justify-center font-bold text-xs text-[#C49A5A]">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{customer.name}</div>
                          {customer.notes && (
                            <div className="text-[11px] text-neutral-400 max-w-[200px] truncate">
                              {customer.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-200 font-mono">{customer.phone}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[160px]">
                        {customer.email}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white tabular-nums">
                        {customer.totalVisits}
                      </span>
                      <span className="text-[10px] text-neutral-500 ml-1">vezes</span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      {customer.lastVisitDate ? customer.lastVisitDate : 'Ainda não compareceu'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#C49A5A] tabular-nums">
                      R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 tabular-nums">
                      {customer.createdAt}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerForHistory(customer)}
                          className="p-1.5 text-neutral-400 hover:text-[#C49A5A] hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Histórico de atendimentos"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerToDelete(customer)}
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

      {/* Customer Form Modal (Create or Edit) */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCustomer ? 'Editar Informações do Cliente' : 'Novo Cliente'}
        subtitle="Mantenha os dados de contato atualizados para comunicações e histórico."
        maxWidth="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Nome Completo</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silveira"
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Telefone / WhatsApp</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(11) 98888-7777"
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">E-mail (opcional)</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="cliente@exemplo.com"
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Observações de Preferência</label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Ex: Prefere corte tesoura nas pontas, degradê zero alto..."
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
            />
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
              {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Details & History Modal */}
      <Modal
        isOpen={Boolean(selectedCustomerForHistory)}
        onClose={() => setSelectedCustomerForHistory(null)}
        title={selectedCustomerForHistory ? `Histórico: ${selectedCustomerForHistory.name}` : ''}
        subtitle="Registro completo de visitas e preferências do cliente"
        maxWidth="lg"
      >
        {selectedCustomerForHistory && (
          <div className="space-y-4">
            {/* Quick summary cards */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#181818] border border-[#292929] rounded-xl text-center">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Total de Visitas</span>
                <span className="text-base font-bold text-white tabular-nums">{selectedCustomerForHistory.totalVisits}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Valor Total Gasto</span>
                <span className="text-base font-bold text-[#C49A5A] tabular-nums">
                  R$ {selectedCustomerForHistory.totalSpent}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Desde</span>
                <span className="text-base font-medium text-neutral-300">{selectedCustomerForHistory.createdAt}</span>
              </div>
            </div>

            {selectedCustomerForHistory.notes && (
              <div className="p-3 bg-[#161616] border border-[#262626] rounded-xl text-xs text-neutral-300">
                <span className="text-[#C49A5A] font-semibold block mb-0.5">Notas do Perfil:</span>
                {selectedCustomerForHistory.notes}
              </div>
            )}

            {/* Appointments list */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C49A5A]" />
                Atendimentos Registrados ({customerAppointments.length})
              </h4>

              {customerAppointments.length === 0 ? (
                <p className="text-xs text-neutral-500 py-4 text-center">
                  Nenhum histórico de agendamento registrado para este cliente.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {customerAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3 bg-[#181818] border border-[#262626] rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">{apt.serviceName}</div>
                        <div className="text-[11px] text-neutral-400">
                          {apt.date} às {apt.time} · Barbeiro: {apt.professionalName}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-[#C49A5A] block tabular-nums">
                          R$ {apt.servicePrice},00
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
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#1B1B1B] hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Cliente"
        description={`Deseja realmente excluir ${customerToDelete?.name} da base de clientes? Esta ação removerá os dados cadastrais.`}
        confirmText="Sim, Excluir"
        isDestructive={true}
      />
    </div>
  );
};
