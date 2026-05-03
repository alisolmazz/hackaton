'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Crown, FileBarChart, Sparkles, TrendingUp, ChevronRight, Zap } from 'lucide-react';

import { OnayBekleniyor } from '@/components/user/OnayBekleniyor';
import { Button } from '@/components/ui/button';
import { getPremiumHesapDurumu } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';

const MODULLER = [
  { 
    id: 'rapor',
    label: 'Finansal Raporlar', 
    desc: 'Gelir, gider ve borç tablolarınızı yapay zeka ile analiz edin.',
    href: '/user/finansal-rapor', 
    icon: FileBarChart, 
    bg: 'from-emerald-400 to-teal-600',
    shadow: 'shadow-teal-500/30',
    badge: 'Yapay Zeka'
  },
  { 
    id: 'nakit',
    label: 'Nakit Akışı', 
    desc: 'Gelecek ödemelerinizi ve nakit pozisyonunuzu kontrol altında tutun.',
    href: '/user/nakit-akis', 
    icon: TrendingUp, 
    bg: 'from-blue-500 to-indigo-600',
    shadow: 'shadow-blue-500/30',
    badge: 'Canlı Veri'
  },
  { 
    id: 'firma',
    label: 'Firma Bilgileri', 
    desc: 'Şirketinizin resmi bilgilerini ve kurumsal profilini güncelleyin.',
    href: '/user/firma-bilgileri', 
    icon: Building2, 
    bg: 'from-purple-500 to-fuchsia-600',
    shadow: 'shadow-purple-500/30',
    badge: 'Sözleşme'
  },
];

export default function UserDashboard() {
  const [firmaOnaylandi] = useState(true);
  const [hasPremium, setHasPremium] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadState = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setUser(await getCurrentUser());
    };
    loadState();
    window.addEventListener('premium-data-changed', loadState);
    return () => {
      window.removeEventListener('premium-data-changed', loadState);
    };
  }, []);

  if (!firmaOnaylandi) return <OnayBekleniyor />;

  return (
    <div className="space-y-8 sm:space-y-12 max-w-[1400px] mx-auto pb-12 pt-2 sm:pt-4 px-0">
      
      {/* 🌟 HERO SECTION (Premium Workspace) */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0a0f1c] dark:via-[#131b2e] dark:to-[#0a0f1c] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl transition-colors duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[150px] -mr-[200px] -mt-[200px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-[120px] -ml-[100px] -mb-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 px-5 py-12 sm:px-8 sm:py-20 md:px-16 md:py-28 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 text-indigo-700 dark:text-white text-[10px] sm:text-[11px] font-black tracking-widest uppercase mb-4 sm:mb-8 backdrop-blur-md shadow-inner shadow-indigo-500/5 dark:shadow-white/5">
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-200 dark:to-white">Pro Sicht Workspace'e Hoş Geldiniz</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 sm:mb-6">
              Finansal Geleceğiniz <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 dark:from-indigo-400 dark:via-purple-400 dark:to-fuchsia-400">Tek Bir Yerde.</span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300/80 font-medium leading-relaxed mb-6 sm:mb-10 max-w-xl">
              <strong className="text-slate-900 dark:text-white">{user?.firmaAdi || 'Şirketiniz'}</strong> için özel olarak hazırlanmış yapay zeka destekli raporlara, analizlere ve özet verilere anında erişin.
            </p>
            <div className="flex items-center gap-4">
              <Button className="rounded-[16px] bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-extrabold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base shadow-lg hover:shadow-xl dark:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 transition-all duration-300 border-0 group w-full sm:w-auto">
                Keşfetmeye Başla <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center relative w-[350px] h-[350px]">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 blur-[100px] rounded-full animate-pulse duration-[5000ms]"></div>
             <div className="w-64 h-64 bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center relative z-10 shadow-2xl dark:shadow-2xl">
               <img src="/logo.png" alt="Pro Sicht" className="w-40 h-40 object-contain drop-shadow-xl dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform duration-700 rounded-[32px]" />
             </div>
          </div>
        </div>
      </div>

      {/* 🌟 MODULE NAVIGATION (Premium Cards) */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Hızlı Erişim Modülleri</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sık kullanılan finansal araçlarınız</p>
          </div>
          <Button variant="ghost" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl">
            Tümünü İncele <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          {MODULLER.map((modul) => (
            <Link key={modul.id} href={modul.href}>
              <div className="group relative rounded-[2.5rem] p-5 sm:p-8 bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer h-full flex flex-col">
                
                {/* Background Glow on Hover */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${modul.bg} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-3xl transition-opacity duration-700 rounded-full`}></div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center bg-gradient-to-br ${modul.bg} shadow-lg ${modul.shadow} group-hover:scale-110 transition-transform duration-500`}>
                      <modul.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded-full">
                      {modul.badge}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                    {modul.label}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">
                    {modul.desc}
                  </p>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Modüle Git</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 🌟 PREMIUM UPSELL BANNER */}
      {!hasPremium && (
        <div className="rounded-[32px] border border-amber-500/20 bg-gradient-to-br from-[#0a0f1c] to-[#131b2e] p-[1px] shadow-2xl shadow-amber-500/10 relative overflow-hidden group mt-16">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen transition-transform duration-1000 group-hover:scale-110"></div>
          
          <div className="rounded-[31px] bg-gradient-to-r from-[#0a0f1c]/90 to-[#0a0f1c]/60 backdrop-blur-2xl px-5 py-10 sm:px-8 sm:py-16 md:px-16 md:py-20 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 text-center lg:text-left flex-1">
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shrink-0 shadow-[0_0_50px_rgba(245,158,11,0.4)] group-hover:rotate-12 transition-transform duration-500 border border-white/20">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Sınırlı Süreli Fırsat</span>
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-4">Mali Müşaviriniz Yapay Zeka Olsun</h3>
                <p className="text-slate-300/80 font-medium max-w-2xl text-base md:text-lg leading-relaxed">
                  Pro Sicht Premium ile finansal tablolarınız saniyeler içinde analiz edilir. Sektörel karşılaştırmalar, akıllı nakit akış tahminleri ve uzman raporlarına anında erişin.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
              <Button className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold px-10 h-16 text-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] shrink-0 transition-all hover:scale-105 active:scale-95 border-0 w-full sm:w-auto">
                <Crown className="w-6 h-6 mr-3" /> Premium'u Keşfet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
