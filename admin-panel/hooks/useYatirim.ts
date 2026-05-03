import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getYatirimlar, createYatirim, deleteYatirim } from '@/lib/api';
import { Yatirim } from '@/types';
import { toast } from 'sonner';

// Belirli bir firmanın yatırımlarını çeker
export const useYatirimlar = (firmaId: string) => {
  return useQuery({
    queryKey: ['yatirimlar', firmaId],
    queryFn: async () => {
      const response = await getYatirimlar(firmaId);
      return response.data;
    },
    enabled: !!firmaId,
  });
};

// Yeni bir yatırım ekler
export const useCreateYatirim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ firmaId, payload }: { firmaId: string; payload: Partial<Yatirim> }) => {
      return await createYatirim(firmaId, payload);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['yatirimlar', variables.firmaId] });
      // Sistem loglarını vb güncelle
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard'] }); 
    },
    onError: (error: any) => {
      toast.error(error.message || 'Yatırım eklenirken bir hata oluştu.');
    }
  });
};

// Mevcut bir yatırımı siler
export const useDeleteYatirim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ firmaId, yatirimId }: { firmaId: string; yatirimId: string }) => {
      return await deleteYatirim(yatirimId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['yatirimlar', variables.firmaId] });
      toast.success('Yatırım başarıyla silindi.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Yatırım silinirken bir hata oluştu.');
    }
  });
};
