'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';

interface HeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ setMobileMenuOpen }: HeaderProps) {
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Route'a göre dinamik başlık
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.includes('/firmalar/yeni')) return 'Yeni Firma Ekle';
    if (pathname.includes('/firmalar') && !pathname.includes('firmalarimiz')) return 'Firmalar Yönetimi';
    if (pathname.includes('/firmalarimiz')) return 'Firmalarımız / Mali Yapımız';
    if (pathname.includes('/sozlesmeler')) return 'Sözleşmeler';
    if (pathname.includes('/premium-talepler')) return 'Premium Talepler';
    if (pathname.includes('/uzman-analiz')) return 'Uzman Analiz Talepleri';
    if (pathname.includes('/loglar')) return 'İşlem Logları';
    if (pathname.includes('/finansal-rapor')) return 'Finansal Rapor Detayı';
    return 'Pro Sicht Admin';
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-20 w-full items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#131b2e]/30 backdrop-blur-3xl px-3 sm:px-4 md:px-8 shadow-sm transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Sadece Mobilde Görünür Hamburger Menü */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold md:text-xl text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="text-slate-600 dark:text-slate-300 rounded-full"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Temayı Değiştir</span>
        </Button>

        {/* Bildirimler */}
        <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-950" />
        </Button>

        {/* Kullanıcı Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2 hover:bg-transparent" />}>
            <Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
              <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">Admin Kullanıcı</p>
                  <p className="text-xs leading-none text-slate-500 dark:text-slate-400">admin@prosicht.com</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400 font-medium">
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
