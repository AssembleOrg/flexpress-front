"use client";

import { useEffect, useMemo } from "react";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSystemConfigs } from "@/lib/hooks/queries/useAdminQueries";
import { useUpdateSystemConfig } from "@/lib/hooks/mutations/useAdminMutations";

// ============ CONFIG STRUCTURE ============
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
      {
        key: "pricing_base_rate_per_km",
        label: "Tarifa Base por KM",
        type: "number",
        adornment: "créditos",
        step: 0.01,
      },
      {
        key: "pricing_minimum_charge",
        label: "Cargo Mínimo",
        type: "number",
        adornment: "créditos",
        step: 0.01,
      },
      {
        key: "pricing_worker_rate",
        label: "Costo por Trabajador",
        type: "number",
        adornment: "créditos",
        step: 0.01,
      },
    ],
  },
  {
    category: "Información de la Empresa y Contacto",
    fields: [
      {
        key: "company_name",
        label: "Nombre de la Empresa",
        type: "text",
      },
      {
        key: "company_address",
        label: "Dirección de la Empresa",
        type: "text",
      },
      {
        key: "contact_email",
        label: "Email de Contacto",
        type: "email",
      },
      {
        key: "contact_phone",
        label: "Teléfono de Contacto",
        type: "text",
      },
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

// ============ STATIC ZOD SCHEMA ============
const createValidationSchema = () => {
  const schema: Record<string, z.ZodTypeAny> = {};

  CONFIG_STRUCTURE.forEach(({ fields }) => {
    fields.forEach(({ key, type }) => {
      if (type === "email") {
        schema[key] = z.string().email();
      } else if (type === "number") {
        schema[key] = z.number().min(0, "Debe ser un número positivo");
      } else {
        schema[key] = z.string().min(1, "Este campo es requerido");
      }
    });
  });

  return z.object(schema);
};

// ============ EMPTY DEFAULTS ============
const getEmptyDefaults = (): Record<string, any> => {
  const defaults: Record<string, any> = {};

  CONFIG_STRUCTURE.forEach(({ fields }) => {
    fields.forEach(({ key, type }) => {
      defaults[key] = type === "number" ? 0 : "";
    });
  });

  return defaults;
};

// ============ FIELD METADATA HELPER ============
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

  // Convert configs array to Record for form
  const configsRecord = useMemo(() => {
    if (!configs) return {};
    return configs.reduce(
      (acc, config) => {
        const metadata = getFieldMetadata(config.key);
        if (!metadata) return acc;

        if (metadata.type === "number") {
          acc[config.key] = parseFloat(config.value);
        } else {
          acc[config.key] = config.value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [configs]);

  // Static schema (created once)
  const validationSchema = useMemo(() => createValidationSchema(), []);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: getEmptyDefaults(),
  });

  // Reset form when configs load
  useEffect(() => {
    if (configs && Object.keys(configsRecord).length > 0) {
      reset(configsRecord);
    }
  }, [configs, reset]);

  // Handle form submission
  const onSubmit = async (formData: Record<string, any>) => {
    const originalValues = configsRecord;
    const updates: Array<{ id: string; key: string; value: string }> = [];

    // Find changed values
    Object.entries(formData).forEach(([key, newValue]) => {
      const originalValue = originalValues[key];
      const stringNewValue = String(newValue);

      // Only update if changed
      if (stringNewValue !== String(originalValue)) {
        const configId = configs?.find((c) => c.key === key)?.id;
        if (configId) {
          updates.push({ id: configId, key, value: stringNewValue });
        }
      }
    });

    // If no changes, show info (optional)
    if (updates.length === 0) {
      // Optionally show a toast here or just return
      return;
    }

    // Execute all mutations in parallel
    try {
      await Promise.all(
        updates.map(({ id, value }) =>
          updateMutation.mutateAsync({ id, data: { value } }),
        ),
      );
    } catch (error) {
      console.error("Error updating configs:", error);
      // Error toast is handled by mutation hook
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
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
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Title */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Configuración del Sistema
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Actualiza los parámetros globales que afectan el funcionamiento de
            la plataforma
          </Typography>
        </Box>

        {/* Category Cards */}
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
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: "#380116",
                  }}
                >
                  {category}
                </Typography>

                <Stack spacing={2.5}>
                  {fields.map((field) => {
                    const config = configs.find((c) => c.key === field.key);
                    if (!config) return null;

                    return (
                      <Controller
                        key={config.id}
                        name={field.key}
                        control={control}
                        render={({
                          field: formField,
                          fieldState: { error },
                        }) => (
                          <TextField
                            {...formField}
                            label={field.label}
                            type={field.type === "number" ? "number" : "text"}
                            slotProps={{
                              input: {
                                step:
                                  field.type === "number" && field.step
                                    ? field.step
                                    : undefined,
                                endAdornment: field.adornment ? (
                                  <InputAdornment position="end">
                                    {field.adornment}
                                  </InputAdornment>
                                ) : undefined,
                              } as any,
                            }}
                            helperText={error?.message || config.description}
                            error={!!error}
                            fullWidth
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 1,
                              },
                            }}
                          />
                        )}
                      />
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          );
        })}

        {/* Other Configs (not categorized) */}
        {configs.some((c) => !getFieldMetadata(c.key)) && (
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: "#380116",
                }}
              >
                Otros
              </Typography>

              <Stack spacing={2.5}>
                {configs
                  .filter((c) => !getFieldMetadata(c.key))
                  .map((config) => (
                    <Controller
                      key={config.id}
                      name={config.key}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={config.key}
                          type="text"
                          helperText={error?.message || config.description}
                          error={!!error}
                          fullWidth
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                            },
                          }}
                        />
                      )}
                    />
                  ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Box sx={{ pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={updateMutation.isPending}
            sx={{
              backgroundColor: "#380116",
              color: "#FFFFFF",
              fontWeight: 700,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#4b011d",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#999",
              },
            }}
          >
            {updateMutation.isPending
              ? "Guardando..."
              : "Guardar Todos los Cambios"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
