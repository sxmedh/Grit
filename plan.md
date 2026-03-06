# Grit — Daily Todo App: Project Plan

## Overview
**Grit** is a flamboyant, dark-mode daily habit & task tracker PWA (Progressive Web App). Users group tasks under parent goals, track streaks, and stay accountable — all from their phone's home screen.

---

## Core Concepts

### Task Structure
- **Parent Tasks** — Top-level goals (e.g. "Morning Routine", "Fitness")
  - Each parent task has a name and a set of **active days** (e.g. Mon/Wed/Fri)
  - Parent tasks are the main view on the home screen
- **Subtasks** — Individual to-dos nested under a parent task
  - Tapping a parent task drills into its subtasks (parent is hidden during this view)
  - A back button returns the user to the parent task list

---

## Features

### Task Management
- [ ] Add / delete parent tasks
- [ ] Add / delete subtasks within a parent task
- [ ] Mark subtasks as **done** (shown in green) or **not done**
- [ ] Simple, minimal UI — no clutter
- [ ] Deleting a parent task cascades and deletes all its subtasks (handled in a Firestore batched write, not client-side)
- [ ] Tasks are ordered by creation time (no manual reordering in v1)

### Day Selection per Parent Task
- Each parent task can have specific days of the week assigned to it
- Streak tracking and completion checks only apply on those selected days
- Parent tasks **not active today** are shown grayed out at the bottom of the home screen (still visible, not hidden)

### Streak Tracking
- Each parent task has its own **streak counter**
- Streak increments each day all subtasks are completed (on active days)
- **Streak is broken** if **more than 50% of subtasks** are left incomplete on **2 consecutive active days**
  - ⚠️ This replaces the previous "2 or more" absolute threshold — a fixed count is broken when a task has only 1 subtask (unbreakable) or 10+ subtasks (too lenient)
- Streak count is displayed prominently on each parent task card

### Progress Display
- Incomplete tasks: default dark style
- Completed tasks: highlighted in **green**
- Streak count shown on each parent task card

---

## Authentication
- **Google OAuth** (Sign in with Google) via Firebase Auth
- User data is tied to their Google account
- No anonymous usage — auth required on first open
- Show a loading/spinner screen while Firebase resolves the auth state on startup (avoids flash of auth screen for returning users)

---

## Data Model (Firestore)

```
users/{userId}
  - email: string
  - createdAt: timestamp

users/{userId}/parentTasks/{taskId}
  - name: string
  - activeDays: string[]         // e.g. ["Mon", "Wed", "Fri"]
  - streakCount: number
  - lastCheckedDate: string      // ISO date "YYYY-MM-DD", user's local timezone
  - lastActiveDayStatus: "complete" | "incomplete" | null  // for streak break logic
  - createdAt: timestamp
  - order: number                // for display ordering

users/{userId}/parentTasks/{taskId}/subtasks/{subtaskId}
  - name: string
  - completedDates: string[]     // ISO dates when this subtask was marked done
  - createdAt: timestamp
  - order: number
```

> **Why `completedDates` instead of a boolean?** A simple `done: boolean` doesn't survive the day rollover. Storing the dates lets you check completion for any past day without a separate history collection.

---

## Streak Logic (Detail)

### Timezone Handling
- All date calculations use the **user's local timezone** (determined client-side via `Intl.DateTimeFormat().resolvedOptions().timeZone`)
- The current local date is passed with every streak check — no server-side cron needed in v1
- The `lastCheckedDate` field guards against double-counting if the app is opened multiple times in one day

### Check Trigger
- Streak check runs **on app open**, lazily — not via a scheduled Cloud Function
- If `lastCheckedDate` equals today → skip (already checked today)
- If `lastCheckedDate` is a past active day → run the check for that missed day, then update

