# GRIT APP — AGENT TASK LIST
> Machine-readable build plan. Each task has a unique ID, status, section, description, and implementation notes.
> Status values: `todo` | `in_progress` | `done` | `blocked`

---

## METADATA
- total_tasks: 89
- sections: 11
- project: Grit — Dark-mode daily habit & task tracker PWA
- stack: React, Tailwind CSS, Firebase Auth, Firestore, Vite, vite-plugin-pwa

---

## SECTION 01 — PROJECT SETUP

### TASK PS-01
- status: todo
- title: Scaffold Vite + React project
- command: `npm create vite@latest grit -- --template react`
- notes: Use React template. This is the project root. All subsequent work lives inside this directory.

### TASK PS-02
- status: todo
- title: Install and configure Tailwind CSS
- command: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- notes: Add Tailwind directives to src/index.css. Configure content paths in tailwind.config.js to include `./src/**/*.{js,jsx}`.

### TASK PS-03
- status: todo
- title: Install Firebase SDK
- command: `npm install firebase`
- notes: Version 9+ (modular SDK). Do not use the compat layer.

### TASK PS-04
- status: todo
- title: Install vite-plugin-pwa
- command: `npm install -D vite-plugin-pwa`
- notes: This handles manifest.json generation and service worker (Workbox) automatically. Configure in vite.config.js.

### TASK PS-05
- status: todo
- title: Create Firebase project in Firebase Console
- notes: Create two projects — one for dev, one for prod. Enable Google Auth and Firestore in both. Do not share API keys between environments.

### TASK PS-06
- status: todo
- title: Store Firebase config in .env file
- notes: |
    Required env vars:
      VITE_FIREBASE_API_KEY
      VITE_FIREBASE_AUTH_DOMAIN
      VITE_FIREBASE_PROJECT_ID
      VITE_FIREBASE_STORAGE_BUCKET
      VITE_FIREBASE_MESSAGING_SENDER_ID
      VITE_FIREBASE_APP_ID
    Add .env to .gitignore. Create .env.example with placeholder values.

### TASK PS-07
- status: todo
- title: Initialize Firebase app in src/firebase.js
- notes: |
    Import initializeApp, getAuth, getFirestore.
    Export: app, auth, db.
    Read config from import.meta.env.VITE_FIREBASE_* variables.

### TASK PS-08
- status: todo
- title: Set up folder structure
- notes: |
    Create the following directories:
      src/components/   — reusable UI components
      src/pages/        — top-level screen components
      src/hooks/        — custom React hooks
      src/utils/        — pure utility functions (date helpers, streak logic)
      src/context/      — React context providers

### TASK PS-09
- status: todo
- title: Configure ESLint and Prettier
- notes: Consistent code style. Add .eslintrc and .prettierrc. Optionally add a pre-commit lint hook via husky.

---

## SECTION 02 — AUTHENTICATION

### TASK AUTH-01
- status: todo
- title: Enable Google Sign-In in Firebase Console
- notes: Firebase Console > Authentication > Sign-in methods > Google > Enable. Set support email.

### TASK AUTH-02
- status: todo
- title: Create AuthContext with React Context API
- file: src/context/AuthContext.jsx
- notes: |
    Expose via a custom useAuth() hook.
    Context shape:
      currentUser: Firebase User | null
      loading: boolean
      signIn: () => Promise<void>
      signOut: () => Promise<void>

### TASK AUTH-03
- status: todo
- title: Implement Google OAuth sign-in with signInWithPopup
- file: src/context/AuthContext.jsx
- notes: |
    import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)

### TASK AUTH-04
- status: todo
- title: Listen to onAuthStateChanged to resolve auth state
- file: src/context/AuthContext.jsx
- notes: |
    Set loading = true initially.
    In useEffect, call onAuthStateChanged(auth, (user) => { setCurrentUser(user); setLoading(false); })
    Return unsubscribe in cleanup.

### TASK AUTH-05
- status: todo
- title: Create AuthLoadingScreen component
- file: src/components/AuthLoadingScreen.jsx
- notes: Full-screen spinner shown while loading === true. Prevents flash of auth screen for returning users.

### TASK AUTH-06
- status: todo
- title: Create AuthScreen component
- file: src/pages/AuthScreen.jsx
- notes: |
    Shown only when currentUser === null.
    Contains a single "Sign in with Google" button.
    Dark mode, branded style consistent with app design.

### TASK AUTH-07
- status: todo
- title: Create ProtectedRoute wrapper component
- file: src/components/ProtectedRoute.jsx
- notes: |
    If loading → render <AuthLoadingScreen />
    If !currentUser → render <AuthScreen />
    Otherwise → render children

