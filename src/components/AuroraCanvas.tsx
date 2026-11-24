import React, { useEffect, useRef } from 'react';

export const AuroraCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle system for glowing ambient dust
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.4 - 0.1,
    }));

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.fillStyle = '#fbfaf7';
      ctx.fillRect(0, 0, width, height);

      // Draw primary glowing aurora ribbons using sine waves
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      // Paleta da UX Vision Academy em tom de papel: índigo, violeta e coral, bem suaves.
      const waves = [
        {
          color1: 'rgba(116, 104, 240, 0.07)', // Índigo
          color2: 'rgba(255, 122, 89, 0.04)', // Coral
          yOffset: height * 0.28,
          amplitude: 80,
          frequency: 0.0012,
          speed: 1,
        },
        {
          color1: 'rgba(122, 79, 224, 0.05)', // Violeta
          color2: 'rgba(75, 63, 217, 0.05)', // Índigo da marca
          yOffset: height * 0.38,
          amplitude: 110,
          frequency: 0.0009,
          speed: -1.2,
        },
        {
          color1: 'rgba(255, 122, 89, 0.04)', // Coral
          color2: 'rgba(116, 104, 240, 0.05)', // Índigo
          yOffset: height * 0.48,
          amplitude: 70,
          frequency: 0.0015,
          speed: 0.8,
        }
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.yOffset);

        for (let x = 0; x <= width; x += 15) {
          const y =
            wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.cos(x * 0.0005 - time * 0.5) * (wave.amplitude * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, width, wave.yOffset + wave.amplitude * 2);
        grad.addColorStop(0, wave.color1);
        grad.addColorStop(0.6, wave.color2);
        grad.addColorStop(1, 'rgba(251, 250, 247, 0)');

        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw floating ambient particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(75, 63, 217, ${0.35 * p.alpha * (0.6 + Math.sin(time + p.x) * 0.4)})`;
        ctx.fill();
      });

      ctx.restore();

      // Quem pediu menos movimento recebe um único quadro estático.
      if (prefersReducedMotion) return;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80 transition-opacity duration-1000"
    />
  );
};
