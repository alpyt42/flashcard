# Flashcard Revision Web-App

Une app de révision de flashcards rapide, offline-first, et extensible, avec quiz, whiteboard, et mini-jeux.

---

## 🚦 Prérequis

- **Node.js 20 ou supérieur** (Node 16/18 non supporté)
- **npm** (installé avec Node)

### Installer Node.js 20 avec nvm (recommandé)

1. **Installer nvm** (Node Version Manager) :
   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   # Redémarre ton terminal ou fais :
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```
2. **Installer et utiliser Node 20** :
   ```sh
   nvm install 20
   nvm use 20
   nvm alias default 20
   node -v # Doit afficher v20.x.x
   ```

---

## 🚀 Installation

1. **Cloner le projet**
   ```sh
   git clone <url-du-repo>
   cd flashcard-app
   ```
2. **Installer les dépendances**
   ```sh
   npm install
   ```
3. **Lancer le serveur de développement**
   ```sh
   npm run dev
   # Ouvre http://localhost:5173/
   ```

---

## ✨ Fonctionnalités principales
- **Flashcard CRUD** : Créer, éditer, supprimer des cartes (question, réponse, mots-clés, thème, date)
- **Recherche instantanée** (Fuse.js)
- **Filtre par date**
- **Couleurs par thème**
- **UI responsive (Mantine)**
- **Mode sombre** (toggle ou Ctrl/Cmd+J)
- **Offline-first** (IndexedDB/localForage)
- **Quiz/Test** : QCM chronométré, score, feedback
- **Whiteboard 3D** : Déplacement libre des cartes façon post-it
- **Mini-jeu dinosaure** : Type Chrome offline

---

## 🛠 Stack technique
- React 18 + Vite + TypeScript 5
- Mantine v8 (UI, hooks, theming)
- localForage (IndexedDB)
- Fuse.js (fuzzy search)
- Framer Motion (animations)
- react-draggable (whiteboard)
- Vitest + React Testing Library (tests)
- ESLint + Prettier

---

## 📁 Structure
```
src/
  components/
  hooks/
  pages/
  App.tsx
  main.tsx
```

---

## ⚖️ Notes techniques & trade-offs
- **Node 20+ obligatoire** : Vite, Mantine et de nombreuses dépendances modernes ne fonctionnent plus avec Node 16/18 (API crypto, ESM, etc).
- **Offline-first** : Toutes les données sont locales (pas de sync multi-device).
- **Recherche rapide** : Fuse.js pour 1000+ cartes instantanément.
- **UI minimaliste** : Focus sur la lisibilité et la rapidité.
- **Tests unitaires** : Vitest/RTL pour la fiabilité.

---

## 🏁 Commandes utiles
- `npm run dev` : Lancer le serveur de dev
- `npm run build` : Build de production
- `npm run preview` : Prévisualiser le build
- `npm test` : Lancer les tests (si configuré)

---

## 💡 Besoin d’aide ?
- Si tu as une erreur liée à Node, vérifie ta version avec `node -v`.
- Si tu veux réinitialiser les cartes, vide le stockage local (IndexedDB/localforage) dans les DevTools.
- Pour toute question, ouvre une issue ou contacte le mainteneur.
