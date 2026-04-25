import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/settings/', '/callback/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rertx.dpdns.org'}/sitemap.xml`,
  }
}
