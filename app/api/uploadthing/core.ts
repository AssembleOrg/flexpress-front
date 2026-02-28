import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

export const ourFileRouter = {
  // DNI uploader - acepta máximo 2 imágenes de 4MB cada una
  dniUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 2 } })
    .input(z.object({ userId: z.string() }))
    .middleware(async ({ input }) => {
      // Pasamos el userId a la metadata para asociar las imágenes al usuario
      return { userId: input.userId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // Este callback se ejecuta DESPUÉS del upload exitoso
      console.log(`[UploadThing] DNI uploaded for user: ${metadata.userId}`);
      console.log(`[UploadThing] File URL: ${file.url}`);
      return { url: file.url };
    }),

  // Vehicle doc uploader - para documentos del vehículo (foto, cédula, seguro, VTV)
  vehicleDocUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ vehicleId: z.string() }))
    .middleware(async ({ input }) => {
      return { vehicleId: input.vehicleId };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log(`[UploadThing] Vehicle doc for ${metadata.vehicleId}: ${file.url}`);
      return { url: file.url };
    }),

  // Receipt uploader - para comprobantes de pago
  receiptUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      // Sin metadata especial, es anónimo
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log(`[UploadThing] Receipt uploaded: ${file.url}`);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
