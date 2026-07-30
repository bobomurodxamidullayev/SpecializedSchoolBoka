---
name: Wouter Routing Pattern
description: How routing is structured in the QCh School app (wouter v3)
---

## Pattern used

Flat `Switch` with all admin routes listed explicitly before a catch-all public route:

```tsx
<Switch>
  <Route path="/admin/login" component={AdminLogin} />
  <Route path="/admin"><AdminGuard><AdminDashboard /></AdminGuard></Route>
  <Route path="/admin/teachers"><AdminGuard><AdminTeachers /></AdminGuard></Route>
  // ... more admin routes ...
  <Route>  {/* catch-all — public site with Layout */}
    <Layout><Switch>...public routes...</Switch></Layout>
  </Route>
</Switch>
```

**Why:** Nested routing with `nest` prop or `<Router base>` inside a route caused matching issues. Flat explicit routes are more predictable and TypeScript-friendly in wouter v3.

**AdminGuard pattern:** Renders `<AdminLogin />` directly when not authenticated — no programmatic navigation needed. Works because the login page is self-contained.
