import { useState, useMemo, useEffect, useRef } from "react";
import {
  Container,
  Button,
  Group,
  Center,
  Switch,
  Loader,
  Text,
  Progress,
  Badge,
  Select,
  Modal,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useFlashcards } from "../hooks/useFlashcards";
import { FlashcardCard } from "../components/FlashcardCard";
import type { ThemeColorMap } from "../components/FlashcardCard";
import { motion, AnimatePresence } from "framer-motion";
import { showNotification } from '@mantine/notifications';
import { FlashcardForm } from "../components/FlashcardForm";

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

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
function saveStatus(status: Record<string, CardStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(status));
}

export default function Study() {
  const { flashcards, loading, createFlashcard } = useFlashcards();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const flashcardList = useMemo(() => Object.values(flashcards), [flashcards]);
  const [status, setStatus] = useState<Record<string, CardStatus>>(() => {
    // Initialisation : toutes les cartes à "unknown" (à revoir)
    const s = loadStatus();
    let changed = false;
    flashcardList.forEach(card => {
      if (!s[card.id]) {
        s[card.id] = "unknown";
        changed = true;
      }
    });
    if (changed) saveStatus(s);
    return s;
  });
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoDelay, setAutoDelay] = useState(5); // secondes
  const autoPlayRef = useRef(autoPlay);
  const autoDelayRef = useRef(autoDelay);
  const [autoPaused, setAutoPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const [autoFlip, setAutoFlip] = useState(false);
  const [autoFlipDelay, setAutoFlipDelay] = useState(3); // secondes
  const autoFlipRef = useRef(autoFlip);
  const autoFlipDelayRef = useRef(autoFlipDelay);
  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { autoDelayRef.current = autoDelay; }, [autoDelay]);
  useEffect(() => { autoFlipRef.current = autoFlip; }, [autoFlip]);
  useEffect(() => { autoFlipDelayRef.current = autoFlipDelay; }, [autoFlipDelay]);
  const [showOnlyUnknown, setShowOnlyUnknown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filtrage des cartes selon le switch "À revoir uniquement"
  const filteredFlashcards = useMemo(() => {
    if (!showOnlyUnknown) return flashcardList;
    return flashcardList.filter(card => status[card.id] === "unknown");
  }, [flashcardList, showOnlyUnknown, status]);

  const cards = useMemo(
    () => (shuffleMode ? shuffle([...filteredFlashcards]) : filteredFlashcards),
    [filteredFlashcards, shuffleMode],
  );
  const currentCard = cards[index];
  const currentStatus = status[currentCard?.id] || "unknown";

  // Sync status si nouvelles cartes ajoutées
  useEffect(() => {
    setStatus(prev => {
      const s = { ...prev };
      let changed = false;
      flashcardList.forEach(card => {
        if (!s[card.id]) {
          s[card.id] = "unknown";
          changed = true;
        }
      });
      // Supprime les statuts orphelins
      Object.keys(s).forEach(id => {
        if (!flashcardList.find(card => card.id === id)) {
          delete s[id];
          changed = true;
        }
      });
      if (changed) saveStatus(s);
      return changed ? { ...s } : prev;
    });
  }, [flashcardList]);

  // Lecture auto : timer
  useEffect(() => {
    if (!autoPlay || autoPaused) return;
    let timeout: number | undefined;
    timeout = window.setTimeout(() => {
      setFlipped(true);
      setTimeout(() => {
        setFlipped(false);
        setIndex((i) => (i + 1) % cards.length);
      }, 1000); // 1s pour voir la réponse
    }, autoDelay * 1000);
    return () => clearTimeout(timeout);
  }, [autoPlay, autoPaused, index, autoDelay, cards.length]);

  // Timer de retournement automatique
  useEffect(() => {
    if (!autoFlip || flipped) return;
    let timeout: number | undefined;
    timeout = window.setTimeout(() => {
      setFlipped(true);
    }, autoFlipDelay * 1000);
    return () => clearTimeout(timeout);
  }, [autoFlip, autoFlipDelay, index, flipped, currentCard?.id]);

  // Réinitialiser le timer auto-flip à chaque interaction manuelle
  const resetAutoFlip = () => {
    if (autoFlip) setFlipped(false);
  };

  // Pause autoPlay si interaction manuelle
  const pauseAuto = () => { if (autoPlay) setAutoPaused(true); };
  const resumeAuto = () => { if (autoPlay) setAutoPaused(false); };

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

  const setCardStatus = (id: string, newStatus: CardStatus) => {
    setStatus(prev => {
      const s = { ...prev, [id]: newStatus };
      saveStatus(s);
      showNotification({
        message: newStatus === 'known' ? 'Carte marquée comme connue' : 'Carte à revoir',
        color: newStatus === 'known' ? 'green' : 'red',
        autoClose: 1200,
      });
      return s;
    });
  };

  // Ajout pour press & hold
  useEffect(() => {
    if (holding) setFlipped(true);
    else setFlipped(false);
  }, [holding]);

  // Passage auto après "Je connais"
  const handleKnown = () => {
    if (!currentCard) return;
    setCardStatus(currentCard.id, "known");
    setTimeout(() => {
      setFlipped(false);
      setIndex((i) => (i + 1) % cards.length);
    }, 300);
  };

  // Raccourcis clavier
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Ignore si un champ de saisie est focus
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.repeat) return;
      if (!currentCard) return;
      switch (e.key) {
        case "ArrowRight":
          handleNext();
          pauseAuto();
          break;
        case "ArrowLeft":
          handlePrev();
          pauseAuto();
          break;
        case " ":
        case "Spacebar":
          setFlipped((f) => !f);
          pauseAuto();
          break;
        case "1":
          handleKnown();
          pauseAuto();
          break;
        case "2":
          setCardStatus(currentCard.id, "unknown");
          pauseAuto();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev, handleKnown, pauseAuto, setCardStatus, currentCard?.id]);

  if (loading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  if (!cards.length || !currentCard)
    return (
      <Center py="xl">
        <Text color="dimmed">
          {showOnlyUnknown
            ? "Aucune carte à revoir. Félicitations !"
            : "No cards to study."}
        </Text>
      </Center>
    );

  const total = flashcardList.length;
  const known = Object.values(status).filter(s => s === "known").length;
  const unknown = total - known;
  const percent = total > 0 ? Math.round((known / total) * 100) : 0;

  return (
    <Box style={{ minHeight: '100vh', background: '#f8fafc', width: '100%' }}>
      <Container size={isMobile ? "xs" : "sm"} py={isMobile ? "sm" : "xl"}>
        <Box style={{
          margin: '32px auto 0 auto',
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          padding: isMobile ? 12 : 32,
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Barre de progression */}
          <Progress value={((index + 1) / cards.length) * 100} mb={isMobile ? 8 : "md"} size={isMobile ? "sm" : "md"} radius="xl" striped animated label={`${index + 1} / ${cards.length}`} style={{ width: isMobile ? '100%' : 400, maxWidth: '100%' }} />
          <Group position="center" mb={isMobile ? 8 : "md"} style={{ width: isMobile ? '100%' : 400, maxWidth: '100%' }}>
            <Text size={isMobile ? "xs" : "sm"}>
              <b>Progression :</b> {known} / {total} connues ({percent}%) — {unknown} à revoir
            </Text>
          </Group>
          <Group position="center" mb={isMobile ? 8 : "md"} style={{ width: isMobile ? '100%' : 400, maxWidth: '100%' }}>
            <Switch
              label="À revoir uniquement"
              checked={showOnlyUnknown}
              onChange={(e) => { setShowOnlyUnknown(e.currentTarget.checked); setIndex(0); pauseAuto(); resetAutoFlip(); }}
              size={isMobile ? "md" : "sm"}
            />
            <Switch
              label="Shuffle"
              checked={shuffleMode}
              onChange={(e) => {
                setShuffleMode(e.currentTarget.checked);
                setIndex(0);
                pauseAuto();
                resetAutoFlip();
              }}
              size={isMobile ? "md" : "sm"}
            />
            <Switch
              label="Retourner automatiquement"
              checked={autoFlip}
              onChange={(e) => setAutoFlip(e.currentTarget.checked)}
              size={isMobile ? "md" : "sm"}
            />
            <Select
              data={[{ value: "2", label: "2s" }, { value: "3", label: "3s" }, { value: "5", label: "5s" }]}
              value={String(autoFlipDelay)}
              onChange={(v) => v && setAutoFlipDelay(Number(v))}
              disabled={!autoFlip}
              size={isMobile ? "sm" : "xs"}
              style={{ width: isMobile ? 80 : 70 }}
            />
            <Group spacing={isMobile ? 8 : undefined}>
              <Button
                color={autoPlay ? "yellow" : "gray"}
                variant={autoPlay ? "filled" : "outline"}
                onClick={() => { setAutoPlay((v) => !v); resetAutoFlip(); }}
                size={isMobile ? "md" : "sm"}
              >
                {autoPlay ? (autoPaused ? "Lecture auto (en pause)" : "Lecture auto (on)") : "Lecture auto"}
              </Button>
              <Select
                data={[{ value: "3", label: "3s" }, { value: "5", label: "5s" }, { value: "10", label: "10s" }]}
                value={String(autoDelay)}
                onChange={(v) => v && setAutoDelay(Number(v))}
                disabled={!autoPlay}
                size={isMobile ? "sm" : "xs"}
                style={{ width: isMobile ? 80 : 70 }}
              />
            </Group>
            <Text size={isMobile ? "xs" : "sm"}>
              {index + 1} / {cards.length}
            </Text>
            <Button size={isMobile ? 'sm' : 'xs'} onClick={() => setShowAddForm((v) => !v)} disabled={showAddForm}>
              + Ajouter une carte
            </Button>
          </Group>
          {showAddForm && (
            <Box mb="md" style={{ width: '100%', maxWidth: 480, margin: '0 auto' }}>
              <FlashcardForm
                onSubmit={(values) => {
                  createFlashcard({
                    ...values,
                    createdAt: new Date().toISOString(),
                  });
                  setShowAddForm(false);
                }}
                onCancel={() => setShowAddForm(false)}
                themeOptions={[...new Set(flashcardList.map(f => f.theme))]}
              />
            </Box>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard?.id + String(flipped) + currentStatus}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.2 }}
              tabIndex={0}
              onClick={() => { setFlipped((f) => !f); pauseAuto(); resetAutoFlip(); }}
              onKeyDown={(e) => { if (e.key === " ") { setFlipped((f) => !f); pauseAuto(); resetAutoFlip(); } }}
              onMouseDown={() => { setHolding(true); pauseAuto(); resetAutoFlip(); }}
              onMouseUp={() => setHolding(false)}
              onMouseLeave={() => setHolding(false)}
              onTouchStart={() => { setHolding(true); pauseAuto(); resetAutoFlip(); }}
              onTouchEnd={() => setHolding(false)}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: isMobile ? 220 : 240, width: isMobile ? '100%' : 400, maxWidth: '100%' }}
            >
              <div style={{ position: "relative", width: '100%' }}>
                {/* Badge de statut */}
                <Badge
                  color={currentStatus === "known" ? "green" : "red"}
                  variant="filled"
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
                >
                  {currentStatus === "known" ? "Je connais" : "À revoir"}
                </Badge>
                <FlashcardCard
                  flashcard={currentCard}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  themeColorMap={themeColorMap}
                  flipped={flipped}
                />
              </div>
            </motion.div>
          </AnimatePresence>
          {isMobile && (
            <Text size="xs" color="dimmed" align="center" mt={4}>
              Astuce : Appuie longuement sur la carte pour voir la réponse
            </Text>
          )}
          <Group position="center" mt={isMobile ? 8 : "md"} spacing={isMobile ? 8 : undefined} style={{ width: isMobile ? '100%' : 400, maxWidth: '100%', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : undefined, justifyContent: 'center' }}>
            <Button onClick={() => { handlePrev(); pauseAuto(); resetAutoFlip(); }} disabled={cards.length < 2} size={isMobile ? "lg" : "md"} fullWidth={isMobile}>
              Previous
            </Button>
            <Group spacing={isMobile ? 8 : undefined} style={isMobile ? { width: '100%', justifyContent: 'center' } : {}}>
              <Button
                color={currentStatus === "known" ? "gray" : "green"}
                variant={currentStatus === "known" ? "outline" : "filled"}
                onClick={() => { handleKnown(); pauseAuto(); resetAutoFlip(); }}
                disabled={currentStatus === "known"}
                size={isMobile ? "lg" : "md"}
                fullWidth={isMobile}
              >
                Je connais
              </Button>
              <Button
                color={currentStatus === "unknown" ? "gray" : "red"}
                variant={currentStatus === "unknown" ? "outline" : "filled"}
                onClick={() => { setCardStatus(currentCard.id, "unknown"); pauseAuto(); resetAutoFlip(); }}
                disabled={currentStatus === "unknown"}
                size={isMobile ? "lg" : "md"}
                fullWidth={isMobile}
              >
                À revoir
              </Button>
            </Group>
            <Button onClick={() => { handleNext(); pauseAuto(); resetAutoFlip(); }} disabled={cards.length < 2} size={isMobile ? "lg" : "md"} fullWidth={isMobile}>
              Next
            </Button>
          </Group>
          {autoPlay && autoPaused && (
            <Button mt={isMobile ? 8 : "md"} color="yellow" variant="outline" onClick={resumeAuto} fullWidth>
              Reprendre la lecture auto
            </Button>
          )}
          <Button mt={isMobile ? 4 : "sm"} size={isMobile ? "xs" : "sm"} color="red" variant="outline"
            onClick={() => {
              if (window.confirm("Remettre toutes les cartes en 'à revoir' ?")) {
                const newStatus = { ...status };
                flashcardList.forEach(card => { newStatus[card.id] = "unknown"; });
                saveStatus(newStatus);
                setStatus(newStatus);
              }
            }}
          >
            Réinitialiser la progression
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
