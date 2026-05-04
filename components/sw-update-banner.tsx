'use client';

import { useEffect, useState } from 'react';
import { useServiceWorkerUpdate } from '@/lib/sw-update';
import { useI18n } from '@/lib/i18n';
import { RefreshCw, X } from 'lucide-react';

export function SWUpdateBanner() {
  const { hasUpdate, applyUpdate, dismissUpdate } = useServiceWorkerUpdate();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [hasUpdate]);

  if (!hasUpdate) return null;

  const handleUpdate = () => {
    setVisible(false);
    setTimeout(() => {
      applyUpdate();
    }, 300);
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      dismissUpdate();
    }, 300);
  };

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[9999]
        flex items-center justify-center gap-3
        px-4 py-3
        bg-gradient-to-r from-orange-500 to-amber-500
        text-white
        shadow-lg
        transition-all duration-300 ease-out
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}
    >
      <RefreshCw className="h-5 w-5 flex-shrink-0" />
      <span className="text-sm font-medium">
        {t('swUpdate.newVersionAvailable')}
      </span>
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={handleUpdate}
          className="
            px-3 py-1.5
            bg-white text-orange-600
            text-sm font-medium
            rounded-md
            hover:bg-orange-50
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500
          "
        >
          {t('swUpdate.updateNow')}
        </button>
        <button
          onClick={handleDismiss}
          className="
            p-1.5
            text-white/80
            hover:text-white
            hover:bg-white/10
            rounded-md
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-white
          "
          aria-label={t('swUpdate.dismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
