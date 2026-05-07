import { User } from '@/types';
import { addSystemLog } from '@/lib/api';
import CryptoJS from 'crypto-js';

const MOCK_USERS_KEY = 'mock_users';
const ENCRYPTION_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'prosicht-hackathon-secure-key-2024';
const DEFAULT_ADMIN_USER = [
  { email: 'admin@prosicht.com', sifre: 'admin123', name: 'Admin Kullanici', role: 'admin' },
];

const readMockUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MOCK_USERS_KEY);
  if (!raw) return [];

  try {
    const bytes = CryptoJS.AES.decrypt(raw, ENCRYPTION_SECRET);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData || raw);
  } catch {
    return [];
  }
};

const writeMockUsers = (users: any[]) => {
  if (typeof window === 'undefined') return;
  const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(users), ENCRYPTION_SECRET).toString();
  localStorage.setItem(MOCK_USERS_KEY, encryptedData);
};

// Mock function to get token
export const getToken = async (): Promise<string | null> => {
  if (typeof window !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; sb-access-token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// LocalStorage kullanarak mini bir veritabanı simülasyonu başlatır
const initDB = () => {
  if (typeof window === 'undefined') return;
  const users = readMockUsers();
  // Eğer veritabanı boşsa Admin'i içine ekle
  if (!users.length) {
    writeMockUsers(DEFAULT_ADMIN_USER);
  }
}

// O anki giriş yapmış kullanıcıyı getirir
export const getCurrentUser = async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;

  if (typeof window !== 'undefined') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; sb-email=`);
    if (parts.length === 2) {
      const email = decodeURIComponent(parts.pop()?.split(';').shift() || '');
      const users = readMockUsers();
      const user = users.find((u: any) => u.email === email);
      if (user) {
        return {
          id: 'mock-id-' + user.email,
          email: user.email,
          name: user.name || user.adSoyad,
          firmaAdi: user.firmaAdi,
          role: user.role,
          premium_aktif: Boolean(user.premium_aktif),
          premium_paket: user.premium_paket || null,
        };
      }
    }
  }
  return null;
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};

// GİRİŞ YAPMA FONKSİYONU
export const login = async (email: string, sifre: string) => {
  initDB(); // Veritabanını kontrol et
  await new Promise(resolve => setTimeout(resolve, 800)); // Ağ yüklenme simülasyonu

  const users = readMockUsers();
  const user = users.find((u: any) => u.email === email && u.sifre === sifre);

  // Eğer eşleşme yoksa hata fırlat
  if (!user) {
    throw new Error('E-posta adresiniz veya şifreniz hatalı!');
  }

  // Giriş başarılıysa Token ve çerezleri oluştur
  const token = `mock-token-${Date.now()}`;
  if (typeof window !== 'undefined') {
    document.cookie = `sb-access-token=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `sb-role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `sb-email=${encodeURIComponent(user.email)}; path=/; max-age=86400; SameSite=Lax`;
  }

  // Log kaydı
  addSystemLog({ kullanici: email, islem_turu: 'login', tablo: 'auth', kayit_id: email, eski_deger: null, yeni_deger: { role: user.role } });

  return { user: { email, user_metadata: { role: user.role } }, session: { access_token: token } };
};

// KAYIT OLMA FONKSİYONU
export const register = async (firmaAdi: string, adSoyad: string, email: string, sifre: string) => {
  initDB();
  await new Promise(resolve => setTimeout(resolve, 800));

  if (sifre.length < 6) {
    throw new Error('Şifre en az 6 karakter olmalıdır.');
  }

  const users = readMockUsers();
  
  // Bu e-posta daha önce kayıtlı mı diye bak
  if (users.find((u: any) => u.email === email)) {
    throw new Error('Bu e-posta adresi sistemde zaten kayıtlı!');
  }

  // Yeni kullanıcıyı sisteme kaydet
  users.push({
    email,
    sifre,
    firmaAdi,
    adSoyad,
    name: adSoyad,
    role: 'user',
    premium_aktif: false,
    premium_paket: null,
  });

  writeMockUsers(users);

  // Log kaydı
  addSystemLog({ kullanici: email, islem_turu: 'create', tablo: 'kullanicilar', kayit_id: email, eski_deger: null, yeni_deger: { firmaAdi, adSoyad, role: 'user' } });

  return { user: { email, user_metadata: { firmaAdi, adSoyad, role: 'user' } } };
};

// ÇIKIŞ YAPMA
export const logout = async () => {
  if (typeof window !== 'undefined') {
    // Log kaydı (çıkış yapmadan önce email'i al)
    const emailCookie = `; ${document.cookie}`.split(`; sb-email=`);
    const email = emailCookie.length === 2 ? decodeURIComponent(emailCookie.pop()?.split(';').shift() || '') : 'unknown';
    addSystemLog({ kullanici: email, islem_turu: 'logout', tablo: 'auth', kayit_id: email, eski_deger: null, yeni_deger: null });

    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    document.cookie = `sb-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    document.cookie = `sb-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    window.location.href = '/login';
  }
};
