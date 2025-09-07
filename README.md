# Tech-Series-2025
This is a group project done by 6 Singapore Management University (SMU) students (insert names) for the Tech Series 2025 hosted by SMU Elipsis.
Demo video: https://youtu.be/mV-3L2xEX10

# EcoCommerce App

EcoCommerce is a full-stack web and mobile application focused on sustainability, eco-friendly shopping, and gamified rewards.  
It features barcode/receipt scanning, product recommendations, leaderboards, vouchers, and a user profile dashboard.

---

## Features

### Frontend (React Native & Web)
- **Login & Signup:** Secure authentication, eco-themed UI.
- **Home Screen:** Product browsing, category filtering, search, and eco scores.
- **Upload Screen:** Scan barcodes or receipts to earn points and get recommendations.
- **Recommendations:** View sustainable alternatives for scanned products.
- **Leaderboard:** National and neighbourhood rankings, highlighting current user.
- **Vouchers:** Claim and view discount vouchers based on points.
- **Profile:** Track points, eco journey, and ranks.
- **Receipts Points:** See points earned from receipts, with confetti celebration.

### Backend (Node.js/Express)
- **User Management:** Registration, login, profile, points update.
- **Product API:** List, scan barcode, get recommendations.
- **Receipt API:** Scan, save, and calculate eco points.
- **Leaderboard API:** National and neighbourhood ranks.
- **Voucher API:** Eligibility check, claim, and list user vouchers.

---

## Tech Stack

- **Frontend:** React Native (Expo), React (Web), CSS-in-JS, Themed UI
- **Backend:** Node.js, Express, MongoDB
- **Other:** AsyncStorage, Confetti, Charting, ImageBackgrounds

---

## Setup

### 1. Clone the Repository

```sh
git clone https://github.com/sri7373/Tech-Series-2025.git
```

### 2. Install Dependencies

#### Backend
```sh
cd backend
npm install
```

#### Frontend
```sh
cd frontend
npm install
```

### 3. Start the Servers

#### Backend
```sh
npm nodemon server.js
```

#### Frontend (Expo)
```sh
npm expo start
Press 'w' for web
```

---

## File Structure

```
Tech-Series-2025/
  backend/
    api/
    models/
    routes/
    testing/
    ...
  frontend/
    screens/
      HomeScreen.js
      LoginScreen.js
      LeaderBoard.js
      ProfileScreen.js
      RecommendationsScreen.js
      ReceiptsPoints.js
      Upload.js
      Vouchers.js
      ...
    theme/
      colours.js
      typography.js
    assets/
      leafy.jpg
      ...
  README.md
```

---

## Theming

- **Colours:** See `frontend/theme/colours.js` for eco-friendly palette.
- **Typography:** See `frontend/theme/typography.js` for font sizes and weights.

---

## Usage

- **Scan a barcode or receipt** to earn points and get eco recommendations.
- **Browse products** and filter by category.
- **Check your rank** on the leaderboard.
- **Claim vouchers** when you have enough points.
- **Track your eco journey** in your profile.

---

## Notes

- Make sure `assets/leafy.jpg` exists for background images.
- API endpoints are set to `localhost:3000` by default.
- For web, some React Native features (e.g., ImageBackground) may need polyfills or adjustments.

---
