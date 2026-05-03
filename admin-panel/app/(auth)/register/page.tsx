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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#041215] font-sans antialiased relative overflow-hidden selection:bg-teal-500/30">
      
      {/* 🌟 CSS Animations for Financial Flow */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowChart {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-chart {
          animation: flowChart 40s linear infinite;
        }
        .animate-chart-fast {
          animation: flowChart 25s linear infinite reverse;
        }
      `}} />

      {/* 🌟 Animated Financial Grid & Flow Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        {/* Animated Line Charts (Stock Waves) */}
        <div className="absolute inset-0 flex items-center overflow-hidden text-teal-500/20">
          <svg className="w-[200%] h-[400px] flex-shrink-0 animate-chart" preserveAspectRatio="none" viewBox="0 0 2000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,300 L100,280 L200,320 L300,250 L400,270 L500,180 L600,220 L700,100 L800,150 L900,80 L1000,120 L1100,300 L1200,280 L1300,320 L1400,250 L1500,270 L1600,180 L1700,220 L1800,100 L1900,150 L2000,80" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden text-cyan-400/10 mt-32">
          <svg className="w-[200%] h-[300px] flex-shrink-0 animate-chart-fast" preserveAspectRatio="none" viewBox="0 0 2000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,250 L150,200 L300,280 L450,150 L600,190 L750,80 L900,120 L1000,250 L1150,200 L1300,280 L1450,150 L1600,190 L1750,80 L1900,120 L2000,250" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      </div>

      {/* 🌟 Ambient Blobs (Teal/Cyan Theme) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-teal-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms] delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-emerald-700/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[12000ms] delay-1000"></div>
      </div>

      {/* 📦 Merkez Dev Kart */}
      <div className="w-full max-w-[1100px] bg-[#071c21]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* --- SOL BÖLÜM: Görsel & Değer Önerisi --- */}
        <div className="w-full md:w-5/12 p-10 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-teal-900/10 to-transparent relative overflow-hidden flex flex-col justify-between hidden md:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-600/30 border border-white/10">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Pro Sicht</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-[1.2]">
              Sisteme Katılın, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Veriyi Yönetin.</span>
            </h2>
            <p className="text-teal-100/60 leading-relaxed mb-10 text-sm lg:text-base font-medium">
              Sadece dakikalar içinde şirketinizi sisteme dahil edin ve yapay zekanın gücünü arkanıza alın.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-teal-950/50 shadow-sm border border-teal-500/20 text-teal-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Güvenli Altyapı</h4>
                  <p className="text-xs text-teal-100/50 mt-0.5">Uçtan uca şifreli veri tabanı.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-teal-950/50 shadow-sm border border-teal-500/20 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Anında Onay</h4>
                  <p className="text-xs text-teal-100/50 mt-0.5">Beklemeden direkt finansallara erişin.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-12 text-xs font-semibold text-teal-100/30 uppercase tracking-widest">
            © {new Date().getFullYear()} Pro Sicht Inc.
          </div>
        </div>

        {/* --- SAĞ BÖLÜM: Minimalist Form --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Kurumsal Hesap Oluştur</h3>
            <p className="text-sm text-teal-100/50 font-medium">Lütfen şirket bilgilerinizi giriniz.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-100/70 uppercase tracking-wider ml-1">Firma Unvanı</label>
                <Input 
                  {...register('firmaAdi')}
                  placeholder="TechNova A.Ş." 
                  className="h-12 bg-[#0a262d] border-teal-500/20 text-white placeholder:text-teal-100/30 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.firmaAdi && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.firmaAdi.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-100/70 uppercase tracking-wider ml-1">Yetkili Ad Soyad</label>
                <Input 
                  {...register('adSoyad')}
                  placeholder="Ahmet Yılmaz" 
                  className="h-12 bg-[#0a262d] border-teal-500/20 text-white placeholder:text-teal-100/30 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.adSoyad && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.adSoyad.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-teal-100/70 uppercase tracking-wider ml-1">İş E-Posta</label>
              <Input 
                type="email" 
                {...register('email')}
                placeholder="ornek@sirketiniz.com" 
                className="h-12 bg-[#0a262d] border-teal-500/20 text-white placeholder:text-teal-100/30 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all rounded-xl px-4 text-sm font-medium"
              />
              {errors.email && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-100/70 uppercase tracking-wider ml-1">Şifre</label>
                <Input 
                  type="password" 
                  {...register('sifre')}
                  placeholder="••••••••" 
                  className="h-12 bg-[#0a262d] border-teal-500/20 text-white placeholder:text-teal-100/30 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.sifre && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.sifre.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-teal-100/70 uppercase tracking-wider ml-1">Şifre Tekrar</label>
                <Input 
                  type="password" 
                  {...register('sifreTekrar')}
                  placeholder="••••••••" 
                  className="h-12 bg-[#0a262d] border-teal-500/20 text-white placeholder:text-teal-100/30 focus-visible:ring-2 focus-visible:ring-teal-500 transition-all rounded-xl px-4 text-sm font-medium"
                />
                {errors.sifreTekrar && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.sifreTekrar.message}</p>}
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-12 lg:h-14 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm lg:text-base transition-all rounded-xl shadow-[0_0_15px_rgba(13,148,136,0.3)] hover:shadow-[0_0_25px_rgba(13,148,136,0.5)] hover:-translate-y-0.5 group"
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
              <p className="text-sm text-teal-100/50 font-medium">
                Zaten bir hesabınız var mı?{' '}
                <Link href="/login" className="text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-teal-500/50">
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
