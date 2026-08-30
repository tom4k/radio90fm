# Radio 90 FM - Vercel & Neon PostgreSQL Deployment Guide

This guide provides step-by-step instructions for deploying the **Next.js Web Administration Portal** to **Vercel** and provisioning **Neon PostgreSQL**.

---

## Step 1: Push Code to GitHub / GitLab / Bitbucket

Ensure all latest commits are pushed to your remote git repository:
```bash
git add .
git commit -m "Complete Radio 90 FM platform modernization"
git push origin main
```

---

## Step 2: Provision Neon PostgreSQL Database on Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Go to **Storage** -> Click **Create Database**.
3. Select **Postgres (Powered by Neon)**.
4. Name your database (e.g. `radio90fm-db`) and pick your preferred region (e.g., `Asia Pacific - Mumbai / ap-south-1`).
5. Click **Create & Continue**.

---

## Step 3: Deploy Admin App on Vercel

1. On Vercel, click **Add New...** -> **Project**.
2. Select your **`radio90fm`** repository.
3. Under **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click **Edit** and set it to **`admin`**
4. Under **Environment Variables**:
   - Link the Neon database created in Step 2 (Vercel automatically sets `DATABASE_URL`).
   - Add custom variables:
     - `AUTH_SECRET`: Generate a random secret key (e.g. `openssl rand -hex 32`).
     - `APP_URL`: Your assigned Vercel URL (e.g. `https://radio90-admin.vercel.app`).
5. Click **Deploy**.

---

## Step 4: Push Database Schema to Neon

From your local terminal, navigate to `admin/` with your Neon `DATABASE_URL` in `admin/.env`:

```bash
cd admin
npm run db:push
```

---

## Step 5: Seed Admin User & Official Schedule

Run the CLI setup scripts to bootstrap admin authentication and populate the weekly schedule:

1. **Bootstrap Admin User**:
   ```bash
   npm run create-admin
   ```
   *Follow the interactive prompts to enter Admin Name, Email, and Password.*

2. **Seed Weekly Schedule** (parses official AJCE schedule grid):
   ```bash
   npm run seed-schedule
   ```

---

## Step 6: Connect Flutter Mobile App

Build or run the Flutter app pointing to your live Vercel REST API endpoint:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://radio90-admin.vercel.app/api/v1
```
