'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Edit2, Trash2, CheckCircle2, ChevronLeft, Calendar as CalendarIcon, Phone, MapPin, Briefcase, FileText, PlusCircle, UploadCloud, Sparkles, Loader2, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { getFirma, updateFirma, deleteFirma, ocrFirma } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAltFirmalar, useCreateFirma, useDeleteFirma } from '@/hooks/useFirmalar';
import FirmaForm from '@/components/firma/FirmaForm';

const FirmaHarita = dynamic(() => import('@/components/shared/FirmaHarita'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-[2rem] bg-white/5 border border-white/10 animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-slate-500 animate-bounce" />
    </div>
  ),
});

export default function FirmaDetayPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAltFirmaModalOpen, setIsAltFirmaModalOpen] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [altFirmaForm, setAltFirmaForm] = useState({ unvan: '', vergi_no: '', telefon: '', yetkili_kisi: '', adres: '' });

  const { data: altFirmalarResponse } = useAltFirmalar(id);
  const altFirmalar = altFirmalarResponse?.data || [];
  const createAltFirmaMutation = useCreateFirma();
  const deleteAltFirmaMutation = useDeleteFirma();

  const handleAddAltFirma = () => {
    if (!altFirmaForm.unvan) {
      toast.error('Ünvan zorunludur.');
      return;
    }
    createAltFirmaMutation.mutate({
      ...altFirmaForm,
      parent_id: id,
      sozlesme_turu: firma?.sozlesme_turu || 'diger',
    }, {
      onSuccess: () => {
        setIsAltFirmaModalOpen(false);
        setAltFirmaForm({ unvan: '', vergi_no: '', telefon: '', yetkili_kisi: '', adres: '' });
        queryClient.invalidateQueries({ queryKey: ['alt_firmalar', id] });
      }
    });
  };

  const handleOcrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Lütfen PDF, JPG, PNG veya WEBP formatında bir dosya seçin.');
      return;
    }

    setIsOcrLoading(true);
    const toastId = toast.loading('Belge analiz ediliyor...');

    try {
      const response = await ocrFirma('temp_id', file);
      const ocrData = response.data;
      
      setAltFirmaForm(prev => ({
        ...prev,
        unvan: ocrData.unvan || prev.unvan,
        vergi_no: ocrData.vergi_no || prev.vergi_no,
        yetkili_kisi: ocrData.yetkili_kisi || prev.yetkili_kisi,
        telefon: ocrData.telefon || prev.telefon,
        adres: ocrData.adres || prev.adres,
      }));
      
      toast.success('Belge başarıyla okundu ve form dolduruldu.', { id: toastId });
    } catch (error) {
      toast.error('Belge okunamadı, lütfen manuel doldurun.', { id: toastId });
    } finally {
      setIsOcrLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const { data: firmaResponse, isLoading } = useQuery({
    queryKey: ['firma', id],
    queryFn: async () => await getFirma(id),
  });
  const firma = firmaResponse?.data;

  const onayMutation = useMutation({
    mutationFn: () => updateFirma(id, { onaylandi: true }),
    onSuccess: () => {
      toast.success('Firma onaylandı.');
      queryClient.invalidateQueries({ queryKey: ['firma', id] });
      queryClient.invalidateQueries({ queryKey: ['firmalar'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFirma(id),
    onSuccess: () => {
      toast.success('Firma silindi.');
      router.push('/firmalar');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!firma) {
    return <div className="text-center p-12 text-slate-500 font-medium">Aradığınız firma bulunamadı.</div>;
  }

  const getSozlesmeBadgeColor = (turu: string) => {
    switch(turu) {
      case 'rapor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'analiz': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'sistem': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ÜST BÖLÜM: Firma Başlığı ve Aksiyonlar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Dekoratif Arkaplan */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="flex items-start gap-5 relative z-10">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="mt-1 shrink-0 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{firma.unvan}</h1>
              <Badge variant="outline" className={`uppercase tracking-wider font-bold ${getSozlesmeBadgeColor(firma.sozlesme_turu)}`}>
                {firma.sozlesme_turu} Sözleşmesi
              </Badge>
              {firma.parent_id && (
                <Badge variant="secondary" className="cursor-pointer border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-none" onClick={() => router.push(`/firmalar/${firma.parent_id}`)}>
                  ↑ Ana Firmaya Dön
                </Badge>
              )}
              {firma.onaylandi ? (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">Onaylı</Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 border-amber-300 dark:border-amber-700/50">Onay Bekliyor</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
              <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4"/> VKN: {firma.vergi_no}</div>
              {firma.yetkili_kisi && <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> Yetkili: {firma.yetkili_kisi}</div>}
              {firma.telefon && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4"/> {firma.telefon}</div>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {!firma.onaylandi && (
            <Button 
              onClick={() => onayMutation.mutate()} 
              disabled={onayMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Onayla
            </Button>
          )}
          <Button 
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)} 
            className={isEditMode ? "bg-slate-800 hover:bg-slate-900 text-white" : "border-blue-200 hover:bg-blue-50 text-blue-700 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"}
          >
            <Edit2 className="w-4 h-4 mr-2" /> {isEditMode ? 'Düzenlemeyi İptal Et' : 'Düzenle'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<button type="button" className="inline-flex items-center justify-center rounded-md border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20 h-9 w-9 text-sm font-medium transition-colors" />}>
              <Trash2 className="w-4 h-4" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Firmayı Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  {firma.unvan} firmasını kalıcı olarak sileceksiniz. Onaylıyor musunuz?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-red-600 hover:bg-red-700 text-white">Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isEditMode ? (
        <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-2">
          <FirmaForm initialData={firma} />
        </div>
      ) : (
        <Tabs defaultValue="bilgiler" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none h-12 p-0 space-x-6 overflow-x-auto mb-6">
            <TabsTrigger value="bilgiler" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-2 data-[state=active]:shadow-none text-base">
              Firma Bilgileri
            </TabsTrigger>
            <TabsTrigger value="finansal_rapor" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-2 data-[state=active]:shadow-none text-base">
              Finansal Rapor
            </TabsTrigger>
            <TabsTrigger value="finansal_durum" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-2 data-[state=active]:shadow-none text-base">
              Finansal Durum
            </TabsTrigger>
            <TabsTrigger value="yatirim" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-2 data-[state=active]:shadow-none text-base">
              Yatırım
            </TabsTrigger>
            <TabsTrigger value="sunum" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 px-2 data-[state=active]:shadow-none text-base">
              Ön Sunum
            </TabsTrigger>
          </TabsList>

          <div>
            <TabsContent value="bilgiler" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Kolon: Temel Bilgiler */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Genel Bilgiler
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 text-sm">
                        <div>
                          <dt className="text-slate-500 mb-1">Şirket Unvanı</dt>
                          <dd className="font-semibold text-slate-900 dark:text-slate-100 text-base">{firma.unvan}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 mb-1">Vergi Numarası</dt>
                          <dd className="font-semibold text-slate-900 dark:text-slate-100 text-base">{firma.vergi_no}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 mb-1">Ticaret Sicil No</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">{firma.ticaret_sicil || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 mb-1">Kuruluş Tarihi</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">
                            {firma.kurulus_tarihi ? format(new Date(firma.kurulus_tarihi), 'dd MMMM yyyy', { locale: tr }) : '-'}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-slate-500 mb-1">Faaliyet Alanı</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">{firma.faaliyet_alani || '-'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        İletişim Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 text-sm">
                        <div>
                          <dt className="text-slate-500 mb-1">Yetkili Kişi</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">{firma.yetkili_kisi || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-500 mb-1">Telefon</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200">{firma.telefon || '-'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-slate-500 mb-1">Kayıtlı Adres</dt>
                          <dd className="font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{firma.adres || '-'}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* 🗺️ Firma Konumu Haritası */}
                  <Card className="shadow-sm border border-white/10 dark:border-white/5 bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pb-3 border-b border-white/5">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-indigo-400" />
                        Firma Konumu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <FirmaHarita
                        firmaAdi={firma.unvan}
                        adres={firma.adres || 'İstanbul, Türkiye'}
                        className="h-[300px] rounded-b-[2.5rem]"
                      />
                      {firma.adres && (
                        <div className="px-6 py-4 border-t border-white/5 flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-400 leading-relaxed">{firma.adres}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sağ Kolon: Sözleşme & Finansal Özet */}
                <div className="space-y-6">
                  <Card className="shadow-sm bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <CardHeader className="pb-3 border-b border-blue-100/50 dark:border-blue-900/30">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Sözleşme Detayları
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <dl className="space-y-5 text-sm">
                        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                          <dt className="text-slate-600 dark:text-slate-400">Sözleşme Türü</dt>
                          <dd className="font-bold uppercase tracking-wider">{firma.sozlesme_turu}</dd>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                          <dt className="text-slate-600 dark:text-slate-400">Başlangıç</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            {firma.sozlesme_baslangic ? format(new Date(firma.sozlesme_baslangic), 'dd MMM yyyy', { locale: tr }) : '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                          <dt className="text-slate-600 dark:text-slate-400">Bitiş</dt>
                          <dd className={`font-medium flex items-center gap-1.5 ${firma.sozlesme_bitis && new Date(firma.sozlesme_bitis) < new Date() ? 'text-red-500 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            {firma.sozlesme_bitis ? format(new Date(firma.sozlesme_bitis), 'dd MMM yyyy', { locale: tr }) : '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between items-center">
                          <dt className="text-slate-600 dark:text-slate-400">Sözleşme Bedeli</dt>
                          <dd className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {firma.sozlesme_bedeli ? `₺${firma.sozlesme_bedeli.toLocaleString('tr-TR')}` : '-'}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                      <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="text-slate-500">Yıllık Ciro</span>
                        <span className="font-bold text-base">{firma.yillik_ciro ? `₺${firma.yillik_ciro.toLocaleString('tr-TR')}` : '-'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Sisteme Kayıt</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {format(new Date(firma.created_at), 'dd MMM yyyy', { locale: tr })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Alt Firmalar (Opsiyonel) */}
              {!firma.parent_id && (
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Alt Firmalar & Şubeler</h4>
                      <p className="text-sm text-slate-500">Bu firmaya bağlı olan bağımsız iştirakler ve şubeler.</p>
                    </div>
                    <Dialog open={isAltFirmaModalOpen} onOpenChange={setIsAltFirmaModalOpen}>
                      <DialogTrigger render={<Button variant="outline" className="shadow-sm" />}>
                        <PlusCircle className="w-4 h-4 mr-2" /> Alt Firma Ekle
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Yeni Alt Firma/Şube Ekle</DialogTitle>
                        </DialogHeader>
                        
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <UploadCloud className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">Otomatik Doldur</p>
                              <p className="text-xs text-slate-500">Vergi levhası yükleyerek hızlıca doldurun.</p>
                            </div>
                          </div>
                          <div>
                            <input type="file" id="alt-ocr-upload" className="hidden" accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleOcrUpload} disabled={isOcrLoading} />
                            <Button type="button" size="sm" variant="outline" onClick={() => document.getElementById('alt-ocr-upload')?.click()} disabled={isOcrLoading}>
                              {isOcrLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1 text-blue-500" />}
                              Yükle
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 py-2">
                          <div className="grid gap-2">
                            <Label htmlFor="unvan">Ünvan</Label>
                            <Input id="unvan" value={altFirmaForm.unvan} onChange={(e) => setAltFirmaForm({ ...altFirmaForm, unvan: e.target.value })} placeholder="Firma Ünvanı" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="vergi_no">Vergi No</Label>
                            <Input id="vergi_no" value={altFirmaForm.vergi_no} onChange={(e) => setAltFirmaForm({ ...altFirmaForm, vergi_no: e.target.value })} placeholder="Vergi Numarası" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="yetkili">Yetkili Kişi</Label>
                            <Input id="yetkili" value={altFirmaForm.yetkili_kisi} onChange={(e) => setAltFirmaForm({ ...altFirmaForm, yetkili_kisi: e.target.value })} placeholder="Yetkili Ad Soyad" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tel">Telefon</Label>
                            <Input id="tel" value={altFirmaForm.telefon} onChange={(e) => setAltFirmaForm({ ...altFirmaForm, telefon: e.target.value })} placeholder="Telefon Numarası" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="adres">Adres</Label>
                            <Input id="adres" value={altFirmaForm.adres} onChange={(e) => setAltFirmaForm({ ...altFirmaForm, adres: e.target.value })} placeholder="Adres" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAltFirmaModalOpen(false)}>İptal</Button>
                          <Button onClick={handleAddAltFirma} disabled={createAltFirmaMutation.isPending}>
                            {createAltFirmaMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {altFirmalar.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {altFirmalar.map((alt) => (
                        <Card key={alt.id} className="group hover:shadow-md transition-all border-l-4 border-l-blue-500 relative cursor-pointer" onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.delete-btn')) return;
                          router.push(`/firmalar/${alt.id}`);
                        }}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base truncate pr-8" title={alt.unvan}>{alt.unvan}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-1 pb-4">
                            <p className="text-sm text-slate-500">Vergi No: {alt.vergi_no || '-'}</p>
                            <p className="text-sm text-slate-500 truncate">Yetkili: {alt.yetkili_kisi || '-'}</p>
                          </CardContent>
                          
                          <AlertDialog>
                            <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 delete-btn transition-opacity" />}>
                              <Trash2 className="w-4 h-4" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>Bu alt firmayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="delete-btn">İptal</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700 delete-btn" onClick={() => {
                                  deleteAltFirmaMutation.mutate(alt.id, {
                                    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alt_firmalar', id] })
                                  });
                                }}>Sil</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                      Bu firmaya ait henüz bir alt firma / şube eklenmemiş.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="finansal_rapor" className="outline-none">
              <Card className="border-none shadow-none bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Finansal Rapor Paneli</h3>
                  <p className="text-slate-500 mb-8 max-w-lg text-lg">
                    Firmanın bilançosunu, gelir-gider tablolarını görüntüleyin ve yapay zeka ile otomatik finansal analiz raporları üretin.
                  </p>
                  <Button size="lg" onClick={() => router.push(`/finansal-rapor/${id}`)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
                    Finansal Raporu Aç
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finansal_durum" className="outline-none">
              <Card className="border-none shadow-none bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Finansal Durum</h3>
                  <p className="text-slate-500 mb-8 max-w-lg text-lg">Bankalar, bekleyen tahsilatlar ve nakit akış durumunu detaylı inceleyin.</p>
                  <Button size="lg" onClick={() => router.push(`/finansal-durum/${id}`)} className="shadow-md">
                    Finansal Durumu Görüntüle
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yatirim" className="outline-none">
              <Card className="border-none shadow-none bg-slate-50/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Yatırım & Portföy</h3>
                  <p className="text-slate-500 mb-8 max-w-lg text-lg">Firmanın yatırım stratejileri ve portföy dağılımları.</p>
                  <Button size="lg" variant="outline" onClick={() => router.push(`/yatirim/${id}`)} className="shadow-sm">
                    Yatırım Sayfasını Aç
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sunum" className="outline-none">
              <Card className="border-none shadow-none bg-purple-50/50 dark:bg-purple-900/10 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Briefcase className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Otomatik Ön Sunum</h3>
                  <p className="text-slate-500 mb-8 max-w-lg text-lg">
                    Yapay zeka asistanı sayesinde firmanın tüm mali yapısını tek tıkla profesyonel bir PowerPoint (.pptx) dosyasına dönüştürün.
                  </p>
                  <Button size="lg" onClick={() => router.push(`/on-sunum/${id}`)} className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 text-white border-0">
                    .pptx Sunum Oluştur
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}
