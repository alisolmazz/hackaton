'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FileCheck, Clock, TrendingUp, Sparkles, ChevronRight, Activity, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getFirmalar, getLogs, getPremiumTalepler } from '@/lib/api';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const { theme } = useTheme();
  const { data: firmalar, isLoading: isLoadingFirmalar } = useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => (await getFirmalar()).data || [],
  });

  const { data: logs, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => (await getLogs()).data || [],
  });

  const { data: talepler, isLoading: isLoadingTalepler } = useQuery({
    queryKey: ['talepler'],
    queryFn: async () => (await getPremiumTalepler()).data || [],
  });

  const isLoading = isLoadingFirmalar || isLoadingLogs || isLoadingTalepler;

  const chartData = [
    { name: 'Kas', gelir: 30000, gider: 13980 },
    { name: 'Ara', gelir: 45000, gider: 21000 },
    { name: 'Oca', gelir: 52000, gider: 19000 },
    { name: 'Şub', gelir: 48900, gider: 24800 },
    { name: 'Mar', gelir: 63900, gider: 32800 },
    { name: 'Nis', gelir: 72000, gider: 38000 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[140px] w-full rounded-[24px]" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="col-span-4 h-[420px] rounded-[24px]" />
          <Skeleton className="col-span-3 h-[420px] rounded-[24px]" />
        </div>
        <Skeleton className="h-[200px] w-full rounded-[24px]" />
      </div>
    );
  }

  const aktifFirmalar = firmalar?.filter(f => f.onaylandi) || [];
  const bekleyenTalepler = talepler?.filter(t => t.durum === 'bekliyor') || [];
  const buAykiTahsilat = 1250000;
  
  const sonLoglar = logs?.slice(0, 5) || [];
  const sonFirmalar = firmalar?.slice(0, 5) || [];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Genel Bakış</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sistem Metrikleri & Finansal Durum</p>
                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Canlı
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. ÜST SATIR: Özet Kartlar */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        
        {/* Toplam Firma */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden group">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Toplam Firma</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{firmalar?.length || 0}</div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 text-blue-600 dark:text-blue-400">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-emerald-500 font-bold">+12</span> bu ay
            </div>
          </CardContent>
        </Card>

        {/* Aktif Sözleşme */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden group">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Aktif Sözleşme</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{aktifFirmalar.length}</div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-emerald-500 font-bold">%{(aktifFirmalar.length / Math.max((firmalar?.length || 1), 1) * 100).toFixed(0)}</span> dönüşüm
            </div>
          </CardContent>
        </Card>

        {/* Bekleyen Talep */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden group relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Bekleyen Talep</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{bekleyenTalepler.length}</div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 text-orange-600 dark:text-orange-400 relative">
                {bekleyenTalepler.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-[#131b2e]"></span>}
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              İşlem bekleyen premium talepler
            </div>
          </CardContent>
        </Card>

        {/* Bu Ayki Tahsilat */}
        <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden group">
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Aylık Tahsilat</p>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 tracking-tight">₺{(buAykiTahsilat/1e6).toFixed(2)}M</div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
              Toplam gerçekleşen
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. ORTA BÖLÜM: Grafikler ve Loglar */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
        
        {/* Sol Kolon: Grafik (60%) */}
        <Card className="md:col-span-4 border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 px-6 pt-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> Platform Gelir/Gider Dengesi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 h-[380px] px-2 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGelirAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="colorGiderAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontWeight: 600 }} tickFormatter={(value) => `₺${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}} 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '16px', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                <Bar dataKey="gelir" name="Gelir" fill="url(#colorGelirAdmin)" radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="gider" name="Gider" fill="url(#colorGiderAdmin)" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sağ Kolon: Aktiviteler (40%) */}
        <Card className="md:col-span-3 border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 px-6 pt-6 shrink-0 bg-slate-50/50 dark:bg-white/5">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              Son Sistem Logları
              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none shadow-none text-xs">Canlı</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {sonLoglar.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {sonLoglar.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                      {String(log.islem_turu) === 'insert' ? <PlusCircle className="w-5 h-5 text-emerald-500" /> : 
                       String(log.islem_turu) === 'update' ? <TrendingUp className="w-5 h-5 text-blue-500" /> : 
                       <Clock className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {log.islem_turu.toUpperCase()} İşlemi
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        Tablo: <span className="text-blue-600 dark:text-blue-400 font-bold">{log.tablo_adi}</span>
                      </p>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md shrink-0">
                      {format(new Date(log.created_at), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8">
                <EmptyState title="Henüz aktivite bulunmuyor" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. ALT BÖLÜM: Son Eklenen Firmalar */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">En Son Eklenen Firmalar</h3>
          <Link href="/firmalar" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
            Tümünü Gör <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="flex overflow-x-auto pb-6 gap-6 custom-scrollbar px-2">
          {sonFirmalar.length > 0 ? (
            sonFirmalar.map((firma) => (
              <Link key={firma.id} href={`/firmalar/${firma.id}`} className="min-w-[280px] sm:min-w-[340px] max-w-[340px] group">
                <Card className="border border-slate-200 dark:border-none bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-xl dark:shadow-2xl rounded-[2.5rem] overflow-hidden h-full border-t-[6px] dark:border-t-[6px] border-t-blue-500 dark:border-t-blue-500 hover:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="pb-4 pt-6 px-6">
                    <CardTitle className="text-lg font-bold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={firma.unvan}>{firma.unvan}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Vergi No</span>
                        <span className="font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-md">{firma.vergi_no}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Kayıt Tarihi</span>
                        <span className="font-bold text-slate-600 dark:text-slate-400">{format(new Date(firma.created_at || new Date()), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-none shadow-none font-bold tracking-wider uppercase text-[10px]">
                        {firma.sozlesme_turu}
                      </Badge>
                      <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
             <EmptyState title="Firma bulunamadı" />
          )}
        </div>
      </div>
    </div>
  );
}

// Using a custom ArrowRight for the firm cards to avoid importing ArrowRight from lucide-react and exceeding import limits or conflict
const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
)
