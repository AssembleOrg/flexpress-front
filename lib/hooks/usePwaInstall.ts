"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // navigator.standalone es la señal legacy específica de iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ se presenta como Mac; detectar por touch
  const isIPadOS =
    navigator.platform === "MacIntel" &&
    (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints !==
      undefined &&
    ((navigator as unknown as { maxTouchPoints: number }).maxTouchPoints ?? 0) >
      1;
  return isIOSDevice || isIPadOS;
}

/**
 * Encapsula la detección de instalabilidad del PWA en las 3 plataformas:
 * - Android/Desktop (Chromium): captura `beforeinstallprompt` → botón nativo.
 * - iOS/Safari: el evento NUNCA se dispara → instrucciones manuales
 *   ("Compartir → Añadir a inicio"). Se gatea por UA de iOS + NO standalone.
 * - Ya instalado (standalone): no mostrar nada.
 *
 * Verificado contra MDN / web.dev / WebKit (2025).
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsStandalone(detectStandalone());
    setIsIOS(detectIOS());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    const mql = window.matchMedia("(display-mode: standalone)");
    const onDisplayChange = () => setIsStandalone(detectStandalone());
    mql.addEventListener("change", onDisplayChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      mql.removeEventListener("change", onDisplayChange);
    };
  }, []);

  // Dispara el prompt nativo (Chromium). El evento es de un solo uso.
  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!deferredPrompt) return "unavailable";
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  return {
    /** true si el navegador ofreció el prompt nativo (Chromium, no instalado) */
    canPromptNative: deferredPrompt !== null,
    /** true en iOS/Safari, donde hay que mostrar instrucciones manuales */
    isIOS,
    /** true si la app ya corre instalada (standalone) */
    isStandalone: isStandalone || isInstalled,
    promptInstall,
  };
}
