import { useEffect, useState, useCallback } from "react";
import localforage from "localforage";
import { v4 as uuidv4 } from "uuid";

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  theme: string;
  createdAt: string;
  media?: string[]; // URLs ou base64
  meta?: Record<string, any>; // Pour IA, source, etc.
};

export type FlashcardMap = Record<string, Flashcard>;

const STORAGE_KEY = "flashcards_v2";

const DEFAULT_FLASHCARDS: FlashcardMap = {};
[
  // Physique
  {
    question: "Quelle est la formule de l'énergie cinétique ?",
    answer: "E = 1/2 m v^2",
    keywords: ["énergie", "cinétique", "physique"],
    theme: "Physique",
  },
  {
    question: "Quelle est la valeur de la constante de gravitation universelle G ?",
    answer: "G ≈ 6,674 × 10⁻¹¹ N·m²/kg²",
    keywords: ["gravitation", "constante", "physique"],
    theme: "Physique",
  },
  {
    question: "Quelle est la 3ème loi de Newton ?",
    answer: "Action = -Réaction (à toute action s'oppose une réaction de même intensité et de sens opposé)",
    keywords: ["newton", "loi", "physique"],
    theme: "Physique",
  },
  {
    question: "Quelle est la formule de la force électrique (loi de Coulomb) ?",
    answer: "F = k * |q1*q2| / r^2",
    keywords: ["coulomb", "force", "électrique", "physique"],
    theme: "Physique",
  },
  // Maths
  {
    question: "Quelle est la dérivée de sin(x) ?",
    answer: "cos(x)",
    keywords: ["dérivée", "math", "trigonométrie"],
    theme: "Maths",
  },
  {
    question: "Quelle est la solution générale de l'équation ax^2 + bx + c = 0 ?",
    answer: "x = [-b ± sqrt(b²-4ac)] / 2a",
    keywords: ["équation", "quadratique", "math"],
    theme: "Maths",
  },
  {
    question: "Quelle est la formule de l'aire d'un cercle ?",
    answer: "A = πr²",
    keywords: ["aire", "cercle", "math"],
    theme: "Maths",
  },
  {
    question: "Quelle est la limite de (1 + 1/n)^n quand n tend vers l'infini ?",
    answer: "e (le nombre d'Euler, ≈ 2,718)",
    keywords: ["limite", "analyse", "math"],
    theme: "Maths",
  },
].forEach(card => {
  const id = uuidv4();
  DEFAULT_FLASHCARDS[id] = {
    ...card,
    id,
    createdAt: new Date().toISOString(),
  };
});

function migrateArrayToMap(cards: Flashcard[] | FlashcardMap): FlashcardMap {
  if (Array.isArray(cards)) {
    const map: FlashcardMap = {};
    cards.forEach(card => {
      map[card.id] = card;
    });
    return map;
  }
  return cards;
}

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<FlashcardMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localforage.getItem<Flashcard[] | FlashcardMap>(STORAGE_KEY).then((data) => {
      let map: FlashcardMap;
      if (!data) {
        map = { ...DEFAULT_FLASHCARDS };
        localforage.setItem(STORAGE_KEY, map);
      } else {
        map = migrateArrayToMap(data);
      }
      setFlashcards(map);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((cards: FlashcardMap) => {
    setFlashcards(cards);
    localforage.setItem(STORAGE_KEY, cards);
  }, []);

  const createFlashcard = useCallback(
    (card: Omit<Flashcard, "id" | "createdAt">) => {
      const id = uuidv4();
      const newCard: Flashcard = {
        ...card,
        id,
        createdAt: new Date().toISOString(),
      };
      persist({ ...flashcards, [id]: newCard });
    },
    [flashcards, persist],
  );

  const updateFlashcard = useCallback(
    (id: string, updates: Partial<Omit<Flashcard, "id" | "createdAt">>) => {
      if (!flashcards[id]) return;
      const updated = { ...flashcards, [id]: { ...flashcards[id], ...updates } };
      persist(updated);
    },
    [flashcards, persist],
  );

  const deleteFlashcard = useCallback(
    (id: string) => {
      if (!flashcards[id]) return;
      const { [id]: _, ...rest } = flashcards;
      persist(rest);
    },
    [flashcards, persist],
  );

  // Pour import/export JSON direct
  const setFlashcardsMap = useCallback((map: FlashcardMap) => {
    persist(map);
  }, [persist]);

  return {
    flashcards,
    loading,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setFlashcards: setFlashcardsMap, // pour bulk import/export
  };
}
