'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadCloud, Loader2, Sparkles, Building2, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Firma } from '@/types';
import { createFirma, updateFirma, ocrFirma } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const firmaSchema = z.object({
  unvan: z.string().min(2, 'Şirket ünvanı en az 2 karakter olmalıdır'),
  vergi_no: z.string().regex(/^\d{10}$/, 'Vergi numarası 10 haneli rakam olmalıdır'),
  ticaret_sicil: z.string().optional(),
  kurulus_tarihi: z.date().optional(),
  faaliyet_alani: z.string().optional(),
  yetkili_kisi: z.string().min(2, 'Yetkili kişi adı gereklidir'),
  telefon: z.string()
    .regex(/^(05|5)[0-9]{9}$|^(02|03|04)[0-9]{9}$/, 'Geçerli bir telefon numarası giriniz (örn: 05xx)')
    .optional()
    .or(z.literal('')),
  adres: z.string().optional(),
  yillik_ciro: z.coerce.number().optional(),
  sozlesme_turu: z.enum(['rapor', 'analiz', 'sistem', 'diger'], {
    error: 'Sözleşme türü seçilmelidir',
  }),
  sozlesme_baslangic: z.date().optional(),
  sozlesme_bitis: z.date().optional(),
  sozlesme_bedeli: z.coerce.number().optional(),
}).refine(data => {
  if (data.sozlesme_baslangic && data.sozlesme_bitis) {
    return data.sozlesme_bitis > data.sozlesme_baslangic;
  }
  return true;
}, {
  message: "Sözleşme bitiş tarihi, başlangıç tarihinden sonra olmalıdır.",
  path: ["sozlesme_bitis"],
});

type FirmaFormValues = z.infer<typeof firmaSchema>;

interface FirmaFormProps {
  initialData?: Firma;
  firmaId?: string;
}

