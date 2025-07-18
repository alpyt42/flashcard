import { useState } from 'react';
import { Box, Paper, Text, Button, Group, Textarea, FileButton, Stack, Loader, Notification } from '@mantine/core';
import { IconUpload, IconWand, IconCheck, IconX } from '@tabler/icons-react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Désactive le worker pour Vite
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

export default function IAImport() {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extraction texte PDF
  async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text;
  }

  // Simule la génération IA (à remplacer par appel API réel)
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      // Simule 2 cartes générées
      setGenerated([
        {
          question: 'Qu’est-ce que l’énergie cinétique ?',
          answer: 'E = 1/2 m v^2',
          keywords: ['énergie', 'cinétique', 'physique'],
          theme: 'Physique',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        },
        {
          question: 'Définition de la constante de gravitation universelle G',
          answer: 'G ≈ 6,674 × 10⁻¹¹ N·m²/kg²',
          keywords: ['gravitation', 'constante', 'physique'],
          theme: 'Physique',
          image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
        },
      ]);
      setLoading(false);
    }, 1800);
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setLoading(true);
      try {
        const text = await extractTextFromPDF(file);
        setInput(text);
      } catch (e) {
        setError('Erreur lors de la lecture du PDF');
      }
      setLoading(false);
    } else {
      const text = await file.text();
      setInput(text);
    }
  };

  return (
    <Box style={{ minHeight: '100vh', background: '#f8fafc', width: '100%' }}>
      <Paper shadow="md" p="xl" radius="xl" withBorder style={{ maxWidth: 600, margin: '32px auto' }}>
        <Text size="xl" fw={700} mb="md" align="center">
          Création assistée par IA
        </Text>
        <Text size="sm" color="dimmed" mb="md" align="center">
          Générez des cartes à partir d’un PDF ou d’un copier-coller de cours. Suggestions automatiques de mots-clés, thèmes, images libres de droits.
        </Text>
        <Stack gap="md">
          <Group>
            <FileButton onChange={handleFile} accept=".pdf,.txt">
              {(props) => (
                <Button leftSection={<IconUpload size={18} />} variant="light" {...props}>
                  Importer PDF/TXT
                </Button>
              )}
            </FileButton>
            <Text size="xs" color="dimmed">{fileName}</Text>
          </Group>
          <Textarea
            minRows={6}
            maxRows={12}
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            placeholder="Collez ici votre cours ou texte à transformer en cartes..."
            autosize
          />
          <Button
            leftSection={<IconWand size={18} />}
            onClick={handleGenerate}
            loading={loading}
            disabled={!input.trim() || loading}
            fullWidth
            size="md"
            radius="xl"
          >
            Générer les cartes
          </Button>
          {error && <Notification color="red" icon={<IconX />}>{error}</Notification>}
          {loading && <Loader mt="md" />}
          {generated.length > 0 && (
            <Box mt="md">
              <Text fw={600} mb={8}>Aperçu des cartes générées :</Text>
              <Stack gap="sm">
                {generated.map((card, i) => (
                  <Paper key={i} shadow="xs" p="md" radius="md" withBorder>
                    <Group align="flex-start" gap={16}>
                      {card.image && <img src={card.image} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
                      <Box>
                        <Text fw={600}>{card.question}</Text>
                        <Text size="sm" color="dimmed">{card.answer}</Text>
                        <Text size="xs" color="blue.7">Thème : {card.theme}</Text>
                        <Text size="xs" color="gray.7">Mots-clés : {card.keywords.join(', ')}</Text>
                      </Box>
                    </Group>
                  </Paper>
                ))}
              </Stack>
              <Button mt="md" leftSection={<IconCheck size={18} />} color="teal" fullWidth radius="xl">
                Ajouter ces cartes à ma collection
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
} 