'use client';

import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
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
  '/user/dashboard': 'Ana Sayfa',
  '/user/firma-bilgileri': 'Firma Bilgileri',
  '/user/finansal-rapor': 'Finansal Raporlar',
  '/user/nakit-akis': 'Nakit Akışı',
  '/user/borc-alacak': 'Borç / Alacak',
  '/user/profil': 'Profil Ayarları',
};

export function UserHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = PAGE_TITLES[pathname] || 'Müşteri Paneli';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-[72px] border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-[#0a0f1c]/60 backdrop-blur-2xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.02)] transition-colors duration-300">
      
      {/* Sol: Hamburger (mobil) + Sayfa Başlığı */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{pageTitle}</h2>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-wider uppercase hidden sm:block">Pro Sicht Workspace</p>
        </div>
      </div>

      {/* Sağ: Dark mode + Bildirim + Avatar */}
      <div className="flex items-center gap-3">

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Bildirimler */}
        <div className="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
          <BildirimDropdown />
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-600/30 border border-indigo-200/50 dark:border-indigo-500/30 hover:shadow-md transition-all flex items-center justify-center cursor-pointer group">
              <span className="font-bold text-indigo-700 dark:text-indigo-400 text-sm group-hover:scale-110 transition-transform">AY</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0a0f1c] rounded-full"></div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl bg-white dark:bg-[#131b2e] border-slate-200/50 dark:border-white/10 shadow-xl">
            <DropdownMenuGroup className="p-2 mb-1">
              <DropdownMenuLabel className="p-0">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Ahmet Yılmaz</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-none mt-1">ahmet@technova.com</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
            <DropdownMenuGroup className="py-1">
              <DropdownMenuItem className="rounded-xl focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => router.push('/user/profil')}>
                Profil Ayarları
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl focus:bg-slate-50 dark:focus:bg-white/5 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300" onClick={() => router.push('/user/firma-bilgileri')}>
                Firma Bilgilerim
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
            <DropdownMenuItem className="rounded-xl focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer text-sm font-bold text-red-600 dark:text-red-400 mt-1" onClick={handleLogout}>
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
