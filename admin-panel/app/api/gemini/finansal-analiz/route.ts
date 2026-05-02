import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

function buildPrompt(finansalVeriler: unknown) {
  return [
    'Pro Sicht finans platformu icin Turkce, profesyonel ve uygulanabilir bir finansal analiz raporu yaz.',
    'Verilen firma finansal verilerini kullan. Uydurma veri ekleme.',
    'Raporu su basliklarla ver: Genel Ozet, Karlilik, Likidite ve Banka Durumu, Borc/Alacak Riski, Proje ve Nakit Akisi, Aksiyon Onerileri.',
    'Her baslik altinda net, kullaniciya okunabilir maddeler yaz. Gerekiyorsa rakamlari TL formatinda yorumla.',
    'Cikti sadece rapor metni olsun; JSON, markdown kod blogu veya teknik aciklama ekleme.',
    '',
    'Finansal veriler:',
    JSON.stringify(finansalVeriler, null, 2),
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

  const body = await request.json();
  const finansalVeriler = body?.finansalVeriler;

  if (!finansalVeriler || typeof finansalVeriler !== 'object') {
    return NextResponse.json({ message: 'Finansal veri bulunamadi.' }, { status: 400 });
  }

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.25,
        },
        contents: [
          {
            parts: [{ text: buildPrompt(finansalVeriler) }],
          },
        ],
      }),
    }
  );

  const geminiPayload = await geminiResponse.json();

  if (!geminiResponse.ok) {
    return NextResponse.json(
      { message: geminiPayload?.error?.message || 'Gemini finansal analiz basarisiz oldu.' },
      { status: geminiResponse.status }
    );
  }

  const analiz = geminiPayload?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!analiz) {
    return NextResponse.json({ message: 'Gemini bos analiz yaniti dondu.' }, { status: 502 });
  }

  return NextResponse.json({ data: { analiz } });
}
