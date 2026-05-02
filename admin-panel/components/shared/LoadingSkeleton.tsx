import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2 animate-pulse">
      <div className="flex gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-t-lg">
        {Array.from({ length: cols }).map((_, i) => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, c) => <div key={c} className="h-4 bg-slate-100 dark:bg-slate-800 rounded flex-1" />)}
        </div>
      ))}
    </div>
  );
}

export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="shadow-sm"><CardContent className="p-5 space-y-3">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
        </CardContent></Card>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 flex items-end justify-center gap-3 p-6" style={{ height }}>
      {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
        <div key={i} className="w-8 bg-slate-200 dark:bg-slate-700 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export function BankaKartSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="shadow-sm"><CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" /><div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" /></div>
          <div className="h-7 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </CardContent></Card>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
          <div className="flex-1 space-y-2"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" /><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" /></div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}
