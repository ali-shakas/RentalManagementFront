# دليل هيكل المشروع (مطبق بشكل صارم)

هذا الملف يوثق الهيكل المطبق وفق الدليل مع بقاء نفس التمبليت.

---

## 1. الهيكل العام لـ `src/`

```
src/
├── index.html
├── main.ts
├── styles.scss (أو أنماط عامة)
├── app/
│   ├── app.component.ts / .html / .scss
│   ├── app.module.ts
│   ├── app.routes.ts
│   ├── auth/
│   ├── shared/
│   └── modules/
├── assets/
└── environments/
```

---

## 2. جذر التطبيق `app/`

| الملف | الدور |
|-------|--------|
| `app.component.*` | المكون الجذري (loader، tap-to-top، toast، router-outlet). |
| `app.module.ts` | يجمع SharedModule، AuthenticationModule، Router، HttpClient + Interceptors، Translate، NgbModule، ويُسجّل bootstrap. |
| `app.routes.ts` | مسار فارغ → redirect إلى `dashboard`؛ قالب واحد (Content) وأطفاله: dashboard، users، roles، privileges عبر loadChildren. |

---

## 3. `app/auth/` — وحدة المصادقة

```
auth/
├── authentication.module.ts
├── authentication-routing.module.ts   ← مسارات: login, 404, 500, 401
├── login/
│   ├── login.component.ts / .html / .scss
├── 404/
│   └── not-found.component.ts
├── 401/
│   └── unauthorized.component.ts
├── 500/
│   └── server-error.component.ts
└── store/
    ├── auth.actions.ts
    ├── action-types.ts
    ├── auth.reducer.ts
    ├── auth.selectors.ts
    └── auth.effects.ts
```

صفحة تسجيل الدخول والـ 404/401/500 خارج الـ layout (بدون sidebar/header).

---

## 4. `app/shared/` — المشترك

```
shared/
├── shared.module.ts
├── component/
│   ├── layout/          ← content, header, sidebar, footer
│   ├── loader, breadcrumb, tap-to-top, svg-icon, feathericon
│   ├── toast-container, confirm-dialog
│   └── header/          ← profile, theme, search, language, …
├── services/
│   ├── base/            ← base.service.ts (BaseService للـ API)
│   ├── auth/            ← auth.service.ts + auth.guard.ts
│   ├── layout/          ← layout.service.ts + nav-menu.service.ts
│   ├── storage/         ← local-storage.service.ts + token.service.ts
│   ├── user.service.ts, role.service.ts, privilege.service.ts
│   ├── toast.service.ts, confirm.service.ts, loading.service.ts
├── models/
│   ├── base/            ← api-response, base-model, base-auditable-model
│   ├── logged.user.model.ts
│   ├── tree.model.ts
│   ├── auth.model.ts, user.model.ts, role.model.ts, privilege.model.ts
│   └── index.ts
├── http-interceptors/
│   ├── jwt.interceptor.ts
│   └── http-error.interceptor.ts
├── directives/          ← outside.directive (clickOutside)
├── reducers/            ← index.ts (metaReducers)
├── routes/              ← routes.ts (تعريف أطفال Content)
└── constants/           ← (إن وُجدت)
```

---

## 5. `app/modules/` — وحدات الميزات (Lazy-loaded)

كل وحدة بالشكل:

```
modules/<feature>/
├── <feature>.module.ts
├── <feature>-routing.module.ts
└── components/
    ├── <entity>-list/      ← قائمة
    ├── <entity>-form/      ← إضافة/تعديل
    └── <entity>-privileges/ (إن وُجد)
```

**مطبق حاليًا:**

- **dashboard** — dashboard.module، dashboard-routing، dashboard.component
- **users** — users.module، users-routing، components: user-list، user-form، user-privileges
- **roles** — roles.module، roles-routing، components: role-list، role-form
- **privileges** — privileges.module، privileges-routing، components: privilege-list، privilege-form

---

## 6. التوجيه (app.routes.ts)

- مسار فارغ `""` → `redirectTo: "dashboard"`, `pathMatch: "full"`.
- `path: "auth"` → loadChildren لـ AuthenticationModule.
- `path: ""` → Content (قشرة التخطيط)، `canActivate: [authGuard]`، وأطفال من `shared/routes/routes.ts`:
  - `dashboard` → loadChildren DashboardModule
  - `users` → loadChildren UsersModule
  - `roles` → loadChildren RolesModule
  - `privileges` → loadChildren PrivilegesModule

**المسارات النهائية (بدون بادئة `pages`):**

- `/dashboard`
- `/users`, `/users/create`, `/users/edit/:id`, `/users/:id/privileges`
- `/roles`, `/roles/create`, `/roles/edit/:id`
- `/privileges`, `/privileges/create`, `/privileges/edit/:id`
- `/auth/login`, `/auth/404`, `/auth/401`, `/auth/500`

---

## 7. التسمية المطبقة

| العنصر | النمط المطبق |
|--------|----------------|
| Module | `<feature>.module.ts` |
| Routing | `<feature>-routing.module.ts` |
| خدمة التخطيط | `nav-menu.service.ts` → NavMenuService |
| قوائم/نماذج | `<entity>-list/`, `<entity>-form/` |
| صفحات الأخطاء | مجلدات `404/`, `401/`, `500/` |
| نماذج مشتركة | `logged.user.model.ts`, `tree.model.ts` |

---

## 8. القرارات (shared vs module)

- **shared:** BaseService، AuthService، Guards، Interceptors، Layout، Storage، نماذج مشتركة (User، Role، Privilege، ApiResponse، LoggedUser، Tree).
- **داخل الوحدة:** مكونات القوائم والنماذج والتفاصيل الخاصة بكل ميزة فقط.

البناء: `npm run build` ينجح مع الهيكل الحالي.
