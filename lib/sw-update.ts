'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

const DISMISS_KEY = 'sw-update-dismissed';

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
  const [dismissedWorkerUrl, setDismissedWorkerUrlState] = useState<string | null>(null);
  const initialized = useRef(false);
  const hasShownUpdate = useRef(false);

  const getDismissedWorkerUrl = useCallback(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) || null;
    } catch {
      return null;
    }
  }, []);

  const setDismissedWorkerUrl = useCallback((url: string | null) => {
    try {
      if (url) {
        localStorage.setItem(DISMISS_KEY, url);
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
      setDismissedWorkerUrlState(url);
    } catch (error) {
      console.error('Failed to save dismissed worker URL:', error);
    }
  }, []);

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

    setDismissedWorkerUrl(null);
    
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    const handleControllerChange = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.location.reload();
    };
    
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
  }, [registration, setDismissedWorkerUrl]);

  const dismissUpdate = useCallback(() => {
    if (registration?.waiting) {
      setDismissedWorkerUrl(registration.waiting.scriptURL);
    }
    setHasUpdate(false);
    hasShownUpdate.current = true;
  }, [registration, setDismissedWorkerUrl]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let updateFoundHandler: ((event: Event) => void) | null = null;

    const shouldShowUpdate = (waitingWorker: ServiceWorker) => {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      return !dismissed || dismissed !== waitingWorker.scriptURL;
    };

    const handleUpdateFound = (reg: ServiceWorkerRegistration) => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (shouldShowUpdate(newWorker)) {
            requestAnimationFrame(() => {
              setHasUpdate(true);
              hasShownUpdate.current = true;
            });
          }
        }
      });
    };

    const initServiceWorker = async () => {
      if (initialized.current) return;
      initialized.current = true;

      const storedDismissed = localStorage.getItem(DISMISS_KEY);
      setDismissedWorkerUrlState(storedDismissed);

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);

          if (reg.waiting) {
            if (shouldShowUpdate(reg.waiting)) {
              setTimeout(() => {
                if (!hasShownUpdate.current) {
                  setHasUpdate(true);
                  hasShownUpdate.current = true;
                }
              }, 1000);
            }
          }

          updateFoundHandler = () => handleUpdateFound(reg);
          reg.addEventListener('updatefound', updateFoundHandler);
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
      if (updateFoundHandler && registration) {
        registration.removeEventListener('updatefound', updateFoundHandler);
      }
    };
  }, [registration]);

  return {
    hasUpdate,
    isChecking,
    registration,
    checkForUpdate,
    applyUpdate,
    dismissUpdate,
  };
}
