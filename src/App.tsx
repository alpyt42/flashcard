import { useState } from 'react';
import {
  MantineProvider,
  AppShell,
  Group,
  Button,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Center,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Study from './pages/Study';
import Test from './pages/Test';
import Whiteboard3D from './pages/Whiteboard3D';
import DinoGame from './pages/DinoGame';

function DarkModeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  useHotkeys([
    ['mod+J', () => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')],
  ]);
  return (
    <ActionIcon
      variant="outline"
      color={computedColorScheme === 'dark' ? 'yellow' : 'blue'}
      onClick={() => setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')}
      title="Toggle color scheme"
    >
      {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}

function Navigation() {
  const location = useLocation();
  return (
    <Group>
      <Button component={Link} to="/" variant={location.pathname === '/' ? 'filled' : 'subtle'}>Cards</Button>
      <Button component={Link} to="/study" variant={location.pathname === '/study' ? 'filled' : 'subtle'}>Study</Button>
      <Button component={Link} to="/test" variant={location.pathname === '/test' ? 'filled' : 'subtle'}>Test</Button>
      <Button component={Link} to="/whiteboard" variant={location.pathname === '/whiteboard' ? 'filled' : 'subtle'}>3D Whiteboard</Button>
      <Button component={Link} to="/dino" variant={location.pathname === '/dino' ? 'filled' : 'subtle'}>Dino</Button>
    </Group>
  );
}

export default function App() {
  return (
    <MantineProvider defaultColorScheme="auto">
      <BrowserRouter>
        <AppShell header={{ height: 50 }} padding="md">
          <AppShell.Header>
            <Group justify="space-between"><Navigation /><DarkModeToggle /></Group>
          </AppShell.Header>
          <AppShell.Main>
            <Center style={{ minHeight: '100vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/study" element={<Study />} />
                <Route path="/test" element={<Test />} />
                <Route path="/whiteboard" element={<Whiteboard3D />} />
                <Route path="/dino" element={<DinoGame />} />
              </Routes>
            </Center>
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
}
