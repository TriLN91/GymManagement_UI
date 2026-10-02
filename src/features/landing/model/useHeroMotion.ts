import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';

import type { HeroMotion } from './types';

gsap.registerPlugin(ScrollTrigger);

export function useHeroMotion(
  root: React.RefObject<HTMLElement | null>,
  motion: React.RefObject<HeroMotion>,
) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      {
        animate: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const hero = root.current;
        if (!hero) return;
        const current = motion.current;
        const stage = hero.querySelector<HTMLElement>('.fit-hero-stage');
        current.progress = 0;
        current.floatTime = 0;
        current.reveal = 1;
        current.invalidate();
        if (context.conditions?.reduced) return;

        let inView = true;
        const observer = new IntersectionObserver(([entry]) => {
          inView = entry?.isIntersecting ?? false;
        });
        observer.observe(hero);
        const tick = (time: number) => {
          if (!inView || document.hidden) return;
          current.floatTime = time;
          current.invalidate();
        };
        gsap.ticker.add(tick);
        gsap.from('.fit-hero-reveal', {
          y: 28,
          opacity: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: 'power3.out',
        });
        gsap.fromTo(
          current,
          { reveal: 0 },
          { reveal: 1, duration: 2.2, ease: 'power3.out', onUpdate: () => current.invalidate() },
        );
        gsap.from('.fit-object', { opacity: 0, duration: 1.2, delay: 0.15 });
        const story = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            pin: stage,
            start: 'top 88px',
            end: () => '+=' + Math.max(1500, window.innerHeight * 2),
            scrub: 1.05,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        story.to(
          current,
          {
            progress: 1,
            duration: 1,
            ease: 'none',
            onUpdate: () => {
              current.invalidate();
              // Keep the product movement visible even on browsers without WebGL.
              const p = current.progress;
              gsap.set('.fit-dumbbell-fallback', {
                xPercent: Math.sin(p * Math.PI * 2) * -24 + p * 18,
                yPercent: -p * p * 45,
                rotation: -25 + p * 80,
                scale: 1 - p * 0.18,
              });
            },
          },
          0,
        );
        story.to('.fit-hero-title h1', { opacity: 0, y: -35, duration: 0.17 }, 0.02);
        story.to('.fit-hero-brand', { opacity: 0.07, xPercent: -12, y: -45, duration: 0.28 }, 0.02);
        story.fromTo('.fit-tracking', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16 }, 0.3);
        story.fromTo(
          '.fit-analysis-copy',
          { y: 45, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.18 },
          0.55,
        );
        story.to('.fit-tracking', { autoAlpha: 0, duration: 0.1 }, 0.82);
        story.to('.fit-object', { opacity: 0, duration: 0.12 }, 0.88);
        story.to('.fit-scene-progress', { scaleX: 1, duration: 1, ease: 'none' }, 0);
        return () => {
          observer.disconnect();
          gsap.ticker.remove(tick);
        };
      },
      root,
    );
    return () => media.revert();
  }, [root, motion]);
}
