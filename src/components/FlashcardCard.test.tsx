import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlashcardCard, ThemeColorMap } from "./FlashcardCard";
import type { Flashcard } from "../hooks/useFlashcards";

const card: Flashcard = {
  id: "1",
  question: "What is React?",
  answer: "A UI library",
  keywords: ["react", "library"],
  theme: "JS",
  createdAt: new Date().toISOString(),
};
const themeColorMap: ThemeColorMap = { JS: "yellow" };

describe("FlashcardCard", () => {
  it("renders question and theme badge", () => {
    render(
      <FlashcardCard
        flashcard={card}
        onEdit={() => {}}
        onDelete={() => {}}
        themeColorMap={themeColorMap}
      />,
    );
    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
  });
  it("flips to show answer on click", () => {
    render(
      <FlashcardCard
        flashcard={card}
        onEdit={() => {}}
        onDelete={() => {}}
        themeColorMap={themeColorMap}
      />,
    );
    fireEvent.click(screen.getByText("What is React?"));
    expect(screen.getByText("A UI library")).toBeInTheDocument();
  });
});
