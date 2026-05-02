'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Building2, CheckCircle2, Eye, EyeOff, Loader2, Send, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { KisitliAlan } from '@/components/user/KisitliAlan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePremiumModal } from '@/context/PremiumModalContext';
import {
  generateUserFinansalAIAnaliz,
  getKayitliAIAnaliz,
  getOcrFinansalTaslak,
  getPremiumHesapDurumu,
  getUzmanAnalizTalebim,
  uzmanAnalizTalepEt,
} from '@/lib/api';
import type { OcrFinansalTaslak } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/types';
import type { UzmanAnalizTalebi } from '@/types';

const CHART: { d: string; gelir: number; gider: number }[] = [];

const BEKLEYEN: { aciklama: string; vade: string; tutar: number; gecikme: number }[] = [];

const YAPILAN: { aciklama: string; tarih: string; tutar: number }[] = [];

const PROJELER: { ad: string; baslangic: string; bitis: string | null; tutar: number; durum: string }[] = [];

export default function UserFinansalRaporPage() {
  const [hesapGoster, setHesapGoster] = useState<Record<number, boolean>>({});
  const [hasPremium, setHasPremium] = useState(false);
  const [aiAnaliz, setAiAnaliz] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uzmanTalep, setUzmanTalep] = useState<UzmanAnalizTalebi | null>(null);
  const [uzmanLoading, setUzmanLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [ocrTaslak, setOcrTaslak] = useState<OcrFinansalTaslak | null>(null);
  const { openModal } = usePremiumModal();

  const chart = ocrTaslak?.donemsel_karsilastirma?.length
    ? ocrTaslak.donemsel_karsilastirma
    : ocrTaslak && (ocrTaslak.toplam_gelir || ocrTaslak.toplam_gider)
      ? [{ d: ocrTaslak.donem || 'Belge', gelir: Number(ocrTaslak.toplam_gelir || 0), gider: Number(ocrTaslak.toplam_gider || 0) }]
      : CHART;
  const bankalar = (ocrTaslak?.bankalar || []).map((b, index) => ({
    ad: b.ad || `Banka ${index + 1}`,
    bakiye: Number(b.bakiye || 0),
    limit: Number(b.limit || 0),
    kullanim: Number(b.kullanim || 0),
    hesap: b.hesap || 'Hesap bilgisi yok',
    renk: ['bg-teal-600', 'bg-blue-600', 'bg-amber-600'][index % 3],
  }));
  const bekleyenTahsilatlar = ocrTaslak?.bekleyen_tahsilatlar || BEKLEYEN;
  const yapilanTahsilatlar = ocrTaslak?.yapilan_tahsilatlar || YAPILAN;
  const projeler = ocrTaslak?.projeler || PROJELER;
  const gelir = Number(ocrTaslak?.toplam_gelir || 0);
  const gider = Number(ocrTaslak?.toplam_gider || 0);
  const netKar = gelir - gider;
  const toplamVarlik = Number(ocrTaslak?.toplam_varlik || 0);
  const toplamBakiye = bankalar.reduce((s, b) => s + b.bakiye, 0);
  const hasFinansalData = Boolean(ocrTaslak);

  const finansalVeriler = {
    firma: ocrTaslak?.firma_adi || user?.firmaAdi || 'Yeni şirket',
    donem: ocrTaslak?.donem || '2024 - Yillik',
    gelir,
    gider,
    netKar,
    toplamVarlik,
    toplamBorc: Number(ocrTaslak?.toplam_borc || 0),
    ozkaynak: Number(ocrTaslak?.ozkaynak || 0),
    nakitVeBenzeri: Number(ocrTaslak?.nakit_ve_benzeri || 0),
    bankalar,
    bekleyenTahsilatlar,
    yapilanTahsilatlar,
    projeler,
    donemselKarsilastirma: chart,
  };

  useEffect(() => {
    const loadState = async () => {
      const durum = await getPremiumHesapDurumu();
      setHasPremium(durum.hasPremium);
      setAiAnaliz(await getKayitliAIAnaliz());
      setUzmanTalep(await getUzmanAnalizTalebim());
      setUser(await getCurrentUser());
      setOcrTaslak(await getOcrFinansalTaslak());
    };

    loadState();
    window.addEventListener('premium-data-changed', loadState);
    window.addEventListener('ocr-finansal-data-changed', loadState);
    return () => {
      window.removeEventListener('premium-data-changed', loadState);
      window.removeEventListener('ocr-finansal-data-changed', loadState);
    };
  }, []);

  const handleAIAnaliz = async () => {
    setAiLoading(true);
    try {
      const response = await generateUserFinansalAIAnaliz(finansalVeriler);
      setAiAnaliz(response.data.analiz);
      toast.success('AI finansal analiz olusturuldu.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI analiz olusturulamadi.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUzmanTalep = async () => {
    setUzmanLoading(true);
    try {
      const response = await uzmanAnalizTalepEt(finansalVeriler);
      setUzmanTalep(response.data);
      toast.success('Uzman analizi talebiniz admin paneline iletildi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Uzman analizi talebi gonderilemedi.');
    } finally {
      setUzmanLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Finansal Raporum</h1>
          <Badge className="bg-teal-100 text-teal-800 border-none">2024 - Yıllık</Badge>
        </div>
        <p className="text-slate-500 mt-1">{ocrTaslak?.firma_adi || user?.firmaAdi || 'Yeni şirket'} için {hasFinansalData ? 'belgeden alınan finansal veriler gösteriliyor.' : 'henüz finansal veri girilmedi.'}</p>
      </div>

      <Tabs defaultValue="mali" className="w-full space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 w-full max-w-3xl h-auto flex-wrap">
          <TabsTrigger value="mali" className="py-2 flex-1 text-xs sm:text-sm">Mali Veriler</TabsTrigger>
          <TabsTrigger value="banka" className="py-2 flex-1 text-xs sm:text-sm">Bankalarim</TabsTrigger>
          <TabsTrigger value="tahsilat" className="py-2 flex-1 text-xs sm:text-sm">Tahsilatlarim</TabsTrigger>
          <TabsTrigger value="proje" className="py-2 flex-1 text-xs sm:text-sm">Projelerim</TabsTrigger>
          <TabsTrigger value="ai" className="py-2 flex-1 text-xs sm:text-sm">{hasPremium ? 'AI Analiz' : 'Kilitli AI'}</TabsTrigger>
          <TabsTrigger value="uzman" className="py-2 flex-1 text-xs sm:text-sm">{hasPremium ? 'Uzman' : 'Kilitli Uzman'}</TabsTrigger>
        </TabsList>

        <TabsContent value="mali" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Toplam Gelir', value: gelir, color: 'text-emerald-600', Icon: ArrowUpRight },
              { label: 'Toplam Gider', value: gider, color: 'text-red-500', Icon: ArrowDownRight },
              { label: 'Net Kar', value: netKar, color: 'text-emerald-600', Icon: CheckCircle2 },
              { label: 'Toplam Varlik', value: toplamVarlik, color: 'text-blue-600', Icon: Building2 },
            ].map(({ label, value, color, Icon }) => (
              <Card key={label} className="shadow-sm">
                <CardContent className="p-5 flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{String(label)}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>TL {Number(value).toLocaleString('tr-TR')}</p>
                  </div>
                  <Icon className="w-5 h-5 text-slate-300" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-sm">
            <CardHeader className="border-b pb-3"><CardTitle className="text-lg">Donemsel Karsilastirma</CardTitle></CardHeader>
            <CardContent className="pt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(v) => `TL ${(Number(v) / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(v) => `TL ${Number(v).toLocaleString('tr-TR')}`} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="gelir" name="Gelir" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gider" name="Gider" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banka" className="space-y-6">
          <Card className="shadow-sm border-l-4 border-l-teal-500">
            <CardContent className="p-5 flex justify-between items-center">
              <div><p className="text-sm text-slate-500 font-medium">Toplam Banka Bakiyesi</p><p className="text-3xl font-black text-teal-600 mt-1">TL {toplamBakiye.toLocaleString('tr-TR')}</p></div>
              <Building2 className="w-10 h-10 text-teal-200" />
            </CardContent>
          </Card>
          {bankalar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bankalar.map((b, i) => {
                const pct = b.limit > 0 ? Math.round((b.kullanim / b.limit) * 100) : 0;
                return (
                  <Card key={b.ad} className="shadow-sm">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${b.renk} flex items-center justify-center text-white font-bold text-sm`}>{b.ad.substring(0, 2)}</div><h4 className="font-bold">{b.ad}</h4></div>
                      <p className="text-2xl font-black text-emerald-600">TL {b.bakiye.toLocaleString('tr-TR')}</p>
                      <Progress value={pct} className="h-2" />
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-slate-500 font-mono">{hesapGoster[i] ? `TR12 3456 7890 ${b.hesap.slice(-4)}` : b.hesap}</span>
                        <button onClick={() => setHesapGoster(p => ({ ...p, [i]: !p[i] }))} className="text-slate-400 hover:text-teal-600">{hesapGoster[i] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="shadow-sm"><CardContent className="py-12 text-center"><Building2 className="w-10 h-10 mx-auto text-slate-300 mb-3" /><p className="text-slate-500 font-medium">Belgede banka bilgisi bulunamadı</p><p className="text-sm text-slate-400 mt-1">Banka ekstresi veya mizan yükleyerek banka verilerinizi otomatik doldurun.</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="tahsilat">
          {bekleyenTahsilatlar.length > 0 || yapilanTahsilatlar.length > 0 ? (
            <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Açıklama</TableHead><TableHead>Vade / Tarih</TableHead><TableHead>Tutar</TableHead><TableHead>Durum</TableHead></TableRow></TableHeader><TableBody>
              {bekleyenTahsilatlar.map(t => <TableRow key={t.aciklama}><TableCell>{t.aciklama}</TableCell><TableCell>{t.vade}</TableCell><TableCell>TL {t.tutar.toLocaleString('tr-TR')}</TableCell><TableCell><Badge variant="outline" className={Number(t.gecikme || 0) > 0 ? 'border-red-200 text-red-700 bg-red-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>{Number(t.gecikme || 0) > 0 ? `${t.gecikme} gün gecikti` : 'Bekliyor'}</Badge></TableCell></TableRow>)}
              {yapilanTahsilatlar.map(t => <TableRow key={t.aciklama}><TableCell>{t.aciklama}</TableCell><TableCell>{t.tarih}</TableCell><TableCell>TL {t.tutar.toLocaleString('tr-TR')}</TableCell><TableCell><Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">Ödendi</Badge></TableCell></TableRow>)}
            </TableBody></Table></CardContent></Card>
          ) : (
            <Card className="shadow-sm"><CardContent className="py-12 text-center"><p className="text-slate-500 font-medium">Belgede tahsilat bilgisi bulunamadı</p><p className="text-sm text-slate-400 mt-1">Alacak/borç listesi içeren bir belge yükleyin.</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="proje">
          {projeler.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projeler.map(p => <Card key={p.ad}><CardContent className="p-5"><div className="flex items-center justify-between"><h4 className="font-bold">{p.ad}</h4><Badge variant="outline" className={p.durum === 'bitti' ? 'border-emerald-200 text-emerald-700' : 'border-blue-200 text-blue-700'}>{p.durum === 'bitti' ? 'Tamamlandı' : 'Devam Ediyor'}</Badge></div><p className="text-sm text-slate-500 mt-1">{p.baslangic} → {p.bitis || 'Devam ediyor'}</p><p className="font-bold text-lg mt-2">TL {p.tutar.toLocaleString('tr-TR')}</p></CardContent></Card>)}
            </div>
          ) : (
            <Card className="shadow-sm"><CardContent className="py-12 text-center"><p className="text-slate-500 font-medium">Belgede proje bilgisi bulunamadı</p><p className="text-sm text-slate-400 mt-1">Proje/sözleşme bilgisi içeren bir belge yükleyin.</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {hasPremium ? (
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> AI Finansal Analiz</CardTitle>
                <CardDescription>Girili mali verileriniz Gemini ile analiz edilir ve sonuc burada saklanir.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <Button onClick={handleAIAnaliz} disabled={aiLoading} className="bg-teal-700 hover:bg-teal-800 text-white">{aiLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analiz ediliyor...</> : <><Sparkles className="w-4 h-4 mr-2" /> AI Analiz Olustur</>}</Button>
                {aiAnaliz ? <div className="rounded-lg border bg-white p-5 whitespace-pre-line leading-7 text-sm text-slate-700">{aiAnaliz}</div> : <div className="rounded-lg border border-dashed p-6 text-sm text-slate-500">Henuz AI analizi olusturulmadi.</div>}
              </CardContent>
            </Card>
          ) : (
            <KisitliAlan ozellikAdi="AI Finansal Analiz" paketAdi="Temel Analiz" onPaketTikla={() => openModal('temel_analiz')} />
          )}
        </TabsContent>

        <TabsContent value="uzman">
          {hasPremium ? (
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle>Uzman Gorusu</CardTitle>
                <CardDescription>Talep admin paneline duser; uzman finansal verileri inceleyip raporu gonderir.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {!uzmanTalep && <Button onClick={handleUzmanTalep} disabled={uzmanLoading} className="bg-amber-600 hover:bg-amber-700 text-white">{uzmanLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Talep gonderiliyor...</> : <><Send className="w-4 h-4 mr-2" /> Uzman Analizi Al</>}</Button>}
                {uzmanTalep?.durum === 'bekliyor' && <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">Uzman analizi bekleniyor. Talebiniz admin paneline iletildi.</div>}
                {uzmanTalep?.durum === 'tamamlandi' && <div className="rounded-lg border bg-white p-5 whitespace-pre-line leading-7 text-sm text-slate-700">{uzmanTalep.uzman_gorusu}</div>}
              </CardContent>
            </Card>
          ) : (
            <KisitliAlan ozellikAdi="Uzman Gorusu" paketAdi="Uzman Gorusu veya Premium Bundle" onPaketTikla={() => openModal('uzman_gorusu')} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
