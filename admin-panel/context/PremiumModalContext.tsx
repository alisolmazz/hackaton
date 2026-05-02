'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type PaketTuru = 'temel_analiz' | 'uzman_gorusu' | 'premium_bundle' | undefined;

interface PremiumModalContextType {
  isOpen: boolean;
  defaultPaket: PaketTuru;
  openModal: (paket?: PaketTuru) => void;
  closeModal: () => void;
}

const PremiumModalContext = createContext<PremiumModalContextType>({
  isOpen: false,
  defaultPaket: undefined,
  openModal: () => {},
  closeModal: () => {},
});

export function PremiumModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultPaket, setDefaultPaket] = useState<PaketTuru>(undefined);

  const openModal = useCallback((paket?: PaketTuru) => {
    setDefaultPaket(paket);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setDefaultPaket(undefined);
  }, []);

  return (
    <PremiumModalContext.Provider value={{ isOpen, defaultPaket, openModal, closeModal }}>
      {children}
    </PremiumModalContext.Provider>
  );
}

export function usePremiumModal() {
  return useContext(PremiumModalContext);
}
