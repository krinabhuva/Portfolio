import { useEffect, useRef, useCallback } from 'react';
import './DigitalMindscape.css';

/* ─── Palette ───────────────────────────────────────────────── */
const COLORS = {
  bg:           '#030712',      // Deep midnight black
  bgGradientEnd:'#070F22',      // Rich dark navy tint
  cyan:         '#06B6D4',      // Electric cyan
  cyanLight:    '#38BDF8',      // Sky cyan
  violet:       '#8B5CF6',      // Soft violet
  violetLight:  '#A78BFA',      // Lavender violet
  blue:         '#3B82F6',      // Deep electric blue
};

const rand    = (lo, hi) => lo + Math.random() * (hi - lo);
const lerp    = (a, b, t) => a + (b - a) * t;
const hex2rgb = (hex, a = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

export default function DigitalMindscape() {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);

  /* ─── Initialize simulation state ──────────────────────────── */
  const buildState = useCallback((w, h) => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speedMult = reducedMotion ? 0.25 : 1;

    /* 1. Soft Ambient Volumetric Light Orbs */
    const orbs = [
      {
        x: w * 0.2, y: h * 0.25,
        r: Math.min(w, h) * 0.45,
        vx: 0.15 * speedMult, vy: 0.1 * speedMult,
        color: COLORS.cyan, opacity: 0.14,
        pulsePhase: 0, pulseSpeed: 0.01 * speedMult,
      },
      {
        x: w * 0.8, y: h * 0.7,
        r: Math.min(w, h) * 0.5,
        vx: -0.12 * speedMult, vy: -0.08 * speedMult,
        color: COLORS.violet, opacity: 0.16,
        pulsePhase: Math.PI * 0.5, pulseSpeed: 0.008 * speedMult,
      },
      {
        x: w * 0.5, y: h * 0.85,
        r: Math.min(w, h) * 0.38,
        vx: 0.08 * speedMult, vy: -0.14 * speedMult,
        color: COLORS.blue, opacity: 0.12,
        pulsePhase: Math.PI, pulseSpeed: 0.012 * speedMult,
      },
    ];

    /* 2. Soft Flowing Energy Light Waves */
    const waveCount = 5;
    const waves = Array.from({ length: waveCount }, (_, i) => ({
      yRatio: 0.25 + i * 0.16,
      amplitude: rand(45, 90),
      frequency: rand(0.0012, 0.0028),
      speed: rand(0.004, 0.012) * speedMult,
      phase: rand(0, Math.PI * 2),
      lineWidth: rand(1.8, 3.5),
      color: i % 2 === 0 ? COLORS.cyan : COLORS.violet,
      opacity: rand(0.12, 0.28),
    }));

    /* 3. Floating Digital Dust Particles */
    const particleCount = Math.floor(Math.min(w, h) * 0.075);
    const particles = Array.from({ length: Math.max(45, particleCount) }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.4),
      vx: rand(-0.15, 0.15) * speedMult,
      vy: rand(-0.25, -0.05) * speedMult,
      opacity: rand(0.15, 0.65),
      twinklePhase: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.01, 0.035) * speedMult,
      color: Math.random() < 0.65 ? COLORS.cyanLight : COLORS.violetLight,
    }));

    /* 4. Elegant Vertical Data-Stream Beams (Soft Shimmers) */
    const beamCount = 8;
    const beams = Array.from({ length: beamCount }, () => ({
      x: rand(0, w),
      width: rand(20, 90),
      heightRatio: rand(0.3, 0.7),
      y: rand(0, h),
      vy: rand(-0.3, -0.8) * speedMult,
      opacity: rand(0.03, 0.09),
      color: Math.random() < 0.5 ? COLORS.cyan : COLORS.violet,
    }));

    return {
      w, h, reducedMotion,
      orbs, waves, particles, beams,
      mouse: { x: w / 2, y: h / 2 },
      parallaxOffset: { x: 0, y: 0 },
      tick: 0,
    };
  }, []);

  /* ─── Render single frame ──────────────────────────────────── */
  const drawFrame = useCallback((ctx, s) => {
    const { w, h, orbs, waves, particles, beams, tick, parallaxOffset } = s;
    const px = parallaxOffset.x;
    const py = parallaxOffset.y;

    /* Base deep midnight gradient */
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, COLORS.bg);
    bgGrad.addColorStop(0.5, COLORS.bgGradientEnd);
    bgGrad.addColorStop(1, COLORS.bg);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    /* 1. Volumetric Light Orbs with Mouse Parallax */
    ctx.save();
    ctx.translate(px * 0.4, py * 0.4);
    for (const orb of orbs) {
      const pulse = 0.85 + 0.15 * Math.sin(orb.pulsePhase);
      const rad = orb.r * pulse;
      const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, rad);
      g.addColorStop(0, hex2rgb(orb.color, orb.opacity * pulse));
      g.addColorStop(0.5, hex2rgb(orb.color, orb.opacity * 0.3 * pulse));
      g.addColorStop(1, 'rgba(3,7,18,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    /* 2. Vertical Data Light Beams (Soft Shimmers) */
    ctx.save();
    ctx.translate(px * 0.2, py * 0.2);
    for (const b of beams) {
      const bGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + h * b.heightRatio);
      bGrad.addColorStop(0, 'rgba(3,7,18,0)');
      bGrad.addColorStop(0.5, hex2rgb(b.color, b.opacity));
      bGrad.addColorStop(1, 'rgba(3,7,18,0)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(b.x, b.y, b.width, h * b.heightRatio);
    }
    ctx.restore();

    /* 3. Soft Flowing Light Waves (Auroral Energy Waves) */
    ctx.save();
    ctx.translate(px * 0.6, py * 0.6);
    ctx.globalCompositeOperation = 'screen';
    for (const wave of waves) {
      const baseY = h * wave.yRatio;
      ctx.beginPath();
      ctx.moveTo(0, baseY);

      for (let x = 0; x <= w; x += 15) {
        const sinVal = Math.sin(x * wave.frequency + wave.phase);
        const cosVal = Math.cos(x * wave.frequency * 0.7 + wave.phase * 0.8);
        const y = baseY + sinVal * wave.amplitude + cosVal * (wave.amplitude * 0.4);
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = hex2rgb(wave.color, wave.opacity);
      ctx.lineWidth = wave.lineWidth;
      ctx.stroke();

      /* Soft wave glow line */
      ctx.strokeStyle = hex2rgb(wave.color, wave.opacity * 0.35);
      ctx.lineWidth = wave.lineWidth * 3.5;
      ctx.stroke();
    }
    ctx.restore();

    /* 4. Ambient Floating Micro Particles */
    ctx.save();
    ctx.translate(px * 0.8, py * 0.8);
    ctx.globalCompositeOperation = 'source-over';
    for (const p of particles) {
      const twinkle = 0.4 + 0.6 * Math.sin(p.twinklePhase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = hex2rgb(p.color, p.opacity * twinkle);
      ctx.fill();

      /* Micro glow around slightly larger particles */
      if (p.r > 1.8) {
        const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        pGlow.addColorStop(0, hex2rgb(p.color, p.opacity * 0.4 * twinkle));
        pGlow.addColorStop(1, 'rgba(3,7,18,0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    /* 5. Ambient Depth Vignette */
    const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.85);
    vig.addColorStop(0, 'rgba(3,7,18,0)');
    vig.addColorStop(1, 'rgba(3,7,18,0.65)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }, []);

  /* ─── Simulation Step ───────────────────────────────────────── */
  const updateState = useCallback((s) => {
    const { w, h, orbs, waves, particles, beams } = s;
    s.tick += 1;

    /* Move ambient orbs */
    for (const orb of orbs) {
      orb.x += orb.vx;
      orb.y += orb.vy;
      orb.pulsePhase += orb.pulseSpeed;

      if (orb.x < w * 0.05 || orb.x > w * 0.95) orb.vx *= -1;
      if (orb.y < h * 0.05 || orb.y > h * 0.95) orb.vy *= -1;
    }

    /* Animate flowing waves */
    for (const wave of waves) {
      wave.phase += wave.speed;
    }

    /* Move particles */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinklePhase += p.twinkleSpeed;

      if (p.y < -10) p.y = h + 10;
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
    }

    /* Move data beams */
    for (const b of beams) {
      b.y += b.vy;
      if (b.y + h * b.heightRatio < -50) {
        b.y = h + rand(20, 100);
        b.x = rand(0, w);
      }
    }

    /* Smooth lerp for mouse parallax */
    const factor = s.reducedMotion ? 0.003 : 0.015;
    const targetX = (s.mouse.x - s.w / 2) * factor;
    const targetY = (s.mouse.y - s.h / 2) * factor;
    s.parallaxOffset.x = lerp(s.parallaxOffset.x, targetX, 0.05);
    s.parallaxOffset.y = lerp(s.parallaxOffset.y, targetY, 0.05);
  }, []);

  /* ─── Main canvas effect hook ──────────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* Size canvas with HiDPI / Retina support */
    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.imageSmoothingEnabled = true;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current = buildState(w, h);
    };
    setSize();

    /* Mouse & Touch listeners for subtle interaction */
    const onMouseMove = (e) => {
      if (stateRef.current) {
        stateRef.current.mouse.x = e.clientX;
        stateRef.current.mouse.y = e.clientY;
      }
    };

    const onTouchMove = (e) => {
      if (stateRef.current && e.touches[0]) {
        stateRef.current.mouse.x = e.touches[0].clientX;
        stateRef.current.mouse.y = e.touches[0].clientY;
      }
    };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setSize, 180);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize',    onResize);

    /* Animation Loop */
    let rafId;
    let lastTime = 0;
    const fpsLimit = 1000 / 60;

    const loop = (time) => {
      rafId = requestAnimationFrame(loop);
      const dt = time - lastTime;
      if (dt < fpsLimit - 2) return;
      lastTime = time;

      const s = stateRef.current;
      if (!s) return;

      updateState(s);
      drawFrame(ctx, s);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize',    onResize);
    };
  }, [buildState, drawFrame, updateState]);

  return (
    <div className="digital-mindscape" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
