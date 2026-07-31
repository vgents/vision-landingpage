import React, { useState, useEffect } from 'react';
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
import { OperatingSystem } from './types';

export default function App() {
  const [detectedOS, setDetectedOS] = useState<OperatingSystem>('windows');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedDownloadOS, setSelectedDownloadOS] = useState<'windows' | 'mac' | 'linux'>('windows');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setDetectedOS('mac');
      setSelectedDownloadOS('mac');
    } else if (userAgent.includes('linux')) {
      setDetectedOS('linux');
      setSelectedDownloadOS('linux');
    } else {
      setDetectedOS('windows');
      setSelectedDownloadOS('windows');
    }
  }, []);

  const handleOpenDownload = (os?: 'windows' | 'mac' | 'linux') => {
    if (os) {
      setSelectedDownloadOS(os);
    } else {
      setSelectedDownloadOS(detectedOS === 'unknown' ? 'windows' : (detectedOS as 'windows' | 'mac' | 'linux'));
    }
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

        {/* Download — macOS publicado, Linux e Windows em preparação */}
        <DownloadCenter onOpenDownload={handleOpenDownload} detectedOS={detectedOS} />

        {/* Biblioteca pública de projetos */}
        <PublicLibrarySection />

        {/* Pré-requisitos de instalação */}
        <SystemRequirements />

        {/* FAQ Accordion */}
        <FaqSection />

        {/* Footer */}
        <Footer onOpenDownload={handleOpenDownload} />

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
