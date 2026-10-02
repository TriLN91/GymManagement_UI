import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useLayoutEffect } from 'react';

import type { LandingAudience } from './types';

gsap.registerPlugin(ScrollTrigger);

export function useLandingScroll(
  root: React.RefObject<HTMLDivElement | null>,
  audience: LandingAudience,
) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const lenis = new Lenis({
          lerp: 0.085,
          smoothWheel: true,
          syncTouch: false,
          anchors: { offset: -110, duration: 1.3 },
        });
        const tick = (seconds: number) => lenis.raf(seconds * 1000);
        const updateScroll = () => ScrollTrigger.update();
        lenis.on('scroll', updateScroll);
        gsap.ticker.add(tick);
        const sections = root.current?.querySelectorAll<HTMLElement>('.fit-section');
        sections?.forEach((section) => {
          const heading = section.querySelector('.fit-section-heading, .fit-section-label');
          if (!heading) return;
          gsap.fromTo(
            heading,
            { y: 38, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'power2.out',
              scrollTrigger: { trigger: section, start: 'top 88%', once: true },
            },
          );
        });
        const refresh = () => {
          lenis.resize();
          ScrollTrigger.refresh();
        };
        const frame = requestAnimationFrame(refresh);
        let disposed = false;
        void document.fonts.ready.then(() => {
          if (!disposed) refresh();
        });
        return () => {
          disposed = true;
          cancelAnimationFrame(frame);
          gsap.ticker.remove(tick);
          lenis.off('scroll', updateScroll);
          lenis.destroy();
        };
      },
      root,
    );
    return () => media.revert();
  }, [root, audience]);
}
