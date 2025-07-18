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
};

const STORAGE_KEY = "flashcards";

const DEFAULT_FLASHCARDS: Flashcard[] = [
  // Physique
  {
    id: uuidv4(),
    question: "Quelle est la formule de l'énergie cinétique ?",
    answer: "E = 1/2 m v^2",
    keywords: ["énergie", "cinétique", "physique"],
    theme: "Physique",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la valeur de la constante de gravitation universelle G ?",
    answer: "G ≈ 6,674 × 10⁻¹¹ N·m²/kg²",
    keywords: ["gravitation", "constante", "physique"],
    theme: "Physique",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la 3ème loi de Newton ?",
    answer: "Action = -Réaction (à toute action s'oppose une réaction de même intensité et de sens opposé)",
    keywords: ["newton", "loi", "physique"],
    theme: "Physique",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la formule de la force électrique (loi de Coulomb) ?",
    answer: "F = k * |q1*q2| / r^2",
    keywords: ["coulomb", "force", "électrique", "physique"],
    theme: "Physique",
    createdAt: new Date().toISOString(),
  },
  // Maths
  {
    id: uuidv4(),
    question: "Quelle est la dérivée de sin(x) ?",
    answer: "cos(x)",
    keywords: ["dérivée", "math", "trigonométrie"],
    theme: "Maths",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la solution générale de l'équation ax^2 + bx + c = 0 ?",
    answer: "x = [-b ± sqrt(b²-4ac)] / 2a",
    keywords: ["équation", "quadratique", "math"],
    theme: "Maths",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la formule de l'aire d'un cercle ?",
    answer: "A = πr²",
    keywords: ["aire", "cercle", "math"],
    theme: "Maths",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    question: "Quelle est la limite de (1 + 1/n)^n quand n tend vers l'infini ?",
    answer: "e (le nombre d'Euler, ≈ 2,718)",
    keywords: ["limite", "analyse", "math"],
    theme: "Maths",
    createdAt: new Date().toISOString(),
  },
];

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localforage.getItem<Flashcard[]>(STORAGE_KEY).then((data) => {
      if (!data || data.length === 0) {
        setFlashcards(DEFAULT_FLASHCARDS);
        localforage.setItem(STORAGE_KEY, DEFAULT_FLASHCARDS);
      } else {
        setFlashcards(data);
      }
      setLoading(false);
    });
  }, []);

  const persist = useCallback((cards: Flashcard[]) => {
    setFlashcards(cards);
    localforage.setItem(STORAGE_KEY, cards);
  }, []);

  const createFlashcard = useCallback(
    (card: Omit<Flashcard, "id" | "createdAt">) => {
      const newCard: Flashcard = {
        ...card,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      persist([newCard, ...flashcards]);
    },
    [flashcards, persist],
  );

  const updateFlashcard = useCallback(
    (id: string, updates: Partial<Omit<Flashcard, "id" | "createdAt">>) => {
      const updated = flashcards.map((card) =>
        card.id === id ? { ...card, ...updates } : card,
      );
      persist(updated);
    },
    [flashcards, persist],
  );

  const deleteFlashcard = useCallback(
    (id: string) => {
      const filtered = flashcards.filter((card) => card.id !== id);
      persist(filtered);
    },
    [flashcards, persist],
  );

  return {
    flashcards,
    loading,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setFlashcards: persist, // for bulk import/testing
  };
}
