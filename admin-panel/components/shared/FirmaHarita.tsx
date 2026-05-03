'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon path issue in Next.js
const fixIconPath = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};

// Mock geocode: Maps Turkish city names found in address to rough coordinates
const SEHIR_KOORDINATLARI: Record<string, [number, number]> = {
  'istanbul':   [41.0082, 28.9784],
  'ankara':     [39.9334, 32.8597],
  'izmir':      [38.4192, 27.1287],
  'bursa':      [40.1885, 29.0610],
  'antalya':    [36.8969, 30.7133],
  'adana':      [37.0000, 35.3213],
  'konya':      [37.8746, 32.4932],
  'gaziantep':  [37.0662, 37.3833],
  'mersin':     [36.8121, 34.6415],
  'kayseri':    [38.7312, 35.4787],
  'trabzon':    [41.0027, 39.7168],
  'samsun':     [41.2867, 36.3300],
  'eskişehir':  [39.7667, 30.5256],
  'denizli':    [37.7765, 29.0864],
  'şanlıurfa':  [37.1591, 38.7969],
  'malatya':    [38.3554, 38.3335],
  'erzurum':    [39.9055, 41.2658],
  'van':        [38.5012, 43.3730],
  'diyarbakır': [37.9150, 40.2307],
  'sakarya':    [40.6940, 30.4358],
  'kocaeli':    [40.7654, 29.9408],
  'tekirdağ':   [41.2824, 27.5120],
  'manisa':     [38.6191, 27.4289],
  'muğla':      [37.2153, 28.3636],
  'aydın':      [37.8560, 27.8416],
  'balıkesir':  [39.6484, 27.8826],
  'hatay':      [36.4018, 36.3498],
  'kahramanmaraş': [37.5858, 36.9371],
  'ordu':       [40.9862, 37.8797],
  'düzce':      [40.8438, 31.1565],
  'bolu':       [40.7360, 31.6066],
  'kadıköy':    [40.9927, 29.0290],
  'beşiktaş':   [41.0422, 29.0044],
  'şişli':      [41.0602, 28.9877],
  'üsküdar':    [41.0234, 29.0153],
  'beyoğlu':    [41.0370, 28.9770],
  'ataşehir':   [40.9923, 29.1244],
  'levent':     [41.0784, 29.0135],
  'maslak':     [41.1060, 29.0210],
};

function guessCoordinatesFromAddress(address: string): [number, number] {
  const lowerAddr = address.toLowerCase().replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g');
  
  for (const [sehir, coords] of Object.entries(SEHIR_KOORDINATLARI)) {
    const normalizedSehir = sehir.toLowerCase().replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g');
    if (lowerAddr.includes(normalizedSehir)) {
      // Add small random offset so pins aren't perfectly centered
      return [
        coords[0] + (Math.random() - 0.5) * 0.02,
        coords[1] + (Math.random() - 0.5) * 0.02,
      ];
    }
  }
  // Default: Istanbul center
  return [41.0082, 28.9784];
}

interface FirmaHaritaProps {
  firmaAdi: string;
  adres: string;
  className?: string;
}

export default function FirmaHarita({ firmaAdi, adres, className = '' }: FirmaHaritaProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    fixIconPath();

    const coords = guessCoordinatesFromAddress(adres);

    const map = L.map(mapRef.current, {
      center: coords,
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Dark-themed map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Custom marker icon with glow
    const customIcon = L.divIcon({
      html: `
        <div style="position:relative;width:40px;height:40px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(99,102,241,0.3);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 20px rgba(99,102,241,0.6);"></div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    const marker = L.marker(coords, { icon: customIcon }).addTo(map);

    marker.bindPopup(`
      <div style="font-family:'Segoe UI',system-ui,sans-serif;padding:4px 0;">
        <h3 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">${firmaAdi}</h3>
        <p style="margin:0;font-size:12px;color:#64748b;line-height:1.4;">${adres}</p>
      </div>
    `, { className: 'firma-popup' });

    mapInstanceRef.current = map;

    // Force resize after container is fully rendered
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [adres, firmaAdi]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={mapRef}
        className="w-full h-full min-h-[280px]"
        style={{ zIndex: 1 }}
      />
      {/* Gradient overlay at bottom for smooth blend */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d1425] to-transparent pointer-events-none z-[2]" />
    </div>
  );
}
