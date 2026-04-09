# وثيقة المتطلبات البرمجية (SRS) - Rental Management Frontend

## Introduction (المقدمة)

### 1) هدف النظام
يوثّق هذا المستند المتطلبات الوظيفية والتقنية لنظام إدارة وتأجير المركبات مع التكامل المحاسبي، ويحدد سلوك الواجهة الأمامية الحالية، نطاقها، الصلاحيات، العزل حسب الأسطول (`FleetId`)، وآلية التطوير المستقبلي.

### 2) نطاق النظام (Car Rental + Accounting)
الواجهة الأمامية للنظام تشمل نطاقين مترابطين:

#### أ) نطاق إدارة التأجير (Car Rental)
- المصادقة وتسجيل الدخول/الخروج.
- لوحة التحكم.
- إدارة التشغيل: الحجوزات، العملاء.
- الإدارة: المركبات، الفروع، تصنيفات المركبات، الأساطيل.
- الأمن: المستخدمون، الأدوار، الصلاحيات، صلاحياتي.

#### ب) النطاق المالي والمحاسبي (Accounting/Finance)
- البنوك.
- الحسابات النقدية.
- دليل الحسابات (Counting / Chart of Accounts).
- السنوات المالية.
- القيود اليومية.
- السندات/المدفوعات (Payment Counts / Vouchers).

### 3) التعاريف (Definitions)
- `Fleet`: كيان الأسطول الذي تُعزل على أساسه البيانات التشغيلية والمالية.
- `Branch`: فرع تابع لأسطول، ويستخدم في العمليات اليومية والمالية.
- `Booking`: عملية حجز تربط العميل والمركبة والمدة والسعر.
- `Counting`: دليل الحسابات (شجرة الحسابات) المستخدم في القيود وربط الحركات المالية.
- `Payment Count / Voucher`: سند مالي (قبض/صرف) يرتبط بالحجز وقناة الدفع والحسابات.
- `Cash Account`: حساب صندوق/نقدية.
- `Bank`: حساب بنكي مرتبط بدليل الحسابات.
- `FleetId`: معرف الأسطول المستخدم لعزل البيانات في الطلبات.

### 4) المستفيدين (Stakeholders)
- `Admin`: يدير بيانات النظام التشغيلية والإدارية حسب الصلاحيات.
- `Accountant`: يدير الحسابات، السندات، القيود، البنوك، والصناديق.
- `Customer`: مستفيد نهائي من عمليات التأجير عبر دورة الحجز والخدمات المرتبطة.
- `Super Admin` (على مستوى المنصة): يدير الكيانات العليا مثل الأساطيل والصلاحيات العامة.

## Overall Description (الوصف العام)

### 2.1 Product Perspective
النظام عبارة عن منصة ويب متكاملة لإدارة التأجير والمحاسبة تتكوّن من:
- `Frontend`: Angular
- `Backend`: .NET 8 Web API
- `Database`: SQL Server
- `Architecture`: Clean Architecture + CQRS

### 2.2 User Classes
- `Admin`
- `Accountant`
- `Branch Manager`
- `Customer`

### 2.3 Operating Environment
- `Web App` يعمل عبر المتصفح.
- `Browser` (بيئة عميل) لعرض الواجهة وتشغيل التدفقات.
- `API Server` لتوفير الخدمات والعمليات وتكامل البيانات.

## 3) System Features (المزايا والخصائص الأساسية للنظام)

### 3.1 Authentication & Session Management
- تسجيل الدخول عبر `accessToken` وإدارة الجلسة.
- استعادة الجلسة خلال مهلة سماح قصيرة بعد إغلاق التطبيق.
- تسجيل الخروج وتنظيف بيانات الجلسة محليًا.

### 3.2 Authorization (RBAC)
- التحكم بالوصول حسب الصلاحيات والأدوار.
- دعم مسارات محمية عبر `privilegeGuard`.
- تقييد سلوك `Super Admin` على مسارات محددة حسب سياسة النظام الحالية.

### 3.3 Dashboard
- عرض مؤشرات تشغيلية ومالية أساسية.
- اختصارات تنقل سريعة للصفحات المسموحة حسب الصلاحية.
- سلوك مختلف حسب نوع المستخدم وصلاحياته.

### 3.4 Fleet & Branch Management
- إدارة الأساطيل (إضافة/تعديل/عرض/بحث).
- إدارة الفروع وربطها بالأسطول.
- دعم عزل البيانات حسب `FleetId`.

### 3.5 Vehicle & Category Management
- إدارة المركبات (CRUD + حالة المركبة + حذف منطقي).
- إدارة تصنيفات المركبات ونطاقات الأسعار والحدود التشغيلية.
- دعم رفع الصور والتحقق من النوع/الحجم ومعالجة العرض.

### 3.6 Customer & Booking Management
- إدارة العملاء وبيانات الهوية والرخصة والمعلومات التشغيلية.
- إدارة الحجوزات وربط (عميل/مركبة/فرع/فترة/قيمة).
- تدفق تشغيلي متكامل من إنشاء الحجز حتى ربطه بالعمليات المالية.

### 3.7 Security Administration
- إدارة المستخدمين.
- إدارة الأدوار.
- إدارة الصلاحيات.
- عرض "صلاحياتي" لتوضيح الوصول الفعلي للمستخدم.

