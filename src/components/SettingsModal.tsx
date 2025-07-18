import { Modal, Group, Text, Select, Switch, Button, Stack, Divider, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useState } from 'react';

interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

const FONT_SIZES = [
  { value: 'sm', label: 'Petite' },
  { value: 'md', label: 'Normale' },
  { value: 'lg', label: 'Grande' },
];

export default function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [fontSize, setFontSize] = useState('md');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Pour la démo, on ne persiste pas encore ces prefs

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={700} size="lg">Paramètres</Text>} centered size="sm" radius="lg">
      <Stack gap="md">
        <Text fw={600} size="md">Apparence</Text>
        <Group>
          <Text size="sm" style={{ minWidth: 90 }}>Thème</Text>
          <Select
            data={[
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
              { value: 'auto', label: 'Auto' },
            ]}
            value={computedColorScheme}
            onChange={v => v && setColorScheme(v === 'auto' ? 'auto' : v)}
            size="sm"
            style={{ minWidth: 120 }}
          />
        </Group>
        <Group>
          <Text size="sm" style={{ minWidth: 90 }}>Police</Text>
          <Select
            data={FONT_SIZES}
            value={fontSize}
            onChange={v => v && setFontSize(v)}
            size="sm"
            style={{ minWidth: 120 }}
          />
        </Group>
        <Divider my="xs" label={<Text size="sm" fw={500}>Accessibilité</Text>} labelPosition="center" />
        <Group>
          <Switch
            label="Contraste élevé"
            checked={highContrast}
            onChange={e => setHighContrast(e.currentTarget.checked)}
            size="md"
          />
          <Switch
            label="Réduire les animations"
            checked={reduceMotion}
            onChange={e => setReduceMotion(e.currentTarget.checked)}
            size="md"
          />
        </Group>
        <Divider my="xs" />
        <Button color="red" variant="outline" fullWidth onClick={() => {
          if (window.confirm('Remettre toutes les cartes en "à revoir" ?')) {
            localStorage.setItem('flashcard-study-status', '{}');
            window.location.reload();
          }
        }}>
          Réinitialiser la progression
        </Button>
      </Stack>
    </Modal>
  );
} 