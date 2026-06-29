# Fin OCR Frontend

A modern React + Vite frontend for a financial OCR application with invoice/receipt upload, expense extraction, analytics, and user authentication.

## Features

- Login / signup flow
- OCR receipt upload and scanning
- Expense dashboard with timeline and analytics
- Transaction details, editing, and history views
- Theme support and responsive layout
- Uses a backend API for OCR and expense management

## Tech stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Radix UI components
- Auth0 authentication
- Sonner notifications

## Getting started

### Prerequisites

- Node.js 18+ or compatible
- pnpm (recommended)
- A backend API endpoint for `VITE_API_URL` if you want to connect to a live service

### Install

```bash
cd fin_ocr_frontend
pnpm install
```

### Run locally

```bash
pnpm dev
```

Open the app at `http://localhost:5173` by default.

### Build for production

```bash
pnpm build
```

## Environment

The app reads the following environment variable:

- `VITE_API_URL` — API base URL for OCR and expense endpoints

If not provided, it defaults to `https://finocr.onrender.com`.

## Project structure

- `src/app` — application pages, routes, layout, and shared components
- `src/app/components` — reusable UI and layout components
- `src/app/context` — authentication and theme providers
- `src/app/pages` — route pages such as login, dashboard, OCR entry, history, result, and settings
- `src/app/styles` — CSS and theme files

## Routes

- `/` — login page
- `/signup` — signup page
- `/dashboard` — expense dashboard
- `/ocr-entry` — OCR upload and manual entry page
- `/history` — expense history
- `/result/:id` — single expense result/details
- `/settings` — user settings

## Notes

- The frontend expects a backend API that exposes OCR scanning and expense management endpoints under `/api/ocr` and `/api/expenses`.
- The UI uses optional peer dependencies for React and React DOM, so ensure these are installed in your workspace.

## License

This repository does not include a license file. Add one if you intend to share or publish this project.
