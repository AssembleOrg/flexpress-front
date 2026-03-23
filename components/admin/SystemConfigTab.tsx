"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";
import { useSystemConfigs } from "@/lib/hooks/queries/useAdminQueries";
import { useUpdateSystemConfig } from "@/lib/hooks/mutations/useAdminMutations";

// ============ CONFIG STRUCTURE (display only) ============
type ConfigField = {
  key: string;
  label: string;
  type: "text" | "number" | "email";
  adornment?: string;
  step?: number;
};

type ConfigCategory = {
  category: string;
  fields: ConfigField[];
};

const CONFIG_STRUCTURE: ConfigCategory[] = [
  {
    category: "Precios y Tarifas",
    fields: [
      {
        key: "credit_price",
        label: "Precio por Crédito",
        type: "number",
        adornment: "ARS",
        step: 0.01,
      },
    ],
  },
  {
    category: "Información de la Empresa y Contacto",
    fields: [
      { key: "company_name", label: "Nombre de la Empresa", type: "text" },
      { key: "company_address", label: "Dirección de la Empresa", type: "text" },
      { key: "contact_email", label: "Email de Contacto", type: "email" },
      { key: "contact_phone", label: "Teléfono de Contacto", type: "text" },
    ],
  },
  {
    category: "Configuración de Matchmaking",
    fields: [
      {
        key: "max_km_match_radius",
        label: "Radio Máximo de Búsqueda",
        type: "number",
        adornment: "km",
        step: 1,
      },
      {
        key: "max_detour_km",
        label: "Desvío Máximo Permitido",
        type: "number",
        adornment: "km",
        step: 1,
      },
    ],
  },
];

const getFieldMetadata = (key: string): ConfigField | undefined => {
  for (const { fields } of CONFIG_STRUCTURE) {
    const field = fields.find((f) => f.key === key);
    if (field) return field;
  }
  return undefined;
};

export function SystemConfigTab() {
  const { data: configs, isLoading } = useSystemConfigs();
  const updateMutation = useUpdateSystemConfig();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (configs) {
      const initial: Record<string, string> = {};
      for (const c of configs) initial[c.key] = c.value;
      setValues(initial);
    }
  }, [configs]);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!configs) return;

    const updates = configs
      .filter((c) => values[c.key] !== c.value)
      .map((c) => ({ id: c.id, value: values[c.key] }));

    if (updates.length === 0) {
      toast("No hay cambios para guardar");
      return;
    }

    try {
      await Promise.all(
        updates.map((u) =>
          updateMutation.mutateAsync({ id: u.id, data: { value: u.value } }),
        ),
      );
    } catch {
      // Error toast handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!configs || configs.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="textSecondary">
          No hay configuraciones disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Configuración del Sistema
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Actualiza los parámetros globales que afectan el funcionamiento de
            la plataforma
          </Typography>
        </Box>

        {CONFIG_STRUCTURE.map(({ category, fields }) => {
          const categoryConfigs = configs.filter((c) =>
            fields.some((f) => f.key === c.key),
          );
          if (categoryConfigs.length === 0) return null;

          return (
            <Card
              key={category}
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#380116" }}>
                  {category}
                </Typography>
                <Stack spacing={2.5}>
                  {fields.map((field) => {
                    const config = configs.find((c) => c.key === field.key);
                    if (!config) return null;
                    return (
                      <TextField
                        key={config.id}
                        label={field.label}
                        type={field.type === "number" ? "number" : "text"}
                        value={values[field.key] ?? ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        slotProps={{
                          input: {
                            step: field.type === "number" && field.step ? field.step : undefined,
                            endAdornment: field.adornment ? (
                              <InputAdornment position="end">{field.adornment}</InputAdornment>
                            ) : undefined,
                          } as any,
                        }}
                        helperText={config.description}
                        fullWidth
                        size="small"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                      />
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {configs.some((c) => !getFieldMetadata(c.key)) && (
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#380116" }}>
                Otros
              </Typography>
              <Stack spacing={2.5}>
                {configs
                  .filter((c) => !getFieldMetadata(c.key))
                  .map((config) => (
                    <TextField
                      key={config.id}
                      label={config.key}
                      type="text"
                      value={values[config.key] ?? ""}
                      onChange={(e) => handleChange(config.key, e.target.value)}
                      helperText={config.description}
                      fullWidth
                      size="small"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1 } }}
                    />
                  ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Box sx={{ pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            disabled={updateMutation.isPending}
            onClick={handleSave}
            sx={{
              backgroundColor: "#380116",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: 1,
              "&:hover": { backgroundColor: "#4b011d" },
              "&:disabled": { backgroundColor: "#ccc", color: "#999" },
            }}
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Todos los Cambios"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
