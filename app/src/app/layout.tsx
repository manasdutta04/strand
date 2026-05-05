import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { WalletProvider } from "../components/WalletProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
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
      <body className={`${manrope.variable}`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