### 3.8 Finance - Chart of Accounts (Counting)
- إدارة شجرة الحسابات (عرض هرمي، بحث، توسيع/طي).
- دعم إنشاء/تعديل/حذف حسابات الدليل.
- دعم التهيئة/المزامنة الهيكلية حسب قوالب محاسبية.
- ربط منطقي بين رقم الحساب، نوع الحساب، الحساب الأب، والمستوى.
- قيود تحقق على نطاقات الترقيم حسب نوع الحساب.

### 3.9 Finance - Cash & Bank Accounts
- إدارة حسابات الصندوق وربطها بدليل الحسابات.
- إدارة الحسابات البنكية وربطها بدليل الحسابات.
- تحميل مرن للحسابات مع مسارات بديلة عند تعثر `FleetId`.

### 3.10 Finance - Payment Counts (Vouchers)
- إنشاء سندات مالية وربطها بالحجز/العميل/الفرع.
- دعم أنواع الدفع المتعددة (نقدي/شبكة/شيك/تحويل بنكي/بنك-كاش).
- تفعيل/تعطيل حقول البنك/النقدي ديناميكيًا حسب نوع الدفع.
- تطبيق قواعد عمل تربط حالة الدفع (مؤكد/معلق) بإلزام اختيار الحساب المناسب.
- دعم اقتراح القيد المحاسبي وفق الغرض المحاسبي وقناة التحصيل.

### 3.11 Finance - Journals & Financial Years
- إدارة القيود اليومية وعرض السجلات.
- إدارة السنوات المالية وربطها بالسياق المحاسبي.
- عرض قوائم مالية موحدة مع حالة فارغة ورسائل أخطاء متسقة.

### 3.12 Internationalization & Theming
- دعم لغتين (العربية/الإنجليزية) مع `RTL/LTR`.
- فصل ترجمات الموديولات عبر ملفات `i18n/modules`.
- دعم الثيم الفاتح/الداكن مع تحسين التباين وقابلية القراءة.

### 3.13 UX Consistency
- مكوّن قوائم منسدلة موحد (`Smooth Select`) عبر النظام.
- معالجة التداخل الطبقي (`z-index/overflow`) لضمان ظهور القوائم فوق الحقول.
- تحسين وضوح الخطوط والعناصر في صفحات الشجرات والجداول.

## 4) External Interface Requirements (متطلبات الواجهات الخارجية)

### 4.1 User Interfaces (UI)
- واجهة ويب تفاعلية مبنية على Angular مع دعم `RTL/LTR`.
- نماذج إدخال موحدة (حقول نصية/رقمية/قوائم منسدلة/رسائل تحقق).
- جداول عرض موحدة مع حالة تحميل/فراغ/خطأ.
- مكوّنات مشاركة رئيسية:
  - `Page Header`
  - `Smooth Select`
  - `Empty State`
  - `Pagination Bar`
- دعم الثيمين الفاتح/الداكن مع متطلبات وضوح النصوص والتباين.

### 4.2 Software Interfaces (Backend API)
- التكامل مع REST API عبر المسار الأساسي:
  - `Api/V1/CarRentalManagament/*`
- نمط الاستجابة القياسي:
  - `Result<T>` يتضمن (`data`, `succeeded`, `errors`, `propertyErrors`).
- واجهات رئيسية متكاملة في النطاق المالي:
  - `Counting/*`
  - `Bank/*`
  - `Cash/*`
  - `Paymentcount/*`
  - `Journal/*`
  - `FinancialYear/*`
- دعم مرونة أسماء الباراميترات حسب الـ API (مثل `FleetId` و`IdFleet`) عند الحاجة.

### 4.3 Data Interfaces (Data Contracts)
- نماذج بيانات Typed في الفرونت لكل موديول.
- Normalizers لتحويل صيغ الاستجابة المختلفة إلى نموذج موحد في الواجهة.
- عقود إنشاء/تعديل (`Create/Update Request DTOs`) متوافقة مع الباكند.
- دعم إرسال الحقول بصيغة `camelCase` و`PascalCase` في بعض الخدمات لضمان التوافق.

### 4.4 Authentication & Authorization Interfaces
- واجهة مصادقة تعتمد `JWT accessToken`.
- استخراج claims (مثل `fleetId`, `branchId`, `roles`, `privileges`) من التوكن.
- حماية المسارات عبر `guards` حسب الدور والصلاحية.
- تطبيق عزل البيانات وفق `FleetId` في طبقة الخدمات.

### 4.5 Browser & Client Interfaces
- متوافق مع بيئة متصفح حديثة (Desktop Web).
- إدارة التخزين المحلي للجلسة والمشتقات (`localStorage`) وفق سياسة الأمان الحالية.
- معالجة أخطاء HTTP وعرضها للمستخدم عبر `Toast` بشكل موحد.

## 5) Non-Functional Requirements (المتطلبات غير الوظيفية)

### 5.1 Performance (الأداء)
- زمن استجابة واجهة المستخدم يجب أن يكون سلسًا في التنقلات والعمليات اليومية الشائعة.
- تحميل القوائم والجداول يجب أن يدعم `List/Paginated` لتقليل الحمل على الواجهة.
- تقليل إعادة الرسم الثقيلة خصوصًا في الثيم الغامق والمكونات عالية التفاعل.

### 5.2 Reliability & Availability (الاعتمادية والتوفر)
- الواجهة لا يجب أن تتعطل بالكامل بسبب فشل Endpoint واحد.
- توفير مسارات بديلة (`fallback`) عند فشل بعض الطلبات المرتبطة بعزل `FleetId`.
- الرسائل الخطأ يجب أن تكون مفهومة وقابلة للتتبع للمستخدم والمطور.

