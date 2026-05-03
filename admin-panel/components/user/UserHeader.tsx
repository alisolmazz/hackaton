'use client';

import React from 'react';
import { Menu, Moon, Sun, Search, Sparkles, Building2, UserCircle, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BildirimDropdown } from '@/components/user/BildirimDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { logout } from '@/lib/auth';

const PAGE_TITLES: Record<string, string> = {
  '/user/dashboard': 'Kontrol Merkezi',
  '/user/firma-bilgileri': 'Kurumsal Profil',
  '/user/finansal-rapor': 'AI Analiz & Rapor',
  '/user/nakit-akis': 'Nakit Akış Yönetimi',
  '/user/borc-alacak': 'Cari Hesaplar',
  '/user/profil': 'Hesap Ayarları',
};

export function UserHeader({ setMobileMenuOpen }: { setMobileMenuOpen?: (open: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || 'Çalışma Alanı';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-30 pt-2 sm:pt-4 px-2 sm:px-4 md:px-8 bg-transparent transition-colors duration-300">
      <header className="h-[56px] sm:h-[72px] rounded-[16px] sm:rounded-[24px] border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-[#131b2e]/30 backdrop-blur-3xl px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-colors duration-300">
        
        {/* Sol: Hamburger + Search */}
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl" onClick={() => setMobileMenuOpen?.(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-[#0a0f1c]/50 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-white/5 text-slate-400 w-64 hover:w-72 transition-all cursor-text group shadow-inner">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span className="text-xs font-medium">Panoda ara...</span>
            <div className="ml-auto flex gap-1">
              <span className="text-[10px] bg-white dark:bg-white/5 px-1.5 py-0.5 rounded shadow-sm font-bold">Ctrl</span>
              <span className="text-[10px] bg-white dark:bg-white/5 px-1.5 py-0.5 rounded shadow-sm font-bold">K</span>
            </div>
          </div>
        </div>

        {/* Orta: Sayfa Başlığı (Mobile: sol tarafta, Desktop: ortada) */}
        <div className="hidden sm:flex items-center gap-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-[14px] sm:text-[17px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            {pageTitle}
          </h2>
        </div>

        {/* Sağ: Dark mode + Bildirim + Avatar */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 flex-1">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-[14px] h-8 w-8 sm:h-10 sm:w-10 bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/50 dark:border-white/5 shadow-sm"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>

          {/* Bildirimler */}
          <div className="h-8 w-8 sm:h-10 sm:w-10">
            <BildirimDropdown />
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-0.5 sm:mx-2 hidden sm:block"></div>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 border border-indigo-200/60 dark:border-indigo-500/30 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all flex items-center justify-center cursor-pointer group relative">
                <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-sm">AY</span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-[2.5px] border-white dark:border-[#131b2e] rounded-full shadow-sm"></div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-[20px] bg-white dark:bg-[#0a0f1c] border border-slate-100 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
              
              <DropdownMenuGroup className="p-3 mb-1 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <DropdownMenuLabel className="p-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      AY
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight">Ahmet Yılmaz</p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">ahmet@technova.com</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              
              <DropdownMenuGroup className="py-2 px-1">
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group" onClick={() => router.push('/user/profil')}>
                  <UserCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" /> Profil Ayarları
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group" onClick={() => router.push('/user/firma-bilgileri')}>
                  <Building2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" /> Firma Bilgilerim
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
              <div className="h-px bg-slate-100 dark:bg-white/5 mx-3 my-1"></div>
              
              <DropdownMenuItem className="rounded-xl px-3 py-2.5 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mx-1 mt-1" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
