# وثيقة المتطلبات البرمجية (SRS) - Rental Management Frontend

## 1) الهدف
تحديد السلوك الوظيفي والتقني للواجهة الأمامية لنظام إدارة وتأجير المركبات، مع توثيق سياسة الصلاحيات، العزل حسب `FleetId`، وسجل التغييرات الناتج عن أوامر التطوير.

## 2) نطاق النظام
الواجهة الأمامية تشمل:
- المصادقة وتسجيل الدخول/الخروج.
- لوحة التحكم.
- إدارة التشغيل: الحجوزات، العملاء.
- الإدارة: المركبات، الفروع، تصنيفات المركبات، الأساطيل.
- المالية: البنوك، الحسابات النقدية، دليل الحسابات، السنوات المالية، القيود اليومية، المدفوعات.
- الأمن: المستخدمون، الأدوار، الصلاحيات، صلاحياتي.

## 3) أصحاب المصلحة
- `Super Admin`
- `Admin`
- `Employee`

## 4) المصادقة والجلسة
- صفحة البداية الافتراضية: `auth/login`.
- الجلسة مبنية على `accessToken` مخزن في `localStorage`.
- عند إغلاق التطبيق، توجد مهلة استعادة جلسة قصيرة (5 دقائق) قبل تسجيل الخروج الإجباري.

## 5) نموذج الصلاحيات (RBAC)
- `Privileges` أصغر وحدة صلاحية.
- `Roles` تجميع لصلاحيات.
- `Users` يرتبطون بدور أو أكثر.
- `My Access` يعرض الناتج الفعلي للصلاحيات.

## 6) سياسة العزل حسب FleetId
- `FleetId` هو معيار العزل الرئيسي للبيانات التشغيلية.
- أي مستخدم عادي/مدير أسطول: يرى بيانات أسطوله فقط.
- عند غياب `FleetId` في التوكن: يعامل المستخدم كسوبر أدمن.
- السوبر أدمن يرى البيانات العامة (غير المقيدة بأسطول واحد) حسب صلاحيات واجهته.

## 7) سلوك Super Admin (نسخة الواجهة الحالية)
- القوائم المسموحة فقط:
  - `/dashboard`
  - `/fleet`
  - `/users`
  - `/roles`
  - `/privileges`
- أي مسار آخر محمي بـ `privilegeGuard` يتم منعه للسوبر أدمن وإعادته إلى `/dashboard`.
- في الداشبورد:
  - اختصارات "استكشف الصفحات" و"الإجراءات السريعة" تتبع نفس قائمة المسارات المسموحة أعلاه.

## 8) متطلبات وظيفية أساسية
- CRUD للموديولات المتاحة حسب الصلاحية.
- دعم `Paginated` و`List` عند توفرها من الـ API.
- عرض رسائل الخطأ من الـ API عبر نظام الإشعارات في الواجهة.
- دعم اللغة العربية والإنجليزية و`RTL/LTR`.

## 9) متطلبات غير وظيفية
- واجهة متجاوبة Desktop/Mobile.
- ثبات بصري في Light/Dark Theme.
- فصل التنسيق العام (Typography) عن Layout Overrides قدر الإمكان.
- قابلية صيانة عالية عبر تقسيم الموديولات والخدمات.

## 10) تكامل API
- جميع خدمات البيانات تعتمد `Api/V1/CarRentalManagament/*`.
- عند توفر `FleetId` يرسل مع الطلبات ذات العلاقة.
- عند غياب `FleetId` (سوبر أدمن) تستخدم مسارات بديلة/مرنة في الفرونت عند الحاجة لتجنب فشل التدفق.

## 11) إدارة الأخطاء
- فشل HTTP يجب أن يظهر بطريقة موحدة ومقروءة للمستخدم.
- لا يتم كسر الصفحة بالكامل بسبب Endpoint واحد؛ تستخدم قيم fallback للعرض عند الإمكان.

