# Grit

**Daily habit & task tracker** — build streaks, crush goals.

![Grit Logo](public/grit.svg)

## Tech Stack

- **Frontend:** React 19 + Vite 7
- **Styling:** Tailwind CSS 3
- **Backend:** Firebase (Auth, Firestore)
- **Hosting:** Firebase Hosting
- **PWA:** Installable via `vite-plugin-pwa`

## Logo & Branding

The app logo files are located in `public/`:

| File | Purpose |
|---|---|
| `grit.svg` | Primary vector logo — used as favicon and in-app logo |
| `grit.png` | Raster logo — used for PWA icons, apple-touch-icon |

These are referenced in:
- `index.html` — favicon (`<link rel="icon">`) and apple-touch-icon
- `vite.config.js` — PWA manifest icons (192×192 & 512×512)
- `src/pages/AuthScreen.jsx` — Sign-in screen branding
- `src/pages/HomeScreen.jsx` — App header

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npx firebase-tools deploy --only hosting
```

## Project Structure

```
grit/
├── public/
│   ├── grit.svg          # Vector logo
│   ├── grit.png          # Raster logo
│   ├── apple-touch-icon.png
│   └── icons/            # PWA icons
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React context (Auth)
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Screen components
│   └── utils/            # Helper functions
├── index.html
├── vite.config.js
├── firebase.json
└── package.json
```

## Deployment

The app is hosted on Firebase Hosting (project: `grit-prod`).  
The `firebase` CLI is **not** installed globally, so we use `npx` to run it:

```bash
npm run build
npx firebase-tools deploy --only hosting
```

> **Live URL:** https://grit-prod.web.app
