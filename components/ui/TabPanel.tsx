"use client";

import { useState, type ReactNode, type ReactElement } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { MOBILE_TAB_HEIGHT } from "@/lib/constants/mobileDesign";

interface TabDefinition {
  /**
   * Tab label text
   */
  label: string;
  /**
   * Optional icon to display before label
   */
  icon?: ReactElement;
  /**
   * Tab content
   */
  content: ReactNode;
  /**
   * Optional badge count
   */
  badge?: number;
}

interface TabPanelProps {
  /**
   * Array of tab definitions
   */
  tabs: TabDefinition[];
  /**
   * Initial active tab index
   * @default 0
   */
  initialTab?: number;
  /**
   * Callback when tab changes
   */
  onChange?: (tabIndex: number) => void;
  /**
   * Custom styles for container
   */
  sx?: Record<string, any>;
}

/**
 * TabPanel Component
 *
 * Generic tab panel component with smooth transitions.
 * Mobile-first with full-width tabs.
 *
 * Features:
 * - Smooth tab transitions
 * - Optional icons and badges
 * - Mobile-optimized touch targets
 * - Brand color indicators
 *
 * @example
 * ```tsx
 * <TabPanel
 *   tabs={[
 *     {
 *       label: "Chat",
 *       icon: <ChatBubbleOutline />,
 *       content: <ChatWindow />,
 *       badge: 3
 *     },
 *     {
 *       label: "Detalles",
 *       icon: <InfoOutlined />,
 *       content: <TripDetails />
 *     }
 *   ]}
 *   initialTab={0}
 *   onChange={(index) => console.log('Tab changed to', index)}
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
      {/* Tab Headers */}
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="fullWidth"
        sx={{
          minHeight: MOBILE_TAB_HEIGHT,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          mb: 2,
        }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{
              minHeight: MOBILE_TAB_HEIGHT,
              py: 1.5,
              transition: "all 0.2s ease-in-out",
            }}
          />
        ))}
      </Tabs>

      {/* Tab Content Panels */}
      {tabs.map((tab, index) => (
        <Box
          key={index}
          role="tabpanel"
          hidden={activeTab !== index}
          sx={{
            opacity: activeTab === index ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          {activeTab === index && <Box sx={{ p: 0 }}>{tab.content}</Box>}
        </Box>
      ))}
    </Box>
  );
}
