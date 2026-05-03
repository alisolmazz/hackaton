import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBankalar, createBanka, getTahsilatlar, createTahsilat, getProjeler, createProje } from '@/lib/api';
import { Banka, Tahsilat, Proje } from '@/types';
import { toast } from 'sonner';

export const useBankalar = (firmaId: string) => {
  return useQuery({
    queryKey: ['bankalar', firmaId],
    queryFn: async () => {
      const response = await getBankalar(firmaId);
      return response.data;
    },
    enabled: !!firmaId,
  });
};

export const useCreateBanka = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ firmaId, payload }: { firmaId: string; payload: Partial<Banka> }) => {
      return await createBanka(firmaId, payload);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bankalar', variables.firmaId] });
      toast.success('Banka başarıyla eklendi.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Banka eklenirken bir hata oluştu.');
    }
  });
};

export const useTahsilatlar = (firmaId: string) => {
  return useQuery({
    queryKey: ['tahsilatlar', firmaId],
    queryFn: async () => {
      const response = await getTahsilatlar(firmaId);
      return response.data;
    },
    enabled: !!firmaId,
  });
};

export const useCreateTahsilat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ firmaId, payload }: { firmaId: string; payload: Partial<Tahsilat> }) => {
      return await createTahsilat(firmaId, payload);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tahsilatlar', variables.firmaId] });
      toast.success('Tahsilat başarıyla eklendi.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Tahsilat eklenirken bir hata oluştu.');
    }
  });
};

export const useProjeler = (firmaId: string) => {
  return useQuery({
    queryKey: ['projeler', firmaId],
    queryFn: async () => {
      const response = await getProjeler(firmaId);
      return response.data;
    },
    enabled: !!firmaId,
  });
};

export const useCreateProje = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ firmaId, payload }: { firmaId: string; payload: Partial<Proje> }) => {
      return await createProje(firmaId, payload);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projeler', variables.firmaId] });
      toast.success('Proje başarıyla eklendi.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Proje eklenirken bir hata oluştu.');
    }
  });
};
