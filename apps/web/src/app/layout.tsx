import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telemetry · Enterprise Application Analytics",
  description:
    "Internal application monitoring and user activity analytics across every enterprise module.",
  openGraph: {
    title: "Telemetry · Enterprise Application Analytics",
    description:
      "Internal application monitoring and user activity analytics across every enterprise module.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
