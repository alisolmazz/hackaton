'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle, Zap, ShieldCheck, BarChart3, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Zod Login Validation Schema
const loginSchema = z.object({
  email: z.string().email('Lütfen geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data.email, data.password);
      const role = response.user?.user_metadata?.role || (data.email === 'admin@prosicht.com' ? 'admin' : 'user');
      
      toast.success('Giriş başarılı, yönlendiriliyorsunuz...');
      if (role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  if (!mounted) return null; // Hydration güvenliği

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-500/30">
      
      {/* --- SOL BÖLÜM (HERO & GÖRSEL ŞOV) --- */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center relative overflow-hidden bg-slate-950">
        {/* Hareketli Arka Plan Mesh Gradient (Tailwind ile Simüle) */}
        <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950 opacity-80 blur-3xl mix-blend-screen pointer-events-none animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800/30 via-transparent to-transparent opacity-60 blur-3xl mix-blend-screen pointer-events-none animate-pulse duration-[8000ms]"></div>
        
        <div className="relative z-10 w-full max-w-2xl mx-auto px-12 xl:px-20 py-12 flex flex-col h-full justify-between">
          
          {/* Logo & Marka */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/10 relative overflow-hidden">
              <span className="relative z-10">P</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 translate-x-[-100%]"></div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Pro Sicht
            </h1>
          </div>

          {/* Ana Değer Önerisi */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold mb-6 leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400">
              Geleceğin Finansal <br/> Zekasına Katılın.
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-light max-w-md">
              Milyonlarca satırlık veriyi tek tıkla analiz edin, yönetim sunumlarınızı otomatikleştirin ve yapay zeka ile 10x daha hızlı kararlar alın.
            </p>
          </div>

          {/* Floating Glassmorphism Kartlar */}
          <div className="relative h-48 mb-12">
            {/* Kart 1 */}
            <div className="absolute left-0 top-0 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:-translate-y-2 transition-transform duration-500 cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aylık Nakit Akışı</div>
                  <div className="text-lg font-bold text-white">₺3,240,000</div>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {/* Kart 2 */}
            <div className="absolute left-48 top-12 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl hover:-translate-y-2 transition-transform duration-500 cursor-default z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI OCR Analizi</div>
                  <div className="text-lg font-bold text-white">%99.8 Başarı</div>
                </div>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-slate-900"></div>
                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
              </div>
            </div>
          </div>

          {/* Neden Biz & Trust Badge */}
          <div>
            <div className="flex flex-col gap-3 mb-10">
              <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-default">
                <CheckCircle className="w-5 h-5 text-indigo-400" />
                <span><strong className="text-white">Gerçek Zamanlı</strong> banka entegrasyonu</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-default">
                <CheckCircle className="w-5 h-5 text-indigo-400" />
                <span><strong className="text-white">PDF to PPTX</strong> tek tuşla otomatik raporlar</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors cursor-default">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span><strong className="text-white">Bank-Grade Güvenlik</strong> ile %100 gizlilik</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-white/10">
              <div className="flex gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div className="text-sm text-slate-400">
                Türkiye'nin en hızlı büyüyen <strong>500+ şirketi</strong> tarafından güvenle kullanılıyor.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- SAĞ BÖLÜM (FORM) --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-slate-50 dark:bg-slate-950">
        
        {/* Mobil Ekran Logosu */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            P
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">Pro Sicht</span>
        </div>

        <div className="w-full max-w-[420px]">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Tekrar Hoş Geldiniz</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Finansal asistanınıza erişmek için bilgilerinizi girin.</p>
          </div>

          <Card className="border-0 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-2.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    İş E-postası
                  </label>
                  <Input 
                    type="email" 
                    placeholder="ornek@sirketiniz.com" 
                    {...register('email')}
                    className="h-12 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl px-4"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Şifre
                    </label>
                    <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors">
                      Şifremi Unuttum
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      {...register('password')}
                      className="h-12 pr-12 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500 transition-all rounded-xl px-4"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs font-medium mt-1 ml-1">{errors.password.message}</p>}
                </div>

                <div className="pt-4 space-y-5">
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-base transition-all rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                  </Button>

                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Sisteme erişim yetkiniz yok mu?{' '}
                    <a href="/register" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold transition-colors underline decoration-indigo-200 dark:decoration-indigo-900 underline-offset-4">
                      Demo Hesabı Oluştur
                    </a>
                  </p>
                </div>

              </form>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Pro Sicht Inc. Tüm hakları saklıdır.
          </div>
        </div>

      </div>
    </div>
  );
}
