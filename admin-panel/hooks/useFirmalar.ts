import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFirmalar, deleteFirma } from '@/lib/api';

export const useFirmalar = () => {
  return useQuery({
    queryKey: ['firmalar'],
    queryFn: async () => {
      const response = await getFirmalar();
      return response.data; // Backend'den gelen veriye göre uyarlanmalı
    },
    refetchOnWindowFocus: false,
  });
};

export const useDeleteFirma = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFirma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firmalar'] });
    },
  });
};
