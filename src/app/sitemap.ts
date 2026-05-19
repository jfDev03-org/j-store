import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jstore.pt'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/repairs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/repairs/quote`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/repairs/booking`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Fetch categories and their last-modified timestamps
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .order('name')

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${base}/shop/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...categoryRoutes]
}
