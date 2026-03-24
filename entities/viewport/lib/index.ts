import type { Viewport, DeviceCategory } from "@shared/types";

export const VIEWPORT_PRESETS: Viewport[] = [
  // Phone
  {
    id: "iphone-16-pro",
    label: "iPhone 16 Pro",
    width: 393,
    height: 852,
    category: "phone",
  },
  {
    id: "iphone-16-pro-max",
    label: "iPhone 16 Pro Max",
    width: 430,
    height: 932,
    category: "phone",
  },
  {
    id: "iphone-se",
    label: "iPhone SE",
    width: 375,
    height: 667,
    category: "phone",
  },
  {
    id: "galaxy-s24",
    label: "Galaxy S24",
    width: 360,
    height: 780,
    category: "phone",
  },
  {
    id: "galaxy-s24-ultra",
    label: "Galaxy S24 Ultra",
    width: 412,
    height: 915,
    category: "phone",
  },
  {
    id: "pixel-9",
    label: "Pixel 9",
    width: 412,
    height: 923,
    category: "phone",
  },

  // Tablet
  {
    id: "ipad-pro-13",
    label: 'iPad Pro 13"',
    width: 1032,
    height: 1376,
    category: "tablet",
  },
  {
    id: "ipad-pro-11",
    label: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    category: "tablet",
  },
  {
    id: "ipad-mini",
    label: "iPad Mini",
    width: 744,
    height: 1133,
    category: "tablet",
  },
  {
    id: "galaxy-tab-s9",
    label: "Galaxy Tab S9",
    width: 753,
    height: 1205,
    category: "tablet",
  },

  // Desktop
  {
    id: "desktop-fhd",
    label: "Desktop (FHD)",
    width: 1920,
    height: 1080,
    category: "desktop",
  },
  {
    id: "desktop-qhd",
    label: "Desktop (QHD)",
    width: 2560,
    height: 1440,
    category: "desktop",
  },
  {
    id: "macbook-pro-16",
    label: 'MacBook Pro 16"',
    width: 1728,
    height: 1117,
    category: "desktop",
  },
  {
    id: "macbook-air-13",
    label: 'MacBook Air 13"',
    width: 1470,
    height: 956,
    category: "desktop",
  },
];

export const CATEGORY_ORDER: DeviceCategory[] = [
  "phone",
  "tablet",
  "desktop",
  "custom",
];

export const CATEGORY_LABELS: Record<DeviceCategory, string> = {
  phone: "Phone",
  tablet: "Tablet",
  desktop: "Desktop",
  custom: "Custom",
};

export function groupPresetsByCategory(
  presets: Viewport[],
): Record<DeviceCategory, Viewport[]> {
  const groups: Record<DeviceCategory, Viewport[]> = {
    phone: [],
    tablet: [],
    desktop: [],
    custom: [],
  };

  for (const p of presets) {
    const cat = p.category ?? "custom";
    groups[cat].push(p);
  }

  return groups;
}
