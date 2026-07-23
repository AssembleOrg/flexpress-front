"use client";

import { useCallback } from "react";
import { usePushPermission } from "@/lib/hooks/usePushPermission";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";

export type PwaPromptMode = "install" | "push" | null;

/**
 * Lógica compartida del CTA de PWA (instalar / activar push), sin UI.
 * La usan tanto la tarjeta flotante `InstallPrompt` como el CTA inline de la
 * pantalla "Cuenta en Verificación".
 *
 *  - install → falta instalar (Chromium con prompt nativo, o iOS con instrucciones)
 *  - push    → ya instalado (standalone) pero falta conceder notificaciones
 *  - null    → nada que ofrecer (ya instalado + push concedido, o no soportado)
 */
export function usePwaPrompt(isAuthenticated: boolean) {
  const { canPromptNative, isIOS, isStandalone, promptInstall } =
    usePwaInstall();
  const { support, isSubscribing, subscribeToPush } =
    usePushPermission(isAuthenticated);

  const needsInstall = !isStandalone && (canPromptNative || isIOS);
  const needsPush = isStandalone && support === "default";
  const mode: PwaPromptMode = needsInstall
    ? "install"
    : needsPush
      ? "push"
      : null;

  const install = useCallback(async (): Promise<boolean> => {
    const outcome = await promptInstall();
    return outcome === "accepted";
  }, [promptInstall]);

  return {
    mode,
    isIOS,
    isSubscribing,
    install,
    activatePush: subscribeToPush,
  };
}
