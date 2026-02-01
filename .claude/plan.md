# Takeout - Project Plan

## Overview

Takeout is a minimal PWA for project note-taking with a kanban layout. Users can create projects, add notes (called "takeouts") to categorized columns, and review them using a Tinder-style swipe interface.

## Tech Stack

- Frontend: Next.js 15 (App Router) + React 19
- Styling: Tailwind CSS 4 + shadcn/ui (new-york style, zinc base)
- Authentication: Clerk
- Database: Convex
- PWA: Custom manifest + service worker

## Architecture

### Database Schema (Convex)

Users table:
- clerkId: string
- email: string
- name: optional string

Projects table:
- userId: Id of users
- name: string
- description: optional string
- createdAt: number
- updatedAt: number

Categories table:
- projectId: Id of projects
- name: string
- order: number
- isDefault: boolean

Takeouts table:
- projectId: Id of projects
- categoryId: Id of categories
- content: string
- createdAt: number
- updatedAt: number
- order: number
- tags: array of strings
- mentions: array of takeout Ids

### Default Categories

Each project is created with three default categories:
1. Later (order: 0)
2. In progress (order: 1)
3. Done (order: 2)

### Routes

- / : Redirects to /projects or /sign-in
- /sign-in : Clerk sign-in
- /sign-up : Clerk sign-up
- /projects : Projects list
- /projects/[id] : Project kanban view
- /projects/[id]/review : Swipe review mode

## Features

### Kanban Board
- Desktop: 3-column grid layout
- Mobile: Tab-based navigation between categories
- Add/edit/delete takeouts
- Move takeouts between categories

### Takeout Editor
- Simple textarea-based input
- Auto-detects and highlights:
  - URLs (clickable links)
  - Hashtags (extracted as tags)
  - Mentions (stored for future linking)

### Review Mode
- Tinder-style swipe cards
- Swipe right = move to Done
- Swipe left = move to Later
- Select which category to review

### PWA
- Installable on mobile/desktop
- Service worker for offline static assets
- Custom app icons (SVG)

## UI Guidelines

### Visual Style
- Zinc color palette
- No gradients
- No emojis
- Subtle borders, generous whitespace

### Copy Tone
Sarcastic but professional. Examples:
- Empty state: "Nothing here. Shocking."
- Add takeout: "Drop a thought"
- Review mode: "Sort this mess"
- All done: "That wasn't so hard, was it?"

## Getting Started

1. Clone the repository
2. Copy .env.example to .env and fill in Clerk and Convex keys
3. Run pnpm install
4. Run npx convex dev to start Convex
5. Run pnpm dev to start Next.js
