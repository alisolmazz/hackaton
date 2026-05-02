'use client';

import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BildirimDropdown } from '@/components/user/BildirimDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

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

  const pageTitle = PAGE_TITLES[pathname] || 'Müşteri Paneli';

  const handleLogout = () => {
    document.cookie = "fintech_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm">
      
      {/* Sol: Hamburger (mobil) + Sayfa Başlığı */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{pageTitle}</h2>
      </div>

      {/* Sağ: Dark mode + Bildirim + Avatar */}
      <div className="flex items-center gap-2">

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-teal-700"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Bildirimler */}
        <BildirimDropdown />

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-900/50 hover:bg-teal-200 dark:hover:bg-teal-800/50 ml-1">
              <span className="font-bold text-teal-800 dark:text-teal-200 text-sm">AY</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Ahmet Yılmaz</p>
                <p className="text-xs leading-none text-muted-foreground">ahmet@technova.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/user/profil')}>Profil Ayarları</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/user/firma-bilgileri')}>Firma Bilgilerim</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">Çıkış Yap</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
