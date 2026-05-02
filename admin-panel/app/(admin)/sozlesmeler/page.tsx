'use client';

import React, { useState } from 'react';
import { 
  Building2, FileText, CheckCircle2, AlertTriangle, 
  RefreshCw, AlertCircle, Plus, FileSpreadsheet, Download
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// MOCK DATA
const SOZLESMELER = [
  { id: 1, firma: 'TechNova Yazılım', tur: 'Yıllık Danışmanlık', baslangic: '2023-06-01', bitis: '2024-05-31', bedel: 250000 },
  { id: 2, firma: 'Global Lojistik A.Ş.', tur: 'Sistem Kurulumu', baslangic: '2024-01-15', bitis: '2024-04-15', bedel: 180000 },
  { id: 3, firma: 'Apex Üretim', tur: 'Premium Analiz', baslangic: '2023-11-01', bitis: '2024-10-31', bedel: 450000 },
  { id: 4, firma: 'Zirve E-Ticaret', tur: 'Aylık Raporlama', baslangic: '2024-02-01', bitis: '2024-05-10', bedel: 60000 },
  { id: 5, firma: 'Nova Sağlık', tur: 'Aylık Danışmanlık', baslangic: '2024-03-01', bitis: '2025-03-01', bedel: 120000 },
];

export default function SozlesmelerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const bugun = new Date();

  const handleExport = () => {
    toast.success('Sözleşmeler Excel dosyası olarak indiriliyor...');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Yeni sözleşme eklendi.');
    setModalOpen(false);
  };

  const getDurumBadge = (bitis: string) => {
    const diff = differenceInDays(new Date(bitis), bugun);
    if (diff < 0) return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200 border-none">Sona Erdi</Badge>;
    if (diff <= 30) return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Yaklaşıyor</Badge>;
    return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Aktif</Badge>;
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tüm Sözleşmeler</h1>
          <p className="text-sm text-slate-500 mt-1">Platformdaki tüm firmaların sözleşme yönetimi.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel'e Aktar
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md" />}>
              <Plus className="w-4 h-4 mr-2" /> Yeni Sözleşme
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Yeni Sözleşme Ekle</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Firma Adı</Label><Input required placeholder="Firma adını girin..." /></div>
                <div className="space-y-2"><Label>Sözleşme Türü</Label><Input required placeholder="Örn: Yıllık Danışmanlık" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Başlangıç</Label><Input type="date" required /></div>
                  <div className="space-y-2"><Label>Bitiş</Label><Input type="date" required /></div>
                </div>
                <div className="space-y-2"><Label>Sözleşme Bedeli (₺)</Label><Input type="number" required /></div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>İptal</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Kaydet</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6 h-12">Firma Adı</TableHead>
                <TableHead>Sözleşme Türü</TableHead>
                <TableHead>Başlangıç</TableHead>
                <TableHead>Bitiş</TableHead>
                <TableHead>Kalan Gün</TableHead>
                <TableHead>Bedel (₺)</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right pr-6">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SOZLESMELER.map(s => {
                const kalan = Math.ceil(differenceInDays(new Date(s.bitis), bugun));
                return (
                  <TableRow key={s.id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-bold">{s.firma}</TableCell>
                    <TableCell className="text-slate-500 font-medium">{s.tur}</TableCell>
                    <TableCell className="text-sm">{format(new Date(s.baslangic), 'dd MMM yyyy', {locale:tr})}</TableCell>
                    <TableCell className={`text-sm ${kalan <= 30 ? 'font-bold' : ''}`}>{format(new Date(s.bitis), 'dd MMM yyyy', {locale:tr})}</TableCell>
                    <TableCell>
                      {kalan < 0 ? <span className="text-red-600 font-bold">{-kalan} gün geçti</span> : 
                       kalan <= 30 ? <span className="text-amber-600 font-bold">{kalan} gün kaldı</span> : 
                       <span className="text-emerald-600">{kalan} gün</span>}
                    </TableCell>
                    <TableCell className="font-bold">₺{s.bedel.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{getDurumBadge(s.bitis)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900">Görüntüle</Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
