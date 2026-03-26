# الباك اند والـ Auth والـ Base والـ Storage والـ Interceptors — شرح وتطبيق

هذا الملف يربط بين وصفك المعماري والكود الفعلي في المشروع، ثم يوضح كيف تُكرر نفس النمط في كود جديد.

---

## 1. ملخص الباك اند (للمرجعية فقط)

| التقنية | الاستخدام |
|--------|-----------|
| .NET 8 / ASP.NET Core | Web API، Controllers، Middleware |
| MediatR | CQRS (Commands/Queries) |
| FluentValidation | التحقق من الطلبات |
| Entity Framework Core 9 | DbContext، الوصول للبيانات |
| JWT Bearer | مصادقة الطلبات |
| Result&lt;T&gt; | استجابة موحّدة: `{ data, succeeded, errors?, propertyErrors? }` |

- **Base URL:** من `environment.apiBaseUrl` → مثلاً `https://localhost:7082/Api/V1/CarRentalManagament`
- **المصادقة:** `POST Auth/Login` → يرجع `data: { accessToken, ... }`؛ الطلبات المحمية: `Authorization: Bearer <token>`

---

## 2. ما يطابق المشروع الحالي وما يختلف عن الوثيقة

الوثيقة التي أرسلتها تصف تصميمًا يستخدم **NgRx** (Store، Actions، Reducer، Effects، Selectors، `localStorageSync`).  
المشروع الحالي **لا يستخدم NgRx**، بل يعتمد على:

- **Base** → `ApiService` (بدون وراثة؛ خدمة واحدة مشتركة).
- **Auth** → `AuthService` + `TokenService`.
- **Storage** → `TokenService` فقط (مفتاح واحد: `auth_token`).
- **Guards** → `authGuard` (functional guard).
- **Interceptors** → `authInterceptor` + `errorInterceptor` (functional).

لا يوجد **reducers** ولا **LoggedUser** في الـ Store؛ فقط توكن في `localStorage` ونماذج `LoginRequest` / `LoginResponse`.

---

## 3. البنية العامة في المشروع الحالي

```
┌─────────────────────────────────────────────────────────────────────────┐
│  UI (LoginComponent)                                                     │
│  onSubmit() → AuthService.login() → TokenService.setToken() → navigate   │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────────┐
│ TokenService    │    │ authGuard                 │    │ authInterceptor      │
│ (localStorage   │    │ يتحقق من                  │    │ يقرأ TokenService    │
│  auth_token)   │    │ TokenService.hasToken()   │    │ ويضيف Authorization  │
└─────────────────┘    └──────────────────────────┘    └─────────────────────┘
         ▲                            │                            │
         │                            │                            │
         └────────────────────────────┴────────────────────────────┘
                    errorInterceptor عند 401: removeToken + navigate إلى login
```

---

## 4. Base — كيف يعمل وما التقنيات المستخدمة

### 4.1 الملف والمسار

- **الملف:** `src/app/core/services/api.service.ts`
- **الدور:** خدمة HTTP مركزية تتوافق مع استجابة الباك اند `Result<T>` (هنا `ApiResponse<T>`).

### 4.2 التقنيات المستخدمة

- `HttpClient` لجميع الطلبات.
- `environment.apiBaseUrl` لبناء الـ Base URL.
- نموذج `ApiResponse<T>` مطابق لـ `Result<T>`: `data`, `succeeded`, `errors`, `propertyErrors`, `httpStatusCode`.

### 4.3 الواجهة البرمجية

```ts
// من api.service.ts
get<T>(endpoint, params?)   → Observable<ApiResponse<T>>
post<T>(endpoint, body)    → Observable<ApiResponse<T>>
put<T>(endpoint, body)     → Observable<ApiResponse<T>>
delete<T>(endpoint)        → Observable<ApiResponse<T>>

// اختصار: يرجع data فقط ويرمي خطأ إن !succeeded
getData<T>(endpoint, params?)  → Observable<T>
postData<T>(endpoint, body)   → Observable<T>
putData<T>(endpoint, body)    → Observable<T>
```

- الـ URL يُبنى كـ: `baseUrl + '/' + endpoint` (مثلاً `Auth/login`, `User/Paginated`).
- لا وراثة: الخدمات الأخرى **تستخدم** `ApiService` بالـ inject ولا ترث منه.

### 4.4 استخدامه في كود جديد (نمط سينيور)

أي خدمة API جديدة:

1. تُنشئ في `core/services/` (أو `shared/services/` حسب هيكلك).
2. تُدخل `ApiService` وتستدعيه مع endpoint ثابت للوحدة.

```ts
// مثال من user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private api = inject(ApiService);
  private readonly base = 'User';

  getPaginated(params: PaginatedRequest): Observable<ApiResponse<PaginatedResponse<User>>> {
    return this.api.get<PaginatedResponse<User>>(`${this.base}/Paginated`, {
      pageNumber: params.pageNumber,
      pageSize: params.pageSize,
      search: params.search,
    });
  }

  getById(id: string): Observable<User> {
    return this.api.getData<User>(`${this.base}/by-id`, { id });
  }

  create(body: UserCreateRequest): Observable<unknown> {
    return this.api.postData(`${this.base}/create`, body);
  }
}
```

