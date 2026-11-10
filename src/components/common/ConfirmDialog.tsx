import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ConfirmDialog: React.FC = () => {
  const { confirmDialog, hideConfirmDialog } = useApp();

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    hideConfirmDialog();
  };

  return (
    <Modal
      isOpen={confirmDialog.isOpen}
      onClose={hideConfirmDialog}
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            confirmDialog.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900">{confirmDialog.title}</h3>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{confirmDialog.message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" size="md" onClick={hideConfirmDialog}>
          {confirmDialog.cancelLabel || 'Cancel'}
        </Button>
        <Button
          variant={confirmDialog.isDestructive ? 'danger' : 'primary'}
          size="md"
          onClick={handleConfirm}
        >
          {confirmDialog.confirmLabel || 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
};
