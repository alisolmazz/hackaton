'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  panel?: 'admin' | 'user';
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      const isUser = this.props.panel === 'user';
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-6">
          <div className="text-center max-w-sm">
            <div className={`w-16 h-16 mx-auto rounded-full ${isUser ? 'bg-teal-100' : 'bg-blue-100'} flex items-center justify-center mb-4`}>
              <AlertCircle className={`w-8 h-8 ${isUser ? 'text-teal-600' : 'text-blue-600'}`} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Bir hata oluştu</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Sayfa yüklenirken beklenmeyen bir sorunla karşılaşıldı.</p>
            <Button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className={isUser ? 'bg-teal-700 hover:bg-teal-800 text-white' : ''}>
              <RefreshCw className="w-4 h-4 mr-2" /> Sayfayı Yenile
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
