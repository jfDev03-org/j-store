import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jstore.pt'

  const staticRoutes = [
    '/',
    '/shop',
    '/repairs',
    '/repairs/quote',
    '/repairs/booking',
    '/about',
    '/contact',
  ]

  return staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }))
}