### 5.3 Security (الأمان)
- الاعتماد على `JWT` لإثبات الهوية والتحكم بالوصول.
- تفعيل الحماية على المسارات والعمليات وفق `roles/privileges`.
- عدم تسريب بيانات خارج سياق الأسطول المصرح به (`FleetId isolation`).
- التحقق من الإدخالات في النماذج قبل الإرسال (قواعد إلزام/مدى/تنسيق).

### 5.4 Usability & Accessibility (قابلية الاستخدام وإمكانية الوصول)
- دعم العربية والإنجليزية مع `RTL/LTR` بشكل متسق.
- واجهة واضحة في الثيمين الفاتح/الداكن مع تباين مناسب للنصوص.
- تحسين قابلية القراءة (خطوط، ألوان، رسائل الحالة الفارغة) خصوصًا للمستخدمين كبار السن.
- توحيد سلوك القوائم المنسدلة والنماذج لتقليل أخطاء الاستخدام.

### 5.5 Maintainability (القابلية للصيانة)
- تنظيم الموديولات والخدمات والنماذج بشكل قابل للتوسعة.
- استخدام `normalizers` لعزل اختلافات استجابات الـ API.
- توثيق التغييرات في SRS بشكل مستمر ضمن سجل التحديثات.
- الاعتماد على مكونات مشتركة لتقليل التكرار وتسهيل الصيانة.

### 5.6 Scalability (القابلية للتوسع)
- التصميم الحالي يسمح بإضافة موديولات جديدة دون كسر البنية القائمة.
- دعم توسعة الشاشات والجداول والخيارات المحاسبية مع نمو متطلبات العمل.
- قابلية إضافة سياسات أعمال جديدة في طبقة الواجهة دون إعادة بناء النظام بالكامل.

### 5.7 Compatibility (التوافق)
- توافق مع المتصفحات الحديثة المعتمدة في بيئة التشغيل.
- تكامل مستقر مع API المبني على `.NET 8` وقاعدة بيانات `SQL Server`.
- توافق مفاتيح الترجمة عبر `i18n/modules` بين الوحدات المختلفة.

## 6) Database Design (تصميم قاعدة البيانات)

> ملاحظة: الواجهة الأمامية لا تدير مخطط قاعدة البيانات مباشرة، لكنها تعتمد على عقود API المرتبطة بكيانات SQL Server. لذلك هذا القسم يوثّق التصميم المنطقي المتوقع والمتوافق مع التدفقات الحالية.

### 6.1 قاعدة البيانات المستهدفة
- `DBMS`: SQL Server
- `Pattern`: Relational schema
- `Key Strategy`: مفاتيح رئيسية رقمية/Guid حسب الكيان
- `Soft Delete`: مدعوم في عدة كيانات عبر حقول مثل `IsDeleted`, `DeletedAt`, `DeletedBy`

### 6.2 الكيانات الرئيسية (Logical Entities)

#### أ) كيانات التأجير والتشغيل
- `Fleet`
- `Branch`
- `Vehicle`
- `CategoryVehicle`
- `Customer`
- `Booking`
- `CustomerSubscription`

#### ب) كيانات المالية والمحاسبة
- `Counting` (Chart of Accounts)
- `Bank`
- `CashAccount`
- `Paymentcount` (Voucher/Payment)
- `Journal` (Journal Entry)
- `FinancialYear`

#### ج) كيانات الأمن وإدارة الوصول
- `User`
- `Role`
- `PrivilegeType`
- `UserRole`
- `UserPrivilege`
- `PrivilegeTypeRole`

### 6.3 العلاقات الأساسية (High-Level Relationships)
- `Fleet (1) -> (N) Branch`
- `Fleet (1) -> (N) Vehicle`
- `Branch (1) -> (N) Vehicle`
- `CategoryVehicle (1) -> (N) Vehicle`
- `Customer (1) -> (N) Booking`
- `Vehicle (1) -> (N) Booking`
- `Counting (1) -> (N) Bank/CashAccount` عبر `CountingId`
- `Booking/Customer/Branch (1..N) -> Paymentcount`
- `User (N) <-> (N) Role` عبر `UserRole`
- `Role (N) <-> (N) PrivilegeType` عبر `PrivilegeTypeRole`

### 6.4 عزل البيانات حسب الأسطول (Fleet Isolation)
- معظم الكيانات التشغيلية والمالية مرتبطة بـ `FleetId`.
- جميع عمليات القراءة/الكتابة الحساسة يجب أن تُفلتر/تتحقق باستخدام `FleetId`.
- الواجهة تعتمد هذا العزل بإرسال `FleetId` (وأحيانًا `IdFleet`) حسب متطلبات الـ API.

### 6.5 اعتبارات تصميمية مهمة
- استخدام `Guid` في كيانات الربط المالية الحساسة (مثل `CountingId`, `BankId`, `CashId`) لضمان مرجعية دقيقة.
- اعتماد `CreatedAt/UpdatedAt` للتدقيق الزمني.
- اعتماد `CreatedBy/UpdatedBy` للتدقيق الوظيفي.
- دعم `Soft Delete` لمنع فقدان السجلات التاريخية.

