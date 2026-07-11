# VendOS Technical Documentation
**System Architecture, Database, Code Packages, and Deployment Handoff Guide**

---

## 1. Executive Summary & Architecture Overview

VendOS is a comprehensive, production-ready smart vending machine IoT solution. The system bridges web management, mobile user experiences, and physical hardware over local and cloud networks.

The system is divided into four main architectural layers:
1. **Admin Panel (Web Interface):** A responsive dashboard built with **React, Vite, Zustand, and Recharts**. It allows the machine owner to configure slots, track real-time stock, update offers, and view detailed analytics on sales and revenue.
2. **Customer App (Mobile Application):** A mobile application built with **React Native (Expo SDK 54) and Zustand** for customer interaction. It enables users to view product selections, add items to a cart, scan UPI QR codes, and trigger vending actions.
3. **Backend API (Node.js Server):** An Express-based backend engine that orchestrates database transactions via Mongoose, tracks inventory status, interacts with payment verification endpoints, maintains hardware dispensing queues, and serves REST API endpoints for both the Admin Panel and the mobile Customer App.
4. **Hardware (ESP32 Microcontroller):** An IoT physical dispenser using an **ESP32 board, ULN2003 driver, and a 28BYJ-48 stepper motor** that polls the backend API, fetches dispensing queues, and rotates the coils mathematically (360° per item) to drop products.

### Complete System Data Flow Diagram

```
+------------------------------------+
|       ADMIN PANEL (React Web)      |
|   - Configure slot configurations   |
|   - Monitor sales analytics        |
|   - Real-time stock status         |
+-----------------+------------------+
                  | REST API
                  v
+-----------------+------------------+       MongoDB
|     EXPRESS BACKEND (Node.js)      +-----> [ vendos_db ]
|   - Serves /api/slots, /api/sales  |
|   - Processes transactions         |
|   - Manages hardware dispense queue|
+--------+------------------+--------+
         ^                  |
         | REST API         | Polls Queue (HTTP GET)
         |                  v
+--------+--------+    +----+-----------------------------+
|  CUSTOMER APP   |    |      ESP32 HARDWARE DEVICE       |
|  (React Native) |    | - Connects to local WiFi         |
|  - Selects item |    | - Fetches next slot from queue   |
|  - Scans UPI QR |    | - Rotates motor to drop product  |
+-----------------+    +----------------------------------+
```

---

## 2. Technical Stack & Code Packages

### 2.1 Admin Panel (`vendos-admin`)
Built as a modern Single Page Application (SPA) with lightning-fast builds via Vite:
*   **Core:** React 19, Vite 8, HTML5, CSS Modules (for component-scoped styling).
*   **State Management:** `zustand` (v5.0.14) — provides decoupled, lightweight global state stores for slots, stats, and sales.
*   **Routing:** `react-router-dom` (v7.16.0) — manages view navigation (Dashboard, Slots, Analytics, Restock, Alerts, Settings).
*   **Visual Charts:** `recharts` (v3.8.1) — generates dynamic SVG charts for revenue tracking and popular products.
*   **Icons:** `lucide-react` (v1.17.0) — supplies vector assets for dashboard navigation sidebar.
*   **HTTP Client:** `axios` (v1.17.0) — queries the Node.js backend.

### 2.2 Customer App (`vendos-app`)
Built with Expo for cross-platform efficiency:
*   **Core:** React Native (v0.81.5), React (v19.1.0), Expo SDK 54.
*   **Navigation:** `@react-navigation/stack` (v7.10.0) — configured as the primary router to avoid bugs commonly found with Native Stack in older SDK layers.
*   **State Management:** `zustand` (v5.0.14) — stores cart inventory counts and synced product records.
*   **Layout Helpers:** `react-native-safe-area-context` and `react-native-screens`.

### 2.3 Backend API (`backend`)
A lightweight Express service written in Node.js:
*   **Framework:** Express (with CORS support via the `cors` package to allow cross-origin requests from the web and mobile ports).
*   **Database Engine:** Mongoose (ODM for MongoDB).
*   **Running/Development:** `nodemon` for automatic restarts during local development.

---

## 3. Database Architecture & Schema

The backend uses MongoDB (connection string: `mongodb://localhost:27017/vendos_db`) using Mongoose schemas.

### 3.1 MongoDB Mongoose Schemas

#### Schema 1: `Slot` (Collection: `slots`)
This collection represents the physical slot configurations of vending machines.
```javascript
const SlotSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, default: "VM-01" },
    slot_number: { type: String, required: true }, // e.g. "A01", "B02"
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    max: { type: Number, default: 20 },
    alertThreshold: { type: Number, default: 0.20 },
    category: { type: String, default: "Drinks" },
    enabled: { type: Boolean, default: true },
    image: { type: String, default: null }, 
    status: { type: String, enum: ["ok", "low", "empty", "off"], default: "empty" },
    dispatch_status: { type: String, enum: ["IDLE", "PENDING", "SUCCESS", "FAILED"], default: "IDLE" },
    last_order_id: { type: String, default: "" },
    offer_type: { type: String, default: null },
    offer_value: { type: String, default: null }
}, { timestamps: true });
```

