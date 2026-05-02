import { z } from 'zod';

// Türkçe hata mesajları
z.setErrorMap((issue, ctx) => {
  if (issue.code === 'too_small') {
    if (issue.type === 'string') {
      if (issue.minimum === 1) return { message: 'Bu alan zorunludur' };
      return { message: `En az ${issue.minimum} karakter giriniz` };
    }
    return { message: `Minimum değer: ${issue.minimum}` };
  }
  if (issue.code === 'invalid_string') {
    if (issue.validation === 'email') return { message: 'Geçerli bir email girin' };
    return { message: 'Geçersiz format' };
  }
  if (issue.code === 'invalid_type') {
    if (issue.expected === 'number') return { message: 'Geçerli bir sayı girin' };
    return { message: 'Geçersiz değer' };
  }
  return { message: ctx.defaultError };
});

// Ortak şemalar
export const firmaSchema = z.object({
  unvan: z.string().min(2, 'Firma ünvanı en az 2 karakter olmalıdır'),
  vergi_no: z.string().regex(/^\d{10}$/, '10 haneli vergi numarası giriniz'),
  ticaret_sicil: z.string().optional(),
  kurulus_tarihi: z.string().optional(),
  faaliyet_alani: z.string().optional(),
  yetkili_kisi: z.string().min(2, 'Yetkili kişi adı zorunludur'),
  telefon: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Geçerli telefon numarası giriniz').optional().or(z.literal('')),
  adres: z.string().optional(),
  yillik_ciro: z.number().positive('Pozitif bir değer giriniz').optional(),
  sozlesme_turu: z.enum(['rapor', 'analiz', 'sistem', 'diger']).optional(),
  sozlesme_baslangic: z.string().optional(),
  sozlesme_bitis: z.string().optional(),
  sozlesme_bedeli: z.number().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'En az 6 karakter giriniz'),
});

export const registerSchema = z.object({
  ad_soyad: z.string().min(2, 'Ad soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  password_confirm: z.string(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Şifreler eşleşmiyor',
  path: ['password_confirm'],
});

export const finansalRaporSchema = z.object({
  donem: z.string().min(1, 'Dönem seçiniz'),
  toplam_gelir: z.number().min(0, 'Negatif değer girilemez'),
  toplam_gider: z.number().min(0, 'Negatif değer girilemez'),
  toplam_varlik: z.number().min(0, 'Negatif değer girilemez'),
  toplam_borc: z.number().min(0, 'Negatif değer girilemez'),
  nakit_ve_benzeri: z.number().min(0, 'Negatif değer girilemez'),
  alis_satis_kosullari: z.string().optional(),
});
