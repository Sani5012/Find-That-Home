# Supabase Signup & Auth Integration Guide

This document summarizes how the Supabase integration is wired inside **Find That Home** so both frontend and backend contributors can extend it safely.

## 1. Environment Setup

Create a `.env` file (or copy `.env.example`) with the following keys. Ask the platform owner for the real values.

```bash
VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
VITE_SUPABASE_ANON_KEY="<public-anon-key>"
VITE_APP_URL="http://localhost:5173" # or the deployed origin that should receive email confirmations
```

`VITE_APP_URL` is used as the canonical redirect for Supabase email confirmations. If it is omitted we fall back to the current
`window.location.origin`, but explicitly setting it avoids the common "fetch failed" errors caused by redirect URLs that are not
allowed inside the Supabase project settings.

Restart `npm run dev` after updating environment variables.

## 2. Supabase Client

The reusable client lives in `src/lib/supabaseClient.ts` and is imported wherever Supabase access is required. The client enables session persistence/refresh so authentication events automatically propagate through the UI.

```ts
import { supabase } from '../lib/supabaseClient';
```

## 3. Signup Flow Overview

1. **User Registration** – `UserContext.signup` wraps `supabase.auth.signUp`. Custom metadata (first/last name, phone, income, preferred property type, and role) is passed through `options.data` so it is available immediately inside Auth.
2. **Profile Creation** – Immediately after sign-up, we try to `upsert` the public `users` table with the same metadata. If that table is missing or RLS is not configured yet the code now falls back to auth metadata instead of failing the entire signup.
3. **Email Verification** – Supabase sends a confirmation email automatically. The frontend blocks login until `email_confirmed_at` is set. The signup handler returns `{ requiresVerification: boolean }` so components can show the proper CTA.
4. **Role-based Routing** – After verification/login we read the saved `role` from `users` and send people to the correct dashboard. Admins can always log in even if the UI role selector is different.

## 4. Login & Session Management

- `UserContext.login` calls `supabase.auth.signInWithPassword`, verifies email confirmation, enforces role-matching, and automatically routes administrators to `/admin-dashboard` after a successful login.
- `UserContext` subscribes to `supabase.auth.onAuthStateChange` to keep `user`, `isAuthenticated`, and `loading` synchronized across the app.
- `logout` is now a thin wrapper around `supabase.auth.signOut()`.

## 5. Profile Updates

`updateUser` / `updateUserProfile` update both the `users` table and the auth metadata so downstream components (chatbot, dashboards, etc.) see fresh data after a reload. If the table is temporarily unavailable we skip the write, log a warning, and continue using auth metadata only.

## 6. Testing Checklist

| Scenario | Steps | Expected Result |
| --- | --- | --- |
| New signup | Submit form with valid data | Toast instructs user to verify email, `users` row exists |
| Duplicate email | Sign up with an existing email | Supabase returns `User already registered` error |
| Login before verification | Attempt login immediately | Error: `Email not confirmed` |
| Login after verification | Verify email, then log in | User routed according to saved role |

With these pieces in place the frontend can rely entirely on Supabase for authentication and profile data while the rest of the platform (properties, alerts, etc.) can be migrated incrementally.
