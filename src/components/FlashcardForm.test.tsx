import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FlashcardForm } from "./FlashcardForm";

describe("FlashcardForm", () => {
  it("renders and submits values", () => {
    const onSubmit = vi.fn();
    render(<FlashcardForm onSubmit={onSubmit} themeOptions={["General"]} />);
    fireEvent.change(screen.getByLabelText(/Question/i), {
      target: { value: "Q" },
    });
    fireEvent.change(screen.getByLabelText(/Answer/i), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText(/Keywords/i), {
      target: { value: "k1, k2" },
    });
    fireEvent.change(screen.getByLabelText(/Theme/i), {
      target: { value: "General" },
    });
    fireEvent.click(screen.getByText(/Save/i));
    expect(onSubmit).toHaveBeenCalledWith({
      question: "Q",
      answer: "A",
      keywords: ["k1", "k2"],
      theme: "General",
    });
  });
});
