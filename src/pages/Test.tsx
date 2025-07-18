import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Button,
  Group,
  Text,
  Center,
  Loader,
  Progress,
  Badge,
} from "@mantine/core";
import { useFlashcards } from "../hooks/useFlashcards";

function shuffleArray<T>(arr: T[]): T[] {
  return arr
    .map((v) => [Math.random(), v] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v);
}

function getRandomWrongAnswers(flashcards, correct, n) {
  return shuffleArray(
    flashcards.filter((f) => f.id !== correct.id)
  )
    .slice(0, n)
    .map((f) => f.answer);
}

export default function Test() {
  const { flashcards, loading } = useFlashcards();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  // Timer
  useEffect(() => {
    if (startTime && !done) {
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, done]);

  // Reset test on mount
  useEffect(() => {
    setCurrent(0);
    setSelected(null);
    setShowAnswer(false);
    setScore(0);
    setDone(false);
    setElapsed(0);
    setStartTime(Date.now());
  }, [flashcards.length]);

  const questions = useMemo(() => shuffleArray(flashcards), [flashcards]);
  const question = questions[current];

  const answers = useMemo(() => {
    if (!question) return [];
    const wrongs = getRandomWrongAnswers(questions, question, 3);
    return shuffleArray([question.answer, ...wrongs]);
  }, [question, questions]);

  if (loading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  if (!questions.length)
    return (
      <Center py="xl">
        <Text color="dimmed">Aucune carte disponible.</Text>
      </Center>
    );
  if (done)
    return (
      <Container size="xs" py="xl">
        <Card shadow="md" p="lg" radius="md" withBorder>
          <Text size="xl" weight={700} mb="md">
            Test terminé !
          </Text>
          <Text mb="sm">Score : {score} / {questions.length}</Text>
          <Text mb="sm">Temps : {elapsed} secondes</Text>
          <Button onClick={() => {
            setCurrent(0);
            setSelected(null);
            setShowAnswer(false);
            setScore(0);
            setDone(false);
            setElapsed(0);
            setStartTime(Date.now());
          }}>Recommencer</Button>
        </Card>
      </Container>
    );

  return (
    <Container size="xs" py="xl">
      <Card shadow="md" p="lg" radius="md" withBorder>
        <Group position="apart" mb="xs">
          <Badge color="blue" variant="light">
            Question {current + 1} / {questions.length}
          </Badge>
          <Text size="sm">⏱ {elapsed}s</Text>
        </Group>
        <Progress value={((current) / questions.length) * 100} mb="md" />
        <Text weight={500} size="lg" mb="md">
          {question.question}
        </Text>
        <Group direction="column" spacing="sm" mb="md">
          {answers.map((ans) => (
            <Button
              key={ans}
              fullWidth
              color={
                showAnswer
                  ? ans === question.answer
                    ? "green"
                    : ans === selected
                    ? "red"
                    : "gray"
                  : "blue"
              }
              variant={showAnswer ? "light" : "filled"}
              disabled={showAnswer}
              onClick={() => {
                setSelected(ans);
                setShowAnswer(true);
                if (ans === question.answer) setScore((s) => s + 1);
              }}
            >
              {ans}
            </Button>
          ))}
        </Group>
        {showAnswer && (
          <Text mb="md" color={selected === question.answer ? "green" : "red"}>
            {selected === question.answer
              ? "Bonne réponse !"
              : `Mauvaise réponse. La bonne réponse était : ${question.answer}`}
          </Text>
        )}
        <Group position="right">
          {showAnswer && (
            <Button
              onClick={() => {
                if (current + 1 === questions.length) {
                  setDone(true);
                } else {
                  setCurrent((c) => c + 1);
                  setSelected(null);
                  setShowAnswer(false);
                }
              }}
            >
              {current + 1 === questions.length ? "Terminer" : "Suivant"}
            </Button>
          )}
        </Group>
      </Card>
    </Container>
  );
} 