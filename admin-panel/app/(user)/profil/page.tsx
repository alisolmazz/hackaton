'use client';

import React from 'react';
import { User, Mail, Lock, Bell, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function ProfilPage() {
  return (
    <div className="space-y-8 max-w-[800px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Ayarları</h1>
        <p className="text-slate-500 mt-1">Hesap ve bildirim tercihlerinizi yönetin.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-teal-600"/> Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ad Soyad</Label><Input defaultValue="Ahmet Yılmaz" className="h-11"/></div>
            <div className="space-y-2"><Label>E-posta</Label><Input defaultValue="ahmet@technova.com" className="h-11" disabled/></div>
          </div>
          <div className="flex justify-end"><Button className="bg-teal-700 hover:bg-teal-800 text-white">Kaydet</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-teal-600"/> Şifre Değiştir</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2"><Label>Mevcut Şifre</Label><Input type="password" className="h-11"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Yeni Şifre</Label><Input type="password" className="h-11"/></div>
            <div className="space-y-2"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" className="h-11"/></div>
          </div>
          <div className="flex justify-end"><Button variant="outline">Şifreyi Güncelle</Button></div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-teal-600"/> Bildirim Tercihleri</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <div><p className="font-medium">E-posta Bildirimleri</p><p className="text-sm text-slate-500">Rapor ve analiz sonuçları</p></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-t pt-4">
            <div><p className="font-medium">Vade Hatırlatıcıları</p><p className="text-sm text-slate-500">Yaklaşan borç/alacak vadeleri</p></div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