### TASK AUTH-08
- status: todo
- title: Write user document to Firestore on first sign-in
- notes: |
    After successful sign-in, call:
      setDoc(doc(db, 'users', user.uid), { email: user.email, createdAt: serverTimestamp() }, { merge: true })
    merge: true prevents overwriting if user signs in again.

### TASK AUTH-09
- status: todo
- title: Add Sign Out button
- notes: Call signOut(auth) from firebase/auth. Place in app header or settings area.

---

## SECTION 03 — FIRESTORE DATA LAYER

### TASK FS-01
- status: todo
- title: Enable Firestore in Firebase Console
- notes: Start in production mode. Immediately deploy security rules (see TASK FS-03) before any real usage.

### TASK FS-02
- status: todo
- title: Enable Firestore offline persistence
- file: src/firebase.js
- notes: |
    import { enableIndexedDbPersistence } from 'firebase/firestore'
    Call enableIndexedDbPersistence(db) immediately after getFirestore().
    Must be called before any other Firestore reads/writes.
    Wrap in try/catch — throws if called in multiple tabs simultaneously.

### TASK FS-03
- status: todo
- title: Deploy Firestore security rules
- file: firestore.rules
- notes: |
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /users/{userId}/{document=**} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    Deploy with: firebase deploy --only firestore:rules
    CRITICAL: Deploy before inviting any users. Without this, authenticated users can read each other's data.

### TASK FS-04
- status: todo
- title: Implement addParentTask(userId, data) helper
- file: src/utils/firestore.js
- notes: |
    Writes to: users/{userId}/parentTasks/{auto-id}
    Fields: name, activeDays (string[]), streakCount: 0, lastCheckedDate: today,
            lastActiveDayStatus: null, createdAt: serverTimestamp(), order: Date.now()

### TASK FS-05
- status: todo
- title: Implement deleteParentTask(userId, taskId) helper
- file: src/utils/firestore.js
- notes: |
    Must use a Firestore batched write (not client-side JS filter).
    Steps:
      1. Query all subtasks under users/{userId}/parentTasks/{taskId}/subtasks
      2. Add each subtask doc delete to the batch
      3. Add the parent task doc delete to the batch
      4. Commit batch
    This is atomic — either all deletes succeed or none do.

### TASK FS-06
- status: todo
- title: Implement addSubtask(userId, parentId, data) helper
- file: src/utils/firestore.js
- notes: |
    Writes to: users/{userId}/parentTasks/{parentId}/subtasks/{auto-id}
    Fields: name, completedDates: [], createdAt: serverTimestamp(), order: Date.now()

### TASK FS-07
- status: todo
- title: Implement deleteSubtask(userId, parentId, subtaskId) helper
- file: src/utils/firestore.js
- notes: Simple deleteDoc on users/{userId}/parentTasks/{parentId}/subtasks/{subtaskId}

### TASK FS-08
- status: todo
- title: Implement toggleSubtaskComplete(userId, parentId, subtaskId, date, isDone) helper
- file: src/utils/firestore.js
- notes: |
    If isDone === true:  use arrayUnion(date) on completedDates field
    If isDone === false: use arrayRemove(date) on completedDates field
    date param is a local ISO date string: "YYYY-MM-DD"

### TASK FS-09
- status: todo
- title: Implement updateStreakData(userId, taskId, updates) helper
- file: src/utils/firestore.js
- notes: |
    updates shape: { streakCount, lastCheckedDate, lastActiveDayStatus }
    Use updateDoc on users/{userId}/parentTasks/{taskId}
    Called from streak check logic after computing results.

### TASK FS-10
- status: todo
- title: Create useParentTasks(userId) custom hook
- file: src/hooks/useParentTasks.js
- notes: |
    Uses onSnapshot for real-time updates.
    Queries users/{userId}/parentTasks, ordered by createdAt ascending.
    Returns: { tasks: ParentTask[], loading: boolean }
    Unsubscribe from onSnapshot in useEffect cleanup.

### TASK FS-11
- status: todo
- title: Create useSubtasks(userId, parentId) custom hook
- file: src/hooks/useSubtasks.js
- notes: |
    Uses onSnapshot on users/{userId}/parentTasks/{parentId}/subtasks
    Ordered by createdAt ascending.
    Returns: { subtasks: Subtask[], loading: boolean }
    Only subscribes when parentId is non-null.

---

## SECTION 04 — STREAK LOGIC

### TASK SK-01
- status: todo
- title: Implement getLocalDateString() utility
- file: src/utils/dates.js
- notes: |
    Returns today's date as "YYYY-MM-DD" in the user's local timezone.
    Implementation:
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      return new Date().toLocaleDateString('en-CA', { timeZone: tz })
    en-CA locale formats as YYYY-MM-DD natively.

