'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Building2, Upload, FileText, CheckCircle2, AlertTriangle,
  Lock, Sparkles, Calendar, Eye, EyeOff, Loader2, X, Shield
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/auth';
import { ocrFirmam, saveOcrFinansalTaslak } from '@/lib/api';

// ZOD SCHEMA
const firmaSchema = z.object({
  unvan: z.string().min(2, 'Firma ünvanı en az 2 karakter olmalıdır.'),
  vergiNo: z.string().regex(/^\d{10}$/, 'Vergi numarası 10 haneli rakam olmalıdır.'),
  sicilNo: z.string().optional(),
  kurulusTarihi: z.string().optional(),
  faaliyetAlani: z.string().optional(),
  yetkiliKisi: z.string().min(2, 'Yetkili kişi adı zorunludur.'),
  telefon: z.string().optional(),
  email: z.string().email().optional(),
  adres: z.string().optional(),
  yillikCiro: z.string().optional(),
});

type FirmaFormValues = z.infer<typeof firmaSchema>;

// MOCK: Firma durumu. 'yok' | 'bekliyor' | 'onaylandi'
type FirmaDurum = 'yok' | 'bekliyor' | 'onaylandi';

function OcrTag({ field, fields }: { field: string; fields: Set<string> }) {
  if (!fields.has(field)) return null;
  return (
    <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-[10px] shadow-none">
      <Sparkles className="w-3 h-3 mr-1" /> AI ile dolduruldu
    </Badge>
  );
}

const MOCK_FIRMA = {
  unvan: '',
  vergiNo: '1234567890',
  sicilNo: '987654',
  kurulusTarihi: '2018-03-15',
  faaliyetAlani: 'Yazılım Geliştirme',
  yetkiliKisi: '',
  telefon: '+90 532 123 45 67',
  email: '',
  adres: 'Maslak Mah. AOS 55. Sk. No:2 Sarıyer/İstanbul',
  yillikCiro: '12500000',
  // Sözleşme (readonly)
  sozlesme: {
    tur: 'Premium Analiz',
    baslangic: '2024-01-01',
    bitis: '2024-12-31',
    bedel: 450000,
  },
  sonGuncelleme: '2024-04-28T14:30:00Z',
};

