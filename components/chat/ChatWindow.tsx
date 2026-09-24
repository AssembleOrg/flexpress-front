"use client";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Badge,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ReportModal } from "@/components/modals/ReportModal";
import { SignedAvatar } from "@/components/ui/SignedAvatar";
import { useSendMessage } from "@/lib/hooks/mutations/useConversationMutations";
import { useConversationMessages } from "@/lib/hooks/queries/useConversationQueries";
import { useSocketEmit, useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Message } from "@/lib/types/api";

interface ChatWindowProps {
  conversationId: string; // This is the matchId
  otherUser: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  /**
   * Conductor activo que ejecuta el viaje (sólo relevante del lado cliente).
   * Sólo el nombre: el contacto es 100% in-app, no se exponen teléfonos.
   */
  activeDriver?: {
    name: string;
  } | null;
  onClose: () => void;
}

const CREAM = "#F5F2E8";
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 120;

// Scroll del contenedor (no scrollIntoView: en iOS mueve la página entera)
const scrollToEnd = (el: HTMLElement | null, behavior: ScrollBehavior) =>
  el?.scrollTo({ top: el.scrollHeight, behavior });

const QUICK_REPLIES: Record<"client" | "charter", string[]> = {
  client: [
    "¡Hola! ¿A qué hora pasás?",
    "La carga está lista",
    "¿Necesitás indicaciones para llegar?",
  ],
  charter: [
    "¡Hola! Ya estoy coordinando el viaje",
    "Estoy en camino",
    "¿Hay acceso para estacionar?",
  ],
};

/**
 * ChatWindow component
 * Displays a chat interface for negotiating between user and charter
 * Uses WebSocket for real-time messaging with HTTP persistence
 */
