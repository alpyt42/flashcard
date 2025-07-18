import { useState, useMemo } from "react";
import {
  Container,
  Button,
  Group,
  Center,
  Switch,
  Loader,
  Text,
} from "@mantine/core";
import { useFlashcards } from "../hooks/useFlashcards";
import { FlashcardCard } from "../components/FlashcardCard";
import type { ThemeColorMap } from "../components/FlashcardCard";
import { motion, AnimatePresence } from "framer-motion";

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

export default function Study() {
  const { flashcards, loading } = useFlashcards();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  const cards = useMemo(
    () => (shuffleMode ? shuffle([...flashcards]) : flashcards),
    [flashcards, shuffleMode],
  );
  const themeColorMap: ThemeColorMap = useMemo(() => {
    const themes = Array.from(new Set(cards.map((f) => f.theme)));
    const colors = [
      "blue",
      "red",
      "teal",
      "grape",
      "orange",
      "cyan",
      "green",
      "pink",
      "violet",
      "yellow",
      "lime",
      "indigo",
      "gray",
    ];
    const map: ThemeColorMap = {};
    themes.forEach((theme, i) => {
      map[theme] = colors[i % colors.length];
    });
    return map;
  }, [cards]);

  const handleNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  };
  const handlePrev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  if (loading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  if (!cards.length)
    return (
      <Center py="xl">
        <Text color="dimmed">No cards to study.</Text>
      </Center>
    );

  return (
    <Container size="xs" py="xl">
      <Group position="apart" mb="md">
        <Switch
          label="Shuffle"
          checked={shuffleMode}
          onChange={(e) => {
            setShuffleMode(e.currentTarget.checked);
            setIndex(0);
          }}
        />
        <Text size="sm">
          {index + 1} / {cards.length}
        </Text>
      </Group>
      <AnimatePresence mode="wait">
        <motion.div
          key={cards[index]?.id + String(flipped)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.2 }}
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === " ") setFlipped((f) => !f);
          }}
        >
          <FlashcardCard
            flashcard={cards[index]}
            onEdit={() => {}}
            onDelete={() => {}}
            themeColorMap={themeColorMap}
          />
        </motion.div>
      </AnimatePresence>
      <Group position="apart" mt="md">
        <Button onClick={handlePrev} disabled={cards.length < 2}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={cards.length < 2}>
          Next
        </Button>
      </Group>
    </Container>
  );
}
