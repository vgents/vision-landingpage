import React, { useState } from 'react';
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

        {/* Hero Section */}
        <HeroSection onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

        {/* Demonstração do fluxo: inception, fluxo, documentação e protótipo */}
        <InteractiveAppDemo />

        {/* Funcionalidades reais do produto */}
        <FeatureShowcase />

        {/* Download — macOS e Windows publicados, Linux em preparação */}
        <DownloadCenter onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

        {/* Biblioteca pública de projetos */}
        <PublicLibrarySection />

        {/* Pré-requisitos de instalação */}
        <SystemRequirements detectedOS={detectedOS} />

        {/* FAQ Accordion */}
        <FaqSection detectedOS={detectedOS} />

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
