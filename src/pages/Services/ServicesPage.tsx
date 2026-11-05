import React, { useState } from 'react';
import { Service } from '../../types';
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Check,
  X,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useToast } from '../../components/ui/Toast';

interface ServicesPageProps {
  services: Service[];
  onCreateService: (data: Omit<Service, 'id'>) => void;
  onUpdateService: (id: string, updates: Partial<Service>) => void;
  onDeleteService: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onToggleStatus,
}) => {
  const { showToast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(60);
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [category, setCategory] = useState<Service['category']>('Cabelo');

  const categories: Service['category'][] = ['Cabelo', 'Barba', 'Combos', 'Tratamentos'];

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setPrice(65);
    setDurationMinutes(40);
    setCategory('Cabelo');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setName(srv.name);
    setDescription(srv.description);
    setPrice(srv.price);
    setDurationMinutes(srv.durationMinutes);
    setCategory(srv.category);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('O nome do serviço é obrigatório.', 'error');
      return;
    }
    if (price <= 0) {
      showToast('O preço deve ser maior que zero.', 'error');
      return;
    }
    if (durationMinutes <= 0) {
      showToast('A duração deve ser maior que zero.', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      category,
      isActive: editingService ? editingService.isActive : true,
    };

    if (editingService) {
      onUpdateService(editingService.id, payload);
      showToast('Serviço atualizado com sucesso!', 'success');
    } else {
      onCreateService(payload);
      showToast('Novo serviço cadastrado com sucesso!', 'success');
    }

    setIsFormOpen(false);
  };

  const handleDelete = () => {
    if (!serviceToDelete) return;
    onDeleteService(serviceToDelete.id);
    showToast('Serviço excluído do catálogo.', 'info');
    setServiceToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[#121212] border border-[#222222] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Catálogo de Serviços ({services.length})
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure procedimentos, preços cobrados e duração média na cadeira
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#090909] bg-[#C49A5A] hover:bg-[#d8ab66] rounded-xl transition-colors shadow-sm shadow-[#C49A5A]/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv) => {
          return (
            <div
              key={srv.id}
              className={`bg-[#121212] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                srv.isActive ? 'border-[#292929] hover:border-[#3a3a3a]' : 'border-neutral-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-[#C49A5A] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B1B1B] border border-[#262626]">
                    {srv.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleStatus(srv.id);
                      showToast(
                        `Serviço ${srv.name} está agora ${srv.isActive ? 'desativado' : 'ativo'}.`,
                        'info'
                      );
                    }}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                      srv.isActive
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}
                  >
                    {srv.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                  {srv.name}
                </h3>

                <p className="text-xs text-neutral-400 mt-2 mb-4 leading-relaxed line-clamp-3">
                  {srv.description}
                </p>
              </div>

              <div>
                {/* Meta price and duration */}
                <div className="flex items-center justify-between p-3 bg-[#161616] border border-[#222222] rounded-xl text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-[#C49A5A]" />
                    <span className="tabular-nums font-medium">{srv.durationMinutes} minutos</span>
                  </div>
                  <div className="text-base font-bold text-[#C49A5A] tabular-nums">
                    R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 0 })},00
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(srv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-[#181818] hover:bg-[#222222] border border-[#292929] rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServiceToDelete(srv)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 border border-[#292929] rounded-xl transition-colors"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        subtitle="Defina o nome, preço e duração estimada de atendimento."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Nome do Procedimento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte Degradê + Barboterapia"
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Service['category'])}
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Preço (R$)</label>
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] tabular-nums"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">Duração (minutos)</label>
              <input
                type="number"
                min={10}
                step={5}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] tabular-nums"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Descrição do Procedimento</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as técnicas, produtos utilizados e diferenciais do corte ou barba..."
              className="w-full bg-[#181818] border border-[#292929] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C49A5A] resize-none"
              required
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
              {editingService ? 'Salvar Alterações' : 'Cadastrar Serviço'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Service Modal */}
      <ConfirmModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={handleDelete}
        title="Excluir Serviço"
        description={`Tem certeza que deseja excluir "${serviceToDelete?.name}" do catálogo de serviços?`}
        confirmText="Sim, Excluir"
        isDestructive={true}
      />
    </div>
  );
};
