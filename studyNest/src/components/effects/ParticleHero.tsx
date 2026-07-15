"use client";

import { useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useState } from "react";

export default function ParticleHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setReady(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 45,
          density: {
            enable: true,
            width: 1200,
            height: 800,
          },
        },
        color: {
          value: ["#38bdf8", "#06b6d4", "#8b5cf6"],
        },
        links: {
          enable: true,
          color: "#38bdf8",
          distance: 140,
          opacity: 0.18,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.8,
          outModes: {
            default: "bounce",
          },
        },
        opacity: {
          value: { min: 0.2, max: 0.6 },
        },
        size: {
          value: { min: 1, max: 4 },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 160,
            links: {
              opacity: 0.32,
            },
          },
        },
      },
      background: {
        color: "transparent",
      },
    }) as unknown as any,
    []
  );

  if (!ready) {
    return null;
  }

  return <Particles id="hero-particles" className="absolute inset-0 -z-10" options={options} />;
}
