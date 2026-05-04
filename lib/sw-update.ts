'use client';

import { useEffect, useState, useCallback } from 'react';

export interface ServiceWorkerUpdateState {
  hasUpdate: boolean;
  isChecking: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState & {
  checkForUpdate: () => Promise<void>;
  applyUpdate: () => void;
  dismissUpdate: () => void;
} {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkForUpdate = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsChecking(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        setRegistration(reg);
        await reg.update();
      }
    } catch (error) {
      console.error('Failed to check for Service Worker update:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const applyUpdate = useCallback(() => {
    if (!registration?.waiting) return;

    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, [registration]);

  const dismissUpdate = useCallback(() => {
    setDismissed(true);
    setHasUpdate(false);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const handleUpdateFound = (reg: ServiceWorkerRegistration) => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (!dismissed) {
            setHasUpdate(true);
          }
        }
      });
    };

    const initServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);

          if (reg.waiting) {
            if (!dismissed) {
              setHasUpdate(true);
            }
          }

          reg.addEventListener('updatefound', () => handleUpdateFound(reg));
        }

        checkInterval = setInterval(
          async () => {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              await reg.update();
            }
          },
          5 * 60 * 1000
        );
      } catch (error) {
        console.error('Failed to initialize Service Worker update detection:', error);
      }
    };

    initServiceWorker();

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [dismissed]);

  return {
    hasUpdate,
    isChecking,
    registration,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
  };
}
