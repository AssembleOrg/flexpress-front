import imageCompression from "browser-image-compression";
import api from "@/lib/api";

/**
 * Scopes de subida. Deben coincidir con el enum `UploadScope` del backend
 * (flexpress-backend/src/storage/dto/presign-upload.dto.ts).
 *
 * Públicos (se guarda la URL directa del CDN, se muestran con <img src>):
 *   avatar, personnel-photo, vehicle-foto
 * Privados (se guarda la KEY; se leen con URL firmada temporal, ver usePresignedRead):
 *   user-dni, vehicle-doc, personnel-doc, receipt
 */
export type UploadScope =
  | "avatar"
  | "personnel-photo"
  | "vehicle-foto"
  | "user-dni"
  | "vehicle-doc"
  | "personnel-doc"
  | "receipt";

// Límite de sanidad antes de comprimir (evita cargar archivos absurdos a memoria).
const SANITY_MAX = 25 * 1024 * 1024; // 25MB

interface PresignResponse {
  uploadUrl: string;
  fields: Record<string, string>;
  key: string;
  publicUrl?: string;
}

/**
 * Normaliza una imagen antes de subirla: la convierte a JPEG y la comprime a ~1MB.
 * Resuelve dos problemas de mobile de una: (1) HEIC de iPhone → JPEG (formato aceptado),
 * (2) fotos de cámara de 3-8MB → &lt; 1MB (dentro del límite del backend).
 * Los PDF NO se tocan (la lib es solo imágenes).
 */
async function normalizeForUpload(file: File): Promise<File> {
  if (file.type === "application/pdf") return file;

  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: "image/jpeg", // fuerza JPEG → convierte HEIC/PNG/WEBP
  });

  // browser-image-compression devuelve un Blob; garantizamos un File con nombre .jpg.
  const base = file.name.replace(/\.[^.]+$/, "") || "upload";
  return new File([compressed], `${base}.jpg`, { type: "image/jpeg" });
}

/**
 * Reemplazo drop-in de `uploadFiles` de UploadThing.
 *
 * Flujo: pide una URL firmada al backend NestJS (que valida JWT + ownership),
 * hace PUT directo del archivo a DigitalOcean Spaces, y devuelve `{ url, key }`.
 *
 * - Público: `url` es la URL del CDN (se persiste tal cual, se muestra directo).
 * - Privado: `url === key` (se persiste la key; para mostrarla se firma con
 *   `usePresignedRead`). El campo destino sigue siendo un `string`, sin cambios de tipo.
 */
export async function uploadToStorage(
  scope: UploadScope,
  file: File,
  entityId?: string,
): Promise<{ url: string; key: string }> {
  if (file.size > SANITY_MAX) {
    throw new Error("El archivo es demasiado grande");
  }

  // Normaliza (HEIC→JPEG + compresión a ~1MB) antes de subir. PDFs pasan crudo.
  const finalFile = await normalizeForUpload(file);

  // Este contentType se firma en el backend Y se manda en el PUT: DEBEN coincidir exacto
  // (Spaces valida la coincidencia, si no da SignatureDoesNotMatch).
  const contentType = finalFile.type || "application/octet-stream";

  const res = await api.post("/storage/presign-upload", {
    scope,
    contentType,
    fileName: finalFile.name,
    entityId,
    size: finalFile.size,
  });
  // El backend envuelve en { success, message, data }; toleramos ambas formas.
  const { uploadUrl, fields, key, publicUrl }: PresignResponse =
    res.data?.data ?? res.data;

  // Presigned POST: FormData con todos los fields de la policy PRIMERO y el archivo AL FINAL
  // (S3/Spaces exige que "file" sea el último campo). POST multipart sin headers custom es
  // un "simple request" → sin preflight OPTIONS, que es lo que evita el 403 de Spaces.
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  formData.append("file", finalFile);

  // mode: "no-cors" — DigitalOcean Spaces no devuelve el header CORS en la respuesta 204
  // del POST; sin esto, fetch (en modo cors por default) rechaza con "NetworkError" AUNQUE
  // el archivo se haya subido, rompiendo el flujo del caller. La respuesta queda "opaque"
  // (status 0, no legible), así que NO chequeamos post.ok. Un fallo real de red igual rechaza.
  await fetch(uploadUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData,
  });

  return { url: publicUrl ?? key, key };
}

/**
 * Distingue una KEY de storage (privado) de una URL directa (público / legacy utfs.io).
 * Toda URL empieza con "http"; las keys son rutas `{env}/...`.
 */
export function isStorageKey(value?: string | null): boolean {
  return !!value && !value.startsWith("http");
}
