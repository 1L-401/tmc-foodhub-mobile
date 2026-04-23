# 📊 TMC FoodHub Feature Status Board

This document tracks the active status of all pending frontend and backend features. Use this to mark progress as you build out the live integrations.

## 🔴 To Do (Not Started)

### Push Notification System
- [ ] **Customer App:** Implement Expo Push Notifications for order updates.
- [ ] **Owner App:** Notify owner's device immediately on a new order.
- [ ] **Backend:** Notification dispatcher service to manage device tokens.

### Real-Time Live Order Management
- [ ] **Customer Tracking:** UI for customers to see live order map/prep status.
- [ ] **Owner Dashboard:** Socket connection to receive orders without refreshing.
- [ ] **Backend:** WebSocket/SSE engine to process live status states.

---

## 🟡 In Progress / Needs Live Integration (Currently Mocked)

### Checkouts & Payments
- [ ] **Customer App:** Connect `checkout.tsx` to live payment processor (Stripe/PayMongo).
- [ ] **Backend:** Setup payment and webhook endpoints.

### Financials & Earnings
- [ ] **Owner App:** Connect `analytics.tsx` and `earnings.tsx` to live totals.
- [ ] **Owner App:** Connect `payouts/` & `transactions/` to live ledger.
- [ ] **Backend:** Provide endpoint to aggregate owner earning totals and handle withdrawals.

### Promotions
- [ ] **Owner App:** Hook up `promotions.tsx` to active database CRUD actions.
- [ ] **Backend:** API endpoints for discount creation and application.

---

## 🟢 Completed (Live / Integrated)
- [x] **Customer App:** Core App Navigation
- [x] **Owner App:** Core App Navigation
- [x] **Customer App:** Live Restaurant Review fetch (*from previous tasks*)
- [x] **Monorepo Setup:** Expo, pnpm, and Turbo defaults initialized
