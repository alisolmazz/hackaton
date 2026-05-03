'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  Briefcase, 
  FileText, 
  Crown,
  UserCheck,
  ClipboardList,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrentUser, logout } from '@/lib/auth';
import { User } from '@/types';
import { getPremiumTalepler, getUzmanAnalizTalepleri } from '@/lib/api';

interface SidebarProps {
  mobile?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobile, setMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  
  const [pendingPremiumRequests, setPendingPremiumRequests] = useState(0);
  const [pendingExpertRequests, setPendingExpertRequests] = useState(0);

  useEffect(() => {
    getCurrentUser().then(userData => {
      setUser(userData);
    });

    const loadPendingPremiumRequests = async () => {
      const response = await getPremiumTalepler();
      setPendingPremiumRequests(response.data.filter(talep => talep.durum === 'bekliyor').length);
      const uzmanTalepleri = await getUzmanAnalizTalepleri();
      setPendingExpertRequests(uzmanTalepleri.filter(talep => talep.durum === 'bekliyor').length);
    };

    loadPendingPremiumRequests();
    window.addEventListener('premium-data-changed', loadPendingPremiumRequests);
    return () => window.removeEventListener('premium-data-changed', loadPendingPremiumRequests);
  }, []);

  const handleNavClick = () => {
    if (mobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const navGroups = [
    {
      label: 'Genel',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Firmalar',
      items: [
        { title: 'Firmalar', href: '/firmalar', icon: Building2 },
        { title: 'Yeni Firma Ekle', href: '/firmalar/yeni', icon: PlusCircle },
      ]
    },
    {
      label: 'Mali Yapı',
      items: [
        { title: 'Firmalarımız / Mali Yapı', href: '/firmalarimiz', icon: Briefcase },
        { title: 'Sözleşmeler', href: '/sozlesmeler', icon: FileText },
        { title: 'Premium Talepler', href: '/premium-talepler', icon: Crown, badge: pendingPremiumRequests },
        { title: 'Uzman Analiz', href: '/uzman-analiz', icon: UserCheck, badge: pendingExpertRequests },
      ]
    },
    {
      label: 'Sistem',
      items: [
        { title: 'İşlem Logları', href: '/loglar', icon: ClipboardList },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0a0f1c]/40 backdrop-blur-3xl text-slate-900 dark:text-white shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-slate-200/50 dark:border-white/5 relative z-50 transition-colors duration-300">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
      
      {/* Logo Alanı */}
      <div className="flex flex-col gap-4 px-6 pt-8 pb-6 border-b border-slate-200/50 dark:border-white/5 relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full"></div>
            <img src="/logo.png" alt="Pro Sicht Logo" className="w-12 h-12 object-contain drop-shadow-xl relative z-10 rounded-2xl" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight block leading-tight">Pro Sicht</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest bg-blue-100 dark:bg-blue-500/10 px-2 py-0.5 rounded-sm">
              Admin Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigasyon Linkleri */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar relative z-10">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-[16px] transition-all duration-300 text-[13px] font-bold group relative overflow-hidden",
                      isActive 
                        ? "bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.05)] dark:shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500")} />
                      <span>{item.title}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.badge ? (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)] animate-pulse">
                          {item.badge}
                        </span>
                      ) : null}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-blue-500/50" />
                      )}
                    </div>

                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Alanı */}
      <div className="p-4 mt-auto border-t border-slate-200/50 dark:border-white/5 bg-slate-100 dark:bg-black/20 backdrop-blur-md relative z-10 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-[16px] hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-inner shadow-white/20 border border-white/10 group-hover:scale-105 transition-transform">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{user?.email || 'admin@prosicht.com'}</p>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{user?.role || 'Admin'}</p>
          </div>
          <button 
            onClick={logout}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
