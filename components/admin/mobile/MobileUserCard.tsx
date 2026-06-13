import {
  Box,
  Typography,
  Avatar,
  Stack,
  alpha,
} from "@mui/material";
import {
  MonetizationOn as CreditIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import type { User } from "@/lib/types/api";

interface MobileUserCardProps {
  user: User;
  onClick?: () => void;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return { bg: "#380116", color: "white", ring: "#380116" };
    case "moderator":
      return { bg: "#4b011d", color: "white", ring: "#4b011d" };
    case "charter":
      return { bg: "#dca621", color: "#212121", ring: "#dca621" };
    default:
      return { bg: "#757575", color: "white", ring: "#757575" };
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderador";
    case "charter":
      return "Conductor";
    default:
      return "Usuario";
  }
};

export function MobileUserCard({ user, onClick }: MobileUserCardProps) {
  const roleColors = getRoleColor(user.role);

  return (
    <Box
      onClick={onClick}
      sx={{
        mb: 1.5,
        borderRadius: "16px",
        bgcolor: "background.paper",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s ease, transform 0.1s ease",
        "&:active": {
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          transform: "scale(0.985)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ p: 1.75, gap: 1.5 }}>
        {/* Avatar with role ring */}
        <Avatar
          src={user.avatar || undefined}
          sx={{
            width: 48,
            height: 48,
            bgcolor: roleColors.ring,
            fontSize: "1.1rem",
            fontWeight: 700,
            flexShrink: 0,
            outline: `3px solid ${alpha(roleColors.ring, 0.3)}`,
            outlineOffset: "2px",
          }}
        >
          {user.name[0]?.toUpperCase()}
        </Avatar>

        {/* Name + email + credits */}
        <Box flex={1} minWidth={0}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.25}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              fontSize="0.92rem"
              noWrap
              sx={{ maxWidth: "60%" }}
            >
              {user.name}
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: "20px",
                bgcolor: roleColors.bg,
                color: roleColors.color,
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.02em",
                lineHeight: 1.6,
                flexShrink: 0,
              }}
            >
              {getRoleLabel(user.role)}
            </Box>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: "block", fontSize: "0.73rem", mb: 0.75 }}
          >
            {user.email}
          </Typography>

          <Stack direction="row" alignItems="center" gap={0.4}>
            <CreditIcon sx={{ fontSize: 14, color: "#dca621" }} />
            <Typography variant="caption" fontWeight={600} fontSize="0.73rem" color="text.primary">
              {user.credits ?? 0}
            </Typography>
            <Typography variant="caption" fontSize="0.7rem" color="text.secondary">
              créditos
            </Typography>
          </Stack>
        </Box>

        {/* Navigation indicator */}
        {onClick && (
          <ChevronRightIcon sx={{ fontSize: 20, color: "text.disabled", flexShrink: 0 }} />
        )}
      </Stack>
    </Box>
  );
}
