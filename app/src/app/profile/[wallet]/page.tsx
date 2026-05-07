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
    title: `${shortWallet} on Strand · Public profile`,
    description: `Public Strand profile for ${shortWallet}`,
    openGraph: {
      title: `${shortWallet} on Strand · Public profile`,
      description: "Portable gig work history and reputation on Solana"
    }
  };
}

export default function ProfilePage({ params }: { params: { wallet: string } }) {
  return <ProfileClient wallet={params.wallet} />;
}
