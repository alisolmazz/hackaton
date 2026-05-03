'use client';

import React from 'react';

export default function AnimatedBackground() {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowChart {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-chart {
          animation: flowChart 40s linear infinite;
        }
        .animate-chart-fast {
          animation: flowChart 25s linear infinite reverse;
        }
        @keyframes blobFloat {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.14; transform: scale(1.08); }
        }
        .animate-blob-1 { animation: blobFloat 8s ease-in-out infinite; }
        .animate-blob-2 { animation: blobFloat 10s ease-in-out infinite 2s; }
        .animate-blob-3 { animation: blobFloat 12s ease-in-out infinite 4s; }
      `}} />

      {/* Animated Financial Grid & Flow Lines — absolute so it stays behind content */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center z-0">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        {/* Animated Line Charts (Stock Waves) */}
        <div className="absolute inset-0 flex items-center overflow-hidden text-indigo-500/20">
          <svg className="w-[200%] h-[400px] flex-shrink-0 animate-chart" preserveAspectRatio="none" viewBox="0 0 2000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,300 L100,280 L200,320 L300,250 L400,270 L500,180 L600,220 L700,100 L800,150 L900,80 L1000,120 L1100,300 L1200,280 L1300,320 L1400,250 L1500,270 L1600,180 L1700,220 L1800,100 L1900,150 L2000,80" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center overflow-hidden text-violet-400/10 mt-32">
          <svg className="w-[200%] h-[300px] flex-shrink-0 animate-chart-fast" preserveAspectRatio="none" viewBox="0 0 2000 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,250 L150,200 L300,280 L450,150 L600,190 L750,80 L900,120 L1000,250 L1150,200 L1300,280 L1450,150 L1600,190 L1750,80 L1900,120 L2000,250" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
          </svg>
        </div>
      </div>

      {/* Ultra-Modern Background Blobs (Mesh Gradient) — absolute */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob-1"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-blob-2"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-blob-3"></div>
      </div>
    </>
  );
}
