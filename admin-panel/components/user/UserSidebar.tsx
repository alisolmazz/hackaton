'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, LayoutDashboard, FileBarChart, TrendingUp, Scale,
  User, Crown, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePremiumModal } from '@/context/PremiumModalContext';
import { getCurrentUser, logout } from '@/lib/auth';
import { getPremiumHesapDurumu } from '@/lib/api';
import type { User as AppUser } from '@/types';

const MENU_GENEL = [
  { icon: LayoutDashboard, label: 'Ana Sayfa', href: '/user/dashboard' },
];

const MENU_FIRMAM = [
  { icon: Building2, label: 'Kurumsal Profil', href: '/user/firma-bilgileri' },
  { icon: FileBarChart, label: 'Finansal Raporum', href: '/user/finansal-rapor' },
  { icon: TrendingUp, label: 'Nakit Akışım', href: '/user/nakit-akis' },
  { icon: Scale, label: 'Cari Hesaplar', href: '/user/borc-alacak' },
];

const MENU_HESAP = [
  { icon: User, label: 'Ayarlar', href: '/user/profil' },
];

export function UserSidebar({ mobile, setMobileMenuOpen }: { mobile?: boolean; setMobileMenuOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  const { openModal } = usePremiumModal();
  const [user, setUser] = useState<AppUser | null>(null);
  const [hasPremium, setHasPremium] = useState(false);

  const firmaAdi = user?.firmaAdi || 'Şirketiniz';

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const loadData = async () => {
      setUser(await getCurrentUser());
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
    };
    loadData();
    const handler = () => {
      getPremiumHesapDurumu().then(d => setHasPremium(d.hasPremium));
    };
    window.addEventListener('premium-data-changed', handler);
    return () => window.removeEventListener('premium-data-changed', handler);
  }, []);

  const NavLink = ({ item }: { item: { icon: any; label: string; href: string } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setMobileMenuOpen?.(false)}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-[16px] transition-all duration-300 text-[14px] font-bold group relative overflow-hidden",
          isActive
            ? "bg-white dark:bg-[#131b2e] text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/5 dark:shadow-none border border-slate-200/60 dark:border-white/10"
            : "text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent hover:shadow-sm"
        )}
      >
        <div className="flex items-center gap-3 relative z-10">
          <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500")} />
          {item.label}
        </div>
        {isActive && (
          <ChevronRight className="w-4 h-4 text-indigo-500/50" />
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <TooltipProvider delay={200}>
      <div className={cn(
        "h-screen w-[280px] bg-white/80 dark:bg-[#0a0f1c]/40 backdrop-blur-3xl flex flex-col border-r border-slate-200/50 dark:border-white/5 z-40 transition-colors duration-300",
        mobile ? "relative" : "fixed left-0 top-0 hidden md:flex"
      )}>

        {/* LOGO */}
        <div className="px-6 pt-8 pb-6 border-b border-slate-200/50 dark:border-white/5 shrink-0 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 rounded-full"></div>
              <img src="/logo.png" alt="Pro Sicht Logo" className="w-12 h-12 object-contain drop-shadow-xl relative z-10 rounded-2xl" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight block leading-tight text-slate-900 dark:text-white">Pro Sicht</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em]">WORKSPACE</span>
            </div>
          </div>
          
          <div className="bg-slate-100 dark:bg-white/5 rounded-[16px] p-4 flex items-center gap-4 border border-slate-200/60 dark:border-white/10 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">Aktif Firma</p>
              <p className="text-[14px] font-extrabold text-slate-900 dark:text-white truncate">{firmaAdi}</p>
            </div>
          </div>
        </div>

        {/* NAVİGASYON */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Genel</div>
            {MENU_GENEL.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Finansal Modüller</div>
            {MENU_FIRMAM.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">Kişisel</div>
            {MENU_HESAP.map(item => <NavLink key={item.href} item={item} />)}
            
            {hasPremium ? (
              <div className="w-full mt-4 rounded-[16px] p-[1px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 rounded-[16px] opacity-30 dark:opacity-50"></div>
                <div className="relative bg-white dark:bg-[#0a0f1c] w-full h-full rounded-[15px] px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Premium Aktif</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openModal()}
                className="w-full mt-4 relative group overflow-hidden rounded-[16px] p-[1px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-[16px] opacity-40 dark:opacity-70 group-hover:opacity-100 transition-opacity duration-300 bg-[length:200%_auto] group-hover:animate-gradient-x"></div>
                <div className="relative bg-white dark:bg-[#0a0f1c] w-full h-full rounded-[15px] px-4 py-3 flex items-center justify-between transition-colors group-hover:bg-amber-50/80 dark:group-hover:bg-amber-500/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Crown className="h-5 w-5 text-amber-500 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">Premium'a Geç</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 mt-auto border-t border-slate-200 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-[16px] bg-slate-50 dark:bg-black/20 border border-slate-200/50 dark:border-white/5 shadow-sm">
            <div className="w-10 h-10 rounded-[12px] bg-slate-200 dark:bg-[#131b2e] flex items-center justify-center border border-slate-300 dark:border-white/5 shrink-0">
              <span className="font-extrabold text-slate-700 dark:text-slate-400">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Kullanıcı'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 truncate">{user?.email || 'kullanici@firma.com'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
