'use client';

import React, { useState, useEffect } from 'react';
import { BarChart2, UserCheck, Crown, CheckCircle2, Loader2, Clock, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePremiumModal } from '@/context/PremiumModalContext';
import { getPremiumHesapDurumu, premiumSatinAl } from '@/lib/api';

type PaketId = 'temel_analiz' | 'uzman_gorusu' | 'premium_bundle';

const PAKETLER: { id: PaketId; ad: string; icon: any; aciklama: string; ozellikler: string[]; renk: string; btnClass: string; iconBg: string; popular?: boolean }[] = [
  {
    id: 'temel_analiz', ad: 'Temel Analiz', icon: BarChart2,
    aciklama: 'AI destekli otomatik finansal analiz raporu',
    ozellikler: ['AI Analiz Raporu', 'Güçlü/Zayıf Yön Analizi', 'Risk Değerlendirmesi', 'Likidite Analizi', 'PDF İndirme'],
    renk: 'border-blue-200 hover:border-blue-400', btnClass: 'border-blue-300 text-blue-700 hover:bg-blue-50', iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'uzman_gorusu', ad: 'Uzman Görüşü', icon: UserCheck,
    aciklama: 'Finans uzmanı tarafından yazılan yorumlu rapor',
    ozellikler: ['Kişisel Uzman Yorumu', 'Sektör Karşılaştırması', 'Detaylı Öneriler', 'Uzman İmzalı Rapor', 'PDF + Sunum'],
    renk: 'border-purple-200 hover:border-purple-400', btnClass: 'border-purple-300 text-purple-700 hover:bg-purple-50', iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'premium_bundle', ad: 'Premium Bundle', icon: Crown, popular: true,
    aciklama: 'Tüm özelliklere sınırsız erişim',
    ozellikler: ['AI Analiz Raporu', 'Uzman Görüşü', 'Ön Sunum (.pptx)', 'Nakit Akış Analizi', 'Öncelikli Destek', 'Tüm Gelecek Özellikler'],
    renk: 'border-amber-300 hover:border-amber-500', btnClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-none', iconBg: 'bg-amber-100 text-amber-600',
  },
];

export function PremiumModal() {
  const { isOpen, defaultPaket, closeModal } = usePremiumModal();
  const [secili, setSecili] = useState<PaketId | null>(null);
  const [loading, setLoading] = useState(false);

  const [talepDurum, setTalepDurum] = useState<'yok' | 'bekliyor' | 'onaylandi' | 'reddedildi'>('yok');
  const [sonTalepTarihi, setSonTalepTarihi] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPaket) setSecili(defaultPaket);
  }, [defaultPaket, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const loadDurum = async () => {
      const durum = await getPremiumHesapDurumu();
      setTalepDurum(durum.talepDurum);
      setSonTalepTarihi(durum.talep?.created_at || null);
      if (durum.paket) setSecili(durum.paket);
    };

    loadDurum();
    window.addEventListener('premium-data-changed', loadDurum);
    return () => window.removeEventListener('premium-data-changed', loadDurum);
  }, [isOpen]);

  const handleGonder = async () => {
    if (!secili) { toast.error('Lütfen bir paket seçin.'); return; }
    setLoading(true);
    try {
      await premiumSatinAl(secili);
      setTalepDurum('bekliyor');
      setSonTalepTarihi(new Date().toISOString());
      window.dispatchEvent(new Event('premium-data-changed'));
      closeModal();
      setSecili(null);
      toast.success('Talebiniz iletildi!', {
        description: 'Admin onayı sonrası erişiminiz aktifleşecektir.',
        duration: 5000,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Talep gonderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { closeModal(); setSecili(null); } }}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">

        {/* GRADIENT BANNER */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-6 h-6" /> Premium'a Geçin</h2>
            <p className="text-white/80 mt-1">Finansal analizinizi bir üst seviyeye taşıyın</p>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ONAY BEKLENİYOR DURUMU */}
          {talepDurum === 'bekliyor' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center"><Clock className="w-10 h-10 text-amber-600 animate-pulse" /></div>
              <h3 className="text-2xl font-bold">Talebiniz İnceleniyor</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Admin onayı bekleniyor. Onaylandığında bildirim alacaksınız.</p>
              {sonTalepTarihi && <p className="text-xs text-slate-400">Son talep: {new Date(sonTalepTarihi).toLocaleString('tr-TR')}</p>}
            </div>
          )}

          {/* ONAYLANMIŞ DURUM */}
          {talepDurum === 'onaylandi' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
              <h3 className="text-2xl font-bold text-emerald-700">Erişiminiz Aktif ✓</h3>
              <p className="text-slate-500">Bu özelliğe zaten erişiminiz bulunmaktadır.</p>
            </div>
          )}

          {/* PAKET KARTLARI */}
          {talepDurum === 'yok' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PAKETLER.map(p => {
                  const isSecili = secili === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSecili(p.id)}
                      className={cn(
                        "relative rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 flex flex-col",
                        p.renk,
                        isSecili && "ring-2 ring-offset-2 ring-amber-400 border-amber-400 shadow-lg",
                        p.popular && "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10"
                      )}
                    >
                      {/* Popular Badge */}
                      {p.popular && (
                        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-md text-[10px] px-3">
                          En Popüler
                        </Badge>
                      )}

                      {/* Seçili Check */}
                      {isSecili && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}

                      {/* İkon */}
                      <div className={`w-12 h-12 rounded-xl ${p.iconBg} flex items-center justify-center mb-3`}>
                        <p.icon className="w-6 h-6" />
                      </div>

                      <h3 className="font-bold text-lg mb-1">{p.ad}</h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">{p.aciklama}</p>

                      {/* Özellikler */}
                      <ul className="space-y-1.5 mb-5 flex-1">
                        {p.ozellikler.map(o => (
                          <li key={o} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {o}
                          </li>
                        ))}
                      </ul>

                      {/* Fiyat + Buton */}
                      <p className="text-sm font-semibold text-slate-600 mb-3">İletişime Geçin</p>
                      <Button
                        variant="outline"
                        className={cn("w-full font-semibold", p.btnClass, isSecili && "ring-1 ring-amber-400")}
                        onClick={(e) => { e.stopPropagation(); setSecili(p.id); }}
                      >
                        {isSecili ? '✓ Seçildi' : 'Seç'}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* GÖNDER BUTONU */}
              <Button
                onClick={handleGonder}
                disabled={!secili || loading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Talebiniz gönderiliyor...</>
                ) : (
                  <><Crown className="w-5 h-5 mr-2" /> Talep Gönder</>
                )}
              </Button>

              <p className="text-xs text-center text-slate-400">
                Talep gönderildikten sonra admin ekibimiz en kısa sürede inceleyecek ve size bildirim gönderilecektir.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
