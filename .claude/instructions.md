# Takeout - Development Instructions

## Setup

### Prerequisites
- Node.js 18+
- pnpm 10+
- Clerk account (https://clerk.com)
- Convex account (https://convex.dev)

### Environment Variables

Create a `.env` file with:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk JWT Issuer (for Convex auth)
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev
```

### Convex Setup

1. Create a Convex project at https://dashboard.convex.dev
2. Copy the deployment URL to `NEXT_PUBLIC_CONVEX_URL`
3. Configure Clerk JWT template in Convex dashboard:
   - Go to Settings > Auth
   - Add Clerk as provider
   - Set the issuer domain

### Running Locally

```bash
# Install dependencies
pnpm install

# Start Convex dev server (in one terminal)
npx convex dev

# Start Next.js (in another terminal)
pnpm dev:next

# Or run both together
pnpm dev
```

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- Use `#/` path alias for imports from `src/`
- Components use named exports
- Prefer composition over inheritance

### UI Components
- Use shadcn/ui components from `#/components/ui/`
- Don't add emojis to UI
- Don't use gradient backgrounds
- Keep copy minimal and slightly sarcastic

### Convex
- All database operations go through Convex mutations/queries
- User identity checked via `ctx.auth.getUserIdentity()`
- Use indexes for efficient queries

### Adding Features

1. **New Convex function**: Add to `convex/*.ts`
2. **New UI component**: Add to `src/components/`
3. **New route**: Add to `src/app/(dashboard)/`

### Common Tasks

#### Add a new category type
1. Update `convex/projects.ts` DEFAULT_CATEGORIES
2. Update review mode logic if needed

#### Modify takeout content parsing
1. Edit `src/lib/parse-content.ts`
2. Update `ContentRenderer` component

#### Change PWA settings
1. Edit `src/app/manifest.ts`
2. Update `public/sw.js` if caching changes

## Deployment

### Vercel (Recommended)

1. Connect repo to Vercel
2. Add environment variables
3. Deploy

### Convex

```bash
npx convex deploy
```

## Troubleshooting

### "Not authenticated" errors
- Check Clerk keys in `.env`
- Ensure middleware is protecting routes correctly
- Verify Convex auth config

### Convex queries returning undefined
- Run `npx convex dev` to sync schema
- Check for typos in query/mutation names
- Verify indexes exist for filtered queries

### PWA not installing
- Must be served over HTTPS (or localhost)
- Check manifest.ts exports valid manifest
- Verify icons exist in public/icons/

## Testing

Currently no automated tests. Manual testing checklist:

- [ ] Sign up / sign in works
- [ ] Can create projects
- [ ] Can add takeouts to categories
- [ ] Can move takeouts between categories
- [ ] Can edit/delete takeouts
- [ ] Review mode swipe works
- [ ] Mobile layout works
- [ ] PWA installs on mobile
