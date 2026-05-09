"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AISettings = {
  provider: string;
  apiKey?: string;
  connected: boolean;
};

type AISettingsContextValue = {
  settings: AISettings;
  setSettings: (s: Partial<AISettings>) => void;
  clearSettings: () => void;
};

const STORAGE_KEY = "strand_ai_settings_v1";

const defaultSettings: AISettings = {
  provider: "",
  apiKey: undefined,
  connected: false
};

const AISettingsContext = createContext<AISettingsContextValue | null>(null);

export function useAISettings() {
  const ctx = useContext(AISettingsContext);
  if (!ctx) throw new Error("useAISettings must be used within AISettingsProvider");
  return ctx;
}

export function AISettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AISettings>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) return JSON.parse(raw) as AISettings;
    } catch (_) {}
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) {}
  }, [settings]);

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const next = e.newValue ? JSON.parse(e.newValue) : defaultSettings;
        setSettingsState(next);
      } catch (_) {}
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSettings = (s: Partial<AISettings>) => {
    setSettingsState(prev => ({ ...prev, ...s }));
  };

  const clearSettings = () => {
    setSettingsState(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const value: AISettingsContextValue = { settings, setSettings, clearSettings };

  return <AISettingsContext.Provider value={value}>{children}</AISettingsContext.Provider>;
}

export default AISettingsProvider;
