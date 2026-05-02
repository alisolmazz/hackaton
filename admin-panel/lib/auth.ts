import { User } from '@/types';

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
  const users = localStorage.getItem('mock_users');
  // Eğer veritabanı boşsa Admin'i içine ekle
  if (!users) {
    localStorage.setItem('mock_users', JSON.stringify([
      { email: 'admin@prosicht.com', sifre: 'admin123', name: 'Admin Kullanıcı', role: 'admin' }
    ]));
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
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
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

  const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
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

  return { user: { email, user_metadata: { role: user.role } }, session: { access_token: token } };
};

// KAYIT OLMA FONKSİYONU
export const register = async (firmaAdi: string, adSoyad: string, email: string, sifre: string) => {
  initDB();
  await new Promise(resolve => setTimeout(resolve, 800));

  if (sifre.length < 6) {
    throw new Error('Şifre en az 6 karakter olmalıdır.');
  }

  const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
  
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

  localStorage.setItem('mock_users', JSON.stringify(users));

  return { user: { email, user_metadata: { firmaAdi, adSoyad, role: 'user' } } };
};

// ÇIKIŞ YAPMA
export const logout = async () => {
  if (typeof window !== 'undefined') {
    document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    document.cookie = `sb-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    document.cookie = `sb-email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
    window.location.href = '/login';
  }
};
