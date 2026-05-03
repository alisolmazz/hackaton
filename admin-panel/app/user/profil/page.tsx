'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  User, Mail, Lock, Bell, Shield, Crown, CheckCircle2,
  LogOut, Monitor, Loader2, Smartphone, ArrowRight, UserCircle
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePremiumModal } from '@/context/PremiumModalContext';
import { getCurrentUser, logout } from '@/lib/auth';
import { getPremiumHesapDurumu } from '@/lib/api';
import type { User as AppUser } from '@/types';

const sifreSchema = z.object({
  mevcutSifre: z.string().min(1, 'Mevcut şifre zorunludur.'),
  yeniSifre: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır.'),
  yeniSifreTekrar: z.string(),
}).refine(d => d.yeniSifre === d.yeniSifreTekrar, { message: 'Şifreler eşleşmiyor.', path: ['yeniSifreTekrar'] });

const TALEP_GECMISI = [
  { tarih: '02 May 2024', paket: 'Premium Bundle', durum: 'Bekliyor' },
  { tarih: '15 Mar 2024', paket: 'Temel Analiz', durum: 'Onaylandı' },
  { tarih: '10 Oca 2024', paket: 'Uzman Görüşü', durum: 'Reddedildi' },
];

const OTURUMLAR = [
  { cihaz: 'Chrome — Windows', konum: 'İstanbul, TR', tarih: '02 May 2024, 14:30', aktif: true },
  { cihaz: 'Safari — iPhone', konum: 'İstanbul, TR', tarih: '01 May 2024, 09:15', aktif: false },
];

