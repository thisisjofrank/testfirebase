# Firebase + Deno demo (Firestore)

This repo shows how to use Firebase (Auth + Firestore) from Deno using npm:firebase.

## What you'll build

- Initialize Firebase app from env config
- Optional: connect to local emulators
- Anonymous sign-in
- Firestore CRUD on a `dinosaurs` collection

## Prerequisites

- Deno 1.42+
- A Firebase project (<https://console.firebase.google.com>)

Optional for local dev:

- Firebase Emulators (Firestore, Auth) via `firebase-tools`

## Setup

1. Create a Web App in Firebase Console and copy the SDK config.
2. Create a `.env` from the template and fill values:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase config (apiKey, authDomain, projectId, ...).

1. (Optional) Enable Anonymous sign-in in Firebase Console -> Authentication -> Sign-in method -> Anonymous.
   If you use the Auth emulator, this isn't required.
1. (Optional) To use emulators instead of production:
   - Install firebase-tools, run: `firebase emulators:start --only firestore,auth`
   - Set `USE_FIREBASE_EMULATOR=true` in `.env` or run the emulator task below

## Run the demo

Use the provided task which sets the right flags for npm interop and env:

```bash
deno task demo:firestore
```

Against local emulators:

```bash
deno task demo:firestore:emu
```

You'll see logs for Create, Read, Update, Delete against `dinosaurs` collection.

## Run the web app

Start a small server that serves the UI and exposes a REST API backed by Firestore:

```bash
deno task dev:web
```

Against local emulators:

```bash
deno task dev:web:emu
```

Open <http://localhost:8000>

## Build for Deno Deploy

This project includes a simple build step that bundles the server and copies static assets to `dist/`.

```bash
deno task build
```

Preview the bundle locally:

```bash
deno task preview
```

Deploy with `deployctl` (set your project name):

```bash
DEPLOY_PROJECT=my-deploy-project deno task deploy
```

Notes:

- Deno Deploy doesn’t support traditional Node.js `node_modules`; this project uses npm:firebase via Deno’s npm compatibility, which works in Deploy.
- Ensure your Firebase credentials are available as environment variables in your Deploy project (Settings → Environment Variables) or switch to emulator connections for staging purposes.

## Files

- `firebase.ts`: Initializes Firebase app, Auth, Firestore. Supports emulators via env flags.
- `firestore_demo.ts`: Runs CRUD demo with anonymous auth.
- `.env.example`: Template env file.
- `deno.json`: Task to run demo and npm:firebase import mapping.
  - dev:web, dev:web:emu, build, preview, deploy

## Notes

- Firestore security rules default to locked down in production. For the quickest demo, run against emulators, or update your rules appropriately.
- When using emulators, the demo signs in anonymously and stores the temporary user in memory only.
