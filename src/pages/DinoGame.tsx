import { useEffect, useRef, useState } from "react";
import { Button, Center, Text, Group, Card, Select, ColorInput } from "@mantine/core";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 180;
const GROUND_Y = 150;
const DINO_W = 36;
const DINO_H = 32;
const OBSTACLE_WIDTH = 16;
const OBSTACLE_HEIGHT = 36;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -13;
const SPEEDS = [
  { value: '3', label: "Lent" },
  { value: '4', label: "Normal" },
  { value: '6', label: "Rapide" },
];
const DINO_COLORS = ["#228be6", "#fab005", "#e8590c", "#40c057", "#be4bdb"];

// Types d'obstacles
const OBSTACLE_TYPES = [
  { type: 'cactus', color: '#40c057' },
  { type: 'rock', color: '#868e96' },
  { type: 'bush', color: '#a3e635' },
  { type: 'sign', color: '#e8590c' },
];

function playBeep(frequency = 600, duration = 80) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = frequency;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.1;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, duration);
  } catch {}
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('dinoHighScore') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [dinoColor, setDinoColor] = useState(DINO_COLORS[0]);

  // Game state
  const dino = useRef({ y: GROUND_Y, vy: 0, anim: 0 });
  const obstacles = useRef<{ x: number; type: string; w: number; h: number }[]>([]);
  const clouds = useRef<{ x: number, y: number }[]>([]);
  const frame = useRef(0);

  // Clouds init
  useEffect(() => {
    clouds.current = Array.from({ length: 3 }, () => ({
      x: Math.random() * GAME_WIDTH,
      y: 20 + Math.random() * 40,
    }));
  }, []);

  // Handle jump
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.code === 'Space' || e.key === ' ') && !jumping && running && !gameOver) {
        dino.current.vy = JUMP_VELOCITY;
        setJumping(true);
        playBeep(700, 80);
      }
      if ((e.code === 'Space' || e.key === ' ') && gameOver) {
        restart();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jumping, running, gameOver]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    let animation: number;
    function loop() {
      frame.current++;
      // Dino physics
      dino.current.y += dino.current.vy;
      dino.current.vy += GRAVITY;
      if (dino.current.y >= GROUND_Y) {
        dino.current.y = GROUND_Y;
        dino.current.vy = 0;
        setJumping(false);
      }
      // Dino animation (run)
      if (frame.current % 6 === 0 && dino.current.y === GROUND_Y) {
        dino.current.anim = (dino.current.anim + 1) % 2;
      }
      // Obstacles
      if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < GAME_WIDTH - 180 - Math.random() * 120) {
        // Génère 1 ou 2 obstacles côte à côte
        const n = Math.random() < 0.18 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const t = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
          const w = OBSTACLE_WIDTH + Math.floor(Math.random() * 10) + (t.type === 'sign' ? 10 : 0);
          const h = OBSTACLE_HEIGHT + (t.type === 'bush' ? -10 : Math.floor(Math.random() * 10));
          obstacles.current.push({ x: GAME_WIDTH + i * (w + 8), type: t.type, w, h });
        }
      }
      for (const obs of obstacles.current) {
        obs.x -= speed;
      }
      // Remove off-screen
      if (obstacles.current[0]?.x < -OBSTACLE_WIDTH) {
        obstacles.current.shift();
        setScore((s) => s + 1);
      }
      // Collision
      let collision = false;
      for (const obs of obstacles.current) {
        if (
          obs.x < 40 + DINO_W &&
          obs.x + obs.w > 40 &&
          dino.current.y + DINO_H > GROUND_Y - obs.h
        ) {
          collision = true;
        }
      }
      if (collision) {
        setGameOver(true);
        setRunning(false);
        playBeep(200, 200);
        setHighScore((prev) => {
          if (score > prev) {
            localStorage.setItem('dinoHighScore', String(score));
            return score;
          }
          return prev;
        });
        return;
      }
      // Clouds
      for (const c of clouds.current) {
        c.x -= 0.7;
        if (c.x < -60) {
          c.x = GAME_WIDTH + Math.random() * 100;
          c.y = 20 + Math.random() * 40;
        }
      }
      draw();
      animation = requestAnimationFrame(loop);
    }
    animation = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animation);
  }, [running, speed, dinoColor]);

  function draw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    // Dégradé de fond
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#e3f0ff');
    grad.addColorStop(1, '#b6e0fe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Nuages
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#fff';
    for (const c of clouds.current) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 30, 12, 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Sol ombré
    ctx.fillStyle = '#b0b0b0';
    ctx.fillRect(0, GROUND_Y + DINO_H, GAME_WIDTH, 6);
    // Dino (plus stylisé)
    ctx.save();
    ctx.translate(40, dino.current.y);
    ctx.fillStyle = dinoColor;
    ctx.beginPath();
    ctx.ellipse(16, 16, 16, 14, 0, 0, 2 * Math.PI); // corps
    ctx.fill();
    ctx.fillRect(8, 0, 16, 12); // tête
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(20, 8, 2, 0, 2 * Math.PI); // œil
    ctx.fill();
    ctx.restore();
    // Obstacles (plus doux)
    for (const obs of obstacles.current) {
      // Ombre portée
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(obs.x + obs.w / 2, GROUND_Y + DINO_H + 6, obs.w / 2, 5, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
      // Obstacle principal
      const t = OBSTACLE_TYPES.find(o => o.type === obs.type);
      ctx.save();
      ctx.fillStyle = t?.color || '#495057';
      if (obs.type === 'cactus') {
        ctx.beginPath();
        ctx.roundRect(obs.x, GROUND_Y + DINO_H - obs.h, obs.w, obs.h, 6);
        ctx.fill();
        // Bras cactus
        ctx.fillRect(obs.x + obs.w / 2 - 3, GROUND_Y + DINO_H - obs.h / 2, 6, obs.h / 3);
      } else if (obs.type === 'rock') {
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2, GROUND_Y + DINO_H - 4, obs.w / 2, obs.h / 2.5, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (obs.type === 'bush') {
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2, GROUND_Y + DINO_H - obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
      } else if (obs.type === 'sign') {
        ctx.beginPath();
        ctx.roundRect(obs.x, GROUND_Y + DINO_H - obs.h, obs.w, obs.h, 4);
        ctx.fill();
        ctx.fillStyle = '#fff3e0';
        ctx.fillRect(obs.x + 4, GROUND_Y + DINO_H - obs.h + 8, obs.w - 8, obs.h / 2);
      }
      ctx.restore();
    }
  }

  function start() {
    setScore(0);
    setGameOver(false);
    setRunning(true);
    dino.current.y = GROUND_Y;
    dino.current.vy = 0;
    dino.current.anim = 0;
    obstacles.current = [];
    frame.current = 0;
  }
  function restart() {
    start();
  }
  function resetHigh() {
    setHighScore(0);
    localStorage.setItem('dinoHighScore', '0');
  }

  return (
    <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <Card shadow="md" p="lg" radius="md" withBorder style={{ background: '#e3f0ff', maxWidth: 700 }}>
        <Group position="apart" mb="md">
          <Text size="xl" weight={700}>Dino Game</Text>
          <Button variant="light" color="gray" onClick={resetHigh}>Reset High Score</Button>
        </Group>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ border: '2px solid #228be6', background: '#e3f0ff', borderRadius: 12, touchAction: 'manipulation', display: 'block', margin: '0 auto' }}
        />
        <Group mt="md" position="center" spacing="md">
          <Button onClick={start} disabled={running && !gameOver} size="md" color="blue" radius="xl">
            {gameOver ? "Rejouer" : running ? "En cours..." : "Démarrer"}
          </Button>
          <Select
            data={SPEEDS}
            value={String(speed)}
            onChange={v => v && setSpeed(Number(v))}
            size="sm"
            style={{ minWidth: 100 }}
            label="Vitesse"
          />
          <ColorInput
            value={dinoColor}
            onChange={setDinoColor}
            size="sm"
            swatches={DINO_COLORS}
            label="Couleur Dino"
            style={{ minWidth: 120 }}
          />
        </Group>
        <Group mt="md" position="center" spacing="md">
          <Text size="sm">Score : <b>{score}</b></Text>
          <Text size="sm" color="blue.7">High Score : <b>{highScore}</b></Text>
        </Group>
        <Text size="xs" color="dimmed" align="center" mt={8}>
          Espace = Sauter &nbsp;|&nbsp; Évite les obstacles !
        </Text>
      </Card>
    </Center>
  );
} 