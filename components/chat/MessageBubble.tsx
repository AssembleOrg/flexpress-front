'use client';

import { Avatar, Box, Typography } from '@mui/material';
import type { Message } from '@/lib/types/api';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean; // true if this message is from the current user
  senderAvatar?: string; // Avatar URL of the sender (only shown for other user)
  senderName?: string; // Name of sender for avatar fallback
}

/**
 * Message bubble component for chat
 * Shows different styles for own messages vs other user's messages
 * Now with avatar support for other user
 */
export function MessageBubble({
  message,
  isOwn,
  senderAvatar,
  senderName,
}: MessageBubbleProps) {
  // Validar estructura del mensaje
  if (!message?.content || !message?.createdAt) {
    console.warn('⚠️ [MessageBubble] Mensaje con datos incompletos:', message);
    return null;
  }

  const formatTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) {
        console.warn('⚠️ [MessageBubble] createdAt inválido:', createdAt);
        return '';
      }
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <Box
      display='flex'
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      mb={1}
      alignItems='flex-end'
      gap={1}
    >
      {/* Avatar (only for other user messages) */}
      {!isOwn && (
        <Avatar
          src={senderAvatar}
          alt={senderName || 'Usuario'}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'secondary.main',
            color: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {senderName?.[0] || 'U'}
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: '70%',
          borderRadius: 2,
          px: 2,
          py: 1,
          backgroundColor: isOwn ? 'primary.main' : 'grey.200',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        <Typography
          variant='body2'
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {message.content}
        </Typography>
        <Box
          display='flex'
          alignItems='center'
          gap={0.5}
          mt={0.5}
          justifyContent={isOwn ? 'flex-end' : 'flex-start'}
        >
          <Typography
            variant='caption'
            sx={{
              color: isOwn ? 'primary.contrastText' : 'text.secondary',
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
          {/* Message status indicator (only for own messages) */}
          {isOwn && (
            <Typography
              variant='caption'
              sx={{
                color: 'primary.contrastText',
                fontSize: '0.75rem',
              }}
            >
              {message.isRead ? '✓✓' : '✓'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