### TASK SK-02
- status: todo
- title: Implement isActiveToday(activeDays) utility
- file: src/utils/dates.js
- notes: |
    activeDays is string[] e.g. ["Mon", "Wed", "Fri"]
    Get today's short weekday: new Date().toLocaleDateString('en-US', { weekday: 'short' })
    Return activeDays.includes(todayShort)

### TASK SK-03
- status: todo
- title: Implement getPreviousActiveDay(activeDays, fromDate) utility
- file: src/utils/dates.js
- notes: |
    Walks backwards from fromDate (exclusive) to find the most recent active day.
    Returns date string "YYYY-MM-DD" or null if activeDays is empty.
    Cap the lookback at 60 days to avoid infinite loop.

### TASK SK-04
- status: todo
- title: Implement runStreakCheck(parentTask, subtasks) function
- file: src/utils/streak.js
- notes: |
    Algorithm:
      today = getLocalDateString()
      if parentTask.lastCheckedDate == today → return null (skip, already checked)

      dateToCheck = parentTask.lastCheckedDate  // the previous active day to evaluate
      totalSubtasks = subtasks.length
      if totalSubtasks === 0 → return { streakCount: 0, lastActiveDayStatus: 'incomplete', lastCheckedDate: today }

      completedCount = subtasks.filter(s => s.completedDates.includes(dateToCheck)).length
      incompleteRatio = (totalSubtasks - completedCount) / totalSubtasks

      if incompleteRatio > 0.5:
        if parentTask.lastActiveDayStatus === 'incomplete':
          streakCount = 0  // BREAK: 2 consecutive bad days
        else:
          streakCount = parentTask.streakCount  // no change yet
        lastActiveDayStatus = 'incomplete'
        streakBroken = (incompleteRatio > 0.5 && parentTask.lastActiveDayStatus === 'incomplete')
      else if completedCount === totalSubtasks:
        streakCount = parentTask.streakCount + 1
        lastActiveDayStatus = 'complete'
        streakBroken = false
      else:
        streakCount = parentTask.streakCount  // partial, no change
        lastActiveDayStatus = 'partial'
        streakBroken = false

      return { streakCount, lastActiveDayStatus, lastCheckedDate: today, streakBroken }

### TASK SK-05
- status: todo
- title: Create useStreakCheck(userId, parentTasks, subtasksMap) hook
- file: src/hooks/useStreakCheck.js
- notes: |
    Runs once on app open (when parentTasks first loads).
    subtasksMap is Record<parentTaskId, Subtask[]>
    For each parentTask: call runStreakCheck(task, subtasksMap[task.id])
    If result is non-null: call updateStreakData() to write back to Firestore
    Collect streakBroken tasks and emit them for toast notifications.
    Use a ref to ensure the check only runs once per app session.

### TASK SK-06
- status: todo
- title: Handle edge case — 0 subtasks
- file: src/utils/streak.js
- notes: If subtasks.length === 0, treat as always incomplete. Streak never increments. Guard clause at top of runStreakCheck.

### TASK SK-07
- status: todo
- title: Handle edge case — task added today
- file: src/utils/firestore.js
- notes: When calling addParentTask, initialize lastCheckedDate = getLocalDateString(). This prevents a retroactive streak check running the next day for a task that had no "yesterday".

### TASK SK-08
- status: todo
- title: Emit streak broken notification event
- file: src/hooks/useStreakCheck.js
- notes: |
    When streakBroken === true, add the task name to a brokenTasks state array.
    Pass this up to the HomeScreen to trigger toast notifications.
    Each broken task should fire one toast. Clear after display.

---

## SECTION 05 — HOME SCREEN

### TASK HS-01
- status: todo
- title: Create HomeScreen page component
- file: src/pages/HomeScreen.jsx
- notes: |
    Fetches parent tasks via useParentTasks(userId).
    Triggers streak check via useStreakCheck() on mount.
    Manages selectedParentTask state — when set, renders SubtaskView instead.
    Renders ParentTaskCard list split into active-today and inactive-today groups.

### TASK HS-02
- status: todo
- title: Create ParentTaskCard component
- file: src/components/ParentTaskCard.jsx
- notes: |
    Props: task, onClick, onDelete
    Displays: task name, streak count badge, active day chips
    Tapping the card calls onClick(task) to drill into SubtaskView.
    Bold, dark-mode card style with accent color streak badge.

### TASK HS-03
- status: todo
- title: Show streak count prominently on each card
- notes: Large number with a flame icon or ⚡ symbol. Use electric green accent color. This is a primary visual element of the card.

### TASK HS-04
- status: todo
- title: Show active days as chips on each card
- notes: |
    Render Mon Tue Wed Thu Fri Sat Sun chips.
    Highlight the chip for today's day if it's in activeDays.
    Dim inactive day chips.

