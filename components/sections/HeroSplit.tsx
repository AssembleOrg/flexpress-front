'use client';

import { Shield, Speed, Star } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  fadeInRight,
  fadeInUp,
  staggerContainer,
  staggerItem,
} from '@/lib/animations/variants';

export function HeroSplit() {
  const router = useRouter();

  const trustBadges = [
    {
      icon: <Shield sx={{ fontSize: 24, color: '#DCA621' }} />,
      text: 'Conductores Verificados',
    },
    {
      icon: <Speed sx={{ fontSize: 24, color: '#DCA621' }} />,
      text: 'Conexión Inmediata',
    },
    {
      icon: <Star sx={{ fontSize: 24, color: '#DCA621' }} />,
      text: 'Seguimiento 24/7',
    },
  ];

  const MobileView = (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        minHeight: { xs: '90vh', md: '85vh' },
        backgroundColor: '#380116',
        color: 'white',
        textAlign: 'left',
        backgroundImage: 'url(/persona-hero.svg)',
        backgroundPosition: 'right center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
        {/* Logo and Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 1,
            mb: 4,
            mt: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              height: '3.5rem',
              width: '3.5rem',
              flexShrink: 0,
            }}
          >
            <Image
              src='/logo/flexpress-logo-blanco.svg'
              alt='Flexpress Logo'
              fill
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 200,
              color: 'white',
              letterSpacing: '0.15em',
            }}
          >
            Flexpress
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant='h2'
          component='h1'
          sx={{
            fontSize: '2.8rem',
            fontWeight: 700,
            mb: 1,
            ml: 1,
            lineHeight: 1.1,
            color: 'white',
          }}
        >
          Fletes urbanos
        </Typography>
        <Typography
          variant='h2'
          sx={{
            fontSize: '2.6rem',
            fontWeight: 700,
            mb: 3,
            ml: 1,
            lineHeight: 1.1,
            color: '#DCA621',
          }}
        >
          rápidos y seguros
        </Typography>

        {/* Trust Badges */}
        <Box
          display='flex'
          flexDirection='column'
          gap={1.5}
          sx={{ ml: 1 }}
        >
          {trustBadges.map((badge) => (
            <Box
              key={badge.text}
              display='flex'
              alignItems='center'
              justifyContent='flex-start'
              gap={1}
            >
              {badge.icon}
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  color: 'white',
                  fontSize: '1rem',
                }}
              >
                {badge.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Buttons */}
      <Box
        display='flex'
        flexDirection='row'
        gap={4}
        sx={{
          width: '100%',
          position: 'relative',
          zIndex: 2,
          alignItems: 'center',
          justifyContent: 'center',
          mb: 5,
        }}
      >
        <Button
          variant='contained'
          color='secondary'
          size='medium'
          onClick={() => router.push('/login?redirect=/client/dashboard')}
          sx={{
            py: 2,
            px: 2,
            fontSize: '1rem',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(220, 166, 33, 0.3)',
            flex: 1,
            minWidth: '100px',
            maxWidth: '140px',
            '&:hover': {
              boxShadow: '0 15px 40px rgba(220, 166, 33, 0.4)',
            },
          }}
        >
          Solicitar Flete
        </Button>
        <Button
          variant='contained'
          color='secondary'
          size='medium'
          onClick={() => router.push('/login?redirect=/driver/dashboard')}
          sx={{
            py: 2,
            px: 2,
            fontSize: '1rem',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(220, 166, 33, 0.3)',
            flex: 1,
            minWidth: '100px',
            maxWidth: '140px',
            '&:hover': {
              boxShadow: '0 15px 40px rgba(220, 166, 33, 0.4)',
            },
          }}
        >
          Ser Conductor
        </Button>
      </Box>
    </Box>
  );

  const DesktopView = (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        position: 'relative',
        minHeight: '50vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#380116',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        display='flex'
        gap={2}
        alignItems='center'
        sx={{
          width: '100%',
          flexDirection: 'row',
          position: 'relative',
          zIndex: 2,
          padding: 0,
          justifyContent: 'center',
        }}
      >
        {/* Left Content (60%) */}
        <motion.div
          style={{
            flex: '1 1 60%',
            width: '100%',
          }}
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
            }}
          >
            {/* Logo and Brand */}
            <motion.div variants={fadeInUp}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: '2.5rem',
                    width: '2.5rem',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src='/logo/flexpress-logo-blanco.svg'
                    alt='Flexpress Logo'
                    fill
                    style={{
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: 'white',
                    letterSpacing: '0.05em',
                  }}
                >
                  Flexpress
                </Typography>
              </Box>
            </motion.div>

            {/* Main Title */}
            <motion.div variants={fadeInUp}>
              <Typography
                variant='h2'
                component='h1'
                sx={{
                  fontSize: '3.8rem',
                  fontWeight: 700,
                  mb: 2,
                  lineHeight: 1.1,
                  color: 'white',
                }}
              >
                Fletes urbanos{' '}
                <Box
                  component='span'
                  sx={{ color: '#DCA621' }}
                >
                  rápidos y seguros
                </Box>
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div variants={fadeInUp}>
              <Typography
                variant='h5'
                sx={{
                  mb: 3,
                  fontSize: '1.4rem',
                  maxWidth: 600,
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Conectamos personas que necesitan transportar objetos con
                conductores profesionales verificados en Buenos Aires
              </Typography>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={staggerContainer}
              initial='hidden'
              animate='visible'
              style={{ marginBottom: 32 }}
            >
              <Box
                display='flex'
                flexDirection='column'
                gap={2}
                sx={{ mb: 4 }}
              >
                {trustBadges.map((badge) => (
                  <motion.div
                    key={badge.text}
                    variants={staggerItem}
                  >
                    <Box
                      display='flex'
                      alignItems='center'
                      gap={2}
                    >
                      {badge.icon}
                      <Typography
                        variant='body1'
                        sx={{ fontWeight: 600, color: 'white' }}
                      >
                        {badge.text}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={staggerContainer}
              initial='hidden'
              animate='visible'
            >
              <Box
                display='flex'
                gap={2}
                sx={{
                  flexDirection: 'row',
                }}
              >
                <motion.div
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='contained'
                    color='secondary'
                    size='large'
                    onClick={() =>
                      router.push('/login?redirect=/client/dashboard')
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      boxShadow: '0 10px 30px rgba(220, 166, 33, 0.3)',
                      '&:hover': {
                        boxShadow: '0 15px 40px rgba(220, 166, 33, 0.4)',
                      },
                    }}
                  >
                    Solicitar Flete
                  </Button>
                </motion.div>
                <motion.div
                  variants={staggerItem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant='outlined'
                    size='large'
                    onClick={() =>
                      router.push('/login?redirect=/driver/dashboard')
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      color: 'white',
                      borderColor: 'white',
                      borderWidth: 2,
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderWidth: 2,
                      },
                    }}
                  >
                    Ser Conductor
                  </Button>
                </motion.div>
              </Box>
            </motion.div>
          </Box>
        </motion.div>

        {/* Right Image */}
        <motion.div
          style={{
            flex: '1 1 40%',
            position: 'relative',
          }}
          initial='hidden'
          animate='visible'
          variants={fadeInRight}
        >
          <Box
            sx={{
              position: 'relative',
              height: '80vh',
              width: '100%',
            }}
          >
            <Image
              src='/persona-hero.svg'
              alt='Persona con caja de envío'
              fill
              priority
              style={{
                objectFit: 'contain',
              }}
            />
          </Box>
        </motion.div>
      </Box>
    </Box>
  );

  return (
    <>
      {MobileView}
      {DesktopView}
    </>
  );
}
