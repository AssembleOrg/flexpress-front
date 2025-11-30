import { Card, CardContent, Box, Typography, Avatar, Chip, IconButton, Tooltip, Stack } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import type { User } from "@/lib/types/api";

interface MobileUserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  currentUserRole?: string;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "admin":
      return { bg: "#380116", color: "white" };
    case "moderator":
      return { bg: "#4b011d", color: "white" };
    case "charter":
      return { bg: "#dca621", color: "#212121" };
    default:
      return { bg: "#757575", color: "white" };
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

export function MobileUserCard({ user, onEdit, onDelete, currentUserRole }: MobileUserCardProps) {
  const roleColors = getRoleColor(user.role);
  const isAdmin = currentUserRole === "admin";

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: "4px solid",
        borderLeftColor: "secondary.main",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          {/* Avatar */}
          <Avatar
            src={user.avatar || undefined}
            sx={{
              width: 36,
              height: 36,
              bgcolor: "secondary.main",
            }}
          >
            {user.name[0]?.toUpperCase()}
          </Avatar>

          {/* Content */}
          <Box flex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="subtitle2" fontWeight={700} fontSize="0.9rem">
                {user.name}
              </Typography>
              <Chip
                label={getRoleLabel(user.role)}
                size="small"
                sx={{
                  backgroundColor: roleColors.bg,
                  color: roleColors.color,
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Chip
                label={`Créditos: ${user.credits}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />

              {/* Actions - Only for admin */}
              {isAdmin && (
                <Stack direction="row" spacing={0.5}>
                  {onEdit && (
                    <Tooltip title="Editar">
                      <IconButton
                        size="medium"
                        onClick={() => onEdit(user)}
                        sx={{
                          p: 1.5,
                          minWidth: 44,
                          minHeight: 44,
                        }}
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="medium"
                        color="error"
                        onClick={() => onDelete(user)}
                        sx={{
                          p: 1.5,
                          minWidth: 44,
                          minHeight: 44,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
