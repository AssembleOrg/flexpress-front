"use client";

/// <reference types="google.maps" />

import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";

// Interfaz para la respuesta de Autocomplete de Google
interface PlacePrediction {
  place_id: string;
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

export function AddressInput({
  label,
  placeholder = "Ingresa una dirección...",
  value = "",
  onAddressSelect,
  error = false,
  helperText = "",
  disabled = false,
}: AddressInputProps) {
  const places = useMapsLibrary("places");
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<
    google.maps.places.AutocompleteSessionToken | undefined
  >(undefined);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (!places) return;
    autocompleteServiceRef.current = new places.AutocompleteService();
    setSessionToken(new places.AutocompleteSessionToken());
  }, [places]);

  // Sync inputValue with external value changes (e.g., from pin drag on map)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = useCallback(
    async (searchText: string) => {
      if (
        !searchText ||
        searchText.trim().length < 2 ||
        !autocompleteServiceRef.current
      ) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      const locationBias = {
        north: -34.4,
        south: -34.9,
        west: -58.8,
        east: -58.2,
      };

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: searchText,
          componentRestrictions: { country: "ar" },
          sessionToken: sessionToken,
          locationBias: locationBias,
        },
        (predictions, status) => {
          setIsLoading(false);
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        },
      );
    },
    [sessionToken],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, fetchSuggestions]);

  const handleSelect = useCallback(
    async (placeId: string) => {
      if (!places) return;

      const place = new places.Place({ id: placeId });

      try {
        const { place: placeDetails } = await place.fetchFields({
          fields: ["formattedAddress", "location"],
        });

        const location = placeDetails.location;
        const address = placeDetails.formattedAddress;

        if (location && address) {
          onAddressSelect(address, location.lat(), location.lng());
          setInputValue(address);
        }
      } catch (error) {
        console.error("Error fetching place details:", error);
      } finally {
        setSessionToken(new places.AutocompleteSessionToken());
      }
    },
    [places, onAddressSelect],
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
          typeof value === "string" ? null : value.place_id;
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
        <Box component="li" {...props} key={option.place_id}>
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
