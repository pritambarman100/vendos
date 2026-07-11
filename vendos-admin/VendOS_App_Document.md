# VendOS Customer App — Complete Project Document
**Prepared for:** Developer Handoff & AI Reference
**Project:** VendOS Smart Vending Machine System
**Date:** June 2026

---

## 1. PROJECT OVERVIEW

VendOS is a complete smart vending machine system with three parts:
- **Admin Panel** (React Web) — for machine owner
- **Customer App** (React Native + Expo) — for customers
- **Backend** (Flask + Python) — connects everything
- **Hardware** (ESP32 + Stepper Motor) — physical dispensing

---

## 2. WHAT IS COMPLETE

### Admin Panel (DONE)
- Login page with Google button (UI only)
- Dashboard — stats, 20 slot grid, recent sales
- Slot Manager — edit any slot, upload image, set price
- Analytics — best sellers, slow movers, revenue charts
- Restock — update stock per slot
- Alerts — low stock and empty slot warnings
- Settings — machine info, UPI ID, notifications
- Slot Modal — image upload, price, offers, discounts
- Sidebar with Lucide icons
- Fully responsive (mobile + tablet + desktop)
- Tech: React + Vite + Zustand + CSS Modules

### Customer App (IN PROGRESS)
- Project created with Expo SDK 54
- All files and folders created
- All screen code written
- Navigation setup done
- Currently debugging "something went wrong" error

---

## 3. CUSTOMER APP — COMPLETE GOAL

### What the App Does
Customer opens app on phone, selects products from
vending machine, pays via UPI QR code, and machine
automatically dispenses the product.

### Flow
```
Welcome Screen
→ Customer taps "Start Shopping"
→ Products Screen (grid of all 20 products)
→ Customer adds items to cart
→ Cart Screen (shows items, discounts, total)
→ Payment Screen (UPI QR code shown)
→ Customer scans QR and pays via GPay/PhonePe
→ Payment confirmed automatically
→ Flask backend receives payment confirmation
→ Backend sends command to ESP32 via WiFi
→ ESP32 rotates stepper motor 360 degrees
→ Item drops in tray
→ Dispensing Screen shown
→ Stock updated in database
→ Admin panel shows updated stock
```

---

## 4. APP FILE STRUCTURE

```
vendos-app/
│
├── App.js                          ← Entry point
│
├── app/
│   ├── navigation/
│   │   └── AppNavigator.jsx        ← All screen routes
│   │
│   ├── screens/
│   │   ├── WelcomeScreen.jsx       ← Logo + Start button
│   │   ├── ProductsScreen.jsx      ← Product grid + categories
│   │   ├── CartScreen.jsx          ← Cart items + total
│   │   ├── PaymentScreen.jsx       ← UPI QR + timer
│   │   └── DispensingScreen.jsx    ← Progress + thank you
│   │
│   ├── components/
│   │   ├── ProductCard.jsx         ← Single product card
│   │   ├── CartItem.jsx            ← Single cart item row
│   │   └── StockBar.jsx            ← Stock progress bar
│   │
│   ├── store/
│   │   ├── cartStore.js            ← Cart state (Zustand)
│   │   └── productStore.js         ← Products state (Zustand)
│   │
│   ├── services/
│   │   ├── api.js                  ← Backend API calls
│   │   └── payment.js              ← Payment logic
│   │
│   └── constants/
│       ├── colors.js               ← All colors/theme
│       └── products.js             ← 20 product data
│
├── assets/                         ← Images, icons
└── package.json
```

---

## 5. SCREEN BY SCREEN DESIGN

### Screen 1 — Welcome
- Dark background with dot pattern
- Floating color orbs for depth
- VendOS logo (yellow lightning bolt)
- Three feature cards: Instant, Secure, Offers
- Big yellow "Start Shopping" button
- "Available 8 AM - 10 PM" text

### Screen 2 — Products
- Header: "Our Products" + Cart button with count
- Horizontal scrollable category pills
  (All, Drinks, Snacks, Food, Combo — add more anytime)
- 2-column product grid
- Each card: colored avatar image, product name,
  price in yellow, Add button
- Offer badge on product image (BUY 2 GET 1, 10% OFF)
- Out of stock overlay on image
- Added button turns purple with quantity shown

### Screen 3 — Cart
- Back button + "Your Cart" title
- List of added items with avatar, name, price
- Quantity +/- controls per item
- Green discount banner if offer applies
- Subtotal, Discount, Total breakdown
- Yellow "Proceed to Pay" button

### Screen 4 — Payment
- Back button + "Payment" title
- "Amount to Pay" label
- Big yellow amount number
- White QR code box (real QR from UPI ID)
- GPay, PhonePe, Paytm, BHIM logos
- Countdown timer (5 minutes)
- Green "Payment Done" button
  (for demo — in production auto detects payment)

### Screen 5 — Dispensing
- Green check circle icon
- "Enjoy your order!" heading
- List of dispensing items with progress bars
- "Items dispensing below" note
- Yellow "New Order" button → goes back to Welcome

---