- إن أردت **وراثة** (مثل وثيقتك BaseService): يمكن إنشاء `BaseApiService` يأخذ `endpoint: string` في الـ constructor ويوفّر `getResourceUrl()` ويرثه كل خدمة — لكن في المشروع الحالي لم يُستخدم الوراثة، والاعتماد على inject + endpoint ثابت كافٍ.

---

## 5. Auth — كيف يعمل وما التقنيات المستخدمة

### 5.1 الملفات

| الملف | الدور |
|-------|--------|
| `core/services/auth.service.ts` | تسجيل الدخول، تسجيل الخروج، التحقق من الحالة |
| `core/services/token.service.ts` | قراءة/كتابة/حذف التوكن في localStorage |
| `core/models/auth.model.ts` | `LoginRequest`, `LoginResponse` |
| `core/guards/auth.guard.ts` | حماية المسارات (التحقق من وجود توكن) |
| `features/auth/login/login.component.ts` | نموذج الدخول واستدعاء AuthService |

### 5.2 تدفق تسجيل الدخول (من الواجهة حتى الـ API)

1. **LoginComponent:** المستخدم يملأ username/password ويضغط تسجيل الدخول.
2. **onSubmit()** يستدعي `AuthService.login({ username, password })`.
3. **AuthService.login():**
   - يستدعي `ApiService.post<LoginResponse>('Auth/login', request)`.
   - من الاستجابة يأخذ التوكن (يدعم `token`, `accessToken`, `access_token`) ويضعه في **TokenService** (`setToken`).
   - يَرجع `Observable<{ success, message? }>` للـ component.
4. **LoginComponent** في `subscribe`:
   - إن `result.success` → toast نجاح + `router.navigate(['/pages/dashboard'])`.
   - وإلا يعرض `result.message` أو رسالة خطأ.

لا يوجد هنا **dispatch** ولا Store؛ التوكن فقط في `TokenService` (ومخزن فعلياً في localStorage تحت مفتاح `auth_token`).

### 5.3 تسجيل الخروج

- **AuthService.logout():** يستدعي `TokenService.removeToken()` ثم `router.navigate(['/auth/login'])`.
- عند **401** من أي طلب، **errorInterceptor** يستدعي `tokenService.removeToken()` ثم يوجّه إلى `/auth/login` (مع toast).

### 5.4 تطبيق نفس النمط في كود جديد

