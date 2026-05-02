export const locales = ['zh-CN', 'en-US'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh-CN';

export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
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