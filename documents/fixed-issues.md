# Fixed Issues

This file summarizes the implementation issues and bugs that were resolved during the project work.

## 1. Friends Data Layer Was Missing

- Status: fixed
- Area: `lib/friends.ts`

### Fix
- Added the shared friends data-access module.
- Added typed friendship/profile exports.
- Added relationship map helpers and request mutation helpers.

## 2. Friends State Hook Was Missing

- Status: fixed
- Area: `hooks/useFriends.ts`

### Fix
- Added a single client-side hook for:
  - current user loading
  - friendships and incoming requests
  - debounced search
  - mutation pending state
  - toast state

## 3. Relationship And Search UI Were Missing

- Status: fixed
- Area:
  - `components/friends/RelationshipButton.tsx`
  - `components/friends/UserSearch.tsx`
  - `components/friends/IncomingRequests.tsx`

### Fix
- Added the state-based relationship action button.
- Added searchable user results UI.
- Added incoming request list UI with accept/decline actions.

## 4. Starter Homepage And Shell Needed Replacement

- Status: fixed
- Area:
  - `app/page.tsx`
  - `app/layout.tsx`
  - `app/globals.css`

### Fix
- Replaced the starter experience with a product landing page and branded shell.

## 5. Availability Experience Was Missing

- Status: fixed
- Area:
  - `app/(protected)/availability/page.tsx`
  - `hooks/useAvailability.ts`
  - `lib/availability.ts`
  - `lib/availability-view.ts`
  - `components/availability/*`

### Fix
- Added the availability page, state hook, summary, grid, and overlap panel.

## 6. Supabase SSR Auth Utilities Were Missing

- Status: fixed
- Area:
  - `lib/supabase/client.ts`
  - `lib/supabase/server.ts`
  - `middleware.ts`

### Fix
- Installed `@supabase/ssr`.
- Added browser and server Supabase clients.
- Added middleware session refresh and route protection.

## 7. Login, Signup, And Logout UI Were Missing

- Status: fixed
- Area:
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
  - `components/auth/ShellAuthControls.tsx`
  - `lib/auth.ts`

### Fix
- Added login and signup flows.
- Added logout in the shell.
- Added username validation and duplicate username handling.
- Added support for the confirm-email flow where no session is returned immediately.

## 8. Auth User Without Profile Row Was Not Handled

- Status: fixed
- Area:
  - `app/(protected)/layout.tsx`
  - `app/onboarding/page.tsx`
  - `components/auth/OnboardingForm.tsx`

### Fix
- Added a protected layout profile check.
- Redirects authenticated users without a `profiles` row to `/onboarding`.
- Added onboarding form to restore the missing profile row.

## 9. Protected Pages Were Not Centralized Under A Guarded Layout

- Status: fixed
- Area:
  - `app/(protected)/layout.tsx`
  - `app/(protected)/friends/page.tsx`
  - `app/(protected)/availability/page.tsx`

### Fix
- Moved protected routes under a shared guarded layout.
- Removed the old unguarded route files.

## 10. Avatar Components Triggered ESLint Warnings

- Status: fixed
- Area:
  - `components/friends/UserSearch.tsx`
  - `components/friends/IncomingRequests.tsx`
  - `components/availability/FriendOverlapPanel.tsx`
  - `next.config.ts`

### Fix
- Replaced direct `<img>` usage with `next/image`.
- Added Supabase remote image support in `next.config.ts`.

## 11. Tailwind Suggestion Warnings Needed Cleanup

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

### Fix
- Replaced several arbitrary utility values with canonical Tailwind utilities.

## 12. Form Handler Type Hints Needed Cleanup

- Status: fixed
- Area:
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
  - `components/auth/OnboardingForm.tsx`

### Fix
- Switched submit handlers to `FormEventHandler<HTMLFormElement>`.

## 13. Unused Starter And Planning Files Remained In The Repo

- Status: fixed
- Area:
  - `public/`
  - old generated planning docs

### Fix
- Removed unused starter SVGs.
- Removed the placeholder `README.md`.
- Removed obsolete planning documents.

## 14. Current Outcome

- Status: fixed / verified locally

### Result
- `npm run check` passes.
- `npm run lint` passes.
- The current codebase is clean for active files.
