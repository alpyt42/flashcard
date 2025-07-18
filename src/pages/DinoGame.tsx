import { useEffect, useRef, useState } from "react";
import { Button, Center, Text, Group, Card } from "@mantine/core";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 180;
const GROUND_Y = 150;
const DINO_SIZE = 32;
const OBSTACLE_WIDTH = 16;
const OBSTACLE_HEIGHT = 36;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -13;
const OBSTACLE_SPEED = 6;

function getRandomGap() {
  return 300 + Math.random() * 200;
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('dinoHighScore') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);

  // Game state
  const dino = useRef({ y: GROUND_Y, vy: 0 });
  const obstacles = useRef<{ x: number }[]>([]);
  const frame = useRef(0);

  // Handle jump
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.code === 'Space' || e.key === ' ') && !jumping && running && !gameOver) {
        dino.current.vy = JUMP_VELOCITY;
        setJumping(true);
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
      // Obstacles
      if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < GAME_WIDTH - getRandomGap()) {
        obstacles.current.push({ x: GAME_WIDTH });
      }
      for (const obs of obstacles.current) {
        obs.x -= OBSTACLE_SPEED;
      }
      // Remove off-screen
      if (obstacles.current[0]?.x < -OBSTACLE_WIDTH) {
        obstacles.current.shift();
        setScore((s) => s + 1);
      }
      // Collision
      for (const obs of obstacles.current) {
        if (
          obs.x < 40 + DINO_SIZE &&
          obs.x + OBSTACLE_WIDTH > 40 &&
          dino.current.y + DINO_SIZE > GROUND_Y - OBSTACLE_HEIGHT
        ) {
          setGameOver(true);
          setRunning(false);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('dinoHighScore', String(score));
          }
          return;
        }
      }
      draw();
      if (!gameOver) animation = requestAnimationFrame(loop);
    }
    function draw() {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Ground
      ctx.fillStyle = '#888';
      ctx.fillRect(0, GROUND_Y + DINO_SIZE, GAME_WIDTH, 4);
      // Dino
      ctx.fillStyle = '#222';
      ctx.fillRect(40, dino.current.y, DINO_SIZE, DINO_SIZE);
      // Obstacles
      ctx.fillStyle = '#0ca678';
      for (const obs of obstacles.current) {
        ctx.fillRect(obs.x, GROUND_Y + DINO_SIZE - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
      }
      // Score
      ctx.fillStyle = '#222';
      ctx.font = '16px monospace';
      ctx.fillText('Score: ' + score, GAME_WIDTH - 120, 24);
      ctx.fillText('High: ' + highScore, GAME_WIDTH - 120, 44);
      if (gameOver) {
        ctx.fillStyle = '#e8590c';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2);
        ctx.font = '16px monospace';
        ctx.fillStyle = '#222';
        ctx.fillText('Press Space to restart', GAME_WIDTH / 2 - 90, GAME_HEIGHT / 2 + 30);
      }
    }
    loop();
    return () => cancelAnimationFrame(animation);
    // eslint-disable-next-line
  }, [running]);

  function start() {
    setScore(0);
    setGameOver(false);
    dino.current = { y: GROUND_Y, vy: 0 };
    obstacles.current = [];
    frame.current = 0;
    setRunning(true);
  }
  function restart() {
    start();
  }

  return (
    <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <Card shadow="md" p="lg" radius="md" withBorder style={{ background: '#f8fafc' }}>
        <Text size="xl" weight={700} mb="md">Jeu du dinosaure</Text>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ border: '2px solid #222', background: '#fff', borderRadius: 8 }}
        />
        <Group mt="md" position="center">
          {!running && !gameOver && (
            <Button onClick={start}>Démarrer</Button>
          )}
          {gameOver && (
            <Button onClick={restart}>Rejouer</Button>
          )}
        </Group>
        <Text size="sm" color="dimmed" mt="md">Espace = Sauter / Rejouer</Text>
      </Card>
    </Center>
  );
} 