### 6.6 ملاحظات اتساق مع الواجهة الحالية
- نماذج الفرونت تعتمد normalizers للتعامل مع اختلافات تسمية الحقول (`camelCase/PascalCase`).
- بعض Endpoints تقبل أو تتطلب أسماء باراميترات مختلفة (`FleetId` و`IdFleet`) ويتم دعمها في طبقة الخدمات.
- سلوك القوائم المالية (Bank/Cash/Paymentcount) مبني على وجود علاقات صحيحة مع `Counting` و`Fleet`.

## 7) Business Rules (قواعد الأعمال)

### 7.1 قواعد عامة للنظام
- كل عملية إنشاء/تعديل/حذف تخضع للصلاحيات (`Role/Privilege`) قبل التنفيذ.
- لا يجوز للمستخدم الوصول إلى بيانات خارج سياق الأسطول المصرح له (`FleetId`).
- البيانات المرجعية (مثل الحسابات/الفروع/المركبات) يجب أن تكون فعّالة وغير محذوفة منطقيًا قبل استخدامها.

### 7.2 قواعد التأجير (Rental Domain)
- لا يتم إنشاء حجز بدون عميل، مركبة، فرع، وفترة صالحة.
- المركبة غير المتاحة أو المحذوفة لا يمكن استخدامها في حجز جديد.
- الحجز يجب أن يرتبط بأسطول واحد فقط (`FleetId`) طوال دورة حياته.

### 7.3 قواعد دليل الحسابات (Counting)
- رقم الحساب يجب أن يقع ضمن نطاق نوع الحساب:
  - الأصول `1000–1999`
  - الالتزامات `2000–2999`
  - حقوق الملكية `3000–3999`
  - الإيرادات `4000–4999`
  - المصروفات `5000–5999`
- لا يجوز أن يكون الحساب أبًا لنفسه.
- في وضع الإضافة، علاقة `رقم الحساب` و`الحساب الأب` يجب أن تبقى منطقية داخل نفس الشجرة.
- عند التهيئة/المزامنة:
  - التهيئة تضيف الحسابات الناقصة فقط.
  - المزامنة تضيف الناقص وتحدّث الحسابات غير المتطابقة مع القالب.

### 7.4 قواعد الحسابات البنكية والنقدية
- كل حساب بنك/صندوق يجب أن يرتبط بحساب صحيح في دليل الحسابات (`CountingId` GUID).
- لا يتم قبول ربط بحساب محذوف أو غير متاح ضمن سياق الأسطول.
- عند تعذّر تحميل البيانات المقيّدة بأسطول محدد، يسمح النظام بمسار fallback للقراءة فقط وفق السياسة الحالية.

### 7.5 قواعد السندات والمدفوعات (Paymentcount / Voucher)
- نوع الدفع يحدد قناة التحصيل:
  - `Cash` => نقدي
  - `Network/POS`, `Cheque`, `Bank Transfer` => بنكي
  - `Bank/Cash` => مختلط
- حالة الدفع تحدد مستوى الإلزام:
  - `Confirmed` (مؤكد): يجب اختيار الحساب/الحسابات المناسبة حسب نوع الدفع.
  - `Pending` (معلق): يمكن تخفيف الإلزام مؤقتًا حسب السياسة.
- قواعد إلزام الحساب عند `Confirmed`:
  - `Cash`: `Cash Account ID` إلزامي.
  - `Network/POS` أو `Cheque` أو `Bank Transfer`: `Bank ID` إلزامي.
  - `Bank/Cash`: يجب اختيار واحد على الأقل من (`Cash Account ID` أو `Bank ID`).
- القيم غير المتوافقة مع نوع الدفع يجب تصفيرها/مسحها عند تغيير النوع (مثل `paidCash` أو `paidBank`).

### 7.6 قواعد القيود المحاسبية المقترحة
- النظام يقترح قيدًا محاسبيًا (مدين/دائن) بناءً على:
  - `Accounting Purpose`
  - `Collection Channel` الناتجة من نوع الدفع
- الاقتراح إرشادي ويجب أن يبقى قابلًا للتعديل وفق سياسة المنشأة.

### 7.7 قواعد الحالات الفارغة والأخطاء
- عند عدم وجود بيانات، يجب عرض رسالة موحّدة واضحة:
  - `لم يتم إرجاع أي سجلات ضمن سياق الأسطول الحالي.`
- عند فشل الطلبات، يجب إظهار رسالة خطأ مفهومة دون كسر الصفحة بالكامل.

### 7.8 قواعد الترجمة والتجربة الموحدة
- النصوص والخيارات يجب أن تعتمد ملفات الترجمة المنظمة (`i18n/modules`) وليس نصوصًا hardcoded.
- أي خيار في القوائم المنسدلة يجب أن يظهر حسب اللغة المختارة.
- في الثيم الغامق، يجب الحفاظ على وضوح النصوص والرسائل ذات الأولوية التشغيلية.

## 8) Use Cases / User Flows (حالات الاستخدام وتدفقات العمل)

### UC-01: تسجيل الدخول والوصول حسب الصلاحية
**الممثل الأساسي:** Admin / Accountant / Branch Manager  
**المتطلبات المسبقة:** وجود حساب فعّال.  
**التدفق الرئيسي:**
1. المستخدم يدخل بيانات الدخول.
2. النظام يتحقق من الهوية ويولد جلسة `JWT`.
3. النظام يحمّل الأدوار والصلاحيات و`FleetId`.
4. تظهر للمستخدم فقط الصفحات والوظائف المسموحة.  
**النتيجة:** دخول ناجح مع واجهة مفلترة حسب الصلاحيات.

