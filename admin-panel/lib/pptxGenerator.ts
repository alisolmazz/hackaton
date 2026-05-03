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

type Theme = {
  primary: string;
  secondary: string;
  surface: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  good: string;
  bad: string;
  warn: string;
};

const THEMES: Record<string, Theme> = {
  lacivert: {
    primary: '07111F',
    secondary: '0F172A',
    surface: '111C2F',
    ink: 'F8FAFC',
    muted: '94A3B8',
    accent: '38BDF8',
    accent2: 'A78BFA',
    good: '10B981',
    bad: 'F43F5E',
    warn: 'F59E0B',
  },
  yesil: {
    primary: '031812',
    secondary: '064E3B',
    surface: '0B2F26',
    ink: 'F0FDF4',
    muted: 'A7F3D0',
    accent: '34D399',
    accent2: '60A5FA',
    good: '22C55E',
    bad: 'F43F5E',
    warn: 'FBBF24',
  },
  mor: {
    primary: '160624',
    secondary: '3B0764',
    surface: '25103A',
    ink: 'FAF5FF',
    muted: 'C4B5FD',
    accent: 'C084FC',
    accent2: '22D3EE',
    good: '34D399',
    bad: 'FB7185',
    warn: 'FBBF24',
  },
  kirmizi: {
    primary: '220708',
    secondary: '7F1D1D',
    surface: '351113',
    ink: 'FFF1F2',
    muted: 'FDA4AF',
    accent: 'FB7185',
    accent2: 'FBBF24',
    good: '34D399',
    bad: 'EF4444',
    warn: 'F59E0B',
  },
};

const DATA = {
  financials: {
    revenue: 12_500_000,
    expense: 8_400_000,
    profit: 4_100_000,
    assets: 25_000_000,
    debt: 9_500_000,
    cash: 3_200_000,
    equity: 15_500_000,
  },
  quarters: [
    { label: 'Q1', revenue: 2_450_000, expense: 1_830_000, profit: 620_000 },
    { label: 'Q2', revenue: 2_980_000, expense: 2_020_000, profit: 960_000 },
    { label: 'Q3', revenue: 3_250_000, expense: 2_180_000, profit: 1_070_000 },
    { label: 'Q4', revenue: 3_820_000, expense: 2_370_000, profit: 1_450_000 },
  ],
  cashFlow: [
    { month: 'Oca', in: 920_000, out: 710_000 },
    { month: 'Sub', in: 1_040_000, out: 795_000 },
    { month: 'Mar', in: 1_185_000, out: 865_000 },
    { month: 'Nis', in: 1_340_000, out: 910_000 },
    { month: 'May', in: 1_260_000, out: 980_000 },
    { month: 'Haz', in: 1_510_000, out: 1_095_000 },
    { month: 'Tem', in: 1_420_000, out: 1_015_000 },
    { month: 'Agu', in: 1_665_000, out: 1_170_000 },
    { month: 'Eyl', in: 1_730_000, out: 1_240_000 },
    { month: 'Eki', in: 1_850_000, out: 1_325_000 },
    { month: 'Kas', in: 1_920_000, out: 1_390_000 },
    { month: 'Ara', in: 2_140_000, out: 1_515_000 },
  ],
  banks: [
    { name: 'Garanti BBVA', balance: 1_840_000, limit: 3_000_000, used: 1_125_000 },
    { name: 'Akbank', balance: 965_000, limit: 1_750_000, used: 640_000 },
    { name: 'Yapi Kredi', balance: 1_285_000, limit: 2_200_000, used: 890_000 },
  ],
  receivables: [
    { bucket: '0-30', receivable: 1_260_000, payable: 780_000 },
    { bucket: '31-60', receivable: 860_000, payable: 540_000 },
    { bucket: '61-90', receivable: 520_000, payable: 420_000 },
    { bucket: '90+', receivable: 310_000, payable: 260_000 },
  ],
  projects: [
    { name: 'ERP modernizasyonu', budget: 2_400_000, completion: 68, status: 'Devam' },
    { name: 'Sube nakit akisi', budget: 1_180_000, completion: 42, status: 'Devam' },
    { name: '2025 kapanis raporu', budget: 820_000, completion: 100, status: 'Bitti' },
  ],
  investments: [
    { name: 'BIST 30 Hisse Sepeti', value: 1_515_000, returnPct: 26.3, risk: 'Orta' },
    { name: 'Tahvil / Bono', value: 912_000, returnPct: 7.3, risk: 'Dusuk' },
    { name: 'Lojistik Depo Ortakligi', value: 2_680_000, returnPct: 27.6, risk: 'Orta' },
    { name: 'Fintech Girisim', value: 585_000, returnPct: -10.0, risk: 'Yuksek' },
    { name: 'Eurobond Sepeti', value: 1_088_000, returnPct: 11.0, risk: 'Dusuk' },
  ],
};

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const money = (value: number) => `TRY ${(value / 1_000_000).toFixed(1)}M`;
const pct = (value: number) => `${value.toFixed(1)}%`;
const sum = <T,>(rows: T[], getter: (row: T) => number) => rows.reduce((acc, row) => acc + getter(row), 0);

