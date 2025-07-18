import { useState } from "react";
import { TextInput, Button, Group, Stack, Select } from "@mantine/core";
import type { Flashcard } from "../hooks/useFlashcards";

interface FlashcardFormProps {
  initialValues?: Partial<Flashcard>;
  onSubmit: (values: Omit<Flashcard, "id" | "createdAt">) => void;
  onCancel?: () => void;
  themeOptions: string[];
}

export function FlashcardForm({
  initialValues = {},
  onSubmit,
  onCancel,
  themeOptions,
}: FlashcardFormProps) {
  const [question, setQuestion] = useState(initialValues.question || "");
  const [answer, setAnswer] = useState(initialValues.answer || "");
  const [keywords, setKeywords] = useState(
    (initialValues.keywords || []).join(", "),
  );
  const [theme, setTheme] = useState(initialValues.theme || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          question,
          answer,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          theme,
        });
      }}
    >
      <Stack>
        <TextInput
          label="Question"
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.currentTarget.value)}
          required
        />
        <TextInput
          label="Keywords (comma separated)"
          value={keywords}
          onChange={(e) => setKeywords(e.currentTarget.value)}
        />
        <Select
          label="Theme"
          data={themeOptions}
          value={theme}
          onChange={setTheme}
          required
          searchable
          creatable="true"
        />
        <Group position="right">
          {onCancel && (
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Save</Button>
        </Group>
      </Stack>
    </form>
  );
}
