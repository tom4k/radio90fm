# Radio 90 FM - Production Radio Platform & Mobile Application

A modernized, production-grade radio platform for **Radio 90 FM** ("Voice of Amal Jyothi"), featuring a **Flutter Mobile Application** for iOS & Android and a separate **Next.js Web Administration Portal** hosted on Vercel with Neon PostgreSQL.

---

## 1. System Architecture

```text
                                ADMIN USER
                                    │
                                    ▼
                          Next.js Admin Portal
                         (Hosted on Vercel)
                                    │
                                    ▼
                         Neon PostgreSQL Database
                                    │
                                    ▼
Flutter App ─── Rest Configuration / Schedule APIs ───► Next.js
     │
     └─── Direct Audio Streaming ───────────────────► Icecast Stream Server
```

---

## 2. Flutter Mobile Application (Latest Production Targets)

- **SDK Requirement**: Flutter `3.41.0` / Dart `3.11.0`
- **Application Identifiers**:
  - **Android**: `com.radio90fm` (compileSdk `36`, targetSdk `35`, minSdk `21`, AGP `8.9.1`, Gradle `8.11.1`, Kotlin `2.1.0`)
  - **iOS**: `com.radio90fm` (iOS deployment target `15.0`)
- **Key Libraries**:
  - `audio_service` + `just_audio`: Background audio, lockscreen controls, media notifications.
  - `flutter_riverpod`: Reactive state management.
  - `shared_preferences`: Local caching & offline isolation.
  - `connectivity_plus`: Network transition management.

### Mobile Build Commands
```bash
# Get dependencies
flutter pub get

# Run linter
flutter analyze

# Build Android Debug APK
flutter build apk --debug

# Build iOS App (requires Xcode)
flutter build ios --no-codesign
```

---

## 3. Next.js Web Administration Portal (`admin/`)

Located in [`admin/`](file:///Users/tomkurian/Development/Radio%20Flutter/Radio90FM/radio90fm/admin).

- **Framework**: Next.js 15+ App Router (TypeScript, Tailwind CSS)
- **Database**: Neon PostgreSQL via `@neondatabase/serverless` & `drizzle-orm`
- **Authentication**: JWT Cookie Sessions (`jose` + `bcryptjs`)
- **Key Features**:
  - Dashboard Overview (Now On Air, Stream Status)
  - Weekly Schedule Editor (Day of week, start/end minutes, presenter, calls enable/disable, overlap detection)
  - Live Overrides (Special live broadcast overlay with expiration time)
  - Stream Configuration & Stream Reachability Tester (`POST /api/v1/admin/stream/test`)
  - Station Contacts & Social Links Editor
  - Versioned REST APIs (`/api/v1/public/*` and `/api/v1/admin/*`)

### Admin Portal Commands
```bash
cd admin

# Install dependencies
npm install

# Run development server
npm run dev

# Generate & Push Drizzle DB migrations to Neon
npm run db:push

# Bootstrap Admin User
npm run create-admin

# Seed Initial Schedule (from official AJCE Radio 90 sheet)
npm run seed-schedule

# Build Next.js app for Vercel
npm run build
```

---

## 4. Environment Variables (`admin/.env`)

```env
DATABASE_URL=postgresql://user:password@ep-sample.neon.tech/neondb?sslmode=require
AUTH_SECRET=super_secret_production_key_change_me
APP_URL=https://admin.radio90.in
```

---

## 5. Documentation & Codebase Guide

For a file-by-file codebase reference, see:
- [`CODEBASE_OVERVIEW.md`](file:///Users/tomkurian/Development/Radio%20Flutter/Radio90FM/radio90fm/CODEBASE_OVERVIEW.md)
