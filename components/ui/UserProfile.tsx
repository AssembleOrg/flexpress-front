import { Person } from '@mui/icons-material';
import { Avatar, Box, Rating, Typography } from '@mui/material';

interface UserProfileProps {
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
    rating?: number;
  };
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
}

const sizeConfig = {
  small: {
    avatar: 32,
    nameVariant: 'body2' as const,
    subtitleVariant: 'caption' as const,
  },
  medium: {
    avatar: 40,
    nameVariant: 'body1' as const,
    subtitleVariant: 'body2' as const,
  },
  large: {
    avatar: 56,
    nameVariant: 'h6' as const,
    subtitleVariant: 'body1' as const,
  },
};

export default function UserProfile({
  user,
  subtitle,
  size = 'medium',
  showRating = true,
}: UserProfileProps) {
  const config = sizeConfig[size];
  const fullName = `${user.firstName} ${user.lastName}`;
  const hasRating = showRating && user.rating && user.rating > 0;

  return (
    <Box
      display='flex'
      alignItems='center'
      gap={1.5}
    >
      <Avatar
        src={user.avatar}
        sx={{
          width: config.avatar,
          height: config.avatar,
          bgcolor: 'primary.main',
        }}
      >
        {user.avatar ? null : <Person />}
      </Avatar>

      <Box>
        <Typography
          variant={config.nameVariant}
          component='div'
          sx={{
            fontWeight: 500,
            color: 'text.primary',
            lineHeight: 1.2,
          }}
        >
          {fullName}
        </Typography>

        {subtitle && (
          <Typography
            variant={config.subtitleVariant}
            color='text.secondary'
            sx={{ lineHeight: 1.2 }}
          >
            {subtitle}
          </Typography>
        )}

        {hasRating && (
          <Box
            display='flex'
            alignItems='center'
            gap={0.5}
            mt={0.5}
          >
            <Rating
              value={user.rating}
              precision={0.1}
              size='small'
              readOnly
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#E67E22', // Color naranja del tema
                },
              }}
            />
            <Typography
              variant='caption'
              component='span'
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                ml: 0.5,
              }}
            >
              {user.rating?.toFixed(1)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
