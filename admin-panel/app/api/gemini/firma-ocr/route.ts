import { NextRequest, NextResponse } from 'next/server';
import type { OcrSonucu } from '@/types';

export const runtime = 'nodejs';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20';
const MAX_INLINE_FILE_SIZE = 15 * 1024 * 1024;

const EMPTY_RESULT: OcrSonucu = {
  unvan: '',
  vergi_no: '',
  ticaret_sicil: '',
  kurulus_tarihi: '',
  faaliyet_alani: '',
  yetkili_kisi: '',
  telefon: '',
  adres: '',
  finansal_rapor: {
    donem: '',
    toplam_gelir: 0,
    toplam_gider: 0,
    net_kar: 0,
    toplam_varlik: 0,
    toplam_borc: 0,
    ozkaynak: 0,
    nakit_ve_benzeri: 0,
    bankalar: [],
    bekleyen_tahsilatlar: [],
    yapilan_tahsilatlar: [],
    projeler: [],
    donemsel_karsilastirma: [],
  },
};

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDate(value: unknown): string {
  const text = normalizeText(value);
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const trMatch = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!trMatch) return text;

  const [, day, month, year] = trMatch;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeTaxNo(value: unknown): string {
  const digits = normalizeText(value).replace(/\D/g, '');
  return digits.length === 10 ? digits : '';
}

function normalizePhone(value: unknown): string {
  return normalizeText(value).replace(/[^\d+]/g, '');
}

function normalizeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeArray<T>(value: unknown, mapper: (item: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => (item && typeof item === 'object' ? mapper(item as Record<string, unknown>) : null))
    .filter((item): item is T => Boolean(item));
}

function extractJson(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] ?? text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Gemini yaniti JSON formatinda degil.');
  }

  return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
}

function sanitizeOcrResult(input: Record<string, unknown>): OcrSonucu {
  const finansalInput = input.finansal_rapor && typeof input.finansal_rapor === 'object'
    ? input.finansal_rapor as Record<string, unknown>
    : {};

  return {
    unvan: normalizeText(input.unvan),
    vergi_no: normalizeTaxNo(input.vergi_no),
    ticaret_sicil: normalizeText(input.ticaret_sicil),
    kurulus_tarihi: normalizeDate(input.kurulus_tarihi),
    faaliyet_alani: normalizeText(input.faaliyet_alani),
    yetkili_kisi: normalizeText(input.yetkili_kisi),
    telefon: normalizePhone(input.telefon),
    adres: normalizeText(input.adres),
    yillik_ciro: normalizeNumber(input.yillik_ciro) || undefined,
    finansal_rapor: {
      donem: normalizeText(finansalInput.donem),
      toplam_gelir: normalizeNumber(finansalInput.toplam_gelir),
      toplam_gider: normalizeNumber(finansalInput.toplam_gider),
      net_kar: normalizeNumber(finansalInput.net_kar),
      toplam_varlik: normalizeNumber(finansalInput.toplam_varlik),
      toplam_borc: normalizeNumber(finansalInput.toplam_borc),
      ozkaynak: normalizeNumber(finansalInput.ozkaynak),
      nakit_ve_benzeri: normalizeNumber(finansalInput.nakit_ve_benzeri),
      bankalar: normalizeArray(finansalInput.bankalar, item => ({
        ad: normalizeText(item.ad || item.banka_adi || item.banka || item.name),
        bakiye: normalizeNumber(item.bakiye || item.balance || item.tutar),
        limit: normalizeNumber(item.limit || item.kredi_limiti),
        kullanim: normalizeNumber(item.kullanim || item.kredi_kullanim || item.used),
        hesap: normalizeText(item.hesap || item.hesap_no || item.iban || item.account),
      })).filter(item => item.ad || item.bakiye > 0),
      bekleyen_tahsilatlar: normalizeArray(finansalInput.bekleyen_tahsilatlar, item => ({
        aciklama: normalizeText(item.aciklama || item.description || item.musteri || item.fatura),
        vade: normalizeText(item.vade || item.vade_tarihi || item.due_date),
        tutar: normalizeNumber(item.tutar || item.amount),
        gecikme: normalizeNumber(item.gecikme || item.gecikme_gun || item.delay),
      })).filter(item => item.aciklama || item.tutar > 0),
      yapilan_tahsilatlar: normalizeArray(finansalInput.yapilan_tahsilatlar, item => ({
        aciklama: normalizeText(item.aciklama || item.description || item.musteri),
        tarih: normalizeText(item.tarih || item.odeme_tarihi || item.date),
        tutar: normalizeNumber(item.tutar || item.amount),
      })).filter(item => item.aciklama || item.tutar > 0),
      projeler: normalizeArray(finansalInput.projeler, item => ({
        ad: normalizeText(item.ad || item.proje_adi || item.name),
        baslangic: normalizeText(item.baslangic || item.start),
        bitis: normalizeText(item.bitis || item.end) || null,
        tutar: normalizeNumber(item.tutar || item.amount || item.budget),
        durum: normalizeText(item.durum || item.status) || 'devam',
      })).filter(item => item.ad || item.tutar > 0),
      donemsel_karsilastirma: normalizeArray(finansalInput.donemsel_karsilastirma, item => ({
        d: normalizeText(item.d || item.donem || item.ay || item.period),
        gelir: normalizeNumber(item.gelir || item.income),
        gider: normalizeNumber(item.gider || item.expense),
      })).filter(item => item.d || item.gelir > 0 || item.gider > 0),
    },
  };
}