### UC-02: إنشاء حجز (Booking)
**الممثل الأساسي:** Admin / Branch Manager  
**المتطلبات المسبقة:** عميل ومركبة وفرع متاحين ضمن نفس الأسطول.  
**التدفق الرئيسي:**
1. اختيار العميل والمركبة والفترة.
2. إدخال بيانات السعر والشروط.
3. حفظ الحجز.
4. ظهور الحجز في قائمة الحجوزات وربطه بالسياق التشغيلي.  
**النتيجة:** حجز جديد صالح للتعامل المالي لاحقًا.

### UC-03: إنشاء/تعديل حساب في دليل الحسابات
**الممثل الأساسي:** Accountant  
**المتطلبات المسبقة:** صلاحية الوصول إلى صفحة `Counting`.  
**التدفق الرئيسي:**
1. فتح صفحة الدليل المحاسبي.
2. إدخال رقم الحساب ونوعه.
3. اختيار الحساب الأب المناسب.
4. النظام يتحقق من نطاق الترقيم والمنطق الهرمي.
5. حفظ الحساب.  
**النتيجة:** إضافة/تعديل حساب ضمن شجرة صحيحة.

### UC-04: تهيئة/مزامنة الشجرة المحاسبية
**الممثل الأساسي:** Accountant  
**المتطلبات المسبقة:** وجود قوالب الحسابات الأساسية.  
**التدفق الرئيسي:**
1. اختيار فرع محاسبي (أصول/التزامات/إيرادات/مصروفات...).
2. تنفيذ التهيئة (Seed) لإضافة الحسابات الناقصة.
3. تنفيذ المزامنة (Sync) عند الحاجة لمطابقة القالب.
4. تحديث الشجرة بصريًا في الواجهة.  
**النتيجة:** شجرة حسابات مكتملة ومطابقة للهيكل القياسي.

### UC-05: إضافة حساب بنك
**الممثل الأساسي:** Accountant  
**المتطلبات المسبقة:** وجود حسابات في دليل الحسابات.  
**التدفق الرئيسي:**
1. فتح نموذج إضافة بنك.
2. اختيار `CountingId` من قائمة الحسابات.
3. إدخال الاسم/الوصف/الكود.
4. حفظ السجل عبر API.  
**النتيجة:** إنشاء حساب بنك مرتبط بحساب محاسبي صحيح.

### UC-06: إضافة حساب صندوق
**الممثل الأساسي:** Accountant  
**المتطلبات المسبقة:** وجود حسابات في دليل الحسابات.  
**التدفق الرئيسي:**
1. فتح نموذج إضافة صندوق.
2. اختيار `CountingId`.
3. إدخال البيانات الأساسية.
4. حفظ السجل.  
**النتيجة:** إنشاء حساب صندوق مرتبط محاسبيًا.

### UC-07: إنشاء سند (Payment Voucher)
**الممثل الأساسي:** Accountant  
**المتطلبات المسبقة:** وجود حجز/عميل/فرع صالحين، وتوفر حسابات بنك/صندوق عند الحاجة.  
**التدفق الرئيسي:**
1. إدخال بيانات السند الأساسية (حجز، عميل، مبلغ، فرع...).
2. اختيار `Payment Type`.
3. النظام يفعّل/يعطّل حقول `Cash Account` و`Bank ID` حسب نوع الدفع.
4. اختيار `Payment Status` (مؤكد/معلق).
5. عند `مؤكد`: يفرض النظام اختيار الحساب المناسب حسب نوع الدفع.
6. حفظ السند.
7. عرض القيد المحاسبي المقترح وفق الغرض المحاسبي وقناة التحصيل.  
**النتيجة:** سند صحيح وظيفيًا ومحاسبيًا.

### UC-08: عرض القوائم المالية وحالة الفراغ
**الممثل الأساسي:** Accountant / Admin  
**المتطلبات المسبقة:** صلاحية عرض الصفحة.  
**التدفق الرئيسي:**
1. فتح قائمة (بنوك/صناديق/سندات/قيود/سنوات مالية).
2. إذا لا توجد بيانات، يظهر `Empty State` موحد.
3. إذا حدث خطأ، تظهر رسالة خطأ واضحة دون كسر الصفحة.  
**النتيجة:** تجربة عرض مستقرة وموحدة عبر كل صفحات المالية.

### UC-09: تبديل اللغة
**الممثل الأساسي:** أي مستخدم  
**المتطلبات المسبقة:** وجود ملفات ترجمة للموديول.  
**التدفق الرئيسي:**
1. المستخدم يغير اللغة (AR/EN).
2. يتم تحديث النصوص والخيارات والقوائم المنسدلة مباشرة.
3. يطبق اتجاه الواجهة المناسب (`RTL/LTR`).  
**النتيجة:** واجهة مترجمة بالكامل حسب اللغة المختارة.

## 9) Validation Matrix (مصفوفة التحقق)

