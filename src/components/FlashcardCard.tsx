import { useState } from "react";
import { Card, Badge, Text, Group, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Flashcard } from "../hooks/useFlashcards";

export type ThemeColorMap = Record<string, string>;

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
  themeColorMap: ThemeColorMap;
}

export function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
  themeColorMap,
}: FlashcardCardProps) {
  const [flipped, setFlipped] = useState(false);
  const color = themeColorMap[flashcard.theme] || "gray";

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: "pointer",
        borderColor: flipped ? `var(--mantine-color-${color}-6)` : undefined,
      }}
      onClick={() => setFlipped((f) => !f)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " ") setFlipped((f) => !f);
      }}
    >
      <Group position="apart" mb="xs">
        <Badge color={color} variant="filled">
          {flashcard.theme}
        </Badge>
        <Group spacing={4}>
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Edit"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>
      <Text weight={500} size="lg" mb="xs">
        {flipped ? flashcard.answer : flashcard.question}
      </Text>
      <Group spacing={4} mt="xs">
        {flashcard.keywords.map((kw) => (
          <Badge key={kw} color={color} variant="light" size="xs">
            {kw}
          </Badge>
        ))}
      </Group>
      <Text size="xs" color="dimmed" mt="sm">
        {new Date(flashcard.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );
}
