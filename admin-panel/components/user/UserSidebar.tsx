'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Building2, LayoutDashboard, FileBarChart, TrendingUp, Scale,
  User, Crown, Lock, LogOut, Sparkles, BrainCircuit, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

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
  { icon: BrainCircuit, label: 'AI Analiz', locked: true },
  { icon: Sparkles, label: 'Uzman Görüşü', locked: true },
];

const MENU_HESAP = [
  { icon: User, label: 'Profilim', href: '/user/profil' },
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [premiumOpen, setPremiumOpen] = useState(false);

  const firmaAdi = 'TechNova Yazılım A.Ş.'; // API'den gelecek

  const handleLogout = () => {
    document.cookie = "fintech_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  const NavLink = ({ item }: { item: { icon: any; label: string; href: string } }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
          isActive
            ? "bg-teal-500/20 text-white border border-teal-400/30 shadow-[0_0_15px_rgba(20,184,166,0.08)]"
            : "text-teal-100/60 hover:bg-white/5 hover:text-teal-100 border border-transparent"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-teal-400" : "text-teal-400/40 group-hover:text-teal-300")} />
        {item.label}
      </Link>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen w-[260px] bg-[#0f4c3a] text-white flex flex-col fixed left-0 top-0 border-r border-[#0a3528] z-40 hidden md:flex shadow-2xl">

        {/* LOGO */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/10 p-2 rounded-xl border border-white/20">
              <Building2 className="h-5 w-5 text-teal-300" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block leading-tight">Pro Sicht</span>
              <span className="text-[11px] text-teal-200/50 font-medium tracking-wider uppercase">Müşteri Paneli</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
            <p className="text-xs text-teal-200/40 font-medium">Firma</p>
            <p className="text-sm font-semibold text-teal-100 truncate">{firmaAdi}</p>
          </div>
        </div>

        {/* NAVİGASYON */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6 custom-scrollbar">

          {/* Genel */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-teal-200/30 uppercase tracking-[0.15em] mb-2 px-2">Genel</div>
            {MENU_GENEL.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          {/* Firmam */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-teal-200/30 uppercase tracking-[0.15em] mb-2 px-2">Firmam</div>
            {MENU_FIRMAM.map(item => <NavLink key={item.href} item={item} />)}
          </div>

          {/* Premium (Kilitli) */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-amber-400/50 uppercase tracking-[0.15em] mb-2 px-2 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Premium
            </div>
            {MENU_PREMIUM_LOCKED.map(item => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPremiumOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-100/30 hover:bg-white/5 hover:text-teal-100/50 transition-all border border-transparent cursor-pointer"
                  >
                    <item.icon className="h-[18px] w-[18px] text-teal-400/20" />
                    {item.label}
                    <Lock className="h-3.5 w-3.5 ml-auto text-amber-400/50" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 text-white border-slate-800">
                  <p className="text-xs">Premium özellik — Talep oluşturun</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Hesap */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-teal-200/30 uppercase tracking-[0.15em] mb-2 px-2">Hesap</div>
            {MENU_HESAP.map(item => <NavLink key={item.href} item={item} />)}
            <button
              onClick={() => setPremiumOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300 transition-all border border-amber-400/10"
            >
              <Crown className="h-[18px] w-[18px] text-amber-400/60" />
              Premium Paketler
            </button>
          </div>
        </div>

        {/* FOOTER - Kullanıcı */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-teal-600/40 flex items-center justify-center border border-teal-500/30 text-sm font-bold text-teal-200">
              AY
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-teal-100 truncate">Ahmet Yılmaz</p>
              <p className="text-[11px] text-teal-200/40 truncate">ahmet@technova.com</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-500/20 text-teal-200/40 hover:text-red-400 transition-colors" title="Çıkış Yap">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PREMİUM MODAL */}
      <Dialog open={premiumOpen} onOpenChange={setPremiumOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /> Premium Paketler</DialogTitle>
            <DialogDescription>Firmanıza en uygun paketi seçin ve talebi gönderin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[
              { ad: 'Temel Analiz', fiyat: '₺2,500 /ay', ozellikler: ['AI Analiz Raporu', 'Grafik Çıktıları'], renk: 'border-blue-200 bg-blue-50/50' },
              { ad: 'Uzman Görüşü', fiyat: '₺5,000 /ay', ozellikler: ['Uzman Yorumu', 'Risk Değerlendirmesi', 'Öneriler'], renk: 'border-purple-200 bg-purple-50/50' },
              { ad: 'Premium Bundle', fiyat: '₺7,500 /ay', ozellikler: ['Tüm AI Özellikler', 'Uzman Görüşü', 'Ön Sunum .pptx'], renk: 'border-amber-300 bg-amber-50/50' },
            ].map(p => (
              <div key={p.ad} className={`p-4 rounded-xl border-2 ${p.renk} flex items-center justify-between`}>
                <div>
                  <h4 className="font-bold">{p.ad}</h4>
                  <ul className="text-xs text-slate-500 mt-1 space-y-0.5">
                    {p.ozellikler.map(o => (
                      <li key={o} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/>{o}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{p.fiyat}</p>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">Talep Et</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
