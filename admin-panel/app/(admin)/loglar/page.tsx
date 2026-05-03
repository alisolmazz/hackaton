'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Activity, Search, ShieldAlert, Cpu, CheckCircle2, XCircle, 
  Clock, Database, Eye, ChevronLeft, ChevronRight, FileJson, AlertTriangle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

import { getSystemLogs, type SystemLog } from '@/lib/api';

// Seed logs to show something initially
const SEED_LOGS: SystemLog[] = [
  { id: 'SEED-1', zaman: new Date(Date.now() - 2 * 3600000).toISOString(), kullanici: 'admin@prosicht.com', islem_turu: 'login', tablo: 'auth', kayit_id: 'admin@prosicht.com', eski_deger: null, yeni_deger: { role: 'admin' } },
  { id: 'SEED-2', zaman: new Date(Date.now() - 4 * 3600000).toISOString(), kullanici: 'admin@prosicht.com', islem_turu: 'create', tablo: 'firmalar', kayit_id: '1', eski_deger: null, yeni_deger: { unvan: 'Türkiye Tech A.Ş.' } },
  { id: 'SEED-3', zaman: new Date(Date.now() - 8 * 3600000).toISOString(), kullanici: 'admin@prosicht.com', islem_turu: 'update', tablo: 'firmalar', kayit_id: '2', eski_deger: { ciro: 25000000 }, yeni_deger: { ciro: 28000000 } },
];

const AI_LOGLARI = [
  { id: 1, zaman: new Date(Date.now() - 3600000).toISOString(), firma: 'TechNova', tur: 'ocr', sure: 1250, durum: 'basarili', promptUzunluk: 0 },
  { id: 2, zaman: new Date(Date.now() - 7200000).toISOString(), firma: 'Global Loj.', tur: 'analiz', sure: 4500, durum: 'basarili', promptUzunluk: 2500 },
  { id: 3, zaman: new Date(Date.now() - 86400000).toISOString(), firma: 'Apex Üretim', tur: 'pptx', sure: 8500, durum: 'hatali', promptUzunluk: 1200, hataMesaji: 'Timeout: OpenAI API yanıt vermedi.' },
  { id: 4, zaman: new Date(Date.now() - 150000).toISOString(), firma: 'Zirve E-Ticaret', tur: 'analiz', sure: 1800, durum: 'basarili', promptUzunluk: 3100 },
];

const AI_CHART_DATA = [
  { gun: 'Pzt', cagri: 120, basari: 98 },
  { gun: 'Sal', cagri: 150, basari: 95 },
  { gun: 'Çar', cagri: 180, basari: 92 },
  { gun: 'Per', cagri: 140, basari: 99 },
  { gun: 'Cum', cagri: 210, basari: 88 },
  { gun: 'Cmt', cagri: 80, basari: 100 },
  { gun: 'Paz', cagri: 60, basari: 100 },
];

const HATA_LOGLARI = [
  { id: 1, zaman: new Date(Date.now() - 1200000).toISOString(), endpoint: '/api/finansal/123', kod: 500, tur: 'InternalServerError', kullanici: 'ayse@pro.com', cozuldu: false, stack: 'Error: Cannot read properties of undefined (reading "net_kar")\n    at calculateFinans (api.js:45:12)' },
  { id: 2, zaman: new Date(Date.now() - 3400000).toISOString(), endpoint: '/api/admin/settings', kod: 403, tur: 'Forbidden', kullanici: 'user@pro.com', cozuldu: true, stack: 'Forbidden: Insufficient permissions.' },
  { id: 3, zaman: new Date(Date.now() - 5600000).toISOString(), endpoint: '/api/firmalar/999', kod: 404, tur: 'NotFound', kullanici: 'ahmet@pro.com', cozuldu: false, stack: 'NotFound: Kayıt bulunamadı.' },
];

function LoglarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- TAB 1: İŞLEM LOGLARI STATES (URL tabanlı simülasyon) ---
  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 15;
  const filterType = searchParams.get('type') || 'tumu';
  const [arama, setArama] = useState('');
  
  // Sheet detay
  const [seciliLog, setSeciliLog] = useState<any>(null);
  
  // Hata Log detay
  const [seciliHata, setSeciliHata] = useState<any>(null);
  const [hataCozulmedi, setHataCozulmedi] = useState(false);

  // Gerçek logları localStorage'dan oku
  const ISLEM_LOGLARI = useMemo(() => {
    const real = getSystemLogs();
    const all = real.length > 0 ? real : SEED_LOGS;
    return all.sort((a, b) => new Date(b.zaman).getTime() - new Date(a.zaman).getTime());
  }, []);

  // Pagination Logic
  const filteredIslemLoglari = useMemo(() => {
    return ISLEM_LOGLARI.filter(l => {
      const matchType = filterType === 'tumu' || l.islem_turu === filterType;
      const matchArama = l.id.toLowerCase().includes(arama.toLowerCase()) || l.kullanici.toLowerCase().includes(arama.toLowerCase());
      return matchType && matchArama;
    });
  }, [ISLEM_LOGLARI, filterType, arama]);

  const paginatedLogs = filteredIslemLoglari.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredIslemLoglari.length / perPage);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', val);
    params.set('page', '1'); // reset page
    router.push(`?${params.toString()}`);
  };

  // Badges
  const getIslemBadge = (tur: string) => {
    switch (tur) {
      case 'create': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px]">create</Badge>;
      case 'update': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 uppercase text-[10px]">update</Badge>;
      case 'delete': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 uppercase text-[10px]">delete</Badge>;
      case 'login': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 uppercase text-[10px]">login</Badge>;
      case 'logout': return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 uppercase text-[10px]">logout</Badge>;
      case 'ocr': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 uppercase text-[10px]">ocr</Badge>;
      case 'premium': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px]">premium</Badge>;
      default: return <Badge variant="outline" className="uppercase text-[10px]">{tur}</Badge>;
    }
  };

  const getAiBadge = (tur: string) => {
    switch (tur) {
      case 'ocr': return <Badge variant="secondary" className="bg-orange-100 text-orange-800 shadow-none border-none">OCR</Badge>;
      case 'analiz': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 shadow-none border-none">Analiz</Badge>;
      case 'pptx': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 shadow-none border-none">Sunum</Badge>;
      default: return <Badge>{tur}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Sistem Logları</h1>
            <Badge className="bg-slate-100 text-slate-800 border-none uppercase tracking-wide">Developer</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">İşlem denetimi, yapay zeka performansı ve hata tespit merkezi.</p>
        </div>
      </div>

      <Tabs defaultValue="islem" className="w-full space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 w-full max-w-lg h-auto">
          <TabsTrigger value="islem" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <Activity className="w-4 h-4 mr-2" /> İşlem Logları
          </TabsTrigger>
          <TabsTrigger value="ai" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <Cpu className="w-4 h-4 mr-2" /> AI Çağrıları
          </TabsTrigger>
          <TabsTrigger value="hata" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <ShieldAlert className="w-4 h-4 mr-2" /> Hata Logları
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: İŞLEM LOGLARI */}
        <TabsContent value="islem" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Denetim İzi (Audit Trail)</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Log ID veya Kullanıcı..." className="pl-9 bg-slate-50" value={arama} onChange={e => setArama(e.target.value)} />
                  </div>
                  <Select value={filterType} onValueChange={(val) => val && handleTypeChange(val)}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="İşlem Türü" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tumu">Tümü</SelectItem>
                      <SelectItem value="create">Oluşturma</SelectItem>
                      <SelectItem value="update">Güncelleme</SelectItem>
                      <SelectItem value="delete">Silme</SelectItem>
                      <SelectItem value="login">Giriş</SelectItem>
                      <SelectItem value="logout">Çıkış</SelectItem>
                      <SelectItem value="ocr">OCR</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6 h-12">Zaman</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>İşlem Türü</TableHead>
                    <TableHead>Tablo / Modül</TableHead>
                    <TableHead>Kayıt ID</TableHead>
                    <TableHead className="text-right pr-6">Aksiyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map(l => (
                    <TableRow key={l.id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">{format(new Date(l.zaman), 'dd.MM.yyyy HH:mm:ss')}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {formatDistanceToNow(new Date(l.zaman), {addSuffix: true, locale: tr})}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{l.kullanici}</TableCell>
                      <TableCell>{getIslemBadge(l.islem_turu)}</TableCell>
                      <TableCell className="text-sm text-slate-600 flex items-center gap-1"><Database className="w-3 h-3"/> {l.tablo}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">#{l.kayit_id}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => setSeciliLog(l)}>
                          <Eye className="w-4 h-4 mr-2" /> Detay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination UI */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Toplam {filteredIslemLoglari.length} kayıttan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filteredIslemLoglari.length)} arası gösteriliyor.
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /> Önceki</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sonraki <ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DETAY PANELI (Sheet) */}
          <Sheet open={!!seciliLog} onOpenChange={(open) => !open && setSeciliLog(null)}>
            <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle className="flex items-center gap-2"><FileJson className="w-5 h-5 text-blue-600"/> Log Detayı</SheetTitle>
                <SheetDescription>{seciliLog?.id} numaralı işlem kaydı.</SheetDescription>
              </SheetHeader>
              
              {seciliLog && (
                <div className="py-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div><span className="text-slate-500 block">Kullanıcı</span><span className="font-bold">{seciliLog.kullanici}</span></div>
                    <div><span className="text-slate-500 block">İşlem Türü</span>{getIslemBadge(seciliLog.islem_turu)}</div>
                    <div><span className="text-slate-500 block">Tablo</span><span className="font-bold">{seciliLog.tablo}</span></div>
                    <div><span className="text-slate-500 block">Zaman</span><span className="font-bold">{format(new Date(seciliLog.zaman), 'dd MMM yyyy, HH:mm:ss', {locale:tr})}</span></div>
                  </div>

                  {seciliLog.islem_turu === 'update' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-sm">Veri Farkı (Diff)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shadow-none">Eski Değer</Badge>
                          <pre className="bg-slate-950 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-auto border border-slate-800">
                            {JSON.stringify(seciliLog.eski_deger, null, 2)}
                          </pre>
                        </div>
                        <div className="space-y-2">
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Yeni Değer</Badge>
                          <pre className="bg-slate-950 text-emerald-300 p-4 rounded-lg text-xs font-mono overflow-auto border border-slate-800">
                            {JSON.stringify(seciliLog.yeni_deger, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                  {seciliLog.islem_turu !== 'update' && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm">JSON Verisi</h4>
                      <pre className="bg-slate-950 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-auto border border-slate-800">
                        {JSON.stringify(seciliLog.yeni_deger || seciliLog.eski_deger || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </TabsContent>

        {/* TAB 2: AI ÇAĞRI LOGLARI */}
        <TabsContent value="ai" className="space-y-6 animate-in fade-in-50 duration-500">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-sm border-l-4 border-l-blue-500"><CardContent className="p-5"><p className="text-sm text-slate-500 font-medium">Toplam AI Çağrısı</p><p className="text-2xl font-bold mt-1">1,245</p></CardContent></Card>
            <Card className="shadow-sm border-l-4 border-l-emerald-500"><CardContent className="p-5"><p className="text-sm text-slate-500 font-medium">Başarı Oranı</p><p className="text-2xl font-bold mt-1 text-emerald-600">%94.5</p></CardContent></Card>
            <Card className="shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5"><p className="text-sm text-slate-500 font-medium">Ort. Yanıt Süresi</p><p className="text-2xl font-bold mt-1">2,450 <span className="text-sm font-normal text-slate-400">ms</span></p></CardContent></Card>
            <Card className="shadow-sm border-l-4 border-l-purple-500"><CardContent className="p-5"><p className="text-sm text-slate-500 font-medium">Bugünkü Çağrı</p><p className="text-2xl font-bold mt-1 text-purple-600">84</p></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-lg">AI Çağrı Geçmişi</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                      <TableRow>
                        <TableHead className="pl-6">Zaman</TableHead>
                        <TableHead>Firma</TableHead>
                        <TableHead>Tür</TableHead>
                        <TableHead>Süre</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AI_LOGLARI.map(l => (
                        <TableRow key={l.id} className={l.durum === 'hatali' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}>
                          <TableCell className="pl-6 text-sm">{format(new Date(l.zaman), 'HH:mm:ss')}</TableCell>
                          <TableCell className="font-medium">{l.firma}</TableCell>
                          <TableCell>{getAiBadge(l.tur)}</TableCell>
                          <TableCell>
                            <span className={`font-mono text-xs font-bold ${l.sure < 2000 ? 'text-emerald-600' : l.sure < 5000 ? 'text-amber-600' : 'text-red-600'}`}>{l.sure}ms</span>
                          </TableCell>
                          <TableCell>
                            {l.durum === 'basarili' ? (
                              <Badge variant="outline" className="border-none bg-emerald-100 text-emerald-800 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Başarılı</Badge>
                            ) : (
                              <div className="flex items-center gap-2 group cursor-help">
                                <Badge variant="outline" className="border-none bg-red-100 text-red-800 shadow-none"><XCircle className="w-3 h-3 mr-1"/> Hatalı</Badge>
                                <span className="hidden group-hover:block text-xs text-red-600">{l.hataMesaji}</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="shadow-sm h-full flex flex-col">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3"><CardTitle className="text-lg">Performans Trendi (7 Gün)</CardTitle></CardHeader>
                <CardContent className="pt-6 flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={AI_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend />
                      <Line yAxisId="left" type="monotone" name="Çağrı Sayısı" dataKey="cagri" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" name="Başarı %" dataKey="basari" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: HATA LOGLARI */}
        <TabsContent value="hata" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="shadow-sm border-t-4 border-t-red-500">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-red-600 flex items-center gap-2"><ShieldAlert className="w-5 h-5"/> Sistem Hataları</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="cozulmemis" checked={hataCozulmedi} onCheckedChange={setHataCozulmedi} />
                    <Label htmlFor="cozulmemis" className="text-sm font-medium cursor-pointer">Sadece Çözülmemişler</Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6 h-12">Zaman</TableHead>
                    <TableHead>HTTP</TableHead>
                    <TableHead>Hata Türü</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead className="text-right pr-6">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HATA_LOGLARI.filter(h => !hataCozulmedi || !h.cozuldu).map(h => (
                    <TableRow key={h.id} className={h.kod === 500 ? 'bg-red-50/30 dark:bg-red-900/10' : h.kod >= 400 && h.kod < 404 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}>
                      <TableCell className="pl-6 text-sm whitespace-nowrap">{format(new Date(h.zaman), 'dd MMM, HH:mm')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`shadow-none font-mono ${
                          h.kod === 500 ? 'bg-red-100 text-red-800 border-red-200' : 
                          h.kod === 404 ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {h.kod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-slate-100">{h.tur}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{h.endpoint}</TableCell>
                      <TableCell className="text-sm text-slate-600">{h.kullanici}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button size="sm" variant="outline" onClick={() => setSeciliHata(h)}>Stack Trace</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex gap-4 items-center justify-center pt-4 text-xs font-mono font-medium">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"/> DEBUG</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> INFO</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> WARNING</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/> ERROR</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-600"/> CRITICAL</span>
          </div>

          {/* HATA MODAL */}
          <Dialog open={!!seciliHata} onOpenChange={(open) => !open && setSeciliHata(null)}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5"/> Error Stack Trace</DialogTitle></DialogHeader>
              {seciliHata && (
                <div className="space-y-4 pt-4">
                  <div className="flex gap-4">
                    <Badge variant="destructive" className="font-mono">HTTP {seciliHata.kod}</Badge>
                    <span className="font-bold">{seciliHata.tur}</span>
                  </div>
                  <pre className="bg-slate-950 text-red-400 p-4 rounded-lg text-xs font-mono overflow-auto border border-slate-800 whitespace-pre-wrap">
                    {seciliHata.stack}
                  </pre>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LoglarPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loglar yukleniyor...</div>}>
      <LoglarContent />
    </Suspense>
  );
}
