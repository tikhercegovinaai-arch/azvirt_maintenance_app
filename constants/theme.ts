/**
 * AZVIRT Construction Theme Colors
 * Inspired by the AZVIRT 35 years anniversary safety helmet image
 * Primary: Orange (#FF9500) - Safety and visibility
 * Secondary: Blue (#0066CC) - Trust and professionalism
 */

import { Platform } from "react-native";

// AZVIRT Construction Theme Colors
const tintColorLight = "#FF9500"; // Orange - Primary color
const tintColorDark = "#FF9500"; // Orange for dark mode
const secondaryColor = "#0066CC"; // Blue - Secondary color

export const Colors = {
  light: {
    text: "#1a1a1a",
    background: "rgba(255, 255, 255, 0.95)",
    tint: "#FF9500", // Orange primary
    secondary: "#0066CC", // Blue secondary
    icon: "#666666",
    tabIconDefault: "#999999",
    tabIconSelected: "#FF9500",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    cardBackground: "rgba(255, 255, 255, 0.9)",
    borderColor: "#E0E0E0",
  },
  dark: {
    text: "#ECEDEE",
    background: "rgba(21, 23, 24, 0.95)",
    tint: "#FF9500",
    secondary: "#66B3FF",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#FF9500",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    cardBackground: "rgba(50, 52, 53, 0.9)",
    borderColor: "#404040",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