export default function ProfilPage() {
  const router = useRouter();
  const { openModal } = usePremiumModal();
  const [user, setUser] = useState<AppUser | null>(null);
  const [adSoyad, setAdSoyad] = useState('');
  const [saving, setSaving] = useState(false);
  const [sifreSaving, setSifreSaving] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [premiumPaket, setPremiumPaket] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(sifreSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAdSoyad(currentUser?.name || '');
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setPremiumPaket(durum.paket);
    };
    loadData();
    // Listen for premium changes
    const handler = () => {
      getPremiumHesapDurumu().then(d => {
        setHasPremium(d.hasPremium);
        setPremiumPaket(d.paket);
      });
    };
    window.addEventListener('premium-data-changed', handler);
    return () => window.removeEventListener('premium-data-changed', handler);
  }, []);

  const handleAdKaydet = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Bilgileriniz güncellendi.'); }, 800);
  };

  const handleSifreDegistir = () => {
    setSifreSaving(true);
    setTimeout(() => { setSifreSaving(false); reset(); toast.success('Şifreniz başarıyla güncellendi.'); }, 1000);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1000px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Hesap Ayarları</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm sm:text-base">Kişisel tercihlerinizi, güvenliğinizi ve premium özelliklerinizi yönetin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        
        <div className="md:col-span-4">
          <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden md:sticky md:top-28">
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <CardContent className="pt-0 pb-8 flex flex-col items-center text-center -mt-12 relative z-10">
              <div className="w-24 h-24 rounded-[24px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 text-3xl font-black shadow-xl shadow-slate-900/20 dark:shadow-white/20 mb-4 border-4 border-white dark:border-[#131b2e] rotate-3 hover:rotate-0 transition-transform duration-300">
                {user?.name?.substring(0, 2).toUpperCase() || 'AY'}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || 'Kullanıcı'}</h3>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5"/> {user?.email || ''}</p>
              
              <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-5"></div>

              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Hesap Durumu</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-none font-bold">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Mevcut Plan</span>
                  {hasPremium ? (
                    <Badge variant="outline" className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-500/30 shadow-none font-bold flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-amber-500"/> Premium
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-white dark:border-white/20 shadow-none font-bold flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-amber-500"/> Temel
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Tabs defaultValue="hesap" className="space-y-8">
            <TabsList className="bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1.5 sm:p-2 rounded-[20px] shadow-inner mb-2 inline-flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
              <TabsTrigger value="hesap" className="rounded-[14px] data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white font-bold py-2 sm:py-3 px-4 sm:px-6 shadow-sm data-[state=active]:shadow-md transition-all text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <UserCircle className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Hesap</span> Ayarları
              </TabsTrigger>
              <TabsTrigger value="guvenlik" className="rounded-[14px] data-[state=active]:bg-white dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-white font-bold py-2 sm:py-3 px-4 sm:px-6 shadow-sm data-[state=active]:shadow-md transition-all text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <Shield className="w-4 h-4 mr-2" /> Güvenlik
              </TabsTrigger>
              <TabsTrigger value="premium" className="rounded-[14px] data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white font-bold py-2 sm:py-3 px-4 sm:px-6 shadow-sm data-[state=active]:shadow-md transition-all text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <Crown className="w-4 h-4 mr-2" /> Premium
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hesap" className="space-y-6 animate-in fade-in-50 duration-500">
              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-5 px-6 sm:px-8 pt-6 sm:pt-8">
                  <CardTitle className="text-lg font-bold">Kişisel Bilgiler</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Ad Soyad</Label>
                      <Input value={adSoyad} onChange={e=>setAdSoyad(e.target.value)} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">E-posta <Lock className="w-3.5 h-3.5 text-slate-400"/></Label>
                      <Input value={user?.email || ''} disabled className="h-12 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 rounded-xl" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleAdKaydet} disabled={saving} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20">
                      {saving?<><Loader2 className="w-5 h-5 mr-2 animate-spin"/>Kaydediliyor...</>:'Değişiklikleri Kaydet'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-500"/> Şifre Değiştir</CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <form onSubmit={handleSubmit(handleSifreDegistir)} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 dark:text-slate-300">Mevcut Şifre</Label>
                      <Input type="password" {...register('mevcutSifre')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" />
                      {errors.mevcutSifre && <p className="text-xs font-bold text-rose-500 mt-1">{errors.mevcutSifre.message as string}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Yeni Şifre</Label>
                        <Input type="password" {...register('yeniSifre')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" />
                        {errors.yeniSifre && <p className="text-xs font-bold text-rose-500 mt-1">{errors.yeniSifre.message as string}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 dark:text-slate-300">Yeni Şifre (Tekrar)</Label>
                        <Input type="password" {...register('yeniSifreTekrar')} className="h-12 bg-slate-50 dark:bg-[#0a0f1c] border-slate-200 dark:border-white/10 focus-visible:ring-indigo-500 rounded-xl" />
                        {errors.yeniSifreTekrar && <p className="text-xs font-bold text-rose-500 mt-1">{errors.yeniSifreTekrar.message as string}</p>}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button type="submit" variant="outline" disabled={sifreSaving} className="h-12 px-8 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 font-bold">
                        {sifreSaving?<><Loader2 className="w-5 h-5 mr-2 animate-spin"/>Güncelleniyor...</>:'Şifreyi Güncelle'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="premium" className="space-y-6 animate-in fade-in-50 duration-500">
              {hasPremium ? (
                /* ✅ PREMIUM AKTİF DURUMU */
                <Card className="border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-xl shadow-emerald-500/10 rounded-[24px] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[20px] bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-500/30 shadow-inner">
                          <Crown className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-2xl text-emerald-900 dark:text-emerald-100">Pro Sicht Premium</h3>
                          <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80 mt-1">Tüm özellikler aktif • {premiumPaket ? premiumPaket.charAt(0).toUpperCase() + premiumPaket.slice(1) : 'Premium'} Paket</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-none font-bold px-4 py-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Aktif Üyelik
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* ❌ TEMEL PAKET DURUMU */
                <Card className="border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 shadow-xl shadow-amber-500/10 rounded-[24px] overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[20px] bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center border border-amber-200 dark:border-amber-500/30 shadow-inner">
                          <Crown className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-2xl text-amber-900 dark:text-amber-100">Temel Paket</h3>
                          <p className="text-sm font-medium text-amber-700/80 dark:text-amber-400/80 mt-1">Mevcut kullanım planınız</p>
                        </div>
                      </div>
                      <Button onClick={()=>openModal()} className="h-14 px-8 rounded-[16px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold shadow-lg shadow-orange-500/30 transition-transform hover:scale-105">
                        <Crown className="w-5 h-5 mr-2" /> Pro Sicht'ı Yükselt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold">Özellik Durumu</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {[
                      { ozellik:'Finansal Rapor Görüntüleme', temelAktif:true },
                      { ozellik:'Nakit Akış Tablosu', temelAktif:true },
                      { ozellik:'AI Finansal Analiz', temelAktif:false },
                      { ozellik:'Uzman Görüşü', temelAktif:false },
                      { ozellik:'Ön Sunum (.pptx)', temelAktif:false },
                    ].map((o,i)=>{
                      const isAktif = hasPremium || o.temelAktif;
                      return (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{o.ozellik}</span>
                          {isAktif ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-none font-bold px-3 py-1"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/>Aktif</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 shadow-none font-bold px-3 py-1"><Lock className="w-3.5 h-3.5 mr-1.5"/>Kilitli</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold">Talep Geçmişi</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-transparent">
                      <TableRow className="border-slate-100 dark:border-white/5">
                        <TableHead className="pl-6 font-bold text-slate-500 uppercase text-xs tracking-wider">Tarih</TableHead>
                        <TableHead className="font-bold text-slate-500 uppercase text-xs tracking-wider">Paket / Hizmet</TableHead>
                        <TableHead className="pr-6 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TALEP_GECMISI.map((t,i)=>(
                        <TableRow key={i} className="border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <TableCell className="pl-6 text-slate-500 font-medium">{t.tarih}</TableCell>
                          <TableCell className="font-bold text-slate-900 dark:text-white">{t.paket}</TableCell>
                          <TableCell className="text-right pr-6">
                            <Badge variant="outline" className={`shadow-none font-bold px-3 py-1 ${
                              t.durum==='Onaylandı'?'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20':
                              t.durum==='Reddedildi'?'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20':
                              'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>{t.durum}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bildirim" className="animate-in fade-in-50 duration-500">
              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold">Uygulama Bildirimleri</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-white/5">
                  {[
                    { label:'Admin Onayı', desc:'Hesap ve premium talep onay sonuçları', def:true },
                    { label:'Vade Hatırlatıcı', desc:'30 gün öncesinden borç/alacak vade hatırlatması', def:true },
                    { label:'Tahsilat Uyarıları', desc:'Bekleyen ve geciken tahsilat uyarıları', def:true },
                    { label:'E-posta Özeti', desc:'Haftalık finansal özetin e-posta ile gönderilmesi', def:false },
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <div className="pr-4">
                        <p className="font-extrabold text-slate-900 dark:text-white text-base">{item.label}</p>
                        <p className="text-sm font-medium text-slate-500 mt-1">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.def} className="data-[state=checked]:bg-indigo-600" />
                    </div>
                  ))}
                </CardContent>
                <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end">
                  <Button className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold shadow-lg">
                    Tercihleri Kaydet
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="guvenlik" className="space-y-6 animate-in fade-in-50 duration-500">
              <Card className="border border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#0d1425]/60 backdrop-blur-2xl shadow-[0_20px_80px_-20px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 pb-4 px-6 pt-6">
                  <CardTitle className="text-lg font-bold">Bağlı Cihazlar</CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-white/5">
                  {OTURUMLAR.map((o,i)=>(
                    <div key={i} className="flex items-center justify-between p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[14px] bg-slate-100 dark:bg-white/10 flex items-center justify-center border border-slate-200 dark:border-white/10">
                          {o.cihaz.includes('iPhone')?<Smartphone className="w-6 h-6 text-slate-500 dark:text-slate-400"/>:<Monitor className="w-6 h-6 text-slate-500 dark:text-slate-400"/>}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            {o.cihaz}
                            {o.aktif && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none shadow-none text-[10px] px-2 py-0 uppercase tracking-wider">Mevcut</Badge>}
                          </p>
                          <p className="text-sm font-medium text-slate-500 mt-1">{o.konum} — {o.tarih}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AlertDialog>
                <AlertDialogTrigger className="w-full h-14 rounded-[16px] border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/10 hover:text-rose-700 font-extrabold text-base shadow-sm group flex items-center justify-center transition-colors">
                  <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"/> Tüm Oturumlardan Çıkış Yap
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[24px] border-none shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">Güvenlik Onayı</AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-medium text-slate-500">
                      Bu işlem tüm aktif oturumlarınızı (mobil dahil) anında sonlandıracaktır. Devam etmek için tekrar giriş yapmanız gerekecektir.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="h-12 rounded-xl font-bold">İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold">Evet, Kapat</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
          </Tabs>

          <Button variant="ghost" onClick={handleLogout} className="w-full h-14 mt-8 rounded-[16px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-bold text-base transition-colors">
            <LogOut className="w-5 h-5 mr-2"/> Güvenli Çıkış
          </Button>
        </div>
      </div>
    </div>
  );
}