| الموديول | الحقل / الكيان | قاعدة التحقق | متى تطبق | رسالة التحقق المتوقعة |
|---|---|---|---|---|
| Auth | بيانات تسجيل الدخول | الحقول الإلزامية غير فارغة | قبل الإرسال | بيانات الدخول مطلوبة |
| Rental - Booking | `Customer`, `Vehicle`, `Branch` | لا يُنشأ الحجز بدون مراجع صالحة | إنشاء/تعديل حجز | بيانات الحجز غير مكتملة |
| Rental - Booking | `Vehicle` | المركبة يجب أن تكون متاحة وغير محذوفة | إنشاء حجز | المركبة غير متاحة للحجز |
| Finance - Counting | `countingNumber` | رقم الحساب ضمن نطاق النوع | إنشاء/تعديل حساب | رقم الحساب يجب أن يكون ضمن نطاق نوع الحساب |
| Finance - Counting | `countingMain` مقابل `countingNumber` | لا يجوز أن يكون الحساب أبًا لنفسه | حفظ الحساب | لا يمكن جعل الحساب أبًا لنفسه |
| Finance - Counting | `countingMain` | الأب يجب أن يكون منطقيًا ضمن نفس الشجرة/النوع | وضع الإضافة | يرجى اختيار حساب أب صحيح |
| Finance - Counting | Seed/Sync | التهيئة تضيف الناقص فقط، والمزامنة تحدث غير المتطابق | تنفيذ أوامر التهيئة/المزامنة | رسائل نجاح/تحذير حسب عدد الإضافات/التحديثات |
| Finance - Bank | `countingId` | يجب أن يكون `GUID` صالحًا مرتبطًا بـ Counting | إنشاء بنك | معرف الحساب غير صالح |
| Finance - Cash | `countingId` | يجب أن يكون `GUID` صالحًا مرتبطًا بـ Counting | إنشاء صندوق | معرف الحساب غير صالح |
| Finance - Paymentcount | `paymentType` | تحديد نوع دفع صالح من القائمة | إنشاء سند | نوع الدفع مطلوب |
| Finance - Paymentcount | `status` | تحديد حالة دفع (مؤكد/معلق) | إنشاء سند | حالة الدفع مطلوبة |
| Finance - Paymentcount | `idCash` | إلزامي عند `Confirmed + Cash` | قبل الحفظ | يجب اختيار الحساب النقدي |
| Finance - Paymentcount | `idBank` | إلزامي عند `Confirmed + Network/Cheque/Transfer` | قبل الحفظ | يجب اختيار الحساب البنكي |
| Finance - Paymentcount | `idCash` أو `idBank` | واحد على الأقل إلزامي عند `Confirmed + Bank/Cash` | قبل الحفظ | اختر حسابًا نقديًا أو بنكيًا واحدًا على الأقل |
| Finance - Paymentcount | `idCash/idBank` + `paidCash/paidBank` | تصفير/مسح الحقول غير المتوافقة مع نوع الدفع | عند تغيير نوع الدفع | تحديث تلقائي للحقل غير النشط |
| Finance - Lists | حالة الفراغ | إظهار رسالة موحدة عند عدم وجود سجلات | عرض القوائم بدون بيانات | لم يتم إرجاع أي سجلات ضمن سياق الأسطول الحالي. |
| i18n | خيارات القوائم | يجب أن تُحمّل من `i18n/modules` حسب اللغة | وقت العرض | النص يظهر بالعربية/الإنجليزية حسب اللغة |

## 10) API Contract Mapping (Frontend ↔ Backend)

### 10.1 نمط التكامل العام
- `Base URL`: `Api/V1/CarRentalManagament/*`
- `Response Envelope`: غالبًا `Result<T>` (مع دعم حالات `T` المباشر في `BaseService`).
- `Fleet Filtering`: إرسال `FleetId` و/أو `IdFleet` حسب متطلبات الـ endpoint.
- `Case Compatibility`: دعم `camelCase` و`PascalCase` في بعض طلبات الإنشاء/التحديث لضمان التوافق.

### 10.2 Finance - Counting
| العملية | Endpoint | Frontend Service | ملاحظات العقد |
|---|---|---|---|
| List | `GET /Counting/List` | `CountingEntryService.getList` | يدعم فلترة الأسطول (`FleetId/IdFleet`) |
| Paginated | `GET /Counting/Paginated` | `CountingEntryService.getPaginated` | باراميترات paging/search/order |
| Get By Id | `GET /Counting/{id}/{fleetid}` | `CountingEntryService.getById` | `id` و`fleetid` في المسار |
| Create | `POST /Counting` | `CountingEntryService.create` | يرسل payload متوافق بالحالتين (`camel` + `Pascal`) |
| Update | `PUT /Counting/{id}` | `CountingEntryService.update` | تحديث بنفس استراتيجية التوافق |
| Delete/SoftDelete | `DELETE/PATCH` حسب الدعم | `CountingEntryService.softDelete` | مسارات fallback متعددة لتوافق الباكند |

### 10.3 Finance - Bank
| العملية | Endpoint | Frontend Service | ملاحظات العقد |
|---|---|---|---|
| List | `GET /Bank/List` | `BankService.getList` | يعتمد عزل الأسطول |
| Create | `POST /Bank` | `BankService.create` | `countingId` يجب أن يكون `GUID` صحيح |

### 10.4 Finance - Cash
| العملية | Endpoint | Frontend Service | ملاحظات العقد |
|---|---|---|---|
| List | `GET /Cash/List` | `CashAccountService.getList` | يعتمد عزل الأسطول |
| Create | `POST /Cash` | `CashAccountService.create` | ربط مباشر بـ `countingId` |

