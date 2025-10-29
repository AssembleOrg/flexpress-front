"use client";

import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { type AddressSuggestion, geoApi } from "@/lib/api/geo";

interface AddressInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onAddressSelect: (address: string, lat: number, lon: number) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
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
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * Fetch address suggestions from Geoapify
   */
  const fetchSuggestions = useCallback(async (searchText: string) => {
    if (!searchText || searchText.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await geoApi.autocomplete(searchText, 5);
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounce input changes to avoid too many API calls
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

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
        typeof option === "string" ? option : option.address
      }
      isOptionEqualToValue={(option, value) => {
        if (typeof value === "string") return option.address === value;
        return option.address === value.address;
      }}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, value) => {
        if (!value) return;

        const selected =
          typeof value === "string"
            ? suggestions.find((s) => s.address === value)
            : value;

        if (selected) {
          onAddressSelect(
            selected.address,
            selected.coordinates.lat,
            selected.coordinates.lon,
          );
          setInputValue(selected.address);
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
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...otherProps}
            sx={{
              "& > img": { mr: 2, flexShrink: 0 },
              padding: "12px 16px",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {option.address}
              </Typography>
              {option.city && (
                <Typography variant="caption" color="text.secondary">
                  {option.city}
                  {option.state ? `, ${option.state}` : ""}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      noOptionsText={
        inputValue.length < 2
          ? "Escribe al menos 2 caracteres"
          : "No se encontraron direcciones"
      }
      loadingText="Buscando direcciones..."
    />
  );
}
