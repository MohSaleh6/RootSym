"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dict, fill, type Dictionary, type Locale } from "./dictionary";

const STORAGE_KEY = "rootsym.locale";

/* ------------------------------------------------------------------
   A tiny external store. The server always renders English; the
   browser reads the saved preference through useSyncExternalStore,
   which is the hydration-safe way to do it.
   ------------------------------------------------------------------ */

let cached: Locale | null = null;
let listeners: (() => void)[] = [];

function readStored(): Locale {
  if (cached) return cached;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    cached = value === "ar" ? "ar" : "en";
  } catch {
    cached = "en";
  }
  return cached;
}

function subscribe(onChange: () => void): () => void {
  listeners.push(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = event.newValue === "ar" ? "ar" : "en";
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function writeStored(next: Locale) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode — the choice simply will not persist */
  }
  listeners.forEach((l) => l());
}

/* ---------------------------- context ---------------------------- */

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  /** Pick the Arabic field when it exists and Arabic is active. */
  pick: (en: string | null | undefined, ar: string | null | undefined) => string;
  pickList: (en: readonly string[], ar: readonly string[] | null | undefined) => readonly string[];
  fill: typeof fill;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readStored, () => "en" as Locale);

  useEffect(() => {
    const dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => writeStored(next), []);

  const value = useMemo<I18nValue>(() => {
    const isAr = locale === "ar";
    return {
      locale,
      dir: isAr ? "rtl" : "ltr",
      t: dict[locale] as unknown as Dictionary,
      setLocale,
      toggle: () => setLocale(isAr ? "en" : "ar"),
      pick: (en, ar) => (isAr && ar ? ar : (en ?? "")),
      pickList: (en, ar) => (isAr && ar && ar.length ? ar : en),
      fill,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}
