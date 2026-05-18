export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderItem = {
  product_id: string
  product_name: string
  product_image: string
  price: number
  quantity: number
}

export type ShippingAddress = {
  line1: string
  line2?: string
  city: string
  postal_code: string
  country: string
}

// ─── Row types ───────────────────────────────────────────────────────────────

export type CategoryRow = {
  id: string
  name: string
  slug: string
  type: 'accessory' | 'component' | 'other'
  description: string | null
  image_url: string | null
  created_at: string
}

export type ProductRow = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  images: string[]
  category_id: string | null
  brand: string | null
  sku: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type OrderRow = {
  id: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: ShippingAddress
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  stripe_event_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type RepairServiceRow = {
  id: string
  name: string
  slug: string
  description: string
  price_from: number
  estimated_days: number
  device_models: string[]
  category: string
  is_active: boolean
  created_at: string
}

export type RepairRequestRow = {
  id: string
  service_id: string | null
  device_brand: string
  device_model: string
  issue_description: string
  customer_name: string
  customer_email: string
  customer_phone: string
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  admin_notes: string | null
  quoted_price: number | null
  created_at: string
  updated_at: string
}

export type BookingRow = {
  id: string
  service_id: string | null
  scheduled_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  device_info: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
}

export type StoreRow = {
  id: string
  name: string
  location: string | null
  is_active: boolean
  created_at: string
}

export type StoreStockRow = {
  store_id: string
  product_id: string
  quantity: number
  min_quantity: number
}

export type StockMovementRow = {
  id: string
  store_id: string
  product_id: string
  delta: number
  reason: string
  reference_id: string | null
  created_at: string
}

export type OrderItemRow = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price: number
  quantity: number
  product_image: string
  fulfillment_store_id: string | null
  created_at: string
}

export type DomainEventRow = {
  id: string
  type: string
  payload: Json
  created_at: string
}

export type PurchaseRow = {
  id: string
  supplier: string
  status: 'pending' | 'received' | 'cancelled'
  notes: string | null
  created_at: string
  received_at: string | null
}

export type PurchaseItemRow = {
  id: string
  purchase_id: string
  product_id: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  created_at: string
}

// ─── Database schema ─────────────────────────────────────────────────────────

// Makes nullable fields optional (matching Supabase CLI output)
type MakeNullableOptional<T> = Omit<T, { [K in keyof T]: null extends T[K] ? K : never }[keyof T]> & {
  [K in keyof T as null extends T[K] ? K : never]?: T[K]
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow
        Insert: MakeNullableOptional<Omit<CategoryRow, 'id' | 'created_at'>>
        Update: Partial<Omit<CategoryRow, 'id' | 'created_at'>>
        Relationships: []
      }
      products: {
        Row: ProductRow
        Insert: MakeNullableOptional<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Omit<ProductRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      orders: {
        Row: OrderRow
        Insert: MakeNullableOptional<Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Omit<OrderRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      repair_services: {
        Row: RepairServiceRow
        Insert: MakeNullableOptional<Omit<RepairServiceRow, 'id' | 'created_at'>>
        Update: Partial<Omit<RepairServiceRow, 'id' | 'created_at'>>
        Relationships: []
      }
      repair_requests: {
        Row: RepairRequestRow
        Insert: MakeNullableOptional<Omit<RepairRequestRow, 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Omit<RepairRequestRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      bookings: {
        Row: BookingRow
        Insert: MakeNullableOptional<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>
        Update: Partial<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      stores: {
        Row: StoreRow
        Insert: MakeNullableOptional<Omit<StoreRow, 'id' | 'created_at'>>
        Update: Partial<Omit<StoreRow, 'id' | 'created_at'>>
        Relationships: []
      }
      store_stock: {
        Row: StoreStockRow
        Insert: StoreStockRow
        Update: Partial<StoreStockRow>
        Relationships: []
      }
      stock_movements: {
        Row: StockMovementRow
        Insert: MakeNullableOptional<Omit<StockMovementRow, 'id' | 'created_at'>>
        Update: never
        Relationships: []
      }
      order_items: {
        Row: OrderItemRow
        Insert: MakeNullableOptional<Omit<OrderItemRow, 'id' | 'created_at'>>
        Update: never
        Relationships: []
      }
      domain_events: {
        Row: DomainEventRow
        Insert: Omit<DomainEventRow, 'id' | 'created_at'>
        Update: never
        Relationships: []
      }
      purchases: {
        Row: PurchaseRow
        Insert: MakeNullableOptional<Omit<PurchaseRow, 'id' | 'created_at'>>
        Update: Partial<Omit<PurchaseRow, 'id' | 'created_at'>>
        Relationships: []
      }
      purchase_items: {
        Row: PurchaseItemRow
        Insert: MakeNullableOptional<Omit<PurchaseItemRow, 'id' | 'created_at'>>
        Update: Partial<Omit<PurchaseItemRow, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      transfer_stock: {
        Args: { p_from_store_id: string; p_to_store_id: string; p_product_id: string; p_qty: number }
        Returns: void
      }
      decrement_stock_safe: {
        Args: { p_store_id?: string; p_product_id: string; p_qty: number }
        Returns: void
      }
      increment_stock: {
        Args: { p_store_id?: string; p_product_id: string; p_qty: number; p_reason?: string }
        Returns: void
      }
      receive_purchase: {
        Args: { p_purchase_id: string; p_store_id: string }
        Returns: void
      }
      assign_fulfillment_store: {
        Args: { p_product_id: string; p_qty: number }
        Returns: string | null
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}

// Convenience aliases
export type Category = CategoryRow
export type Product = ProductRow
export type Order = OrderRow
export type RepairService = RepairServiceRow
export type RepairRequest = RepairRequestRow
export type Booking = BookingRow
export type Store = StoreRow
export type StoreStock = StoreStockRow
export type StockMovement = StockMovementRow
export type Purchase = PurchaseRow
export type PurchaseItem = PurchaseItemRow