export function ChatWindow({
  conversationId,
  otherUser,
  activeDriver = null,
  onClose,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const [messageContent, setMessageContent] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);
  const didInitialScrollRef = useRef(false);
  const prevCountRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to format date separator
  const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Hoy";
    if (isYesterday) return "Ayer";
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to check if we should show date separator
  const shouldShowDateSeparator = (
    currentMessage: Message,
    previousMessage: Message | undefined,
  ): boolean => {
    if (!previousMessage) return true;
    const currentDate = new Date(currentMessage.createdAt).toDateString();
    const previousDate = new Date(previousMessage.createdAt).toDateString();
    return currentDate !== previousDate;
  };

  // Mensajes consecutivos del mismo emisor, mismo día y < 5 min se agrupan
  const isSameGroup = (a: Message | undefined, b: Message | undefined) =>
    !!a &&
    !!b &&
    a.senderId === b.senderId &&
    !shouldShowDateSeparator(b, a) &&
    Math.abs(
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ) < GROUP_WINDOW_MS;

  // Fetch messages from backend
  const { data: messages = [], isLoading } =
    useConversationMessages(conversationId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // WebSocket connection for real-time events
  const { socket, isConnected } = useWebSocket();
  const socketEmit = useSocketEmit();
  const userId = user?.id;

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    isNearBottomRef.current = nearBottom;
    if (nearBottom) setHasUnseen(false);
  };

  // Carga inicial → salto al final. Mensaje nuevo → seguir si estoy abajo o
  // si es mío; si estoy leyendo arriba, mostrar la pill "Nuevos mensajes".
  // biome-ignore lint/correctness/useExhaustiveDependencies: sólo reacciona a la cantidad de mensajes
  useLayoutEffect(() => {
    if (isLoading) return;
    const count = messages.length;
    if (!didInitialScrollRef.current) {
      didInitialScrollRef.current = true;
      scrollToEnd(listRef.current, "auto");
    } else if (count > prevCountRef.current) {
      const last = messages[count - 1];
      if (isNearBottomRef.current || last?.senderId === userId) {
        scrollToEnd(listRef.current, "smooth");
      } else {
        setHasUnseen(true);
      }
    }
    prevCountRef.current = count;
  }, [isLoading, messages.length]);

  useEffect(() => {
    if (otherUserTyping && isNearBottomRef.current)
      scrollToEnd(listRef.current, "smooth");
  }, [otherUserTyping]);

  // Join a la room de la conversación para mensajería en tiempo real.
  // Usa el socket singleton directamente (no el snapshot `isConnected` de esta
  // instancia, que no reacciona a connect/reconnect). Re-emitir el join en el
  // evento `connect` cubre dos casos: montar antes de conectar, y —el caso real
  // en móvil/iOS— que el socket se caiga tras unos minutos y reconecte: el
  // server pierde la membresía de la room y sin este re-join el cliente queda
  // conectado pero fuera de la room (deja de ver mensajes; el polling no cubre
  // porque el socket "sí está conectado").
  useEffect(() => {
    if (!socket || !conversationId || !userId) return;

    const join = () => socketEmit.joinConversation(conversationId);
    if (socket.connected) join();
    socket.on("connect", join);

    return () => {
      socket.off("connect", join);
      socketEmit.leaveConversation(conversationId);
    };
  }, [socket, conversationId, userId, socketEmit]);

  // 🔧 OPTIMIZACIÓN: Simple typing indicator
  // Usa socket directamente (más estable que socketEmit.socket)
  useEffect(() => {
    if (!socket) return;

    const handleTyping = () => {
      setOtherUserTyping(true);
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Hide typing indicator after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        setOtherUserTyping(false);
      }, 3000);
    };

    socket.on("typing", handleTyping);
    return () => {
      socket.off("typing", handleTyping);
    };
  }, [socket]);

  const handleReportClick = () => {
    setReportModalOpen(true);
    setAnchorEl(null);
  };

  const canSend =
    !!messageContent.trim() && isConnected && !sendMessageMutation.isPending;

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!canSend) return;

    const content = messageContent;
    setMessageContent("");
    inputRef.current?.focus();

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content,
      });
    } catch {
      // El hook ya muestra el toast; devolvemos el borrador para no perderlo
      setMessageContent((current) => current || content);
    }
  };

  /**
   * Handle message input change
   * Emits typing indicator every time user types
   */
  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const newContent = event.target.value;
    setMessageContent(newContent);

    // Emit typing event when user types
    if (newContent && newContent.length > 0) {
      socketEmit.notifyTyping(conversationId);
    }
  };

  /**
   * Desktop: Enter envía, Shift+Enter salta de línea.
   * Touch: Enter salta de línea y se envía con el botón (patrón iMessage/WhatsApp).
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    event.preventDefault();
    handleSendMessage();
  };

  const handleQuickReply = (text: string) => {
    setMessageContent(text);
    inputRef.current?.focus();
  };

  if (!user) {
    return (
      <Card>
        <CardContent>
          <Typography color="error">No estás autenticado</Typography>
        </CardContent>
      </Card>
    );
  }

  const statusLabel = otherUserTyping
    ? "Escribiendo…"
    : isConnected
      ? "Chat en vivo"
      : "Reconectando…";
  const quickReplies =
    QUICK_REPLIES[user.role === "charter" ? "charter" : "client"];

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "min(70dvh, 620px)", md: 640 },
        borderRadius: "20px",
        overflow: "hidden",
        border: "1px solid rgba(56, 1, 22, 0.08)",
        boxShadow: "0 8px 32px rgba(56, 1, 22, 0.08)",
        "&:hover": { boxShadow: "0 8px 32px rgba(56, 1, 22, 0.08)" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "1px solid rgba(56, 1, 22, 0.08)",
          zIndex: 1,
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "2px solid #FFFFFF",
              bgcolor: isConnected ? "success.main" : "secondary.main",
              animation: isConnected ? "none" : "pulse 1.4s infinite",
            },
          }}
        >
          <SignedAvatar
            value={otherUser.avatar}
            alt={otherUser.name}
            sx={{
              width: 42,
              height: 42,
              bgcolor: "primary.main",
              color: "secondary.main",
              fontWeight: 700,
              boxShadow: "0 0 0 2px #FFFFFF, 0 0 0 3.5px #DCA621",
            }}
          >
            {otherUser.name?.[0]?.toUpperCase() || "U"}
          </SignedAvatar>
        </Badge>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "text.primary",
              lineHeight: 1.25,
            }}
          >
            {otherUser.name}
          </Typography>
          <Typography
            noWrap
            aria-live="polite"
            sx={{
              fontSize: "0.75rem",
              fontWeight: otherUserTyping ? 700 : 500,
              color: otherUserTyping
                ? "secondary.dark"
                : isConnected
                  ? "success.dark"
                  : "text.secondary",
            }}
          >
            {statusLabel}
          </Typography>
        </Box>

        <IconButton
          size="small"
          aria-label="Más opciones"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ bgcolor: "rgba(56, 1, 22, 0.05)", color: "primary.main" }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label="Cerrar chat"
          onClick={onClose}
          sx={{ bgcolor: "rgba(56, 1, 22, 0.05)", color: "primary.main" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Conductor activo (lado cliente) */}
      {activeDriver && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            bgcolor: "rgba(220, 166, 33, 0.10)",
            borderBottom: "1px solid rgba(220, 166, 33, 0.25)",
          }}
        >
          <LocalShippingOutlinedIcon
            sx={{ fontSize: 16, color: "secondary.dark" }}
          />
          <Typography
            noWrap
            sx={{ fontSize: "0.78rem", color: "text.secondary", flex: 1 }}
          >
            Conduce{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>
              {activeDriver.name}
            </Box>
          </Typography>
        </Box>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 3,
              minWidth: 220,
              boxShadow: "0 12px 32px rgba(56, 1, 22, 0.16)",
            },
          },
        }}
      >
        <MenuItem
          onClick={handleReportClick}
          sx={{ color: "error.main", fontWeight: 600, py: 1.25 }}
        >
          <ListItemIcon>
            <FlagOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          Reportar conversación
        </MenuItem>
      </Menu>

      {/* Messages area */}
      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        {!isConnected && (
          <Box
            role="status"
            sx={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(220, 166, 33, 0.4)",
              boxShadow: "0 4px 12px rgba(56, 1, 22, 0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <CircularProgress size={12} thickness={6} color="secondary" />
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
              Reconectando…
            </Typography>
          </Box>
        )}

        <Box
          ref={listRef}
          onScroll={handleListScroll}
          role="log"
          aria-live="polite"
          aria-label={`Conversación con ${otherUser.name}`}
          sx={{
            height: "100%",
            overflowY: "auto",
            overscrollBehavior: "contain",
            px: { xs: 1.5, md: 2.5 },
            py: 2,
            display: "flex",
            flexDirection: "column",
            background: `linear-gradient(180deg, ${CREAM} 0%, #FAF8F2 100%)`,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {[180, 240, 140, 210].map((w, i) => (
                <Skeleton
                  key={w}
                  variant="rounded"
                  width={w}
                  height={40}
                  sx={{
                    borderRadius: "20px",
                    alignSelf: i % 2 ? "flex-end" : "flex-start",
                    bgcolor: i % 2 ? "rgba(56, 1, 22, 0.10)" : "#FFFFFF",
                  }}
                />
              ))}
            </Box>
          ) : messages.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                  bgcolor: "#FFFFFF",
                  color: "secondary.main",
                  boxShadow:
                    "0 0 0 6px rgba(220, 166, 33, 0.12), 0 4px 16px rgba(56, 1, 22, 0.08)",
                }}
              >
                <ChatBubbleOutlineIcon />
              </Box>
              <Typography
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
              >
                Coordiná los detalles del viaje
              </Typography>
              <Typography
                variant="body2"
                sx={{ maxWidth: 300, mb: 2.5, fontSize: "0.85rem" }}
              >
                Horarios, acceso y carga. Todo queda registrado acá.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                {quickReplies.map((text) => (
                  <Box
                    key={text}
                    component="button"
                    type="button"
                    onClick={() => handleQuickReply(text)}
                    sx={{
                      border: "1px solid rgba(56, 1, 22, 0.12)",
                      bgcolor: "#FFFFFF",
                      color: "primary.main",
                      borderRadius: 999,
                      px: 1.75,
                      py: 0.9,
                      fontFamily: "inherit",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      "&:hover": { borderColor: "secondary.main" },
                      "&:active": { transform: "scale(0.97)" },
                    }}
                  >
                    {text}
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            messages.map((message, index) => {
              // Validar que el mensaje tenga estructura válida
              if (!message?.id || !message?.senderId) {
                console.warn(
                  "⚠️ [ChatWindow] Mensaje con estructura inválida:",
                  message,
                );
                return null;
              }

              const previousMessage =
                index > 0 ? messages[index - 1] : undefined;
              const nextMessage = messages[index + 1];
              const showDateSeparator = shouldShowDateSeparator(
                message,
                previousMessage,
              );
              const isOwn = message.senderId === user.id;

              return (
                <Box key={message.id}>
                  {showDateSeparator && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        my: 1.5,
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{
                          px: 1.5,
                          py: 0.4,
                          borderRadius: 999,
                          bgcolor: "rgba(56, 1, 22, 0.06)",
                          color: "text.secondary",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.02em",
                          textTransform: "capitalize",
                        }}
                      >
                        {formatDateSeparator(message.createdAt)}
                      </Typography>
                    </Box>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    senderAvatar={
                      !isOwn ? (otherUser.avatar ?? undefined) : undefined
                    }
                    senderName={!isOwn ? otherUser.name : undefined}
                    isFirstInGroup={!isSameGroup(previousMessage, message)}
                    isLastInGroup={!isSameGroup(message, nextMessage)}
                  />
                </Box>
              );
            })
          )}

          {otherUserTyping && (
            <TypingIndicator
              userName={otherUser?.name || "Usuario"}
              userAvatar={otherUser?.avatar ?? undefined}
            />
          )}
        </Box>

        {/* Pill "Nuevos mensajes" cuando el usuario está leyendo arriba */}
        {hasUnseen && (
          <Box
            component="button"
            type="button"
            onClick={() => {
              scrollToEnd(listRef.current, "smooth");
              setHasUnseen(false);
            }}
            sx={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.75,
              py: 0.75,
              border: "none",
              borderRadius: 999,
              bgcolor: "primary.main",
              color: "#FFFFFF",
              fontFamily: "inherit",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(56, 1, 22, 0.3)",
            }}
          >
            <ArrowDownwardIcon sx={{ fontSize: 16 }} />
            Nuevos mensajes
          </Box>
        )}
      </Box>

      {/* Composer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          px: 1.5,
          pt: 1.25,
          pb: 1.25,
          bgcolor: "#FFFFFF",
          borderTop: "1px solid rgba(56, 1, 22, 0.08)",
        }}
      >
        <InputBase
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={5}
          placeholder="Escribí un mensaje…"
          value={messageContent}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          inputProps={{
            enterKeyHint: "send",
            "aria-label": "Mensaje",
          }}
          sx={{
            px: 2,
            py: 1.1,
            borderRadius: "22px",
            bgcolor: CREAM,
            border: "1px solid transparent",
            fontSize: "0.95rem",
            lineHeight: 1.4,
            transition: "border-color 0.15s ease, background-color 0.15s ease",
            "&.Mui-focused": {
              bgcolor: "#FFFFFF",
              borderColor: "secondary.main",
            },
          }}
        />
        <IconButton
          aria-label="Enviar mensaje"
          onClick={handleSendMessage}
          disabled={!canSend}
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            bgcolor: "primary.main",
            color: "#FFFFFF",
            transition: "transform 0.15s ease, background-color 0.15s ease",
            transform: canSend ? "scale(1)" : "scale(0.92)",
            "&:hover": { bgcolor: "primary.dark" },
            "&:active": { transform: "scale(0.9)" },
            "&.Mui-disabled": {
              bgcolor: "rgba(56, 1, 22, 0.12)",
              color: "#FFFFFF",
            },
          }}
        >
          {sendMessageMutation.isPending ? (
            <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
          ) : (
            <ArrowUpwardIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        conversationId={conversationId}
        reportedUserId={otherUser.id}
        reportedUserName={otherUser.name}
      />
    </Card>
  );
}
