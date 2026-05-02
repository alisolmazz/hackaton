'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success('Giriş başarılı, yönlendiriliyorsunuz...');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950">
      {/* Sol Bölüm: Marka / Açıklama (Sadece Büyük Ekranda Görünür) */}
      <div className="hidden lg:flex w-1/2 bg-[#1a2f5e] flex-col justify-center p-12 text-white relative overflow-hidden">
        {/* Dekoratif Arka Plan Efekti */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-300 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/30">
              P
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Pro Sicht</h1>
          </div>
          <h2 className="text-4xl font-semibold mb-6 leading-[1.2] text-blue-50">
            Finansal Yönetim <br/> Platformu
          </h2>
          <p className="text-blue-200/80 text-lg leading-relaxed">
            Yapay zeka destekli OCR finansal analizleri, otomatik PPTX raporlamaları ve premium uzman görüşleriyle firmanızı bir adım öne taşıyın.
          </p>
        </div>
      </div>

      {/* Sağ Bölüm: Login Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobil Ekran Logosu */}
        <div className="absolute top-8 left-8 flex lg:hidden items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
            P
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-xl tracking-tight">Pro Sicht</span>
        </div>

        <Card className="w-full max-w-md border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 rounded-2xl overflow-hidden">
          <CardContent className="pt-10 pb-8 px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hoş Geldiniz</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Devam etmek için admin hesabınıza giriş yapın.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  E-posta Adresi
                </label>
                <Input 
                  type="email" 
                  placeholder="admin@prosicht.com" 
                  {...register('email')}
                  className="h-11 dark:bg-slate-800/50 focus-visible:ring-blue-500 transition-all"
                />
                {errors.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Şifre
                  </label>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors">
                    Şifremi Unuttum
                  </a>
                </div>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    {...register('password')}
                    className="h-11 pr-10 dark:bg-slate-800/50 focus-visible:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-medium mt-1">{errors.password.message}</p>}
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
