# TMC FoodHub — Monorepo

A **pnpm + Turborepo** monorepo containing all TMC FoodHub mobile applications.

| App | Package | What it does |
|-----|---------|-------------|
| `apps/customer-app` | `@tmc/customer-app` | Customer food ordering app |
| `apps/owner-app` | `@tmc/owner-app` | Restaurant owner dashboard app |

---

## Step-by-Step Setup (First Time)

### Step 1 — Install Node.js

Download and install **Node.js v18 or higher** from [nodejs.org](https://nodejs.org/).

Verify it's working:

```bash
node -v
# Should print v18.x.x or higher
```

### Step 2 — Install pnpm

Open your terminal and run:

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm -v
# Should print 9.x.x or higher
```

### Step 3 — Install Expo Go on your phone

Go to the App Store (iOS) or Play Store (Android) and download **Expo Go**.

This is how you'll preview the apps on your real phone.

### Step 4 — Clone the repo

```bash
git clone <your-repo-url>
cd tmc-foodhub-mobile
```

### Step 5 — Install all dependencies

Run this **once** from the root folder. It installs everything for both apps:

```bash
pnpm install
```

> ⚠️ Always use `pnpm install`, never `npm install` or `yarn install`.

### Step 6 — You're done!

That's it. You're ready to run the apps.

---

## Running the Apps Locally

### Run the Customer App

```bash
pnpm --filter @tmc/customer-app start
```

### Run the Owner Dashboard App

```bash
pnpm --filter @tmc/owner-app start
```

After running either command, Expo will show you a QR code in the terminal.

**To preview on your phone:**
1. Open **Expo Go** on your phone
2. Scan the QR code shown in the terminal
3. The app loads on your phone — any code changes you save will hot-reload automatically

**To preview on a specific platform:**

```bash
# Android emulator
pnpm --filter @tmc/customer-app android

# iOS simulator (Mac only)
pnpm --filter @tmc/customer-app ios

# Web browser
pnpm --filter @tmc/customer-app web
```

Replace `@tmc/customer-app` with `@tmc/owner-app` to run the owner app instead.

---

## Debugging

### Method 1 — React Native DevTools (Recommended)

1. Start the app (see above)
2. Open the app on your phone or emulator
3. Shake your phone (or press `m` in the terminal) to open the dev menu
4. Tap **"Open DevTools"**
5. A Chrome-based debugger opens with:
   - Console logs
   - Network requests
   - Component inspector

### Method 2 — Console Logs

Add `console.log()` anywhere in your code:

```tsx
console.log('Order data:', orderData);
```

The output appears directly in the **terminal** where you ran `pnpm --filter ... start`.

### Method 3 — VS Code Debugger

1. Open the monorepo folder in VS Code
2. Install the **Expo Tools** extension
3. Press `F5` or go to **Run → Start Debugging**
4. Select **Expo: Debug ...**
5. Set breakpoints by clicking the left margin of any line

### Useful Keyboard Shortcuts in the Expo Terminal

Once the dev server is running, press these keys in the terminal:

| Key | Action |
|-----|--------|
| `r` | Reload the app |
| `m` | Open the dev menu on device |
| `j` | Open React DevTools |
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator |
| `w` | Open in web browser |

---

## Common Issues & Fixes

### "Cannot find module" after pulling new code

```bash
pnpm install
```

### App not updating / stale cache

```bash
pnpm --filter @tmc/customer-app start -- --clear
```

### Metro bundler stuck or crashing

Kill it and restart:

```bash
# Press Ctrl+C to stop, then:
pnpm --filter @tmc/customer-app start -- --clear
```

### Phone can't connect to dev server

Make sure your phone and computer are on the **same Wi-Fi network**.

If that still doesn't work, use tunnel mode:

```bash
pnpm --filter @tmc/customer-app start -- --tunnel
```

### Accidentally used npm or yarn

Delete everything and reinstall with pnpm:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, apps\customer-app\node_modules, apps\owner-app\node_modules
Remove-Item -Force package-lock.json, yarn.lock -ErrorAction SilentlyContinue
pnpm install
```

---

## Adding a Dependency to an App

```bash
# Add a package to the customer app
pnpm --filter @tmc/customer-app add <package-name>

# Add a package to the owner app
pnpm --filter @tmc/owner-app add <package-name>

# Add a dev dependency
pnpm --filter @tmc/customer-app add -D <package-name>
```

---

## Quick Reference

```bash
# Install everything
pnpm install

# Run customer app
pnpm --filter @tmc/customer-app start

# Run owner app
pnpm --filter @tmc/owner-app start

# Lint all apps
pnpm run lint

# Add a package to an app
pnpm --filter @tmc/customer-app add <package-name>
```