### TASK HS-05
- status: todo
- title: Split tasks into active-today and inactive-today groups
- file: src/pages/HomeScreen.jsx
- notes: |
    activeTasks = tasks.filter(t => isActiveToday(t.activeDays))
    inactiveTasks = tasks.filter(t => !isActiveToday(t.activeDays))
    Render activeTasks first, then inactiveTasks with reduced opacity and a subtle "not today" label.

### TASK HS-06
- status: todo
- title: Show skeleton cards while data is loading
- file: src/components/SkeletonCard.jsx
- notes: Animated shimmer effect using CSS keyframes. Render 3 skeleton cards while useParentTasks loading === true.

### TASK HS-07
- status: todo
- title: Show empty state when no parent tasks exist
- notes: |
    Condition: loading === false && tasks.length === 0
    Render an illustrated prompt: "Add your first goal"
    Include a CTA button that opens the AddParentTaskModal.

### TASK HS-08
- status: todo
- title: Add FAB to open AddParentTaskModal
- notes: Fixed position, bottom-right corner. Bold accent color (electric green). Opens AddParentTaskModal on press. Use a "+" icon.

### TASK HS-09
- status: todo
- title: Show offline banner when device has no connection
- file: src/components/OfflineBanner.jsx
- notes: |
    Add event listeners for 'online' and 'offline' on window.
    Show a subtle banner (top or bottom of screen) when navigator.onLine === false.
    Auto-hide when connection returns.
    Do not block UI interaction.

---

## SECTION 06 — SUBTASK VIEW

### TASK SV-01
- status: todo
- title: Create SubtaskView component
- file: src/components/SubtaskView.jsx
- notes: |
    Props: userId, parentTask, onBack
    Fetches subtasks via useSubtasks(userId, parentTask.id).
    Replaces HomeScreen content while open (parent task list is hidden).

### TASK SV-02
- status: todo
- title: Add back button to return to HomeScreen
- notes: Top-left back arrow (←). Calls onBack() prop. Clears selectedParentTask in HomeScreen state.

### TASK SV-03
- status: todo
- title: Display parent task name as the view header
- notes: Bold heading at top of SubtaskView. Show streak count alongside the name.

### TASK SV-04
- status: todo
- title: Create SubtaskRow component
- file: src/components/SubtaskRow.jsx
- notes: |
    Props: subtask, onToggle, onDelete, today (local date string)
    Shows: subtask name, checkbox/toggle on the left
    isDone = subtask.completedDates.includes(today)
    Completed rows: green background tint, checkmark, different text style.

### TASK SV-05
- status: todo
- title: Implement subtask completion toggle
- notes: |
    On tap: call toggleSubtaskComplete(userId, parentTask.id, subtask.id, today, !isDone)
    today = getLocalDateString()
    UI updates immediately via onSnapshot real-time listener.

### TASK SV-06
- status: todo
- title: Style completed subtasks in green
- notes: |
    Completed state: green left border or background tint, checkmark icon.
    Use transition for smooth color change.
    Text: bold accent color or strikethrough depending on design preference.

### TASK SV-07
- status: todo
- title: Add button to open AddSubtaskModal
- notes: Render below the subtask list or as a FAB within SubtaskView. Opens AddSubtaskModal.

### TASK SV-08
- status: todo
- title: Add delete option per subtask
- notes: |
    Show a trash icon on each SubtaskRow (visible on hover/always on mobile).
    On press: show a brief confirmation or delete immediately.
    Call deleteSubtask(userId, parentTask.id, subtask.id).

---

## SECTION 07 — MODALS

### TASK MO-01
- status: todo
- title: Create AddParentTaskModal component
- file: src/components/AddParentTaskModal.jsx
- notes: |
    Fields:
      - Text input: task name (required)
      - Day selector: Mon Tue Wed Thu Fri Sat Sun toggle buttons (multi-select, at least 1 required)
    Submit calls addParentTask() then closes modal.

### TASK MO-02
- status: todo
- title: Validate AddParentTaskModal inputs
- notes: |
    Validation rules:
      - Name: required, non-empty after trim
      - activeDays: at least 1 day must be selected
    Show inline error messages below each field. Disable submit button if invalid.

### TASK MO-03
- status: todo
- title: Handle AddParentTaskModal submit
- notes: |
    On submit:
      1. Show loading state on button
      2. Call addParentTask(userId, { name, activeDays })
      3. On success: close modal, reset form state
      4. On error: show error message, re-enable button

### TASK MO-04
- status: todo
- title: Create AddSubtaskModal component
- file: src/components/AddSubtaskModal.jsx
- notes: |
    Simple modal with a single text input for subtask name.
    Tied to the current parentTask context.
    Submit calls addSubtask(userId, parentTask.id, { name }) then closes.

