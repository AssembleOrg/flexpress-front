"use client";

import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ReportModal } from "@/components/modals/ReportModal";
import { useSendMessage } from "@/lib/hooks/mutations/useConversationMutations";
import { useConversationMessages } from "@/lib/hooks/queries/useConversationQueries";
import { useWebSocket, useSocketEmit } from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Message } from "@/lib/types/api";

interface ChatWindowProps {
  conversationId: string; // This is the matchId
  otherUser: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  onClose: () => void;
}

/**
 * ChatWindow component
 * Displays a chat interface for negotiating between user and charter
 * Uses WebSocket for real-time messaging with HTTP persistence
 */
export function ChatWindow({
  conversationId,
  otherUser,
  onClose,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const [messageContent, setMessageContent] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    return date.toLocaleDateString("es-ES", {
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

  // Fetch messages from backend
  const { data: messages = [], isLoading } =
    useConversationMessages(conversationId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // WebSocket connection for real-time events
  const { socket, isConnected } = useWebSocket();
  const socketEmit = useSocketEmit();
  const userId = user?.id;

  // 🔧 OPTIMIZACIÓN: Auto-scroll to bottom when new messages arrive
  // useLayoutEffect ejecuta ANTES del repaint del navegador (más fluido visualmente)
  // Depende de messages.length en vez del array completo (evita re-renders por cambios internos)
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",    // NO hacer scroll del viewport si ya está visible
      inline: "nearest"    // NO hacer scroll horizontal
    });
  }, [messages.length]);

  // 🔧 OPTIMIZACIÓN: Join conversation room for real-time messaging
  // Usa el objeto memoizado socketEmit que ahora es estable entre renders
  useEffect(() => {
    if (conversationId && userId && isConnected) {
      console.log(`🔌 Uniéndose a conversación: ${conversationId}`);
      socketEmit.joinConversation(conversationId);

      return () => {
        console.log(`🔌 Saliendo de conversación: ${conversationId}`);
        socketEmit.leaveConversation(conversationId);
      };
    }
  }, [conversationId, userId, isConnected, socketEmit]);

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

  /**
   * Handle menu open
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handle menu close
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handle report click - open modal and close menu
   */
  const handleReportClick = () => {
    setReportModalOpen(true);
    handleMenuClose();
  };

  /**
   * Handle report modal close
   */
  const handleReportModalClose = () => {
    setReportModalOpen(false);
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const content = messageContent;
    setMessageContent("");

    await sendMessageMutation.mutateAsync({
      conversationId,
      content,
    });
  };

  /**
   * Handle message input change
   * Emits typing indicator every time user types
   */
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.value;
    setMessageContent(newContent);

    // Emit typing event when user types
    if (newContent && newContent.length > 0) {
      socketEmit.notifyTyping(conversationId);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
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

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: { xs: "450px", md: "none" },
        minHeight: { md: "550px" },
      }}
    >
      {/* Header */}
      <CardHeader
        title={otherUser.name}
        subheader={
          isConnected ? (
            <Typography variant="caption" color="success.main">
              ● En línea
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Desconectado
            </Typography>
          )
        }
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReportClick}>
          ⚠️ Reportar esta conversación
        </MenuItem>
      </Menu>

      <Divider />

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
          >
            <CircularProgress size={40} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
          >
            <Typography color="text.secondary" variant="body2">
              Inicia una conversación...
            </Typography>
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

            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showDateSeparator = shouldShowDateSeparator(
              message,
              previousMessage,
            );

            return (
              <Box key={message.id}>
                {/* Date separator */}
                {showDateSeparator && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      my: 2,
                      opacity: 0.5,
                    }}
                  >
                    <Box
                      sx={{ flex: 1, height: 1, backgroundColor: "divider" }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {formatDateSeparator(message.createdAt)}
                    </Typography>
                    <Box
                      sx={{ flex: 1, height: 1, backgroundColor: "divider" }}
                    />
                  </Box>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === user?.id}
                  senderAvatar={
                    message.senderId !== user?.id ? (otherUser.avatar ?? undefined) : undefined
                  }
                  senderName={
                    message.senderId !== user?.id ? otherUser.name : undefined
                  }
                />
              </Box>
            );
          })
        )}

        {/* Typing indicator - improved with avatar */}
        {otherUserTyping && (
          <TypingIndicator
            userName={otherUser?.name || "Usuario"}
            userAvatar={otherUser?.avatar ?? undefined}
          />
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Message Input */}
      <Box sx={{ p: 2, display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          placeholder="Escribe un mensaje..."
          value={messageContent}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={!isConnected || sendMessageMutation.isPending}
          size="small"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={
            !messageContent.trim() ||
            !isConnected ||
            sendMessageMutation.isPending
          }
          sx={{ minWidth: 50, px: 2 }}
        >
          {sendMessageMutation.isPending ? (
            <CircularProgress size={20} />
          ) : (
            <SendIcon />
          )}
        </Button>
      </Box>

      {/* Status bar */}
      {!isConnected && (
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: "warning.light",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="warning.dark">
            ⚠️ Reconectando...
          </Typography>
        </Box>
      )}

      {/* Report Modal */}
      <ReportModal
        open={reportModalOpen}
        onClose={handleReportModalClose}
        conversationId={conversationId}
        reportedUserId={otherUser.id}
        reportedUserName={otherUser.name}
      />
    </Card>
  );
}
