'use client';

import React from 'react';
import { KisitliAlan } from '@/components/user/KisitliAlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_BORC = [
  { id: 1, aciklama: 'Tedarikçi - Yazılım Lisansı', tutar: 45000, vade: '15 May 2024', durum: 'Bekliyor' },
  { id: 2, aciklama: 'Kira Ödemesi', tutar: 28000, vade: '01 Haz 2024', durum: 'Bekliyor' },
];

export default function BorcAlacakPage() {
  return (
    <div className="space-y-8 max-w-[1100px] mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Borç / Alacak Takibi</h1>
        <p className="text-slate-500 mt-1">Detaylı borç ve alacak yönetimi.</p>
      </div>

      <KisitliAlan baslik="Borç/Alacak Detay Modülü" aciklama="Bu modüle erişebilmek için Premium pakete yükseltmeniz gerekmektedir.">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-6">Açıklama</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Vade</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_BORC.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="pl-6 font-medium">{b.aciklama}</TableCell>
                    <TableCell className="font-bold">₺{b.tutar.toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{b.vade}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">{b.durum}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </KisitliAlan>
    </div>
  );
}
