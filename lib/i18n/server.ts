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
  'ja-JP': {
    meta: {
      title: 'RertChat - AIアシスタント',
      description: 'Cloudflareベースのインテリジェント会話アシスタント',
    },
    common: {
      save: '保存',
      cancel: 'キャンセル',
      confirm: '確認',
      delete: '削除',
      edit: '編集',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功',
      warning: '警告',
      info: '情報',
    },
  },
  'ko-KR': {
    meta: {
      title: 'RertChat - AI 어시스턴트',
      description: 'Cloudflare 기반의 지능형 대화 어시스턴트',
    },
    common: {
      save: '저장',
      cancel: '취소',
      confirm: '확인',
      delete: '삭제',
      edit: '편집',
      search: '검색',
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      warning: '경고',
      info: '정보',
    },
  },
  'fr-FR': {
    meta: {
      title: 'RertChat - Assistant IA',
      description: 'Assistant conversationnel intelligent basé sur Cloudflare',
    },
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
    },
  },
  'zh-TW': {
    meta: {
      title: 'RertChat - AI 助手',
      description: '基於 Cloudflare 的智慧對話助手',
    },
    common: {
      save: '儲存',
      cancel: '取消',
      confirm: '確認',
      delete: '刪除',
      edit: '編輯',
      search: '搜尋',
      loading: '載入中...',
      error: '錯誤',
      success: '成功',
      warning: '警告',
      info: '資訊',
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
