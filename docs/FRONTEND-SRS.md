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
| 2026-04-01 | تقييد واجهة السوبر أدمن + إنشاء SRS | حصر القوائم والمسارات للسوبر أدمن في Dashboard/Fleet/Users/Roles/Privileges، وتوحيد ذلك داخل السايدبار والـ guard والداشبورد، وإنشاء وثيقة SRS | `src/app/core/auth/super-admin.constants.ts`, `src/app/shared/services/layout/sidebar.service.ts`, `src/app/shared/services/auth/privilege.guard.ts`, `src/app/modules/rent/components/dashboard/dashboard/dashboard.component.ts`, `src/app/modules/rent/components/dashboard/dashboard/dashboard.component.html`, `docs/FRONTEND-SRS.md` |
| 2026-04-01 | تمكين تدفق Super Admin (Fleet → Privileges → Role → User) | دعم ربط المستخدم بالأسطول في نموذج المستخدم، تحسين اختيار الصلاحيات داخل نموذج الدور (بحث + تحديد مرئي)، وإضافة وضع الإنشاء الجماعي للصلاحيات داخل صفحة واحدة مع إنشاء متعدد دفعة واحدة | `src/app/modules/rent/models/users/user.model.ts`, `src/app/modules/rent/models/users/user.normalizer.ts`, `src/app/modules/rent/components/users/user-form/user-form.component.ts`, `src/app/modules/rent/components/users/user-form/user-form.component.html`, `src/app/modules/rent/components/users/user-list/user-list.component.ts`, `src/app/modules/rent/components/users/user-list/user-list.component.html`, `src/app/modules/rent/components/roles/role-form/role-form.component.ts`, `src/app/modules/rent/components/roles/role-form/role-form.component.html`, `src/app/modules/rent/components/privileges/privilege-form/privilege-form.component.ts`, `src/app/modules/rent/components/privileges/privilege-form/privilege-form.component.html`, `src/app/modules/rent/components/privileges/privilege-list/privilege-list.component.html`, `docs/FRONTEND-SRS.md` |
| 2026-04-01 | تحديث جدول العملاء ليتوافق مع النموذج المرجعي | إعادة ترتيب أعمدة جدول العملاء لتصبح (رقم العضوية، الاسم العربي، الرقم، تاريخ انتهاء الرخصة، الهوية، الرخصة، تاريخ الميلاد)، إضافة بحث حسب عمود محدد، وتحسين أزرار العمليات مع دعم حذف العميل `SoftDelete` من الجدول | `src/app/modules/rent/components/customers/customer-list/customer-list.component.ts`, `src/app/modules/rent/components/customers/customer-list/customer-list.component.html`, `src/app/modules/rent/components/customers/customer-list/customer-list.component.scss`, `src/app/modules/rent/services/customers/customer.service.ts`, `docs/FRONTEND-SRS.md` |

## 14) آلية التحديث المستقبلية
- عند كل أمر تطوير جديد:
  1. تنفيذ التغيير في الكود.
  2. تحديث هذه الوثيقة (القسم 13).
  3. إضافة وصف مختصر للأثر الوظيفي.
