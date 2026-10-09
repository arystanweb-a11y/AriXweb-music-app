import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/roboto";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/source-sans-3";
import "@fontsource/ubuntu/400.css";
import "@fontsource-variable/handjet";
import "@fontsource-variable/montserrat";
import "@fontsource-variable/nunito";
import "@fontsource-variable/raleway";
import "@fontsource-variable/oswald";
import "./globals.css";
import { MusicProvider } from "@/components/music-context";
import { AppearanceProvider } from "@/components/appearance-context";

export const metadata: Metadata = {
  title: "Музыка — Mini App",
  description: "Поиск и прослушивание музыки",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f7f5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body><AppearanceProvider><MusicProvider>{children}</MusicProvider></AppearanceProvider></body>
    </html>
  );
}
