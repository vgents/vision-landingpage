import React from 'react';
import { PricingSection } from '../components/PricingSection';

export const PlansPage: React.FC<{ notice?: string }> = ({ notice }) => (
  <main className="pt-20 sm:pt-24 min-h-[70vh]">
    <PricingSection notice={notice} />
  </main>
);
