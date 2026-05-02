import { z } from 'zod';

z.setErrorMap((issue) => {
  if (issue.code === 'too_small') {
    if ('minimum' in issue && issue.minimum === 1) return { message: 'Bu alan zorunludur' };
    if ('minimum' in issue) return { message: `En az ${issue.minimum} karakter giriniz` };
  }
  if (issue.code === 'invalid_type') return { message: 'Gecersiz deger' };
  return { message: issue.message || 'Gecersiz deger' };
});

export const firmaSchema = z.object({
  unvan: z.string().min(2, 'Firma unvani en az 2 karakter olmalidir'),
  vergi_no: z.string().regex(/^\d{10}$/, '10 haneli vergi numarasi giriniz'),
  ticaret_sicil: z.string().optional(),
  kurulus_tarihi: z.string().optional(),
  faaliyet_alani: z.string().optional(),
  yetkili_kisi: z.string().min(2, 'Yetkili kisi adi zorunludur'),
  telefon: z.string().regex(/^(\+90|0)?[0-9]{10}$/, 'Gecerli telefon numarasi giriniz').optional().or(z.literal('')),
  adres: z.string().optional(),
  yillik_ciro: z.number().positive('Pozitif bir deger giriniz').optional(),
  sozlesme_turu: z.enum(['rapor', 'analiz', 'sistem', 'diger']).optional(),
  sozlesme_baslangic: z.string().optional(),
  sozlesme_bitis: z.string().optional(),
  sozlesme_bedeli: z.number().positive().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Gecerli bir email adresi giriniz'),
  password: z.string().min(6, 'En az 6 karakter giriniz'),
});

export const registerSchema = z.object({
  ad_soyad: z.string().min(2, 'Ad soyad en az 2 karakter olmalidir'),
  email: z.string().email('Gecerli bir email adresi giriniz'),
  password: z.string().min(8, 'Sifre en az 8 karakter olmalidir'),
  password_confirm: z.string(),
}).refine(d => d.password === d.password_confirm, {
  message: 'Sifreler eslesmiyor',
  path: ['password_confirm'],
});

export const finansalRaporSchema = z.object({
  donem: z.string().min(1, 'Donem seciniz'),
  toplam_gelir: z.number().min(0, 'Negatif deger girilemez'),
  toplam_gider: z.number().min(0, 'Negatif deger girilemez'),
  toplam_varlik: z.number().min(0, 'Negatif deger girilemez'),
  toplam_borc: z.number().min(0, 'Negatif deger girilemez'),
  nakit_ve_benzeri: z.number().min(0, 'Negatif deger girilemez'),
  alis_satis_kosullari: z.string().optional(),
});
