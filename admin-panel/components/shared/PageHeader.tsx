import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
  badge?: { label: string; variant: 'default' | 'success' | 'warning' | 'danger' };
}

const BADGE_STYLES = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

export function PageHeader({ title, description, backHref, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link href={backHref} className="mt-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            {badge && <Badge variant="outline" className={BADGE_STYLES[badge.variant]}>{badge.label}</Badge>}
          </div>
          {description && <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
