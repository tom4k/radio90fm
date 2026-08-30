# Radio 90 FM - Complete Codebase Guide & Architecture Overview

This document provides a comprehensive technical overview of the **Radio 90 FM** modernized codebase, detailing both the Flutter mobile application and the Next.js administration portal.

---

## 1. Executive Summary

- **App Name**: Radio 90 FM ("Voice of Amal Jyothi" / "Celebration of Knowledge")
- **Mobile Platform**: Flutter (Android & iOS) with `audio_service`, `just_audio`, and `flutter_riverpod`.
- **Web Admin Platform**: Next.js App Router (TypeScript, Tailwind CSS) deployed on Vercel with Neon PostgreSQL and Drizzle ORM.
- **Direct Icecast Audio**: Flutter streams directly from `https://icecast.octosignals.com/radio90_final` without proxying through Vercel.
- **Firebase Status**: 0 Firebase dependencies.

---

## 2. Directory Layout

```text
radio90fm/
├── admin/                         # Next.js Web Administration Portal
│   ├── app/                       # App Router (pages & API routes)
│   │   ├── api/v1/public/         # Versioned REST APIs (config, schedule, on-air)
│   │   ├── api/v1/admin/          # Protected Admin REST APIs
│   │   ├── dashboard/             # Admin Management Portal UI
│   │   └── login/                 # Admin Login Page
│   ├── db/                        # Drizzle ORM schema & migrations
│   ├── lib/                       # DB client & JWT Auth helpers
│   ├── scripts/                   # CLI bootstrap script (create-admin.ts)
│   └── package.json               # Next.js & Drizzle dependencies
│
├── lib/                           # Flutter Mobile Application
│   ├── app/                       # App theme (Material 3 Dark) & RadioApp navigation shell
│   ├── core/                      # Constants & cache keys
│   ├── models/                    # StationConfig, Program, OnAirData models
│   ├── providers/                 # Riverpod state providers
│   ├── repositories/              # RadioConfigRepository & ScheduleRepository
│   ├── screens/                   # ListenScreen, ScheduleScreen, AboutScreen, ContactScreen
│   ├── services/                  # RadioAudioHandler (audio_service)
│   ├── widgets/                   # LiveContactActions & player UI components
│   └── main.dart                  # Application entry point
│
├── android/                       # Android project (compileSdk 35, targetSdk 35)
└── ios/                           # iOS project (com.radio90fm)
```

---

## 3. Key REST API Endpoints

### Public Read-Only APIs (Accessed by Flutter)
- `GET /api/v1/public/config` - Returns station configuration, stream URLs, default contacts, version.
- `GET /api/v1/public/schedule` - Returns complete weekly program schedule.
- `GET /api/v1/public/on-air` - Returns currently active program (checking Live Override first, then `Asia/Kolkata` weekly schedule), next program preview, resolved phone/WhatsApp, and call enablement flags.

### Admin APIs (Protected)
- `POST /api/v1/admin/auth/login` & `POST /api/v1/admin/auth/logout`
- `GET / PATCH /api/v1/admin/station`
- `GET / POST / PATCH / DELETE /api/v1/admin/programs`
- `POST /api/v1/admin/stream/test` - Validates Icecast stream URL reachability without downloading content.
- `GET / POST /api/v1/admin/live` - Manages Live Overrides.

---

## 4. Failure Isolation & Resilience

- **Offline Caching**: Flutter caches station configuration and weekly schedule in `shared_preferences`.
- **API Unavailability**: If Vercel or Neon is offline, Flutter seamlessly uses cached configuration.
- **Emergency Stream Fallback**: Built-in fallback stream (`https://icecast.octosignals.com/radio90_final`) is used if no local or remote config exists.
- **Stream URL Change**: When `streamUrl` is updated in Next.js Admin, Flutter dynamically transitions the playback source without creating multiple `AudioPlayer` instances. Changing text/contacts does not interrupt audio.
