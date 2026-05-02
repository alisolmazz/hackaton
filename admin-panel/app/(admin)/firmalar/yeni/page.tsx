'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import FirmaForm from '@/components/firma/FirmaForm';

export default function YeniFirmaPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="h-10 w-10 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Yeni Firma Ekle</h2>
          <p className="text-sm text-slate-500 mt-1">Müşteriyi sisteme kaydetmek için aşağıdaki bilgileri doldurun veya belgelerden otomatik okutun.</p>
        </div>
      </div>

      {/* Form Content */}
      <FirmaForm />
    </div>
  );
}