#### Schema 2: `Sale` (Collection: `sales`)
Logs every transaction for analytics, accounting, and revenue tracking.
```javascript
const SaleSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, default: "VM-01" },
    slot_id: { type: String, required: true },
    product_name: { type: String, default: "" },
    category: { type: String, default: "Other" },
    price_paid: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
```

#### Schema 3: `Setting` (Collection: `settings`)
Stores backend system settings and credentials.
```javascript
const SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});
```

#### Schema 4: `Machine` (Collection: `machines`)
Represents the registered smart vending machines in the network.
```javascript
const MachineSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, enum: ["online", "offline", "maintenance"], default: "online" },
    upi_id: { type: String, default: "owner@upi" },
    orderIndex: { type: Number, default: 0 }
}, { timestamps: true });
```

---

## 4. Key API Endpoints & Interfaces

The Node.js Express server listens on port `5000` (e.g., `http://<LAPTOP_IP>:5000`).

### 4.1 `GET /api/slots`
*   **Purpose:** Fetches status and configurations of all slots. Used by both the Admin Panel and the Customer App.
*   **Response Format:**
    ```json
    [
      {
        "slot_id": "A1",
        "name": "Coca Cola",
        "category": "Drinks",
        "price": 50.0,
        "stock": 14,
        "max_capacity": 20,
        "alert_threshold": 0.2,
        "status": "ok",
        "image": null,
        "offer_type": null,
        "offer_value": null,
        "enabled": 1
      }
    ]
    ```

### 4.2 `POST /api/slots/save`
*   **Purpose:** Inserts or replaces slot configurations. Configures item price, stock refills, categories, and offers.
*   **Payload Example:**
    ```json
    {
      "slot_id": "A2",
      "name": "Pepsi",
      "category": "Drinks",
      "price": 45.0,
      "stock": 20,
      "max_capacity": 20,
      "alert_threshold": 0.20,
      "offer_type": "Discount (%)",
      "offer_value": "10",
      "enabled": true
    }
    ```

### 4.3 `POST /api/transactions/process`
*   **Purpose:** Invoked when a transaction completes. Performs:
    1. Stock deduction
    2. Offer parsing (e.g., if a slot has a `Buy X Get Y Free` offer of `2+1`, buying 2 triggers a deduction and physical dispense of 3 items if stock allows)
    3. State/status updating (`ok`, `low`, `empty`)
    4. Queueing the `slot_id` into the hardware FIFO array
    5. Saving sales receipt records
*   **Payload Example:**
    ```json
    {
      "slot_id": "A1",
      "quantity": 2,
      "price_paid": 100.0
    }
    ```
*   **Response Example:**
    ```json
    {
      "success": true,
      "message": "Transaction processed. Dispensing 3 items (Purchased: 2, Free: 1). Added to hardware queue.",
      "slot_id": "A1",
      "new_stock": 11,
      "new_status": "ok",
      "total_dispensed": 3
    }
    ```

### 4.4 `GET /api/hardware/dispense-queue`
*   **Purpose:** Polled by the physical ESP32 microcontroller at regular intervals.
*   **Logic:** Uses FIFO sequence (First In, First Out). If the queue contains items, the server pops the oldest item and returns it, signaling the ESP32 to spin the corresponding slot's motor.
*   **Response (When item queued):**
    ```json
    {
      "dispense": true,
      "slot_id": "A1"
    }
    ```
*   **Response (When queue empty):**
    ```json
    {
      "dispense": false
    }
    ```

---

## 5. Hardware & ESP32 Integration

### 5.1 Hardware Specifications
*   **Controller:** ESP32 Board (runs an HTTP client over local WiFi).
*   **Actuator:** 28BYJ-48 Stepper Motor (turns the physical spiral to dispense items).
*   **Driver:** ULN2003 Darlington Transistor Array Board (translates weak microcontroller GPIO outputs into motor coil currents).

### 5.2 Wiring Reference Table
| ULN2003 Driver Pin | ESP32 GPIO Pin | Description |
| :--- | :--- | :--- |
| **IN1** | GPIO 26 | Coil 1 Control |
| **IN2** | GPIO 27 | Coil 2 Control |
| **IN3** | GPIO 28 | Coil 3 Control |
| **IN4** | GPIO 29 | Coil 4 Control |
| **VCC** | 5V / External Power Bank | Power Supply (+) |
| **GND** | GND (Common Ground) | Reference Ground (-) |