### 10.5 Finance - Paymentcount (Vouchers)
| العملية | Endpoint | Frontend Service | ملاحظات العقد |
|---|---|---|---|
| List | `GET /Paymentcount/List` | `PaymentCountService.getList` | يدعم `FleetId/IdFleet` و`BranchId` |
| Paginated | `GET /Paymentcount/Paginated` | `PaymentCountService.getPaginated` | paging/search/order + fleet params |
| Get By Id | `GET /Paymentcount/{id}/{fleetid}` | `PaymentCountService.getById` | مطابق لمواصفة المسار |
| Create | `POST /Paymentcount` | `PaymentCountService.create` | payload شامل حقول السند + التوافق `camel/Pascal` |

### 10.6 Finance - Journals / Financial Years
| العملية | Endpoint (Logical) | Frontend Service | ملاحظات العقد |
|---|---|---|---|
| Journal List/Create | `Journal/*` | `JournalEntryService` | عرض/إنشاء قيود حسب صلاحية المستخدم |
| Financial Year List/Create | `FinancialYear/*` | `FinancialYearService` | إدارة الفترات المالية |

### 10.7 Rental Modules (High-Level)
| الموديول | Endpoint Family | ملاحظات |
|---|---|---|
| Fleet | `Fleet/*` | كيان العزل الرئيسي |
| Branches | `Branch/*` | مرتبط بـ Fleet |
| Vehicles | `Vehicle/*` | يدعم إدارة الحالة والحذف المنطقي |
| Category Vehicles | `CategoryVehicle/*` | مرجع تسعيري وتشغيلي |
| Customers | `Customer/*` | بيانات عميل وربط تشغيلي |
| Booking | `Booking/*` | دورة الحجز والربط المالي |

### 10.8 Contract Risk Notes
- اختلاف أسماء الباراميترات (`FleetId` مقابل `IdFleet`) قد يسبب فشل إن لم يُراعَ في الخدمة.
- اختلاف case في مفاتيح body قد يسبب رفض في بعض handlers؛ لذلك استخدم الفرونت payload مزدوج التسمية في الخدمات الحساسة.
- عند فشل القراءة المقيّدة بأسطول، يمكن للواجهة استخدام fallback قراءة وفق سياسة النظام دون كسر التدفق.

## 11) Security, Audit & Compliance (الأمان والتدقيق والامتثال)

### 11.1 Authentication Security
- المصادقة تعتمد `JWT accessToken` كآلية دخول أساسية.
- تخزين التوكن يتم محليًا وفق سياسة التطبيق الحالية، مع إدارة جلسة واستعادة ضمن مهلة زمنية قصيرة.
- في حال انتهاء صلاحية الجلسة أو التوكن، يجب إعادة توجيه المستخدم إلى تسجيل الدخول.

### 11.2 Authorization Security (RBAC)
- كل شاشة/عملية محمية عبر `roles/privileges`.
- يمنع الوصول إلى المسارات غير المصرح بها عبر `guards`.
- سلوك `Super Admin` يتم تقييده إلى المسارات المعتمدة في النسخة الحالية من الواجهة.

### 11.3 Data Isolation & Access Control
- `FleetId` هو حد العزل الرئيسي للبيانات التشغيلية والمالية.
- يجب أن تُرسل معاملات الأسطول في الطلبات الحساسة (`FleetId` أو `IdFleet`).
- لا يجوز عرض أو تعديل سجلات خارج سياق الأسطول المصرح للمستخدم.

### 11.4 Input Validation & Request Safety
- جميع النماذج تعتمد تحققًا مسبقًا قبل الإرسال (حقول إلزامية/مدى/علاقات منطقية).
- قواعد الأعمال الحرجة (مثل نوع الدفع مقابل حساب البنك/النقد) تطبق قبل إنشاء السند.
- في العمليات الحساسة، يستخدم الفرونت payload متوافق (camel/Pascal) لتفادي أخطاء تعاقدية غير مقصودة.

### 11.5 Auditability (التدقيق)
- الكيانات الجوهرية تدعم حقول تدقيق زمنية ووظيفية مثل:
  - `CreatedAt`, `UpdatedAt`
  - `CreatedBy`, `UpdatedBy`
- التحديثات في SRS يجب أن توثق التغييرات ذات الأثر الوظيفي/الأمني.

### 11.6 Soft Delete & Data Retention
- الحذف المنطقي (`IsDeleted`, `DeletedAt`, `DeletedBy`) معتمد في كيانات متعددة.
- الواجهة تتعامل مع السجلات المحذوفة بعزلها عن القوائم التشغيلية.
- الحفاظ على السجل التاريخي مطلوب لغايات المحاسبة والتتبع.

### 11.7 Error Handling Compliance
- رسائل الأخطاء يجب أن تكون واضحة للمستخدم، دون كشف تفاصيل داخلية حساسة.
- فشل endpoint مفرد لا يجب أن يكسر الصفحة كاملة؛ يجب توفير fallback حيثما أمكن.

### 11.8 Internationalization & Compliance Readability
- كل النصوص التشغيلية يجب أن تمر عبر نظام الترجمة الرسمي (`i18n/modules`).
- في الوضع الداكن، الرسائل الحرجة وحالات الفراغ يجب أن تبقى ذات تباين واضح.
- الرسالة الموحدة لحالة عدم وجود بيانات المالية:
  - `لم يتم إرجاع أي سجلات ضمن سياق الأسطول الحالي.`

## 12) Assumptions, Constraints & Dependencies (الافتراضات والقيود والاعتماديات)

