"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Sparkles, Users, Shield, Zap, Github, Heart } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">{t('about.title')}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-8">
          <section className="text-center">
            <img
              src="/favicon.png"
              alt="RertChat Logo"
              className="mx-auto mb-4 h-24 w-24 rounded-xl object-cover"
              style={{ width: 96, height: 96 }}
            />
            <h2 className="mb-4 text-3xl font-bold">{t('about.subtitle')}</h2>
            <p className="text-lg text-muted-foreground">{t('about.tagline')}</p>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t('about.ourMission')}
            </h3>
            <Card>
              <CardContent className="pt-1">
                <div className="space-y-4 text-muted-foreground">
                  <p>{t('about.missionDesc1')}</p>
                  <p>{t('about.missionDesc2')}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t('about.coreValues')}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    {t('about.value1Title')}
                  </CardTitle>
                  <CardDescription>{t('about.value1Desc')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {t('about.value2Title')}
                  </CardTitle>
                  <CardDescription>{t('about.value2Desc')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('about.value3Title')}
                  </CardTitle>
                  <CardDescription>{t('about.value3Desc')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('about.value4Title')}
                  </CardTitle>
                  <CardDescription>{t('about.value4Desc')}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-semibold">{t('about.openSource')}</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  {t('about.openSourceTitle')}
                </CardTitle>
                <CardDescription>{t('about.openSourceDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <a
                    href="https://github.com/RuanMingze/RertChat-Ai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    {t('about.viewOnGithub')}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-semibold">{t('about.techStack')}</h3>
            <Card>
              <CardContent className="pt-1">
                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Next.js</span>
                    <span className="text-foreground">16 + React 19</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TypeScript</span>
                    <span className="text-foreground">5.x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tailwind CSS</span>
                    <span className="text-foreground">shadcn/ui</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cloudflare</span>
                    <span className="text-foreground">Workers + AI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PWA</span>
                    <span className="text-foreground">{t('about.supported')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center gap-8">
              <img
                src="https://ruanmgjx.dpdns.org/logo.png"
                alt="Ruanm Logo"
                className="rounded-xl object-cover"
                style={{ width: 160, height: 160 }}
              />
              <span className="text-5xl font-bold text-muted-foreground">|</span>
              <img
                src="/favicon.png"
                alt="RertChat Logo"
                className="rounded-xl object-cover"
                style={{ width: 160, height: 160 }}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
