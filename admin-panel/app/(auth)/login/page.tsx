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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#f8fafc] dark:bg-[#020617] font-sans antialiased relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 🌟 Ultra-Modern Background Blobs (Mesh Gradient) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-cyan-300/20 dark:bg-cyan-800/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10000ms] delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[12000ms] delay-1000"></div>
      </div>

      {/* 📦 Merkez Dev Kart (Glassmorphism Bimodal) */}
      <div className="w-full max-w-[1000px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* --- SOL BÖLÜM: Görsel & Değer Önerisi --- */}
        <div className="w-full md:w-5/12 p-10 lg:p-12 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/50 relative overflow-hidden flex flex-col justify-between">
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Pro Sicht</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-[1.2]">
              Sıfır eforla <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">maksimum içgörü.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10 text-sm lg:text-base font-medium">
              Dünyanın en gelişmiş finansal otonom asistanı ile tanışın. Klasik raporlamaları unutun.
            </p>

            {/* Özellik İkonları */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-500">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nakit Akışı Analizi</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gerçek zamanlı banka verileri.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-cyan-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI OCR Modeli</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Faturaları saniyeler içinde okuyun.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Uçtan Uca Güvenlik</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Askeri düzeyde veri koruması.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            © {new Date().getFullYear()} Pro Sicht Inc.
          </div>

        </div>

        {/* --- SAĞ BÖLÜM: Minimalist Form --- */}
        <div className="w-full md:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Giriş Yap</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Lütfen iş e-postanız ile devam edin.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">E-Posta</label>
              <Input 
                type="email" 
                placeholder="ornek@sirketiniz.com" 
                {...register('email')}
                className="h-12 lg:h-14 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl px-4 text-sm font-medium shadow-sm"
              />
              {errors.email && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Şifre</label>
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
                  Şifremi Unuttum
                </a>
              </div>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  {...register('password')}
                  className="h-12 lg:h-14 pr-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl px-4 text-sm font-medium shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-semibold mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-12 lg:h-14 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-sm lg:text-base transition-all rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
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
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Yeni misiniz?{' '}
                <a href="/register" className="text-slate-900 dark:text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-indigo-500/30">
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
