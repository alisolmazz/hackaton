'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, LayoutDashboard, FileBarChart, TrendingUp, Scale,
  User, Crown, Lock, LogOut, Sparkles, BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePremiumModal } from '@/context/PremiumModalContext';
import { getCurrentUser, logout } from '@/lib/auth';
import { getPremiumHesapDurumu } from '@/lib/api';
import type { User as AppUser } from '@/types';

const MENU_GENEL = [
  { icon: LayoutDashboard, label: 'Ana Sayfa', href: '/user/dashboard' },
];

const MENU_FIRMAM = [
  { icon: Building2, label: 'Firma Bilgilerim', href: '/user/firma-bilgileri' },
  { icon: FileBarChart, label: 'Finansal Raporum', href: '/user/finansal-rapor' },
  { icon: TrendingUp, label: 'Nakit Akışım', href: '/user/nakit-akis' },
  { icon: Scale, label: 'Borç / Alacak', href: '/user/borc-alacak' },
];

const MENU_PREMIUM_LOCKED = [
  { icon: BrainCircuit, label: 'AI Analiz', href: '/user/finansal-rapor' },
  { icon: Sparkles, label: 'Uzman Görüşü', href: '/user/finansal-rapor' },
];

const MENU_HESAP = [
  { icon: User, label: 'Profilim', href: '/user/profil' },
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = usePremiumModal();
  const [hasPremium, setHasPremium] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  const firmaAdi = user?.firmaAdi || 'Yeni şirket';

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const loadPremium = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setUser(await getCurrentUser());
    };

    loadPremium();
    window.addEventListener('premium-data-changed', loadPremium);
    return () => window.removeEventListener('premium-data-changed', loadPremium);
  }, []);

  const NavLink = ({ item }: { item: { icon: any; label: string; href: string } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group relative overflow-hidden",
          isActive
            ? "bg-slate-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm border border-slate-200/50 dark:border-indigo-500/20"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-transparent"
        )}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
        )}
        <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500")} />
        {item.label}
      </Link>
    );
  };

  return (
    <TooltipProvider delay={200}>
      <div className="h-screen w-[280px] bg-white dark:bg-[#0d1425]/90 backdrop-blur-2xl flex flex-col fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 z-40 hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-300">

        {/* LOGO */}
        <div className="px-6 pt-8 pb-6 border-b border-slate-100 dark:border-white/5 shrink-0 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 border border-white/10 shrink-0">
              P
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight block leading-tight text-slate-900 dark:text-white">Pro Sicht</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">Müşteri Paneli</span>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-[#131b2e] rounded-xl p-3 border border-slate-200/60 dark:border-white/5 flex items-center gap-3 shadow-inner">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Firma</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{firmaAdi}</p>
            </div>
          </div>
        </div>

        {/* NAVİGASYON */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">

          {/* Genel */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">Genel</div>
            {MENU_GENEL.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          {/* Firmam */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">Firmam</div>
            {MENU_FIRMAM.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          {/* Premium (Kilitli) */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-amber-500/80 dark:text-amber-500/60 uppercase tracking-wider mb-3 px-4 flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> Premium
            </div>
            {MENU_PREMIUM_LOCKED.map(item => (
              <Tooltip key={item.label}>
                <TooltipTrigger render={<button onClick={() => hasPremium ? router.push(item.href) : openModal()} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent cursor-pointer group", hasPremium ? "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-400")} />}>
                  <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", hasPremium ? "text-amber-500" : "text-slate-300 dark:text-slate-600")} />
                  {item.label}
                  {hasPremium ? <Crown className="h-4 w-4 ml-auto text-amber-500" /> : <Lock className="h-4 w-4 ml-auto text-slate-300 dark:text-slate-600" />}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800">
                  <p className="text-xs font-medium">{hasPremium ? 'Premium aktif' : 'Premium özellik - Yükseltin'}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Hesap */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-4">Hesap</div>
            {MENU_HESAP.map(item => <NavLink key={item.href} item={item} />)}
            <button
              onClick={() => openModal()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all border border-amber-200 dark:border-amber-500/20 group"
            >
              <Crown className="h-5 w-5 text-amber-500 transition-transform group-hover:scale-110" />
              Paketi Yükselt
            </button>
          </div>
        </div>

        {/* FOOTER - Kullanıcı */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-transparent">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/30 text-sm font-bold text-indigo-700 dark:text-indigo-400 shrink-0 shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Kullanıcı'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Çıkış Yap">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
