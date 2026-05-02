'use client';

import React from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FirmaBilgileriPage() {
  return (
    <div className="space-y-8 max-w-[900px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Firma Bilgileri</h1>
        <p className="text-slate-500 mt-1">Şirket bilgilerinizi görüntüleyin ve güncelleyin.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Building2 className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <CardTitle>TechNova Yazılım A.Ş.</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Uzman Paket</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Şirket Ünvanı</Label>
              <Input defaultValue="TechNova Yazılım A.Ş." className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Vergi Numarası</Label>
              <Input defaultValue="1234567890" className="h-11" disabled />
            </div>
            <div className="space-y-2">
              <Label>Yetkili Kişi</Label>
              <Input defaultValue="Ahmet Yılmaz" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input defaultValue="+90 532 123 45 67" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input defaultValue="info@technova.com" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Faaliyet Alanı</Label>
              <Input defaultValue="Yazılım Geliştirme" className="h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kayıtlı Adres</Label>
            <Input defaultValue="Maslak Mah. AOS 55. Sk. No:2 Sarıyer/İstanbul" className="h-11" />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="bg-teal-700 hover:bg-teal-800 text-white px-8">Bilgileri Güncelle</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
