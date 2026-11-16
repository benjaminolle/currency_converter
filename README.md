# Exchange Rate and Currency Converter

A web app for converting amounts between currencies and supported cryptocurrencies. It uses Frankfurter reference rates and displays currency flags and crypto artwork when available.

> **Rate note:** Frankfurter provides reference rates, not real-time transaction quotes. Rates are cached by the app and may not reflect the rate or fees offered by a money-transfer provider.

## Features

- Convert in either direction by editing either amount.
- Select currencies and supported crypto assets from a searchable list.
- View the rate date provided by Frankfurter.
- Manually refresh the selected pair's rate.
- Display currency flags and crypto artwork, with a symbol fallback when artwork is unavailable.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Currency and rate data | [Frankfurter API](https://www.frankfurter.dev/) |
| Currency flags | [FlagsAPI](https://flagsapi.com/) |
| Crypto artwork | [Logo.dev](https://www.logo.dev/) (optional) |

## Live Url
https://currency-converter-one-fawn.vercel.app/

## Requirements

- Node.js 20.9 or later
- pnpm

## Getting started

Install dependencies:

```bash
pnpm install
```

Optionally, add a Logo.dev token to `.env.local` to enable crypto artwork:

```env
LOGO_DEV_TOKEN=your-token
```

Without a token, the app uses the currency symbol as a fallback for crypto artwork.

Start the development server:

```bash
pnpm dev
```

## Available scripts

```bash
pnpm dev     # Start the development server
pnpm build   # Create a production build
pnpm start   # Run the production server
pnpm lint    # Run ESLint
```
