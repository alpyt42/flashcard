import { useEffect, useState, useMemo } from "react";
import {
  Container,
  SimpleGrid,
  Button,
  Loader,
  Group,
  Modal,
  Text,
  Box,
  Select,
} from "@mantine/core";
import Fuse from "fuse.js";
import { useFlashcards } from "../hooks/useFlashcards";
import type { Flashcard } from "../hooks/useFlashcards";
import { FlashcardCard } from "../components/FlashcardCard";
import type { ThemeColorMap } from "../components/FlashcardCard";
import { FlashcardForm } from "../components/FlashcardForm";
import { SearchBar } from "../components/SearchBar";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { FlashcardFilters } from "../components/FlashcardFilters";

// Gestion du statut connu/à revoir (localStorage)
const STATUS_KEY = "flashcard-study-status";
type CardStatus = "known" | "unknown";
function loadStatus(): Record<string, CardStatus> {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) || "{}") ?? {};
  } catch {
    return {};
  }
}

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [themeFilter, setThemeFilter] = useState<string | null>(null);

  const flashcardList = useMemo(() => Object.values(flashcards), [flashcards]);
  const themes = useMemo(
    () => Array.from(new Set(flashcardList.map((f) => f.theme))),
    [flashcardList],
  );
  const themeColorMap = useMemo(() => getThemeColorMap(themes), [themes]);

  const fuse = useMemo(
    () =>
      new Fuse(flashcardList, {
        keys: ["question", "answer", "keywords"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [flashcardList],
  );

  const filtered = useMemo(() => {
    let cards = search ? fuse.search(search).map((r) => r.item) : flashcardList;
    if (themeFilter && themeFilter !== 'Tous') {
      cards = cards.filter((card) => card.theme === themeFilter);
    }
    if (dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange;
      cards = cards.filter((card) => {
        const d = new Date(card.createdAt);
        return d >= start! && d <= end!;
      });
    }
    return cards;
  }, [search, fuse, flashcardList, dateRange, themeFilter]);

  const status = loadStatus();
  const total = flashcardList.length;
  const known = flashcardList.filter(c => status[c.id] === 'known').length;
  const unknown = total - known;
  const percent = total > 0 ? Math.round((known / total) * 100) : 0;

  useEffect(() => {
    if (showAddForm) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showAddForm]);

  return (
    <Box style={{ minHeight: '100vh', background: '#f8fafc', width: '100%' }}>
      <Container size="md" py="xl" style={{ maxWidth: 900, width: '100%', margin: '0 auto', padding: '0 8px' }}>
        {/* Titre de la page */}
        <Text align="center" size="2.2rem" fw={800} mb={8} style={{ letterSpacing: 0.5, color: '#1c2c3a' }}>
          Mes Flashcards
        </Text>
        {/* Filtres repliables */}
        <FlashcardFilters
          search={search}
          onSearchChange={setSearch}
          themeFilter={themeFilter}
          onThemeFilterChange={setThemeFilter}
          themes={themes}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        {/* Stats et bouton d'ajout alignés */}
        <Group position="apart" mb={12} style={{ width: '100%', marginTop: -8 }}>
          <Box>
            <Text size="sm" color="dimmed">
              {filtered.length} carte{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''} / {total} au total
            </Text>
            <Text size="sm" color="dimmed">
              <b>Stats :</b> {known} connues, {unknown} à revoir, progression {percent}%
            </Text>
          </Box>
          <Button
            onClick={() => setShowAddForm((v) => !v)}
            size="md"
            style={{ minWidth: 140, marginBottom: 0, marginTop: 0, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
            disabled={showAddForm}
          >
            + Ajouter une carte
          </Button>
        </Group>
        {/* Formulaire d'ajout inline */}
        {showAddForm && (
          <Box mb="md" style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
            <FlashcardForm
              onSubmit={(values) => {
                createFlashcard(values);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
              themeOptions={themes.length ? themes : ["General"]}
            />
          </Box>
        )}
        {/* Grille des cartes */}
        {loading ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <Loader />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 48 }}>
            <Text color="dimmed">Aucune carte trouvée.</Text>
          </div>
        ) : (
          <SimpleGrid
            minChildWidth={280}
            spacing={{ base: 'md', sm: 'lg' }}
            verticalSpacing={{ base: 'md', sm: 'lg' }}
            style={{
              margin: '0 auto',
              width: '100%',
              maxWidth: 900,
              padding: '0 0 32px 0',
              transition: 'gap 0.2s',
            }}
            cols={{ base: 1, sm: 2, md: 3 }}
          >
            {filtered.map((card) => (
              <FlashcardCard
                key={card.id}
                flashcard={card}
                onEdit={() => {
                  setEditCard(card);
                  // (édition inline à ajouter si besoin)
                }}
                onDelete={() => deleteFlashcard(card.id)}
                themeColorMap={themeColorMap}
              />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}
