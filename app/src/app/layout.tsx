import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "../components/WalletProvider";

export const metadata: Metadata = {
  title: "Strand",
  description: "Portable work history and credit protocol on Solana",
  icons: {
    icon: "/logo.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Condiment&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
