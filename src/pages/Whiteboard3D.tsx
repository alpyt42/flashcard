import { useRef, useState } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
import { Card, Text, Badge, Group, Button } from "@mantine/core";
import Draggable from "react-draggable";

export default function Whiteboard3D() {
  const { flashcards } = useFlashcards();
  // Position initiale aléatoire pour chaque card
  const initialPositions = useRef(
    Object.fromEntries(
      flashcards.map((c) => [c.id, { x: Math.random() * 400, y: Math.random() * 300 }])
    )
  );
  const [positions, setPositions] = useState(initialPositions.current);

  const handleDrag = (id: string, e: any, data: any) => {
    setPositions((prev) => ({ ...prev, [id]: { x: data.x, y: data.y } }));
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "calc(100vh - 60px)",
        background: "#f8fafc",
        position: "relative",
        overflow: "auto",
      }}
    >
      {flashcards.map((card) => (
        <Draggable
          key={card.id}
          position={positions[card.id] || { x: 0, y: 0 }}
          onDrag={(e, data) => handleDrag(card.id, e, data)}
        >
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              minWidth: 220,
              maxWidth: 320,
              cursor: "grab",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              background: "#fffbe6",
              borderRadius: 12,
              padding: 16,
              border: "1.5px solid #ffe066",
              userSelect: "none",
            }}
          >
            <Group position="apart" mb="xs">
              <Badge color="yellow" variant="filled">
                {card.theme}
              </Badge>
            </Group>
            <Text weight={500} size="md" mb="xs">
              {card.question}
            </Text>
            <Text size="sm" color="dimmed" mb="xs">
              {card.answer}
            </Text>
            <Group spacing={4} mt="xs">
              {card.keywords.map((kw) => (
                <Badge key={kw} color="yellow" variant="light" size="xs">
                  {kw}
                </Badge>
              ))}
            </Group>
          </div>
        </Draggable>
      ))}
    </div>
  );
} 