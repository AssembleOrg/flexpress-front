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
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ReportModal } from "@/components/modals/ReportModal";
import {
  useNotifyTyping,
  useSendMessage,
} from "@/lib/hooks/mutations/useConversationMutations";
import { useConversationMessages } from "@/lib/hooks/queries/useConversationQueries";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAuthStore } from "@/lib/stores/authStore";
import type { User } from "@/lib/types/api";

interface ChatWindowProps {
  conversationId: string; // This is the matchId
  otherUser: User;
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
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch messages from backend
  const { data: messages = [], isLoading } =
    useConversationMessages(conversationId);

  // Send message mutation
  const sendMessageMutation = useSendMessage();
  const typingNotify = useNotifyTyping();

  // WebSocket connection for real-time events
  const { isConnected } = useWebSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
    typingNotify.notifyStopTyping(conversationId);

    await sendMessageMutation.mutateAsync({
      conversationId,
      content,
    });
  };

  /**
   * Handle typing indicator
   * Notifies other user that this user is typing
   */
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.value;
    setMessageContent(newContent);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Notify other user that this user is typing
    if (newContent && !isTyping) {
      setIsTyping(true);
      typingNotify.notifyTyping(conversationId);
    }

    // Stop typing notification after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (newContent) {
        setIsTyping(false);
        typingNotify.notifyStopTyping(conversationId);
      }
    }, 2000);
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

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
        maxHeight: "600px",
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
          messages.map((message) => {
            // Validar que el mensaje tenga estructura válida
            if (!message?.id || !message?.senderId) {
              console.warn(
                "⚠️ [ChatWindow] Mensaje con estructura inválida:",
                message,
              );
              return null;
            }

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            );
          })
        )}

        {/* Typing indicator */}
        {/* TODO: Implement typing state from WebSocket event */}
        {/* {otherUserIsTyping && <TypingIndicator userName={otherUser.name} />} */}

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
