"use client";

import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Container, Typography } from "@mui/material";
import Link from "next/link";
import { PageTransition } from "@/components/ui/PageTransition";

export default function TerminosYCondicionesPage() {
  return (
    <PageTransition>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Header */}
        <Box mb={6}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              startIcon={<ArrowBack />}
              sx={{ mb: 3, color: "primary.main" }}
            >
              Volver al inicio
            </Button>
          </Link>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: "2rem", md: "3rem" },
              color: "primary.main",
            }}
          >
            Términos y Condiciones
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ fontSize: "1.1rem", mb: 4 }}
          >
            Última actualización: Octubre 2025
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            lineHeight: 1.8,
            "& h3": { mt: 4, mb: 2, color: "primary.main" },
          }}
        >
          {/* Section 1 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            1. Introducción
          </Typography>
          <Typography variant="body1" paragraph>
            Bienvenido a Flexpress. Estos Términos y Condiciones rigen el uso de
            nuestro sitio web, aplicación móvil y servicios. Al acceder y
            utilizar Flexpress, aceptas estos términos en su totalidad. Si no
            estás de acuerdo con alguna parte, te pedimos que no uses nuestros
            servicios.
          </Typography>

          {/* Section 2 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            2. Definiciones
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Cliente:</strong> Persona que solicita servicios de
            transporte a través de Flexpress.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Transportista:</strong> Persona propietaria de un vehículo
            que presta servicios de transporte en la plataforma.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Plataforma:</strong> El sitio web y aplicación móvil de
            Flexpress que conecta clientes con transportistas.
          </Typography>

          {/* Section 3 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            3. Elegibilidad y Registro
          </Typography>
          <Typography variant="body1" paragraph>
            Para usar Flexpress, debes ser mayor de 18 años y residente de
            Argentina. Los transportistas deben proporcionar información válida
            sobre su identidad, licencia de conducir y vehículo. Nos reservamos
            el derecho de verificar esta información y rechazar solicitudes si
            es necesario.
          </Typography>

          {/* Section 4 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            4. Responsabilidades de Clientes
          </Typography>
          <Typography variant="body1" paragraph>
            Los clientes son responsables de proporcionar descripciones precisas
            de sus cargas, incluyendo contenido, peso y dimensiones. El cliente
            acepta que Flexpress no es responsable por daños a objetos durante
            el transporte si no se declaran correctamente.
          </Typography>

          {/* Section 5 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            5. Responsabilidades de Transportistas
          </Typography>
          <Typography variant="body1" paragraph>
            Los transportistas deben mantener su vehículo en condiciones
            seguras, poseer licencia de conducir válida y cumplir con todas las
            leyes de tránsito. Deben tratar los artículos de los clientes con
            cuidado y completar los servicios como se acordó.
          </Typography>

          {/* Section 6 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            6. Seguridad y Privacidad
          </Typography>
          <Typography variant="body1" paragraph>
            Tu privacidad es importante para nosotros. Recopilamos y procesamos
            datos personales de acuerdo con nuestras políticas de privacidad.
            Utilizamos encriptación y medidas de seguridad para proteger tu
            información. Nunca compartiremos tus datos con terceros sin
            consentimiento.
          </Typography>

          {/* Section 7 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            7. Pagos y Disputas
          </Typography>
          <Typography variant="body1" paragraph>
            Los pagos se realizan a través de métodos seguros. Todos los precios
            son en pesos argentinos (ARS). En caso de disputa, ambas partes
            aceptan someterse a un proceso de mediación con Flexpress antes de
            acciones legales.
          </Typography>

          {/* Section 8 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            8. Limitación de Responsabilidad
          </Typography>
          <Typography variant="body1" paragraph>
            Flexpress proporciona la plataforma "tal como está" sin garantías de
            ningún tipo. No somos responsables por daños indirectos,
            incidentales o consecuentes resultantes del uso de nuestros
            servicios.
          </Typography>

          {/* Section 9 */}
          <Typography
            variant="h5"
            component="h3"
            sx={{ fontWeight: 600, mt: 4, mb: 2 }}
          >
            9. Modificaciones
          </Typography>
          <Typography variant="body1" paragraph>
            Nos reservamos el derecho de modificar estos términos en cualquier
            momento. Los cambios significativos serán notificados a través de la
            plataforma. Tu uso continuado de Flexpress implica aceptación de los
            términos modificados.
          </Typography>

          {/* Section 10 */}
          {/* <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
            10. Contacto
          </Typography>
          <Typography variant="body1" paragraph>
            Para preguntas sobre estos términos, puedes contactarnos a través de nuestra plataforma o enviando
            un email a soporte@flexpress.com.ar
          </Typography> */}

          {/* Footer Note */}
          <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
            <Typography variant="caption" color="text.secondary">
              Al hacer clic en "Aceptar", confirmas que has leído, comprendido y
              aceptas estar vinculado por estos Términos y Condiciones.
            </Typography>
          </Box>
        </Box>

        {/* Back Button */}
        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="primary" size="large">
              Volver al inicio
            </Button>
          </Link>
        </Box>
      </Container>
    </PageTransition>
  );
}
