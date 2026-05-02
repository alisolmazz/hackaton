'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Onayla', confirmVariant = 'default', isLoading = false }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          >
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> İşleniyor...</> : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
