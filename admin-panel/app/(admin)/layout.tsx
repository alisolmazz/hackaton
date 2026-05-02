'use client';

import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#1a2f5e]">
            <Sidebar />
          </div>

          {/* Mobile Sidebar (Sheet) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-[260px] bg-[#1a2f5e] border-none text-white">
              <Sidebar mobile setMobileMenuOpen={setMobileMenuOpen} />
            </SheetContent>
          </Sheet>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 min-w-0 md:pl-[260px]">
            <Header setMobileMenuOpen={setMobileMenuOpen} />
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
