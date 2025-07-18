import { useEffect, useRef, useState } from "react";
import { Button, Center, Text, Group, Card, Switch, Tooltip } from "@mantine/core";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 180;
const GROUND_Y = 150;
const DINO_W = 36;
const DINO_H = 32;
const OBSTACLE_WIDTH = 16;
const OBSTACLE_HEIGHT = 36;
const BIRD_WIDTH = 28;
const BIRD_HEIGHT = 18;
const GRAVITY = 0.9;
const JUMP_VELOCITY = -13;
// Vitesse de base plus lente
const BASE_OBSTACLE_SPEED = 1.5;
const BASE_BIRD_SPEED = 2.0;
const CLOUD_SPEED = 1.2;
const CLOUDS = 3;
const FIRE_SPEED = 8;

function getRandomGap() {
  return 300 + Math.random() * 200;
}
function getRandomBirdY() {
  return [GROUND_Y - 40, GROUND_Y - 60, GROUND_Y - 20][Math.floor(Math.random() * 3)];
}
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
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, duration);
  } catch {}
}
function playFireSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 400;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.13;
    o.start();
    setTimeout(() => {
      o.frequency.value = 200;
    }, 60);
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 120);
  } catch {}
}

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('dinoHighScore') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [night, setNight] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [flash, setFlash] = useState(false);
  const [fireballs, setFireballs] = useState<{ x: number; y: number }[]>([]);
  const [canFire, setCanFire] = useState(true);

  // Game state
  const dino = useRef({ y: GROUND_Y, vy: 0, anim: 0 });
  const obstacles = useRef<{ x: number }[]>([]);
  const birds = useRef<{ x: number; y: number }[]>([]);
  const clouds = useRef<{ x: number, y: number }[]>([]);
  const frame = useRef(0);

  // Clouds init
  useEffect(() => {
    clouds.current = Array.from({ length: CLOUDS }, () => ({
      x: Math.random() * GAME_WIDTH,
      y: 20 + Math.random() * 40,
    }));
  }, []);

  // Handle jump & fire
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
      if ((e.code === 'ArrowUp' || e.key === 'ArrowUp') && running && !gameOver && canFire) {
        fire();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jumping, running, gameOver, canFire]);

  // Touch for mobile
  useEffect(() => {
    if (!mobile) return;
    function onTouch(e: TouchEvent) {
      if (!jumping && running && !gameOver) {
        dino.current.vy = JUMP_VELOCITY;
        setJumping(true);
        playBeep(700, 80);
      }
      if (gameOver) {
        restart();
      }
    }
    window.addEventListener('touchstart', onTouch);
    return () => window.removeEventListener('touchstart', onTouch);
  }, [jumping, running, gameOver, mobile]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    let animation: number;
    function loop() {
      frame.current++;
      // Vitesse progressive (augmente très lentement avec le score)
      const speed = BASE_OBSTACLE_SPEED + Math.min(score, 100) * 0.01;
      const birdSpeed = BASE_BIRD_SPEED + Math.min(score, 100) * 0.01;
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
      if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < GAME_WIDTH - getRandomGap()) {
        obstacles.current.push({ x: GAME_WIDTH });
      }
      for (const obs of obstacles.current) {
        obs.x -= speed;
      }
      // Birds
      if (birds.current.length === 0 || (birds.current[birds.current.length - 1].x < GAME_WIDTH - 400 && Math.random() < 0.01)) {
        birds.current.push({ x: GAME_WIDTH, y: getRandomBirdY() });
      }
      for (const bird of birds.current) {
        bird.x -= birdSpeed;
      }
      // Remove off-screen
      if (obstacles.current[0]?.x < -OBSTACLE_WIDTH) {
        obstacles.current.shift();
        setScore((s) => s + 1);
      }
      if (birds.current[0]?.x < -BIRD_WIDTH) {
        birds.current.shift();
        setScore((s) => s + 2);
      }
      // Fireballs
      setFireballs((prev) => prev.filter((b) => b.x < GAME_WIDTH + 40).map((b) => ({ ...b, x: b.x + FIRE_SPEED })));
      // Collision
      let collision = false;
      for (const obs of obstacles.current) {
        if (
          obs.x < 40 + DINO_W &&
          obs.x + OBSTACLE_WIDTH > 40 &&
          dino.current.y + DINO_H > GROUND_Y - OBSTACLE_HEIGHT
        ) {
          collision = true;
        }
      }
      for (const bird of birds.current) {
        if (
          bird.x < 40 + DINO_W &&
          bird.x + BIRD_WIDTH > 40 &&
          dino.current.y + DINO_H > bird.y &&
          dino.current.y < bird.y + BIRD_HEIGHT
        ) {
          collision = true;
        }
      }
      if (collision) {
        setGameOver(true);
        setRunning(false);
        setFlash(true);
        playBeep(200, 200);
        setTimeout(() => setFlash(false), 120);
        setHighScore((prev) => {
          if (score > prev) {
            localStorage.setItem('dinoHighScore', String(score));
            return score;
          }
          return prev;
        });
        return;
      }
      // Fireball collision (obstacles)
      setFireballs((prev) => {
        let newBalls = [...prev];
        obstacles.current = obstacles.current.filter((obs) => {
          for (const b of prev) {
            if (
              b.x + 12 > obs.x &&
              b.x < obs.x + OBSTACLE_WIDTH &&
              b.y > GROUND_Y + DINO_H - OBSTACLE_HEIGHT - 10
            ) {
              newBalls = newBalls.filter((fb) => fb !== b);
              return false; // obstacle détruit
            }
          }
          return true;
        });
        birds.current = birds.current.filter((bird) => {
          for (const b of prev) {
            if (
              b.x + 12 > bird.x &&
              b.x < bird.x + BIRD_WIDTH &&
              b.y > bird.y &&
              b.y < bird.y + BIRD_HEIGHT
            ) {
              newBalls = newBalls.filter((fb) => fb !== b);
              return false; // oiseau détruit
            }
          }
          return true;
        });
        return newBalls;
      });
      // Clouds
      for (const c of clouds.current) {
        c.x -= CLOUD_SPEED;
        if (c.x < -60) {
          c.x = GAME_WIDTH + Math.random() * 100;
          c.y = 20 + Math.random() * 40;
        }
      }
      draw();
      if (!gameOver) animation = requestAnimationFrame(loop);
    }
    function draw() {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      // Background
      ctx.fillStyle = night ? '#222' : '#f8fafc';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Clouds
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = night ? '#fff' : '#bbb';
      for (const c of clouds.current) {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 30, 12, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Ground
      ctx.fillStyle = night ? '#aaa' : '#888';
      ctx.fillRect(0, GROUND_Y + DINO_H, GAME_WIDTH, 4);
      // Dino (pixel art)
      ctx.save();
      ctx.translate(40, dino.current.y);
      // Corps
      ctx.fillStyle = flash ? '#e8590c' : (jumping ? '#fab005' : night ? '#fff' : '#222');
      ctx.fillRect(0, 8, 24, 16); // corps
      ctx.fillRect(20, 16, 12, 8); // queue
      ctx.fillRect(8, 0, 12, 12); // tête
      // Œil
      ctx.fillStyle = night ? '#222' : '#fff';
      ctx.beginPath();
      ctx.arc(16, 6, 2, 0, 2 * Math.PI);
      ctx.fill();
      // Pattes (animation)
      ctx.strokeStyle = night ? '#fff' : '#222';
      ctx.lineWidth = 3;
      ctx.beginPath();
      if (dino.current.y === GROUND_Y) {
        if (dino.current.anim === 0) {
          ctx.moveTo(6, 24); ctx.lineTo(6, 32);
          ctx.moveTo(18, 24); ctx.lineTo(18, 30);
        } else {
          ctx.moveTo(12, 24); ctx.lineTo(12, 32);
          ctx.moveTo(24, 24); ctx.lineTo(24, 30);
        }
        ctx.stroke();
      }
      ctx.restore();
      // Obstacles
      ctx.fillStyle = night ? '#0ca678' : '#0ca678';
      for (const obs of obstacles.current) {
        ctx.fillRect(obs.x, GROUND_Y + DINO_H - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
      }
      // Birds
      ctx.fillStyle = '#228be6';
      for (const bird of birds.current) {
        ctx.save();
        ctx.translate(bird.x, bird.y);
        // Corps
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 7, 0, 0, 2 * Math.PI);
        ctx.fill();
        // Aile
        ctx.beginPath();
        ctx.ellipse(-4, 0, 5, 3, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#4dabf7';
        ctx.fill();
        // Bec
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(16, 2);
        ctx.lineTo(12, 4);
        ctx.closePath();
        ctx.fillStyle = '#fab005';
        ctx.fill();
        ctx.restore();
      }
      // Fireballs
      for (const b of fireballs) {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'orange';
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }
      // Score
      ctx.fillStyle = night ? '#fff' : '#222';
      ctx.font = '16px monospace';
      ctx.fillText('Score: ' + score, GAME_WIDTH - 120, 24);
      ctx.fillText('High: ' + highScore, GAME_WIDTH - 120, 44);
      if (gameOver) {
        ctx.fillStyle = '#e8590c';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('GAME OVER', GAME_WIDTH / 2 - 80, GAME_HEIGHT / 2);
        ctx.font = '16px monospace';
        ctx.fillStyle = night ? '#fff' : '#222';
        ctx.fillText('Press Space/tap to restart', GAME_WIDTH / 2 - 110, GAME_HEIGHT / 2 + 30);
      }
    }
    loop();
    return () => cancelAnimationFrame(animation);
    // eslint-disable-next-line
  }, [running, night, score, gameOver, flash, fireballs]);

  function start() {
    setScore(0);
    setGameOver(false);
    dino.current = { y: GROUND_Y, vy: 0, anim: 0 };
    obstacles.current = [];
    birds.current = [];
    frame.current = 0;
    setRunning(true);
    setFlash(false);
    setFireballs([]);
    setCanFire(true);
  }
  function restart() {
    start();
  }
  function resetHigh() {
    setHighScore(0);
    localStorage.setItem('dinoHighScore', '0');
  }
  function fire() {
    if (!canFire || gameOver || !running) return;
    setFireballs((prev) => [...prev, { x: 40 + DINO_W, y: dino.current.y + 16 }]);
    setCanFire(false);
    playFireSound();
    setTimeout(() => setCanFire(true), 400); // cooldown
  }

  return (
    <Center style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <Card shadow="md" p="lg" radius="md" withBorder style={{ background: night ? '#222' : '#f8fafc' }}>
        <Group position="apart" mb="md">
          <Text size="xl" weight={700}>Jeu du dinosaure</Text>
          <Switch label="Mode nuit" checked={night} onChange={e => setNight(e.currentTarget.checked)} />
        </Group>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{ border: '2px solid #222', background: night ? '#222' : '#fff', borderRadius: 8, touchAction: 'manipulation' }}
        />
        <Group mt="md" position="center">
          {!running && !gameOver && (
            <Button onClick={start}>Démarrer</Button>
          )}
          {gameOver && (
            <Button onClick={restart}>Rejouer</Button>
          )}
          <Button variant="light" color="red" onClick={resetHigh}>Reset High Score</Button>
          <Switch label="Mobile" checked={mobile} onChange={e => setMobile(e.currentTarget.checked)} />
          <Tooltip label="Cracher du feu (flèche haut)"><Button onClick={fire} disabled={!canFire || !running || gameOver} color="orange">🔥 Cracher du feu</Button></Tooltip>
        </Group>
        <Text size="sm" color="dimmed" mt="md">Espace ou tap = Sauter / Rejouer &nbsp;|&nbsp; Flèche haut ou bouton = Cracher du feu</Text>
      </Card>
    </Center>
  );
} 