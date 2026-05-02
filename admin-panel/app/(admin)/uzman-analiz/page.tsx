'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Send, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { getUzmanAnalizTalepleri, uzmanAnalizGonder } from '@/lib/api';
import type { UzmanAnalizTalebi } from '@/types';

export default function UzmanAnalizPage() {
  const [talepler, setTalepler] = useState<UzmanAnalizTalebi[]>([]);
  const [seciliTalep, setSeciliTalep] = useState<UzmanAnalizTalebi | null>(null);
  const [rapor, setRapor] = useState('');
  const [saving, setSaving] = useState(false);

  const bekleyenSayisi = useMemo(() => talepler.filter(t => t.durum === 'bekliyor').length, [talepler]);

  useEffect(() => {
    const load = async () => {
      const data = await getUzmanAnalizTalepleri();
      setTalepler(data);
      setSeciliTalep(prev => prev ? data.find(t => t.id === prev.id) || prev : data[0] || null);
    };

    load();
    window.addEventListener('premium-data-changed', load);
    return () => window.removeEventListener('premium-data-changed', load);
  }, []);

  useEffect(() => {
    setRapor(seciliTalep?.uzman_gorusu || '');
  }, [seciliTalep]);

  const handleGonder = async () => {
    if (!seciliTalep) return;
    if (rapor.trim().length < 20) {
      toast.error('Lutfen kullaniciya gonderilecek finansal gorusu biraz daha detaylandirin.');
      return;
    }

    setSaving(true);
    try {
      const response = await uzmanAnalizGonder(seciliTalep.id, rapor.trim());
      setTalepler(prev => prev.map(t => t.id === response.data.id ? response.data : t));
      setSeciliTalep(response.data);
      toast.success('Uzman gorusu kullanici ekranina gonderildi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Uzman gorusu gonderilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><UserCheck className="w-6 h-6 text-purple-600" /> Uzman Analiz Talepleri</h1>
          <p className="text-sm text-slate-500 mt-1">Kullanicilarin uzman gorusu taleplerini inceleyip finansal rapor olarak gonderin.</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 border-none">{bekleyenSayisi} bekleyen talep</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Talepler</CardTitle>
            <CardDescription>Uzman analizi isteyen firmalar</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talepler.length === 0 ? (
                  <TableRow><TableCell colSpan={2} className="text-center py-8 text-slate-500">Henuz uzman analizi talebi yok.</TableCell></TableRow>
                ) : talepler.map(talep => (
                  <TableRow key={talep.id} onClick={() => setSeciliTalep(talep)} className="cursor-pointer hover:bg-slate-50">
                    <TableCell>
                      <div className="font-semibold">{talep.firma_adi}</div>
                      <div className="text-xs text-slate-500">{talep.talep_eden} - {new Date(talep.created_at).toLocaleString('tr-TR')}</div>
                    </TableCell>
                    <TableCell>
                      {talep.durum === 'bekliyor'
                        ? <Badge className="bg-amber-100 text-amber-800 border-none"><Clock className="w-3 h-3 mr-1" /> Bekliyor</Badge>
                        : <Badge className="bg-emerald-100 text-emerald-800 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Gonderildi</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>{seciliTalep ? seciliTalep.firma_adi : 'Talep secin'}</CardTitle>
            <CardDescription>Finansal verileri inceleyip kullaniciya gonderilecek uzman gorusunu yazin.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {seciliTalep ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(seciliTalep.finansal_veriler).map(([key, value]) => (
                    <div key={key} className="rounded-lg border bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase text-slate-500">{key}</div>
                      <pre className="mt-1 text-xs whitespace-pre-wrap break-words text-slate-700">{JSON.stringify(value, null, 2)}</pre>
                    </div>
                  ))}
                </div>

                <Textarea
                  value={rapor}
                  onChange={(event) => setRapor(event.target.value)}
                  placeholder="Uzman finansal gorusunuzu, riskleri ve onerileri buraya yazin..."
                  className="min-h-[220px]"
                />

                <div className="flex justify-end">
                  <Button onClick={handleGonder} disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white">
                    {saving ? 'Gonderiliyor...' : <><Send className="w-4 h-4 mr-2" /> Kullaniciya Gonder</>}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">Sol listeden bir uzman analizi talebi secin.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
