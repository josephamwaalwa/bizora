import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
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
      title={confirmDialog.title}
      maxWidth="md"
      showCloseButton={false}
    >
      <p className="text-[16px] leading-relaxed text-ink-secondary">{confirmDialog.message}</p>

      <div className="mt-8 flex items-center justify-end gap-3">
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
