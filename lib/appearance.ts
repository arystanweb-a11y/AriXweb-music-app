export type Locale = "ru" | "en";
export type ThemeId = "space" | "dark" | "light" | "cyberpunk" | "nature" | "mono" | "solid";

export type ThemePreset = {
  id: ThemeId;
  label: string;
  labelEn: string;
  page: string;
  surface: string;
  text: string;
  muted: string;
  line: string;
  accent: string;
  accentContrast: string;
  success: string;
  background: string;
  aurora: string;
  colorScheme: "dark" | "light";
};

export const themePresets: ThemePreset[] = [
  {
    id: "space", label: "Космос", labelEn: "Space", page: "#060914", surface: "rgba(15, 21, 37, .92)", text: "#f2f5fb", muted: "#9ca6ba", line: "rgba(174, 194, 220, .15)", accent: "#a9f5ce", accentContrast: "#07130f", success: "#a9f5ce", colorScheme: "dark",
    background: "radial-gradient(ellipse 48% 33% at 3% 19%, rgba(34,236,177,.2), transparent 74%), radial-gradient(ellipse 39% 31% at 91% 7%, rgba(107,78,231,.19), transparent 72%), radial-gradient(ellipse 52% 35% at 89% 54%, rgba(24,174,204,.13), transparent 73%), linear-gradient(155deg,#080d1d 0%,#070b16 48%,#080b18 100%)",
    aurora: "conic-gradient(from 215deg at 25% 30%,transparent 0 29%,rgba(38,230,169,.13) 34%,rgba(81,139,240,.1) 38%,transparent 44% 100%), conic-gradient(from 25deg at 74% 44%,transparent 0 34%,rgba(137,93,255,.13) 39%,rgba(39,221,184,.11) 44%,transparent 51% 100%)",
  },
  {
    id: "dark", label: "Тёмная", labelEn: "Dark", page: "#101114", surface: "rgba(29, 30, 34, .95)", text: "#f4f4f5", muted: "#a0a1a6", line: "rgba(220, 220, 230, .13)", accent: "#c5f36a", accentContrast: "#11150a", success: "#b3e975", colorScheme: "dark",
    background: "linear-gradient(145deg,#141518,#0f1013 70%,#17181b)", aurora: "none",
  },
  {
    id: "light", label: "Светлая", labelEn: "Light", page: "#f3f5f6", surface: "rgba(255, 255, 255, .94)", text: "#151a1c", muted: "#6c7478", line: "rgba(35, 50, 55, .12)", accent: "#59c99a", accentContrast: "#061c13", success: "#188354", colorScheme: "light",
    background: "radial-gradient(ellipse at 85% 10%,rgba(114,219,184,.18),transparent 40%),linear-gradient(145deg,#f5f7f7,#edf2f3)", aurora: "none",
  },
  {
    id: "cyberpunk", label: "Киберпанк", labelEn: "Cyberpunk", page: "#100821", surface: "rgba(28, 15, 48, .94)", text: "#faf3ff", muted: "#c2a9d4", line: "rgba(225, 165, 255, .19)", accent: "#fb62de", accentContrast: "#26051c", success: "#76f4dd", colorScheme: "dark",
    background: "radial-gradient(ellipse 48% 36% at 8% 16%,rgba(247,54,214,.24),transparent 74%),radial-gradient(ellipse 48% 42% at 92% 45%,rgba(57,73,238,.25),transparent 70%),linear-gradient(155deg,#100821,#090716)", aurora: "conic-gradient(from 210deg at 25% 35%,transparent 0 30%,rgba(255,61,219,.16) 36%,rgba(73,97,255,.15) 43%,transparent 49% 100%)",
  },
  {
    id: "nature", label: "Природа", labelEn: "Nature", page: "#071710", surface: "rgba(14, 34, 25, .94)", text: "#eef8f0", muted: "#a3bdab", line: "rgba(166, 221, 183, .16)", accent: "#a7e483", accentContrast: "#10200b", success: "#a7e483", colorScheme: "dark",
    background: "radial-gradient(ellipse 50% 35% at 5% 12%,rgba(57,177,107,.22),transparent 74%),radial-gradient(ellipse 45% 40% at 92% 60%,rgba(61,153,131,.18),transparent 73%),linear-gradient(150deg,#0d2116,#07140f)", aurora: "conic-gradient(from 205deg at 22% 35%,transparent 0 30%,rgba(92,222,146,.15) 38%,rgba(33,156,138,.12) 45%,transparent 51% 100%)",
  },
  {
    id: "mono", label: "Монохром", labelEn: "Monochrome", page: "#090909", surface: "rgba(25, 25, 25, .95)", text: "#f5f5f5", muted: "#a4a4a4", line: "rgba(255, 255, 255, .14)", accent: "#f4f4f4", accentContrast: "#111111", success: "#d4d4d4", colorScheme: "dark",
    background: "linear-gradient(145deg,#161616,#080808 72%,#101010)", aurora: "none",
  },
  {
    id: "solid", label: "Однотонная", labelEn: "Solid", page: "#16191d", surface: "#20242a", text: "#f2f5fb", muted: "#a0a7b2", line: "rgba(220,220,230,.14)", accent: "#a9f5ce", accentContrast: "#07130f", success: "#a9f5ce", colorScheme: "dark",
    background: "linear-gradient(145deg,#16191d,#16191d)", aurora: "none",
  },
];

export const fontCatalog = [
  { id: "inter", label: "Inter", family: "Inter Variable" },
  { id: "roboto", label: "Roboto", family: "Roboto Variable" },
  { id: "open-sans", label: "Open Sans", family: "Open Sans Variable" },
  { id: "montserrat", label: "Montserrat", family: "Montserrat Variable" },
  { id: "noto-sans", label: "Noto Sans", family: "Noto Sans Variable" },
  { id: "source-sans-3", label: "Source Sans 3", family: "Source Sans 3 Variable" },
  { id: "nunito", label: "Nunito", family: "Nunito Variable" },
  { id: "raleway", label: "Raleway", family: "Raleway Variable" },
  { id: "oswald", label: "Oswald", family: "Oswald Variable" },
  { id: "ubuntu", label: "Ubuntu", family: "Ubuntu" },
] as const;

export type FontId = (typeof fontCatalog)[number]["id"];
export type CustomFont = { id: string; name: string };

export type AppearanceSettings = {
  locale: Locale;
  themeId: ThemeId;
  fontId: FontId | "custom";
  customFontId: string | null;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
};

export const defaultAppearance: AppearanceSettings = {
  locale: "ru", themeId: "space", fontId: "inter", customFontId: null,
  backgroundColor: "", surfaceColor: "", textColor: "", accentColor: "",
};
