'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Locale, defaultLocale, isValidLocale } from './config';
import zhCN from '../../messages/zh-CN.json';
import enUS from '../../messages/en-US.json';
import zhTW from '../../messages/zh-TW.json';
import jaJP from '../../messages/ja-JP.json';
import koKR from '../../messages/ko-KR.json';
import frFR from '../../messages/fr-FR.json';
import deDE from '../../messages/de-DE.json';
import esES from '../../messages/es-ES.json';
import itIT from '../../messages/it-IT.json';
import ptBR from '../../messages/pt-BR.json';
import ruRU from '../../messages/ru-RU.json';
import arSA from '../../messages/ar-SA.json';
import hiIN from '../../messages/hi-IN.json';
import thTH from '../../messages/th-TH.json';
import viVN from '../../messages/vi-VN.json';
import idID from '../../messages/id-ID.json';
import msMY from '../../messages/ms-MY.json';
import trTR from '../../messages/tr-TR.json';
import plPL from '../../messages/pl-PL.json';
import nlNL from '../../messages/nl-NL.json';

type Messages = typeof zhCN;

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'zh-TW': zhTW,
  'ja-JP': jaJP,
  'ko-KR': koKR,
  'fr-FR': frFR,
  'de-DE': deDE,
  'es-ES': esES,
  'it-IT': itIT,
  'pt-BR': ptBR,
  'ru-RU': ruRU,
  'ar-SA': arSA,
  'hi-IN': hiIN,
  'th-TH': thTH,
  'vi-VN': viVN,
  'id-ID': idID,
  'ms-MY': msMY,
  'tr-TR': trTR,
  'pl-PL': plPL,
  'nl-NL': nlNL,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'rertchat-locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      setLocaleState(stored);
    } else {
      const browserLang = navigator.language;
      const matched = Object.keys(messages).find(lang => browserLang.startsWith(lang)) as Locale | undefined;
      if (matched) {
        setLocaleState(matched);
      }
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else if (value && Array.isArray(value) && !isNaN(Number(k))) {
        const index = Number(k)
        if (index >= 0 && index < value.length) {
          value = value[index]
        } else {
          return key
        }
      } else {
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
        return String(params[paramKey] || `{${paramKey}}`)
      })
    }

    return value
  }, [locale]);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => key
    };
  }
  return context;
}