'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit2, Trash2, PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getFirmalar, deleteFirma } from '@/lib/api';
import { Firma, SozlesmeTuru } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import EmptyState from '@/components/shared/EmptyState';
import { useFirmalar } from '@/hooks/useFirmalar';

export default function FirmalarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [sozlesmeFiltre, setSozlesmeFiltre] = useState<string>('tumu');
  const [onayFiltre, setOnayFiltre] = useState<string>('tumu');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: firmalar, isLoading } = useFirmalar();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFirma(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firmalar'] });
      toast.success('Firma başarıyla silindi.');
    },
    onError: () => {
      toast.error('Firma silinirken bir hata oluştu.');
    }
  });

  // Debounce benzeri basit arama ve filtreleme
  const filteredFirmalar = firmalar?.filter((firma) => {
    const matchSearch = search.trim() === '' || 
                        firma.unvan.toLowerCase().includes(search.toLowerCase()) || 
                        (firma.vergi_no && firma.vergi_no.includes(search));
    const matchSozlesme = sozlesmeFiltre === 'tumu' || firma.sozlesme_turu === sozlesmeFiltre;
    const matchOnay = onayFiltre === 'tumu' || 
                      (onayFiltre === 'onayli' ? firma.onaylandi : !firma.onaylandi);
    return matchSearch && matchSozlesme && matchOnay;
  }) || [];

  // Sayfalama (Pagination)
  const totalPages = Math.ceil(filteredFirmalar.length / itemsPerPage);
  const paginatedFirmalar = filteredFirmalar.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSozlesmeBadgeColor = (turu: SozlesmeTuru) => {
    switch(turu) {
      case 'rapor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'analiz': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'sistem': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* 1. Üst Kısım: Başlık ve Ekle Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Firmalar</h2>
          <p className="text-sm text-slate-500 mt-1">Sistemde kayıtlı olan tüm firmaları yönetin.</p>
        </div>
        <Link href="/firmalar/yeni">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Yeni Firma Ekle
          </Button>
        </Link>
      </div>

      {/* 2. Filtreler Alanı */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Ünvan veya Vergi No ara..."
            className="pl-10 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Aramada ilk sayfaya dön
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={sozlesmeFiltre} onValueChange={(val) => { setSozlesmeFiltre(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Sözleşme Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tumu">Tüm Sözleşmeler</SelectItem>
              <SelectItem value="rapor">Rapor</SelectItem>
              <SelectItem value="analiz">Analiz</SelectItem>
              <SelectItem value="sistem">Sistem</SelectItem>
              <SelectItem value="diger">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={onayFiltre} onValueChange={(val) => { setOnayFiltre(val); setCurrentPage(1); }}>
            <SelectTrigger className="w-full sm:w-[160px] h-10">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tumu">Tüm Durumlar</SelectItem>
              <SelectItem value="onayli">Onaylı</SelectItem>
              <SelectItem value="bekliyor">Onay Bekliyor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Tablo Alanı */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Şirket Adı</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Vergi No</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Sözleşme Türü</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Sözleşme Bitiş</TableHead>
              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">Durum</TableHead>
              <TableHead className="text-right font-semibold text-slate-900 dark:text-slate-200">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Yükleme Durumu
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-[220px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[110px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[90px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[120px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedFirmalar.length === 0 ? (
              // Boş Durum
              <TableRow>
                <TableCell colSpan={6} className="h-[400px]">
                  <EmptyState message="Henüz firma eklenmemiş veya arama kriterine uygun kayıt yok." />
                </TableCell>
              </TableRow>
            ) : (
              // Veriler
              paginatedFirmalar.map((firma) => (
                <TableRow key={firma.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <TableCell className="font-semibold">
                    <Link href={`/firmalar/${firma.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {firma.unvan}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300 font-medium">{firma.vergi_no}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`uppercase tracking-wider font-bold ${getSozlesmeBadgeColor(firma.sozlesme_turu)}`}>
                      {firma.sozlesme_turu}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {firma.sozlesme_bitis ? (
                      <span className={`font-medium ${isExpired(firma.sozlesme_bitis) ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {format(new Date(firma.sozlesme_bitis), 'dd.MM.yyyy')}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {firma.onaylandi ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                        Onaylı
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        Onay Bekliyor
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/firmalar/${firma.id}`)} className="text-slate-500 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-500 hover:text-orange-500">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Firmayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu işlem kalıcıdır. Firmayı ve bu firmaya ait tüm finansal verileri sileceksiniz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteMutation.mutate(firma.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Evet, Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex items-center justify-center bg-slate-50 dark:bg-slate-800/20">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(idx + 1)}
                      isActive={currentPage === idx + 1}
                      className="cursor-pointer"
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
