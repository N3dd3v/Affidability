# Testing Notes

This file records the main verification steps, observed behavior, and follow-up testing guidance for the project.

## Local Validation Performed

### Type Checking
- Command: `npm run check`
- Result: pass

### Linting
- Command: `npm run lint`
- Result: pass

### Route And UI Validation
- Verified local routes:
  - `/`
  - `/friends`
  - `/availability`
  - `/login`
  - `/signup`
  - `/onboarding`

### Shell And Layout Validation
- Confirmed the global shell exists.
- Confirmed navigation links exist.
- Confirmed the logout control was added to the shell rather than rebuilding the shell.

## Auth Testing Notes

### Intended Flow
- Sign up with:
  - email
  - password
  - `@username`
  - display name
- Insert a `profiles` row after signup.
- Land in the app.
- Refresh and remain signed in.
- Log out.
- Log back in.

### Environment Note
- During one live browser pass, Supabase returned:
  - `Anonymous sign-ins are disabled`
  - `email rate limit exceeded`
  - `Invalid login credentials`

### Interpretation
- Those messages pointed to live Supabase environment/config behavior, not a local compile or lint failure.

### Recommended Re-Test
- Use a fresh account.
- Confirm the `profiles` row exists in Supabase after signup.
- Confirm refresh preserves the session.
- Confirm logout and login both work as expected.

## Middleware And Route Protection Notes

### Verified Behavior
- Signed-out users are redirected away from protected routes.
- Public routes remain accessible:
  - `/`
  - `/login`
  - `/signup`

### Relevant Files
- `middleware.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

## Onboarding Guard Notes

### Intended Recovery Flow
- If a user is authenticated but has no `profiles` row, the protected layout should redirect them to `/onboarding`.
- Submitting the onboarding form should create the missing profile row and restore access.

### Recommended Manual Test
1. Sign in with a valid user.
2. Delete that user's row from `profiles` in Supabase.
3. Refresh the app.
4. Confirm redirect to `/onboarding`.
5. Claim a username.
6. Confirm access to the protected app is restored.

## Editor Diagnostics Notes

### Observed Issue
- VS Code or the TypeScript server may keep stale diagnostics for deleted route files, especially after moving `app/friends/page.tsx` into `app/(protected)/friends/page.tsx`.

### Verification
- `npm run check` passed even when the stale editor error remained visible.
- `npm run lint` passed as well.
- The remaining diagnostics were isolated to the deleted `app/friends/page.tsx` path rather than the live protected route file.

### Recommended Cleanup
- Reload the IDE window.
- Or restart the TypeScript server.

## Image And Styling Notes

### Image Handling
- Avatar components now use `next/image`.
- Supabase remote image support was added in `next.config.ts`.

### Tailwind Cleanup
- Non-blocking Tailwind suggestion warnings were cleaned up in active files.

## Current Confidence Level

- Code quality confidence: good
- Local type/lint confidence: good
- Live Supabase environment confidence: depends on real project configuration
- Highest-value remaining manual checks:
  - full signup/login cycle
  - onboarding recovery
  - live profile row creation and persistence
