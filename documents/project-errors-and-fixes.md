# Project Errors And Fixes

This document records the main errors, bugs, and related fixes encountered while building the `social-availability` project.

It covers:
- frontend implementation issues
- auth and Supabase integration issues
- routing/layout issues
- lint/typecheck/editor problems
- environment-specific blockers discovered during testing

## 1. Missing Friends Data Layer

- Status: fixed
- Area: `lib/friends.ts`

### Symptom
- The friends workflow needed a single typed data-access layer, but the project did not yet expose a framework-agnostic module for friendship queries and relationship state helpers.

### Fix
- Created `lib/friends.ts`.
- Added exported types:
  - `Profile`
  - `Friendship`
  - `FriendshipStatus`
  - `IncomingRequest`
  - `RelationshipState`
- Added exported functions:
  - `searchProfiles`
  - `getMyFriendships`
  - `getIncomingRequests`
  - `sendFriendRequest`
  - `acceptFriendRequest`
  - `declineFriendRequest`
  - `buildRelationshipMap`
  - `getRelationship`

### Notes
- Queries throw on error.
- Error handling was intentionally left to the hook/UI layer.

## 2. Missing Friends State Management

- Status: fixed
- Area: `hooks/useFriends.ts`

### Symptom
- The friends UI needed one client-side state owner for:
  - current user loading
  - friendship and incoming request loading
  - debounced profile search
  - mutation state
  - toast state

### Fix
- Created `hooks/useFriends.ts`.
- The hook now:
  - loads the current user on mount
  - loads friendships and incoming requests in parallel
  - debounces search by 300ms
  - ignores stale search responses
  - exposes per-target pending state
  - wraps mutations in `try/catch`
  - pushes success/error toasts
  - auto-dismisses toasts after 4 seconds

## 3. Missing Friends UI Components

- Status: fixed
- Area:
  - `components/friends/RelationshipButton.tsx`
  - `components/friends/UserSearch.tsx`
  - `components/friends/IncomingRequests.tsx`

### Symptom
- The friends workflow needed dedicated presentational components for:
  - state-based relationship actions
  - user search and results
  - incoming request management

### Fix
- Built all three client components.
- Added exhaustive relationship-state rendering.
- Added avatar fallbacks, loading states, and empty states.
- Kept the components props-driven with no inline data-fetching logic.

## 4. Default Starter UI Still Present

- Status: fixed
- Area:
  - `app/page.tsx`
  - `app/layout.tsx`
  - `app/globals.css`

### Symptom
- The app still showed the default starter feel instead of a real product UI.

### Fix
- Replaced the starter page with a product landing page.
- Added a branded app shell with navigation.
- Added styling foundations and improved page structure.

## 5. Missing Availability UI

- Status: fixed
- Area:
  - `app/(protected)/availability/page.tsx`
  - `hooks/useAvailability.ts`
  - `lib/availability.ts`
  - `lib/availability-view.ts`
  - `components/availability/*`

### Symptom
- The product concept included availability planning, but the app did not yet present an actual availability workflow.

### Fix
- Built the availability page, state hook, helpers, grid, summary, and friend-overlap panel.

## 6. Missing SSR Auth Plumbing

- Status: fixed
- Area:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `middleware.ts`

### Symptom
- Protected routes were not properly backed by SSR-aware Supabase auth utilities.
- Signed-out users could reach protected routes without middleware enforcement.

### Fix
- Installed `@supabase/ssr`.
- Replaced the browser helper with `createBrowserClient`.
- Added a server helper using `createServerClient`.
- Added `middleware.ts` to refresh session state and redirect signed-out users away from protected routes.

### Result
- `/friends` and other protected routes now redirect to `/login` when the user is signed out.

## 7. Auth Flow Environment Blockers During Live Testing

- Status: environment issue found during testing
- Area:
  - Supabase Auth configuration
  - `/signup`
  - `/login`

### Symptom
- A live browser pass did not complete the full auth flow.
- Observed messages included:
  - `Anonymous sign-ins are disabled`
  - `email rate limit exceeded`
  - `Invalid login credentials`

### Likely Cause
- Supabase project auth settings and rate limiting did not match the intended local development setup at the time of testing.

### Fix / Resolution
- Recommended using the correct Supabase email auth configuration for development.
- User later indicated this had already been addressed.

### Notes
- This was not treated as an app-code compile failure.
- It was a live-environment blocker discovered while testing the real auth flow.

## 8. Missing Login, Signup, And Logout UI

- Status: fixed
- Area:
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
  - `components/auth/ShellAuthControls.tsx`
  - `lib/auth.ts`

### Symptom
- The app needed:
  - signup with email, password, username, and display name
  - login with email and password
  - logout from the shell
  - proper handling for username validation and duplicate usernames

