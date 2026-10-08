import type { Metadata, Viewport } from "next";
import "@fontsource-variable/handjet";
import "@fontsource-variable/montserrat";
import "./globals.css";
import { MusicProvider } from "@/components/music-context";

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
      <body><MusicProvider>{children}</MusicProvider></body>
    </html>
  );
}
