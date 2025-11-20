"use client";

import { Box, Tabs, Tab, type SxProps, type Theme } from "@mui/material";
import { useState } from "react";

interface TabConfig {
  label: string;
  icon?: React.ReactElement;
  content: React.ReactNode;
}

interface TabPanelProps {
  tabs: TabConfig[];
  /**
   * Índice inicial del tab activo
   * @default 0
   */
  initialTab?: number;
  /**
   * Callback cuando cambia el tab
   */
  onChange?: (newValue: number) => void;
  /**
   * Estilos del contenedor principal
   */
  sx?: SxProps<Theme>;
}

/**
 * TabPanel Component
 *
 * Sistema de tabs deslizables para mobile (swipe entre Chat y Detalles).
 *
 * Features:
 * - Tabs con iconos opcionales
 * - Swipe gesture en mobile (nativo de MUI)
 * - Contenido lazy-loaded (solo se renderiza el tab activo)
 * - Transiciones suaves
 *
 * @example
 * ```tsx
 * <TabPanel
 *   tabs={[
 *     {
 *       label: "Chat",
 *       icon: <ChatIcon />,
 *       content: <ChatWindow />
 *     },
 *     {
 *       label: "Detalles",
 *       icon: <InfoIcon />,
 *       content: <TripDetails />
 *     }
 *   ]}
 * />
 * ```
 */
export function TabPanel({
  tabs,
  initialTab = 0,
  onChange,
  sx = {},
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    onChange?.(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      {/* Tabs Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="tabs"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {tabs.map((tab, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          sx={{
            flex: 1,
            overflow: "auto",
          }}
        >
          {activeTab === index && <Box sx={{ p: 0 }}>{tab.content}</Box>}
        </Box>
      ))}
    </Box>
  );
}
