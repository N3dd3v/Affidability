# Open Issues

This file tracks issues that are still open, environment-dependent, or not yet fully verified in a live end-to-end flow.

## 1. Supabase Auth Environment Blockers

- Status: environment issue
- Area:
  - Supabase Auth settings
  - `/signup`
  - `/login`

### Symptom
- A live browser test previously failed to complete the full auth flow.
- Observed messages included:
  - `Anonymous sign-ins are disabled`
  - `email rate limit exceeded`
  - `Invalid login credentials`

### Likely Cause
- Supabase project auth configuration and rate limits did not match the expected local development setup during testing.

### Current Status
- The user indicated this was already addressed in Supabase.
- The code path remains implemented, but the full flow should be re-verified against the live project.

### Suggested Verification
- Sign up with a fresh account.
- Confirm the `profiles` row is created.
- Refresh and confirm the session persists.
- Log out and log back in.

## 2. Stale IDE Diagnostics For Deleted Route File

- Status: editor state issue
- Area:
  - deleted `app/friends/page.tsx`

### Symptom
- The IDE may still show TypeScript errors for `app/friends/page.tsx` even though that file was removed after moving the route into `app/(protected)/friends/page.tsx`.
- The current stale errors specifically mention missing imports such as:
  - `@/components/friends/IncomingRequests`
  - `@/components/friends/UserSearch`
  - `@/components/ui/ToastStack`
  - `@/hooks/useFriends`
- It may also report implicit `any` errors from the deleted file's old callback parameters.

### Root Cause
- The TypeScript server or editor diagnostics cache can keep stale errors for deleted files.

### Current Status
- This is not a real compile or lint failure.
- `npm run check` passes.
- `npm run lint` passes.
- Active files do not show matching live errors.

### Suggested Fix
- Reload the editor window.
- Or restart the TypeScript server.

## 3. End-To-End Onboarding Recovery Still Needs Live Re-Verification

- Status: verification pending
- Area:
  - `app/(protected)/layout.tsx`
  - `app/onboarding/page.tsx`
  - `components/auth/OnboardingForm.tsx`

### Symptom
- The onboarding guard is implemented for the auth-user-without-profile edge case, but it should still be re-run against the live Supabase project after manually deleting a profile row.

### Expected Behavior
- Delete a user's `profiles` row manually in Supabase.
- Refresh the app.
- The authenticated user should be redirected to `/onboarding`.
- Claiming a username should recreate the `profiles` row and restore access.

### Current Status
- Code is in place.
- Build and lint are clean.
- Final live verification is still recommended.

## 4. Remaining Product Work Outside The Current Bug Log

- Status: not a bug, future scope
- Area:
  - broader product completion

### Note
- The current app includes landing, auth, friends, onboarding, and availability UI.
- Additional product work may still be needed depending on the intended release scope, but those items are not active defects from this implementation pass.
