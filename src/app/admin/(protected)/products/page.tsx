import { createAdminClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils/format'
import ProductForm from '@/components/admin/ProductForm'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Produtos — Admin', robots: { index: false } }

export default async function AdminProductsPage() {
  const supabase = createAdminClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <ProductForm categories={categories ?? []} />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th scope="col" className="text-left px-4 py-3 font-medium">Nome</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">SKU</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Preço</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Stock</th>
              <th scope="col" className="text-left px-4 py-3 font-medium">Estado</th>
              <th scope="col" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Sem produtos ainda. Clica em &quot;Adicionar Produto&quot; para criar um.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{product.sku ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock === 0 ? 'text-destructive font-medium' : ''}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                      {product.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <ProductForm product={product} categories={categories ?? []} />
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
