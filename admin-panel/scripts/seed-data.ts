/**
 * Pro Sicht Fintech Platform — Demo Veri Seed Script
 *
 * Bu script Supabase veritabanına demo verileri ekler.
 * Hackathon jürisi ve demo amacıyla kullanılır.
 *
 * Kullanım:
 *   npx ts-node scripts/seed-data.ts
 *
 * Gereksinimler:
 *   - .env.local dosyasında Supabase URL ve Service Role Key tanımlı olmalı
 *   - Veritabanı tabloları (migrations) önceden çalıştırılmış olmalı
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env dosyasında tanımlanmalı');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ──────────────────────────────────────────────
// DEMO VERİLERİ
// ──────────────────────────────────────────────

const USERS = [
  { email: 'admin@prosicht.com', password: 'Admin1234!', role: 'admin' },
  { email: 'tech@turkiyetech.com', password: 'User1234!', role: 'user' },
  { email: 'gida@anadolugida.com', password: 'User1234!', role: 'user' },
  { email: 'ins@istinsat.com', password: 'User1234!', role: 'user' },
];

const FIRMALAR = [
  {
    unvan: 'Türkiye Tech A.Ş.',
    vergi_no: '1234567890',
    ticaret_sicil: 'TSM-2019-45678',
    kurulus_tarihi: '2019-03-15',
    faaliyet_alani: 'Yazılım ve Bilişim',
    yetkili_kisi: 'Mehmet Yıldırım',
    telefon: '+905321234567',
    adres: 'Maslak, Sarıyer/İstanbul',
    yillik_ciro: 12500000,
    sozlesme_turu: 'analiz' as const,
    sozlesme_baslangic: '2024-01-01',
    sozlesme_bitis: '2025-01-01',
    sozlesme_bedeli: 60000,
    onaylandi: true,
  },
  {
    unvan: 'Anadolu Gıda Ltd. Şti.',
    vergi_no: '9876543210',
    ticaret_sicil: 'TSM-2015-12345',
    kurulus_tarihi: '2015-07-20',
    faaliyet_alani: 'Gıda Üretim ve Dağıtım',
    yetkili_kisi: 'Ayşe Kara',
    telefon: '+905559876543',
    adres: 'Organize Sanayi, Konya',
    yillik_ciro: 28000000,
    sozlesme_turu: 'rapor' as const,
    sozlesme_baslangic: '2024-03-01',
    sozlesme_bitis: '2025-03-01',
    sozlesme_bedeli: 45000,
    onaylandi: true,
  },
  {
    unvan: 'İstanbul İnşaat A.Ş.',
    vergi_no: '5678901234',
    ticaret_sicil: 'TSM-2010-99887',
    kurulus_tarihi: '2010-11-05',
    faaliyet_alani: 'İnşaat ve Taahhüt',
    yetkili_kisi: 'Hasan Demir',
    telefon: '+905445678901',
    adres: 'Ataşehir, Kadıköy/İstanbul',
    yillik_ciro: 85000000,
    sozlesme_turu: 'sistem' as const,
    sozlesme_baslangic: '2024-06-01',
    sozlesme_bitis: '2025-06-01',
    sozlesme_bedeli: 120000,
    onaylandi: false,
  },
];

const FINANSAL_RAPORLAR = [
  {
    firma_index: 0,
    donem: '2024-Yıllık',
    toplam_gelir: 3530000,
    toplam_gider: 2390000,
    net_kar: 1140000,
    toplam_varlik: 8450000,
    toplam_borc: 3200000,
    ozkaynak: 5250000,
    nakit_ve_benzeri: 2460000,
    ai_analiz: '## Güçlü Yönler\n- Yüksek kârlılık oranı (%32)\n- Sağlıklı özkaynak yapısı\n\n## Zayıf Yönler\n- Borç/özkaynak oranı sektör ortalamasının üstünde\n\n## Öneriler\n- Kısa vadeli borç yapılandırması önerilir',
    ai_analiz_tarihi: '2024-04-28T14:30:00Z',
  },
  {
    firma_index: 1,
    donem: '2024-Yıllık',
    toplam_gelir: 8200000,
    toplam_gider: 7100000,
    net_kar: 1100000,
    toplam_varlik: 15000000,
    toplam_borc: 6800000,
    ozkaynak: 8200000,
    nakit_ve_benzeri: 3100000,
    ai_analiz: null,
    ai_analiz_tarihi: null,
  },
];

const BANKALAR = [
  { firma_index: 0, banka_adi: 'Garanti BBVA', hesap_no: 'TR12 0006 2000 1234 0006 ****4521', bakiye: 1250000, kredi_limiti: 2000000, kredi_kullanim: 750000 },
  { firma_index: 0, banka_adi: 'İş Bankası', hesap_no: 'TR34 0006 4000 5678 0080 ****7890', bakiye: 870000, kredi_limiti: 1500000, kredi_kullanim: 1100000 },
  { firma_index: 0, banka_adi: 'Yapı Kredi', hesap_no: 'TR56 0006 7000 9012 0067 ****3456', bakiye: 340000, kredi_limiti: 800000, kredi_kullanim: 680000 },
  { firma_index: 1, banka_adi: 'Ziraat Bankası', hesap_no: 'TR78 0001 0000 3456 0010 ****6789', bakiye: 2100000, kredi_limiti: 5000000, kredi_kullanim: 2200000 },
  { firma_index: 1, banka_adi: 'Halkbank', hesap_no: 'TR90 0001 2000 7890 0012 ****0123', bakiye: 980000, kredi_limiti: 2000000, kredi_kullanim: 800000 },
];

const TAHSILATLAR = [
  { firma_index: 0, tutar: 45000, aciklama: 'Fatura #2024-045', vade_tarihi: '2024-04-15', odeme_tarihi: null, durum: 'gecikti' as const },
  { firma_index: 0, tutar: 65000, aciklama: 'Proje Alpha 3.taksit', vade_tarihi: '2024-05-10', odeme_tarihi: null, durum: 'bekliyor' as const },
  { firma_index: 0, tutar: 35000, aciklama: 'Fatura #2024-040', vade_tarihi: '2024-04-01', odeme_tarihi: '2024-04-28', durum: 'odendi' as const },
  { firma_index: 1, tutar: 120000, aciklama: 'Hammadde tedarik', vade_tarihi: '2024-05-20', odeme_tarihi: null, durum: 'bekliyor' as const },
  { firma_index: 1, tutar: 85000, aciklama: 'Ekipman kirası', vade_tarihi: '2024-04-10', odeme_tarihi: '2024-04-08', durum: 'odendi' as const },
];

const PROJELER = [
  { firma_index: 0, proje_adi: 'ERP Modül Geliştirme', durum: 'devam' as const, baslangic: '2024-01-15', bitis: null, tutar: 180000 },
  { firma_index: 0, proje_adi: 'Mobil Uygulama v2', durum: 'devam' as const, baslangic: '2024-03-01', bitis: null, tutar: 95000 },
  { firma_index: 0, proje_adi: 'Web Sitesi Yenileme', durum: 'bitti' as const, baslangic: '2023-10-01', bitis: '2024-02-15', tutar: 60000 },
  { firma_index: 1, proje_adi: 'Depo Otomasyon', durum: 'devam' as const, baslangic: '2024-02-01', bitis: null, tutar: 450000 },
  { firma_index: 1, proje_adi: 'E-Ticaret Entegrasyonu', durum: 'bitti' as const, baslangic: '2023-08-01', bitis: '2024-01-20', tutar: 120000 },
];

const PREMIUM_TALEPLER = [
  { firma_index: 0, paket_turu: 'premium_bundle' as const, durum: 'onaylandi' as const },
  { firma_index: 1, paket_turu: 'temel_analiz' as const, durum: 'bekliyor' as const },
  { firma_index: 2, paket_turu: 'uzman_gorusu' as const, durum: 'reddedildi' as const },
];

// ──────────────────────────────────────────────
// SEED FONKSİYONLARI
// ──────────────────────────────────────────────

async function seedUsers() {
  console.log('👤 Kullanıcılar oluşturuluyor...');
  const userIds: string[] = [];

  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { role: u.role },
    });

    if (error) {
      if (error.message.includes('already')) {
        console.log(`  ⚠ ${u.email} zaten mevcut, atlanıyor`);
        const { data: existing } = await supabase.auth.admin.listUsers();
        const found = existing?.users?.find(x => x.email === u.email);
        userIds.push(found?.id || '');
      } else {
        console.error(`  ❌ ${u.email}: ${error.message}`);
        userIds.push('');
      }
    } else {
      console.log(`  ✅ ${u.email} (${u.role})`);
      userIds.push(data.user?.id || '');
    }
  }
  return userIds;
}

async function seedFirmalar(userIds: string[]) {
  console.log('\n🏢 Firmalar oluşturuluyor...');
  const firmaIds: string[] = [];

  for (let i = 0; i < FIRMALAR.length; i++) {
    const firma = { ...FIRMALAR[i], user_id: userIds[i + 1] }; // index+1 çünkü ilk user admin
    const { data, error } = await supabase.from('firmalar').insert(firma).select('id').single();

    if (error) {
      console.error(`  ❌ ${firma.unvan}: ${error.message}`);
      firmaIds.push('');
    } else {
      console.log(`  ✅ ${firma.unvan}`);
      firmaIds.push(data.id);
    }
  }
  return firmaIds;
}

async function seedFinansalRaporlar(firmaIds: string[]) {
  console.log('\n📊 Finansal raporlar oluşturuluyor...');
  for (const rapor of FINANSAL_RAPORLAR) {
    const firmaId = firmaIds[rapor.firma_index];
    if (!firmaId) continue;
    const { firma_index, ...payload } = rapor;
    const { error } = await supabase.from('finansal_raporlar').insert({ ...payload, firma_id: firmaId });
    if (error) console.error(`  ❌ Rapor (firma ${rapor.firma_index}): ${error.message}`);
    else console.log(`  ✅ ${rapor.donem} — firma ${rapor.firma_index}`);
  }
}

async function seedBankalar(firmaIds: string[]) {
  console.log('\n🏦 Bankalar oluşturuluyor...');
  for (const b of BANKALAR) {
    const firmaId = firmaIds[b.firma_index];
    if (!firmaId) continue;
    const { firma_index, ...payload } = b;
    const { error } = await supabase.from('bankalar').insert({ ...payload, firma_id: firmaId });
    if (error) console.error(`  ❌ ${b.banka_adi}: ${error.message}`);
    else console.log(`  ✅ ${b.banka_adi}`);
  }
}

async function seedTahsilatlar(firmaIds: string[]) {
  console.log('\n💰 Tahsilatlar oluşturuluyor...');
  for (const t of TAHSILATLAR) {
    const firmaId = firmaIds[t.firma_index];
    if (!firmaId) continue;
    const { firma_index, ...payload } = t;
    const { error } = await supabase.from('tahsilatlar').insert({ ...payload, firma_id: firmaId });
    if (error) console.error(`  ❌ ${t.aciklama}: ${error.message}`);
    else console.log(`  ✅ ${t.aciklama}`);
  }
}

async function seedProjeler(firmaIds: string[]) {
  console.log('\n📋 Projeler oluşturuluyor...');
  for (const p of PROJELER) {
    const firmaId = firmaIds[p.firma_index];
    if (!firmaId) continue;
    const { firma_index, ...payload } = p;
    const { error } = await supabase.from('projeler').insert({ ...payload, firma_id: firmaId });
    if (error) console.error(`  ❌ ${p.proje_adi}: ${error.message}`);
    else console.log(`  ✅ ${p.proje_adi}`);
  }
}

async function seedPremiumTalepler(firmaIds: string[]) {
  console.log('\n👑 Premium talepler oluşturuluyor...');
  for (const t of PREMIUM_TALEPLER) {
    const firmaId = firmaIds[t.firma_index];
    if (!firmaId) continue;
    const { firma_index, ...payload } = t;
    const { error } = await supabase.from('premium_talepler').insert({ ...payload, firma_id: firmaId });
    if (error) console.error(`  ❌ ${t.paket_turu}: ${error.message}`);
    else console.log(`  ✅ ${t.paket_turu} → ${t.durum}`);
  }
}

// ──────────────────────────────────────────────
// ANA ÇALIŞTIRMA
// ──────────────────────────────────────────────

async function main() {
  console.log('🌱 Pro Sicht Fintech — Demo Veri Seed\n');
  console.log('═'.repeat(50));

  const userIds = await seedUsers();
  const firmaIds = await seedFirmalar(userIds);
  await seedFinansalRaporlar(firmaIds);
  await seedBankalar(firmaIds);
  await seedTahsilatlar(firmaIds);
  await seedProjeler(firmaIds);
  await seedPremiumTalepler(firmaIds);

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Seed tamamlandı!\n');
  console.log('Demo hesaplarıyla giriş yapabilirsiniz:');
  console.log('  Admin:      admin@prosicht.com / Admin1234!');
  console.log('  Kullanıcı:  tech@turkiyetech.com / User1234!');
}

main().catch(console.error);
