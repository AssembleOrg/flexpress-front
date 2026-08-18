"use client";

import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

// Predicción normalizada por /api/places/autocomplete (no expone la forma de
// Google al cliente).
interface PlacePrediction {
  placeId: string;
  description: string;
}

interface AddressInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onAddressSelect: (address: string, lat: number, lon: number) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

// Token de sesión de Places: agrupa tecleos + el details siguiente en una sola
// sesión facturable. Se genera en el cliente y viaja a las rutas server, que lo
// reenvían a Google. Se rota después de cada selección.
function newSessionToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AddressInput({
  label,
  placeholder = "Ingresa una dirección...",
  value = "",
  onAddressSelect,
  error = false,
  helperText = "",
  disabled = false,
}: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<string>(newSessionToken());
  // Cancela la búsqueda anterior: sin esto una respuesta lenta de un texto
  // viejo podía pisar las sugerencias de uno más nuevo.
  const abortRef = useRef<AbortController | null>(null);

  // Sync inputValue with external value changes (e.g., from pin drag on map)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    try {
      const response = await fetch("/api/places/autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: searchText,
          sessionToken: sessionTokenRef.current,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data: { predictions?: PlacePrediction[] } = await response.json();
      setSuggestions(data.predictions ?? []);
    } catch (err) {
      // El abort de una búsqueda superada no es un error real.
      if ((err as Error)?.name !== "AbortError") {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      }
    } finally {
      // Solo el request vigente apaga el spinner (el abortado ya fue superado).
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  const handleSelect = useCallback(
    async (placeId: string) => {
      try {
        const response = await fetch("/api/places/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            placeId,
            sessionToken: sessionTokenRef.current,
          }),
        });

        if (!response.ok) {
          console.error(`Error fetching place details: ${response.status}`);
          return;
        }

        const data: { address?: string; lat?: number; lon?: number } =
          await response.json();

        if (
          data.address &&
          typeof data.lat === "number" &&
          typeof data.lon === "number"
        ) {
          onAddressSelect(data.address, data.lat, data.lon);
          setInputValue(data.address);
        }
      } catch (err) {
        console.error("Error fetching place details:", err);
      } finally {
        // Sesión consumida: la próxima búsqueda abre una nueva.
        sessionTokenRef.current = newSessionToken();
      }
    },
    [onAddressSelect],
  );

  return (
    <Autocomplete
      freeSolo
      disableListWrap
      disabled={disabled}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={suggestions}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      inputValue={inputValue}
      onInputChange={(_, newValue) => setInputValue(newValue)}
      onChange={(_, value) => {
        if (!value) return;
        const selectedPlaceId =
          typeof value === "string" ? null : value.placeId;
        if (selectedPlaceId) {
          handleSelect(selectedPlaceId);
        }
      }}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.placeId}>
          <Typography variant="body2">{option.description}</Typography>
        </Box>
      )}
      noOptionsText={
        inputValue.length < 2
          ? "Escribe al menos 2 caracteres"
          : "No se encontraron direcciones"
      }
      loadingText="Buscando direcciones..."
    />
  );
}
