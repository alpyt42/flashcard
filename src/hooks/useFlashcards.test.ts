import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useFlashcards } from "./useFlashcards";
import localforage from "localforage";

describe("useFlashcards", () => {
  beforeEach(async () => {
    await localforage.clear();
  });
  it("creates, updates, and deletes flashcards", async () => {
    const { result } = renderHook(() => useFlashcards());
    await act(async () => {
      result.current.createFlashcard({
        question: "Q",
        answer: "A",
        keywords: ["k"],
        theme: "T",
      });
    });
    expect(result.current.flashcards.length).toBe(1);
    const id = result.current.flashcards[0].id;
    await act(async () => {
      result.current.updateFlashcard(id, { question: "Q2" });
    });
    expect(result.current.flashcards[0].question).toBe("Q2");
    await act(async () => {
      result.current.deleteFlashcard(id);
    });
    expect(result.current.flashcards.length).toBe(0);
  });
});
