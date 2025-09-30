# AlterStudies (Netlify, full build)
- Next.js App Router + Tailwind
- Firebase (Auth/Firestore/Storage)
- Google Sign-In, Admin panel
- YouTube embeds with moving watermark
- Structure: Class 11/12 -> Subjects -> (Organic/Inorganic/Physical, Botany/Zoology) -> Chapters -> Lessons
- Q&A, progress tracking
- Tests (mini-mocks), results
- Web push notifications via Netlify Scheduled Function (push-cron)
- PWA (manifest + SW), legal pages placeholders

## Run locally
1) cp .env.example .env.local and fill Firebase keys + NEXT_PUBLIC_FCM_VAPID_KEY
2) Firebase Console:
   - Enable Authentication -> Google
   - Firestore (production), Storage
   - Authentication -> Settings -> Authorized domains -> add localhost and your Netlify domain later
3) npm install
4) npm run dev

## Deploy on Netlify
- Create new site -> Import from GitHub (or drag-and-drop)
- Build command: `npm run build`
- Publish directory: `.next`
- Add Environment variables (Site -> Settings -> Environment variables):
  - NEXT_PUBLIC_FIREBASE_* from your Firebase Web App config
  - NEXT_PUBLIC_ADMIN_EMAIL=gowdavarshan466@gmail.com
  - NEXT_PUBLIC_FCM_VAPID_KEY=(Web Push public key)
  - FCM_SERVICE_ACCOUNT=(paste full rotated JSON)
  - (Optional) FCM_SERVICE_ACCOUNT_BASE64 if you prefer base64
- netlify.toml already includes:
  - @netlify/plugin-nextjs
  - Scheduled function push-cron (every 5 minutes)

## Web Push E2E test
- Open /notifications, click Enable (allow prompt), subscribe to a topic
- In /admin, queue a notification to that topic (pick IST time soon)
- Netlify scheduled function will deliver within ~5 minutes

## Firestore rules
- Open Firebase Console -> Firestore -> Rules -> paste `firestore.rules` and Publish

## Notes
- iOS push: requires installing as PWA (iOS 16.4+)
- YouTube embeds: no downloads (ToS)
- Watermark overlay not visible in iOS fullscreen (normal mode shows it)
