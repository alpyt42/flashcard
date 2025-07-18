# Flashcard Revision Web-App

A fast, offline-first flashcard app for efficient spaced repetition and study. Built with React, Mantine, and localForage for instant, persistent, and distraction-free revision.

## 🚀 Quick Start

```sh
npm install
npm run dev
```

## ✨ Features

- **Flashcard CRUD**: Create, edit, delete cards (question, answer, keywords, theme, date)
- **Fuzzy Search**: Instant search across question, answer, and keywords (Fuse.js)
- **Date Range Filter**: Filter cards by creation date (Mantine DatePicker)
- **Theme Color Coding**: Each theme gets a consistent Mantine color
- **Responsive UI**: Masonry grid on desktop, swipe/stack on mobile
- **Dark Mode**: Toggle with UI or <kbd>Ctrl/Cmd+J</kbd>
- **Offline-First**: All data stored in IndexedDB (localForage)
- **Study Mode**: Sequential/shuffle card viewer with flip
- **Smooth Transitions**: Mantine and Framer Motion

## 🛠 Tech Stack

- **React 18 + Vite + TypeScript 5**
- **Mantine v8** (UI, hooks, theming)
- **localForage** (IndexedDB persistence)
- **Fuse.js** (fuzzy search)
- **Framer Motion** (animations)
- **Vitest + React Testing Library** (tests)
- **ESLint + Prettier** (lint/format)

## 📁 Directory Structure

```
src/
  components/
    FlashcardCard.tsx
    FlashcardForm.tsx
    SearchBar.tsx
    DateRangeFilter.tsx
  hooks/
    useFlashcards.ts
  pages/
    Home.tsx
    Study.tsx
  App.tsx
  main.tsx
```

## ⚖️ Technical Trade-offs

This app prioritizes speed, clarity, and offline usability. All state is stored locally for instant persistence and privacy, but this means no sync or multi-device support. Mantine v8's new color scheme API is used for robust dark mode, but some breaking changes required careful reading of docs. Fuse.js enables fast, fuzzy search even for 1,000+ cards, but for very large datasets, a server or worker-based search would be better. The UI is intentionally minimal to reduce distractions and maximize legibility. All code is fully typed, and basic tests are included for reliability. The stack is chosen for rapid iteration and modern best practices.
# flashcard
