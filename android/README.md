# Quick Fix Electronics — Native Android App (Kotlin & Jetpack Compose)

This is the native Android version of **Quick Fix Electronics India**, built with modern Android standards:
- **Language**: Kotlin 2.1
- **UI Framework**: Jetpack Compose with Material Design 3 (Dark & Light theme)
- **Architecture**: MVVM with reactive `StateFlow` and unidirectional data flow (UDF)
- **Target SDK**: Android 35 (Android 15), Min SDK 24 (Android 7.0+)
- **Build System**: Gradle 8.8+ with Kotlin DSL (`build.gradle.kts`) and Version Catalog (`libs.versions.toml`)

---

## Features Included (1:1 with Web App)
1. **Workshop Command Center (`DashboardScreen.kt`)**: Real-time metrics for active repairs, ready for delivery, total revenue in INR, low stock alerts, and quick action cards.
2. **New Repair Job Card (`NewRepairScreen.kt`)**: Full customer onboarding (name, mobile), brand selector (Apple, Samsung, OnePlus, Xiaomi, etc.), fault descriptions, advance payments, and estimated quotes.
3. **Repair Tracking & History (`RepairHistoryScreen.kt`)**: Live filter by status (`Received`, `Diagnosing`, `Waiting Parts`, `In Repair`, `Ready`, `Delivered`, `Cancelled`), search by phone or IMEI, instant status switcher.
4. **Parts & Labour Editor (`EditPartsAndLaborDialog.kt`)**: 
   - Add/remove replacement components installed
   - Real-time parts cost vs bench labour charges
   - Hourly presets (Diagnostics ₹350, Screen/Battery ₹650, Motherboard IC rework ₹1200)
   - Discount deduction
   - GST tax rate selector (0%, 5%, 12%, 18%, 28%) with automatic CGST & SGST calculations
   - Real-time total calculation and direct link to generate invoice.
5. **Tax Invoice & Billing (`InvoiceReceiptDialog.kt`)**: Full tax invoice with shop credentials, GSTIN, verified badge, customer info, itemized parts & labour breakdown, WhatsApp sharing, and print action.
6. **Spare Parts Inventory (`InventoryScreen.kt`)**: Stock tracking with SKU, bin location, low stock warnings, cost vs selling prices, and quick `+` / `-` stock adjustments.
7. **B2B Spares Marketplace (`PartsMarketplaceScreen.kt`)**: Wholesale parts catalog (Original OLEDs, Batteries, BGA stencils, Charging modules) from verified vendors across Delhi and Mumbai with express delivery estimates.
8. **Technician Profile & Visiting Card (`ProfileScreen.kt`)**: Digital visiting card with shop credentials, rating, completed jobs counter, and contact details.

---

## How to Build & Run in Android Studio

### 1. Open in Android Studio
1. Launch Android Studio (Koala, Ladybug, Meerkat or newer).
2. Click **File > Open** and select the `android/` directory.
3. Allow Gradle to sync dependencies via `gradle/libs.versions.toml`.

### 2. Build Debug APK
In the terminal inside Android Studio (or root `android/` directory):
```bash
./gradlew assembleDebug
```
The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Run on Device / Emulator
1. Connect an Android phone with USB Debugging enabled, or start an Android Virtual Device (AVD).
2. Click the green **Run (▶)** button in Android Studio.
