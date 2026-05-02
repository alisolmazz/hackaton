'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  User, Mail, Lock, Bell, Shield, Crown, CheckCircle2, XCircle,
  Clock, LogOut, Monitor, Loader2, Smartphone
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePremiumModal } from '@/context/PremiumModalContext';

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
  const [adSoyad, setAdSoyad] = useState('Ahmet Yılmaz');
  const [saving, setSaving] = useState(false);
  const [sifreSaving, setSifreSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(sifreSchema),
  });

  const handleAdKaydet = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success('Bilgileriniz güncellendi.'); }, 800);
  };

  const handleSifreDegistir = () => {
    setSifreSaving(true);
    setTimeout(() => { setSifreSaving(false); reset(); toast.success('Şifreniz başarıyla güncellendi.'); }, 1000);
  };

  const handleLogout = () => {
    document.cookie = "fintech_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Ayarları</h1>
        <p className="text-slate-500 mt-1">Hesap, paket ve güvenlik tercihlerinizi yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* SOL — PROFİL KARTI */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm sticky top-24">
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-teal-200/50 mb-4 border-4 border-white dark:border-slate-800">
                AY
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ahmet Yılmaz</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3"/> ahmet@technova.com</p>
              <p className="text-sm text-slate-500 mt-1">TechNova Yazılım A.Ş.</p>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">Aktif</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 shadow-none flex items-center gap-1"><Crown className="w-3 h-3"/> Temel Paket</Badge>
              </div>

              <p className="text-xs text-slate-400 mt-4">Üye: 15.01.2024</p>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ — DETAY BÖLÜMLER */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="hesap" className="space-y-6">
            <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 w-full h-auto">
              <TabsTrigger value="hesap" className="flex-1 py-2 data-[state=active]:shadow-sm"><User className="w-4 h-4 mr-2"/> Hesap</TabsTrigger>
              <TabsTrigger value="premium" className="flex-1 py-2 data-[state=active]:shadow-sm"><Crown className="w-4 h-4 mr-2"/> Paketim</TabsTrigger>
              <TabsTrigger value="bildirim" className="flex-1 py-2 data-[state=active]:shadow-sm"><Bell className="w-4 h-4 mr-2"/> Bildirimler</TabsTrigger>
              <TabsTrigger value="guvenlik" className="flex-1 py-2 data-[state=active]:shadow-sm"><Shield className="w-4 h-4 mr-2"/> Güvenlik</TabsTrigger>
            </TabsList>

            {/* HESAP */}
            <TabsContent value="hesap" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Hesap Bilgileri</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Ad Soyad</Label><Input value={adSoyad} onChange={e=>setAdSoyad(e.target.value)} className="h-11"/></div>
                    <div className="space-y-2"><Label className="flex items-center gap-1">E-posta <Lock className="w-3 h-3 text-slate-400"/></Label><Input value="ahmet@technova.com" disabled className="h-11 bg-slate-50"/></div>
                  </div>
                  <div className="flex justify-end"><Button onClick={handleAdKaydet} disabled={saving} className="bg-teal-700 hover:bg-teal-800 text-white">{saving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Kaydediliyor...</>:'Kaydet'}</Button></div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-teal-600"/> Şifre Değiştir</CardTitle></CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(handleSifreDegistir)} className="space-y-4">
                    <div className="space-y-2"><Label>Mevcut Şifre</Label><Input type="password" {...register('mevcutSifre')} className="h-11"/>{errors.mevcutSifre && <p className="text-xs text-red-500">{errors.mevcutSifre.message as string}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Yeni Şifre</Label><Input type="password" {...register('yeniSifre')} className="h-11"/>{errors.yeniSifre && <p className="text-xs text-red-500">{errors.yeniSifre.message as string}</p>}</div>
                      <div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" {...register('yeniSifreTekrar')} className="h-11"/>{errors.yeniSifreTekrar && <p className="text-xs text-red-500">{errors.yeniSifreTekrar.message as string}</p>}</div>
                    </div>
                    <div className="flex justify-end"><Button type="submit" variant="outline" disabled={sifreSaving}>{sifreSaving?<><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Güncelleniyor...</>:'Şifreyi Güncelle'}</Button></div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PREMİUM PAKETİM */}
            <TabsContent value="premium" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="shadow-sm border-l-4 border-l-amber-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center"><Crown className="w-7 h-7 text-amber-600"/></div>
                      <div>
                        <h3 className="font-bold text-lg">Temel Paket</h3>
                        <p className="text-sm text-slate-500">Mevcut paketiniz</p>
                      </div>
                    </div>
                    <Button onClick={()=>openModal()} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"><Crown className="w-4 h-4 mr-2"/> Paketi Yükselt</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Özellik Durumu</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table><TableBody>
                    {[
                      { ozellik:'Finansal Rapor Görüntüleme', aktif:true },
                      { ozellik:'Nakit Akış Tablosu', aktif:true },
                      { ozellik:'AI Finansal Analiz', aktif:false },
                      { ozellik:'Uzman Görüşü', aktif:false },
                      { ozellik:'Ön Sunum (.pptx)', aktif:false },
                    ].map((o,i)=>(
                      <TableRow key={i}><TableCell className="pl-6 font-medium">{o.ozellik}</TableCell>
                        <TableCell className="text-right pr-6">{o.aktif
                          ?<Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/>Aktif</Badge>
                          :<Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 shadow-none"><Lock className="w-3 h-3 mr-1"/>Kilitli</Badge>
                        }</TableCell>
                      </TableRow>
                    ))}
                  </TableBody></Table>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Talep Geçmişi</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table><TableHeader className="bg-slate-50 dark:bg-slate-900/50"><TableRow>
                    <TableHead className="pl-6">Tarih</TableHead><TableHead>Paket</TableHead><TableHead className="text-right pr-6">Durum</TableHead>
                  </TableRow></TableHeader><TableBody>
                    {TALEP_GECMISI.map((t,i)=>(
                      <TableRow key={i}><TableCell className="pl-6">{t.tarih}</TableCell><TableCell className="font-medium">{t.paket}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Badge variant="outline" className={`shadow-none ${
                            t.durum==='Onaylandı'?'bg-emerald-50 text-emerald-700 border-emerald-200':
                            t.durum==='Reddedildi'?'bg-red-50 text-red-700 border-red-200':
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{t.durum}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody></Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BİLDİRİMLER */}
            <TabsContent value="bildirim" className="animate-in fade-in-50 duration-300">
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Bildirim Tercihleri</CardTitle></CardHeader>
                <CardContent className="pt-6 space-y-1 divide-y">
                  {[
                    { label:'Admin onayı bildirimleri', desc:'Hesap ve premium talep onay sonuçları', def:true },
                    { label:'Vade yaklaşıyor uyarıları', desc:'30 gün öncesinden borç/alacak vade hatırlatması', def:true },
                    { label:'Tahsilat hatırlatmaları', desc:'Bekleyen tahsilat uyarıları', def:true },
                    { label:'E-posta bildirimleri', desc:'Tüm bildirimlerin e-posta ile gönderilmesi', def:false },
                  ].map((item,i)=>(
                    <div key={i} className="flex items-center justify-between py-4 first:pt-0">
                      <div><p className="font-medium text-slate-900 dark:text-white">{item.label}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                      <Switch defaultChecked={item.def}/>
                    </div>
                  ))}
                </CardContent>
                <div className="px-6 pb-6"><Button className="bg-teal-700 hover:bg-teal-800 text-white">Tercihleri Kaydet</Button></div>
              </Card>
            </TabsContent>

            {/* GÜVENLİK */}
            <TabsContent value="guvenlik" className="space-y-6 animate-in fade-in-50 duration-300">
              <Card className="shadow-sm">
                <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Aktif Oturumlar</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {OTURUMLAR.map((o,i)=>(
                    <div key={i} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {o.cihaz.includes('iPhone')?<Smartphone className="w-5 h-5 text-slate-500"/>:<Monitor className="w-5 h-5 text-slate-500"/>}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{o.cihaz}</p>
                          <p className="text-xs text-slate-500">{o.konum} — {o.tarih}</p>
                        </div>
                      </div>
                      {o.aktif && <Badge className="bg-emerald-100 text-emerald-800 border-none">Bu Oturum</Badge>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12 font-semibold">
                    <Shield className="w-4 h-4 mr-2"/> Tüm Oturumlardan Çıkış Yap
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tüm oturumlardan çıkış yapılacak</AlertDialogTitle>
                    <AlertDialogDescription>Bu işlem tüm aktif oturumlarınızı (mobil dahil) sonlandıracaktır. Tekrar giriş yapmanız gerekecektir.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">Evet, Tüm Oturumları Kapat</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ALT — ÇIKIŞ BUTONU */}
      <Button variant="outline" onClick={handleLogout} className="w-full h-14 border-red-200 text-red-600 hover:bg-red-50 text-base font-semibold">
        <LogOut className="w-5 h-5 mr-2"/> Çıkış Yap
      </Button>
    </div>
  );
}