function addHeader(slide: PptxGenJS.Slide, theme: Theme, kicker: string, title: string, page: string) {
  slide.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: theme.primary }, line: { color: theme.primary } });
  slide.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: 0.08, fill: { color: theme.accent }, line: { color: theme.accent } });
  slide.addText(kicker.toUpperCase(), {
    x: 0.55, y: 0.35, w: 2.7, h: 0.25,
    fontFace: 'Aptos', fontSize: 8, bold: true, color: theme.accent,
  });
  slide.addText(title, {
    x: 0.55, y: 0.65, w: 9.4, h: 0.55,
    fontFace: 'Georgia', fontSize: 22, bold: true, color: theme.ink,
    margin: 0,
  });
  slide.addText(page, {
    x: 12.15, y: 0.38, w: 0.6, h: 0.25,
    fontFace: 'Aptos', fontSize: 8, color: theme.muted, align: 'right',
  });
}

function addFooter(slide: PptxGenJS.Slide, theme: Theme, note = 'Pro Sicht AI Platform | otomatik yonetim sunumu') {
  slide.addText(note, {
    x: 0.55, y: 7.06, w: 8.5, h: 0.2,
    fontFace: 'Aptos', fontSize: 7.5, color: '64748B',
  });
}

function addMetric(slide: PptxGenJS.Slide, theme: Theme, x: number, y: number, w: number, label: string, value: string, delta: string, color: string) {
  slide.addShape('roundRect', {
    x, y, w, h: 1.05,
    rectRadius: 0.08,
    fill: { color: theme.surface, transparency: 3 },
    line: { color: '22304A', transparency: 15, width: 0.7 },
  });
  slide.addText(label, { x: x + 0.18, y: y + 0.14, w: w - 0.36, h: 0.22, fontFace: 'Aptos', fontSize: 8.5, color: theme.muted, bold: true });
  slide.addText(value, { x: x + 0.18, y: y + 0.38, w: w - 0.36, h: 0.34, fontFace: 'Aptos Display', fontSize: 20, color, bold: true, margin: 0 });
  slide.addText(delta, { x: x + 0.18, y: y + 0.78, w: w - 0.36, h: 0.2, fontFace: 'Aptos', fontSize: 7.5, color: 'CBD5E1' });
}

function addInsightBox(slide: PptxGenJS.Slide, theme: Theme, x: number, y: number, w: number, h: number, title: string, body: string, accent?: string) {
  slide.addShape('roundRect', {
    x, y, w, h,
    rectRadius: 0.08,
    fill: { color: theme.surface, transparency: 4 },
    line: { color: accent || theme.accent, transparency: 35, width: 0.8 },
  });
  slide.addShape('rect', { x, y, w: 0.08, h, fill: { color: accent || theme.accent }, line: { color: accent || theme.accent } });
  slide.addText(title, { x: x + 0.25, y: y + 0.18, w: w - 0.45, h: 0.25, fontFace: 'Aptos', fontSize: 9.5, bold: true, color: theme.ink });
  slide.addText(body, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: h - 0.65, fontFace: 'Aptos', fontSize: 8.2, color: 'CBD5E1', breakLine: false, fit: 'shrink' });
}

