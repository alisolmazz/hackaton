'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, FileCheck, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getFirmalar, getLogs, getPremiumTalepler } from '@/lib/api';
import EmptyState from '@/components/shared/EmptyState';
import { format } from 'date-fns';

export default function DashboardPage() {
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

  // Recharts için statik dummy data (Hackathon sürecinde mockup olarak)
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  // Hesaplamalar
  const aktifFirmalar = firmalar?.filter(f => f.onaylandi) || [];
  const bekleyenTalepler = talepler?.filter(t => t.durum === 'bekliyor') || [];
  const buAykiTahsilat = 1250000; // Fake value for dashboard as requested
  
  const sonLoglar = logs?.slice(0, 5) || [];
  const sonFirmalar = firmalar?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* 1. ÜST SATIR: Özet Kartlar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Toplam Firma */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">Toplam Firma</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{firmalar?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Sistemdeki kayıtlı firmalar</p>
          </CardContent>
        </Card>

        {/* Aktif Sözleşme */}
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">Aktif Sözleşme</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-full">
              <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{aktifFirmalar.length}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Onaylı sözleşmeler</p>
          </CardContent>
        </Card>

        {/* Bekleyen Talep */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">Bekleyen Talep</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">{bekleyenTalepler.length}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Premium özellik talepleri</p>
          </CardContent>
        </Card>

        {/* Bu Ayki Tahsilat */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">Bu Ayki Tahsilat</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-white">₺{buAykiTahsilat.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Toplam gerçekleşen</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. ORTA BÖLÜM: Grafikler ve Loglar */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Sol Kolon: Grafik (60%) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Son 6 Ay Gelir/Gider</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₺${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                  formatter={(value) => `₺${Number(value).toLocaleString('tr-TR')}`}
                />
                <Legend iconType="circle" />
                <Bar dataKey="gelir" name="Gelir" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="gider" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sağ Kolon: Aktiviteler (40%) */}
        <Card className="col-span-3 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {sonLoglar.length > 0 ? (
              <div className="space-y-6">
                {sonLoglar.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    {/* Timeline line */}
                    {i !== sonLoglar.length - 1 && (
                      <div className="absolute top-6 left-2.5 w-0.5 h-10 bg-slate-200 dark:bg-slate-700" />
                    )}
                    <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-500 flex-shrink-0 mt-0.5 z-10" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-none text-slate-800 dark:text-slate-200">
                        {log.islem_turu.toUpperCase()} İşlemi
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Tablo: {log.tablo_adi}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {format(new Date(log.created_at), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Henüz aktivite bulunmuyor" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. ALT BÖLÜM: Son Eklenen Firmalar */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Son Eklenen Firmalar</h3>
        <div className="flex overflow-x-auto pb-6 gap-5 custom-scrollbar">
          {sonFirmalar.length > 0 ? (
            sonFirmalar.map((firma) => (
              <Link key={firma.id} href={`/firmalar/${firma.id}`} className="min-w-[320px] max-w-[320px]">
                <Card className="hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer h-full border-t-4 border-t-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg truncate" title={firma.unvan}>{firma.unvan}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Vergi No:</span>
                        <span className="font-medium">{firma.vergi_no}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Kayıt:</span>
                        <span className="font-medium">{format(new Date(firma.created_at || new Date()), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md">
                        {firma.sozlesme_turu}
                      </span>
                      <span className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                        Detay <TrendingUp className="w-4 h-4" />
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