## 12) قابلية التتبع
- كل تغيير جديد بطلب مباشر من المستخدم يتم توثيقه في قسم `سجل التحديثات`.
- كل إدخال جديد يجب أن يذكر: التاريخ، ملخص الطلب، الملفات المتأثرة، الأثر الوظيفي.

## 13) سجل التحديثات
| التاريخ | الطلب | التغيير المنفذ | الملفات |
|---|---|---|---|
| 2026-04-05 | معالجة تعليق السايدبار في الثيم الغامق | تطبيق وضع أداء أخف عند فتح/إغلاق السايدبار في الثيم الغامق عبر تقليل المؤثرات الثقيلة وإلغاء انتقالات التخطيط المسببة للتقطيع | `src/styles/_sidebar-layout-overrides.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | إضافة حذف المركبة من كرت المركبة | إضافة زر حذف داخل كرت المركبة مع تأكيد قبل الحذف، حالة تحميل للزر، ربط مباشر مع `Vehicle/SoftDelete/{id}`، وتحديث فوري للقائمة ورسائل نجاح/فشل مع ترجمة عربي/إنجليزي | `src/app/modules/rent/components/vehicles/vehicle-list/vehicle-list.component.html`, `src/app/modules/rent/components/vehicles/vehicle-list/vehicle-list.component.ts`, `src/app/modules/rent/services/vehicles/vehicle.service.ts`, `public/assets/i18n/modules/rent/vehicles/ar.json`, `public/assets/i18n/modules/rent/vehicles/en.json`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | تحسين شكل أزرار إجراءات كرت المركبة | توحيد أزرار الإجراءات داخل كرت المركبة (المقاس/الحواف/التباين) وتحسين مظهر زر الحذف في الثيمين الفاتح والغامق | `src/app/modules/rent/components/vehicles/vehicle-list/vehicle-list.component.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | توحيد شريط الترقيم عبر الصفحات | تثبيت بنية `Pagination Bar` بصريًا في كل الصفحات عبر إضافة مساحة مكان `Page Size` حتى عند إخفائها لضمان اتساق التخطيط | `src/app/shared/ui/pagination-bar/pagination-bar.component.html`, `src/app/shared/ui/pagination-bar/pagination-bar.component.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | إزالة إجراء التفعيل من جدول الفروع | حذف زر تبديل الحالة من عمود الإجراءات في صفحة الفروع مع تنظيف الكود المرتبط به من الكومبوننت | `src/app/modules/rent/components/branches/branch-list/branch-list.component.html`, `src/app/modules/rent/components/branches/branch-list/branch-list.component.ts`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | تحسين الخلفيات والثيم وإصلاح وضوح العناصر | اعتماد صور خلفية الثيم (`dark.jpg`/`light.jpg`) بشكل عام مع Overlay محسّن للتباين، تخفيف تعليق الاسكرول، وتحسين وضوح عناصر الثيم الفاتح | `src/styles.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | إصلاح موضع زر الرجوع للأعلى في العربية | ضبط زر `tap-top` ليتموضع في الجهة المقابلة عند `RTL` ومنع تداخله مع عناصر السايدبار/تسجيل الخروج | `src/styles.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | إخفاء بطاقة لوحة التحكم داخل صفحة لوحة التحكم | تعديل منطق "استكشاف الصفحات" في الداشبورد بحيث لا تظهر بطاقة `Dashboard` عندما يكون المستخدم داخل `/dashboard` | `src/app/modules/rent/components/dashboard/dashboard/dashboard.component.ts`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | توسيع جدول تصنيفات المركبات ببيانات تشغيلية أهم | إضافة أعمدة نطاقات الأسعار والحدود (اليومي، الشهري، الساعة الإضافية، الكيلومتر الإضافي، الحد المسموح) مع تنسيق أرقام حسب اللغة وتحديث مفاتيح الترجمة | `src/app/modules/rent/components/category-vehicles/category-vehicle-list/category-vehicle-list.component.html`, `src/app/modules/rent/components/category-vehicles/category-vehicle-list/category-vehicle-list.component.ts`, `src/app/modules/rent/components/category-vehicles/category-vehicle-list/category-vehicle-list.component.scss`, `public/assets/i18n/modules/rent/category-vehicles/ar.json`, `public/assets/i18n/modules/rent/category-vehicles/en.json`, `docs/FRONTEND-SRS.md` |
| 2026-04-05 | إزالة `FleetId` من واجهات إضافات المالية | حذف حقل "معرف الأسطول" من نماذج الإضافة المالية مع الإبقاء على التعبئة والإرسال التلقائي من الجلسة داخل طبقة المنطق | `src/app/modules/finance/components/banks/bank-form/bank-form.component.html`, `src/app/modules/finance/components/cash/cash-account-form/cash-account-form.component.html`, `src/app/modules/finance/components/counting/counting-entry-form/counting-entry-form.component.html`, `src/app/modules/finance/components/financial-years/financial-year-form/financial-year-form.component.html`, `src/app/modules/finance/components/journals/journal-entry-form/journal-entry-form.component.html`, `src/app/modules/finance/components/payment-counts/payment-count-form/payment-count-form.component.html`, `docs/FRONTEND-SRS.md` |
| 2026-04-02 | توحيد القوائم المنسدلة وتحسين تجربة التفاعل عبر النظام | بناء مكوّن `Smooth Select` عام وتطبيقه على صفحات القوائم/الفلاتر/النماذج بدل الشكل الافتراضي، مع تحسينات نعومة الحواف و`hover/focus` ودعم واضح للثيم الفاتح/الداكن، وتحسين قائمة المستخدم في الهيدر (قائمة منسدلة حديثة بعنصر `Logout` فقط) وضبط تموضع أيقونة المستخدم | `.gitignore`, `src/app/shared/ui/smooth-select/smooth-select.component.ts`, `src/app/shared/ui/smooth-select/smooth-select.component.html`, `src/app/shared/ui/smooth-select/smooth-select.component.scss`, `src/app/shared/component/header/profile/profile.ts`, `src/app/shared/component/header/profile/profile.html`, `src/app/shared/component/header/profile/profile.scss`, `src/styles.scss`, `src/app/modules/rent/components/*/*/*.html`, `src/app/modules/rent/components/*/*/*.ts` |
| 2026-04-02 | حماية رفع الصور وتثبيت تدفق العملاء/المركبات | إضافة حماية من الفرونت عند اختيار الملف (التحقق من النوع/الحجم/الإلغاء)، وتوحيد إرسال الصورة كـ `Base64` داخل `JSON` لتفادي خطأ `415 Unsupported Media Type`، مع تحسين العرض والمعاينة ومسار تحميل روابط الوسائط من الـ API | `proxy.conf.json`, `src/app/shared/ui/file-upload/file-upload.component.ts`, `src/app/shared/ui/file-upload/file-upload.component.html`, `src/app/shared/ui/file-upload/file-upload.component.scss`, `src/app/shared/utils/image-upload.utils.ts`, `src/app/shared/utils/media-url.utils.ts`, `src/app/modules/rent/components/customers/customer-form/customer-form.component.ts`, `src/app/modules/rent/components/customers/customer-form/customer-form.component.html`, `src/app/modules/rent/components/vehicles/vehicle-form/vehicle-form.component.ts`, `src/app/modules/rent/components/vehicles/vehicle-form/vehicle-form.component.html`, `src/app/modules/rent/services/customers/customer.service.ts`, `src/app/modules/rent/services/vehicles/vehicle.service.ts` |
| 2026-04-01 | استكمال التعريب والترجمة (i18n) لعناصر الاشتراكات وباقي الوحدات | إكمال وترتيب مفاتيح الترجمة العربية/الإنجليزية على مستوى النظام (خصوصًا ضوابط وحقول اشتراكات العملاء)، وتحسين اتساق النصوص المعروضة في النماذج والجداول والواجهات المشتركة | `public/assets/i18n/common/ar.json`, `public/assets/i18n/common/en.json`, `public/assets/i18n/modules/rent/subscriptions/ar.json`, `public/assets/i18n/modules/rent/subscriptions/en.json`, `public/assets/i18n/modules/rent/customers/ar.json`, `public/assets/i18n/modules/rent/customers/en.json`, `src/app/modules/rent/components/subscriptions/customer-subscription-form/customer-subscription-form.component.ts`, `src/app/modules/rent/components/subscriptions/customer-subscription-list/customer-subscription-list.component.ts`, `src/app/modules/rent/components/customers/customer-form/customer-form.component.ts`, `src/app/shared/i18n/multi-translate.loader.ts` |
| 2026-04-01 | تقييد واجهة السوبر أدمن + إنشاء SRS | حصر القوائم والمسارات للسوبر أدمن في Dashboard/Fleet/Users/Roles/Privileges، وتوحيد ذلك داخل السايدبار والـ guard والداشبورد، وإنشاء وثيقة SRS | `src/app/core/auth/super-admin.constants.ts`, `src/app/shared/services/layout/sidebar.service.ts`, `src/app/shared/services/auth/privilege.guard.ts`, `src/app/modules/rent/components/dashboard/dashboard/dashboard.component.ts`, `src/app/modules/rent/components/dashboard/dashboard/dashboard.component.html`, `docs/FRONTEND-SRS.md` |
| 2026-04-01 | تمكين تدفق Super Admin (Fleet → Privileges → Role → User) | دعم ربط المستخدم بالأسطول في نموذج المستخدم، تحسين اختيار الصلاحيات داخل نموذج الدور (بحث + تحديد مرئي)، وإضافة وضع الإنشاء الجماعي للصلاحيات داخل صفحة واحدة مع إنشاء متعدد دفعة واحدة | `src/app/modules/rent/models/users/user.model.ts`, `src/app/modules/rent/models/users/user.normalizer.ts`, `src/app/modules/rent/components/users/user-form/user-form.component.ts`, `src/app/modules/rent/components/users/user-form/user-form.component.html`, `src/app/modules/rent/components/users/user-list/user-list.component.ts`, `src/app/modules/rent/components/users/user-list/user-list.component.html`, `src/app/modules/rent/components/roles/role-form/role-form.component.ts`, `src/app/modules/rent/components/roles/role-form/role-form.component.html`, `src/app/modules/rent/components/privileges/privilege-form/privilege-form.component.ts`, `src/app/modules/rent/components/privileges/privilege-form/privilege-form.component.html`, `src/app/modules/rent/components/privileges/privilege-list/privilege-list.component.html`, `docs/FRONTEND-SRS.md` |
| 2026-04-01 | تحديث جدول العملاء ليتوافق مع النموذج المرجعي | إعادة ترتيب أعمدة جدول العملاء لتصبح (رقم العضوية، الاسم العربي، الرقم، تاريخ انتهاء الرخصة، الهوية، الرخصة، تاريخ الميلاد)، إضافة بحث حسب عمود محدد، وتحسين أزرار العمليات مع دعم حذف العميل `SoftDelete` من الجدول | `src/app/modules/rent/components/customers/customer-list/customer-list.component.ts`, `src/app/modules/rent/components/customers/customer-list/customer-list.component.html`, `src/app/modules/rent/components/customers/customer-list/customer-list.component.scss`, `src/app/modules/rent/services/customers/customer.service.ts`, `docs/FRONTEND-SRS.md` |

## 14) آلية التحديث المستقبلية
- عند كل أمر تطوير جديد:
  1. تنفيذ التغيير في الكود.
  2. تحديث هذه الوثيقة (القسم 13).
  3. إضافة وصف مختصر للأثر الوظيفي.