export default function FirmaBilgileriPage() {
  // Mock durum — gerçekte API'den gelecek
  const [durum] = useState<FirmaDurum>('yok');
  const firmaVar = durum !== 'yok';

  // OCR State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrFields, setOcrFields] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  // Sözleşme bedeli göster/gizle
  const [bedelGoster, setBedelGoster] = useState(false);

  // Form submit loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FirmaFormValues>({
    resolver: zodResolver(firmaSchema),
    defaultValues: firmaVar ? {
      unvan: MOCK_FIRMA.unvan,
      vergiNo: MOCK_FIRMA.vergiNo,
      sicilNo: MOCK_FIRMA.sicilNo,
      kurulusTarihi: MOCK_FIRMA.kurulusTarihi,
      faaliyetAlani: MOCK_FIRMA.faaliyetAlani,
      yetkiliKisi: MOCK_FIRMA.yetkiliKisi,
      telefon: MOCK_FIRMA.telefon,
      email: MOCK_FIRMA.email,
      adres: MOCK_FIRMA.adres,
      yillikCiro: MOCK_FIRMA.yillikCiro,
    } : {},
  });

  useEffect(() => {
    getCurrentUser().then(user => {
      if (!user) return;
      if (user.firmaAdi) setValue('unvan', user.firmaAdi);
      if (user.name) setValue('yetkiliKisi', user.name);
      setValue('email', user.email);
    });
  }, [setValue]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const applyOcrData = useCallback((file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Lütfen PDF, JPG, PNG veya WEBP formatında bir dosya seçin.');
      return;
    }

    setOcrLoading(true);
    setOcrProgress(20);
    ocrFirmam(file)
      .then(({ data }) => {
        const filled = new Set<string>();
        if (data.unvan) { setValue('unvan', data.unvan); filled.add('unvan'); }
        if (data.vergi_no) { setValue('vergiNo', data.vergi_no); filled.add('vergiNo'); }
        if (data.ticaret_sicil) { setValue('sicilNo', data.ticaret_sicil); filled.add('sicilNo'); }
        if (data.kurulus_tarihi) { setValue('kurulusTarihi', data.kurulus_tarihi); filled.add('kurulusTarihi'); }
        if (data.faaliyet_alani) { setValue('faaliyetAlani', data.faaliyet_alani); filled.add('faaliyetAlani'); }
        if (data.yetkili_kisi) { setValue('yetkiliKisi', data.yetkili_kisi); filled.add('yetkiliKisi'); }
        if (data.telefon) { setValue('telefon', data.telefon); filled.add('telefon'); }
        if (data.adres) { setValue('adres', data.adres); filled.add('adres'); }
        if (data.yillik_ciro) { setValue('yillikCiro', String(data.yillik_ciro)); filled.add('yillikCiro'); }

        const finansalTaslak = saveOcrFinansalTaslak(data);
        setOcrFields(filled);
        setOcrProgress(100);
        toast.success(finansalTaslak ? 'Belge analiz edildi; firma formu ve finansal rapor verileri dolduruldu.' : filled.size > 0 ? 'Belge analiz edildi, bulunan alanlar dolduruldu.' : 'Belge analiz edildi fakat forma uygun veri bulunamadi.');
      })
      .catch(error => {
        toast.error(error instanceof Error ? error.message : 'Belge analiz edilemedi.');
      })
      .finally(() => {
        setOcrLoading(false);
      });
  }, [setValue]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyOcrData(file);
  }, [applyOcrData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) applyOcrData(file);
    event.target.value = '';
  };

  const onSubmit = (data: FirmaFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (durum === 'yok') {
        toast.success('Kaydınız alındı!', { description: 'Firma bilgileriniz admin onayına gönderildi.' });
      } else {
        toast.success('Bilgileriniz güncellendi.');
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-[900px] mx-auto pb-12">

      {/* BAŞLIK */}
      <div>
        {durum === 'yok' ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight">Firmanızı Kaydedin 🏢</h1>
            <p className="text-slate-500 mt-1">Finansal raporlarınıza erişmek için önce firma bilgilerinizi girin.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Firma Bilgileri</h1>
            <p className="text-slate-500 mt-1">Şirket bilgilerinizi görüntüleyin ve güncelleyin.</p>
          </>
        )}
      </div>

      {/* DURUM BANNERLARI */}
      {durum === 'bekliyor' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">Firma kaydınız admin onayı bekliyor</p>
            <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mt-1">Bilgilerinizi güncelleyebilirsiniz. Güncelleme talebiniz admin ekibine iletilecektir.</p>
          </div>
        </div>
      )}

      {durum === 'onaylandi' && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">Hesabınız aktif ✓</p>
            <p className="text-sm text-emerald-700/70 dark:text-emerald-300/70 mt-1">Tüm özelliklere erişebilirsiniz. Bilgilerinizi istediğiniz zaman güncelleyebilirsiniz.</p>
          </div>
        </div>
      )}

      {/* OCR BELGE YÜKLEME */}
      <Card className="shadow-sm border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        <CardContent className="p-6">
          {ocrLoading ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-teal-100 dark:bg-teal-900/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Belgeniz yapay zeka ile analiz ediliyor...</h4>
                <p className="text-sm text-slate-500 mt-1">Vergi levhası, ticaret sicil belgesi veya imza sirkülerinden bilgiler çıkarılıyor.</p>
              </div>
              <div className="max-w-xs mx-auto space-y-1">
                <Progress value={Math.min(ocrProgress, 100)} className="h-2" />
                <p className="text-xs text-slate-500 text-right">%{Math.min(Math.round(ocrProgress), 100)}</p>
              </div>
            </div>
          ) : (
            <div
              className={`text-center py-8 transition-colors rounded-xl ${dragOver ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-400' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200">Belgeden Otomatik Doldur</h4>
              <p className="text-sm text-slate-500 mt-1 mb-4">PDF, JPG, PNG veya WEBP dosyanızı sürükleyin veya seçin (max 15MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <FileText className="w-4 h-4 mr-2" /> Dosya Seç
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <CardTitle>{durum === 'yok' ? 'Yeni Firma Kaydı' : 'Firma Bilgileri'}</CardTitle>
                <CardDescription>Zorunlu alanlar (*) ile işaretlenmiştir.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">

            {/* Bölüm 1 — Temel Bilgiler */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">Temel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center">Firma Ünvanı *<OcrTag field="unvan" fields={ocrFields} /></Label>
                  <Input {...register('unvan')} className="h-11" placeholder="Örn: ABC Yazılım A.Ş." />
                  {errors.unvan && <p className="text-xs text-red-500">{errors.unvan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">Vergi Numarası *<OcrTag field="vergiNo" fields={ocrFields} /></Label>
                  <Input {...register('vergiNo')} className="h-11" placeholder="10 haneli rakam" maxLength={10} />
                  {errors.vergiNo && <p className="text-xs text-red-500">{errors.vergiNo.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center">Ticaret Sicil Numarası<OcrTag field="sicilNo" fields={ocrFields} /></Label>
                  <Input {...register('sicilNo')} className="h-11" placeholder="Opsiyonel" />
                </div>
                <div className="space-y-2">
                  <Label>Kuruluş Tarihi</Label>
                  <Input {...register('kurulusTarihi')} type="date" className="h-11" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center">Faaliyet Alanı<OcrTag field="faaliyetAlani" fields={ocrFields} /></Label>
                  <Input {...register('faaliyetAlani')} className="h-11" placeholder="Örn: Yazılım Geliştirme" />
                </div>
              </div>
            </div>

            {/* Bölüm 2 — İletişim */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b pb-2">İletişim Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center">Yetkili Kişi Adı *<OcrTag field="yetkiliKisi" fields={ocrFields} /></Label>
                  <Input {...register('yetkiliKisi')} className="h-11" placeholder="Adınız Soyadınız" />
                  {errors.yetkiliKisi && <p className="text-xs text-red-500">{errors.yetkiliKisi.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input {...register('telefon')} className="h-11" placeholder="+90 5XX XXX XX XX" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">E-posta <Lock className="w-3 h-3 text-slate-400" /></Label>
                  <Input {...register('email')} className="h-11 bg-slate-50 dark:bg-slate-800/50" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Yıllık Ciro (₺)</Label>
                  <Input {...register('yillikCiro')} type="number" className="h-11" placeholder="Opsiyonel" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center">Adres<OcrTag field="adres" fields={ocrFields} /></Label>
                  <Textarea {...register('adres')} className="resize-none h-20" placeholder="Kayıtlı adres..." />
                </div>
              </div>
            </div>

            {/* Kaydet Butonu */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-semibold shadow-lg text-base"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Kaydediliyor...</>
                ) : durum === 'yok' ? (
                  'Firma Kaydını Oluştur'
                ) : (
                  'Bilgileri Güncelle'
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>

      {/* MEVCUT BİLGİLER ÖZETİ (onaylı firma) */}
      {durum === 'onaylandi' && (
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <CardTitle className="text-lg">Sözleşme Bilgileri</CardTitle>
              </div>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 shadow-none flex items-center gap-1">
                <Lock className="w-3 h-3" /> Sadece Admin Değiştirebilir
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sözleşme Türü</p>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-sm">{MOCK_FIRMA.sozlesme.tur}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sözleşme Dönemi</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {MOCK_FIRMA.sozlesme.baslangic} <span className="text-slate-300 mx-1">→</span> {MOCK_FIRMA.sozlesme.bitis}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-2">
                  Sözleşme Bedeli
                  <button onClick={() => setBedelGoster(!bedelGoster)} className="text-slate-400 hover:text-teal-600 transition-colors">
                    {bedelGoster ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </p>
                <p className="font-bold text-lg text-slate-900 dark:text-white">
                  {bedelGoster ? `₺${MOCK_FIRMA.sozlesme.bedel.toLocaleString('tr-TR')}` : '••••••'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Son Güncelleme</p>
                <p className="text-sm text-slate-600">28 Nisan 2024, 14:30</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
