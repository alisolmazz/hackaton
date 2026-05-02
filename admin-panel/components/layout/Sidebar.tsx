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
  LogOut
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
        { title: 'Firmalarımız / Mali Yapımız', href: '/firmalarimiz', icon: Briefcase },
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
    <div className="flex flex-col h-full bg-[#1a2f5e] dark:bg-[#0f172a] text-white shadow-xl">
      {/* Logo Alanı */}
      <div className="flex items-center h-16 px-6 bg-[#13234b] dark:bg-[#0b1120] shrink-0 border-b border-white/5">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-black shadow-inner shadow-white/20">
            P
          </div>
          <span className="text-white">Pro Sicht</span>
        </div>
      </div>
      <div className="px-6 py-3 text-xs font-semibold text-blue-300/80 uppercase tracking-wider bg-[#13234b] dark:bg-[#0b1120]">
        Admin Panel
      </div>

      {/* Navigasyon Linkleri */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-semibold text-blue-300/60 uppercase tracking-widest mb-3">
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group",
                      isActive 
                        ? "bg-blue-600/90 text-white shadow-md shadow-blue-900/20" 
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                    <span>{item.title}</span>
                    {item.badge ? (
                      <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-900/50">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Kullanıcı Alanı */}
      <div className="p-4 bg-[#13234b] dark:bg-[#0b1120] mt-auto border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email || 'admin@prosicht.com'}</p>
            <p className="text-xs text-blue-300/70 capitalize">{user?.role || 'Admin'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
            title="Çıkış Yap"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
