'use client';

import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RAPORLAR = [
  { id: 1, donem: '2024 - Çeyrek 1', tarih: '15 Nis 2024', durum: 'Tamamlandı', aiAnaliz: true },
  { id: 2, donem: '2023 - Yıllık', tarih: '20 Oca 2024', durum: 'Tamamlandı', aiAnaliz: true },
  { id: 3, donem: '2023 - Çeyrek 4', tarih: '10 Oca 2024', durum: 'Tamamlandı', aiAnaliz: false },
];

export default function UserFinansalRaporPage() {
  return (
    <div className="space-y-8 max-w-[1100px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finansal Raporlar</h1>
          <p className="text-slate-500 mt-1">Firmanıza ait dönemsel finansal raporları görüntüleyin.</p>
        </div>
        <Select defaultValue="2024">
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6">Dönem</TableHead>
                <TableHead>Oluşturulma Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>AI Analiz</TableHead>
                <TableHead className="text-right pr-6">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RAPORLAR.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-bold">{r.donem}</TableCell>
                  <TableCell className="text-slate-500">{r.tarih}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none">{r.durum}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.aiAnaliz 
                      ? <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 shadow-none">Mevcut</Badge>
                      : <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 shadow-none">Yok</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-right pr-6 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-teal-600"><Eye className="w-4 h-4 mr-1"/> Görüntüle</Button>
                    <Button variant="ghost" size="sm" className="text-slate-500"><Download className="w-4 h-4 mr-1"/> İndir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