function addBar(slide: PptxGenJS.Slide, theme: Theme, x: number, y: number, w: number, h: number, value: number, max: number, color: string, label: string, valueLabel: string) {
  const fillW = Math.max(0.05, (value / max) * w);
  slide.addText(label, { x, y: y - 0.28, w: 2.6, h: 0.18, fontFace: 'Aptos', fontSize: 8.5, color: theme.muted });
  slide.addShape('rect', { x, y, w, h, fill: { color: '1E293B' }, line: { color: '1E293B' } });
  slide.addShape('rect', { x, y, w: fillW, h, fill: { color }, line: { color } });
  slide.addText(valueLabel, { x: x + w + 0.15, y: y - 0.04, w: 1.0, h: 0.18, fontFace: 'Aptos', fontSize: 8, color: theme.ink });
}

function addSection(slide: PptxGenJS.Slide, theme: Theme, title: string, subtitle: string) {
  slide.background = { color: theme.primary };
  slide.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: theme.primary }, line: { color: theme.primary } });
  slide.addShape('arc', { x: 8.9, y: -0.7, w: 5.3, h: 5.3, line: { color: theme.accent, transparency: 60, width: 2 } });
  slide.addShape('arc', { x: 9.7, y: 0.1, w: 3.8, h: 3.8, line: { color: theme.accent2, transparency: 65, width: 1.5 } });
  slide.addText(title, { x: 0.9, y: 2.45, w: 8.2, h: 0.7, fontFace: 'Georgia', fontSize: 30, color: theme.ink, bold: true, margin: 0 });
  slide.addText(subtitle, { x: 0.95, y: 3.25, w: 7.2, h: 0.55, fontFace: 'Aptos', fontSize: 13, color: theme.muted });
  slide.addShape('rect', { x: 0.95, y: 4.18, w: 2.2, h: 0.05, fill: { color: theme.accent }, line: { color: theme.accent } });
}

