'use client';

import { useToastStore } from '@/lib/store';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
  const { toast } = useToastStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (toast.visible) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300); // Wait for transition animation
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  if (!show) return null;

  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300
      ${toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      ${toast.type === 'success' 
        ? 'bg-white/95 border-green-100 text-[var(--clx-text-primary)] shadow-green-100/10' 
        : 'bg-white/95 border-red-100 text-[var(--clx-text-primary)] shadow-red-100/10'}
    `}>
      <div className="flex-shrink-0">
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-green-600 animate-bounce" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="text-sm font-semibold tracking-wide">
        {toast.message}
      </div>
    </div>
  );
}