### 12.1 Assumptions (الافتراضات)
- الـ Backend API متاح ويعمل باستقرار على المسارات المتفق عليها.
- بيانات التوكن تحتوي claims الأساسية المطلوبة للتشغيل (`fleetId`, `branchId`, `roles`, `privileges`).
- المستخدم النهائي يعمل على متصفح حديث يدعم متطلبات Angular الحالية.
- ملفات الترجمة لكل موديول يتم تحديثها تزامنيًا مع أي إضافة نصوص جديدة.
- العلاقات الأساسية بين الكيانات (مثل `CountingId` للبنك/الصندوق) محفوظة بشكل صحيح في البيانات المصدرية.

### 12.2 Constraints (القيود)
- الواجهة الحالية تعتمد عقود API قائمة؛ أي تغييرات جذرية في الـ backend تتطلب مواءمة في الخدمات والـ normalizers.
- اختلاف تسمية بعض الحقول والباراميترات (`FleetId`/`IdFleet`, `camelCase`/`PascalCase`) يمثل قيد توافق يجب مراعاته دائمًا.
- بعض السلوكيات الوظيفية (مثل fallback عند فشل التصفية بالأسطول) مقيدة بسياسات الإصدار الحالي.
- دعم Super Admin في الواجهة الحالية مقيد بمسارات محددة وليس وصولًا كاملًا لكل الوحدات.
- الأداء وتجربة المستخدم تتأثران مباشرة بكثافة البيانات وجودة استجابة الـ API.

### 12.3 Dependencies (الاعتماديات)
- **Frontend Framework:** Angular
- **UI/State/Forms:** Reactive Forms + Signals + Shared UI Components
- **i18n:** `@ngx-translate` + `public/assets/i18n/modules/*`
- **Backend Integration:** .NET 8 API (`Api/V1/CarRentalManagament/*`)
- **Database:** SQL Server (عبر واجهات API وليس اتصال مباشر من الفرونت)
- **Auth:** JWT + Local Storage token/session handling
- **Architecture Dependencies:** Clean Architecture + CQRS في الباكند

### 12.4 Operational Dependencies
- توافر الشبكة والاتصال بين العميل وAPI Server.
- توافر إعدادات البيئة (`environment`) الصحيحة لمسارات الـ API.
- توافق إعدادات `FleetId` في الجلسة مع صلاحيات المستخدم الفعلية.
- استقرار بيانات المرجع (Branches, Counting, Cash/Bank) لضمان نجاح تدفقات السندات والقيود.

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
| 2026-04-07 | تحسين دليل الحسابات (هيكل الشجرة + الترجمة + العلاقة بين الحقول) | تحسين تجربة دليل الحسابات عبر: تلوين المستويات وإضافة `Legend` تفاعلي للتصفية حسب المستوى، تحسين وضوح الخط لكبار السن، تبديل موضع الشجرة مع نموذج الحساب، إصلاح ظهور القوائم المنسدلة فوق الحقول، ربط منطقي بين `رقم الحساب` و`الحساب الأب` في وضع الإضافة، وإصلاح نص نطاق الترقيم المترجم | `src/app/modules/finance/components/counting/counting-entry-list/counting-entry-list.component.ts`, `src/app/modules/finance/components/counting/counting-entry-list/counting-entry-list.component.html`, `src/app/modules/finance/components/counting/counting-entry-list/counting-entry-list.component.scss`, `src/app/shared/ui/smooth-select/smooth-select.component.ts`, `src/app/shared/ui/smooth-select/smooth-select.component.scss`, `docs/FRONTEND-SRS.md` |
| 2026-04-07 | مواءمة تدفقات المالية (بنك/صندوق/سندات) مع API وتحسين i18n والحالة الفارغة | مواءمة نماذج البنك والصندوق والسندات مع API عبر إرسال `countingId` كـ `GUID`، تحسين تحميل الحسابات مع `fallback` عند فشل `FleetId`، إضافة منطق أعمال يربط `نوع الدفع` و`حالة الدفع` بتفعيل/إلزام حساب النقد/البنك، تحديث خيارات `Payment Type` (نقدا/شبكة/شيك/تحويل بنكي/بنك-كاش)، دعم ترجمتها عبر ملفات `i18n/modules`، مواءمة `Paymentcount` service (`List/Paginated/GetById/Post`) مع أسماء الحقول والباراميترات، وتوحيد رسالة الحالة الفارغة في صفحات المالية وتحسين وضوحها في الثيم الغامق | `src/app/modules/finance/components/banks/bank-form/bank-form.component.ts`, `src/app/modules/finance/components/banks/bank-form/bank-form.component.html`, `src/app/modules/finance/components/cash/cash-account-form/cash-account-form.component.ts`, `src/app/modules/finance/components/cash/cash-account-form/cash-account-form.component.html`, `src/app/modules/finance/components/payment-counts/payment-count-form/payment-count-form.component.ts`, `src/app/modules/finance/components/payment-counts/payment-count-form/payment-count-form.component.html`, `src/app/modules/finance/components/payment-counts/payment-count-list/payment-count-list.component.ts`, `src/app/modules/finance/services/payment-counts/payment-count.service.ts`, `public/assets/i18n/modules/finance/payment-counts/ar.json`, `public/assets/i18n/modules/finance/payment-counts/en.json`, `src/app/shared/ui/empty-state/empty-state.component.html`, `src/app/shared/ui/empty-state/empty-state.component.scss`, `src/app/modules/finance/components/shared/finance-list-shell/finance-list-shell.component.ts`, `src/app/modules/finance/components/*/*-list/*.html`, `docs/FRONTEND-SRS.md` |
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
