# Admin Guide

Admins can add and edit restaurants, platform links and offers. They can set minimum bill, max cap, discount percent, flat discount, cashback value, membership condition, payment condition, valid days, date range, time range and meal type.

Verification status should be used conservatively:
- `verified`: source was recently checked by an admin.
- `needs_review`: offer exists but needs admin review.
- `uncertain`: extracted or imported data is ambiguous.
- `expired`: no longer valid.

Supabase Auth should protect `/admin/*` in production middleware. The MVP keeps admin pages open in local demo mode so reviewers can test the forms.
