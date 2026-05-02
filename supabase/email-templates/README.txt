Supabase Auth email HTML (paste into Dashboard → Authentication → Email → Templates)

Use these filenames as reference copies in git. Dashboard is still the source Supabase mails from.

Variable: {{ .ConfirmationURL }} — valid for BOTH “Confirm signup” and “Reset password / Recovery” templates (Supabase injects the full magic link).


Redirect URLs (Dashboard → Authentication → URL Configuration)

Site URL must match production origin exactly (prefer no trailing slash), e.g.:
  https://www.m2m.energy

Add every redirect destination you send from the app:

  https://www.m2m.energy/auth/callback       (email signup confirm + OAuth)
  https://www.m2m.energy/auth/update-password

If you deploy without www, use that origin consistently everywhere (env Site URL + these entries).

Development (optional):
  http://localhost:3000/auth/callback
  http://localhost:3000/auth/update-password

NEXT_PUBLIC_SITE_URL in .env.local should use the SAME origin string (scheme + host, no trailing slash). The app trims stray trailing / or \\ when building redirect_to.
