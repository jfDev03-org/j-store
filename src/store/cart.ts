import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartState, CartItem } from '@/types/cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (product_id) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== product_id),
        }))
      },

      updateQuantity: (product_id, quantity) => {
        if (quantity < 1) {
          get().removeItem(product_id)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === product_id ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'jstore-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
