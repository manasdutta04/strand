import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";

function truncateWallet(value: string): string {
  if (value.length <= 12) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function generateMetadata({
  params
}: {
  params: { wallet: string };
}): Promise<Metadata> {
  const shortWallet = truncateWallet(params.wallet);
  return {
    title: `${shortWallet} on Strand · Score 0`,
    description: `Public Strand profile for ${shortWallet}`,
    openGraph: {
      title: `${shortWallet} on Strand · Score 0`,
      description: "Portable work history and reputation on Solana"
    }
  };
}

export default function ProfilePage({ params }: { params: { wallet: string } }) {
  return <ProfileClient wallet={params.wallet} />;
}
