# MessMate (Android + Backend MVP)

MessMate now includes:
- Android-ready mobile app (Expo React Native)
- Production-style backend API (Node.js, Express, MongoDB, JWT, bcrypt)
- Real auth screens (login/register), token persistence, and app caching

Implemented flows:
- Student menu browsing (Poha, Misal Pav, Pithla Bhakri, Chicken Kolhapuri, etc.)
- Meal booking with generated cash verification code (`MM-XXXX`)
- Vendor payment verification by code
- Subscription and skip tracking
- Meal rating and vendor hygiene dashboard
- Realistic mock entities for Sangli, Kolhapur, Pune

## Project Structure

- `App.js` - Main mobile app UI and logic
- `src/data/mockData.js` - Realistic regional mock data
- `src/services/appService.js` - Booking code + local business helpers
- `package.json` - Expo app dependencies
- `app.json` - Expo Android configuration
- `backend/` - Full API server with models/routes/seed script

## Run Mobile App (Android Dev)

1. Install dependencies:
   - `npm install`
2. Set backend URL for phone access (`src/config/env.js`):
   - edit `src/config/env.js`
   - replace `192.168.1.100` with your laptop Wi-Fi IP (example `192.168.1.12`)
3. Start development server:
   - `npm run start`
4. Open in:
   - Expo Go app on Samsung device (scan QR), or Android emulator

## Notes

- Mobile app currently runs with local mock state for fast demo.

## Run Backend API

1. Install backend dependencies:
   - `cd backend`
   - `npm install`
2. Create env file:
   - copy `backend/.env.example` to `backend/.env`
   - add real `MONGO_URI` and `JWT_SECRET`
3. Seed realistic data:
   - `npm run seed`
4. Start backend:
   - `npm run dev`

Base URL:
- `http://localhost:5000`

Key endpoints:
- `POST /api/auth/register/student`
- `POST /api/auth/login`
- `GET /api/vendors?city=Sangli`
- `GET /api/vendors/:id/menu?date=YYYY-MM-DD`
- `POST /api/bookings` (student JWT)
- `POST /api/bookings/:id/verify` (vendor JWT)
- `POST /api/bookings/:id/skip` (student JWT)
- `POST /api/subscriptions` (student JWT)
- `GET /api/subscriptions/my` (student JWT)
- `POST /api/ratings` (student JWT)

Demo login credentials after seed:
- Student: `satyapal.gaikwad@walchand.edu.in` / `student123`
- Vendor: `vendor.datta@messmate.in` / `vendor123`

## Samsung Device Checklist

- Laptop and Samsung phone must be on same Wi-Fi.
- Backend must run on laptop (`npm run dev` in `backend`).
- In Expo terminal press `s` to switch to **LAN** mode if needed.
- Keep Windows firewall open for Node/Expo private network access.

## Build Installable App (APK/AAB)

This gives you a real app package you can install like normal Android apps.

1. Install EAS CLI:
   - `npm install -g eas-cli`
2. Login to Expo:
   - `eas login`
3. Initialize EAS project (one-time):
   - `eas init`
   - replace `expo.extra.eas.projectId` in `app.json` with generated value
4. Build APK (direct install on Samsung):
   - `npm run build:apk`
5. Build AAB (Play Store upload):
   - `npm run build:aab`

After build finishes, Expo gives a download link.
- Download APK on Samsung and install.
- If prompted, enable "Install unknown apps" for browser/files app.

## Production Backend (Required for real installed app)

For installed release app, local laptop URL will not work outside your network.

Deploy backend publicly (Render/Railway/EC2), then:
- set `PROD_API_BASE_URL` in `src/config/env.js` to your public HTTPS backend URL
- ensure backend has CORS enabled and MongoDB Atlas is accessible

### Render-ready backend

This repo includes `backend/render.yaml`.

On Render:
- Create new Blueprint deployment from this repo
- Set secrets: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGINS`
- After deploy, use your Render URL in `PROD_API_BASE_URL`

## New Auth + Caching behavior

- App starts with proper login/register screen
- Session token persists across app restarts (AsyncStorage)
- Vendors and menu are cached by city/vendor-date
- Student and vendor dashboard data are cached for offline fallback
