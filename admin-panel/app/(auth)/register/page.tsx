'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Building2, UserPlus, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { register as registerUser } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const registerSchema = z.object({
  firmaAdi: z.string().min(2, 'Firma adı en az 2 karakter olmalıdır.'),
  adSoyad: z.string().min(3, 'Ad soyad en az 3 karakter olmalıdır.'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  sifre: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
  sifreTekrar: z.string()
}).refine((data) => data.sifre === data.sifreTekrar, {
  message: "Şifreler eşleşmiyor.",
  path: ["sifreTekrar"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      await registerUser(data.firmaAdi, data.adSoyad, data.email, data.sifre);
      toast.success('Kaydınız başarıyla tamamlandı.', {
        description: 'Lütfen e-posta adresinizle giriş yapın.',
        duration: 5000,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-800'
      });
      router.push('/login');
    } catch(error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sol Panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between bg-teal-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
            <Building2 className="w-8 h-8 text-teal-100" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Pro Sicht <span className="font-light text-teal-200">| Firmam</span></span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">Finansal Raporlarınızı Hemen Analiz Edin</h1>
          <p className="text-teal-100/80 text-lg leading-relaxed mb-8">
            Platforma kayıt olarak kurumunuzun finansal verilerini dijitalleştirin, 
            yapay zeka destekli analizlere ve profesyonel sunumlara anında ulaşın.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-teal-200">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div> Hızlı Onay</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div> Güvenli Altyapı</span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div> AI Destekli</span>
          </div>
        </div>

        <div className="relative z-10 text-teal-200/60 text-sm">
          © 2026 Pro Sicht GmbH. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Sağ Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hesap Oluştur</h2>
            <p className="text-slate-500 mt-2">Firmam platformuna katılmak için bilgilerinizi girin.</p>
          </div>

          <Card className="border-slate-200/60 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="pt-6 space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="firmaAdi">Firma Unvanı</Label>
                  <Input id="firmaAdi" {...register('firmaAdi')} placeholder="Örn: TechNova A.Ş." className="h-12 bg-slate-50/50" />
                  {errors.firmaAdi && <p className="text-xs text-red-500">{errors.firmaAdi.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adSoyad">Yetkili Ad Soyad</Label>
                  <Input id="adSoyad" {...register('adSoyad')} placeholder="Adınız Soyadınız" className="h-12 bg-slate-50/50" />
                  {errors.adSoyad && <p className="text-xs text-red-500">{errors.adSoyad.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Kurumsal E-posta</Label>
                  <Input id="email" type="email" {...register('email')} placeholder="ornek@firma.com" className="h-12 bg-slate-50/50" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sifre">Şifre</Label>
                    <Input id="sifre" type="password" {...register('sifre')} className="h-12 bg-slate-50/50" />
                    {errors.sifre && <p className="text-xs text-red-500">{errors.sifre.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sifreTekrar">Şifre Tekrar</Label>
                    <Input id="sifreTekrar" type="password" {...register('sifreTekrar')} className="h-12 bg-slate-50/50" />
                    {errors.sifreTekrar && <p className="text-xs text-red-500">{errors.sifreTekrar.message}</p>}
                  </div>
                </div>

              </CardContent>
              <CardFooter className="flex flex-col gap-4 pb-6">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-12 text-base font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-900/20"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Kayıt Yapılıyor...</>
                  ) : (
                    <><UserPlus className="mr-2 h-5 w-5" /> Kayıt Ol <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
                
                <p className="text-center text-sm text-slate-500">
                  Zaten bir hesabınız var mı?{' '}
                  <Link href="/login" className="text-teal-700 font-semibold hover:underline">
                    Giriş Yapın
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