### 5.3 ESP32 Core Loop Logic (Pseudocode)
```cpp
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // Query backend queue endpoint
    http.begin("http://<BACKEND_IP>:5000/api/hardware/dispense-queue");
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      // Parse JSON from response
      DynamicJsonDocument doc(256);
      deserializeJson(doc, payload);
      
      bool dispense = doc["dispense"];
      String slot_id = doc["slot_id"];
      
      if (dispense) {
        Serial.println("Dispensing product in slot: " + slot_id);
        // Spin stepper motor 360 degrees to dispense 1 unit
        rotateStepperMotor(360); 
        delay(1500); // Guard time to avoid jamming
      }
    }
    http.end();
  }
  delay(1000); // Poll once per second
}
```

---

## 6. Project Workarounds & Configuration Hacks

When developing or presenting in different network configurations (e.g. college or office WiFi networks), keep these hacks in mind:

### 6.1 Bypass SSL Check Errors (`SELF_SIGNED_CERT_IN_CHAIN`)
If a restricted local network blocks standard SSL queries, disable certificate verification in NPM:
```powershell
npm config set strict-ssl false
npm config set registry https://registry.npmjs.org
```

### 6.2 Expo Offline Mode Development
If internet access is unavailable or slow, run Expo locally:
```powershell
npx expo start --offline
```

### 6.3 Local API Linking
Since the customer app runs on a physical mobile device, the API calls must target the backend laptop's IP address on the local WiFi network (e.g. `http://192.168.1.5:5000`) instead of `localhost`. Check and update the target IP in:
`vendos-app/app/services/api.js` (Line 2: `export const BASE_URL = 'http://<IP>:5000'`)

---

## 7. Cloud Integration & Real Payment Roadmap

To convert the demo vending system into a public service, follow this setup guide:

### 7.1 Real-Time Syncing (Firebase Firestore)
Migrate the SQLite tables to Google Firestore database using this layout:
*   `products/{slot_id}`: document containing pricing, categories, stock, and offer status.
*   `orders/{order_id}`: document log for active transaction status, totals, and timestamps.
*   `sales/{date_string}`: document collecting daily revenue metrics.

### 7.2 Razorpay Webhook Payment Flow
1. Customer App requests backend: `POST /api/create-order` with slot and discount total.
2. Backend makes a server-to-server HTTP API request to Razorpay to generate an Order ID.
3. Customer App presents UPI QR code using the generated Razorpay Order payload.
4. Once paid, Razorpay invokes the Flask endpoint: `POST /api/verify-payment` via a Webhook.
5. Flask verifies the cryptographic signature:
   ```python
   # HMAC verification
   import hmac, hashlib
   # Verify razorpay_signature using client keys and request payload
   ```
6. On verification, Flask processes the transaction, updates the stock database, and inserts the `slot_id` into the hardware dispatch queue.

---

## 8. Development Setup & Launch Guide

Follow these steps to spin up the full stack:

### Step 1: Start Backend
```powershell
cd backend
# Install backend dependencies
npm install

# Start the Node.js backend server
npm run dev
```

### Step 2: Launch Admin Panel
```powershell
cd vendos-admin
npm install --legacy-peer-deps
npm run dev
```

### Step 3: Launch Customer App
```powershell
cd vendos-app
npm install --legacy-peer-deps
npx expo start
```
*Scan the generated QR code using the **Expo Go** application on your iOS/Android device.*

---

## 9. Professional Git & GitHub Deployment Guide

Follow these steps to track and upload your entire multi-folder project to a single Monorepo on GitHub from scratch.

### Step 1: Create a `.gitignore` in the Root Directory
Create a file named `.gitignore` at the root folder (`15days/.gitignore`) to prevent uploading heavy build outputs and local configuration keys:
```text
# Dependency directories
**/node_modules/
**/.expo/
**/dist/

# Local Environment Variables
**/.env
**/.env.local

# Device specific/OS logs
.DS_Store
Thumbs.db
```

### Step 2: Initialize Git and Commit
Open your terminal at the project root (`15days`) and run:
```powershell
# 1. Initialize local repository
git init

# 2. Add all project files (Express backend, React admin, Expo app)
git add .

# 3. Create the initial commit
git commit -m "feat: complete functional setup of VendOS website, mobile app, and backend"
```

### Step 3: Push to GitHub
1. Open your web browser and go to [github.com](https://github.com/).
2. Create a new repository named `vendos` (you can keep it public or private). **Do not check** "Add a README", "Add .gitignore", or "Choose a license" (leave them empty/unchecked).
3. Copy your repository's HTTPS link (e.g. `https://github.com/YOUR_USERNAME/vendos.git`).
4. Run these commands in your local terminal to link and push your code:
```powershell
# 1. Rename local branch to main
git branch -M main

# 2. Connect your local repository to GitHub
git remote add origin https://github.com/YOUR_USERNAME/vendos.git

# 3. Push the code
git push -u origin main
```

### Step 4: Tracking Hardware Code
Once pushed, create a folder named `hardware` under the root directory (`15days/hardware`). You can save your ESP32 Arduino sketches (`.ino`) here. To push updates later, run:
```powershell
git add hardware/
git commit -m "feat: add ESP32 motor controller sketch"
git push
```
