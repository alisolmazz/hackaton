import React from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { UserHeader } from '@/components/user/UserHeader';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090b10] flex">
      <UserSidebar />
      <div className="flex-1 flex flex-col md:pl-[260px]">
        <UserHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