export async function generatePptx(config: PptxConfig): Promise<void> {
  const pptx = new PptxGenJS();
  const theme = THEMES[config.tema] || THEMES.lacivert;
  const selected = config.seciliSlaytlar || {};

  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Pro Sicht AI Platform';
  pptx.company = 'Pro Sicht';
  pptx.subject = `${config.firmaAdi} detaylı finansal ön sunum`;
  pptx.title = `${config.firmaAdi} - Finansal Hikaye ve Yönetim Sunumu`;
  pptx.theme = {
    headFontFace: 'Georgia',
    bodyFontFace: 'Aptos',
  };

  const margin = DATA.financials.profit / DATA.financials.revenue;
  const debtRatio = DATA.financials.debt / DATA.financials.assets;
  const totalBankBalance = sum(DATA.banks, (b) => b.balance);
  const totalCreditLimit = sum(DATA.banks, (b) => b.limit);
  const totalCreditUsed = sum(DATA.banks, (b) => b.used);
  const totalReceivable = sum(DATA.receivables, (r) => r.receivable);
  const totalPayable = sum(DATA.receivables, (r) => r.payable);
  const investmentValue = sum(DATA.investments, (i) => i.value);

  if (selected.kapak) {
    const slide = pptx.addSlide();
    slide.background = { color: theme.primary };
    slide.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: theme.primary }, line: { color: theme.primary } });
    slide.addShape('rect', { x: 0, y: 0, w: 0.18, h: SLIDE_H, fill: { color: theme.accent }, line: { color: theme.accent } });
    slide.addShape('arc', { x: 8.9, y: -1.3, w: 5.8, h: 5.8, line: { color: theme.accent, transparency: 55, width: 2.2 } });
    slide.addShape('arc', { x: 9.7, y: 0.0, w: 3.6, h: 3.6, line: { color: theme.accent2, transparency: 65, width: 1.4 } });
    slide.addText('PRO SICHT | EXECUTIVE FINANCE STORY', { x: 0.9, y: 0.75, w: 5.2, h: 0.25, fontFace: 'Aptos', fontSize: 8.5, bold: true, color: theme.accent });
    slide.addText(config.firmaAdi, { x: 0.86, y: 1.55, w: 8.1, h: 0.85, fontFace: 'Georgia', fontSize: 34, bold: true, color: theme.ink, margin: 0 });
    slide.addText('Detaylı Finansal Durum, Risk ve Büyüme Sunumu', { x: 0.92, y: 2.55, w: 7.3, h: 0.35, fontFace: 'Aptos', fontSize: 15, color: theme.muted });
    slide.addText(`Dönem: ${config.donem}  |  Oluşturma: ${new Date().toLocaleDateString('tr-TR')}`, { x: 0.92, y: 3.0, w: 6, h: 0.25, fontFace: 'Aptos', fontSize: 9, color: 'CBD5E1' });
    addMetric(slide, theme, 0.92, 4.15, 2.55, 'Gelir', money(DATA.financials.revenue), 'Yıllık run-rate güçlü', theme.good);
    addMetric(slide, theme, 3.75, 4.15, 2.55, 'Net kâr marjı', pct(margin * 100), 'Operasyonel kaldıraç pozitif', theme.accent);
    addMetric(slide, theme, 6.58, 4.15, 2.55, 'Nakit', money(DATA.financials.cash), 'Likidite tamponu yüksek', theme.accent2);
    addMetric(slide, theme, 9.41, 4.15, 2.55, 'Borç/Varlık', pct(debtRatio * 100), 'Kontrollü kaldıraç', theme.warn);
    addFooter(slide, theme, 'Gizli ve özeldir | Yönetim kurulu / banka ön görüşme paketi');
  }

  addSection(pptx.addSlide(), theme, 'Hikaye üç eksende çok güçlü.', 'Kârlılık, nakit üretimi ve risk kontrolü aynı anda okunuyor.');

  if (selected.mali) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'YONETICI OZETI', 'Kârlılık artarken bilanço riski yönetilebilir seviyede kalıyor.', '03');
    addMetric(slide, theme, 0.65, 1.55, 2.8, 'Toplam gelir', money(DATA.financials.revenue), '+%17 yıllık büyüme varsayımı', theme.good);
    addMetric(slide, theme, 3.72, 1.55, 2.8, 'Net kâr', money(DATA.financials.profit), `${pct(margin * 100)} marj`, theme.accent);
    addMetric(slide, theme, 6.79, 1.55, 2.8, 'Özkaynak', money(DATA.financials.equity), 'Sermaye tabanı sağlam', theme.accent2);
    addMetric(slide, theme, 9.86, 1.55, 2.8, 'Kredi boşluğu', money(totalCreditLimit - totalCreditUsed), 'Büyüme için esneklik', theme.warn);
    addInsightBox(slide, theme, 0.72, 3.15, 3.8, 1.45, 'Ana mesaj', 'Firma yalnızca büyümüyor; büyümeyi nakit üretimiyle finanse edebilecek bir forma yaklaşıyor.', theme.good);
    addInsightBox(slide, theme, 4.82, 3.15, 3.8, 1.45, 'Risk okuması', 'Borç/varlık oranı makul; asıl izlenmesi gereken alan 90+ gün alacak kovası.', theme.warn);
    addInsightBox(slide, theme, 8.92, 3.15, 3.8, 1.45, 'Karar önerisi', 'Kredi limitinin tamamı kullanılmadan önce tahsilat disiplini ve proje kârlılığı izlenmeli.', theme.accent);
    slide.addChart(pptx.ChartType.doughnut, [
      { name: 'Bilanço', labels: ['Borç', 'Özkaynak'], values: [DATA.financials.debt, DATA.financials.equity] },
    ], {
      x: 1.0, y: 4.95, w: 2.3, h: 1.65,
      chartColors: [theme.bad, theme.good],
      showLegend: false,
      showPercent: true,
      dataLabelColor: theme.ink,
      dataLabelFontSize: 8,
    } as any);
    slide.addText('Bilanço kompozisyonu', { x: 3.25, y: 5.15, w: 2.2, h: 0.2, fontSize: 8.5, color: theme.muted, fontFace: 'Aptos' });
    slide.addText('Özkaynak ağırlıklı yapı, yatırım ve kredi görüşmelerinde güven çıpası üretiyor.', { x: 3.25, y: 5.45, w: 4.4, h: 0.55, fontSize: 11, color: theme.ink, fontFace: 'Aptos', bold: true });
    addFooter(slide, theme);
  }

  if (selected.mali) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'KARLILIK MOTORU', 'Gelir ölçeklenirken gider artışı kontrollü kaldı.', '04');
    slide.addChart(pptx.ChartType.bar, [
      { name: 'Gelir', labels: DATA.quarters.map((q) => q.label), values: DATA.quarters.map((q) => q.revenue) },
      { name: 'Gider', labels: DATA.quarters.map((q) => q.label), values: DATA.quarters.map((q) => q.expense) },
      { name: 'Net Kar', labels: DATA.quarters.map((q) => q.label), values: DATA.quarters.map((q) => q.profit) },
    ], {
      x: 0.75, y: 1.55, w: 7.25, h: 4.15,
      showLegend: true,
      legendPos: 'b',
      legendColor: theme.muted,
      chartColors: [theme.accent, theme.bad, theme.good],
      catAxisLabelColor: theme.muted,
      valAxisLabelColor: theme.muted,
      valGridLine: { color: '334155', transparency: 35 },
      showValue: false,
    } as any);
    addInsightBox(slide, theme, 8.45, 1.58, 3.95, 1.2, 'Yorum', 'Q4 kâr katkısı yılın en güçlü seviyesi. Bu, fiyatlama gücü ve operasyonel kaldıraç etkisini gösteriyor.', theme.good);
    addInsightBox(slide, theme, 8.45, 3.05, 3.95, 1.2, 'İzlenecek metrik', 'Brüt marj ve proje teslim zamanları birlikte takip edilmeli; gecikme kârlılık etkisini hızlı büyütür.', theme.warn);
    addInsightBox(slide, theme, 8.45, 4.52, 3.95, 1.2, 'Aksiyon', 'Yüksek marjlı hizmet paketleri önceliklendirilmeli; düşük katkılı işlerde fiyat revizyonu önerilir.', theme.accent);
    addFooter(slide, theme);
  }

  if (selected.nakit) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'NAKIT AKISI', 'Nakit girişi yıl boyunca çıkıştan daha hızlı ölçekleniyor.', '05');
    slide.addChart(pptx.ChartType.line, [
      { name: 'Giriş', labels: DATA.cashFlow.map((m) => m.month), values: DATA.cashFlow.map((m) => m.in) },
      { name: 'Çıkış', labels: DATA.cashFlow.map((m) => m.month), values: DATA.cashFlow.map((m) => m.out) },
      { name: 'Net', labels: DATA.cashFlow.map((m) => m.month), values: DATA.cashFlow.map((m) => m.in - m.out) },
    ], {
      x: 0.7, y: 1.45, w: 8.05, h: 4.45,
      showLegend: true,
      legendPos: 'b',
      legendColor: theme.muted,
      chartColors: [theme.good, theme.bad, theme.accent],
      catAxisLabelColor: theme.muted,
      valAxisLabelColor: theme.muted,
      valGridLine: { color: '334155', transparency: 35 },
      lineSize: 2.25,
      showValue: false,
    } as any);
    const netYear = sum(DATA.cashFlow, (m) => m.in - m.out);
    addMetric(slide, theme, 9.15, 1.55, 2.85, 'Yıllık net nakit', money(netYear), 'Pozitif nakit üretimi', theme.good);
    addMetric(slide, theme, 9.15, 2.95, 2.85, 'En güçlü ay', 'Ara', money(625_000), theme.accent);
    addMetric(slide, theme, 9.15, 4.35, 2.85, 'Giriş / çıkış', '1.41x', 'Nakit dönüşümü rahat', theme.accent2);
    addFooter(slide, theme);
  }

  if (selected.banka) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'LIKIDITE', 'Bankalar likiditeyi destekliyor; kredi kullanımında hâlâ alan var.', '06');
    addMetric(slide, theme, 0.7, 1.35, 2.8, 'Banka bakiyesi', money(totalBankBalance), '3 aktif hesap', theme.good);
    addMetric(slide, theme, 3.85, 1.35, 2.8, 'Kredi limiti', money(totalCreditLimit), 'Toplam limit', theme.accent);
    addMetric(slide, theme, 7.0, 1.35, 2.8, 'Kredi kullanımı', money(totalCreditUsed), `${pct((totalCreditUsed / totalCreditLimit) * 100)} kullanım`, theme.warn);
    addMetric(slide, theme, 10.15, 1.35, 2.45, 'Boş limit', money(totalCreditLimit - totalCreditUsed), 'Opsiyon değeri', theme.accent2);
    const maxBank = Math.max(...DATA.banks.map((b) => b.balance));
    DATA.banks.forEach((b, i) => {
      addBar(slide, theme, 1.0, 3.25 + i * 0.82, 6.2, 0.23, b.balance, maxBank, theme.good, b.name, money(b.balance));
      addBar(slide, theme, 8.0, 3.25 + i * 0.82, 2.7, 0.23, b.used, b.limit, theme.warn, `${b.name} kredi`, pct((b.used / b.limit) * 100));
    });
    addInsightBox(slide, theme, 0.9, 5.95, 11.3, 0.65, 'Yorum', 'Kredi limitinin tamamı kullanılmadığı için büyüme veya geçici işletme sermayesi ihtiyacında manevra alanı korunuyor.', theme.accent);
    addFooter(slide, theme);
  }

  if (selected.borc) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'BORC / ALACAK', 'Alacak tarafı borç yükünü karşılıyor; 90+ gün kovası özel takip istiyor.', '07');
    slide.addChart(pptx.ChartType.bar, [
      { name: 'Alacak', labels: DATA.receivables.map((r) => r.bucket), values: DATA.receivables.map((r) => r.receivable) },
      { name: 'Borç', labels: DATA.receivables.map((r) => r.bucket), values: DATA.receivables.map((r) => r.payable) },
    ], {
      x: 0.75, y: 1.45, w: 7.0, h: 4.25,
      chartColors: [theme.good, theme.bad],
      showLegend: true,
      legendPos: 'b',
      legendColor: theme.muted,
      catAxisLabelColor: theme.muted,
      valAxisLabelColor: theme.muted,
      valGridLine: { color: '334155', transparency: 35 },
    } as any);
    addMetric(slide, theme, 8.35, 1.65, 3.1, 'Toplam alacak', money(totalReceivable), 'Tahsilat potansiyeli', theme.good);
    addMetric(slide, theme, 8.35, 3.05, 3.1, 'Toplam borç', money(totalPayable), 'Kontrollü yük', theme.bad);
    addMetric(slide, theme, 8.35, 4.45, 3.1, 'Net pozisyon', money(totalReceivable - totalPayable), 'Pozitif cari denge', theme.accent);
    addFooter(slide, theme);
  }

  if (selected.projeler) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'PROJE PORTFOYU', 'Devam eden işler ciro görünürlüğü ve nakit akışı için ana kaldıraç.', '08');
    const rows = [
      [
        { text: 'Proje', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } },
        { text: 'Durum', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } },
        { text: 'Bütçe', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } },
        { text: 'İlerleme', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } },
      ],
      ...DATA.projects.map((p) => [
        { text: p.name, options: { color: 'E2E8F0' } },
        { text: p.status, options: { color: p.status === 'Bitti' ? theme.good : theme.warn } },
        { text: money(p.budget), options: { color: 'E2E8F0', bold: true } },
        { text: `${p.completion}%`, options: { color: theme.accent, bold: true } },
      ]),
    ];
    slide.addTable(rows as any, {
      x: 0.72, y: 1.45, w: 7.7,
      colW: [3.0, 1.4, 1.6, 1.4],
      rowH: [0.48, 0.5, 0.5, 0.5],
      border: { type: 'solid', color: '334155', pt: 0.5 },
      fontFace: 'Aptos',
      fontSize: 9.2,
      margin: 0.08,
    });
    DATA.projects.forEach((p, i) => {
      addBar(slide, theme, 8.9, 1.75 + i * 0.78, 2.4, 0.18, p.completion, 100, p.completion === 100 ? theme.good : theme.accent, p.name, `${p.completion}%`);
    });
    addInsightBox(slide, theme, 0.78, 4.95, 11.25, 0.8, 'Yorum', 'Proje portföyü gelir sürekliliği sağlıyor; kritik karar, devam eden iki işte tahsilat planı ile teslim planını aynı ritimde tutmak.', theme.good);
    addFooter(slide, theme);
  }

  if (selected.yatirim) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'YATIRIM PORTFOYU', 'Portföy getirisi güçlü; tek negatif pozisyon kontrollü risk olarak ayrışıyor.', '09');
    slide.addChart(pptx.ChartType.doughnut, [
      { name: 'Portföy', labels: DATA.investments.map((i) => i.name), values: DATA.investments.map((i) => i.value) },
    ], {
      x: 0.7, y: 1.45, w: 4.9, h: 4.25,
      chartColors: [theme.accent, theme.good, theme.accent2, theme.bad, theme.warn],
      showLegend: true,
      legendPos: 'b',
      legendColor: theme.muted,
      showPercent: true,
      dataLabelColor: theme.ink,
      dataLabelFontSize: 8,
    } as any);
    addMetric(slide, theme, 6.2, 1.55, 2.55, 'Portföy değeri', money(investmentValue), '5 araç', theme.accent);
    addMetric(slide, theme, 9.05, 1.55, 2.55, 'Ağırlıklı getiri', '+17.4%', 'Pozitif alfa', theme.good);
    DATA.investments.slice(0, 4).forEach((i, idx) => {
      const color = i.returnPct >= 0 ? theme.good : theme.bad;
      slide.addText(i.name, { x: 6.25, y: 3.15 + idx * 0.55, w: 3.0, h: 0.2, fontSize: 8.2, color: theme.muted, fontFace: 'Aptos' });
      slide.addText(pct(i.returnPct), { x: 9.5, y: 3.15 + idx * 0.55, w: 0.9, h: 0.2, fontSize: 9.2, color, bold: true, fontFace: 'Aptos', align: 'right' });
      slide.addText(i.risk, { x: 10.7, y: 3.15 + idx * 0.55, w: 0.75, h: 0.2, fontSize: 8, color: theme.ink, fontFace: 'Aptos' });
    });
    addInsightBox(slide, theme, 6.15, 5.55, 5.65, 0.75, 'Yorum', 'Gayrimenkul ve hisse sepeti getiriyi taşıyor; girişim pozisyonu portföy riskine sınırlı ama görünür negatif katkı yapıyor.', theme.warn);
    addFooter(slide, theme);
  }

  if (selected.ai) {
    const slide = pptx.addSlide();
    addHeader(slide, theme, 'AI YORUM', 'Finansal tablo güçlü; karar kalitesi için takip disiplini gerekli.', '10');
    addInsightBox(slide, theme, 0.75, 1.45, 3.75, 1.35, 'Güçlü yön', 'Kâr marjı ve nakit dönüşümü aynı anda pozitif. Firma, borç kullanmadan da büyüme ivmesini sürdürebilecek görüntü veriyor.', theme.good);
    addInsightBox(slide, theme, 4.8, 1.45, 3.75, 1.35, 'Zayıf sinyal', '90+ gün alacak kovası küçük ama risk yoğunluğu yüksek. Erken uyarı olarak ayrı raporlanmalı.', theme.warn);
    addInsightBox(slide, theme, 8.85, 1.45, 3.75, 1.35, 'Fırsat', 'Boş kredi limiti ve güçlü banka bakiyesi, seçici yatırım veya işletme sermayesi atağı için alan yaratıyor.', theme.accent);
    slide.addText('AI aksiyon puanlaması', { x: 0.82, y: 3.35, w: 3, h: 0.25, fontFace: 'Georgia', fontSize: 17, bold: true, color: theme.ink });
    [
      ['Tahsilat disiplini', 82, theme.good],
      ['Kredi kullanım alanı', 71, theme.accent],
      ['Proje teslim riski', 58, theme.warn],
      ['Yatırım volatilitesi', 46, theme.bad],
    ].forEach(([label, value, color], idx) => {
      addBar(slide, theme, 0.9, 4.05 + idx * 0.52, 8.0, 0.16, value as number, 100, color as string, label as string, `${value}/100`);
    });
    addInsightBox(slide, theme, 9.55, 3.55, 2.65, 1.75, 'Öneri', 'Bir sonraki toplantıda kredi limiti değil, tahsilat döngüsü ve proje bazlı kârlılık dashboard’u karar konusu yapılmalı.', theme.accent2);
    addFooter(slide, theme);
  }

  const slide = pptx.addSlide();
  addHeader(slide, theme, 'AKSIYON PLANI', 'Önümüzdeki 90 gün için net karar takvimi.', '11');
  const actions = [
    ['0-30 gün', '90+ gün alacaklar için tahsilat protokolü', theme.bad],
    ['31-60 gün', 'Devam eden projelerde hakediş / teslim senkronu', theme.warn],
    ['61-90 gün', 'Boş kredi limitinin yatırım senaryolarına etkisi', theme.accent],
    ['Sürekli', 'Aylık finansal kapanış ve AI yorum üretimi', theme.good],
  ];
  actions.forEach(([period, action, color], idx) => {
    const y = 1.55 + idx * 1.05;
    slide.addShape('ellipse', { x: 0.95, y, w: 0.38, h: 0.38, fill: { color: color as string }, line: { color: color as string } });
    slide.addShape('line', { x: 1.14, y: y + 0.42, w: 0, h: 0.58, line: { color: '334155', width: 1 } });
    slide.addText(period as string, { x: 1.58, y: y - 0.02, w: 1.2, h: 0.22, fontSize: 9, bold: true, color: color as string, fontFace: 'Aptos' });
    slide.addText(action as string, { x: 2.75, y: y - 0.05, w: 7.4, h: 0.32, fontSize: 14, bold: true, color: theme.ink, fontFace: 'Aptos' });
    slide.addText('Sahip: Finans + Operasyon | Kanıt: aylık veri paketi ve yönetim notu', { x: 2.75, y: y + 0.35, w: 7.4, h: 0.22, fontSize: 8, color: theme.muted, fontFace: 'Aptos' });
  });
  addInsightBox(slide, theme, 9.95, 2.2, 2.55, 2.1, 'Beklenen etki', 'Daha hızlı tahsilat, daha öngörülebilir nakit akışı ve kredi görüşmelerinde daha güçlü veri anlatısı.', theme.good);
  addFooter(slide, theme);

  const appendix = pptx.addSlide();
  addHeader(appendix, theme, 'APPENDIX', 'Detay veriler ve varsayımlar.', '12');
  const appendixRows = [
    [{ text: 'Metrik', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } }, { text: 'Değer', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } }, { text: 'Yorum', options: { bold: true, color: theme.ink, fill: { color: theme.surface } } }],
    [{ text: 'Cari nakit', options: { color: 'E2E8F0' } }, { text: money(DATA.financials.cash), options: { color: theme.good, bold: true } }, { text: 'Kısa vadeli tampon güçlü', options: { color: theme.muted } }],
    [{ text: 'Borç / varlık', options: { color: 'E2E8F0' } }, { text: pct(debtRatio * 100), options: { color: theme.warn, bold: true } }, { text: 'Kontrollü kaldıraç', options: { color: theme.muted } }],
    [{ text: 'Net cari pozisyon', options: { color: 'E2E8F0' } }, { text: money(totalReceivable - totalPayable), options: { color: theme.accent, bold: true } }, { text: 'Alacaklar borçları aşıyor', options: { color: theme.muted } }],
    [{ text: 'Yatırım portföyü', options: { color: 'E2E8F0' } }, { text: money(investmentValue), options: { color: theme.accent2, bold: true } }, { text: 'Çeşitli risk yapısı', options: { color: theme.muted } }],
  ];
  appendix.addTable(appendixRows as any, {
    x: 0.8, y: 1.55, w: 11.2,
    colW: [2.7, 2.1, 6.4],
    rowH: [0.45, 0.45, 0.45, 0.45, 0.45],
    border: { type: 'solid', color: '334155', pt: 0.5 },
    fontFace: 'Aptos',
    fontSize: 9,
    margin: 0.08,
  });
  appendix.addText('Not: Bu sunum hackathon/demo ortamındaki firma verileri ve sahte finansal veri setiyle otomatik üretilmiştir. Gerçek backend bağlandığında aynı tasarım veri katmanı üzerinden beslenecek şekilde genişletilebilir.', {
    x: 0.85, y: 4.7, w: 10.6, h: 0.65,
    fontFace: 'Aptos', fontSize: 9, color: theme.muted,
  });
  addFooter(appendix, theme);

  const end = pptx.addSlide();
  end.background = { color: theme.primary };
  end.addShape('rect', { x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: { color: theme.primary }, line: { color: theme.primary } });
  end.addShape('arc', { x: 8.5, y: 0.1, w: 4.8, h: 4.8, line: { color: theme.accent, transparency: 55, width: 2 } });
  end.addText('Karar için hazır.', { x: 0.95, y: 2.3, w: 7.4, h: 0.75, fontFace: 'Georgia', fontSize: 34, bold: true, color: theme.ink });
  end.addText(`${config.firmaAdi} | ${config.donem}`, { x: 1.0, y: 3.25, w: 5.4, h: 0.3, fontFace: 'Aptos', fontSize: 13, color: theme.muted });
  end.addText('Pro Sicht AI Platform', { x: 1.0, y: 5.9, w: 4.5, h: 0.25, fontFace: 'Aptos', fontSize: 10, bold: true, color: theme.accent });

  const fileName = `${config.firmaAdi.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_') || 'firma'}_detayli_finansal_sunum.pptx`;
  await pptx.writeFile({ fileName });
}
