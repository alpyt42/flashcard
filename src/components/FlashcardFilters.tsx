import { useState } from "react";
import { Box, Paper, Select, Text, ActionIcon, Group, Collapse, useMantineTheme } from "@mantine/core";
import { IconFilter, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { SearchBar } from "./SearchBar";
import { DateRangeFilter } from "./DateRangeFilter";

interface FlashcardFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  themeFilter: string | null;
  onThemeFilterChange: (v: string | null) => void;
  themes: string[];
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (v: [Date | null, Date | null]) => void;
}

export function FlashcardFilters({
  search,
  onSearchChange,
  themeFilter,
  onThemeFilterChange,
  themes,
  dateRange,
  onDateRangeChange,
}: FlashcardFiltersProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const isFiltered = search || (themeFilter && themeFilter !== 'Tous') || (dateRange[0] && dateRange[1]);
  const handleReset = () => {
    onSearchChange("");
    onThemeFilterChange(null);
    onDateRangeChange([null, null]);
  };
  return (
    <Paper
      shadow="md"
      p="0"
      radius="xl"
      withBorder
      style={{
        marginBottom: 32,
        background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#fafdff',
        maxWidth: 900,
        marginLeft: 'auto',
        marginRight: 'auto',
        transition: 'box-shadow 0.2s',
      }}
    >
      <Group
        align="center"
        gap={8}
        style={{ minWidth: 120, cursor: 'pointer', padding: '20px 24px', userSelect: 'none' }}
        onClick={() => setOpened((o) => !o)}
        aria-label="Ouvrir ou fermer les filtres"
      >
        <IconFilter size={22} color={theme.colors.blue[6]} aria-label="Filtres" />
        <Text fw={600} size="md" style={{ letterSpacing: 0.5 }}>Filtres</Text>
        <Box style={{ flex: 1 }} />
        {opened ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
      </Group>
      <Collapse in={opened} transitionDuration={180}>
        <Box
          sx={(t) => ({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 24,
            padding: '20px 24px 16px 24px',
            [t.fn.smallerThan('sm')]: {
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 16,
            },
          })}
        >
          <Box style={{ flex: 2, minWidth: 180, maxWidth: 320 }}>
            <SearchBar
              value={search}
              onChange={onSearchChange}
              placeholder="Rechercher une carte..."
              style={{ width: '100%' }}
              aria-label="Recherche"
            />
          </Box>
          <Box style={{ flex: 1, minWidth: 120, maxWidth: 180 }}>
            <Select
              data={["Tous", ...themes]}
              value={themeFilter || "Tous"}
              onChange={onThemeFilterChange}
              size="sm"
              clearable={false}
              label={<Text size="xs" fw={500} style={{ color: theme.colors.gray[7] }}>Thème</Text>}
              aria-label="Filtrer par thème"
              styles={{
                label: { marginBottom: 2, marginLeft: 2 },
              }}
            />
          </Box>
          <Box style={{ flex: 2, minWidth: 180, maxWidth: 260 }}>
            <DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
          </Box>
          <ActionIcon
            variant={isFiltered ? "filled" : "light"}
            color="gray"
            size={36}
            onClick={handleReset}
            aria-label="Réinitialiser les filtres"
            style={{ marginLeft: 'auto', transition: 'background 0.2s' }}
            disabled={!isFiltered}
          >
            <IconX size={20} />
          </ActionIcon>
        </Box>
      </Collapse>
    </Paper>
  );
} 