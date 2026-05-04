"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getSkills, SkillAttestation } from "../lib/data";

export function useSkills(walletAddress?: string | null, refreshToken?: number) {
  const [skills, setSkills] = useState<SkillAttestation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setSkills([]);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const wallet = new PublicKey(walletAddress);
        const sk = await getSkills(wallet);
        setSkills(sk);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        setSkills([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [walletAddress, refreshToken]);

  return {
    skills,
    isLoading
  };
}