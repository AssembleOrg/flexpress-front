'use client';

import { Shield, Speed, Star } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material'; // No se necesita Container
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

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: '100vh', md: '50vh' },
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#380116',
        color: 'white',
        overflow: 'hidden',
      }}
    >
      {/* El Container se elimina. El padding se controla aquí: */}
      <Box
        display='flex'
        gap={{ xs: 2, md: 2 }}
        alignItems='center'
        sx={{
          width: '100%',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* Left Content (60%) */}
        <motion.div
          style={{ flex: '1 1 60%' }}
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          <Box>
            {/* Main Title */}
            <motion.div variants={fadeInUp}>
              <Typography
                variant='h2'
                component='h1'
                sx={{
                  fontSize: { xs: '2.2rem', md: '3.8rem' },
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
                  fontSize: { xs: '0.95rem', md: '1.4rem' },
                  maxWidth: 600,
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  display: { xs: 'none', sm: 'block' },
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
              sx={{ display: { xs: 'none', md: 'block' } }}
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
                gap={{ xs: 1.5, md: 2 }}
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  mt: { xs: 2, md: 0 },
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
                    fullWidth
                    onClick={() =>
                      router.push('/login?redirect=/client/dashboard')
                    }
                    sx={{
                      py: { xs: 1.5, md: 1.5 },
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
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
                    fullWidth
                    onClick={() =>
                      router.push('/login?redirect=/driver/dashboard')
                    }
                    sx={{
                      py: { xs: 1.5, md: 1.5 },
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
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
          sx={{ display: { xs: 'none', md: 'block' } }}
          initial='hidden'
          animate='visible'
          variants={fadeInRight}
        >
          <Box
            sx={{
              position: 'relative',
              height: { md: '80vh' }, // La altura ahora es relativa al viewport height
              width: '100%',
            }}
          >
            <Image
              src='/persona-hero.svg'
              alt='Persona con caja de envío'
              fill
              priority
              style={{
                objectFit: 'contain', // Mantiene la proporción
              }}
            />
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
