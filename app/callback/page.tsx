"use client"

import { PageTitle } from "@/components/PageTitle"
import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveUserProfile, type UserProfile } from "@/lib/chat-db"
import { useI18n } from "@/lib/i18n"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useI18n()

  useEffect(() => {
    const code = searchParams.get("code")

    if (!code) {
      console.error("No authorization code in callback")
      router.push("/")
      return
    }

    const redirectUri = window.location.origin + "/callback"

    fetch("/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
      .then((res) => res.json())
      .then(async (tokenData) => {
        if (tokenData.error || !tokenData.access_token) {
          console.error("Token exchange failed:", tokenData)
          router.push("/")
          return
        }

        const accessToken = tokenData.access_token

        const userResponse = await fetch("https://ruanftrix.cn/oauth/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!userResponse.ok) {
          console.error("Failed to fetch user info")
          router.push("/")
          return
        }

        const userInfo = await userResponse.json()

        const profile: UserProfile = {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          avatar_url: userInfo.avatar_url || '',
          has_beta_access: userInfo.has_beta_access || false,
        }

        await saveUserProfile(profile)
        router.push("/")
      })
      .catch((error) => {
        console.error("OAuth flow error:", error)
        router.push("/")
      })
  }, [searchParams, router])

  return (
    <>
      <PageTitle titleKey="meta.home" />
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <h1 className="text-xl font-semibold">{t('callback.processingLogin')}</h1>
          <p className="mt-2 text-muted-foreground">{t('callback.completingAuth')}</p>
        </div>
      </div>
    </>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}