export const locales = ['zh-CN', 'en-US', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU', 'ar-SA', 'hi-IN', 'th-TH', 'vi-VN', 'id-ID', 'ms-MY', 'tr-TR', 'pl-PL', 'nl-NL'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
  'zh-TW': '繁體中文',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'fr-FR': 'Français',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
  'it-IT': 'Italiano',
  'pt-BR': 'Português',
  'ru-RU': 'Русский',
  'ar-SA': 'العربية',
  'hi-IN': 'हिन्दी',
  'th-TH': 'ไทย',
  'vi-VN': 'Tiếng Việt',
  'id-ID': 'Bahasa Indonesia',
  'ms-MY': 'Bahasa Melayu',
  'tr-TR': 'Türkçe',
  'pl-PL': 'Polski',
  'nl-NL': 'Nederlands',
};

export const isValidLocale = (locale: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

export const getLocaleFromPathname = (pathname: string): Locale => {
  const firstSegment = pathname.split('/')[1];
  if (isValidLocale(firstSegment)) {
    return firstSegment;
  }
  return defaultLocale;
};

export const formatPathname = (pathname: string, locale: Locale): string => {
  const segments = pathname.split('/').filter(Boolean);
  if (isValidLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }
  return '/' + segments.join('/');
};