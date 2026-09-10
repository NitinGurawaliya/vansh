import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "For You, Vansh ♡",
  description: "A little something before you go...",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
