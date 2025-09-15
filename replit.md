# DPWH Analytics Dashboard

## Overview

The DPWH Analytics Dashboard is a comprehensive web application for the Department of Public Works and Highways Philippines. It provides interactive analytics and data visualization for infrastructure projects spanning 2016-2025. The dashboard features dynamic filtering capabilities, dual visualization modes (analytics charts and tabular data), secure admin authentication, and data management functionality. Built with a modern React frontend and Express backend, it emphasizes government-standard design principles with accessibility and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system following government dashboard conventions
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Development Server**: Custom Vite integration for hot module replacement
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple

### Data Storage
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with schema-first approach for type safety
- **Session Storage**: PostgreSQL sessions for admin authentication
- **Schema**: User management system with username/password authentication

### Design System
- **Color Palette**: Government blue primary (#0066CC), Philippine green success states, neutral backgrounds
- **Typography**: Inter font family with system fallbacks
- **Component Library**: Custom components following shadcn/ui patterns
- **Responsive Design**: Mobile-first approach with collapsible sidebars
- **Theme Support**: Light/dark mode with CSS custom properties

### Key Features
- **Dual View System**: Analytics dashboard with charts and detailed table view
- **Advanced Filtering**: Multi-criteria filtering by region, office, contractor, status, year, and location
- **Admin Panel**: Secure authentication with data upload capabilities
- **Interactive Charts**: Recharts integration for data visualization
- **Mobile Responsive**: Adaptive layout for all device sizes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless client for database connections
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **recharts**: Chart library for data visualization components

### UI Framework
- **@radix-ui/***: Comprehensive set of accessible UI primitives (accordion, dialog, dropdown, etc.)
- **@hookform/resolvers**: Form validation integration
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and introspection tools

### Session & Security
- **connect-pg-simple**: PostgreSQL session store for Express
- **express-session**: Session middleware (implied dependency)

### Utilities
- **date-fns**: Modern date utility library
- **clsx & tailwind-merge**: Utility for conditional CSS classes
- **zod**: TypeScript-first schema validation (via drizzle-zod)

The application uses a serverless-ready architecture suitable for deployment on platforms like Replit, with environment-based configuration for database connections and development tooling.