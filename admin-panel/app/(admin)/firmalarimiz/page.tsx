'use client';

import React, { useState } from 'react';
import { 
  Building2, Calendar, FileText, CheckCircle2, AlertTriangle, Clock, 
  CreditCard, Send, MoreVertical, RefreshCw, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// MOCK DATA
const SOZLESMELER = [
  { id: 1, firma: 'TechNova Yazılım', tur: 'Yıllık Danışmanlık', baslangic: '2023-06-01', bitis: '2024-05-31', bedel: 250000 },
  { id: 2, firma: 'Global Lojistik A.Ş.', tur: 'Sistem Kurulumu', baslangic: '2024-01-15', bitis: '2024-04-15', bedel: 180000 }, // Süresi geçmiş
  { id: 3, firma: 'Apex Üretim', tur: 'Premium Analiz', baslangic: '2023-11-01', bitis: '2024-10-31', bedel: 450000 },
  { id: 4, firma: 'Zirve E-Ticaret', tur: 'Aylık Raporlama', baslangic: '2024-02-01', bitis: '2024-05-10', bedel: 60000 }, // Yaklaşıyor
];

const ABONELIKLER = [
  { id: 1, firma: 'TechNova Yazılım', paket: 'Premium', durum: 'Ödendi', sonOdeme: '2024-04-01', sonrakiFatura: '2024-05-01' },
  { id: 2, firma: 'Global Lojistik A.Ş.', paket: 'Uzman', durum: 'Gecikti', sonOdeme: '2024-02-15', sonrakiFatura: '2024-03-15' },
  { id: 3, firma: 'Zirve E-Ticaret', paket: 'Temel', durum: 'Bekliyor', sonOdeme: '2024-03-01', sonrakiFatura: '2024-04-01' },
];

const FINANSAL_SUREC = [
  { id: 1, firma: 'TechNova Yazılım', hizmet: 'Aylık Danışmanlık', tutar: 20800, vade: '2024-04-30', odemeTarihi: '2024-04-28', durum: 'Ödendi' },
  { id: 2, firma: 'Global Lojistik A.Ş.', hizmet: 'Modül Geliştirme', tutar: 45000, vade: '2024-04-15', odemeTarihi: '-', durum: 'Gecikti' },
  { id: 3, firma: 'Apex Üretim', hizmet: 'Çeyrek Raporu', tutar: 112500, vade: '2024-05-15', odemeTarihi: '-', durum: 'Bekliyor' },
];

export default function FirmalarimizPage() {
  const [yenileModalOpen, setYenileModalOpen] = useState(false);
  const [seciliSozlesme, setSeciliSozlesme] = useState<any>(null);
  
  // Sözleşme İstatistikleri
  const bugun = new Date();
  const aktifSozlesmeler = SOZLESMELER.filter(s => differenceInDays(new Date(s.bitis), bugun) > 30).length;
  const yaklasanSozlesmeler = SOZLESMELER.filter(s => {
    const diff = differenceInDays(new Date(s.bitis), bugun);
    return diff >= 0 && diff <= 30;
  }).length;
  const gecmisSozlesmeler = SOZLESMELER.filter(s => differenceInDays(new Date(s.bitis), bugun) < 0).length;

  const handleYenile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${seciliSozlesme?.firma} sözleşmesi başarıyla yenilendi!`);
    setYenileModalOpen(false);
  };

  const getDurumBadge = (bitis: string) => {
    const diff = differenceInDays(new Date(bitis), bugun);
    if (diff < 0) return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Sona Erdi</Badge>;
    if (diff <= 30) return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Yaklaşıyor</Badge>;
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Aktif</Badge>;
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">İç Süreç Yönetimi</h1>
            <Badge className="bg-blue-100 text-blue-800 border-none uppercase tracking-wide">Mali Yapı</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Danışmanlık firmamızın abone portföyü, sözleşmeleri ve tahsilat takibi.</p>
        </div>
      </div>

      <Tabs defaultValue="sozlesmeler" className="w-full space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 w-full max-w-2xl h-auto">
          <TabsTrigger value="sozlesmeler" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" /> Sözleşmeler
          </TabsTrigger>
          <TabsTrigger value="abonelikler" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" /> Abonelikler
          </TabsTrigger>
          <TabsTrigger value="finansal" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <Clock className="w-4 h-4 mr-2" /> Finansal Süreç
          </TabsTrigger>
          <TabsTrigger value="tahsilat" className="py-2.5 flex-1 data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4 mr-2" /> Tahsilatlar
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SÖZLEŞMELER */}
        <TabsContent value="sozlesmeler" className="space-y-6 animate-in fade-in-50 duration-500">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm font-medium text-slate-500">Aktif Sözleşmeler</p><p className="text-3xl font-bold text-emerald-600 mt-1">{aktifSozlesmeler}</p></div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm font-medium text-slate-500">Bu Ay Biten (Yaklaşan)</p><p className="text-3xl font-bold text-amber-600 mt-1">{yaklasanSozlesmeler}</p></div>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div><p className="text-sm font-medium text-slate-500">Süresi Geçmiş</p><p className="text-3xl font-bold text-red-600 mt-1">{gecmisSozlesmeler}</p></div>
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
              <CardTitle>Sözleşme Listesi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6">Firma Adı</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Başlangıç - Bitiş</TableHead>
                    <TableHead>Bedel (₺)</TableHead>
                    <TableHead>Kalan Gün</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right pr-6">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SOZLESMELER.map(s => {
                    const kalan = Math.ceil(differenceInDays(new Date(s.bitis), bugun));
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="pl-6 font-bold">{s.firma}</TableCell>
                        <TableCell className="text-slate-500 font-medium">{s.tur}</TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(s.baslangic), 'dd.MM.yy')} <span className="text-slate-300 mx-1">→</span> 
                          <span className={kalan <= 30 ? 'font-bold' : ''}>{format(new Date(s.bitis), 'dd.MM.yy')}</span>
                        </TableCell>
                        <TableCell className="font-bold">₺{s.bedel.toLocaleString('tr-TR')}</TableCell>
                        <TableCell>
                          {kalan < 0 ? (
                            <span className="text-red-600 font-bold">{-kalan} gün geçti</span>
                          ) : kalan <= 30 ? (
                            <span className="text-amber-600 font-bold">{kalan} gün kaldı</span>
                          ) : (
                            <span className="text-emerald-600">{kalan} gün</span>
                          )}
                        </TableCell>
                        <TableCell>{getDurumBadge(s.bitis)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => {
                            setSeciliSozlesme(s);
                            setYenileModalOpen(true);
                          }}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Yenile
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SÖZLEŞME YENİLEME MODAL */}
          <Dialog open={yenileModalOpen} onOpenChange={setYenileModalOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>Sözleşme Yenile: {seciliSozlesme?.firma}</DialogTitle></DialogHeader>
              <form onSubmit={handleYenile} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mevcut Bitiş Tarihi</Label>
                    <Input value={seciliSozlesme ? format(new Date(seciliSozlesme.bitis), 'dd MMMM yyyy', {locale: tr}) : ''} disabled className="bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Yeni Bitiş Tarihi</Label>
                    <Input type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Yeni Sözleşme Bedeli (₺) - Opsiyonel</Label>
                  <Input type="number" defaultValue={seciliSozlesme?.bedel} />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setYenileModalOpen(false)}>İptal</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Sözleşmeyi Yenile</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 2: ABONELİK YÖNETİMİ */}
        <TabsContent value="abonelikler" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ABONELIKLER.map(a => (
              <Card key={a.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{a.firma}</h4>
                      <Badge variant="outline" className={`mt-1 border-none ${
                        a.paket === 'Premium' ? 'bg-purple-100 text-purple-800' :
                        a.paket === 'Uzman' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>{a.paket} Paket</Badge>
                    </div>
                  </div>
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Fatura Durumu:</span>
                      <Badge variant="outline" className={`shadow-none border-0 ${
                        a.durum === 'Ödendi' ? 'bg-emerald-100 text-emerald-800' :
                        a.durum === 'Gecikti' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>{a.durum}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Son Ödeme:</span>
                      <span className="font-medium">{format(new Date(a.sonOdeme), 'dd MMM yyyy', {locale: tr})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Sonraki Fatura:</span>
                      <span className="font-medium text-slate-900">{format(new Date(a.sonrakiFatura), 'dd MMM yyyy', {locale: tr})}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">Paket Değiştir</Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="sm"><Send className="w-4 h-4 mr-2"/> Fatura Gönder</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: FİNANSAL SÜREÇ */}
        <TabsContent value="finansal" className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Ödeme Takibi</CardTitle>
                <CardDescription>Müşteri ödemeleri ve vadeleri.</CardDescription>
              </div>
              <Select defaultValue="buay">
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buay">Bu Ay</SelectItem>
                  <SelectItem value="buceyrek">Bu Çeyrek</SelectItem>
                  <SelectItem value="buyil">Bu Yıl</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow>
                    <TableHead className="pl-6">Firma</TableHead>
                    <TableHead>Hizmet</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Vade</TableHead>
                    <TableHead>Ödeme Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right pr-6">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FINANSAL_SUREC.map(f => (
                    <TableRow key={f.id} className={f.durum === 'Gecikti' ? 'bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50' : ''}>
                      <TableCell className="pl-6 font-bold">{f.firma}</TableCell>
                      <TableCell>{f.hizmet}</TableCell>
                      <TableCell className="font-bold">₺{f.tutar.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{format(new Date(f.vade), 'dd.MM.yyyy')}</TableCell>
                      <TableCell>{f.odemeTarihi !== '-' ? format(new Date(f.odemeTarihi), 'dd.MM.yyyy') : '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`shadow-none border-0 ${
                          f.durum === 'Ödendi' ? 'bg-emerald-100 text-emerald-800' :
                          f.durum === 'Gecikti' ? 'bg-red-100 text-red-800 font-bold' : 'bg-amber-100 text-amber-800'
                        }`}>{f.durum}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center rounded-b-xl">
                <div className="font-bold text-slate-500">TOPLAM</div>
                <div className="flex gap-8">
                  <div className="text-right">
                    <p className="text-xs text-amber-600 font-bold">Beklenen Tahsilat</p>
                    <p className="text-lg font-black">₺157,500</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-bold">Gerçekleşen</p>
                    <p className="text-lg font-black">₺20,800</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: TAHSİLATLAR */}
        <TabsContent value="tahsilat" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Bekleyenler */}
            <Card className="border border-red-200 dark:border-red-900 shadow-sm flex flex-col h-full">
              <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/50 pb-4">
                <CardTitle className="text-red-700 dark:text-red-400">Bekleyen Tahsilatlar</CardTitle>
                <div className="text-3xl font-black text-red-600 mt-2">₺157,500</div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {FINANSAL_SUREC.filter(f => f.durum !== 'Ödendi').map(f => (
                  <div key={f.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{f.firma}</p>
                      <p className="text-sm text-slate-500">Vade: {format(new Date(f.vade), 'dd MMM yyyy', {locale:tr})}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">₺{f.tutar.toLocaleString('tr-TR')}</p>
                        {f.durum === 'Gecikti' && <p className="text-xs text-red-600 font-bold">Gecikmiş</p>}
                      </div>
                      <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">Ödendi İşaretle</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Yapılanlar */}
            <Card className="border border-emerald-200 dark:border-emerald-900 shadow-sm flex flex-col h-full">
              <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/50 pb-4">
                <CardTitle className="text-emerald-700 dark:text-emerald-400">Yapılan Tahsilatlar (Bu Ay)</CardTitle>
                <div className="text-3xl font-black text-emerald-600 mt-2">₺20,800</div>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                {FINANSAL_SUREC.filter(f => f.durum === 'Ödendi').map(f => (
                  <div key={f.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/20">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{f.firma}</p>
                      <p className="text-sm text-slate-500">Ödeme: {f.odemeTarihi}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">₺{f.tutar.toLocaleString('tr-TR')}</p>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1 justify-end"><CheckCircle2 className="w-3 h-3"/> Tahsil Edildi</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
