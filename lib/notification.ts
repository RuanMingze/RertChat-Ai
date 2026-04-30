export interface NotificationOptions {
  title: string
  body?: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

class NotificationManager {
  private permission: NotificationPermission = 'default'

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持通知功能')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted'
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    }

    return false
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }

  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持通知功能')
      return null
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) {
        return null
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction,
        silent: options.silent,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      return notification
    } catch (error) {
      console.error('显示通知失败:', error)
      return null
    }
  }

  async notifyNewMessage(senderName: string, messagePreview: string, icon?: string): Promise<Notification | null> {
    const preview = messagePreview.length > 50 
      ? messagePreview.substring(0, 50) + '...' 
      : messagePreview

    return this.showNotification({
      title: senderName,
      body: preview,
      icon: icon || '/favicon.png',
      tag: 'new-message',
      silent: true,
    })
  }

  async notifyConversationComplete(title: string): Promise<Notification | null> {
    return this.showNotification({
      title: '对话完成',
      body: `"${title}" 已生成完整回复`,
      icon: '/favicon.png',
      tag: 'conversation-complete',
      silent: true,
    })
  }
}

export const notificationManager = new NotificationManager()
