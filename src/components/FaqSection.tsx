import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../data/softwareData';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0].id);

  const toggleFaq = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <section id="faq" className="py-16 sm:py-24 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/50 border border-accent/25 text-accent-strong text-xs uppercase tracking-widest mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Dúvidas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-cream-strong tracking-tight mb-5">
            Perguntas <span className="text-gradient-aurora font-semibold">frequentes</span>
          </h2>
          <p className="text-cream/75 text-sm sm:text-base leading-relaxed">
            O que costuma aparecer antes da instalação — motor de IA, onde ficam os arquivos e o que
            está publicado hoje.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="glass-card rounded-2xl overflow-hidden">
                <h3>
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`resposta-${faq.id}`}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-cream/[0.03] transition-colors"
                  >
                    <span className="flex flex-col gap-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-accent-strong">
                        {faq.category}
                      </span>
                      <span className="font-medium text-base sm:text-lg text-cream-strong leading-snug">
                        {faq.question}
                      </span>
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'rotate-180 bg-accent/20 border-accent/30 text-accent-strong'
                          : 'bg-cream/5 border-cream/10 text-muted'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={`resposta-${faq.id}`}
                    className="px-5 sm:px-6 pb-6 pt-4 text-cream/75 text-sm leading-relaxed border-t border-cream/8 bg-ink-deep/30"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
