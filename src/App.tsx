import React, { useEffect, useRef, useState } from 'react';
import { AuroraCanvas } from './components/AuroraCanvas';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { InteractiveAppDemo } from './components/InteractiveAppDemo';
import { FeatureShowcase } from './components/FeatureShowcase';
import { DownloadCenter } from './components/DownloadCenter';
import { PublicLibrarySection } from './components/PublicLibrarySection';
import { SystemRequirements } from './components/SystemRequirements';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';
import { PricingSection } from './components/PricingSection';
import { PlansPage } from './pages/PlansPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutResultPage } from './pages/CheckoutResultPage';
import { CreatePasswordPage } from './pages/CreatePasswordPage';
import { useRoute, type Route } from './lib/router';
import { applyRouteMeta } from './lib/pageMeta';
import { detectOS } from './lib/detectOS';
import { SupportedOS } from './types';

export default function App() {
  /**
   * Resolvido no primeiro render, não em efeito: adaptar depois faria o
   * conteúdo de um sistema aparecer por um frame para quem está em outro.
   */
  const [detectedOS] = useState(detectOS);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedDownloadOS, setSelectedDownloadOS] = useState<SupportedOS>(
    detectedOS === 'unknown' ? 'mac' : detectedOS
  );

  const route = useRoute();

  const firstRoute = useRef(true);
  useEffect(() => {
    applyRouteMeta(route, !firstRoute.current);
    firstRoute.current = false;
  }, [route.name]);

  /**
   * Na landing, um `/#secao` vindo de outra página só rola depois que a seção
   * existe: o navegador tenta antes do React montar.
   */
  useEffect(() => {
    if (route.name !== 'home' || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [route]);

  const handleOpenDownload = (os?: SupportedOS) => {
    setSelectedDownloadOS(os ?? (detectedOS === 'unknown' ? 'mac' : detectedOS));
    setDownloadModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-ink text-cream font-sans">
      {/* Animated Glowing Aurora Canvas Background */}
      <AuroraCanvas />

      {/* Main Content Area */}
      <div className="relative z-10">
        {/* Navigation */}
        <Navbar onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

        {route.name === 'home' ? (
          <>
            {/* Hero Section */}
            <HeroSection onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

            {/* Demonstração do fluxo: inception, fluxo, documentação e protótipo */}
            <InteractiveAppDemo />

            {/* Funcionalidades reais do produto */}
            <FeatureShowcase />

            {/* Planos — os mesmos cartões da página /planos */}
            <PricingSection id="planos" />

            {/* Download — macOS, Windows e Linux publicados */}
            <DownloadCenter onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

            {/* Biblioteca pública de projetos */}
            <PublicLibrarySection />

            {/* Pré-requisitos de instalação */}
            <SystemRequirements detectedOS={detectedOS} />

            {/* FAQ Accordion */}
            <FaqSection detectedOS={detectedOS} />
          </>
        ) : (
          renderPage(route)
        )}

        {/* Footer */}
        <Footer onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

        {/* Download Progress Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          selectedOS={selectedDownloadOS}
        />
      </div>
    </div>
  );
}

function renderPage(route: Exclude<Route, { name: 'home' }>) {
  switch (route.name) {
    case 'planos':
      return <PlansPage />;
    case 'compra':
      return <CheckoutPage key={route.planId ?? ''} planId={route.planId} />;
    case 'compra-confirmada':
      return <CheckoutResultPage variant="confirmada" free={route.free} approved={route.approved} orderId={route.orderId} />;
    case 'compra-pendente':
      return <CheckoutResultPage variant="pendente" />;
    case 'compra-erro':
      return <CheckoutResultPage variant="erro" />;
    case 'criar-senha':
      return <CreatePasswordPage />;
  }
}
