This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# JStore — Phone Repair & Accessories

A full-stack e-commerce and repair booking platform for a mobile phone shop. Built with Next.js 16 (App Router), Supabase, and Stripe.

---

## Features

### Customer-facing
- **Shop** — Browse products by category (screens, batteries, chargers, cases, components)
- **Product pages** — Detail pages with images, descriptions and add-to-cart
- **Cart** — Persistent cart drawer powered by Zustand
- **Checkout** — Stripe Checkout integration; free shipping on orders over €50
- **Repairs** — View repair services, book an appointment, or request a free quote
- **Contact** — Contact form with email delivery via Resend
- **About** — Store information page

### Admin panel (`/admin`)
- **Dashboard** — Revenue stats (today / week / 30 days), recent orders, low-stock alerts, 7-day bar chart
- **Products** — Create, edit, delete products with categories, SKU, images and stock
- **Orders** — View and update order status (pending → paid → shipped → delivered)
- **Repairs** — Manage repair requests and update status
- **Bookings** — Manage appointment bookings
- **Purchases** — Record stock purchases from suppliers; receive items into stock
- **Stock** — Per-store stock levels, manual adjustments, stock transfers between stores
- **Stores** — Manage physical store locations, enable/disable
- **Settings** — Update admin email and password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI) |
| Database & Auth | Supabase (PostgreSQL) |
| Payments | Stripe |
| State Management | Zustand |
| Email | Resend |
| Icons | Lucide React |
| Notifications | Sonner |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account (for emails)

### 1. Clone and install

```bash
git clone https://github.com/jfDev03-org/j-store.git
cd j-store
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_DISABLED` | Set `true` to bypass Stripe in dev/test |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | From address for outgoing emails |
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

### 3. Set up the database

Run the migrations in order in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_atomic_stock.sql
supabase/migrations/003_storage.sql
supabase/migrations/004_fixes.sql
supabase/migrations/005_phase0.sql
supabase/migrations/006_phase1.sql
supabase/migrations/007_phase3.sql
supabase/migrations/008_phase2.sql
supabase/migrations/009_transfer_stock.sql
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin panel is at [http://localhost:3000/admin](http://localhost:3000/admin).

---

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Public store routes
│   │   ├── shop/         # Product listing & category pages
│   │   ├── cart/         # Cart page
│   │   ├── checkout/     # Checkout & Stripe integration
│   │   ├── repairs/      # Repair services, booking, quote
│   │   ├── about/
│   │   └── contact/
│   ├── admin/            # Protected admin panel
│   │   ├── (protected)/  # Dashboard, products, orders, stock…
│   │   └── login/
│   └── api/              # API routes (Stripe webhooks, auth, etc.)
├── components/
│   ├── admin/            # Admin-specific components
│   ├── layout/           # Header, Footer, CartDrawer
│   ├── repairs/          # BookingForm, QuoteForm
│   ├── shop/             # ProductCard, ProductDetail
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── supabase/         # Supabase client (browser + server)
│   ├── stripe.ts
│   ├── constants.ts      # Shipping cost, free shipping threshold
│   └── utils/
├── store/
│   └── cart.ts           # Zustand cart store
└── types/
    └── database.ts       # Generated Supabase types
supabase/
└── migrations/           # SQL migration files
```

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Shipping

- Free shipping on orders **€50 and above**
- Standard shipping: **€3.99**
- Orders placed before 19:00 ship next day

## Repairs

All repairs include a **90-day warranty** on parts and labour. Supported brands include iPhone, Samsung, Xiaomi, Huawei, and more.