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
  firma_onay: { icon: CheckCircle2, renk: 'text-emerald-600', bg: 'bg-emerald-100' },
  premium_onay: { icon: CheckCircle2, renk: 'text-emerald-600', bg: 'bg-emerald-100' },
  premium_red: { icon: XCircle, renk: 'text-red-500', bg: 'bg-red-100' },
  vade_yaklasan: { icon: AlertTriangle, renk: 'text-amber-600', bg: 'bg-amber-100' },
  vade_gecti: { icon: Clock, renk: 'text-red-600', bg: 'bg-red-100' },
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
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-teal-700" />}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-bold text-sm">Bildirimler</h4>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:underline font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Liste */}
        <div className="max-h-[400px] overflow-y-auto">
          {bildirimler.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Bildirim bulunmuyor.</div>
          ) : (
            bildirimler.map(b => {
              const cfg = TIP_CONFIG[b.tip];
              return (
                <button
                  key={b.id}
                  onClick={() => handleClick(b)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b last:border-b-0",
                    !b.okundu && "bg-teal-50/50 dark:bg-teal-900/10"
                  )}
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg)}>
                    <cfg.icon className={cn("w-4 h-4", cfg.renk)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm leading-snug", !b.okundu ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                      {b.mesaj}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(b.tarih)}</p>
                  </div>
                  {!b.okundu && <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-2" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
