import { Chip } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface LocationChipProps {
  type: 'pickup' | 'destination';
  address: string;
  maxLength?: number;
}

const locationConfig = {
  pickup: {
    label: 'Origen',
    bgcolor: '#E3F2FD',
    color: '#1976D2',
    borderColor: '#1976D2',
  },
  destination: {
    label: 'Destino',
    bgcolor: '#FFF4E5',
    color: '#ED6C02',
    borderColor: '#ED6C02',
  },
};

export function LocationChip({
  type,
  address,
  maxLength = 30,
}: LocationChipProps) {
  const config = locationConfig[type];
  const truncatedAddress =
    address.length > maxLength ? `${address.slice(0, maxLength)}...` : address;

  return (
    <Chip
      icon={<LocationOn />}
      label={`${config.label}: ${truncatedAddress}`}
      size='small'
      variant='outlined'
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        borderColor: config.borderColor,
        fontWeight: 500,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
}