- خدمة **Auth**: استدعاء endpoint الدخول، استخراج التوكن من الاستجابة، حفظه عبر خدمة تخزين (هنا TokenService).
- خدمة **Token/Storage**: واجهة بسيطة `getToken`, setToken, removeToken, hasToken` على مفتاح واحد في localStorage.
- الـ **Login** في الـ UI: استدعاء Auth، في الـ subscribe حفظ التوكن ثم `navigate` للصفحة الرئيسية أو للـ dashboard.

---

## 6. LocalStorage (التخزين) — كيف يعمل

### 6.1 الملف

- **الملف:** `src/app/core/services/token.service.ts`
- **المفتاح:** `auth_token` (ثابت داخل الخدمة).

### 6.2 الواجهة

```ts
getToken(): string | null
setToken(token: string): void
removeToken(): void
hasToken(): boolean
```

- القيمة مخزّنة كـ string مباشر (لا JSON خاص بالـ user كامل).
- الـ **authInterceptor** يقرأ من `TokenService.getToken()` ويضيف `Authorization: Bearer <token>`.

في التصميم الذي تستخدمه وثيقتك (NgRx + localStorageSync)، يُحفظ كائن كامل مثل `{ user: LoggedUser }` تحت مفتاح `auth-key`. في المشروع الحالي يتم حفظ **التوكن فقط** تحت `auth_token`، وهذا كافٍ للمصادقة.

### 6.3 استخدامه في كود جديد

- أي مكان يحتاج معرفة "هل المستخدم مسجّل؟" أو "ما التوكن؟" يستخدم **TokenService** فقط.
- إن أردت حفظ بيانات إضافية (مثل user, roles)، يمكن إما توسيع TokenService أو إضافة خدمة storage عامة (مثل `LocalStorageService` مع مفاتيح متعددة) دون تغيير نمط الـ Auth الحالي.

---

## 7. Reducers (في المشروع الحالي: لا يوجد)

المشروع **لا يستخدم NgRx**؛ لذلك لا يوجد:

- `auth.reducer.ts`
- `auth.actions.ts`
- `auth.selectors.ts`
- `auth.effects.ts`
- `reducers/index.ts` مع `localStorageSync`

الحالة الوحيدة "المستمرة" هي وجود أو غياب التوكن في **TokenService** (ومحتوى localStorage).  
إن أردت لاحقاً تطبيق التصميم الذي في وثيقتك (Store + localStorageSync):

- تُضيف feature state باسم مثلاً `auth-key` مع reducer يحدّث `user` عند login/logout.
- تستخدم `localStorageSync({ keys: ['auth-key'], rehydrate: true })` في metaReducers.
- الـ JWT interceptor إما يقرأ من نفس المفتاح في localStorage (بعد أن ينسخ الـ Store إليه) أو من Store عبر selector.

---

## 8. HTTP Interceptors — كيف يعملان وما التقنيات المستخدمة

### 8.1 authInterceptor (JWT)

- **الملف:** `src/app/core/interceptors/auth.interceptor.ts`
- **النوع:** `HttpInterceptorFn` (وظيفي).

**المنطق:**

1. يحقن `TokenService`.
2. يأخذ `token = tokenService.getToken()`.
3. إن وُجد توكن، ينسخ الـ request ويضيف `Authorization: Bearer <token>`.
4. يمرّر الطلب إلى `next(req)`.

يُطبَّق على **كل** طلب HTTP لأنّه مسجّل في `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))` في `app.config.ts`.

### 8.2 errorInterceptor (معالجة الأخطاء)

- **الملف:** `src/app/core/interceptors/error.interceptor.ts`
- **النوع:** `HttpInterceptorFn`.

**المنطق:**

1. يمرّر الطلب إلى `next(req)`.
2. في `catchError`:
   - **401:** استدعاء `tokenService.removeToken()`، ثم `router.navigate(['/auth/login'])`، و`toast.error('Session expired...')`.
   - إن وُجدت `err.error?.errors` يعرضها عبر الـ toast.
   - وإلا يعرض `err.message`.
3. يُعيد `throwError(() => err)` حتى يستطيع الـ subscriber معالجة الخطأ إن أراد.

ترتيب التسجيل: `authInterceptor` أولاً ثم `errorInterceptor`؛ لذلك يضاف التوكن أولاً، ثم تُعالج الاستجابة (بما فيها 401).

### 8.4 تطبيق نفس النمط في كود جديد

- **JWT:** اعتراض كل طلب، قراءة التوكن من مصدر واحد (هنا TokenService)، إضافة الهيدر ثم `next(req)`.
- **Error:** اعتراض مركزي؛ عند 401 إزالة التوكن + إعادة توجيه لصفحة الدخول + رسالة؛ وباقي الأخطاء حسب سياسة التطبيق (toast، أو إرجاع خطأ للنموذج).

---

## 9. التكامل مع التوجيه (Routing)

### 9.1 الملفات

- **app.routes.ts:** مسار فارغ → redirect إلى `pages/dashboard`؛ مسار `auth` (loadChildren لـ auth.routes)؛ مسار فارغ آخر مع **Content** كقشرة و`canActivate: [authGuard]` وأطفال من `content` (من `shared/routes/routes.ts`).
- **shared/routes/routes.ts:** يربط `pages` بـ `pages.routes`.
- **pages.routes.ts:** يعرّف `dashboard`, `users`, `roles`, `privileges` مع أطفالهم (list, create, edit, privileges).

### 9.2 الحماية

- المسارات التي تحت القشرة (Content) محمية بـ **authGuard**.
- **authGuard:** يتحقق من `TokenService.hasToken()`؛ إن لم يوجد توكن يُوجّه إلى `/auth/login` ويرجع `false`؛ وإلا `true`.

لتجربة "السماح دائماً" (كما في وثيقتك): يمكن استبدال جسم الـ guard بـ `return true` (مع إضافة `of(true)` إن كان يُرجع `Observable<boolean>`). في المشروع الحالي الـ guard functional ويرجع `boolean` فقط.

---

## 10. ملخص سريع: كيف تُكرر النمط في كود جديد

| الجزء | في المشروع الحالي | ما تفعله في مشروع جديد |
|------|-------------------|-------------------------|
| **Base** | `ApiService` مع `environment.apiBaseUrl` و `ApiResponse<T>` | نفس الفكرة: خدمة مركزية تستخدم baseUrl + endpoint؛ إما استخدامها مباشرة أو إنشاء BaseApiService يرثه كل خدمة feature. |
| **Auth** | `AuthService` + `TokenService` | خدمة Login تستدعي API وتستخرج التوكن وتضعه في TokenService؛ Logout يمسح التوكن ويوجّه لـ login. |
| **Storage** | `TokenService` (مفتاح واحد) | نفس الواجهة: get/set/remove للتوكن؛ إن احتجت حفظ user كامل يمكن مفتاح إضافي أو NgRx. |
| **Reducers** | لا يوجد | إن استخدمت NgRx: reducer لـ auth، metaReducer مع localStorageSync، وربط الـ interceptor بنفس مصدر التوكن. |
| **Guards** | `authGuard` يقرأ TokenService | Guard يتحقق من وجود توكن (أو من Store إن استخدمت NgRx) ويرجع true/false أو يوجّه لـ login. |
| **Interceptors** | auth (إضافة Bearer)، error (401 → removeToken + navigate) | نفس الترتيب والمنطق؛ يمكن إضافة loading أو تحسين رسائل الخطأ. |

بهذا تفهم كيف تم تنفيذ العمليات في هذا المشروع (Base، Auth، Storage، Interceptors، Guard) وكيف تطبق نفس الأسلوب — أو نسخة NgRx منه — في كود جديد بشكل متسق.