### TASK MO-05
- status: todo
- title: Validate AddSubtaskModal input
- notes: Name is required. Trim whitespace. Show inline error if empty. Prevent submission.

### TASK MO-06
- status: todo
- title: Handle AddSubtaskModal submit
- notes: Call addSubtask(), close modal on success. Real-time listener will update the list automatically.

### TASK MO-07
- status: todo
- title: Add delete parent task option with confirmation
- notes: |
    Trigger: long-press on card OR kebab menu (⋮) icon on ParentTaskCard.
    Show a confirmation dialog: "Delete [task name] and all its subtasks?"
    On confirm: call deleteParentTask(userId, taskId) — batched Firestore delete.

### TASK MO-08
- status: todo
- title: Animate modals in and out
- notes: |
    Slide up from bottom on open, slide down on close.
    Use CSS transitions with transform: translateY.
    Add a semi-transparent backdrop behind the modal.
    Close on backdrop tap.

---

## SECTION 08 — PWA & SERVICE WORKER

### TASK PWA-01
- status: todo
- title: Configure vite-plugin-pwa in vite.config.js
- notes: |
    import { VitePWA } from 'vite-plugin-pwa'
    Add to plugins array:
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
        manifest: { ... }  // see PWA-02
      })

### TASK PWA-02
- status: todo
- title: Define manifest fields in vite-plugin-pwa config
- notes: |
    manifest object:
      name: 'Grit'
      short_name: 'Grit'
      description: 'Daily habit and task tracker'
      theme_color: '#0a0a0a'
      background_color: '#0a0a0a'
      display: 'standalone'
      start_url: '/'
      orientation: 'portrait'
      icons: [see PWA-03 through PWA-05]

### TASK PWA-03
- status: todo
- title: Generate and add 512×512 maskable app icon
- file: public/icons/icon-512.png
- notes: |
    Must be 512×512 pixels.
    Maskable: keep important content within the central 80% (safe zone).
    Declare in manifest: { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }

### TASK PWA-04
- status: todo
- title: Generate and add 192×192 app icon
- file: public/icons/icon-192.png
- notes: |
    Standard PWA icon for Android.
    Declare in manifest: { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }

### TASK PWA-05
- status: todo
- title: Generate and add 180×180 apple-touch-icon
- file: public/apple-touch-icon.png
- notes: |
    Required for iOS "Add to Home Screen".
    Add to index.html: <link rel="apple-touch-icon" href="/apple-touch-icon.png">

### TASK PWA-06
- status: todo
- title: Add iOS PWA meta tags to index.html
- file: index.html
- notes: |
    Add inside <head>:
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <meta name="apple-mobile-web-app-title" content="Grit">

### TASK PWA-07
- status: todo
- title: Add apple-touch-startup-image meta tags
- file: index.html
- notes: |
    Multiple sizes for iPhone/iPad splash screens.
    At minimum target: iPhone 14 Pro (1179×2556), iPhone SE (750×1334).
    Format: <link rel="apple-touch-startup-image" media="..." href="...">

### TASK PWA-08
- status: todo
- title: Test "Add to Home Screen" on iPhone Safari
- notes: |
    Verification checklist:
      - App launches in standalone mode (no browser chrome)
      - Correct icon displayed on home screen
      - Splash screen appears on launch
      - Status bar color matches theme_color

### TASK PWA-09
- status: todo
- title: Verify service worker caches app shell
- notes: |
    vite-plugin-pwa uses Workbox to precache built assets automatically.
    After build, check DevTools > Application > Cache Storage.
    Verify JS, CSS, HTML are cached.

### TASK PWA-10
- status: todo
- title: Test full offline mode end-to-end
- notes: |
    Steps:
      1. Load app and sign in while online
      2. Toggle airplane mode (or DevTools offline)
      3. Reload app — should load from service worker cache
      4. Add a task offline — should write to Firestore local cache
      5. Re-enable connection — verify offline write syncs to Firestore

---

## SECTION 09 — DESIGN & ANIMATIONS

### TASK DS-01
- status: todo
- title: Define global CSS custom properties (color palette)
- file: src/index.css
- notes: |
    Suggested variables:
      --bg-primary: #0a0a0a
      --bg-card: #111111
      --bg-elevated: #1a1a1a
      --border: #1e1e1e
      --text-primary: #e8e8e8
      --text-secondary: #888888
      --text-muted: #444444
      --accent-green: #00ff88
      --accent-blue: #00c8ff
      --accent-gold: #ffd700
      --accent-red: #ff3f6c

### TASK DS-02
- status: todo
- title: Choose and import distinctive fonts
- notes: |
    Avoid Inter, Roboto, Arial.
    Suggested pairing: Syne (display, 800 weight for headings) + Space Mono (monospace for numbers/data)
    Import from Google Fonts in index.html or via @import in CSS.