export default function FirmaForm({ initialData, firmaId }: FirmaFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrFilledFields, setOcrFilledFields] = useState<Record<string, boolean>>({});

  const form = useForm<FirmaFormValues>({
    resolver: zodResolver(firmaSchema) as never,
    defaultValues: {
      unvan: initialData?.unvan || '',
      vergi_no: initialData?.vergi_no || '',
      ticaret_sicil: initialData?.ticaret_sicil || '',
      kurulus_tarihi: initialData?.kurulus_tarihi ? new Date(initialData.kurulus_tarihi) : undefined,
      faaliyet_alani: initialData?.faaliyet_alani || '',
      yetkili_kisi: initialData?.yetkili_kisi || '',
      telefon: initialData?.telefon || '',
      adres: initialData?.adres || '',
      yillik_ciro: initialData?.yillik_ciro || undefined,
      sozlesme_turu: initialData?.sozlesme_turu || undefined,
      sozlesme_baslangic: initialData?.sozlesme_baslangic ? new Date(initialData.sozlesme_baslangic) : undefined,
      sozlesme_bitis: initialData?.sozlesme_bitis ? new Date(initialData.sozlesme_bitis) : undefined,
      sozlesme_bedeli: initialData?.sozlesme_bedeli || undefined,
    },
  });

  const onSubmit = async (data: FirmaFormValues) => {
    try {
      const payload: Partial<Firma> = {
        ...data,
        kurulus_tarihi: data.kurulus_tarihi?.toISOString().split('T')[0],
        sozlesme_baslangic: data.sozlesme_baslangic?.toISOString().split('T')[0],
        sozlesme_bitis: data.sozlesme_bitis?.toISOString().split('T')[0],
      };

      if (initialData?.id) {
        await updateFirma(initialData.id, payload);
        toast.success('Firma başarıyla güncellendi.');
        queryClient.invalidateQueries({ queryKey: ['firma', initialData.id] });
        router.push(`/firmalar/${initialData.id}`);
      } else {
        const result = await createFirma(payload);
        toast.success('Yeni firma başarıyla eklendi.');
        queryClient.invalidateQueries({ queryKey: ['firmalar'] });
        router.push(`/firmalar/${result.data.id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    }
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
      const targetId = initialData?.id || firmaId || 'temp_firma_id';
      const response = await ocrFirma(targetId, file);
      const ocrData = response.data;
      
      const newOcrFlags: Record<string, boolean> = { ...ocrFilledFields };
      
      if (ocrData.unvan) { form.setValue('unvan', ocrData.unvan); newOcrFlags.unvan = true; }
      if (ocrData.vergi_no) { form.setValue('vergi_no', ocrData.vergi_no); newOcrFlags.vergi_no = true; }
      if (ocrData.ticaret_sicil) { form.setValue('ticaret_sicil', ocrData.ticaret_sicil); newOcrFlags.ticaret_sicil = true; }
      if (ocrData.faaliyet_alani) { form.setValue('faaliyet_alani', ocrData.faaliyet_alani); newOcrFlags.faaliyet_alani = true; }
      if (ocrData.yetkili_kisi) { form.setValue('yetkili_kisi', ocrData.yetkili_kisi); newOcrFlags.yetkili_kisi = true; }
      if (ocrData.telefon) { form.setValue('telefon', ocrData.telefon); newOcrFlags.telefon = true; }
      if (ocrData.adres) { form.setValue('adres', ocrData.adres); newOcrFlags.adres = true; }
      if (ocrData.yillik_ciro) { form.setValue('yillik_ciro', ocrData.yillik_ciro); newOcrFlags.yillik_ciro = true; }
      
      if (ocrData.kurulus_tarihi) { 
        try {
          const date = new Date(ocrData.kurulus_tarihi);
          if (!isNaN(date.getTime())) {
            form.setValue('kurulus_tarihi', date);
            newOcrFlags.kurulus_tarihi = true;
          }
        } catch(e) {}
      }

      setOcrFilledFields(newOcrFlags);
      toast.success('Belge başarıyla okundu ve alanlar dolduruldu.', { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Belge okunamadı, lütfen manuel doldurun.';
      toast.error(message, { id: toastId });
    } finally {
      setIsOcrLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  const renderOcrBadge = (fieldName: string) => {
    if (!ocrFilledFields[fieldName]) return null;
    return (
      <Badge variant="secondary" className="absolute -top-2.5 right-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300 text-[10px] px-1.5 py-0">
        <Sparkles className="w-3 h-3 mr-1 inline" /> AI
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* OCR Bölümü */}
      <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center shrink-0">
              <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Belgeden Otomatik Doldur (AI & OCR)</h3>
              <p className="text-sm text-slate-500">Vergi levhası veya ticaret sicil gazetesi yükleyerek formu otomatik doldurabilirsiniz.</p>
            </div>
          </div>
          <div className="shrink-0">
            <input 
              type="file" 
              id="ocr-upload" 
              className="hidden" 
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={handleOcrUpload}
              disabled={isOcrLoading}
            />
            <Button 
              type="button" 
              onClick={() => document.getElementById('ocr-upload')?.click()}
              disabled={isOcrLoading}
              className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              {isOcrLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isOcrLoading ? 'Belge Analiz Ediliyor...' : 'Belge Yükle'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bölüm 1 - Temel Bilgiler */}
            <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
              </div>
              
              <FormField
                control={form.control}
                name="unvan"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Şirket Ünvanı *</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Pro Sicht Teknoloji A.Ş." {...field} />
                    </FormControl>
                    {renderOcrBadge('unvan')}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vergi_no"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Vergi Numarası *</FormLabel>
                      <FormControl>
                        <Input placeholder="10 Haneli Rakam" maxLength={10} {...field} />
                      </FormControl>
                      {renderOcrBadge('vergi_no')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ticaret_sicil"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Ticaret Sicil No</FormLabel>
                      <FormControl>
                        <Input placeholder="Sicil No" {...field} />
                      </FormControl>
                      {renderOcrBadge('ticaret_sicil')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kurulus_tarihi"
                  render={({ field }) => (
                    <FormItem className="flex flex-col relative pt-1.5">
                      <FormLabel className="mb-1">Kuruluş Tarihi</FormLabel>
                      <Popover>
                        <FormControl>
                          <PopoverTrigger render={<Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} />}>
                            {field.value ? format(field.value, "dd MMMM yyyy", { locale: tr }) : <span>Tarih seçin</span>}
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {renderOcrBadge('kurulus_tarihi')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="faaliyet_alani"
                  render={({ field }) => (
                    <FormItem className="relative pt-1.5">
                      <FormLabel>Faaliyet Alanı</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Yazılım" {...field} />
                      </FormControl>
                      {renderOcrBadge('faaliyet_alani')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bölüm 2 - İletişim ve Adres */}
            <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">İletişim & Adres</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yetkili_kisi"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Yetkili Kişi Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ad Soyad" {...field} />
                      </FormControl>
                      {renderOcrBadge('yetkili_kisi')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefon"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="05XX XXX XX XX" {...field} />
                      </FormControl>
                      {renderOcrBadge('telefon')}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adres"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Kayıtlı Adres</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Açık adres..." className="resize-none h-20" {...field} />
                    </FormControl>
                    {renderOcrBadge('adres')}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yillik_ciro"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Yıllık Ciro</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₺</span>
                      <FormControl>
                        <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                      </FormControl>
                    </div>
                    {renderOcrBadge('yillik_ciro')}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Bölüm 3 - Sözleşme Bilgileri */}
          <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Sözleşme Bilgileri</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="sozlesme_turu"
                render={({ field }) => (
                  <FormItem className="pt-1.5">
                    <FormLabel>Sözleşme Türü *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rapor">Rapor</SelectItem>
                        <SelectItem value="analiz">Analiz</SelectItem>
                        <SelectItem value="sistem">Sistem</SelectItem>
                        <SelectItem value="diger">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sozlesme_baslangic"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-1.5">
                    <FormLabel className="mb-1">Başlangıç Tarihi</FormLabel>
                    <Popover>
                      <FormControl>
                        <PopoverTrigger render={<Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} />}>
                          {field.value ? format(field.value, "dd MMM yyyy", { locale: tr }) : <span>Seçiniz</span>}
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sozlesme_bitis"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-1.5">
                    <FormLabel className="mb-1">Bitiş Tarihi</FormLabel>
                    <Popover>
                      <FormControl>
                        <PopoverTrigger render={<Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} />}>
                          {field.value ? format(field.value, "dd MMM yyyy", { locale: tr }) : <span>Seçiniz</span>}
                        </PopoverTrigger>
                      </FormControl>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sozlesme_bedeli"
                render={({ field }) => (
                  <FormItem className="pt-1.5">
                    <FormLabel>Sözleşme Bedeli</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₺</span>
                      <FormControl>
                        <Input type="number" placeholder="0.00" className="pl-8" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-md transition-all active:scale-[0.98]"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {initialData ? 'Değişiklikleri Güncelle' : 'Firmayı Kaydet'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
