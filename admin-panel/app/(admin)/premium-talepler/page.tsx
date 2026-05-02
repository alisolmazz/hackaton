'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertCircle, CheckCircle2, XCircle, Search, Calendar as CalendarIcon, 
  BarChart2, UserCheck, Crown, ShieldCheck, Clock, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// MOCK DATA
const INITIAL_TALEPLER = [
  { id: 1, firmaId: '101', firmaAdi: 'TechNova Yazılım', talepEden: 'Ahmet Yılmaz', paket: 'Premium Bundle', tarih: '2024-05-01T10:30:00Z', durum: 'bekliyor' },
  { id: 2, firmaId: '102', firmaAdi: 'Global Lojistik A.Ş.', talepEden: 'Ayşe Kaya', paket: 'Uzman Görüşü', tarih: '2024-04-28T14:15:00Z', durum: 'bekliyor' },
  { id: 3, firmaId: '103', firmaAdi: 'Apex Üretim', talepEden: 'Mehmet Demir', paket: 'Temel Analiz', tarih: '2024-04-25T09:00:00Z', durum: 'onaylandi' },
  { id: 4, firmaId: '104', firmaAdi: 'Zirve E-Ticaret', talepEden: 'Zeynep Çelik', paket: 'Premium Bundle', tarih: '2024-04-20T16:45:00Z', durum: 'reddedildi' },
  { id: 5, firmaId: '105', firmaAdi: 'Nova Sağlık', talepEden: 'Burak Can', paket: 'Uzman Görüşü', tarih: '2024-05-02T11:20:00Z', durum: 'bekliyor' },
];