### TASK DS-03
- status: todo
- title: Style ParentTaskCard
- file: src/components/ParentTaskCard.jsx
- notes: |
    Card: dark background, 1px border (#1e1e1e), 12px border-radius.
    Streak badge: electric green (#00ff88), bold number, large size.
    Active tasks: full opacity. Inactive tasks: 40% opacity.
    Hover state: slight background lightening.

### TASK DS-04
- status: todo
- title: Add micro-animation on subtask completion toggle
- file: src/components/SubtaskRow.jsx
- notes: |
    On completion: green flash background transition (200ms), checkmark pop-in scale animation.
    CSS transitions on background-color and transform.
    Avoid heavy JS animation libs for this — CSS-only preferred.

### TASK DS-05
- status: todo
- title: Create StreakBrokenToast component
- file: src/components/StreakBrokenToast.jsx
- notes: |
    Triggered when useStreakCheck detects a broken streak.
    Shows: task name + "streak broken 💀" message.
    Animation: slides in from bottom, stays 3s, slides out.
    Dark background, red accent border.
    One toast per broken task. Queue if multiple break simultaneously.

### TASK DS-06
- status: todo
- title: Animate home screen cards on initial load
- file: src/pages/HomeScreen.jsx
- notes: |
    Staggered fade-in + translateY animation on card mount.
    50ms delay between each card (index * 50ms).
    CSS: opacity 0 → 1, translateY(12px) → translateY(0), duration 300ms.

### TASK DS-07
- status: todo
- title: Style inactive (not today) task cards
- notes: |
    opacity: 0.4
    Render after all active tasks with a subtle section label ("Not today").
    Visually de-emphasized but still interactive.

### TASK DS-08
- status: todo
- title: Build loading skeleton shimmer animation
- file: src/components/SkeletonCard.jsx
- notes: |
    CSS keyframe animation: background-position shifts a gradient left-to-right.
    background: linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)
    background-size: 200% 100%
    animation: shimmer 1.5s infinite

### TASK DS-09
- status: todo
- title: Style day-of-week chips on ParentTaskCard
- notes: |
    Pill shape (border-radius: 99px), small size (font-size: 10px).
    Active day in task's activeDays: lit up in --accent-green.
    Today's day if active: bold border highlight.
    All other days: dim (#333).

### TASK DS-10
- status: todo
- title: Ensure mobile-first responsive layout
- notes: |
    Max-width: 480px container, centered.
    Padding: 16px horizontal.
    All tap targets minimum 44×44px (WCAG guideline).
    No horizontal overflow. Test on 375px and 390px viewport widths.

### TASK DS-11
- status: todo
- title: Final design pass
- notes: |
    Review all views for visual consistency.
    Check: font size hierarchy, icon alignment, spacing rhythm, color usage.
    Test on real device (not just DevTools).
    Verify animations are smooth (60fps) and not jarring.

---

## SECTION 10 — TESTING & QA

### TASK TQ-01
- status: todo
- title: Test Google Sign-In on mobile (iOS Safari + Android Chrome)
- notes: Verify popup works on both. Verify user doc is created in Firestore. Verify auth state persists on reload.

### TASK TQ-02
- status: todo
- title: Test add and delete parent task
- notes: |
    Add task: appears in list, correct fields in Firestore.
    Delete task: task removed from list, all subtasks removed from Firestore (verify in console).
    Batched delete should be atomic.

### TASK TQ-03
- status: todo
- title: Test add, delete, and toggle subtask
- notes: |
    Toggle done: completedDates gains today's date in Firestore.
    Toggle undone: completedDates loses today's date.
    Delete: subtask removed from Firestore.

### TASK TQ-04
- status: todo
- title: Test streak check on day rollover
- notes: |
    Method: manually set lastCheckedDate to yesterday in Firestore console.
    Reopen app.
    Verify streak increments (if all done) or stays/resets based on completion state.

### TASK TQ-05
- status: todo
- title: Test streak break condition (>50% incomplete, 2 consecutive active days)
- notes: |
    Setup: task with 3 subtasks, all active days.
    Day 1: complete 1 subtask, leave 2 incomplete (>50% incomplete). Set lastCheckedDate to yesterday.
    Day 2: reopen app. Repeat incompletion.
    Expected: after 2nd check, streakCount resets to 0 and toast fires.

### TASK TQ-06
- status: todo
- title: Test edge case — 0 subtasks
- notes: Add a parent task with no subtasks. Open app multiple days. Verify streakCount stays at 0 and never increments.

### TASK TQ-07
- status: todo
- title: Test edge case — task added today
- notes: Add a new task today. Open app tomorrow. Verify streak check does not error. lastCheckedDate should be today, so yesterday has no subtask data to check — verify this is handled gracefully.

### TASK TQ-08
- status: todo
- title: Test offline mode — add task offline, sync on reconnect
- notes: |
    Steps: Go offline (DevTools). Add a parent task. Verify it appears in UI (from local cache).
    Go back online. Verify task syncs to Firestore.

### TASK TQ-09
- status: todo
- title: Test Firestore security rules
- notes: |
    Method 1: Firebase Emulator rules unit tests.
    Method 2: Manually attempt to read another user's path via Firebase REST API.
    Expected: request denied for mismatched userId.

### TASK TQ-10
- status: todo
- title: Test PWA install on iPhone
- notes: |
    Steps: Open in Safari > Share > Add to Home Screen.
    Verify: standalone launch, correct icon, splash screen, no browser chrome.
    Test deep link: tapping notification or icon opens to correct state.

### TASK TQ-11
- status: todo
- title: Test streak broken toast fires correctly
- notes: Toast should fire once per streak break event, not on every app open. Verify it does not re-fire when the app is reopened the same day.

---

## SECTION 11 — DEPLOYMENT

### TASK DP-01
- status: todo
- title: Create separate production Firebase project
- notes: Do not reuse the dev project. Separate Firestore data, Auth config, and API keys. Prevents dev test data mixing with production user data.

### TASK DP-02
- status: todo
- title: Deploy Firestore security rules to production
- command: `firebase deploy --only firestore:rules --project <prod-project-id>`
- notes: CRITICAL — must be done BEFORE any users access the production app.

### TASK DP-03
- status: todo
- title: Configure Google OAuth redirect URIs for production domain
- notes: Firebase Console > Authentication > Settings > Authorized domains. Add the production URL (e.g. gritapp.io or your-app.vercel.app).

### TASK DP-04
- status: todo
- title: Set production environment variables
- file: .env.production
- notes: VITE_FIREBASE_* variables pointing to the production Firebase project. Never commit this file.

### TASK DP-05
- status: todo
- title: Run production build and verify
- command: `npm run build`
- notes: Check for TypeScript/ESLint errors. Inspect dist/ bundle size. Verify vite-plugin-pwa generated manifest and service worker in dist/.

### TASK DP-06
- status: todo
- title: Deploy to Firebase Hosting or Vercel
- notes: |
    Firebase Hosting: firebase deploy --only hosting
    Vercel: vercel --prod
    Verify deployment URL is live and app loads correctly.

### TASK DP-07
- status: todo
- title: Set up custom domain (optional)
- notes: Point DNS A/CNAME records to Firebase Hosting or Vercel. Add custom domain to Firebase Auth authorized domains list.

### TASK DP-08
- status: todo
- title: Verify Firestore offline persistence in production build
- notes: Check that enableIndexedDbPersistence() is present in the compiled bundle. Test offline mode on the production URL.

### TASK DP-09
- status: todo
- title: Smoke test production URL on real mobile device
- notes: |
    Test sequence:
      1. Sign in with Google
      2. Add a parent task with active days
      3. Add 2-3 subtasks
      4. Complete a subtask
      5. Install to home screen
      6. Reopen from home screen — verify standalone mode
      7. Toggle airplane mode — verify offline indicator and cached data

---

## TASK INDEX (Quick Reference)

| ID | Title | Section |
|---|---|---|
| PS-01 | Scaffold Vite + React project | Project Setup |
| PS-02 | Install Tailwind CSS | Project Setup |
| PS-03 | Install Firebase SDK | Project Setup |
| PS-04 | Install vite-plugin-pwa | Project Setup |
| PS-05 | Create Firebase project | Project Setup |
| PS-06 | Store Firebase config in .env | Project Setup |
| PS-07 | Initialize Firebase in src/firebase.js | Project Setup |
| PS-08 | Set up folder structure | Project Setup |
| PS-09 | Configure ESLint + Prettier | Project Setup |
| AUTH-01 | Enable Google Sign-In in Firebase Console | Authentication |
| AUTH-02 | Create AuthContext | Authentication |
| AUTH-03 | Implement Google OAuth sign-in | Authentication |
| AUTH-04 | Listen to onAuthStateChanged | Authentication |
| AUTH-05 | Create AuthLoadingScreen | Authentication |
| AUTH-06 | Create AuthScreen | Authentication |
| AUTH-07 | Create ProtectedRoute | Authentication |
| AUTH-08 | Write user doc to Firestore on first sign-in | Authentication |
| AUTH-09 | Add Sign Out button | Authentication |
| FS-01 | Enable Firestore | Firestore Data Layer |
| FS-02 | Enable offline persistence | Firestore Data Layer |
| FS-03 | Deploy security rules | Firestore Data Layer |
| FS-04 | addParentTask() helper | Firestore Data Layer |
| FS-05 | deleteParentTask() helper (batched) | Firestore Data Layer |
| FS-06 | addSubtask() helper | Firestore Data Layer |
| FS-07 | deleteSubtask() helper | Firestore Data Layer |
| FS-08 | toggleSubtaskComplete() helper | Firestore Data Layer |
| FS-09 | updateStreakData() helper | Firestore Data Layer |
| FS-10 | useParentTasks() hook | Firestore Data Layer |
| FS-11 | useSubtasks() hook | Firestore Data Layer |
| SK-01 | getLocalDateString() utility | Streak Logic |
| SK-02 | isActiveToday() utility | Streak Logic |
| SK-03 | getPreviousActiveDay() utility | Streak Logic |
| SK-04 | runStreakCheck() function | Streak Logic |
| SK-05 | useStreakCheck() hook | Streak Logic |
| SK-06 | Edge case: 0 subtasks | Streak Logic |
| SK-07 | Edge case: task added today | Streak Logic |
| SK-08 | Emit streak broken event | Streak Logic |
| HS-01 | HomeScreen page component | Home Screen |
| HS-02 | ParentTaskCard component | Home Screen |
| HS-03 | Streak count display | Home Screen |
| HS-04 | Active days chips | Home Screen |
| HS-05 | Active/inactive task split | Home Screen |
| HS-06 | Skeleton loading cards | Home Screen |
| HS-07 | Empty state | Home Screen |
| HS-08 | FAB to open AddParentTaskModal | Home Screen |
| HS-09 | Offline banner | Home Screen |
| SV-01 | SubtaskView component | Subtask View |
| SV-02 | Back button | Subtask View |
| SV-03 | Parent task name header | Subtask View |
| SV-04 | SubtaskRow component | Subtask View |
| SV-05 | Subtask completion toggle | Subtask View |
| SV-06 | Green style for completed subtasks | Subtask View |
| SV-07 | Add subtask button | Subtask View |
| SV-08 | Delete subtask option | Subtask View |
| MO-01 | AddParentTaskModal component | Modals |
| MO-02 | Validate AddParentTaskModal | Modals |
| MO-03 | AddParentTaskModal submit handler | Modals |
| MO-04 | AddSubtaskModal component | Modals |
| MO-05 | Validate AddSubtaskModal | Modals |
| MO-06 | AddSubtaskModal submit handler | Modals |
| MO-07 | Delete parent task with confirmation | Modals |
| MO-08 | Modal enter/exit animations | Modals |
| PWA-01 | Configure vite-plugin-pwa | PWA |
| PWA-02 | Define manifest fields | PWA |
| PWA-03 | 512×512 maskable icon | PWA |
| PWA-04 | 192×192 icon | PWA |
| PWA-05 | 180×180 apple-touch-icon | PWA |
| PWA-06 | iOS PWA meta tags | PWA |
| PWA-07 | Apple startup image meta tags | PWA |
| PWA-08 | Test Add to Home Screen on iPhone | PWA |
| PWA-09 | Verify service worker caching | PWA |
| PWA-10 | Test full offline mode | PWA |
| DS-01 | Define CSS custom properties | Design |
| DS-02 | Choose and import fonts | Design |
| DS-03 | Style ParentTaskCard | Design |
| DS-04 | Subtask completion micro-animation | Design |
| DS-05 | StreakBrokenToast component | Design |
| DS-06 | Home screen card load animation | Design |
| DS-07 | Style inactive task cards | Design |
| DS-08 | Skeleton shimmer animation | Design |
| DS-09 | Day-of-week chips style | Design |
| DS-10 | Mobile-first responsive layout | Design |
| DS-11 | Final design pass | Design |
| TQ-01 | Test Google Sign-In on mobile | Testing |
| TQ-02 | Test add/delete parent task | Testing |
| TQ-03 | Test add/delete/toggle subtask | Testing |
| TQ-04 | Test streak check on day rollover | Testing |
| TQ-05 | Test streak break condition | Testing |
| TQ-06 | Test edge case: 0 subtasks | Testing |
| TQ-07 | Test edge case: task added today | Testing |
| TQ-08 | Test offline sync | Testing |
| TQ-09 | Test Firestore security rules | Testing |
| TQ-10 | Test PWA install on iPhone | Testing |
| TQ-11 | Test streak broken toast | Testing |
| DP-01 | Create production Firebase project | Deployment |
| DP-02 | Deploy Firestore rules to production | Deployment |
| DP-03 | Configure OAuth redirect URIs | Deployment |
| DP-04 | Set production environment variables | Deployment |
| DP-05 | Run production build | Deployment |
| DP-06 | Deploy to hosting | Deployment |
| DP-07 | Set up custom domain | Deployment |
| DP-08 | Verify offline persistence in production | Deployment |
| DP-09 | Smoke test production on mobile | Deployment |
