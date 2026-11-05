import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDestructive
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-[#C49A5A]/10 text-[#C49A5A] border border-[#C49A5A]/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed pt-1">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222222]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-[#1B1B1B] hover:bg-neutral-800 border border-[#292929] rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#C49A5A] hover:bg-[#b38b4f] text-[#090909]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
