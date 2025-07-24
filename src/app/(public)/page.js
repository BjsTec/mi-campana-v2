// src/app/(public)/page.js
// Este es un Server Component por defecto, no necesita 'use client' a menos que uses hooks.

import Header from '../../components/landing/Header'
import HeroSection from '../../components/landing/HeroSection'
import FeaturesSection from '../../components/landing/FeaturesSection'
import AppShowcaseSection from '../../components/landing/AppShowcaseSection'
import PlansSection from '../../components/landing/PlansSection'
import PromoBonusSection from '../../components/landing/PromoBonusSection'
import ContactFormSection from '../../components/landing/ContactFormSection'
import Footer from '../../components/landing/Footer'

// Importa otros componentes de landing aquí a medida que los crees

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <AppShowcaseSection />
        <PlansSection />
        <PromoBonusSection />
        <ContactFormSection />
      </main>
      <Footer />
    </div>
  )
}
