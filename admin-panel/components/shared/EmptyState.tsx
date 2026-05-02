import React from 'react';
import { type LucideIcon, FileSearch, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'error' | 'search';
}

const VARIANT_STYLES = {
  default: { iconBg: 'bg-slate-100 dark:bg-slate-800', iconColor: 'text-slate-400' },
  error: { iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-500' },
  search: { iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-500' },
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, variant = 'default' }: EmptyStateProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`w-16 h-16 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-8 h-8 ${styles.iconColor}`} />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4" variant={variant === 'error' ? 'destructive' : 'default'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