## 6. DESIGN SYSTEM

```
Colors:
Background:  #0A0A0D (very dark)
Surface:     #111115
Card:        #17171C
Border:      #242430
Accent:      #E8FF47 (yellow — main CTA)
Purple:      #7B6EF6 (added state)
Success:     #22C55E (green)
Warning:     #F59E0B (orange)
Danger:      #EF4444 (red)
Text:        #EFEFFA (white)
Muted:       #606070 (grey)

Avatar Colors (when no product image):
Purple, Green, Orange, Red, Cyan, Pink, Blue, Orange

Typography:
Headings: Syne (bold, 700-800 weight)
Body: DM Sans (400-600 weight)

Border Radius: 12-16px for cards, 20px for pills
```

---

## 7. PACKAGES INSTALLED

```
Core:
- expo (SDK 54)
- react-native
- react

Navigation:
- @react-navigation/native
- @react-navigation/stack
- react-native-screens
- react-native-safe-area-context

State Management:
- zustand

Still needed:
- @react-navigation/native-stack (install failed)
  → Use @react-navigation/stack instead (already installed)
- firebase (for real-time sync)
- razorpay (for real payment)
```

---

## 8. PROBLEMS FACED AND SOLUTIONS

### Problem 1 — npm install errors
```
Error: SELF_SIGNED_CERT_IN_CHAIN
Cause: College WiFi blocks SSL certificates
Fix: npm config set strict-ssl false
     npm config set registry https://registry.npmjs.org
     Use mobile hotspot for npm installs
```

### Problem 2 — Expo fetch failed
```
Error: TypeError: fetch failed
Cause: No internet during expo start
Fix: npx expo start --offline
```

### Problem 3 — Something went wrong on phone
```
Error: "Something went wrong" in Expo Go
Cause: Navigation package version mismatch
Fix: Use createStackNavigator from @react-navigation/stack
     instead of createNativeStackNavigator
```

### Problem 4 — Dependency conflicts
```
Error: ERESOLVE unable to resolve dependency tree
Cause: React Native version mismatch with packages
Fix: Add --legacy-peer-deps to all npm install commands
```

### Key Terminal Commands
```
Start app:
npx expo start --offline

Install packages:
npm install [package] --legacy-peer-deps

Go to project:
cd C:\Users\prita\OneDrive\Desktop\internship\15days\vendos-app

Open VS Code:
code .

Create file:
New-Item filename.jsx

Create folder:
mkdir foldername
```

---

## 9. BACKEND PLAN (Flask + Python)

### What Backend Does
```
1. Stores all product data in SQLite database
2. Serves product API to customer app
3. Receives orders after payment
4. Verifies payment with Razorpay
5. Sends dispense command to ESP32
6. Updates stock after dispensing
7. Syncs data to Firebase for admin panel
8. Sends Telegram alerts for low stock
```

### File Structure
```
vendos-backend/
├── app.py                 ← Main Flask app
├── database.py            ← SQLite setup
├── routes/
│   ├── products.py        ← GET /api/products
│   ├── orders.py          ← POST /api/order
│   ├── payment.py         ← POST /api/verify-payment
│   └── dispense.py        ← POST /api/dispense
├── models/
│   ├── product.py
│   └── order.py
├── services/
│   ├── esp32.py           ← Send command to ESP32
│   ├── firebase.py        ← Sync to Firebase
│   └── telegram.py        ← Send alerts
└── requirements.txt
```

### Key API Endpoints
```
GET  /api/products         → Return all products
POST /api/order            → Create new order
POST /api/verify-payment   → Verify Razorpay payment
POST /api/dispense         → Trigger ESP32 motor
GET  /api/stock            → Get current stock
POST /api/restock          → Update stock (admin)
```

---

## 10. ESP32 HARDWARE PLAN

### Components Needed
```
✅ ESP32 board (have)
✅ Stepper motor 28BYJ-48 (have)
✅ Breadboard + jumper wires (have)
❌ ULN2003 motor driver (BUY THIS — ₹50-100)
❌ 5V power supply or USB power bank
```

### Wiring (28BYJ-48 + ULN2003 + ESP32)
```
ULN2003 IN1 → ESP32 GPIO 26
ULN2003 IN2 → ESP32 GPIO 27
ULN2003 IN3 → ESP32 GPIO 28
ULN2003 IN4 → ESP32 GPIO 29
ULN2003 VCC → 5V
ULN2003 GND → GND
Motor connector → ULN2003 motor port
```

### ESP32 Logic
```
1. Connect to WiFi on startup
2. Start HTTP server on port 80
3. Listen for POST /dispense
4. Receive: {slot: "A1", qty: 2}
5. Rotate motor 360 degrees × qty times
6. Wait 1.5 seconds between rotations
7. Send back: {success: true}
```

### Motor Rotation = Stock Count
```
Admin sets stock = 20 items
Every motor rotation = 1 item dispensed
Pi/backend calculates: 20 - rotations = remaining
No sensor needed!
Mathematical accuracy = 100%
```

---

