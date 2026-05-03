'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Edit2, Trash2, PlusCircle, Search, Building2 } from 'lucide-react';
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

  const { data: response, isLoading } = useFirmalar();
  const firmalar = response?.data;

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

  const filteredFirmalar = firmalar?.filter((firma) => {
    const matchSearch = search.trim() === '' || 
                        firma.unvan.toLowerCase().includes(search.toLowerCase()) || 
                        (firma.vergi_no && firma.vergi_no.includes(search));
    const matchSozlesme = sozlesmeFiltre === 'tumu' || firma.sozlesme_turu === sozlesmeFiltre;
    const matchOnay = onayFiltre === 'tumu' || 
                      (onayFiltre === 'onayli' ? firma.onaylandi : !firma.onaylandi);
    return matchSearch && matchSozlesme && matchOnay;
  }) || [];

  const totalPages = Math.ceil(filteredFirmalar.length / itemsPerPage);
  const paginatedFirmalar = filteredFirmalar.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSozlesmeBadgeColor = (turu: SozlesmeTuru) => {
    switch(turu) {
      case 'rapor': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
      case 'analiz': return 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400';
      case 'sistem': return 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300';
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      
      {/* 1. Üst Kısım: Başlık ve Ekle Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Firma Yönetimi</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Sistemdeki tüm kurumsal hesapları ve sözleşmeleri yönetin.</p>
          </div>
        </div>
        <Link href="/firmalar/yeni">
          <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 border-0">
            <PlusCircle className="mr-2 h-5 w-5" /> Yeni Firma
          </Button>
        </Link>
      </div>

      {/* 2. Filtreler Alanı */}
      <div className="bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl p-4 sm:p-5 rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 flex flex-col md:flex-row gap-4 relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Firma ünvanı veya Vergi No ara..."
            className="pl-12 h-14 bg-slate-50/50 dark:bg-[#0a0f1c]/50 border-slate-200/50 dark:border-white/10 rounded-xl font-medium focus-visible:ring-blue-500 text-base"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={sozlesmeFiltre} onValueChange={(val) => { if (val) { setSozlesmeFiltre(val); setCurrentPage(1); } }}>
            <SelectTrigger className="w-full sm:w-[200px] h-14 rounded-xl border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0f1c]/50 font-bold">
              <SelectValue placeholder="Sözleşme Türü" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/10">
              <SelectItem value="tumu" className="font-medium">Tüm Sözleşmeler</SelectItem>
              <SelectItem value="rapor" className="font-medium">Rapor</SelectItem>
              <SelectItem value="analiz" className="font-medium">Analiz</SelectItem>
              <SelectItem value="sistem" className="font-medium">Sistem</SelectItem>
              <SelectItem value="diger" className="font-medium">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={onayFiltre} onValueChange={(val) => { if (val) { setOnayFiltre(val); setCurrentPage(1); } }}>
            <SelectTrigger className="w-full sm:w-[180px] h-14 rounded-xl border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0f1c]/50 font-bold">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-100 dark:border-white/10">
              <SelectItem value="tumu" className="font-medium">Tüm Durumlar</SelectItem>
              <SelectItem value="onayli" className="font-medium">Onaylı</SelectItem>
              <SelectItem value="bekliyor" className="font-medium">Onay Bekliyor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. Tablo Alanı */}
      <div className="bg-white/5 dark:bg-[#0d1425]/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="border-b border-slate-100 dark:border-white/5 hover:bg-transparent">
                <TableHead className="pl-8 h-16 font-bold text-slate-500 uppercase text-[11px] tracking-widest">Şirket Bilgileri</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Vergi / Sicil No</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Hizmet Türü</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Vade Durumu</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[11px] tracking-widest">Onay</TableHead>
                <TableHead className="pr-8 text-right font-bold text-slate-500 uppercase text-[11px] tracking-widest">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-slate-100 dark:border-white/5 h-20">
                    <TableCell className="pl-8"><Skeleton className="h-6 w-[250px] rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[120px] rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-[90px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px] rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-[100px] rounded-full" /></TableCell>
                    <TableCell className="pr-8"><Skeleton className="h-9 w-[130px] rounded-lg ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedFirmalar.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[400px]">
                    <EmptyState title="Hiç firma bulunamadı." />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFirmalar.map((firma) => (
                  <TableRow key={firma.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors h-20 group">
                    <TableCell className="pl-8">
                      <Link href={`/firmalar/${firma.id}`} className="font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base block">
                        {firma.unvan}
                      </Link>
                      <span className="text-xs font-medium text-slate-500 mt-0.5 block">{firma.yetkili_kisi || 'Yetkili Belirtilmemiş'}</span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-md text-xs">{firma.vergi_no}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-none shadow-none font-bold tracking-wider uppercase text-[10px] px-2.5 py-1 ${getSozlesmeBadgeColor(firma.sozlesme_turu)}`}>
                        {firma.sozlesme_turu}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {firma.sozlesme_bitis ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isExpired(firma.sozlesme_bitis) ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {format(new Date(firma.sozlesme_bitis), 'dd MMM yyyy')}
                          </span>
                          {isExpired(firma.sozlesme_bitis) && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {firma.onaylandi ? (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none shadow-none font-bold px-2.5 py-1">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-none shadow-none font-bold px-2.5 py-1 flex w-fit items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Bekliyor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/firmalar/' + firma.id)} className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 inline-flex items-center justify-center transition-colors">
                              <Trash2 className="h-4 w-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[24px] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-bold">Kalıcı Silme Onayı</AlertDialogTitle>
                              <AlertDialogDescription className="text-base font-medium">
                                <strong className="text-slate-900 dark:text-white">{firma.unvan}</strong> firmasını siliyorsunuz. Bu işlem kalıcıdır ve firmaya ait tüm finansal, OCR ve sözleşme verileri yok olacaktır.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                              <AlertDialogCancel className="h-12 rounded-xl font-bold border-slate-200 dark:border-white/10">İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(firma.id)}
                                className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                              >
                                Evet, Firmayı Sil
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
        </div>

        {/* 4. Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 dark:border-white/5 p-4 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
            <p className="text-sm font-bold text-slate-500 pl-4 hidden sm:block">
              Toplam <span className="text-slate-900 dark:text-white">{filteredFirmalar.length}</span> firma
            </p>
            <Pagination className="justify-end pr-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={`rounded-lg font-bold ${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white dark:hover:bg-white/10'}`} 
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(idx + 1)}
                      isActive={currentPage === idx + 1}
                      className={`rounded-lg font-bold cursor-pointer ${currentPage === idx + 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-white dark:hover:bg-white/10'}`}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                    className={`rounded-lg font-bold ${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-white dark:hover:bg-white/10'}`}
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
