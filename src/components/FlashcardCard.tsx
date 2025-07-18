import { useState } from "react";
import { Card, Badge, Text, Group, ActionIcon, Modal, Button } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Flashcard } from "../hooks/useFlashcards";
import { useDisclosure } from "@mantine/hooks";
import { motion } from "framer-motion";

export type ThemeColorMap = Record<string, string>;

interface FlashcardCardProps {
  flashcard: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
  themeColorMap: ThemeColorMap;
  flipped?: boolean;
}

export function FlashcardCard({
  flashcard,
  onEdit,
  onDelete,
  themeColorMap,
  flipped: flippedProp,
}: FlashcardCardProps) {
  const [flippedState, setFlippedState] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const flipped = flippedProp !== undefined ? flippedProp : flippedState;
  const color = themeColorMap[flashcard.theme] || "gray";

  // Largeur/hauteur fixes pour stabilité du layout
  const CARD_WIDTH = '100%';
  const CARD_MAX_WIDTH = 320;
  const CARD_MIN_WIDTH = 220;
  const CARD_HEIGHT = 200;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: CARD_MAX_WIDTH,
        minWidth: CARD_MIN_WIDTH,
        height: CARD_HEIGHT,
        margin: '0 auto 16px auto',
        position: 'relative',
        perspective: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Modal opened={opened} onClose={close} title="Supprimer la carte ?" centered>
        <Text mb="md">Cette action est irréversible.</Text>
        <Group position="right">
          <Button variant="default" onClick={close}>Annuler</Button>
          <Button color="red" onClick={() => { close(); onDelete(); }}>Supprimer</Button>
        </Group>
      </Modal>
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: 16,
          boxShadow: flipped || hovered
            ? "0 4px 24px 0 rgba(0,0,0,0.18)"
            : "0 2px 8px 0 rgba(0,0,0,0.08)",
          transition: "box-shadow 0.2s",
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: flipped ? 180 : 0,
        }}
        transition={{ duration: 0.32, ease: "easeInOut" }}
      >
        {/* Face question */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backfaceVisibility: "hidden",
            zIndex: 2,
          }}
        >
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              cursor: "pointer",
              borderColor: undefined,
              background: "#fff",
              minHeight: CARD_HEIGHT,
              minWidth: CARD_MIN_WIDTH,
              maxWidth: CARD_MAX_WIDTH,
              width: '100%',
              height: '100%',
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => {
              if (flippedProp === undefined) setFlippedState((f) => !f);
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " && flippedProp === undefined) setFlippedState((f) => !f);
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
                    open();
                  }}
                  aria-label="Delete"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Text weight={500} size="lg" mb="xs">
              {flashcard.question}
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
        </div>
        {/* Face réponse */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            zIndex: 1,
          }}
        >
          <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              cursor: "pointer",
              borderColor: `var(--mantine-color-${color}-6)`,
              background: "#f8fafc",
              minHeight: CARD_HEIGHT,
              minWidth: CARD_MIN_WIDTH,
              maxWidth: CARD_MAX_WIDTH,
              width: '100%',
              height: '100%',
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => {
              if (flippedProp === undefined) setFlippedState((f) => !f);
            }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " && flippedProp === undefined) setFlippedState((f) => !f);
            }}
          >
            <Group position="apart" mb="xs">
              <Badge color={color} variant="filled">
                {flashcard.theme}
              </Badge>
            </Group>
            <Text weight={500} size="lg" mb="xs">
              {flashcard.answer}
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
        </div>
      </motion.div>
    </div>
  );
}