function buildPrompt() {
  return [
    'Sen bir Türk finans platformu için belge analiz asistanısın.',
    'Bu belge bir şirketin finansal dokümanıdır. PDF, mizan, bilanço, gelir tablosu, vergi levhası, ticaret sicil gazetesi, banka ekstresi, tahsilat raporu veya fatura olabilir.',
    '',
    'GÖREV: Belgeden aşağıdaki tüm bilgileri çıkar. Her kategoriyi dikkatlice tara.',
    '',
    '1. ŞİRKET BİLGİLERİ: unvan, vergi_no (10 hane), ticaret_sicil, kurulus_tarihi (YYYY-MM-DD), faaliyet_alani, yetkili_kisi, telefon (+90 formatlı), adres, yillik_ciro',
    '',
    '2. FİNANSAL RAPOR (finansal_rapor objesi):',
    '   - donem: Belgedeki dönem bilgisi (örn: "2024 Yıllık", "2024 Q3", "Ocak-Aralık 2024")',
    '   - toplam_gelir: Satış gelirleri / ciro / hasılat toplamı',
    '   - toplam_gider: İşletme giderleri / maliyet toplamı',  
    '   - net_kar: Dönem net karı veya zararı (negatif olabilir)',
    '   - toplam_varlik: Aktif toplamı / varlık toplamı',
    '   - toplam_borc: Kısa + uzun vadeli yabancı kaynaklar toplamı',
    '   - ozkaynak: Özkaynak toplamı',
    '   - nakit_ve_benzeri: Kasa + banka hesapları nakit toplamı',
    '',
    '3. BANKALAR (finansal_rapor.bankalar dizisi):',
    '   Belgede banka adı, hesap numarası/IBAN, bakiye, kredi limiti veya kredi kullanımı bilgisi varsa her birini ayrı obje olarak ekle:',
    '   { "ad": "Banka Adı", "bakiye": 123456, "limit": 500000, "kullanim": 200000, "hesap": "TR..." }',
    '   Mizan/bilançoda 102-Bankalar hesabı altında banka isimleri varsa bunları da bankalar listesine ekle.',
    '',
    '4. BEKLEYEN TAHSİLATLAR (finansal_rapor.bekleyen_tahsilatlar dizisi):',
    '   Vadesi gelmemiş veya gecikmiş alacaklar, faturalar, çekler, senetler:',
    '   { "aciklama": "Fatura/Müşteri", "vade": "2024-06-15", "tutar": 50000, "gecikme": 0 }',
    '   120-Alıcılar, 121-Alacak Senetleri hesaplarındaki detayları da buraya ekle.',
    '',
    '5. YAPILAN TAHSİLATLAR (finansal_rapor.yapilan_tahsilatlar dizisi):',
    '   Ödenmiş/tahsil edilmiş alacaklar:',
    '   { "aciklama": "Fatura/Müşteri", "tarih": "2024-05-01", "tutar": 30000 }',
    '',
    '6. PROJELER (finansal_rapor.projeler dizisi):',
    '   Belgede proje, sözleşme veya iş kalemi bilgisi varsa:',
    '   { "ad": "Proje Adı", "baslangic": "2024-01-01", "bitis": null, "tutar": 100000, "durum": "devam" }',
    '',
    '7. DÖNEMSEL KARŞILAŞTIRMA (finansal_rapor.donemsel_karsilastirma dizisi):',
    '   Belgede aylık/çeyreklik gelir-gider dağılımı varsa:',
    '   { "d": "Ocak", "gelir": 500000, "gider": 350000 }',
    '   Mizan hesaplarından 600-Gelirler ve 700-Giderler alt hesaplarını aylık olarak gruplayabilirsen yap.',
    '',
    'ÖNEMLİ KURALLAR:',
    '- Tüm tutarları sadece number olarak dön (TL işareti, nokta ayracı veya metin ekleme)',
    '- Tarihleri YYYY-MM-DD formatında dön',
    '- Emin olmadığın alanları boş string veya 0 olarak bırak',
    '- Belgede açıkça olmayan veriyi UYDURMA, sadece belgeden okuduklarını yaz',
    '- Bir mizan belgesinde hesap kodları (100-Kasa, 102-Bankalar, 120-Alıcılar, 320-Borçlar vb.) varsa bunları ilgili finansal alanlara yerleştir',
    '- Belgede tablo formatında satırlar varsa (banka listesi, alacak listesi vb.) her satırı ayrı obje olarak diziye ekle',
    '',
    'Yanıta açıklama ekleme. Sadece aşağıdaki JSON objesini dön:',
    JSON.stringify(EMPTY_RESULT),
  ].join('\n');
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: 'GEMINI_API_KEY tanimli degil. .env.local dosyasina Gemini API anahtarini ekleyin.' },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Belge dosyasi bulunamadi.' }, { status: 400 });
  }

  if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json(
      { message: 'PDF, JPG, PNG veya WEBP formatinda belge yukleyin.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_INLINE_FILE_SIZE) {
    return NextResponse.json(
      { message: 'Belge inline Gemini islemi icin cok buyuk. 15MB altinda bir dosya yukleyin.' },
      { status: 413 }
    );
  }

  const base64File = Buffer.from(await file.arrayBuffer()).toString('base64');
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
        contents: [
          {
            parts: [
              { inline_data: { mime_type: file.type, data: base64File } },
              { text: buildPrompt() },
            ],
          },
        ],
      }),
    }
  );

  const geminiPayload = await geminiResponse.json();

  if (!geminiResponse.ok) {
    return NextResponse.json(
      { message: geminiPayload?.error?.message || 'Gemini belge analizi basarisiz oldu.' },
      { status: geminiResponse.status }
    );
  }

  const text = geminiPayload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text)
    .filter(Boolean)
    .join('\n');

  if (!text) {
    return NextResponse.json({ message: 'Gemini belge icin bos yanit dondu.' }, { status: 502 });
  }

  try {
    return NextResponse.json({ data: sanitizeOcrResult(extractJson(text)) });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Gemini yaniti islenemedi.' },
      { status: 502 }
    );
  }
}
