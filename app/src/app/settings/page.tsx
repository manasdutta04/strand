"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Settings is now a modal in /worker and /partner pages
    router.push("/");
  }, [router]);

  return null;
}
