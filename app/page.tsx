"use client";

import { Box } from "@mui/material";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { ForWho } from "@/components/sections/ForWho";
import { HeroSplit } from "@/components/sections/HeroSplit";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Security } from "@/components/sections/Security";

export default function Home() {
  return (
    <Box>
      {/* Hero Section - Split Layout with Animations */}
      <HeroSplit />

      {/* Sección Para Quién - Component */}
      <ForWho />

      {/* Sección de Seguridad */}
      <Security />

      {/* How it Works - Timeline Zigzag */}
      <HowItWorks />

      {/* Final CTA Section */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </Box>
  );
}
