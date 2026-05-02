import { locales, type Locale, defaultLocale } from './config'

type Messages = Record<string, string | Record<string, unknown>>

const messages: Record<Locale, Messages> = {
  'zh-CN': {
    meta: {
      title: 'RertChat - AI助手',
      description: '基于 Cloudflare 的智能对话助手',
    },
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      search: '搜索',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息',
    },
  },
  'en-US': {
    meta: {
      title: 'RertChat - AI Assistant',
      description: 'Intelligent conversation assistant based on Cloudflare',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
    },
  },
}

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return path
    }
  }

  return typeof current === 'string' ? current : path
}

export function getTranslation(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const localeMessages = messages[locale] || messages[defaultLocale]
  let translation = getNestedValue(localeMessages as Record<string, unknown>, key)

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value))
    })
  }

  return translation
}

export function getLocaleFromHeaders(headers: Headers): Locale {
  const acceptLanguage = headers.get('accept-language')
  if (!acceptLanguage) return defaultLocale

  const preferredLocale = acceptLanguage
    .split(',')
    .map((lang) => {
      const [locale, priority = '1'] = lang.trim().split(';q=')
      return { locale: locale.trim(), priority: parseFloat(priority) }
    })
    .sort((a, b) => b.priority - a.priority)
    .find((item) => locales.includes(item.locale as Locale))

  return (preferredLocale?.locale as Locale) || defaultLocale
}

export { type Locale, defaultLocale, locales }
