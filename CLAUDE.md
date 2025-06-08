# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Testing Commands

- `npm test` - Run all unit tests with Jest
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Run tests with coverage report

## Custom Commands

- `/feature <feature-name>` - Create a PRD for a new feature through guided questions and create a new git branch with the same name
- `/update-feature <feature-name>` - Update an existing feature PRD by asking what to add/modify and updating the documentation

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
- Jest + React Testing Library for unit testing
- MongoDB with Mongoose for data persistence
- Google Maps Places API for location services

The project uses Turbopack for faster development builds and follows Next.js App Router conventions.

## Testing Framework

The project uses Jest with React Testing Library for comprehensive unit testing:

**Test Configuration:**
- `jest.config.js` - Jest configuration with Next.js integration
- `jest.setup.js` - Global test setup and mocks
- Tests located in `src/components/__tests__/` directories

**Key Components Tested:**
- GooglePlacesAutocomplete - 20 comprehensive unit tests covering:
  * Component rendering states and props
  * Google Maps API loading and initialization
  * Stockholm bounds validation (lat: 59.17-59.5, lng: 17.8-18.4)
  * Place selection and error handling
  * User interactions and cleanup

**Testing Best Practices:**
- Mock external dependencies (Google Maps API, GoogleMapsLoader)
- Test component behavior, not implementation details
- Cover edge cases and error scenarios
- Ensure proper cleanup and memory management