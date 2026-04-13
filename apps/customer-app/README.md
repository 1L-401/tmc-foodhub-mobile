# TMC Foodhub Mobile

TMC Foodhub Mobile is a cross-platform mobile application built using **React Native** and **Expo**. It serves as the mobile interface for the TMC Foodhub ecosystem, enabling seamless onboarding, authentication, and platform access.

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (File-based routing)
- **Styling**: React Native StyleSheet
- **Animations**: React Native Reanimated
- **Icons**: `@expo/vector-icons` & Custom SVGs (`react-native-svg`)

## Features

- **Get Started Screen**: Introduction screen with dynamic sizing and fluid layouts.
- **Login Flow**: Complete authentication UI tailored to brand specifications, including custom inputs, Google/Facebook login integrations, and interactive cascading components.
- **Tab Navigation**: Standard bottom-tab exploration routing.

## Prerequisites

Before running the project, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (LTS recommended)
- [npm](https://www.npmjs.com/) or yarn
- Expo Go app on your physical device (available on App Store / Google Play), or an Android/iOS emulator installed on your machine.

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd tmc-foodhub-mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

This will run the Metro bundler. From here, you can:
- **Scan the QR code** using the Expo Go app on your physical device.
- Press `a` to open the app on an Android Emulator.
- Press `i` to open the app on an iOS Simulator.
- Press `w` to open the app in a web browser.

## Project Structure

- `app/`: Expo Router file-based navigation screens.
  - `_layout.tsx`: Root layout and Stack navigation configuration.
  - `index.tsx`: Splash/Redirect handling.
  - `get-started.tsx`: Onboarding hero screen.
  - `login.tsx`: User authentication and sign-in.
  - `(tabs)/`: Protected dashboard/tabbed pages.
- `components/`: Reusable UI elements (e.g., `tmc-logo.tsx`, `google-logo.tsx`).
- `assets/`: Static resources like fonts, images, and brand SVGs.
- `constants/`: Configuration values, themes, and colors.

## Scripts

- `npm start` - Starts the Expo Metro bundler.
- `npm run android` - Starts the bundler and directly opens the Android emulator.
- `npm run ios` - Starts the bundler and directly opens the iOS simulator.
- `npm run web` - Runs the application in the web profile.
- `npm run lint` - Lints the codebase for syntax or stylistic errors using ESLint.

## License

All rights reserved by TMC Foodhub.