## 11. FIREBASE DATA STRUCTURE

```
Firebase Firestore:
│
├── products/
│   ├── A1: {
│   │     name: "Coca Cola",
│   │     price: 50,
│   │     stock: 14,
│   │     maxStock: 20,
│   │     image: "url",
│   │     offer: "Buy 2 Get 1",
│   │     category: "Drinks",
│   │     enabled: true,
│   │     slotId: "A1"
│   │   }
│   └── ... (20 slots)
│
├── orders/
│   └── orderId: {
│         items: [...],
│         total: 150,
│         discount: 50,
│         status: "dispensed",
│         timestamp: "...",
│         paymentId: "..."
│       }
│
├── sales/
│   └── YYYY-MM-DD: {
│         revenue: 1840,
│         count: 42,
│         items: [...]
│       }
│
└── machine/
    ├── status: "online"
    ├── lastSeen: timestamp
    └── alerts: [...]
```

---

## 12. COMPLETE DATA FLOW

```
ADMIN PANEL (Web Browser)
Owner adds product, sets price, uploads image
         ↓ saves to
FIREBASE DATABASE (Cloud)
         ↓ app reads from
CUSTOMER APP (Phone)
Shows products with real images and prices
         ↓ customer selects and pays
RAZORPAY (Payment Gateway)
Confirms payment, sends webhook
         ↓ webhook hits
FLASK BACKEND (Laptop/Raspberry Pi)
Receives payment confirmation
Saves order to SQLite + Firebase
         ↓ sends HTTP command to
ESP32 (Hardware on WiFi)
Receives: {slot: "A1", qty: 2}
Rotates motor 360° × 2 times
         ↓ confirms back to
FLASK BACKEND
Updates stock in SQLite + Firebase
         ↓ Firebase updates
ADMIN PANEL
Shows reduced stock, new sale in analytics
Sends Telegram alert if stock low
```

---

## 13. PAYMENT FLOW DETAIL

```
For Demo (no real payment):
App shows QR → Customer taps "Payment Done"
→ Backend simulates success
→ Motor rotates → item drops

For Production (real payment):
1. App calls backend: POST /api/create-order
2. Backend creates Razorpay order, returns QR
3. App shows real UPI QR with exact amount
4. Customer scans and pays
5. Razorpay sends webhook to backend
6. Backend verifies signature
7. Backend calls POST /api/dispense to ESP32
8. Motor rotates
9. Backend updates stock
10. App shows dispensing screen
```

---

## 14. NEXT STEPS IN ORDER

```
Step 1 — Fix "something went wrong" in Expo app
         → Check all imports are correct
         → Make sure all files are saved
         → Try: npx expo start --clear --offline

Step 2 — Test complete app flow on phone
         → Welcome → Products → Cart → Payment → Done

Step 3 — Build Flask backend
         → Install Python + Flask
         → Create database
         → Build all API routes

Step 4 — Buy ULN2003 motor driver (₹50-100)
         → Connect ESP32 + motor + driver
         → Upload Arduino code

Step 5 — Connect app to backend
         → Update api.js with laptop IP
         → Test order flow

Step 6 — Connect backend to ESP32
         → Test motor rotates on payment

Step 7 — Connect Firebase
         → Admin panel syncs to app
         → Real-time stock updates

Step 8 — Real payment (Razorpay)
         → Create Razorpay account (free)
         → Get API keys
         → Replace demo payment

Step 9 — Full demo test
         → Complete flow end to end

Step 10 — Present to teacher!
```

---

## 15. RASPBERRY PI DEPLOYMENT (Future)

```
When Pi arrives:
1. Install Raspberry Pi OS
2. Copy Flask backend to Pi
3. Set Flask to auto-start on boot
4. Connect 7" HDMI touchscreen
5. Open admin panel in Chromium kiosk mode
6. Connect 20 motors via multiple L298N drivers
7. Each slot has one motor
8. Pi GPIO controls all motors
9. USB 4G dongle for internet
10. System runs 24/7 automatically
```

---

## 16. PROJECT LOCATIONS ON LAPTOP

```
Admin Panel:
C:\Users\prita\OneDrive\Desktop\internship\15days\vendos-admin

Customer App:
C:\Users\prita\OneDrive\Desktop\internship\15days\vendos-app

Backend (to be created):
C:\Users\prita\OneDrive\Desktop\internship\15days\vendos-backend
```

---

## 17. IMPORTANT NOTES FOR AI ASSISTANT

```
1. Customer app uses Expo SDK 54 (not latest SDK 56)
2. Use --legacy-peer-deps for all npm installs
3. Use npx expo start --offline to avoid fetch errors
4. Navigation uses @react-navigation/stack (NOT native-stack)
5. All colors defined in app/constants/colors.js
6. All products defined in app/constants/products.js
7. Cart state managed by Zustand in app/store/cartStore.js
8. Backend URL in app/services/api.js → change IP when ready
9. Admin panel is React web (not React Native)
10. ESP32 communicates via HTTP over local WiFi
```

---

*Document prepared by Claude — VendOS Project 2026*
