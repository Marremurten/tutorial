# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js 15 project using the App Router with TypeScript and Tailwind CSS v4.

**Key Structure:**
- `src/app/` - App Router pages and layouts
- `src/app/layout.tsx` - Root layout with Geist fonts
- `src/app/page.tsx` - Homepage
- `@/*` path alias maps to `src/*`

**Tech Stack:**
- Next.js 15 with App Router
- React 19
- TypeScript with strict mode
- Tailwind CSS v4 
- ESLint with Next.js config
- Geist fonts (Sans and Mono variants)

The project uses Turbopack for faster development builds and follows Next.js App Router conventions.