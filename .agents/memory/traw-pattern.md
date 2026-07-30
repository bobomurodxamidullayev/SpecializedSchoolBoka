---
name: tRaw for non-string translations
description: How to safely access arrays and objects from the translation system in this project
---

## Rule

Never use `t("some.key") as unknown as Array<...>` or `t("some.key") as unknown as Record<...>`.
`t()` returns `string` only — when the value is an array/object it falls back to returning the key path string, causing `.map is not a function` crashes.

**Why:** The `t()` function in `LanguageContext.tsx` has return type `string` and returns `path` (a string) when the resolved value is not a string.

**How to apply:** Use `tRaw(path)` (returns `unknown`) whenever the translation value is an array or nested object:

```tsx
// WRONG — crashes at runtime
const steps = t("admissions.steps") as unknown as Step[];

// CORRECT
const { t, tRaw } = useLanguage();
const steps = (tRaw("admissions.steps") as Step[]) ?? [];
```

Always add `?? []` fallback for arrays so the page renders empty rather than crashing.

## Pages already fixed (as of June 2026)
- `admissions.tsx` — steps, requirements, dates
- `directions.tsx` — directions.items
- `about.tsx` — about.timeline
