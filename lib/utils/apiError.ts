import { AxiosError } from "axios";

type BackendError = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

/**
 * Extrae el mensaje que mandó el backend. Los onError mostraban textos fijos
 * ("Error al responder solicitud") y se perdía el motivo real, que suele ser
 * accionable: sin créditos, solicitud ya respondida, cuenta bloqueada.
 *
 * class-validator devuelve `message` como array cuando falla un DTO.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as AxiosError<BackendError>)?.response?.data;
  const message = data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return fallback;
}

export function getStatus(error: unknown): number | undefined {
  return (error as AxiosError)?.response?.status;
}

/**
 * 409 = perdimos una carrera contra otro request (otro admin aprobó el pago, el
 * charter ya respondió, el viaje ya se confirmó). El backend ahora reclama el
 * estado dentro del UPDATE, así que este caso es esperable y no es un bug: lo
 * que corresponde es avisar y refrescar, porque lo que hay en pantalla quedó
 * viejo.
 */
export function isConflict(error: unknown): boolean {
  return getStatus(error) === 409;
}
