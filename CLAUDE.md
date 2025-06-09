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

- `/feature <feature-name>` - Create a PRD for a new feature through guided questions (one question at a time), create a new git branch with the same name, and ask if you want to set up a unit test for the feature
- `/update-feature <feature-name>` - Update an existing feature PRD by asking what to add/modify and updating the documentation. If there is a test connected to this feature, update the test if needed

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

## Library Integration Guidelines

⚠️ **MANDATORY: Always Use Context7 for New Libraries** ⚠️

Before installing, configuring, or using ANY new library or framework:

**REQUIRED WORKFLOW:**
1. **MUST** use `mcp__context7__resolve-library-id` to find the correct library
2. **MUST** use `mcp__context7__get-library-docs` to get current documentation  
3. **MUST** follow the Context7 documentation patterns exactly
4. **NEVER** rely on general knowledge or outdated information

**This is MANDATORY - not optional. Context7 prevents:**
- Using deprecated packages or methods
- Following outdated installation instructions
- Breaking changes from version mismatches
- Wasted debugging time from old tutorials

**Example Commands I Must Use:**
```
// STEP 1: Always resolve library ID first
mcp__context7__resolve-library-id "library-name"

// STEP 2: Get current documentation  
mcp__context7__get-library-docs "/org/project" 
topic: "installation and basic usage"
```

**Enforcement Rules:**
- If I suggest installing a library WITHOUT using Context7 first, STOP ME
- If I provide code examples without Context7 docs, REMIND ME to check Context7
- If I reference general knowledge about a library, REQUIRE Context7 verification

**Why This is Critical:**
- Libraries change rapidly with breaking changes
- General knowledge becomes outdated quickly
- Context7 provides real, tested, current documentation
- Saves hours of debugging from deprecated methods