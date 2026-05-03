import React from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { UserHeader } from '@/components/user/UserHeader';
import { PremiumModalProvider } from '@/context/PremiumModalContext';
import { PremiumModal } from '@/components/user/PremiumModal';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumModalProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0f1c] flex font-sans antialiased selection:bg-indigo-500/30 transition-colors duration-300">
        <UserSidebar />
        <div className="flex-1 flex flex-col md:pl-[280px]">
          <UserHeader />
          <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar relative">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
      <PremiumModal />
    </PremiumModalProvider>
  );
}
