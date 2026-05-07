'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Building2, Upload, FileText, CheckCircle2, AlertTriangle,
  Lock, Sparkles, Calendar, Eye, EyeOff, Loader2, X, Shield, ArrowRight
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser } from '@/lib/auth';
import { ocrFirmam, saveOcrFinansalTaslak, saveLocalFirma } from '@/lib/api';

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
type FirmaDurum = 'yok' | 'bekliyor' | 'onaylandi';

function OcrTag({ field, fields }: { field: string; fields: Set<string> }) {
  if (!fields.has(field)) return null;
  return (
    <Badge variant="outline" className="ml-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 text-[10px] shadow-none flex items-center gap-1 font-bold">
      <Sparkles className="w-3 h-3" /> AI
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
  sozlesme: { tur: 'Premium Analiz', baslangic: '2024-01-01', bitis: '2024-12-31', bedel: 450000 },
};

export default function FirmaBilgileriPage() {
  const [durum, setDurum] = useState<FirmaDurum>('yok');
  const firmaVar = durum !== 'yok';
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrFields, setOcrFields] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [bedelGoster, setBedelGoster] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FirmaFormValues>({
    resolver: zodResolver(firmaSchema),
    defaultValues: firmaVar ? { ...MOCK_FIRMA } : {},
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

        saveOcrFinansalTaslak(data);
        setOcrFields(filled);
        setOcrProgress(100);
        toast.success(filled.size > 0 ? 'Belge analiz edildi, yapay zeka alanları doldurdu.' : 'Belge analiz edildi fakat form verisi bulunamadı.', { icon: '✨' });
      })
      .catch(error => toast.error(error instanceof Error ? error.message : 'Belge analiz edilemedi.'))
      .finally(() => setOcrLoading(false));
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
      try {
        saveLocalFirma({
          unvan: data.unvan, vergi_no: data.vergiNo, ticaret_sicil: data.sicilNo || '',
          kurulus_tarihi: data.kurulusTarihi || '', faaliyet_alani: data.faaliyetAlani || '',
          yetkili_kisi: data.yetkiliKisi, telefon: data.telefon || '', adres: data.adres || '',
          yillik_ciro: data.yillikCiro ? Number(data.yillikCiro.replace(/\D/g, '')) : 0, onaylandi: true,
        });
        toast.success('Firma kaydı başarıyla oluşturuldu!', { description: 'Sistem sizi finansal raporunuza yönlendirebilir.' });
        setDurum('onaylandi');
      } finally {
        setIsSubmitting(false);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[900px] mx-auto pb-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          {durum === 'yok' ? 'Şirketinizi Dijitale Taşıyın' : 'Kurumsal Profil'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
          {durum === 'yok' ? 'Pro Sicht algoritmalarının firmanızı analiz edebilmesi için resmi kayıtlarınızı oluşturun.' : 'Şirket verilerinizi ve yasal sözleşmelerinizi bu alandan yönetebilirsiniz.'}
        </p>
      </div>

      {durum === 'bekliyor' && (
        <div className="flex items-start gap-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-in fade-in-50 duration-500">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-amber-800 dark:text-amber-300 text-lg">Onay Sürecinde</h3>
            <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1 font-medium">Uzman ekibimiz firma verilerinizi inceliyor. Bu süreçte bilgilerinizi güncelleyebilirsiniz.</p>
          </div>
        </div>
      )}

      {durum === 'onaylandi' && (
        <div className="flex items-start gap-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in-50 duration-500">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">Profil Doğrulandı</h3>
            <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1 font-medium">Şirket profiliniz tamamen onaylanmış durumda. Tüm premium raporlama araçlarına erişiminiz açıktır.</p>
          </div>
        </div>
      )}

      {durum === 'onaylandi' && (
        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[24px] overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4 px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <CardTitle className="text-lg font-bold">Resmi Sözleşme Durumu</CardTitle>
              </div>
              <Badge variant="outline" className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 shadow-none font-bold tracking-wider uppercase text-[10px]">
                Salt Okunur
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Hizmet Türü</p>
                <Badge variant="outline" className="bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-500/20 text-sm font-bold shadow-none px-3 py-1">
                  {MOCK_FIRMA.sozlesme.tur}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Geçerlilik Aralığı</p>
                <p className="font-extrabold text-slate-900 dark:text-white text-[15px]">
                  {MOCK_FIRMA.sozlesme.baslangic} <span className="text-slate-300 dark:text-slate-600 font-normal mx-1">→</span> {MOCK_FIRMA.sozlesme.bitis}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  Sözleşme Bedeli
                  <button onClick={() => setBedelGoster(!bedelGoster)} className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-slate-50 dark:bg-white/5 w-6 h-6 rounded-full flex items-center justify-center">
                    {bedelGoster ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </p>
                <p className="font-black text-xl text-slate-900 dark:text-white tracking-tight">
                  {bedelGoster ? `₺${MOCK_FIRMA.sozlesme.bedel.toLocaleString('tr-TR')}` : '••••••'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sisteme Kayıt</p>
                <p className="font-bold text-slate-600 dark:text-slate-300 text-[15px]">28 Nis 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`border-2 border-dashed rounded-[24px] overflow-hidden transition-all duration-300 ${dragOver ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#131b2e]/30 hover:border-slate-400 dark:hover:border-slate-500'}`}>
        <CardContent className="p-0">
          {ocrLoading ? (
            <div className="py-12 px-6 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gemini Belgelerinizi Analiz Ediyor...</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Form alanlarını otomatik doldurmak için belge işleniyor.</p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Progress value={ocrProgress} className="h-3 bg-slate-100 dark:bg-white/5 [&>div]:bg-indigo-500" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 text-right">% {ocrProgress}</p>
              </div>
            </div>
          ) : (
            <div
              className="py-12 px-6 flex flex-col items-center justify-center cursor-pointer group"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_10px_40px_rgba(99,102,241,0.2)] transition-all duration-300">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sihirli Doldurma</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-md">
                Vergi Levhası veya İmza Sirküsü içeren PDF/Görsel dosyasını buraya sürükleyin veya tıklayarak seçin.
              </p>
              <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              <div className="mt-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl">
                <Sparkles className="w-4 h-4" /> AI ile anında form doldur
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-none bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 rounded-[24px] overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-5 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[14px] bg-slate-900 dark:bg-white flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white dark:text-slate-900" />
              </div>
              <div>
                <CardTitle className="text-xl font-extrabold">{durum === 'yok' ? 'Firma Bilgilerini Girin' : 'Kayıtlı Bilgileriniz'}</CardTitle>
                <CardDescription className="font-medium mt-1">Sistemin raporlama yeteneklerini kullanabilmek için bilgilerin doğruluğundan emin olun.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500">1</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">Yasal Bilgiler</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Firma Ünvanı *<OcrTag field="unvan" fields={ocrFields} /></Label>
                  <Input {...register('unvan')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="Tam şirket ünvanı" />
                  {errors.unvan && <p className="text-xs font-bold text-rose-500 mt-1">{errors.unvan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Vergi Numarası *<OcrTag field="vergiNo" fields={ocrFields} /></Label>
                  <Input {...register('vergiNo')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="10 haneli VKN" maxLength={10} />
                  {errors.vergiNo && <p className="text-xs font-bold text-rose-500 mt-1">{errors.vergiNo.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Ticaret Sicil No<OcrTag field="sicilNo" fields={ocrFields} /></Label>
                  <Input {...register('sicilNo')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="Ticaret sicil numarası" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Kuruluş Tarihi<OcrTag field="kurulusTarihi" fields={ocrFields} /></Label>
                  <Input {...register('kurulusTarihi')} type="date" className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Faaliyet Sektörü<OcrTag field="faaliyetAlani" fields={ocrFields} /></Label>
                  <Input {...register('faaliyetAlani')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="Ana faaliyet alanınızı belirtin" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-500">2</div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">İletişim & Finans</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Firma Yetkilisi *<OcrTag field="yetkiliKisi" fields={ocrFields} /></Label>
                  <Input {...register('yetkiliKisi')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="Yetkili ad ve soyad" />
                  {errors.yetkiliKisi && <p className="text-xs font-bold text-rose-500 mt-1">{errors.yetkiliKisi.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Telefon<OcrTag field="telefon" fields={ocrFields} /></Label>
                  <Input {...register('telefon')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="+90 (___) ___ __ __" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300 gap-2">E-posta <Lock className="w-3.5 h-3.5 text-slate-400" /></Label>
                  <Input {...register('email')} className="h-12 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 rounded-xl" disabled />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Yıllık Ciro Hacmi (₺)<OcrTag field="yillikCiro" fields={ocrFields} /></Label>
                  <Input {...register('yillikCiro')} type="number" className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" placeholder="Tahmini ciro (TL)" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="flex items-center font-bold text-slate-700 dark:text-slate-300">Açık Adres<OcrTag field="adres" fields={ocrFields} /></Label>
                  <Textarea {...register('adres')} className="resize-none h-24 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl pt-3" placeholder="Merkez ofis adresi..." />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-white/5 mt-8">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-extrabold text-base shadow-xl shadow-slate-900/20 dark:shadow-white/20 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Kaydediliyor...</>
                ) : (
                  <>Kaydı Tamamla <ArrowRight className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
