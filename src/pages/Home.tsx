import { useEffect, useState, useMemo } from "react";
import {
  Container,
  SimpleGrid,
  Button,
  Loader,
  Group,
  Modal,
  Text,
} from "@mantine/core";
import Fuse from "fuse.js";
import { useFlashcards } from "../hooks/useFlashcards";
import type { Flashcard } from "../hooks/useFlashcards";
import { FlashcardCard } from "../components/FlashcardCard";
import type { ThemeColorMap } from "../components/FlashcardCard";
import { FlashcardForm } from "../components/FlashcardForm";
import { SearchBar } from "../components/SearchBar";
import { DateRangeFilter } from "../components/DateRangeFilter";

const MANTINE_COLORS = [
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

function getThemeColorMap(themes: string[]): ThemeColorMap {
  const map: ThemeColorMap = {};
  themes.forEach((theme, i) => {
    map[theme] = MANTINE_COLORS[i % MANTINE_COLORS.length];
  });
  return map;
}

export default function Home() {
  const {
    flashcards,
    loading,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useFlashcards();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);

  const themes = useMemo(
    () => Array.from(new Set(flashcards.map((f) => f.theme))),
    [flashcards],
  );
  const themeColorMap = useMemo(() => getThemeColorMap(themes), [themes]);

  const fuse = useMemo(
    () =>
      new Fuse(flashcards, {
        keys: ["question", "answer", "keywords"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [flashcards],
  );

  const filtered = useMemo(() => {
    let cards = search ? fuse.search(search).map((r) => r.item) : flashcards;
    if (dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      cards = cards.filter((card) => {
        const d = new Date(card.createdAt);
        return d >= start! && d <= end!;
      });
    }
    return cards;
  }, [search, fuse, flashcards, dateRange]);

  useEffect(() => {
    if (modalOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [modalOpen]);

  return (
    <Container size="md" py="xl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
      <Group mb="md" style={{ width: '100%', justifyContent: 'center' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search flashcards..."
        />
        <Button
          onClick={() => {
            setEditCard(null);
            setModalOpen(true);
          }}
        >
          Add Card
        </Button>
      </Group>
      <Group mb="md" style={{ width: '100%', justifyContent: 'center' }}>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </Group>
      {loading ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Loader />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Text color="dimmed">No flashcards found.</Text>
        </div>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" style={{ margin: '0 auto' }}>
          {filtered.map((card) => (
            <FlashcardCard
              key={card.id}
              flashcard={card}
              onEdit={() => {
                setEditCard(card);
                setModalOpen(true);
              }}
              onDelete={() => deleteFlashcard(card.id)}
              themeColorMap={themeColorMap}
            />
          ))}
        </SimpleGrid>
      )}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCard ? "Edit Card" : "Add Card"}
        centered
        overlayProps={{ blur: 2 }}
      >
        <FlashcardForm
          initialValues={editCard || undefined}
          onSubmit={(values) => {
            if (editCard) updateFlashcard(editCard.id, values);
            else createFlashcard(values);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
          themeOptions={themes.length ? themes : ["General"]}
        />
      </Modal>
    </Container>
  );
}
