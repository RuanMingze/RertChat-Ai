"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveUserProfile, type UserProfile } from "@/lib/chat-db"

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const userProfile = searchParams.get("user_profile")

    if (userProfile) {
      try {
        const profile: UserProfile = JSON.parse(decodeURIComponent(userProfile))
        saveUserProfile(profile)
          .then(() => {
            console.log("User profile saved:", profile)
            router.push("/")
          })
          .catch((error) => {
            console.error("Failed to save user profile:", error)
            router.push("/")
          })
      } catch (error) {
        console.error("Failed to parse user profile:", error)
        router.push("/")
      }
    } else {
      console.error("No user profile in callback")
      router.push("/")
    }
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <h1 className="text-xl font-semibold">正在处理登录...</h1>
        <p className="mt-2 text-muted-foreground">请稍候，我们正在完成授权流程</p>
      </div>
    </div>
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
          <h1 className="text-xl font-semibold">正在加载...</h1>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}