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
  'de-DE': {
    meta: {
      title: 'RertChat - KI-Assistent',
      description: 'Intelligenter Konversationsassistent basierend auf Cloudflare',
    },
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      search: 'Suchen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      info: 'Information',
    },
  },
  'es-ES': {
    meta: {
      title: 'RertChat - Asistente de IA',
      description: 'Asistente de conversación inteligente basado en Cloudflare',
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
    },
  },
  'it-IT': {
    meta: {
      title: 'RertChat - Assistente AI',
      description: 'Assistente di conversazione intelligente basato su Cloudflare',
    },
    common: {
      save: 'Salva',
      cancel: 'Annulla',
      confirm: 'Conferma',
      delete: 'Elimina',
      edit: 'Modifica',
      search: 'Cerca',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avvertimento',
      info: 'Informazione',
    },
  },
  'pt-BR': {
    meta: {
      title: 'RertChat - Assistente de IA',
      description: 'Assistente de conversação inteligente baseado em Cloudflare',
    },
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      delete: 'Excluir',
      edit: 'Editar',
      search: 'Pesquisar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
    },
  },
  'ru-RU': {
    meta: {
      title: 'RertChat - ИИ-ассистент',
      description: 'Интеллектуальный собеседник на базе Cloudflare',
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      delete: 'Удалить',
      edit: 'Редактировать',
      search: 'Поиск',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Предупреждение',
      info: 'Информация',
    },
  },
  'ar-SA': {
    meta: {
      title: 'RertChat - مساعد الذكاء الاصطناعي',
      description: 'مساعد محادثة ذكي يعتمد على Cloudflare',
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      warning: 'تحذير',
      info: 'معلومات',
    },
  },
  'hi-IN': {
    meta: {
      title: 'RertChat - AI सहायक',
      description: 'Cloudflare पर आधारित बुद्धिमान संवाद सहायक',
    },
    common: {
      save: 'सहेजें',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      search: 'खोजें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',
      warning: 'चेतावनी',
      info: 'जानकारी',
    },
  },
  'th-TH': {
    meta: {
      title: 'RertChat - ผู้ช่วย AI',
      description: 'ผู้ช่วยสนทนาอัจฉริยะบน Cloudflare',
    },
    common: {
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      confirm: 'ยืนยัน',
      delete: 'ลบ',
      edit: 'แก้ไข',
      search: 'ค้นหา',
      loading: 'กำลังโหลด...',
      error: 'ข้อผิดพลาด',
      success: 'สำเร็จ',
      warning: 'คำเตือน',
      info: 'ข้อมูล',
    },
  },
  'vi-VN': {
    meta: {
      title: 'RertChat - Trợ lý AI',
      description: 'Trợ lý hội thoại thông minh dựa trên Cloudflare',
    },
    common: {
      save: 'Lưu',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      delete: 'Xóa',
      edit: 'Sửa',
      search: 'Tìm kiếm',
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      warning: 'Cảnh báo',
      info: 'Thông tin',
    },
  },
  'id-ID': {
    meta: {
      title: 'RertChat - Asisten AI',
      description: 'Asisten percakapan cerdas berbasis Cloudflare',
    },
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      confirm: 'Konfirmasi',
      delete: 'Hapus',
      edit: 'Edit',
      search: 'Cari',
      loading: 'Memuat...',
      error: 'Kesalahan',
      success: 'Berhasil',
      warning: 'Peringatan',
      info: 'Informasi',
    },
  },
  'ms-MY': {
    meta: {
      title: 'RertChat - Pembantu AI',
      description: 'Pembantu perbualan pintar berdasarkan Cloudflare',
    },
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      confirm: 'Sahkan',
      delete: 'Padam',
      edit: 'Edit',
      search: 'Cari',
      loading: 'Memuat...',
      error: 'Ralat',
      success: 'Berjaya',
      warning: 'Amaran',
      info: 'Maklumat',
    },
  },
  'tr-TR': {
    meta: {
      title: 'RertChat - AI Asistanı',
      description: 'Cloudflare tabanlı akıllı sohbet asistanı',
    },
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      confirm: 'Onayla',
      delete: 'Sil',
      edit: 'Düzenle',
      search: 'Ara',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      warning: 'Uyarı',
      info: 'Bilgi',
    },
  },
  'pl-PL': {
    meta: {
      title: 'RertChat - Asystent AI',
      description: 'Inteligentny asystent konwersacyjny oparty na Cloudflare',
    },
    common: {
      save: 'Zapisz',
      cancel: 'Anuluj',
      confirm: 'Potwierdź',
      delete: 'Usuń',
      edit: 'Edytuj',
      search: 'Szukaj',
      loading: 'Ładowanie...',
      error: 'Błąd',
      success: 'Sukces',
      warning: 'Ostrzeżenie',
      info: 'Informacja',
    },
  },
  'nl-NL': {
    meta: {
      title: 'RertChat - AI Assistent',
      description: 'Intelligente conversatie-assistent op basis van Cloudflare',
    },
    common: {
      save: 'Opslaan',
      cancel: 'Annuleren',
      confirm: 'Bevestigen',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      search: 'Zoeken',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      warning: 'Waarschuwing',
      info: 'Informatie',
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
