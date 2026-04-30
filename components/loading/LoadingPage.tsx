'use client'

import { useEffect, useState } from 'react'
import './LoadingPage.css'

export default function LoadingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showScreen, setShowScreen] = useState(true)

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false)
    }

    if (document.readyState === 'complete') {
      setIsLoading(false)
    } else {
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('ai-chat-settings')
      if (storedSettings) {
        const settings = JSON.parse(storedSettings)
        setShowScreen(settings.showLoadingScreen !== false)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                const loadingScreen = document.getElementById('loading-screen')
                if (loadingScreen) {
                  loadingScreen.classList.add('fade-out')
                  setTimeout(() => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                  }, 500)
                }
              }
            })
          }
        })
      })
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const loadingScreen = document.getElementById('loading-screen')
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out')
        setTimeout(() => {
          loadingScreen.style.display = 'none'
        }, 500)
      }
    }
  }, [isLoading])

  if (!showScreen) {
    return null
  }

  return (
    <div id="loading-screen" className={`loading-screen ${isLoading ? 'visible' : ''}`}>
      <div className="loading-container">
        <div className="logo-wrapper">
          <img 
            src="/favicon.png" 
            alt="Logo" 
            className="loading-logo"
          />
        </div>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-indicator"></div>
          </div>
        </div>
      </div>
    </div>
  )
}