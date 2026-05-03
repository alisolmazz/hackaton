'use client';

import PptxGenJS from 'pptxgenjs';

interface PptxConfig {
  firmaAdi: string;
  donem: string;
  tema: string;
  seciliSlaytlar: Record<string, boolean>;
  maliVeriler?: {
    toplamGelir?: number;
    toplamGider?: number;
    netKar?: number;
    toplamVarlik?: number;
  };
}

const TEMA_RENKLERI: Record<string, { primary: string; secondary: string; accent: string }> = {
  lacivert: { primary: '0F172A', secondary: '1E293B', accent: '3B82F6' },
  yesil:    { primary: '064E3B', secondary: '065F46', accent: '10B981' },
  mor:      { primary: '3B0764', secondary: '581C87', accent: 'A855F7' },
  kirmizi:  { primary: '7F1D1D', secondary: '991B1B', accent: 'EF4444' },
};

export async function generatePptx(config: PptxConfig): Promise<void> {
  const pptx = new PptxGenJS();
  const colors = TEMA_RENKLERI[config.tema] || TEMA_RENKLERI.lacivert;

  pptx.author = 'Pro Sicht AI Platform';
  pptx.company = 'Pro Sicht';
  pptx.subject = `${config.firmaAdi} Finansal Rapor`;
  pptx.title = `${config.firmaAdi} - Finansal Durum Raporu`;

  // ─── SLIDE 1: Kapak ───
  if (config.seciliSlaytlar.kapak) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    // Sol dikey accent çizgisi
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 0.15, h: '100%',
      fill: { color: colors.accent },
    });

    // Firma adı
    slide.addText(config.firmaAdi, {
      x: 1.0, y: 1.8, w: 8, h: 1.2,
      fontSize: 36, fontFace: 'Segoe UI',
      color: 'FFFFFF', bold: true,
    });

    // Alt başlık
    slide.addText('Finansal Durum & Yönetim Özeti', {
      x: 1.0, y: 3.0, w: 8, h: 0.6,
      fontSize: 18, fontFace: 'Segoe UI',
      color: '94A3B8',
    });

    // Dönem badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0, y: 3.8, w: 2.0, h: 0.5,
      rectRadius: 0.15,
      fill: { color: colors.secondary },
      line: { color: '475569', width: 1 },
    });
    slide.addText(config.donem, {
      x: 1.0, y: 3.8, w: 2.0, h: 0.5,
      fontSize: 12, fontFace: 'Segoe UI',
      color: 'CBD5E1', align: 'center', valign: 'middle',
    });

    // Alt bilgi
    slide.addText('Pro Sicht AI Platform • Gizli & Özeldir', {
      x: 1.0, y: 4.8, w: 8, h: 0.4,
      fontSize: 10, fontFace: 'Segoe UI', color: '475569',
    });
  }

  // ─── SLIDE 2: Mali Veriler Özeti ───
  if (config.seciliSlaytlar.mali) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Mali Veriler Özeti', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    const mali = config.maliVeriler || {
      toplamGelir: 2450000,
      toplamGider: 1830000,
      netKar: 620000,
      toplamVarlik: 5200000,
    };

    const kartlar = [
      { baslik: 'Toplam Gelir', deger: `₺${(mali.toplamGelir! / 1e6).toFixed(2)}M`, renk: '10B981' },
      { baslik: 'Toplam Gider', deger: `₺${(mali.toplamGider! / 1e6).toFixed(2)}M`, renk: 'EF4444' },
      { baslik: 'Net Kâr', deger: `₺${(mali.netKar! / 1e6).toFixed(2)}M`, renk: '3B82F6' },
      { baslik: 'Toplam Varlık', deger: `₺${(mali.toplamVarlik! / 1e6).toFixed(2)}M`, renk: 'A855F7' },
    ];

    kartlar.forEach((kart, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xPos = 0.6 + col * 4.4;
      const yPos = 1.3 + row * 1.8;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: xPos, y: yPos, w: 4.0, h: 1.4,
        rectRadius: 0.15,
        fill: { color: colors.secondary },
        line: { color: '334155', width: 1 },
      });

      slide.addText(kart.baslik, {
        x: xPos + 0.3, y: yPos + 0.2, w: 3.4, h: 0.4,
        fontSize: 12, fontFace: 'Segoe UI', color: '94A3B8',
      });

      slide.addText(kart.deger, {
        x: xPos + 0.3, y: yPos + 0.6, w: 3.4, h: 0.6,
        fontSize: 28, fontFace: 'Segoe UI', bold: true, color: kart.renk,
      });
    });

    slide.addText(`Dönem: ${config.donem}`, {
      x: 0.6, y: 4.8, w: 8, h: 0.4,
      fontSize: 10, fontFace: 'Segoe UI', color: '475569',
    });
  }

  // ─── SLIDE 3: Banka Durumu ───
  if (config.seciliSlaytlar.banka) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Banka Hesap Durumu', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    const bankalar = [
      { ad: 'Ziraat Bankası', bakiye: '₺1,250,000', durum: 'Aktif' },
      { ad: 'İş Bankası', bakiye: '₺890,000', durum: 'Aktif' },
      { ad: 'Garanti BBVA', bakiye: '₺425,000', durum: 'Aktif' },
    ];

    // Tablo başlıkları
    const headerRow = [
      { text: 'Banka Adı', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
      { text: 'Bakiye', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
      { text: 'Durum', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
    ];

    const dataRows = bankalar.map(b => [
      { text: b.ad, options: { fontSize: 11, fontFace: 'Segoe UI', color: 'E2E8F0' } },
      { text: b.bakiye, options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: '10B981' } },
      { text: b.durum, options: { fontSize: 11, fontFace: 'Segoe UI', color: '94A3B8' } },
    ]);

    slide.addTable([headerRow, ...dataRows], {
      x: 0.6, y: 1.3, w: 8.8,
      border: { type: 'solid', pt: 0.5, color: '334155' },
      colW: [3.5, 3.0, 2.3],
      rowH: [0.5, 0.45, 0.45, 0.45],
    });
  }

  // ─── SLIDE 4: Nakit Akış Grafiği ───
  if (config.seciliSlaytlar.nakit) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Nakit Akış Analizi', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    slide.addChart(pptx.ChartType.bar, [
      {
        name: 'Giriş',
        labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
        values: [180000, 220000, 195000, 310000, 275000, 340000],
      },
      {
        name: 'Çıkış',
        labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz'],
        values: [150000, 180000, 210000, 190000, 230000, 260000],
      },
    ], {
      x: 0.6, y: 1.2, w: 8.8, h: 3.5,
      showTitle: false,
      showValue: false,
      catAxisLabelColor: '94A3B8',
      valAxisLabelColor: '94A3B8',
      catAxisLineShow: false,
      valAxisLineShow: false,
      chartColors: ['10B981', 'EF4444'],
      plotArea: { fill: { color: colors.secondary } },
      valGridLine: { color: '334155', size: 0.5 },
    });
  }

  // ─── SLIDE 5: Borç/Alacak ───
  if (config.seciliSlaytlar.borc) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Borç / Alacak Analizi', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    slide.addChart(pptx.ChartType.doughnut, [
      {
        name: 'Durum',
        labels: ['Alacak', 'Borç', 'Vadesi Geçen'],
        values: [45, 35, 20],
      },
    ], {
      x: 0.6, y: 1.3, w: 4, h: 3.5,
      showTitle: false,
      showPercent: true,
      chartColors: ['10B981', '3B82F6', 'EF4444'],
      dataLabelColor: 'FFFFFF',
      dataLabelFontSize: 12,
    });

    const ozet = [
      { label: 'Toplam Alacak', deger: '₺1,890,000', renk: '10B981' },
      { label: 'Toplam Borç', deger: '₺1,450,000', renk: '3B82F6' },
      { label: 'Vadesi Geçen', deger: '₺380,000', renk: 'EF4444' },
    ];

    ozet.forEach((item, i) => {
      const yPos = 1.5 + i * 1.0;
      slide.addText(item.label, {
        x: 5.5, y: yPos, w: 4, h: 0.3,
        fontSize: 12, fontFace: 'Segoe UI', color: '94A3B8',
      });
      slide.addText(item.deger, {
        x: 5.5, y: yPos + 0.3, w: 4, h: 0.5,
        fontSize: 22, fontFace: 'Segoe UI', bold: true, color: item.renk,
      });
    });
  }

  // ─── SLIDE 6: Projeler ───
  if (config.seciliSlaytlar.projeler) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Projeler & İş Durumu', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    const projeler = [
      { ad: 'E-Ticaret Altyapısı', durum: 'Devam Ediyor', tamamlanma: '%75' },
      { ad: 'ERP Entegrasyonu', durum: 'Tamamlandı', tamamlanma: '%100' },
      { ad: 'Mobil Uygulama', durum: 'Planlama', tamamlanma: '%15' },
    ];

    const headerRow = [
      { text: 'Proje Adı', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
      { text: 'Durum', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
      { text: 'Tamamlanma', options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: 'CBD5E1', fill: { color: colors.secondary } } },
    ];

    const dataRows = projeler.map(p => [
      { text: p.ad, options: { fontSize: 11, fontFace: 'Segoe UI', color: 'E2E8F0' } },
      { text: p.durum, options: { fontSize: 11, fontFace: 'Segoe UI', color: '94A3B8' } },
      { text: p.tamamlanma, options: { fontSize: 11, fontFace: 'Segoe UI', bold: true, color: colors.accent } },
    ]);

    slide.addTable([headerRow, ...dataRows], {
      x: 0.6, y: 1.3, w: 8.8,
      border: { type: 'solid', pt: 0.5, color: '334155' },
      colW: [4.0, 2.5, 2.3],
      rowH: [0.5, 0.45, 0.45, 0.45],
    });
  }

  // ─── SLIDE 7: AI Analiz ───
  if (config.seciliSlaytlar.ai) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Yapay Zeka Finansal Analiz', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6, y: 1.2, w: 8.8, h: 3.6,
      rectRadius: 0.15,
      fill: { color: colors.secondary },
      line: { color: '334155', width: 1 },
    });

    slide.addText(
      `${config.firmaAdi} için yapılan yapay zeka destekli finansal analiz sonuçlarına göre:\n\n` +
      `• Gelir-Gider dengesi pozitif yöndedir ve kârlılık oranı sektör ortalamasının üzerindedir.\n` +
      `• Nakit akış projeksiyonları önümüzdeki çeyrek için ılımlı bir büyüme öngörmektedir.\n` +
      `• Borç/özsermaye oranı sağlıklı seviyededir (0.45x).\n` +
      `• Alacak tahsilat süreleri sektör ortalamasına yakındır (ortalama 38 gün).\n\n` +
      `Öneriler: Kısa vadeli yatırım araçları değerlendirilebilir, operasyonel giderler optimize edilebilir.`,
      {
        x: 0.9, y: 1.4, w: 8.2, h: 3.2,
        fontSize: 12, fontFace: 'Segoe UI',
        color: 'CBD5E1', lineSpacingMultiple: 1.3,
        valign: 'top',
      }
    );
  }

  // ─── SLIDE 8: Yatırım Portföyü ───
  if (config.seciliSlaytlar.yatirim) {
    const slide = pptx.addSlide();
    slide.background = { color: colors.primary };

    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.06,
      fill: { color: colors.accent },
    });

    slide.addText('Yatırım Portföyü', {
      x: 0.6, y: 0.3, w: 8, h: 0.6,
      fontSize: 24, fontFace: 'Segoe UI', bold: true, color: 'FFFFFF',
    });

    slide.addChart(pptx.ChartType.pie, [
      {
        name: 'Portföy',
        labels: ['Hisse Senedi', 'Tahvil', 'Döviz', 'Altın', 'Gayrimenkul'],
        values: [35, 20, 15, 15, 15],
      },
    ], {
      x: 0.6, y: 1.2, w: 8.8, h: 3.5,
      showTitle: false,
      showPercent: true,
      showLegend: true,
      legendPos: 'r',
      legendFontSize: 11,
      legendColor: 'CBD5E1',
      chartColors: ['3B82F6', '10B981', 'F59E0B', 'EF4444', 'A855F7'],
      dataLabelColor: 'FFFFFF',
      dataLabelFontSize: 11,
    });
  }

  // ─── Son Slayt: Kapanış ───
  const sonSlide = pptx.addSlide();
  sonSlide.background = { color: colors.primary };

  sonSlide.addText('Teşekkürler', {
    x: 0, y: 1.5, w: '100%', h: 1,
    fontSize: 40, fontFace: 'Segoe UI', bold: true,
    color: 'FFFFFF', align: 'center',
  });

  sonSlide.addText(`${config.firmaAdi}\nFinansal Durum Raporu • ${config.donem}`, {
    x: 0, y: 2.8, w: '100%', h: 0.8,
    fontSize: 14, fontFace: 'Segoe UI',
    color: '94A3B8', align: 'center', lineSpacingMultiple: 1.5,
  });

  sonSlide.addText('Pro Sicht AI Platform ile otomatik olarak oluşturulmuştur.', {
    x: 0, y: 4.5, w: '100%', h: 0.4,
    fontSize: 10, fontFace: 'Segoe UI',
    color: '475569', align: 'center',
  });

  // ─── Dosyayı indir ───
  const fileName = `${config.firmaAdi.replace(/\s+/g, '_')}_on_sunum`;
  await pptx.writeFile({ fileName });
}