export default function PremiumTaleplerPage() {
  const router = useRouter();
  
  // States (Mocking react-query cache for optimistic updates)
  const [talepler, setTalepler] = useState(INITIAL_TALEPLER);
  
  // Filters
  const [arama, setArama] = useState('');
  const [durumFiltre, setDurumFiltre] = useState('tumu');
  const [paketFiltre, setPaketFiltre] = useState('tumu');

  // Modals / Dialogs
  const [onayDialog, setOnayDialog] = useState<{open: boolean, id: number | null}>({ open: false, id: null });
  const [redModal, setRedModal] = useState<{open: boolean, id: number | null}>({ open: false, id: null });
  const [redNedeni, setRedNedeni] = useState('');
  
  // Sheet
  const [seciliTalep, setSeciliTalep] = useState<any>(null);

  // Stats
  const bekleyenSayisi = talepler.filter(t => t.durum === 'bekliyor').length;
  const onaylananSayisi = talepler.filter(t => t.durum === 'onaylandi').length;
  const reddedilenSayisi = talepler.filter(t => t.durum === 'reddedildi').length;

  const filteredTalepler = useMemo(() => {
    return talepler.filter(t => {
      const matchArama = t.firmaAdi.toLowerCase().includes(arama.toLowerCase());
      const matchDurum = durumFiltre === 'tumu' || t.durum === durumFiltre;
      const matchPaket = paketFiltre === 'tumu' || t.paket === paketFiltre;
      return matchArama && matchDurum && matchPaket;
    });
  }, [talepler, arama, durumFiltre, paketFiltre]);

  const handleOnayla = () => {
    if (!onayDialog.id) return;
    
    // Optimistic Update
    setTalepler(prev => prev.map(t => t.id === onayDialog.id ? { ...t, durum: 'onaylandi' } : t));
    
    // Eğer detay paneli açıksa ve onaylanan elemansa onu da güncelle
    if (seciliTalep?.id === onayDialog.id) {
      setSeciliTalep((prev: any) => ({ ...prev, durum: 'onaylandi' }));
    }

    toast.success('Premium erişim aktifleştirildi!', {
      description: 'Firma artık seçilen premium özelliklere erişebilir.'
    });
    setOnayDialog({ open: false, id: null });
  };

  const handleReddet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redModal.id) return;

    setTalepler(prev => prev.map(t => t.id === redModal.id ? { ...t, durum: 'reddedildi' } : t));
    
    if (seciliTalep?.id === redModal.id) {
      setSeciliTalep((prev: any) => ({ ...prev, durum: 'reddedildi' }));
    }

    toast.error('Talep reddedildi.');
    setRedModal({ open: false, id: null });
    setRedNedeni('');
  };

  const getPaketBadge = (paket: string) => {
    switch (paket) {
      case 'Temel Analiz': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Temel Analiz</Badge>;
      case 'Uzman Görüşü': return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Uzman Görüşü</Badge>;
      case 'Premium Bundle': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm border">Premium Bundle</Badge>;
      default: return <Badge variant="outline">{paket}</Badge>;
    }
  };

  const getDurumBadge = (durum: string) => {
    switch (durum) {
      case 'bekliyor': return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 animate-pulse border-none">Bekliyor</Badge>;
      case 'onaylandi': return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-none">Onaylandı</Badge>;
      case 'reddedildi': return <Badge variant="secondary" className="bg-red-100 text-red-800 border-none">Reddedildi</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Premium Talepler</h1>
            <Badge className="bg-orange-100 text-orange-800 border-none uppercase tracking-wide">Yönetim</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">Firmalardan gelen üst düzey özellik erişim talepleri.</p>
        </div>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-slate-500">Bekleyen Talepler</p><p className="text-3xl font-bold text-orange-600 mt-1">{bekleyenSayisi}</p></div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><Clock className="w-5 h-5 text-orange-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-slate-500">Bu Ay Onaylanan</p><p className="text-3xl font-bold text-emerald-600 mt-1">{onaylananSayisi}</p></div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium text-slate-500">Bu Ay Reddedilen</p><p className="text-3xl font-bold text-red-600 mt-1">{reddedilenSayisi}</p></div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FİLTRELER VE TABLO */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Talepler Listesi</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input placeholder="Firma ara..." className="pl-9 bg-slate-50" value={arama} onChange={e => setArama(e.target.value)} />
              </div>
              <Select value={durumFiltre} onValueChange={setDurumFiltre}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Durum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tumu">Tümü (Durum)</SelectItem>
                  <SelectItem value="bekliyor">Bekleyenler</SelectItem>
                  <SelectItem value="onaylandi">Onaylananlar</SelectItem>
                  <SelectItem value="reddedildi">Reddedilenler</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paketFiltre} onValueChange={setPaketFiltre}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Paket" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tumu">Tümü (Paket)</SelectItem>
                  <SelectItem value="Temel Analiz">Temel Analiz</SelectItem>
                  <SelectItem value="Uzman Görüşü">Uzman Görüşü</SelectItem>
                  <SelectItem value="Premium Bundle">Premium Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6 h-12">Firma Adı</TableHead>
                <TableHead>Talep Eden</TableHead>
                <TableHead>Paket Türü</TableHead>
                <TableHead>Talep Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right pr-6">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTalepler.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Kriterlere uygun talep bulunamadı.</TableCell></TableRow>
              ) : (
                filteredTalepler.map(t => (
                  <TableRow 
                    key={t.id} 
                    className="hover:bg-slate-50/50 cursor-pointer" 
                    onClick={() => setSeciliTalep(t)}
                  >
                    <TableCell className="pl-6">
                      <span className="font-bold hover:underline text-blue-600" onClick={(e) => { e.stopPropagation(); router.push(`/firmalar/${t.firmaId}`); }}>
                        {t.firmaAdi}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 font-medium">{t.talepEden}</TableCell>
                    <TableCell>{getPaketBadge(t.paket)}</TableCell>
                    <TableCell className="text-sm">{format(new Date(t.tarih), 'dd MMM yyyy, HH:mm', {locale:tr})}</TableCell>
                    <TableCell>{getDurumBadge(t.durum)}</TableCell>
                    <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      {t.durum === 'bekliyor' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setRedModal({ open: true, id: t.id })}>
                            Reddet
                          </Button>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOnayDialog({ open: true, id: t.id })}>
                            Onayla
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setSeciliTalep(t)}>İncele</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ONAY ALERT DİALOG */}
      <AlertDialog open={onayDialog.open} onOpenChange={(open) => setOnayDialog({ open, id: open ? onayDialog.id : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-600"/> Talebi Onaylayacaksınız</AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-base text-slate-700 dark:text-slate-300 space-y-2">
              <p>Firma: <strong className="text-slate-900 dark:text-white">{talepler.find(t=>t.id===onayDialog.id)?.firmaAdi}</strong></p>
              <p>Paket: <strong>{talepler.find(t=>t.id===onayDialog.id)?.paket}</strong></p>
              <p className="mt-4 text-sm text-slate-500">Bu işlem firma için ilgili premium özellik erişimini hemen aktif edecektir.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleOnayla} className="bg-emerald-600 hover:bg-emerald-700 text-white">Evet, Onayla</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* REDDET MODALI */}
      <Dialog open={redModal.open} onOpenChange={(open) => setRedModal({ open, id: open ? redModal.id : null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Talebi Reddet</DialogTitle></DialogHeader>
          <form onSubmit={handleReddet} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Lütfen red nedenini belirtin (Opsiyonel):</Label>
              <Textarea 
                placeholder="Firma yetkilisine gösterilecek red nedeni..." 
                value={redNedeni} 
                onChange={(e) => setRedNedeni(e.target.value)}
                className="h-24 resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRedModal({ open: false, id: null })}>İptal</Button>
              <Button type="submit" variant="destructive">Talebi Reddet</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAY PANELİ (SHEET) */}
      <Sheet open={!!seciliTalep} onOpenChange={(open) => !open && setSeciliTalep(null)}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle>Talep Detayları</SheetTitle>
            <SheetDescription>Premium özellik erişim talebi</SheetDescription>
          </SheetHeader>
          
          {seciliTalep && (
            <div className="py-6 space-y-6">
              
              {/* Firma Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                  <span className="font-black text-xl text-slate-400">{seciliTalep.firmaAdi.substring(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl">{seciliTalep.firmaAdi}</h3>
                  <p className="text-slate-500 text-sm flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> VKN: 1234567890</p>
                </div>
              </div>

              {/* Talep Info */}
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Talep Eden</span>
                  <span className="font-semibold">{seciliTalep.talepEden}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Talep Tarihi</span>
                  <span className="font-semibold">{format(new Date(seciliTalep.tarih), 'dd MMMM yyyy HH:mm', {locale:tr})}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-500">Paket</span>
                  {getPaketBadge(seciliTalep.paket)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Güncel Durum</span>
                  {getDurumBadge(seciliTalep.durum)}
                </div>
              </div>

              {/* Geçmiş Talepler Mock */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Talep Geçmişi</h4>
                <div className="space-y-3">
                  <div className="text-sm flex justify-between p-2 border border-slate-100 dark:border-slate-800 rounded bg-white dark:bg-slate-950">
                    <span className="text-slate-500">12 Oca 2024</span>
                    <span className="font-medium">Temel Analiz</span>
                    <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 shadow-none">Onaylandı</Badge>
                  </div>
                </div>
              </div>

              {/* Aksiyonlar (Sadece bekliyor ise) */}
              {seciliTalep.durum === 'bekliyor' && (
                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                    setSeciliTalep(null);
                    setRedModal({ open: true, id: seciliTalep.id });
                  }}>
                    Reddet
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                    setSeciliTalep(null);
                    setOnayDialog({ open: true, id: seciliTalep.id });
                  }}>
                    Onayla
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* PRİMİUM PAKETLERİ TANIM KARTLARI */}
      <div className="pt-8">
        <h3 className="text-lg font-bold mb-4">Premium Paket Referansları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-3">
                <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Temel Analiz</CardTitle>
              <CardDescription>AI destekli otomatik finansal analiz raporu.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Analiz Raporu</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Grafik Çıktıları</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-900/10">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-purple-900 dark:text-purple-100">Uzman Görüşü</CardTitle>
              <CardDescription>Uzman tarafından yazılan yorumlu rapor.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 font-medium text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Uzman Yorumu</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Öneriler</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Risk Değerlendirmesi</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3"><Crown className="w-16 h-16 text-amber-200 dark:text-amber-800/50 -mr-4 -mt-4 opacity-50" /></div>
            <CardHeader className="pb-2 relative z-10">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-3 border border-amber-200">
                <Crown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Premium Bundle</CardTitle>
              <CardDescription className="text-amber-700/70 dark:text-amber-200/70 font-medium">Tüm özellikler bir arada.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="text-sm space-y-2 font-bold text-amber-900 dark:text-amber-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI Analiz</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Uzman Görüşü</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ön Sunum .pptx</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
