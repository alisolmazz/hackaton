'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { register as registerUser } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser(data.firmaAdi, data.adSoyad, data.email, data.sifre);
      toast.success('Kaydınız başarıyla tamamlandı.', {
        description: 'Lütfen e-posta adresinizle giriş yapın.',
      });
      router.push('/login');
    } catch(error: any) {
      toast.error(error.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#0a0f1c] font-sans antialiased relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 🌟 Ultra-Modern Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms] delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[12000ms] delay-1000"></div>
      </div>

      {/* 📦 Merkez Dev Kart */}
      <div className="w-full max-w-[1100px] bg-[#0d1425]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* --- SOL BÖLÜM: Görsel & Değer Önerisi --- */}
        <div className="w-full md:w-5/12 p-10 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden flex flex-col justify-between hidden md:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 border border-white/10">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Pro Sicht</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-[1.2]">
              Sisteme Katılın, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Veriyi Yönetin.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-10 text-sm lg:text-base font-medium">
              Sadece dakikalar içinde şirketinizi sisteme dahil edin ve yapay zekanın gücünü arkanıza alın.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900/50 shadow-sm border border-white/5 text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Güvenli Altyapı</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Uçtan uca şifreli veri tabanı.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900/50 shadow-sm border border-white/5 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Anında Onay</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Beklemeden direkt finansallara erişin.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-12 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Pro Sicht Inc.
          </div>
        </div>

        {/* --- SAĞ BÖLÜM: Minimalist Form --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Kurumsal Hesap Oluştur</h3>
            <p className="text-sm text-slate-400 font-medium">Lütfen şirket bilgilerinizi giriniz.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Firma Unvanı</label>
                <Input 
                  {...register('firmaAdi')}
                  placeholder="TechNova A.Ş." 
                  className="h-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.firmaAdi && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.firmaAdi.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Yetkili Ad Soyad</label>
                <Input 
                  {...register('adSoyad')}
                  placeholder="Ahmet Yılmaz" 
                  className="h-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.adSoyad && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.adSoyad.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">İş E-Posta</label>
              <Input 
                type="email" 
                {...register('email')}
                placeholder="ornek@sirketiniz.com" 
                className="h-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all rounded-xl px-4 text-sm font-medium"
              />
              {errors.email && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Şifre</label>
                <Input 
                  type="password" 
                  {...register('sifre')}
                  placeholder="••••••••" 
                  className="h-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.sifre && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.sifre.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Şifre Tekrar</label>
                <Input 
                  type="password" 
                  {...register('sifreTekrar')}
                  placeholder="••••••••" 
                  className="h-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.sifreTekrar && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.sifreTekrar.message}</p>}
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 lg:h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm lg:text-base transition-all rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    Hesabı Oluştur <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 font-medium">
                Zaten bir hesabınız var mı?{' '}
                <Link href="/login" className="text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-indigo-500/50">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
