"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

interface SceneProps {
  className?: string;
  color?: string;
}

/**
 * Utility: Generate stable random seeds for a component instance
 */
const useRandomValues = (count: number) => {
  return useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 20,
      opacity: 0.1 + Math.random() * 0.4,
      rotation: Math.random() * 360,
    }));
  }, [count]);
};

/**
 * 1. HERO SCENE: Energy Lines + Glowing Particles + Logo Centric Flow
 */
export const HeroScene = ({ className = "", color = "#E10600" }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const particles = useRandomValues(15);
  const lines = useRandomValues(8);

  // Scroll Reactivity
  const rotateSpring = useSpring(useTransform(scrollYProgress, [0, 1], [0, 45]), { stiffness: 50, damping: 30 });
  const scaleSpring = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.2]), { stiffness: 50, damping: 30 });

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* BACKGROUND: Slow Energy Waves */}
      <motion.div style={{ scale: scaleSpring }} className="absolute inset-x-[-10%] bottom-0 h-[60%] opacity-10">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
          <motion.path
            d="M0 50 Q 250 0, 500 50 T 1000 50"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            animate={{ 
              d: [
                "M0 50 Q 250 20, 500 50 T 1000 50",
                "M0 50 Q 250 80, 500 50 T 1000 50",
                "M0 50 Q 250 20, 500 50 T 1000 50"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* MID LAYER: Rotating Energy Spirals */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div style={{ rotate: rotateSpring }} className="relative w-[150%] aspect-square opacity-[0.05]">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-[0.5px] rounded-full"
              style={{ 
              borderColor: i % 2 === 0 ? color : "#FFFFFF",
                scale: 0.8 + i * 0.2
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 40 + i * 20, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </motion.div>
      </div>

      {/* FRONT LAYER: Glowing Floating Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 2 + p.scale,
            height: 2 + p.scale,
            backgroundColor: i % 2 === 0 ? color : "#FFFFFF",
            opacity: p.opacity,
          }}
          animate={{
            y: ["0%", "-30%", "0%"],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * 2. SERVICES SCENE: Technical Blueprint Grids + Pulsing Tech Nodes
 */
export const ServicesScene = ({ className = "", color = "#E10600" }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const nodes = useRandomValues(10);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* BACKGROUND: Adaptive Grid */}
      <motion.div style={{ y: gridY }} className="absolute inset-[-10%] opacity-[0.03]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="sceneGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke={color} strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1" fill={color} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#sceneGrid)" />
        </svg>
      </motion.div>

      {/* MID LAYER: Pulsing Nodes */}
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center justify-center"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <motion.div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: n.delay }}
          />
          <motion.div 
            className="absolute inset-[-10px] border-[0.5px] rounded-full"
            style={{ borderColor: color }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: n.delay }}
          />
        </motion.div>
      ))}

      {/* FRONT LAYER: Technical Sliding Lines */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[0.5px] h-full bg-gradient-to-b from-transparent via-[#000000] to-transparent opacity-10"
          style={{ left: `${30 + i * 20}%` }}
          animate={{ y: ["-100%", "100%"] }}
          transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear", delay: i }}
        />
      ))}
    </div>
  );
};

/**
 * 3. PROJECTS SCENE: Parallax Floating Shapes + Soft Glowing Orbs
 */
export const ProjectsScene = ({ className = "", color = "#E10600" }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const orbs = useRandomValues(4);
  const shapes = useRandomValues(6);

  // Parallax Values
  const yFast = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const ySlow = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* BACKGROUND: Soft Glow Orbs */}
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          style={{ 
            left: `${o.x}%`, 
            top: `${o.y}%`, 
            y: ySlow,
            backgroundColor: i % 2 === 0 ? color : "#000000"
          }}
          className="absolute w-96 h-96 rounded-full blur-[100px] opacity-[0.04]"
          animate={{ scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* MID LAYER: Floating Geometric Outlines */}
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          style={{ 
            left: `${s.x}%`, 
            top: `${s.y}%`, 
            y: yFast,
            rotate: s.rotation
          }}
          className="absolute"
        >
          <div className="w-20 h-20 border-[0.5px] border-neutral-400 opacity-[0.15] rotate-45" />
          <motion.div 
            className="absolute inset-[-5px] border-[0.5px] border-[#E10600] opacity-[0.2]"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      ))}
    </div>
  );
};

/**
 * 4. CONTACT SCENE: Calm Minimalist Energy Waves
 */
export const ContactScene = ({ className = "", color = "#E10600" }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
        <motion.path
          d="M 0 50 C 250 100, 750 0, 1000 50"
          fill="none"
          stroke={color}
          strokeWidth="1"
          style={{ pathLength }}
        />
        <motion.path
          d="M 0 40 C 250 90, 750 -10, 1000 40"
          fill="none"
          stroke="#000000"
          strokeWidth="0.5"
          style={{ pathLength }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <motion.div 
          className="w-[80%] h-[80%] border-[20px] border-black rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

/**
 * GLOBAL ATMOSPHERE: Subtle Light Leaks & Shifting Glow
 */
/**
 * 5. CONTACT ULTRA: The ultimate cinematic experience for the contact page.
 * Combines technical grids, sweeping energy waves, and glowing node particles.
 */
export const ContactUltra = ({ className = "", color = "#E10600" }: SceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const nodes = useRandomValues(12);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scanLineY = useTransform(scrollYProgress, [0, 1], ["-10%", "110%"]);

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* GRID LAYER */}
      <motion.div style={{ y: gridY }} className="absolute inset-[-10%] opacity-[0.04]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="ultraGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={color} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ultraGrid)" />
        </svg>
      </motion.div>

      {/* ENERGY WAVES */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
        {[...Array(3)].map((_, i) => (
          <motion.path
            key={i}
            d={`M 0 ${40 + i * 10} C 250 ${20 + i * 20}, 750 ${80 - i * 20}, 1000 ${50 + i * 10}`}
            fill="none"
            stroke={i % 2 === 0 ? color : "#000000"}
            strokeWidth="1"
            animate={{ 
              d: [
                `M 0 ${40 + i * 10} C 250 ${20 + i * 20}, 750 ${80 - i * 20}, 1000 ${50 + i * 10}`,
                `M 0 ${50 + i * 10} C 250 ${80 - i * 20}, 750 ${20 + i * 20}, 1000 ${40 + i * 10}`,
                `M 0 ${40 + i * 10} C 250 ${20 + i * 20}, 750 ${80 - i * 20}, 1000 ${50 + i * 10}`
              ]
            }}
            transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* NODES & GLOWS */}
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ 
            left: `${n.x}%`, 
            top: `${n.y}%`,
            opacity: n.opacity
          }}
        >
          <motion.div 
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            animate={{ scale: [1, 2, 1], opacity: [0.1, 0.6, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, delay: n.delay }}
          />
        </motion.div>
      ))}

      {/* TECHNICAL SCAN LINE */}
      <motion.div 
        style={{ y: scanLineY }}
        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent opacity-20 shadow-[0_0_15px_#E10600]"
      />
    </div>
  );
};

export const GlobalAtmosphere = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden pointer-events-none">
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E10600]/[0.015] blur-[150px] rounded-full" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/[0.01] blur-[150px] rounded-full" />
    </div>
  );
};

// Aliases for compatibility
export const HeroAdvanced = HeroScene;
export const ServicesAdvanced = ServicesScene;
export const PromoAdvanced = ProjectsScene;
export const GlobalFlow = GlobalAtmosphere;
