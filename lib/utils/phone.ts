// Utilidad para celulares argentinos. Se guarda como un solo string `number`.
// Formato canónico: "+54 9 11 1234-5678" (siempre celular 9, agrupado).
// IMPORTANTE: mantener esta regex idéntica al @Matches del backend (DTOs).
export const CANONICAL_AR_PHONE_REGEX = /^\+54 9 \d{2} \d{4}-\d{4}$/;

// Extrae los 10 dígitos nacionales (área + abonado) limpiando país/9/0/15.
// Devuelve null si no es un celular argentino válido.
function extractNationalDigits(input: string): string | null {
  let digits = input.replace(/\D/g, "");

  // Código de país: 0054 o 54
  if (digits.startsWith("0054")) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("54")) {
    digits = digits.slice(2);
  }

  // Prefijo de celular "9" justo después del país
  if (digits.startsWith("9")) {
    digits = digits.slice(1);
  }

  // Cero troncal inicial
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Carrier "15": área (2-4 dígitos) + "15" + abonado. Si al quitar un "15"
  // ubicado justo después del área quedan 10 dígitos, se quita.
  if (digits.length > 10) {
    for (const areaLen of [2, 3, 4]) {
      if (
        digits.slice(areaLen, areaLen + 2) === "15" &&
        digits.length - 2 === 10
      ) {
        digits = digits.slice(0, areaLen) + digits.slice(areaLen + 2);
        break;
      }
    }
  }

  return digits.length === 10 ? digits : null;
}

// Normaliza cualquier formato común al canónico, o null si es inválido.
export function normalizeArgentinePhone(input: string): string | null {
  if (!input) return null;
  const national = extractNationalDigits(input);
  if (!national) return null;
  const area = national.slice(0, 2);
  const first = national.slice(2, 6);
  const last = national.slice(6, 10);
  return `+54 9 ${area} ${first}-${last}`;
}

// Máscara permisiva para onChange: da forma progresiva sin rechazar mientras se tipea.
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");

  // Quitar prefijos de país para trabajar solo con dígitos nacionales.
  if (digits.startsWith("0054")) digits = digits.slice(4);
  else if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("9")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length > 10) {
    for (const areaLen of [2, 3, 4]) {
      if (
        digits.slice(areaLen, areaLen + 2) === "15" &&
        digits.length - 2 === 10
      ) {
        digits = digits.slice(0, areaLen) + digits.slice(areaLen + 2);
        break;
      }
    }
  }

  digits = digits.slice(0, 10);
  if (digits.length === 0) return "";

  let out = "+54 9";
  const area = digits.slice(0, 2);
  const first = digits.slice(2, 6);
  const last = digits.slice(6, 10);
  if (area) out += ` ${area}`;
  if (first) out += ` ${first}`;
  if (last) out += `-${last}`;
  return out;
}
