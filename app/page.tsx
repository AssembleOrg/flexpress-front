'use client';

import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Paper,
  Chip,
} from '@mui/material';
import {
  LocalShipping,
  Security,
  Speed,
  AttachMoney,
  Star,
  CheckCircle,
  Phone,
  Shield,
  VerifiedUser,
  CameraAlt,
  Support,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleSolicitarFlete = () => {
    router.push('/login?redirect=/client/dashboard');
  };

  const handleSoyCliente = () => {
    router.push('/login?redirect=/client/dashboard');
  };

  const handleSoyConductor = () => {
    router.push('/login?redirect=/driver/dashboard');
  };

  return (
    <Box>
      {/* Hero Section - Clean Design */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '100vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(135deg, rgba(230, 126, 34, 0.95) 0%, rgba(243, 156, 18, 0.95) 100%), url('/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
        }}
      >
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Box textAlign='center'>
            <Typography
              variant='h2'
              component='h1'
              sx={{
                fontSize: { xs: '2.2rem', md: '3.8rem' },
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.1,
              }}
            >
              Fletes urbanos{' '}
              <Box component='span' sx={{ color: '#FFD700' }}>
                rápidos y seguros
              </Box>
            </Typography>
            
            <Typography
              variant='h5'
              sx={{
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Conectamos personas que necesitan transportar objetos con conductores profesionales verificados en Buenos Aires
            </Typography>

            {/* Trust Indicators */}
            <Box display='flex' justifyContent='center' gap={4} mb={4} flexWrap='wrap'>
              {[
                { icon: <Shield sx={{ fontSize: 24 }} />, text: 'Conductores Verificados' },
                { icon: <Speed sx={{ fontSize: 24 }} />, text: 'Conexión Inmediata' },
                { icon: <Star sx={{ fontSize: 24 }} />, text: 'Seguimiento 24/7' },
              ].map((badge, i) => (
                <Box key={i} display='flex' alignItems='center' gap={1}>
                  {badge.icon}
                  <Typography variant='body1' sx={{ fontWeight: 600 }}>
                    {badge.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* CTAs */}
            <Box display='flex' gap={3} justifyContent='center' flexWrap='wrap'>
              <Button
                variant='contained'
                size='large'
                onClick={handleSolicitarFlete}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  px: 5,
                  py: 2,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Solicitar Flete
              </Button>
              
              <Button
                variant='outlined'
                size='large'
                onClick={handleSoyConductor}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  px: 4,
                  py: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Ser Conductor
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Sección Para Quién */}
      <Container
        maxWidth='lg'
        sx={{ py: 8 }}
      >
        <Typography
          variant='h3'
          textAlign='center'
          sx={{ fontWeight: 700, mb: 2 }}
        >
          ¿Para quién es Flexpress?
        </Typography>
        <Typography
          variant='h6'
          textAlign='center'
          color='text.secondary'
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Una plataforma diseñada para dos tipos de usuarios con necesidades
          complementarias
        </Typography>

        <Box
          display='flex'
          gap={4}
          sx={{ flexDirection: { xs: 'column', md: 'row' } }}
        >
          {/* Cliente Hero Card */}
          <Box
            flex={1}
            onClick={handleSoyCliente}
            sx={{
              position: 'relative',
              height: { xs: 300, md: 500 },
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                '& .hero-overlay': {
                  opacity: 0.8,
                },
                '& .hero-content': {
                  transform: 'translateY(-10px)',
                },
                '& .hover-cta': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
                '& .default-content': {
                  opacity: 0,
                  transform: 'translateY(10px)',
                },
              },
            }}
          >
            {/* Background Image */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/client.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Overlay */}
            <Box
              className='hero-overlay'
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                opacity: 0.6,
                transition: 'opacity 0.3s ease',
              }}
            />

            {/* Content */}
            <Box
              className='hero-content'
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                p: 4,
                textAlign: 'center',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Default Content */}
              <Box
                className='default-content'
                sx={{
                  transition: 'all 0.3s ease',
                }}
              >
                {/* <Typography
                  variant='h3'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Clientes
                </Typography> */}
                <Typography
                  variant='h6'
                  sx={{ mb: 3, color: 'white' }}
                >
                  ¿Necesitas transportar objetos por la ciudad?
                </Typography>

                <Box
                  display='flex'
                  flexDirection='column'
                  gap={1}
                  mb={3}
                >
                  {[
                    'Mudanzas pequeñas y medianas',
                    'Electrodomésticos y muebles',
                    'Productos para tu negocio',
                    'Objetos delicados o urgentes',
                  ]
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        gap={1}
                      >
                        <CheckCircle sx={{ fontSize: 18, color: '#E67E22' }} />
                        <Typography
                          variant='body2'
                          sx={{ color: 'white' }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Hover CTA */}
              <Box
                className='hover-cta'
                sx={{
                  position: 'absolute',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography
                  variant='h4'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Solicitar Flete
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ color: 'white' }}
                >
                  Hacé clic para empezar
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Conductor Hero Card */}
          <Box
            flex={1}
            onClick={handleSoyConductor}
            sx={{
              position: 'relative',
              height: { xs: 300, md: 500 },
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                '& .hero-overlay': {
                  opacity: 0.8,
                },
                '& .hero-content': {
                  transform: 'translateY(-10px)',
                },
                '& .hover-cta': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
                '& .default-content': {
                  opacity: 0,
                  transform: 'translateY(10px)',
                },
              },
            }}
          >
            {/* Background Image */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: "url('/conductor.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Overlay */}
            <Box
              className='hero-overlay'
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.4)',
                opacity: 0.6,
                transition: 'opacity 0.3s ease',
              }}
            />

            {/* Content */}
            <Box
              className='hero-content'
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                p: 4,
                textAlign: 'center',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Default Content */}
              <Box
                className='default-content'
                sx={{
                  transition: 'all 0.3s ease',
                }}
              >
                {/* <Typography
                  variant='h3'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Conductores
                </Typography> */}
                <Typography
                  variant='h6'
                  sx={{ mb: 3, color: 'white' }}
                >
                  ¿Tienes vehículo y quieres generar ingresos?
                </Typography>

                <Box
                  display='flex'
                  flexDirection='column'
                  gap={1}
                  mb={3}
                >
                  {[
                    'Trabajá en tus horarios libres',
                    'Ingresos adicionales garantizados',
                    'Verificación y aprobación requerida',
                    'Sin inversión inicial',
                  ]
                    .slice(0, 3)
                    .map((item, index) => (
                      <Box
                        key={index}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                        gap={1}
                      >
                        <CheckCircle sx={{ fontSize: 18, color: '#E67E22' }} />
                        <Typography
                          variant='body2'
                          sx={{ color: 'white' }}
                        >
                          {item}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Box>

              {/* Hover CTA */}
              <Box
                className='hover-cta'
                sx={{
                  position: 'absolute',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Typography
                  variant='h4'
                  sx={{ fontWeight: 700, mb: 2, color: '#E67E22' }}
                >
                  Empezar a Manejar
                </Typography>
                <Typography
                  variant='h6'
                  sx={{ color: 'white' }}
                >
                  Aplica y sé verificado
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>


      {/* Sección de Seguridad - Estilo PedidosYa */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
          py: 8,
        }}
      >
        <Container maxWidth='lg'>
          <Box
            textAlign='center'
            mb={6}
          >
            <Shield sx={{ fontSize: 60, color: 'white', mb: 2 }} />
            <Typography
              variant='h3'
              sx={{ fontWeight: 700, mb: 2, color: 'white' }}
            >
              En Flexpress, tu seguridad es{' '}
              <Box
                component='span'
                sx={{ color: '#FFD700' }}
              >
                nuestra prioridad
              </Box>
            </Typography>
            <Typography
              variant='h6'
              sx={{
                mb: 4,
                maxWidth: 700,
                mx: 'auto',
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Protección integral antes, durante y después de cada flete
            </Typography>
          </Box>

          <Box
            display='flex'
            gap={4}
            sx={{ flexDirection: { xs: 'column', md: 'row' } }}
          >
            {[
              {
                icon: <VerifiedUser sx={{ fontSize: 40 }} />,
                title: 'Conductores Verificados',
                description:
                  'Verificación de identidad, licencia de conducir y antecedentes penales',
                chip: '100% Verificados',
              },
              {
                icon: <CameraAlt sx={{ fontSize: 40 }} />,
                title: 'Seguimiento en Vivo',
                description:
                  'Monitoreá tu flete en tiempo real desde pickup hasta delivery',
                chip: 'GPS en Vivo',
              },
              {
                icon: <Support sx={{ fontSize: 40 }} />,
                title: 'Soporte 24/7',
                description:
                  'Línea directa de emergencia y equipo de soporte disponible siempre',
                chip: 'Siempre Disponible',
              },
            ].map((item, index) => (
              <Box
                key={index}
                flex={1}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Chip
                    label={item.chip}
                    color='primary'
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      fontWeight: 600,
                    }}
                  />

                  <Box sx={{ color: 'primary.main', mb: 2 }}>{item.icon}</Box>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                  >
                    {item.description}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          <Box
            textAlign='center'
            mt={4}
          >
            <Button
              variant='contained'
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Conocé más sobre Seguridad
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How it Works - Responsive Layout */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            textAlign='center'
            sx={{ fontWeight: 700, mb: 6 }}
          >
            ¿Cómo funciona el transporte de carga?
          </Typography>

          <Box
            display='flex'
            gap={4}
            sx={{ flexDirection: { xs: 'column', md: 'row' } }}
          >
            {[
              {
                step: '1',
                title: 'Describe tu carga',
                description: 'Especifica origen, destino, tipo de objetos, peso y dimensiones aproximadas',
                imageMobile: '[Screenshot Mobile: Formulario de carga]',
                imageDesktop: '[Screenshot Desktop: Formulario completo]',
                bgColor: '#E3F2FD'
              },
              {
                step: '2', 
                title: 'Conecta con transportistas',
                description: 'Conductores con vehículos adecuados te envían presupuestos',
                imageMobile: '[Screenshot Mobile: Lista transportistas]',
                imageDesktop: '[Screenshot Desktop: Grid de conductores]',
                bgColor: '#F3E5F5'
              },
              {
                step: '3',
                title: 'Seguimiento de tu flete',
                description: 'Monitorea la recolección y entrega de tu carga en tiempo real',
                imageMobile: '[Screenshot Mobile: Mapa tracking]',
                imageDesktop: '[Screenshot Desktop: Panel de seguimiento]',
                bgColor: '#E8F5E8'
              },
            ].map((step, index) => (
              <Box key={index} flex={1}>
                <Card sx={{ 
                  p: 4, 
                  bgcolor: step.bgColor,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  height: '100%'
                }}>
                  {/* Desktop Image */}
                  <Box
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      width: '100%',
                      height: 200,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography variant='body2' color='text.secondary' textAlign='center'>
                      {step.imageDesktop}
                    </Typography>
                  </Box>
                  
                  {/* Mobile Image */}
                  <Box
                    sx={{
                      display: { xs: 'flex', md: 'none' },
                      width: '100%',
                      height: 150,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      borderRadius: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography variant='body2' color='text.secondary' textAlign='center'>
                      {step.imageMobile}
                    </Typography>
                  </Box>
                  
                  <Box display='flex' alignItems='center' gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                      }}
                    >
                      {step.step}
                    </Box>
                    <Typography variant='h6' sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant='body2' color='text.secondary'>
                    {step.description}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Container maxWidth='md' sx={{ py: 8 }}>
        <Box textAlign='center'>
          <Typography
            variant='h3'
            sx={{ fontWeight: 700, mb: 3 }}
          >
            ¿Listo para transportar tu carga?
          </Typography>
          <Typography
            variant='h6'
            color='text.secondary'
            sx={{ mb: 5, maxWidth: 600, mx: 'auto' }}
          >
            Únete a la red de transporte de carga más confiable de Buenos Aires. Registrarse es completamente gratuito.
          </Typography>
          
          <Box display='flex' gap={3} justifyContent='center' flexWrap='wrap'>
            <Button
              variant='contained'
              size='large'
              onClick={handleSolicitarFlete}
              sx={{
                fontSize: '1.2rem',
                fontWeight: 600,
                px: 5,
                py: 2.5,
                background: 'linear-gradient(135deg, #E67E22 0%, #F39C12 100%)',
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Solicitar Flete
            </Button>
            
            <Button
              variant='outlined'
              size='large'
              onClick={handleSoyConductor}
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                px: 4,
                py: 2.5,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Ser Transportista
            </Button>
          </Box>
        </Box>
      </Container>

      
      {/* Footer - Minimal */}
      <Box sx={{ bgcolor: '#2c3e50', color: 'white', py: 3 }}>
        <Container maxWidth='sm'>
          <Box textAlign='center'>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
              Flexpress
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.8, mb: 2 }}>
              Fletes urbanos seguros y confiables
            </Typography>
            <Box display='flex' justifyContent='center' gap={3} mb={2}>
              <Typography variant='caption'>
                Términos
              </Typography>
              <Typography variant='caption'>
                Privacidad
              </Typography>
              <Typography variant='caption'>
                Soporte
              </Typography>
            </Box>
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              © 2025 Flexpress. Todos los derechos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
