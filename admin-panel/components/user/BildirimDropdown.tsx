'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCircle2, XCircle, AlertTriangle, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications, Bildirim } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

function timeAgo(dateStr: string): string {
  if (!dateStr) return 'Az önce';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

const TIP_CONFIG: Record<Bildirim['tip'], { icon: any; renk: string; bg: string }> = {
  firma_onay: { icon: CheckCircle2, renk: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  premium_onay: { icon: CheckCircle2, renk: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  premium_red: { icon: XCircle, renk: 'text-red-500', bg: 'bg-red-500/10' },
  vade_yaklasan: { icon: AlertTriangle, renk: 'text-amber-600', bg: 'bg-amber-500/10' },
  vade_gecti: { icon: Clock, renk: 'text-rose-600', bg: 'bg-rose-500/10' },
};

export function BildirimDropdown() {
  const router = useRouter();
  const { data, markAsRead, markAllAsRead } = useNotifications();
  const unreadCount = data?.unreadCount ?? 0;
  const bildirimler = data?.all?.slice(0, 10) ?? [];

  const handleClick = (b: Bildirim) => {
    markAsRead(b.id);
    if (b.link) router.push(b.link);
  };

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="rounded-[14px] h-10 w-10 bg-slate-50 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200/50 dark:border-white/5 shadow-sm relative group" />}>
        <Bell className="h-[18px] w-[18px] group-hover:animate-wiggle" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-gradient-to-tr from-rose-500 to-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-[#131b2e] shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 rounded-[20px] border-slate-200/50 dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-white/95 dark:bg-[#0a0f1c]/95 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Bildirimler</h4>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1.5 transition-colors">
              <Check className="w-3.5 h-3.5" /> Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
          {bildirimler.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Şu an için yeni bildiriminiz yok.</p>
            </div>
          ) : (
            bildirimler.map(b => {
              const cfg = TIP_CONFIG[b.tip];
              return (
                <button
                  key={b.id}
                  onClick={() => handleClick(b)}
                  className={cn(
                    "w-full flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left border-b border-slate-100 dark:border-white/5 last:border-b-0 group",
                    !b.okundu && "bg-indigo-50/30 dark:bg-indigo-500/5"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                    <cfg.icon className={cn("w-4.5 h-4.5", cfg.renk)} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={cn("text-[13px] leading-relaxed", !b.okundu ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-400")}>
                      {b.mesaj}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(b.tarih)}
                    </p>
                  </div>
                  {!b.okundu && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 mt-2 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
