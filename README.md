# Mass Distribution E-Commerce Platform

A B2B e-commerce platform built for **Mass Distribution** — an FMCG distribution company serving Egypt's HORECA (Hotels, Restaurants, and Cafés) sector. The platform allows wholesale buyers to browse 237+ products across 9 top brands (Wadifood, Knorr, Heinz, Savola, Pepsi, Juhayna, Lamar, El Doha, Nestle), add items to a cart, and place orders with ex-VAT credit pricing in EGP. Orders are persisted in Supabase and visible in a live admin dashboard. Fully bilingual (English + Arabic).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) — App Router, TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Font | Inter (Google Fonts) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) |
| Deployment | [Vercel](https://vercel.com/) |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, stats, category grid, featured products, brand strip |
| `/products` | Full catalog with live search and filter by brand / category |
| `/products/[id]` | Single product — bilingual name, per-piece and per-carton pricing, add to cart |
| `/cart` | Cart with quantity controls and order summary |
| `/checkout` | Order form — saves customer + order + items to Supabase |
| `/account` | Customer portal — live order history from Supabase |
| `/admin` | Admin dashboard — live orders, customers, catalog stats |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mass-distribution-ecommerce.git
cd mass-distribution-ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Supabase credentials (see **Environment Variables** below).

### 4. Set up the database

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor → New Query
2. Paste the full contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Click **Run**

This creates all 5 tables with RLS policies and indexes.

### 5. Seed the product catalog

```bash
npm run seed
```

Populates all 237 products from `lib/products.ts` into Supabase. Requires `SUPABASE_SERVICE_KEY` in `.env.local`.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Seed only | Service role key — for `npm run seed` only, never expose publicly |

Copy `.env.example` to `.env.local` and fill in the values. Find your keys in Supabase Dashboard → Settings → API.

## Database Schema

Five tables — see [`supabase/schema.sql`](supabase/schema.sql) for the full definition with RLS policies:

| Table | Purpose |
|-------|---------|
| `products` | Full product catalog (237 SKUs seeded from `lib/products.ts`) |
| `customers` | Auto-created on first order placement |
| `orders` | One row per order; auto-generates `order_number` like `ORD-0001` |
| `order_items` | Line items with denormalized product name for historical durability |
| `price_lists` | Custom segment pricing (hotel / restaurant / café / catering) |

## Project Structure

```
shop/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── products/           # Catalog + single product
│   ├── cart/               # Cart
│   ├── checkout/           # Checkout → saves to Supabase
│   ├── account/            # Customer portal (live Supabase data)
│   └── admin/              # Admin dashboard (live Supabase data)
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ProductImage.tsx    # Smart fallback: product image → brand logo → placeholder
├── lib/
│   ├── products.ts         # Static catalog of 237 SKUs
│   ├── supabase.ts         # Supabase client singleton
│   ├── database.types.ts   # TypeScript types for all tables
│   └── cartStore.tsx       # Cart state (React Context)
├── public/
│   ├── products/           # Product images by SKU id
│   └── brands/             # Brand logos
├── scripts/
│   └── seed-products.ts    # Seeds `products` table from lib/products.ts
└── supabase/
    └── schema.sql          # Full schema + RLS policies (run once in SQL Editor)
```

## Deploying to Vercel

```bash
npx vercel --prod
```

Add environment variables via the Vercel dashboard (Project → Settings → Environment Variables) or CLI:

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```
