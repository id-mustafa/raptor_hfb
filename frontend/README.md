# Minimal Template

This is a [React Native](https://reactnative.dev/) project built with [Expo](https://expo.dev/) and [React Native Reusables](https://reactnativereusables.com).

It was initialized using the following command:

```bash
npx @react-native-reusables/cli@latest init -t social-betting
```

## Getting Started

To run the development server:

```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
```

This will start the Expo Dev Server. Open the app in:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

You can also scan the QR code using the [Expo Go](https://expo.dev/go) app on your device. This project fully supports running in Expo Go for quick testing on physical devices.

## Backend connectivity

- The FastAPI backend listens on `http://localhost:4402` by default.
- The Expo app reads the backend base URL from `app.json` (`expo.extra.apiUrl`). Adjust this value if your backend runs elsewhere (for example on a different machine IP when testing on a physical device).
- CORS is configured on the backend to accept requests from the Expo dev ports (`4400`, `4401`, `8081`, `19006`). If you expose the frontend from a different origin, add it in `backend/main.py`.

### Verifying the connection

1. Start the FastAPI server (e.g. `uvicorn backend.main:app --host 0.0.0.0 --port 4402`).
2. In another terminal start the Expo dev server (`npm run dev`).
3. Log in with an existing username (e.g. `user1`) or enter a new name to auto-create it.
4. From the home screen press **Refresh from server** to confirm friends, requests, and rooms load without errors.

Use the helper actions exposed by the `AuthProvider` hook to trigger friend requests (`sendRequest`, `acceptRequest`, `declineRequest`) and room actions (`createRoomForUser`, `joinRoomForUser`, `leaveRoomForUser`).

## Adding components

You can add more reusable components using the CLI:

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

If you don't specify any component names, you'll be prompted to select which components to add interactively. Use the `--all` flag to install all available components at once.

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

## Deploy with EAS

The easiest way to deploy your app is with [Expo Application Services (EAS)](https://expo.dev/eas).

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

If you enjoy using React Native Reusables, please consider giving it a ⭐ on [GitHub](https://github.com/founded-labs/react-native-reusables). Your support means a lot!
