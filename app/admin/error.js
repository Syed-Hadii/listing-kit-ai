'use client';

import { useEffect } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Admin panel error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Admin Error</h2>
        <p className="text-brand-navy/60 mb-6">{error?.message || 'An unexpected error occurred in the admin panel'}</p>
        <div className="flex gap-3">
          <button onClick={() => reset()} className="btn btn-gold">
            Try again
          </button>
          <Link href="/dashboard" className="btn btn-primary">
            <Home size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
