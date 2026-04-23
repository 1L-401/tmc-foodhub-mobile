# 🗺️ TMC FoodHub Pending Features & Optimization Roadmap

Based on the current state of the codebase, here is a comprehensive breakdown of the remaining features for the frontend, backend, and critical performance optimizations essential for modern mobile apps.

## 📱 Frontend: Customer App

| Feature | Status | Description |
|---------|--------|-------------|
| **Payment Gateway Integration** | 🟡 Pending | Replace the mock data in `checkout.tsx` with a live payment processor (PayMongo, GCash, or Stripe). |
| **Live Order Tracking** | 🟡 Pending | Integrate real-time updates (using WebSockets or polling) so customers can see their order move from "Preparing" to "Out for Delivery". |
| **Push Notifications** | 🔴 Not Started | Implementing Expo Push Notifications to alert users when their order status changes. |

---

## 🏬 Frontend: Owner App

| Feature | Status | Description |
|---------|--------|-------------|
| **Financial Analytics & Earnings** | 🟡 Pending | The `analytics.tsx` and `earnings.tsx` screens need to pull real aggregated totals from the backend, replacing the mock data. |
| **Payouts & Transactions** | 🟡 Pending | Replace `mock-payouts-data.ts` in the transactions screens with live API fetching (using TanStack Query). |
| **Promotions Management** | 🟡 Pending | The `promotions.tsx` screen needs live API support to create, update, and delete active discounts for the restaurant. |
| **Live Order Management** | 🟡 Pending | The dashboard (`app/(tabs)/index.tsx`) must listen for incoming orders in real-time. |
| **Push Notifications** | 🔴 Not Started | Alert the owner's device immediately when a new customer order arrives. |

---

## ⚙️ Backend (Hostinger API)

| Service / Endpoint | Description |
|---------|-------------|
| **Payment System API** | Endpoints to create payment intents and webhooks to securely listen for successful payments from third-party processors. |
| **Financial & Ledger API** | Logic to aggregate an owner's total earnings, list all historical transactions, and handle payout requests. |
| **Real-time Engine (WebSockets)** | A central pipeline to instantly sync active order states between the Customer App and the Owner App. |
| **Promotions API** | CRUD operations to manage restaurant discounts and validate them during customer checkout. |
| **Push Notification Dispatcher** | A service that stores device tokens and triggers push alerts securely via Expo. |

---

## 🚀 Essential App Optimizations & Best Practices
*(Crucial for keeping the app size small, fast, and battery-efficient)*

### 1. App Build Size & Storage (Keeping the App "Lite")
* **Enable Hermes Engine:** Ensure Hermes is running (it usually is by default in modern Expo apps). This compiles JavaScript ahead of time, drastically reducing app startup time, memory footprint, and final APK/IPA build size.
* **Asset Optimization (WebP):** Compress all local images and ensure remote APIs serve images in the `.webp` format instead of heavy `.png` or `.jpeg` files.
* **Expo Image Caching:** Use `expo-image` instead of the standard React Native `<Image>`. It caches remote images natively on the device, meaning users don't waste data downloading the same restaurant logo twice.
* **Tree-Shaking & Dependency Audit:** Regularly run an audit to remove unused NPM libraries. The fewer libraries, the smaller the app install size.

### 2. High-Performance UI
* **Shopify FlashList:** For long lists (like the restaurant feeds, menu items, or transaction histories), replace React Native's standard `<FlatList>` with `@shopify/flash-list`. It recycles UI components, using ~10x less memory and preventing the app from stuttering or crashing on older phones.
* **Native Stack Navigation:** Continue using `expo-router`'s underlying Native Stack, which uses the OS's native navigation components for 60fps animations.
* **Memoization (`React.memo`):** Dashboard and cart screens should be tightly memoized so that scrolling one section doesn't force the whole screen to redraw.

### 3. Network & Battery Efficiency 
* **TanStack Query (React Query):** Use this for data fetching instead of standard `useEffect`. It caches API responses, automatically retries failed requests if the user is on a train/poor signal, and prevents duplicate network requests.
* **Pagination & Infinite Scrolling:** Don't load 500 past orders at once. Load the first 20, and fetch more as the user scrolls down, drastically saving memory and data plan usage.
* **WebSockets over Polling:** For live orders, use a WebSocket connection instead of polling (asking the server every 5 seconds). WebSockets use significantly less battery power.

### 4. Offline Fallbacks
* **MMKV Storage:** For caching local user data (like cart contents, auth tokens, theme preferences), use `react-native-mmkv` which is exponentially faster than standard `AsyncStorage`.
* **Graceful Offline States:** The app should explicitly show an "Offline Mode" banner when internet drops, but still let the user browse the cached menu items.
