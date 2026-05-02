import { useMutation } from '@tanstack/react-query';
import * as api from '@/lib/api';
import { showSuccess, showError } from '@/lib/toast';

/** Admin: PPTX sunum oluştur */
export function useGeneratePptx() {
  return useMutation({
    mutationFn: ({ firmaId, ayarlar }: { firmaId: string; ayarlar?: Record<string, unknown> }) =>
      api.generatePptx(firmaId, ayarlar),
    onError: () => showError('Sunum oluşturulamadı'),
  });
}

/** Admin: Oluşturulan PPTX'i indir (Blob → dosya) */
export function useDownloadPptx() {
  return useMutation({
    mutationFn: async ({ firmaId, firmaAdi }: { firmaId: string; firmaAdi: string }) => {
      const blob = await api.downloadPptx(firmaId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${firmaAdi}_on_sunum.pptx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => showSuccess('.pptx dosyası indirildi'),
    onError: () => showError('İndirme başarısız'),
  });
}
