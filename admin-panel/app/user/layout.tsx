'use client';

import React, { useState } from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { UserHeader } from '@/components/user/UserHeader';
import { PremiumModalProvider } from '@/context/PremiumModalContext';
import { PremiumModal } from '@/components/user/PremiumModal';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <PremiumModalProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-900 dark:text-slate-200 font-sans antialiased relative selection:bg-indigo-500/30 transition-colors duration-300">
        <AnimatedBackground />
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-[280px] md:flex-col md:fixed md:inset-y-0 z-[80] bg-transparent print:hidden relative">
          <UserSidebar />
        </div>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[280px] bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-3xl border-none text-slate-900 dark:text-white transition-colors duration-300">
            <UserSidebar mobile setMobileMenuOpen={setMobileMenuOpen} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col md:pl-[280px] relative z-10">
          <UserHeader setMobileMenuOpen={setMobileMenuOpen} />
          <main className="flex-1 p-3 sm:p-4 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar relative">
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
      <PremiumModal />
    </PremiumModalProvider>
  );
}
