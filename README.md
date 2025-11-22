React Native Task Manager with Firebase Auth & Firestore

This app is a React Native CLI project that provides:

Email/password authentication with Firebase Auth

A task manager with:

Add / edit / delete tasks

Mark complete / incomplete

Local storage via AsyncStorage

Sync to Firestore when online

Local push notifications for task reminders

Light/Dark theme using Redux Toolkit with a global toggle

Architecture choice

The app follows a simple, pragmatic architecture suitable for small–medium React Native projects:

React Native CLI (not Expo)

Full control over native modules (Firebase, Notifee, etc.)

Feature-oriented folders

src/screens for screen components (auth, home, etc.)

src/components for reusable UI (inputs, buttons, task item, theme toggle)

src/navigation for AuthStack, AppStack, and RootNavigator

src/redux for store + theme slice

src/types for shared TypeScript types (e.g. Task, navigation types)

src/storage for AsyncStorage helpers

src/services for Firestore & notification logic

State management

Authentication state is managed by Firebase Auth (onAuthStateChanged)

UI theme is managed with Redux Toolkit (themeSlice)

Screen-local state (e.g. current form, tasks list in-memory) is managed with React hooks (useState, useEffect)

Offline-first task data

Tasks are stored locally in AsyncStorage

On network availability + login, tasks are synced to Firestore

Firestore SDK handles offline queuing of writes

Form handling & validation

Login and Signup use Formik + Yup for structured forms and validation

Navigation

React Navigation with:

AuthStack for Login / Signup

AppStack for Home

RootNavigator decides which stack based on auth state

This keeps the app readable, easy to extend, and avoids over-complicated patterns.

■ Libraries used

Core:

React Native CLI

TypeScript (if you’ve set .tsx everywhere)

Navigation:

@react-navigation/native

@react-navigation/native-stack

react-native-screens

react-native-safe-area-context

Firebase:

@react-native-firebase/app

@react-native-firebase/auth

@react-native-firebase/firestore

State management:

@reduxjs/toolkit

react-redux

Forms & validation:

formik

yup

Storage & network:

@react-native-async-storage/async-storage

@react-native-community/netinfo

Notifications:

@notifee/react-native (local scheduled push notifications)

UI components (custom):

CommonInput – themable text input

PrimaryButton – themable button

TaskItem – rendered task row

ThemeToggleButton – toggles light/dark theme

■ How to run the app in each environment
1. Prerequisites

Make sure you have:

Node.js & npm / yarn

Java JDK + Android Studio (for Android)

Xcode + CocoaPods (for iOS, on macOS)

React Native CLI environment set up (react-native docs)

Install dependencies in project root:

yarn
# or
npm install

2. Firebase setup

Create a Firebase project.

Enable Email/Password Auth in Authentication → Sign-in method.

Enable Cloud Firestore (production mode recommended).

Add Android app:

Use the package name from android/app/src/main/AndroidManifest.xml

Download google-services.json

Place it at: android/app/google-services.json

(If using iOS) Add iOS app and download GoogleService-Info.plist:

Add it via Xcode into the iOS project.

Update Firestore rules (basic secure example):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

3. Notifee setup (notifications)

Install the library & pods (already part of the project setup):

yarn add @notifee/react-native
cd ios && pod install && cd ..


Android: add permission in android/app/src/main/AndroidManifest.xml:

<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

4. Run on Android (Debug)

From project root:

# Make sure Metro is running
npx react-native start

# In another terminal
npx react-native run-android

5. Run on iOS (Debug, macOS only)
cd ios
pod install
cd ..

# Then
npx react-native run-ios


Make sure an iOS Simulator is open or a device is connected.

■ Known limitations

Simple Firestore sync strategy

Currently uses “local wins” or simple overwrite logic when syncing.

No advanced conflict resolution between multiple devices.

No granular per-task sync status

App doesn’t show which tasks are “pending sync” vs “synced”.

Firestore offline queue is handled internally by the SDK.

Reminder time is basic

Reminder time is currently hard-coded or basic (e.g. fixed offset).

No dedicated date-time picker UI for selecting custom reminder time per task (unless you add it).

No deep linking / push from backend

App uses only local notifications (Notifee), not FCM push from server.

No role-based access / profiles

Only supports basic email/password login.

No additional user profile fields beyond Firebase Auth + Firestore task data.