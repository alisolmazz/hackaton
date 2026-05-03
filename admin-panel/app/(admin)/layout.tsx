'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AnimatedBackground from '@/components/shared/AnimatedBackground';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-200 font-sans antialiased relative selection:bg-indigo-500/30 transition-colors duration-300">
      <AnimatedBackground />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-[280px] md:flex-col md:fixed md:inset-y-0 z-[80] bg-transparent print:hidden relative">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-3xl border-none text-slate-900 dark:text-white transition-colors duration-300">
          <Sidebar mobile setMobileMenuOpen={setMobileMenuOpen} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-[280px] print:pl-0 relative z-10">
        <div className="print:hidden">
          <Header setMobileMenuOpen={setMobileMenuOpen} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar print:bg-white print:p-0">
          <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700 print:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
