import type { Metadata } from "next";
import "./globals.css";
import AuthIcon from "@/components/AuthIcon";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="flex justify-end">
          <AuthIcon />
        </header>
        {children}
      </body>
    </html>
  );
}
