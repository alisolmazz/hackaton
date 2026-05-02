'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getFirma } from '@/lib/api';
import { 
  Presentation, ChevronLeft, Download, CheckCircle2, XCircle, Loader2,
  FileText, LayoutTemplate, X, Image as ImageIcon, Check, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const SON_SUNUMLAR = [
  { id: 1, tarih: '2024-04-15', donem: '2024 - Q1', renk: 'Lacivert', boyut: '2.4 MB' },
  { id: 2, tarih: '2024-01-20', donem: '2023 - Yıllık', renk: 'Mor', boyut: '3.1 MB' },
];

const TEMALAR = [
  { id: 'lacivert', ad: 'Lacivert (Default)', renk: 'bg-slate-900' },
  { id: 'yesil', ad: 'Yeşil', renk: 'bg-emerald-700' },
  { id: 'mor', ad: 'Mor', renk: 'bg-purple-700' },
  { id: 'kirmizi', ad: 'Kırmızı', renk: 'bg-rose-700' },
];

const SLAYTLAR = [
  { id: 'kapak', ad: 'Kapak Slaydı', checked: true },
  { id: 'mali', ad: 'Mali Veriler Özeti', checked: true },
  { id: 'banka', ad: 'Banka Durumu', checked: true },
  { id: 'nakit', ad: 'Nakit Akış Grafiği', checked: true },
  { id: 'borc', ad: 'Borç/Alacak Analizi', checked: true },
  { id: 'projeler', ad: 'Projeler ve İşler', checked: true },
  { id: 'ai', ad: 'AI Analiz Özeti', checked: true },
  { id: 'yatirim', ad: 'Yatırım Portföyü', checked: false },
];

export default function OnSunumPage() {
  const params = useParams();
  const router = useRouter();
  const firmaId = params.firma_id as string;

  const { data: firmaResponse } = useQuery({
    queryKey: ['firma', firmaId],
    queryFn: async () => await getFirma(firmaId),
  });
  const firma = firmaResponse?.data;

  // States
  const [tema, setTema] = useState('lacivert');
  const [donem, setDonem] = useState('2024-Q1');
  const [seciliSlaytlar, setSeciliSlaytlar] = useState<Record<string, boolean>>(
    SLAYTLAR.reduce((acc, s) => ({ ...acc, [s.id]: s.checked }), {})
  );

  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  const seciliTemaObj = TEMALAR.find(t => t.id === tema) || TEMALAR[0];

  const toggleSlayt = (id: string, checked: boolean) => {
    setSeciliSlaytlar(prev => ({ ...prev, [id]: checked }));
  };

  const handleGenerate = () => {
    setStatus('generating');
    setProgress(0);
    setProgressText('Veriler hazırlanıyor...');

    // Aşama 1
    setTimeout(() => {
      setProgress(33);
      setProgressText('Slaytlar oluşturuluyor...');
      
      // Aşama 2
      setTimeout(() => {
        setProgress(66);
        setProgressText('Yapay Zeka yorumları ekleniyor...');

        // Aşama 3
        setTimeout(() => {
          setProgress(90);
          setProgressText('.pptx formatına dönüştürülüyor...');

          // Aşama 4 (Başarılı)
          setTimeout(() => {
            setProgress(100);
            setStatus('success');
            toast.success('Sunum dosyası başarıyla oluşturuldu!');
          }, 1500);

        }, 2000);
      }, 2000);
    }, 1500);
  };

  const handleDownload = async () => {
    try {
      // Gerçek senaryoda:
      // const response = await axios.get(`/pptx/${firmaId}/indir`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // MOCK Download
      const toastId = toast.loading('İndiriliyor...');
      setTimeout(() => {
        toast.dismiss(toastId);
        
        // Boş bir blob yaratıp indirmiş gibi yapalım (Hackathon mockup)
        const blob = new Blob(["mock pptx content"], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${firma?.unvan?.replace(/\s+/g, '_')}_on_sunum.pptx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('Dosya indirildi.');
      }, 1000);

    } catch (error) {
      toast.error('İndirme sırasında hata oluştu.');
    }
  };

  const cancelGeneration = () => {
    setStatus('idle');
    setProgress(0);
    toast.error('Sunum oluşturma işlemi iptal edildi.');
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* ÜST BANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-20">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0 h-10 w-10">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{firma?.unvan || 'Yükleniyor...'}</h1>
              <Badge className="bg-purple-100 text-purple-800 border-none uppercase tracking-wide">Ön Sunum</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">Yönetim kurulu veya bankalar için anında .pptx sunumu üretin.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SOL PANEL (Ayarlar - 1/3) */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-lg">Sunum Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="space-y-2">
                <Label>Dönem Seçimi</Label>
                <Select value={donem} onValueChange={setDonem}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-Q1">2024 - Çeyrek 1</SelectItem>
                    <SelectItem value="2023-Yillik">2023 - Yıllık</SelectItem>
                    <SelectItem value="Tumu">Tüm Veriler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Tema Rengi</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMALAR.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setTema(t.id)}
                      className={`cursor-pointer flex items-center justify-between p-2 rounded-lg border-2 transition-colors ${tema === t.id ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${t.renk}`} />
                        <span className="text-sm font-medium">{t.ad}</span>
                      </div>
                      {tema === t.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="flex justify-between items-center">
                  <span>Dahil Edilecek Slaytlar</span>
                  <span className="text-xs text-slate-500 font-normal">{Object.values(seciliSlaytlar).filter(Boolean).length} seçili</span>
                </Label>
                <div className="space-y-2.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  {SLAYTLAR.map((slayt) => (
                    <div key={slayt.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`s-${slayt.id}`} 
                        checked={seciliSlaytlar[slayt.id]} 
                        onCheckedChange={(c) => toggleSlayt(slayt.id, !!c)} 
                      />
                      <label 
                        htmlFor={`s-${slayt.id}`} 
                        className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${seciliSlaytlar[slayt.id] ? 'font-medium' : 'text-slate-500'}`}
                      >
                        {slayt.ad}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-sm font-medium">Firma Logosu Yükle</span>
                  <span className="text-xs text-slate-500 mt-1">(Opsiyonel, şeffaf PNG)</span>
                </div>
              </div>

            </CardContent>
          </Card>

          <Button 
            onClick={handleGenerate} 
            disabled={status === 'generating'}
            className={`w-full h-14 text-lg font-semibold shadow-lg transition-all ${
              status === 'success' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {status === 'generating' ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Oluşturuluyor...</>
            ) : status === 'success' ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Yeniden Oluştur</>
            ) : (
              <><Presentation className="w-5 h-5 mr-2" /> Sunum Oluştur</>
            )}
          </Button>

          {status === 'error' && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-start gap-2">
              <XCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Oluşturulamadı</p>
                <p className="mt-1">Veriler derlenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
              </div>
            </div>
          )}
        </div>

        {/* SAĞ PANEL (Önizleme - 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm relative overflow-hidden h-full min-h-[600px] flex flex-col">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 bg-slate-50/50 dark:bg-slate-900/30">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Önizleme & İndirme</span>
                {status === 'success' && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200">Hazır</Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 flex-1 relative bg-slate-100/50 dark:bg-slate-950 p-6">
              
              {/* Overlay: Generating */}
              {status === 'generating' && (
                <div className="absolute inset-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-6">
                    <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Sunum Hazırlanıyor</h3>
                  <p className="text-slate-500 mb-8 max-w-sm">{progressText}</p>
                  
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>İlerleme</span>
                      <span>%{progress}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Button variant="ghost" onClick={cancelGeneration} className="mt-8 text-slate-500 hover:text-red-600">
                    <X className="w-4 h-4 mr-2" /> İşlemi İptal Et
                  </Button>
                </div>
              )}

              {/* View: Success */}
              {status === 'success' && (
                <div className="absolute inset-0 z-10 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800">
                    <FileText className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Sunum Dosyası Hazır!</h3>
                  <p className="text-slate-500 mb-8 max-w-md">
                    {Object.values(seciliSlaytlar).filter(Boolean).length} slayttan oluşan {firma?.unvan} finansal raporu PowerPoint (.pptx) formatında oluşturuldu.
                  </p>
                  
                  <div className="flex gap-4">
                    <Button onClick={handleDownload} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-14 px-8 text-lg shadow-lg hover:shadow-xl transition-all">
                      <Download className="w-6 h-6 mr-3" /> .pptx İndir
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">Boyut: ~2.8 MB • {format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
                </div>
              )}

              {/* View: Idle / Wireframes */}
              {(status === 'idle' || status === 'error') && (
                <div className="h-full flex flex-col">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-6">
                    
                    {seciliSlaytlar.kapak && (
                      <div className="aspect-[16/9] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-2 ${seciliTemaObj.renk}`} />
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                          <h4 className="font-bold text-xl mb-2">{firma?.unvan || 'Firma Adı'}</h4>
                          <p className="text-slate-500">Finansal Durum & Yönetim Özeti</p>
                          <Badge variant="outline" className="mt-4">{donem}</Badge>
                        </div>
                      </div>
                    )}

                    {seciliSlaytlar.mali && (
                      <div className="aspect-[16/9] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col relative overflow-hidden p-4">
                        <div className={`h-1 w-12 ${seciliTemaObj.renk} mb-3`} />
                        <h4 className="font-bold text-sm mb-4">Mali Veriler Özeti</h4>
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2"><div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"/><div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded"/></div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2"><div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"/><div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded"/></div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2"><div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"/><div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded"/></div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded p-2"><div className="h-2 w-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"/><div className="h-3 w-16 bg-slate-300 dark:bg-slate-600 rounded"/></div>
                        </div>
                      </div>
                    )}

                    {seciliSlaytlar.nakit && (
                      <div className="aspect-[16/9] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col relative overflow-hidden p-4">
                        <div className={`h-1 w-12 ${seciliTemaObj.renk} mb-3`} />
                        <h4 className="font-bold text-sm mb-4">Nakit Akış Grafiği</h4>
                        <div className="flex-1 flex items-end gap-2 px-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                          {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-t-sm" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    )}

                    {seciliSlaytlar.ai && (
                      <div className="aspect-[16/9] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col relative overflow-hidden p-4">
                        <div className={`h-1 w-12 ${seciliTemaObj.renk} mb-3`} />
                        <h4 className="font-bold text-sm mb-4">Yapay Zeka Analiz Özeti</h4>
                        <div className="space-y-3">
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-4/6 mt-4" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ALT PANEL (Son Sunumlar) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <CardTitle className="text-lg">Son Oluşturulan Sunumlar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6">Tarih</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Tema</TableHead>
                <TableHead>Boyut</TableHead>
                <TableHead className="text-right pr-6">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SON_SUNUMLAR.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6 font-medium">{format(new Date(item.tarih), 'dd MMM yyyy', {locale: tr})}</TableCell>
                  <TableCell>{item.donem}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="shadow-none font-normal">{item.renk}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{item.boyut}</TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" /> Tekrar İndir
                    </Button>
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
