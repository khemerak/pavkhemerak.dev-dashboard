import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROOT_SYSTEM // ADMIN",
  description: "pavkhemerak.dev admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0d1516] text-[#dce4e5] antialiased overflow-x-hidden selection:bg-[#00e5ff] selection:text-black">
        {children}
      </body>
    </html>
  );
}
