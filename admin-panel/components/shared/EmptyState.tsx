import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "Veri bulunamadı" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 py-12 text-center bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">{message}</h3>
      <p className="text-sm text-slate-500">Bu alanda gösterilecek herhangi bir kayıt yok.</p>
    </div>
  );
}
