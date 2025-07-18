import React, { useRef, useState, useEffect } from "react";
import { useFlashcards } from "../hooks/useFlashcards";
import { Text, Badge, Group } from "@mantine/core";
import Draggable from "react-draggable";

export default function Whiteboard3D() {
  const { flashcards } = useFlashcards();

  // Un seul useRef pour stocker tous les refs, typage compatible
  const nodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});
  const getNodeRef = (id: string) => {
    if (!nodeRefs.current[id]) {
      nodeRefs.current[id] = React.createRef<HTMLDivElement>();
    }
    return nodeRefs.current[id];
  };

  // Position initiale aléatoire pour chaque card
  const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>(() =>
    Object.fromEntries(
      Object.values(flashcards).map((c) => [c.id, { x: Math.random() * 400, y: Math.random() * 300 }])
    )
  );

  // Si le nombre de flashcards change (ajout/suppression), on réinitialise les positions pour les nouvelles cartes
  useEffect(() => {
    setPositions(prev => {
      const newPositions = { ...prev };
      let changed = false;
      Object.values(flashcards).forEach(card => {
        if (!newPositions[card.id]) {
          newPositions[card.id] = { x: Math.random() * 400, y: Math.random() * 300 };
          changed = true;
        }
      });
      // Supprime les positions orphelines
      Object.keys(newPositions).forEach(id => {
        if (!Object.values(flashcards).find(card => card.id === id)) {
          delete newPositions[id];
          changed = true;
        }
      });
      return changed ? { ...newPositions } : prev;
    });
  }, [flashcards]);

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
      {Object.values(flashcards).map((card) => (
        <Draggable
          key={card.id}
          nodeRef={getNodeRef(card.id)}
          position={positions[card.id] || { x: 0, y: 0 }}
          onDrag={(e, data) => handleDrag(card.id, e, data)}
        >
          <div
            ref={getNodeRef(card.id)}
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