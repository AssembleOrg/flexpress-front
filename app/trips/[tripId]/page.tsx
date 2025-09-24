"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  CheckCircle,
  Cancel,
  Person,
  Star,
  AttachMoney,
} from "@mui/icons-material";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
};

const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "client-001",
    senderName: "María González",
    content: "Hola! Gracias por aceptar mi solicitud de flete.",
    timestamp: "14:30",
    isCurrentUser: false,
  },
  {
    id: "msg-2", 
    senderId: "driver-001",
    senderName: "Carlos Rodríguez",
    content: "¡Hola María! Un placer ayudarte. He visto que necesitas transportar cajas y una silla desde Palermo a San Telmo.",
    timestamp: "14:32",
    isCurrentUser: true,
  },
  {
    id: "msg-3",
    senderId: "client-001",
    senderName: "María González", 
    content: "Exacto. Son 2 cajas medianas con libros y una silla de escritorio pequeña. ¿El precio de $3500 te parece bien?",
    timestamp: "14:35",
    isCurrentUser: false,
  },
  {
    id: "msg-4",
    senderId: "driver-001",
    senderName: "Carlos Rodríguez",
    content: "Por el peso y la distancia, me parece justo. ¿A qué hora te vendría bien que pase a buscar?",
    timestamp: "14:38",
    isCurrentUser: true,
  }
];

const mockTripInfo = {
  id: "trip-001",
  status: "negotiating" as const,
  suggestedPrice: 3500,
  otherUser: {
    id: "client-001",
    name: "María González",
    avatar: "/avatars/maria.jpg",
    rating: 4.8,
    role: "Cliente" as const,
  }
};

export default function ChatNegotiationPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [bothConfirmed, setBothConfirmed] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const onSendMessage = (data: { message: string }) => {
    if (!data.message.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: "driver-001",
      senderName: "Carlos Rodríguez",
      content: data.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true,
    };

    setMessages(prev => [...prev, newMessage]);
    reset();
  };

  const handleConfirmTrip = () => {
    toast.success("¡Has confirmado el acuerdo!");
    
    setTimeout(() => {
      setBothConfirmed(true);
      toast.success("¡Viaje confirmado! Ambos usuarios han aceptado.", {
        duration: 5000,
      });
    }, 2000);
  };

  const handleCancelTrip = () => {
    toast.error("Has cancelado la negociación");
    // TODO: Redirigir al dashboard
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box mb={3}>
        <Link href="/driver/dashboard">
          <Button
            startIcon={<ArrowBack />}
            variant="outlined" 
            sx={{ mb: 2 }}
          >
            Volver al Dashboard
          </Button>
        </Link>
        
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Negociación de Flete
        </Typography>
      </Box>

      {/* Info del otro usuario */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={mockTripInfo.otherUser.avatar} sx={{ width: 48, height: 48 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {mockTripInfo.otherUser.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Star sx={{ fontSize: 16, color: "warning.main" }} />
                  <Typography variant="body2" color="text.secondary">
                    {mockTripInfo.otherUser.rating} • {mockTripInfo.otherUser.role}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box textAlign="right">
              <Box display="flex" alignItems="center" gap={1}>
                <AttachMoney sx={{ color: "success.main" }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${mockTripInfo.suggestedPrice.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Precio sugerido
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', mb: 3 }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                display="flex"
                justifyContent={message.isCurrentUser ? "flex-end" : "flex-start"}
                mb={1}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.isCurrentUser 
                      ? 'secondary.main' 
                      : 'grey.100',
                    color: message.isCurrentUser 
                      ? 'white' 
                      : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {message.senderName}
                  </Typography>
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'right', 
                      mt: 0.5,
                      opacity: 0.8 
                    }}
                  >
                    {message.timestamp}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Message Input */}
          <Box component="form" onSubmit={handleSubmit(onSendMessage)}>
            <Box display="flex" gap={1}>
              <TextField
                {...register("message")}
                placeholder="Escribe un mensaje..."
                fullWidth
                size="small"
              />
              <IconButton 
                type="submit" 
                color="secondary"
                sx={{ bgcolor: 'secondary.main', color: 'white' }}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      {!bothConfirmed ? (
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={handleCancelTrip}
            sx={{ flex: 1 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handleConfirmTrip}
            sx={{ flex: 1 }}
          >
            Confirmar Acuerdo
          </Button>
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              ¡Viaje Confirmado!
            </Typography>
            <Typography variant="body2">
              Ambos usuarios han confirmado el acuerdo. Pueden coordinar los detalles finales por aquí.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}