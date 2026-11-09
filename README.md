# 🎓 سامانه جامع مدیریت یادگیری (LMS Platform)

<div align="center">

![.NET 10](https://img.shields.io/badge/.NET%2010-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQL Server 2022](https://img.shields.io/badge/SQL%20Server%202022-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![Redis 8](https://img.shields.io/badge/Redis%208-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white)

<p align="center">
  <b>یک پلتفرم مدرن و سازمانی مدیریت آموزش (Enterprise LMS) پیاده‌سازی شده با معماری تمیز (Clean Architecture)، طراحی دامنه-محور (DDD)، تفکیک فرمان و پرس‌وجو (CQRS) و ارتباطات رویداد-محور (Event-Driven)</b>
</p>

> **وضعیت پروژه:** 🚧 در حال توسعه فعال (Active Development)

</div>

---

## 📑 فهرست مطالب

- [معرفی پروژه](#معرفی-پروژه)
- [اصول و الگوهای کلیدی معماری](#اصول-و-الگوهای-کلیدی-معماری)
- [پشته فناوری (Tech Stack)](#پشته-فناوری-tech-stack)
  - [بک‌اند (Backend - .NET 10)](#بک‌اند-backend---net-10)
  - [فرانت‌اند (Frontend - Next.js 16)](#فرانت‌اند-frontend---nextjs-16)
  - [زیرساخت و دوآپس (DevOps & Infrastructure)](#زیرساخت-و-دوآپس-devops--infrastructure)
- [معماری امنیت و احراز هویت (Security & Authentication)](#معماری-امنیت-و-احراز-هویت-security--authentication)
- [رصدپذیری و مانیتورینگ (Observability & Monitoring)](#رصدپذیری-و-مانیتورینگ-observability--monitoring)
- [تست استرس و کارایی (Performance & Load Testing)](#تست-استرس-و-کارایی-performance--load-testing)
- [نقشه راه دامنه و ماژول‌ها (Roadmap)](#نقشه-راه-دامنه-و-ماژولها-roadmap)
- [ساختار مخزن و ماژول‌ها](#ساختار-مخزن-و-ماژولها)
- [راهنمای راه‌اندازی و اجرای محلی (Getting Started)](#راهنمای-راه‌اندازی-و-اجرای-محلی-getting-started)
  - [پیش‌نیازها](#پیش‌نیازها)
  - [۱. اجرای سرویس‌های زیرساختی با داکر](#۱-اجرای-سرویسهای-زیرساختی-با-داکر)
  - [۲. اجرای بک‌اند (Backend Web API)](#۲-اجرای-بک‌اند-backend-web-api)
  - [۳. اجرای فرانت‌اند (Next.js Application)](#۳-اجرای-فرانت‌اند-nextjs-application)
- [مجوز (License)](#مجوز-license)

---

## معرفی پروژه

پروژه **LMSPlatform** یک سامانه پیشرفته و مقیاس‌پذیر در ابعاد سازمانی (Enterprise-Grade) جهت مدیریت فرآیندهای یادگیری آنلاین، مدارس و دوره‌های آموزشی است. این سامانه با تمرکز بر بالاترین استانداردهای مهندسی نرم‌افزار، امنیت چندلایه، کارایی بالا و کدنویسی ساختاریافته طراحی شده است.

در بخش بک‌اند، با بهره‌گیری از آخرین نسخه فریم‌ورک **.NET 10** و زبان **C# 14**، از معماری **ماژولار مونولیت (Modular Monolith)** استفاده شده است؛ به نحوی که هر دامنه تجاری (مانند احراز هویت، مدیریت مدارس، آموزش و پرداخت) به شکل مستقل و با مرزبندی کاملاً مشخص پیاده‌سازی شده و در صورت نیاز بدون تغییرات زیرساختی اساسی قابل تفکیک به میکروسرویس‌ها می‌باشد.

در بخش فرانت‌اند، با استفاده از **Next.js 16 (App Router)**، **React 19** و اکوسیستم **Tailwind CSS v4** همراه با کامپوننت‌های **shadcn/ui**، تجربه‌ای تعاملی، مدرن و با سرعت لود فوق‌العاده فراهم آمده است.

---

## اصول و الگوهای کلیدی معماری

1. **معماری تمیز (Clean Architecture):**
   تفکیک دقیق و لایه‌ای دغدغه‌ها به چهار لایه اصلی:
   - **دامنه (Domain):** بدون هیچ‌گونه وابستگی به فریم‌ورک‌ها یا دیتابیس؛ شامل موجودیت‌ها (Entities)، اشیای مقداری (Value Objects)، رویدادهای دامنه (Domain Events) و رفتارهای تجاری خالص.
   - **کاربرد (Application):** حامل جریان‌های کاری سیستم و سناریوهای استفاده (Use Cases)، دستورات (Commands)، پرس‌وجوها (Queries)، اعتبارسنجی‌ها و رفتارهای پایپ‌لاین.
   - **زیرساخت (Infrastructure):** پیاده‌سازی دسترسی به داده‌ها (EF Core)، ردیس، ایمیل، صف‌ها و سرویس‌های خارجی.
   - **ارائه (WebApi / Presentation):** کنترلرها، نگاشت پاسخ‌ها و مدیریت درخواست‌های ورودی HTTP.

2. **طراحی دامنه-محور (Domain-Driven Design - DDD):**
   - پیاده‌سازی ریشه‌های تجمیع (Aggregate Roots) برای حفظ قواعد جامعیت داده‌ها (Invariants).
   - استفاده از اشیای مقداری قدرتمند (مانند `Email`, `Username`, `PasswordHash`) با اعتبارسنجی خودکار در هنگام نمونه‌سازی.
   - ثبت رویدادهای دامنه (Domain Events) برای انتشار تغییرات به سایر بخش‌های سیستم.

3. **تفکیک فرمان و پرس‌وجو (CQRS) با MediatR:**
   - تفکیک مطلق خطوط خواندن (Queries) از خطوط نوشتن و تغییر وضعیت (Commands).
   - بهره‌گیری از **MediatR Pipeline Behaviors** برای دغدغه‌های فراگیر (Cross-Cutting Concerns) از قبیل اعتبارسنجی خودکار ورودی‌ها (`ValidationBehavior`)، ثبت ساختاریافته لاگ‌ها و زمان اجرا (`LoggingBehavior`).

4. **الگوی جعبه پیام تراکنشی (Transactional Outbox Pattern):**
   - تضمین انتشار قطعی و بدون از دست رفتن رویدادها (Guaranteed At-Least-Once Delivery).
   - ذخیره تراکنشی رویدادهای دامنه در جدول `OutboxMessages` دیتابیس همراه با داده‌های بیزینس در یک تراکنش واحد ACID.
   - پردازش و انتشار ناهمگام رویدادها توسط جاب‌های پس‌زمینه **Hangfire** (مانند ارسال ایمیل تأیید و بازیابی کلمه عبور) بدون ایجاد تاخیر در پاسخ HTTP به کاربر.

5. **الگوی خروجی نتیجه (Result Pattern) و پاکت پاسخ استاندارد (Response Envelope):**
   - جلوگیری از استفاده از Exception برای کنترل جریان عادی برنامه (Flow Control) و استفاده از شیء نوع‌امن `Result<T>`.
   - استانداردسازی خروجی تمام APIها در قالب ساختار یکپارچه `ApiEnvelope<T>` شامل وضعیت موفقیت، داده، خطاهای ساختاریافته، کد پیگیری (`CorrelationId`) و زمان سرور.

6. **ترجمه و مدیریت سراسری استثناها (Global Error Handling):**
   - میدل‌ویر اختصاصی مدیریت خطا منطبق با استاندارد RFC 7807 (ProblemDetails).
   - مترجم خودکار خطاهای پایگاه داده (مانند نقض Unique Constraint با کدهای خطای ۲۶۰۱ و ۲۶۲۷ اس‌کیو‌ال سرور) به خطاهای کاربرپسند و دامنه‌ای.

---

## پشته فناوری (Tech Stack)

### بک‌اند (Backend - .NET 10)

| دسته‌بندی | فناوری / کتابخانه | توضیحات |
|---|---|---|
| **زبان و فریم‌ورک** | **C# 14 / .NET 10 SDK** | بالاترین نسخه و کارایی با کامپایلر مدرن دات‌نت |
| **سبک وب** | **ASP.NET Core Web API** | معماری ماژولار مبتنی بر کنترلرها و Minimal Endpoints |
| **داده و ORM** | **Entity Framework Core 10 & SQL Server 2022** | طراحی Code-First، میگریشن‌های خودکار و Interceptorهای Audit و Outbox |
| **کش و نشست‌ها** | **Redis 8 (Alpine)** | کش توزیع‌شده با کارایی بالا و مدیریت نشست‌های فعال کاربران |
| **جاب‌های پس‌زمینه** | **Hangfire (SQL Server Storage)** | پردازشگر Outbox، مدیریت Workerهای موازی و صف‌های ارسال ایمیل |
| **میانجی و CQRS** | **MediatR & MediatR.Contracts** | پیاده‌سازی CQRS و رفتارهای پایپ‌لاین (Behaviors) |
| **اعتبارسنجی** | **FluentValidation** | اعتبارسنجی پیشرفته و تفکیک‌شده برای تمام دستورات و مدل‌ها |
| **رصدپذیری و لاگ** | **OpenTelemetry & Serilog & .NET Aspire** | لاگ‌های ساختاریافته، تریس‌های توزیع‌شده و مانیتورینگ بلادرنگ با Aspire Dashboard |
| **امنیت و احراز هویت** | **JWT, Google OAuth 2.0, BCrypt, SHA-256** | مدیریت نشست‌های چنددستگاهی، توکن‌های رفرش چرخشی و هش رمزنگاری‌شده |
| **سرویس ایمیل** | **MailKit & MimeKit + MailHog** | ارسال ایمیل‌های HTML تراکنشی و سرور شبیه‌ساز محلی SMTP |
| **مستندسازی API** | **Scalar & OpenAPI (Swagger)** | رابط کاربری مدرن و تعاملی جهت تست و مستندسازی اندپوینت‌ها |
| **مدیریت پکیج‌ها** | **Central Package Management (CPM)** | مدیریت متمرکز و یکپارچه نسخه‌ها در `Directory.Packages.props` |

### فرانت‌اند (Frontend - Next.js 16)

| دسته‌بندی | فناوری / کتابخانه | توضیحات |
|---|---|---|
| **فریم‌ورک هسته** | **Next.js 16 (App Router)** | رندرینگ ترکیبی Server Components و Client Components |
| **کتابخانه رابط** | **React 19 & TypeScript 5** | آخرین نسخه ری‌اکت با سیستم تایپ استاتیک قوی |
| **استایل و دیزاین** | **Tailwind CSS v4 & @base-ui/react** | جدیدترین نگارش تیل‌ویند با موتور Lightning CSS و بیس UI |
| **کامپوننت‌های بصری** | **shadcn/ui & Lucide Icons** | اجزای در دسترس، ماژولار، زیبا با تم شیشه‌ای (Glassmorphism) |
| **مدیریت وضعیت سرور** | **TanStack Query v5 (React Query)** | کش هوشمند درخواست‌ها، ابطال کش (Invalidation) و به‌روزرسانی آنی |
| **مدیریت فرم‌ها** | **TanStack Form & React Hook Form & Zod** | فرم‌های نوع‌امن با اعتبارسنجی کلاینت و هماهنگ با اسکیماهای بک‌اند |
| **مدیریت وضعیت کلاینت** | **Zustand** | استور سبک، پرسرعت و پایدار برای نگهداری وضعیت نشست و کاربر |
| **ارتباط شبکه** | **Axios & Fetch API** | کلاینت شبکه سفارشی با ارسال خودکار هدرها، کوکی‌های ایمن و سیستم Toast |

### زیرساخت و دوآپس (DevOps & Infrastructure)

- **Docker & Docker Compose:** کانتینرسازی کامل محیط محلی با تفکیک منابع سخت‌افزاری (CPU Sets و Memory Limits).
- **CloudBeaver:** پنل گرافیکی وب جهت مدیریت، مشاهده و کوئری پایگاه داده SQL Server بدون نیاز به SSMS.
- **MailHog:** صندوق ورودی و سرور تست لوکال ایمیل همراه با Web UI جهت مشاهده ایمیل‌های ارسال‌شده.
- **Aspire Dashboard:** داشبورد پیشرفته دات‌نت برای مشاهده Traceها، متریک‌ها و Logهای سیستم.
- **k6 Load Testing:** اسکریپت‌های تست بار و استرس جهت ارزیابی استقامت و پاسخ‌دهی سرور تحت فشار سنگین.

---

## معماری امنیت و احراز هویت (Security & Authentication)

امنیت در سامانه LMSPlatform بر پایه استانداردهای روز صنعتی (Industry-Standard Best Practices) طراحی شده است:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        جریان احراز هویت و نشست‌ها                        │
└────────────────────────────────────────────────────────────────────────┘

 [کاربر / مرورگر]
        │
        ├─ 1. لاگین (ایمیل یا گوگل) ──────────────────────────► [کنترلر احراز هویت]
        │                                                              │
        │                                                     [اعتبارسنجی دامنه]
        │                                                              │
        │◄─ 2. Access Token (کوتاه‌مدت در بدنه) ───────────────────────┤
        │   + Refresh Token (بلندمدت در HttpOnly Cookie)               │
        │                                                              ▼
        │                                                     [ذخیره هش SHA-256 در DB]
        │                                                     [ثبت نشست فعال در ردیس]
        │
        ├─ 3. انقضای Access Token ─────────────────────────────► [درخواست Silent Refresh]
        │                                                              │
        │◄─ 4. صدور Access Token جدید و چرخش Refresh Token ────────────┤ (Token Rotation)
        │
        └─ 5. مدیریت نشست‌ها: مشاهده لیست دستگاه‌ها و امکان خروج از یک نشست، تمام نشست‌ها یا نشست‌های دیگر
```

### ویژگی‌های کلیدی امنیتی:
- **مکانیزم دو-توکنی (Dual Token Architecture):**
  - **Access Token:** توکن کوتاه‌مدت JWT حامل هویت و دسترسی‌ها.
  - **Refresh Token:** توکن تصادفی امن رمزنگاری‌شده (Cryptographically Secure Random Bytes) با طول عمر مشخص.
- **چرخش توکن رفرش (Refresh Token Rotation):** با هر بار تمدید نشست، توکن رفرش قبلی باطل شده و توکن جدید صادر می‌شود؛ در صورت کشف توکن قدیمی منقضی، نشست به دلیل خطر سرقت مسدود می‌گردد.
- **ذخیره‌سازی به صورت هش‌شده (SHA-256 Hash Storage):** توکن‌های رفرش هرگز به صورت متن خام در دیتابیس ذخیره نمی‌شوند و قبل از درج، هش SHA-256 آن‌ها ذخیره می‌شود.
- **کوکی‌های محافظت‌شده (HttpOnly & SameSite & Secure):** توکن رفرش در کوکی‌های غیرقابل دسترس توسط جاوااسکریپت نگهداری می‌شود تا از حملات XSS جلوگیری شود.
- **مدیریت نشست‌های چنددستگاهی (Multi-Device Active Sessions):**
  - ثبت مشخصات مرورگر، سیستم‌عامل، آدرس IP و زمان آخرین فعالیت برای هر دستگاه.
  - امکان خروج از دستگاه فعلی (`Logout`).
  - امکان لغو یک دستگاه خاص (`Revoke Specific Session`).
  - امکان لغو تمامی دستگاه‌ها به صورت سراسری (`Revoke All Devices`).
- **ورود با گوگل (Google OAuth 2.0):** پشتیبانی از پروتکل احراز هویت گوگل همراه با وادار کردن انتخاب حساب (`prompt=select_account`).
- **عدم افشای وجود کاربر (Anti-User Enumeration):** در سناریوهای لاگین ناموفق، پیام خطای یکنواخت و عمومی برگردانده می‌شود تا از کشف اسامی کاربران موجود در سیستم جلوگیری شود.

---

## رصدپذیری و مانیتورینگ (Observability & Monitoring)

این سامانه مجهز به قابلیت‌های مدرن تله‌متری بر بستر **OpenTelemetry** است:
- **کد رهگیری تراکنش‌ها (Correlation ID):** تولید یک شناسه واحد به ازای هر درخواست ورودی کلاینت و تزریق آن به تمامی لاگ‌ها و پاسخ‌های API برای ردیابی آسان خطاها.
- **ثبت لاگ‌های ساختاریافته (Serilog):** ثبت تمامی رویدادها، خطاهای اعتبارسنجی، تراکنش‌های دیتابیس و اجرای پایپ‌لاین‌ها در فرمت JSON.
- **داشبورد آسپایر (.NET Aspire Dashboard):** اتصال مستقیم Serilog و OpenTelemetry Tracing به داشبورد آسپایر روی پورت `18888` جهت مشاهده بلادرنگ سلسله‌مراتب اجرای متدها و گلوگاه‌های کارایی.

---

## تست استرس و کارایی (Performance & Load Testing)

در پوشه `backend/load-testing` مجموعه سناریوهای آزمون کارایی با ابزار قدرتمند **k6** تعبیه شده است:
- **تست استرس شدید (Extreme Stress Test):** ارزیابی پایداری سرور و پایگاه داده در سناریوهای ترافیک بسیار بالا.
- **تست بک‌اند و فرانت‌اند:** بنچمارک زمان پاسخ‌دهی (Latency)، مصرف حافظه و مدیریت کانکشن‌پولینگ.

برای اجرای تست‌های بار:
```bash
cd backend/load-testing
chmod +x run-load-test.sh
./run-load-test.sh
```

---

## نقشه راه دامنه و ماژول‌ها (Roadmap)

- [x] **دامنه احراز هویت و هویت (Identity & Authentication)**
  - [x] ثبت‌نام کاربر با ایمیل و رمز عبور امن
  - [x] ارسال ناهمگام ایمیل تأیید با الگوی Outbox و Hangfire
  - [x] صفحه و روت تأیید ایمیل و ارسال مجدد توکن
  - [x] ورود امن مبتنی بر رمز عبور با اعتبارسنجی هش BCrypt
  - [x] ورود با حساب گوگل (Google OAuth 2.0)
  - [x] مکانیزم چرخش خودکار Refresh Token
  - [x] فراموشی رمز عبور و بازیابی با لینک اختصاصی ایمن
  - [x] تغییر کلمه عبور درون پنل کاربری
  - [x] مدیریت نشست‌های فعال چندگانه (مشاهده، خروج تکی، خروج سراسری)
  - [x] صفحات رابط کاربری فرانت‌اند هماهنگ با Next.js 16
- [ ] **دامنه مدیریت مدرسه و سازمان (School Management & Multi-Tenancy)**
  - [ ] تعریف مدارس، شعب و دپارتمان‌ها
  - [ ] کنترل دسترسی مبتنی بر نقش و پرمیشن (RBAC / PBAC)
- [ ] **دامنه آموزش و دوره‌ها (Learning Domain)**
  - [ ] ساخت دوره‌ها، سرفصل‌ها و درس‌ها
  - [ ] بارگذاری محتوای ویدیویی و فایل‌های ضمیمه
  - [ ] پیگیری پیشرفت دانشجو (Progress Tracking)
- [ ] **دامنه تجارت و پرداخت (Commerce Domain)**
  - [ ] سبد خرید، صدور فاکتور و تخفیف‌ها
  - [ ] اتصال به درگاه‌های پرداخت شتاب و بانکی
- [ ] **دامنه ارتباطات (Communication Domain)**
  - [ ] نوتیفیکیشن‌های درون‌برنامه‌ای بلادرنگ با SignalR
  - [ ] پنل پیام‌رسانی و پرسش‌وپاسخ دوره‌ها

---

## ساختار مخزن و ماژول‌ها

```text
LMSPlatform/
├── backend/                               # سورس کد بک‌اند دات‌نت ۱۰
│   ├── src/
│   │   ├── Bootstrappers/
│   │   │   └── LMS.Api/                   # نقطه ورود و پیکربندی اصلی سرور Web API
│   │   ├── Shared/                        # کامپوننت‌ها و لایه‌های مشترک بین ماژول‌ها
│   │   │   ├── LMS.Shared.Domain/         # اینترفیس‌ها و کلاس‌های پایه DDD (Entity, AggregateRoot, DomainEvent)
│   │   │   ├── LMS.Shared.Application/    # پایپ‌لاین‌های MediatR، اینترفیس‌ها و ابسترکشن‌ها
│   │   │   ├── LMS.Shared.Infrastructure/ # پیاده‌سازی BaseDbContext، ردیس، هنگ‌فایر و ارسال ایمیل
│   │   │   ├── LMS.Shared.Common/         # مدل Result<T>، ارورها، پریمیتیوها و استثناها
│   │   │   ├── LMS.Shared.ResponseHandling/# فرمت یکپارچه پاسخ خروجی ApiEnvelope
│   │   │   └── LMS.Shared.ErrorHandling/  # میدل‌ویر سراسری مدیریت خطا و مترجم کدهای خطای SQL
│   │   └── LMS.Identity/
│   │       └── LMS.Identity.Authentication/ # ماژول مستقل احراز هویت و مدیریت کاربران
│   │           ├── Domain/                # موجودیت‌های کاربر، سشن، توکن‌ها و ValueObjectها
│   │           ├── Application/           # فرمان‌ها، پرس‌وجوها، هندلرها و ولیدیتورهای احراز هویت
│   │           ├── Infrastructure/        # DbContext اختصاصی، مخازن داده و توکن‌سرویس
│   │           └── WebApi/                # کنترلرهای RESTful احراز هویت
│   ├── load-testing/                      # اسکریپت‌های تست بار و استرس با k6
│   ├── docs/                              # اسناد طراحی سیستم و معماری ماژول‌ها
│   ├── docker-compose.yml                 # تعریف کانتینرهای پایگاه داده، کش، داشبورد و ابزارها
│   ├── Directory.Build.props              # تنظیمات سراسری کامپایل C# 14
│   └── Directory.Packages.props           # مدیریت متمرکز نسخه‌های پکیج‌های نیوگت (CPM)
│
└── frontend/                              # اپلیکیشن وب فرانت‌اند Next.js 16
    ├── src/
    │   ├── app/                           # صفحات و روت‌های اپلیکیشن (App Router)
    │   │   ├── (public)/auth/             # صفحات عمومی ورود، ثبت‌نام، تایید ایمیل و فراموشی رمز
    │   │   └── (protected)/dashboard/     # پنل کاربری حفاظت‌شده و مدیریت نشست‌ها
    │   ├── features/
    │   │   └── authentication/            # کامپوننت‌ها، هوک‌ها و لاجیک احراز هویت و سشن‌ها
    │   └── shared/                        # کامپوننت‌های عمومی رابط کاربری (UI Primitives)، استور و کلاینت API
    └── package.json                       # وابستگی‌های فرانت‌اند (React 19, Tailwind CSS v4)
```

---

## راهنمای راه‌اندازی و اجرای محلی (Getting Started)

### پیش‌نیازها

برای اجرای روان پروژه در محیط توسعه محلی، نرم‌افزارهای زیر را روی سیستم خود نصب داشته باشید:

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (نسخه ۲۰ به بالا)
- [pnpm](https://pnpm.io/) (نسخه ۱۰ یا ۱۱)
- [Docker & Docker Compose](https://www.docker.com/)

---

### ۱. اجرای سرویس‌های زیرساختی با داکر

ابتدا سرویس‌های پشتیبان (SQL Server، Redis، MailHog، Aspire Dashboard، CloudBeaver) را با داکر بالا بیاورید:

```bash
cd backend
docker compose up -d
```

#### جدول پورت‌ها و درگاه‌های سرویس‌های محلی:

| نام سرویس | پورت / آدرس محلی | توضیحات و کاربرد |
|---|---|---|
| **SQL Server 2022** | `localhost:1433` | پایگاه داده رابطه‌ای اصلی سیستم |
| **Redis** | `localhost:6380` | پایگاه داده درون‌حافظه‌ای جهت کش و نشست‌ها |
| **MailHog Web UI** | [http://localhost:8026](http://localhost:8026) | صندوق وب جهت مشاهده ایمیل‌های ارسال‌شده محلی |
| **MailHog SMTP** | `localhost:1026` | درگاه تستی SMTP سرور ایمیل |
| **Aspire Dashboard** | [http://localhost:18888](http://localhost:18888) | داشبورد تحلیل تریس‌ها و لاگ‌های OpenTelemetry |
| **CloudBeaver** | [http://localhost:8978](http://localhost:8978) | رابط کاربری تحت وب برای مشاهده جداول دیتابیس |

---

### ۲. اجرای بک‌اند (Backend Web API)

پس از اجرای کانتینرها، سرور وب API دات‌نت را اجرا کنید:

```bash
cd backend
dotnet run --project src/Bootstrappers/LMS.Api/LMS.Api.csproj --launch-profile http
```

- سرویس API در آدرس `http://localhost:4000/api` در دسترس خواهد بود.
- مستندات تعاملی **Scalar API Reference** در آدرس `http://localhost:4000/scalar/v1` قابل مشاهده است.
- داشبورد پردازش جاب‌های پس‌زمینه **Hangfire** در آدرس `http://localhost:4000/hangfire` در دسترس است.

---

### ۳. اجرای فرانت‌اند (Next.js Application)

در یک ترمینال دیگر، فرانت‌اند را نصب و اجرا نمایید:

```bash
cd frontend
pnpm install
pnpm dev
```

- اپلیکیشن وب فرانت‌اند در آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.
- صفحه احراز هویت: [http://localhost:3000/auth](http://localhost:3000/auth)
- داشبورد کاربری و مدیریت نشست‌ها: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## مجوز (License)

این پروژه تحت مجوز MIT منتشر شده و جهت اهداف آموزشی و نمایش توانمندی‌های مهندسی نرم‌افزار در پورتفولیو توسعه داده شده است.
