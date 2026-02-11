# Build an Android APK (Capacitor)

This repo is a Next.js app that uses server-side route handlers under `/api`.
That means a **pure static export** (local `out/` folder) is not enough for a fully working APK.

You have two realistic options:

## Option A (Recommended): APK that loads your hosted web app
1) Deploy the Next.js app (any hosting that supports Next.js server runtime).
2) Set environment variable `CAP_SERVER_URL` to your deployed URL (example: `https://your-domain.com`).
3) Use Capacitor to create/open the Android project and build APK/AAB in Android Studio.

The Capacitor config is already set up to use `CAP_SERVER_URL` when provided.

## Option B: Make the app fully static
You would need to remove/replace all server routes (`src/app/api/*`) and any server-only logic.
Then you can generate a static bundle and ship it in `out/`.

---

## App id
- `com.reversethem.search`

## Notes
- Some external reverse-image providers do not allow embedding in iframes.
  In the in-app browser page, users can fall back to "Open in browser".
