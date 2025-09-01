# Project Overview
A full-featured grocery list management system that allows users to:

Create and manage multiple shopping lists
Track grocery items with priorities and statuses
View history of item status changes
Filter and sort grocery items

# Technical Stack

## Backend
Framework: NestJS
Language: TypeScript
Database: PostgreSQL
ORM: Prisma
Containerization: Docker

## Frontend
Framework: Next.js
Language: TypeScript
Authentication: OAuth2 (GitHub)
UI Library: Shadcn UI
Routing: Next.js App Router


# Setup & Deployment

# Start database
docker compose up db -d

# Build and start services
docker compose build api-prod
docker compose build migrate
docker compose run --rm migrate
docker compose up api-prod -d
docker compose up app -d

# Additional features
## backend
ShoppingList Table - i thougt users would like to have multiple shopping lists
Pagination

## frontend
Optimistic updates
Infinite scroll


# System Architecture

                        ┌───────────────────────────┐
                        │        GitHub OAuth       │
                        │  (Authorization Server)   │
                        └─────────────▲─────────────┘
                                      │
                    [1] OAuth Flow    │
                                      │
         ┌────────────────────────────┴───────────────────────────┐
         │                 Frontend (Next.js 15)                  │
         │--------------------------------------------------------│
         │  - UI Components (Client)                              │
         │  - Server Components (secure logic)                    │
         │  - Server Actions (exchange code → access_token)       │
         │  - Store access_token securely (server-side)           │
         └───────────────┬───────────────────────────────┬────────┘
                         │                               │
      [2] Secure Token   │                               │  [3] API Call
      Exchange & Storage │                               │  with access_token
                         ▼                               ▼
                ┌────────────────┐                ┌─────────────────────────┐
                │ GitHub Access  │                │      Backend API        │
                │     Token      │                └───────────▲─────────────┘
                └────────────────┘                            │
                                                              │
                                                              │ [4] Token Verification
                                                              │
                                           ┌──────────────────┴──────────────────┐
                                           │       Authorization                 │
                                           │-------------------------------------│
                                           │ - Validates GitHub access_token     │
                                           │ - Identifies GitHub user            │
                                           │ - Grants / denies request           │
                                           └─────────────────────────────────────┘