### Fix
- Built login and signup pages.
- Added client-side username validation.
- Added profile row creation after signup.
- Added `username taken` handling for unique violations.
- Added a logout control to the existing shell.
- Supported the email-confirmation case where no session is returned immediately.

## 9. Auth User Without Profile Row

- Status: fixed
- Area:
  - `app/(protected)/layout.tsx`
  - `app/onboarding/page.tsx`
  - `components/auth/OnboardingForm.tsx`

### Symptom
- An authenticated user could exist in `auth.users` without a matching row in `profiles`.
- That would break assumptions inside the app.

### Fix
- Added a server-side protected layout check.
- If the user is authenticated but has no `profiles` row, the app redirects to `/onboarding`.
- Added onboarding form to create the missing profile row and restore access.

## 10. Protected Routes Originally Lived In Unguarded Pages

- Status: fixed
- Area:
  - moved routes into `app/(protected)/...`

### Symptom
- Friends and availability pages originally existed outside a shared protected layout.
- This made route guarding less centralized and harder to reason about.

### Fix
- Added `app/(protected)/layout.tsx`.
- Moved:
  - `/friends` to `app/(protected)/friends/page.tsx`
  - `/availability` to `app/(protected)/availability/page.tsx`
- Deleted the old unguarded route files.

## 11. Stale IDE Diagnostics After Route Move

- Status: not a code bug, editor state issue
- Area:
  - deleted `app/friends/page.tsx`

### Symptom
- VS Code diagnostics kept showing TypeScript errors for `app/friends/page.tsx` after that file had already been deleted.
- Errors included missing imports and implicit `any` warnings.

### Root Cause
- The editor kept stale diagnostics for the removed file.

### Verification
- `npm run check` passed.
- `npm run lint` passed.
- The errors did not correspond to any live file in the project.

### Fix
- No source-code change was required for the stale deleted-file errors.
- Recommended resolution:
  - reload the IDE window
  - or restart the TypeScript server

## 12. Avatar Image Warnings From ESLint

- Status: fixed
- Area:
  - `components/friends/UserSearch.tsx`
  - `components/friends/IncomingRequests.tsx`
  - `components/availability/FriendOverlapPanel.tsx`
  - `next.config.ts`

### Symptom
- ESLint warned about direct `<img>` usage in avatar components.

### Fix
- Replaced avatar `<img>` tags with `next/image`.
- Added Supabase remote image configuration in `next.config.ts`.

### Result
- Lint warnings were removed without changing the UI behavior.

## 13. Tailwind Simplification Warnings

- Status: fixed
- Area:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `components/availability/AvailabilityGrid.tsx`
  - `components/availability/FriendOverlapPanel.tsx`
  - `components/auth/AuthCard.tsx`
  - `components/auth/OnboardingForm.tsx`
  - `app/login/page.tsx`
  - `app/signup/page.tsx`

### Symptom
- The IDE reported non-blocking Tailwind warnings suggesting that several arbitrary values could be replaced by canonical utilities.

### Fix
- Simplified classes such as:
  - `rounded-[2rem]` -> `rounded-4xl`
  - `dark:bg-white/[0.03]` -> `dark:bg-white/3`
  - `bg-[var(--background)]` -> `bg-background`
  - `min-w-[720px]` -> `min-w-180`
  - `max-w-[90rem]` -> `max-w-360`

### Result
- Live-file Tailwind suggestion warnings were cleared.

## 14. Deprecated Form Handler Type Hints

- Status: fixed
- Area:
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
  - `components/auth/OnboardingForm.tsx`

### Symptom
- The IDE reported hints around `React.FormEvent<HTMLFormElement>` usage in form submit handlers.

### Fix
- Switched submit handlers to `FormEventHandler<HTMLFormElement>`.

## 15. Unused Starter And Planning Files

- Status: fixed
- Area:
  - `public/`
  - old planning docs

### Symptom
- The repo still contained unused starter assets and generated planning files that were not needed for the running app.

### Fix
- Removed unused SVG starter assets.
- Removed placeholder `README.md`.
- Removed obsolete generated planning docs.

## 16. Current Verification State

- Status: current

### Verified
- `npm run check` passes.
- `npm run lint` passes.
- Protected route structure is in place.
- Friends, availability, auth pages, and onboarding UI are implemented.

### Remaining Non-Code Note
- If the editor still shows diagnostics for deleted `app/friends/page.tsx`, that is stale IDE state rather than an active source bug.

## 17. Suggested Ongoing Process

For future work, use this format whenever a bug or error appears:

```md
## Short Issue Title

- Status: open | fixed | environment issue
- Area: file or subsystem

### Symptom
- What broke

### Root Cause
- Why it happened

### Fix
- What changed

### Verification
- How it was confirmed
```
