import React from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { UserHeader } from '@/components/user/UserHeader';
import { PremiumModalProvider } from '@/context/PremiumModalContext';
import { PremiumModal } from '@/components/user/PremiumModal';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <PremiumModalProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#090b10] flex">
        <UserSidebar />
        <div className="flex-1 flex flex-col md:pl-[260px]">
          <UserHeader />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
      <PremiumModal />
    </PremiumModalProvider>
  );
}
