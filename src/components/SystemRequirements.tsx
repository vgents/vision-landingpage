import React from 'react';
import { Monitor, Cpu, HardDrive, Terminal, KeyRound, Server } from 'lucide-react';
import { requirementsFor } from '../data/platforms';
import { OperatingSystem } from '../types';

interface SystemRequirementsProps {
  detectedOS: OperatingSystem;
}

const ICONS = { Monitor, Cpu, HardDrive, Terminal, KeyRound };

export const SystemRequirements: React.FC<SystemRequirementsProps> = ({ detectedOS }) => {
  const requirements = requirementsFor(detectedOS);

  return (
    <section id="requisitos" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <Server className="w-3.5 h-3.5" />
            <span>Antes de instalar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            O que você <span className="text-gradient-aurora font-semibold">precisa ter</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            O Vision Design é um app desktop comum em termos de hardware. O pré-requisito que
            realmente importa é o motor de IA — e ele é seu, não nosso.
          </p>
        </div>

        {/* Cards com rótulo e valor explícitos: legível em qualquer largura */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {requirements.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.label} className="glass-card glass-card-hover rounded-2xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-9 h-9 rounded-xl bg-accent-soft/50 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent-strong" />
                  </span>
                  <span className="text-xs uppercase tracking-wider text-muted">{item.label}</span>
                </div>

                <p className="text-sm text-cream-strong font-medium leading-snug mb-2">
                  {item.value}
                </p>

                {item.note && (
                  <p className="text-xs text-muted leading-relaxed">{item.note}</p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted text-center max-w-2xl mx-auto mt-8 leading-relaxed">
          Não publicamos mínimos de RAM, CPU ou GPU porque não medimos isso de forma confiável ainda.
          Se a sua máquina roda um editor de código moderno, roda o Vision Design.
        </p>
      </div>
    </section>
  );
};
