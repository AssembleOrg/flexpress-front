"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { PrivateDocThumb } from "@/components/ui/PrivateImage";
import { useAdminUserDocuments } from "@/lib/hooks/queries/useAdminQueries";

const SIDE_LABEL: Record<string, string> = { front: "Frente", back: "Dorso" };

/**
 * Documentos (DNI) de un cliente (role user) para el detalle admin. Equivalente
 * a la sección "Documentos del titular" de CharterAdminPanel, pero para clientes.
 */
export function ClientDocumentsPanel({ userId }: { userId: string }) {
  const { data: docs = [], isLoading } = useAdminUserDocuments(userId);

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Documentos del cliente (DNI)
        </Typography>

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : docs.length === 0 ? (
          <Alert severity="info" sx={{ py: 0.5 }}>
            Este cliente no subió documentos de identidad.
          </Alert>
        ) : (
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {docs.map((doc) => (
              <Tooltip
                key={doc.id}
                title={`DNI ${SIDE_LABEL[doc.side ?? ""] ?? doc.side ?? ""}`}
              >
                <Box>
                  <PrivateDocThumb
                    value={doc.fileUrl}
                    alt={`DNI ${doc.side ?? ""}`}
                    imgStyle={{ width: 120, height: 84 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    textAlign="center"
                  >
                    {SIDE_LABEL[doc.side ?? ""] ?? doc.side}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