### Streak Algorithm
```
On app open, for each parent task:
  today = local date string (YYYY-MM-DD)
  if lastCheckedDate == today → skip

  dateToCheck = lastCheckedDate (the previous active day)
  totalSubtasks = subtasks.length
  completedCount = subtasks where completedDates includes dateToCheck
  incompleteRatio = (totalSubtasks - completedCount) / totalSubtasks

  if incompleteRatio > 0.5:                          // >50% incomplete
    if lastActiveDayStatus == "incomplete":           // 2nd consecutive bad day
      streakCount = 0                                 // BREAK streak
    lastActiveDayStatus = "incomplete"
  else if completedCount == totalSubtasks:            // ALL done
    streakCount += 1
    lastActiveDayStatus = "complete"
  else:                                               // some done, not breaking
    lastActiveDayStatus = "partial"

  lastCheckedDate = today
  write back to Firestore (batched)
```

### Edge Cases
- Parent task with **0 subtasks**: streak never increments (treat as always incomplete)
- Parent task added **today for the first time**: `lastCheckedDate = today`, no retroactive check

---

## Offline & Sync Strategy
- Enable **Firestore offline persistence** (`enableIndexedDbPersistence()`) so the app works without a connection
- All reads/writes go through Firestore's local cache first; sync happens automatically when connectivity returns
- Show a subtle "Offline" indicator in the UI when `navigator.onLine` is false

---

## Security (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

> ⚠️ Without these rules, any authenticated user can read/write any other user's data. Deploy rules before any real usage.

---

## UI States to Handle
- **Auth loading** — spinner while Firebase resolves auth state
- **Data loading** — skeleton cards while Firestore fetches parent tasks
- **Empty state** — illustrated prompt ("Add your first goal") when no parent tasks exist
- **Offline banner** — subtle indicator when device has no connection
- **Streak broken toast** — animated notification when a streak resets

---

## Design

### Style
- **Dark mode** — deep blacks, rich dark grays
- **Flamboyant** — bold typography, vivid accent colors (electric green, neon or gold highlights), expressive micro-animations
- Clear visual hierarchy: parent tasks → subtask drill-down
- Mobile-first layout

### PWA (Progressive Web App)
- Fully mobile-friendly and responsive
- "Add to Home Screen" support for iPhone (iOS Safari)
  - Includes `manifest.json` with app name, icons, and `display: standalone`
  - Required icon sizes for iOS: **180×180** (apple-touch-icon), **192×192**, **512×512** (maskable)
  - `<meta name="apple-mobile-web-app-capable" content="yes">` required for iOS standalone mode
  - Splash screen configured via `apple-touch-startup-image` meta tags
- Service worker caches app shell for instant load and offline support

---

## Tech Stack
| Layer | Choice |
|---|---|
| Frontend | React + Tailwind CSS |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Firebase Firestore (with offline persistence enabled) |
| Hosting | Firebase Hosting or Vercel |
| PWA | Vite PWA plugin (`vite-plugin-pwa`) — handles manifest + service worker automatically |

---

## Screens / Views

1. **Auth Screen** — "Sign in with Google" shown only when unauthenticated (with auth loading state)
2. **Home Screen** — List of parent tasks with streak counters and day tags; inactive-today tasks grayed at bottom
3. **Subtask View** — Drill into a parent task; shows subtasks with done/not done toggle; back button to return
4. **Add Parent Task Modal** — Name input + day selector (Mon–Sun toggles)
5. **Add Subtask Modal** — Simple name input within subtask view

---

## Publishing Checklist
- [ ] Deploy Firestore security rules **before** inviting any users
- [ ] Deploy to production URL (custom domain optional)
- [ ] Configure Firebase for production (separate prod project from dev)
- [ ] Add `manifest.json` + service worker via `vite-plugin-pwa`
- [ ] Add correct iOS icon sizes (180×180 apple-touch-icon, 192×192, 512×512 maskable)
- [ ] Test "Add to Home Screen" on iPhone (Safari) — test streak check on day rollover
- [ ] Set up Google OAuth redirect URIs for production domain in Firebase Console
- [ ] Enable Firestore offline persistence in production build
- [ ] Final design pass — animations, colors, typography
