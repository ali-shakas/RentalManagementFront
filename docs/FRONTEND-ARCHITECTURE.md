# Frontend Architecture Plan

## Current Frontend and Theme Analysis

### What exists today

- The application already has a strong admin shell:
  - fixed header
  - persistent sidebar
  - breadcrumb area
  - footer
  - card/table/form visual language
- The visual system is driven by the Sass theme under `public/assets/scss`.
- The current frontend already contains domain modules for:
  - dashboard
  - users
  - roles
  - privileges
  - fleet
  - branches
  - vehicles
  - customers
  - booking
- Some newer pages already use:
  - standalone components
  - Angular control flow syntax
  - signals for local state

### Theme strengths to preserve

- Sass token system in `public/assets/scss/utils/_variables.scss`
- Existing color palette:
  - primary blue `#307ef3`
  - secondary amber `#eba31d`
- Page shell spacing, shadows, cards, tables, header, and sidebar styling
- Existing iconography and vendor CSS integration
- Existing responsive behavior and RTL-aware theme rules already present in the layout Sass

### Problems to refactor

- Architecture is mixed between:
  - module-era Angular structure
  - standalone components
  - local signals
  - NgRx for selected flows
- Auth state is fragmented across:
  - `TokenService`
  - localStorage
  - NgRx auth store
  - guards/directives reading different sources
- Shared services live under `shared/services` even when they are really `core` concerns.
- Feature boundaries are not consistent enough for long-term admin scaling.
- Page patterns exist, but table/filter/form conventions are not yet unified into reusable admin-grade primitives.

## What We Keep

- Global visual identity and theme Sass
- Current app shell layout
- Existing Bootstrap-based UI language
- Existing domain models and many feature services
- Existing route surface and feature naming

## What We Change

- Introduce a `core` layer for app-wide concerns:
  - auth
  - api
  - permissions
  - shell state
- Move auth to Signals-based state
- Normalize route protection and permission checks
- Standardize feature page composition around:
  - page header
  - filters
  - data table
  - empty/loading/error states
  - create/edit flows
- Keep standalone components as the target pattern for all new work

## Proposed Structure

```text
src/app/
  core/
    api/
    auth/
    permissions/
    layout/
    utils/
  shared/
    ui/
    directives/
    pipes/
    models/
    services/
  features/
    dashboard/
    users/
    roles/
    privileges/
    fleets/
    branches/
    vehicles/
    customers/
    bookings/
  layout/
    shell/
    header/
    sidebar/
    breadcrumb/
  app.routes.ts
```

## Route Map

- `/auth/login`
- `/dashboard`
- `/users`
- `/users/create`
- `/users/edit/:id`
- `/users/:id/privileges`
- `/roles`
- `/roles/create`
- `/roles/edit/:id`
- `/privileges`
- `/privileges/create`
- `/privileges/edit/:id`
- `/fleet`
- `/fleet/create`
- `/fleet/edit/:id`
- `/branches`
- `/branches/create`
- `/branches/edit/:id`
- `/vehicles`
- `/vehicles/create`
- `/vehicles/edit/:id`
- `/vehicles/:id`
- `/customers`
- `/customers/create`
- `/customers/edit/:id`
- `/customers/:id`
- `/booking`
- `/booking/create`
- `/booking/:id`

## Auth Plan

- Keep JWT storage in browser storage via `TokenService`
- Add Signals-based `AuthStateService` as the single runtime source of truth
- Restore session on startup from token
- Parse current user from JWT claims
- Use guards plus structural directives for access control
- Route unauthorized users to `/auth/login` or `/auth/403`

## State Plan

- Signals for:
  - auth state
  - local page state
  - filter state
  - small reusable UI state
- RxJS remains for `HttpClient` streams
- Keep NgRx only where a real feature state justifies it; do not use it for auth anymore

## API Integration Plan

- Preserve the backend envelope contract:
  - `data`
  - `succeeded`
  - `errors`
  - `propertyErrors`
  - `httpStatusCode`
- Use typed `BaseService` as the transport base for now
- Add normalization helpers around envelopes and validation errors
- Standardize multipart upload methods for vehicles and customers

## Permission System Plan

- Current user contains:
  - roles
  - privileges
  - branchId
  - fleetId
- Permission visibility rules should drive:
  - sidebar visibility
  - action buttons
  - route access
  - section rendering

## Page-by-Page Implementation Priorities

1. Foundation
   - auth state
   - permission helpers
   - route guards
   - sidebar filtering
   - RTL consistency
2. Dashboard
   - summary metrics
   - latest users
   - quick actions
3. Users / Roles / Privileges
   - admin security operations
4. Fleets / Branches
   - structural master data
5. Vehicles / Customers
   - upload-enabled forms and details
6. Bookings
   - operational workflows and validation-heavy forms
