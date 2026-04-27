import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProvider } from "../components/WalletProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Strand",
  description: "Portable work history and credit protocol on Solana"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
