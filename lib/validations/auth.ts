import { z } from "zod";
import { normalizeArgentinePhone } from "@/lib/utils/phone";

// NOTA: app/(auth)/register/page.tsx define su propio schema inline (es el que
// realmente usa el registro). Estos schemas compartidos se mantienen
// sincronizados con las mismas reglas para evitar drift si se migra a ellos.

const argentinePhone = z.string().transform((v, ctx) => {
  const normalized = normalizeArgentinePhone(v);
  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ingresá un teléfono argentino válido",
    });
    return z.NEVER;
  }
  return normalized;
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .min(1, "El email es requerido")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerUserSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .email("Email inválido")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["user", "charter"]),
    address: z.string().min(5, "La dirección es requerida"),
    number: argentinePhone,
    originAddress: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const registerCharterSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z
      .string()
      .email("Email inválido")
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["user", "charter"]),
    address: z.string().min(5, "La dirección es requerida"),
    number: argentinePhone,
    originAddress: z.string().min(5, "La dirección base es requerida"),
    originLatitude: z.string().optional(),
    originLongitude: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterUserFormData = z.infer<typeof registerUserSchema>;
export type RegisterCharterFormData = z.infer<typeof registerCharterSchema>;
