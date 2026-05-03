'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap, LineChart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data.email, data.password);
      const role = response.user?.user_metadata?.role || (data.email === 'admin@prosicht.com' ? 'admin' : 'user');
      toast.success('Giriş başarılı, yönlendiriliyorsunuz...');
      if (role === 'admin') router.push('/dashboard');
      else router.push('/user/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#0a0f1c] font-sans antialiased relative overflow-hidden selection:bg-indigo-500/30">
      
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
        <div className="absolute inset-0 flex items-center overflow-hidden text-indigo-500/20">
          <svg className="w-[200%] h-[400px] flex-shrink-0 animate-chart" preserveAspectRatio="none" viewBox="0 0 2000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,300 L100,280 L200,320 L300,250 L400,270 L500,180 L600,220 L700,100 L800,150 L900,80 L1000,120 L1100,300 L1200,280 L1300,320 L1400,250 L1500,270 L1600,180 L1700,220 L1800,100 L1900,150 L2000,80" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden text-violet-400/10 mt-32">
          <svg className="w-[200%] h-[300px] flex-shrink-0 animate-chart-fast" preserveAspectRatio="none" viewBox="0 0 2000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,250 L150,200 L300,280 L450,150 L600,190 L750,80 L900,120 L1000,250 L1150,200 L1300,280 L1450,150 L1600,190 L1750,80 L1900,120 L2000,250" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      </div>

      {/* 🌟 Ultra-Modern Background Blobs (Mesh Gradient) - Koyu Temaya Uygun */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms] delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[12000ms] delay-1000"></div>
      </div>

      {/* 📦 Merkez Dev Kart (Glassmorphism Bimodal - Premium Midnight) */}
      <div className="w-full max-w-[1000px] bg-[#0d1425]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* --- SOL BÖLÜM: Görsel & Değer Önerisi --- */}
        <div className="w-full md:w-5/12 p-10 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden flex flex-col justify-between">
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 border border-white/10">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Pro Sicht</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-[1.2]">
              Sıfır eforla <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">maksimum içgörü.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-10 text-sm lg:text-base font-medium">
              Dünyanın en gelişmiş finansal otonom asistanı ile tanışın. Klasik raporlamaları unutun.
            </p>

            {/* Özellik İkonları */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900/50 shadow-sm border border-white/5 text-indigo-400">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Nakit Akışı Analizi</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Gerçek zamanlı banka verileri.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900/50 shadow-sm border border-white/5 text-cyan-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI OCR Modeli</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Faturaları saniyeler içinde okuyun.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900/50 shadow-sm border border-white/5 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Uçtan Uca Güvenlik</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Askeri düzeyde veri koruması.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Pro Sicht Inc.
          </div>

        </div>

        {/* --- SAĞ BÖLÜM: Minimalist Form --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Giriş Yap</h3>
            <p className="text-sm text-slate-400 font-medium">Lütfen iş e-postanız ile devam edin.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">E-Posta</label>
              <Input 
                type="email" 
                placeholder="ornek@sirketiniz.com" 
                {...register('email')}
                className="h-12 lg:h-14 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl px-4 text-sm font-medium shadow-sm"
              />
              {errors.email && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Şifre</label>
                <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Şifremi Unuttum
                </a>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  {...register('password')}
                  className="h-12 lg:h-14 pr-12 bg-[#131b2e] border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl px-4 text-sm font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs font-semibold mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 lg:h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm lg:text-base transition-all rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 group"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    Devam Et <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 font-medium">
                Yeni misiniz?{' '}
                <a href="/register" className="text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-indigo-500/50">
                  Şirket Hesabı Oluşturun
                </a>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
