import React from 'react';
import './WatercolorPortrait.css';

/**
 * Butterfly SVG Vector Icon
 */
const Butterfly = ({ className = '', style = {}, color = '#a855f7' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`butterfly-icon ${className}`}
    style={{ color, ...style }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 12C10.5 9 7 4 3.5 5.5C1.5 6.5 1 9 2.5 11C3.5 12.5 6 13.5 11.5 12.5C6 14.5 3 17.5 4 19.5C4.8 21 7.5 21 10.5 17.5C12 15.5 12 13 12 12Z"
      opacity="0.85"
    />
    <path
      d="M12 12C13.5 9 17 4 20.5 5.5C22.5 6.5 23 9 21.5 11C20.5 12.5 18 13.5 12.5 12.5C18 14.5 21 17.5 20 19.5C19.2 21 16.5 21 13.5 17.5C12 15.5 12 13 12 12Z"
      opacity="0.85"
    />
    <path
      d="M12 6C12 6 11.6 10 12 12.5C12.4 10 12 6 12 6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Floral SVG 1: Rose / Peony Blossom
 */
const FlowerRose = ({ color = '#ec4899', centerColor = '#fef08a', className = '', style = {} }) => (
  <svg viewBox="0 0 60 60" className={`flower-svg ${className}`} style={style} xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="26" fill={color} opacity="0.25" />
    <path d="M30 6 C37 18, 54 18, 46 30 C54 42, 37 42, 30 54 C23 42, 6 42, 14 30 C6 18, 23 18, 30 6 Z" fill={color} opacity="0.75" />
    <path d="M30 12 C38 21, 48 26, 38 36 C36 46, 24 46, 22 36 C12 26, 22 21, 30 12 Z" fill={color} opacity="0.9" />
    <circle cx="30" cy="30" r="7" fill={centerColor} />
  </svg>
);

/**
 * Floral SVG 2: Daisy / Anemone Blossom
 */
const FlowerDaisy = ({ petalColor = '#3b82f6', centerColor = '#f59e0b', className = '', style = {} }) => (
  <svg viewBox="0 0 60 60" className={`flower-svg ${className}`} style={style} xmlns="http://www.w3.org/2000/svg">
    <g fill={petalColor} opacity="0.85">
      <ellipse cx="30" cy="12" rx="5" ry="11" />
      <ellipse cx="30" cy="48" rx="5" ry="11" />
      <ellipse cx="12" cy="30" rx="11" ry="5" />
      <ellipse cx="48" cy="30" rx="11" ry="5" />
      <ellipse cx="17.3" cy="17.3" rx="5" ry="11" transform="rotate(-45 17.3 17.3)" />
      <ellipse cx="42.7" cy="42.7" rx="5" ry="11" transform="rotate(-45 42.7 42.7)" />
      <ellipse cx="42.7" cy="17.3" rx="5" ry="11" transform="rotate(45 42.7 17.3)" />
      <ellipse cx="17.3" cy="42.7" rx="5" ry="11" transform="rotate(45 17.3 42.7)" />
    </g>
    <circle cx="30" cy="30" r="8" fill={centerColor} />
  </svg>
);

/**
 * Floral SVG 3: Leaf Branch Stem
 */
const LeafBranch = ({ leafColor = '#10b981', className = '', style = {} }) => (
  <svg viewBox="0 0 40 60" className={`leaf-svg ${className}`} style={style} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 60 Q22 30 20 0" stroke={leafColor} strokeWidth="3" fill="none" opacity="0.8" />
    <path d="M20 45 Q36 38 32 24 Q20 34 20 45 Z" fill={leafColor} opacity="0.8" />
    <path d="M20 35 Q4 28 8 14 Q20 24 20 35 Z" fill={leafColor} opacity="0.8" />
    <path d="M20 20 Q34 12 28 0 Q20 12 20 20 Z" fill={leafColor} opacity="0.8" />
  </svg>
);

/**
 * WatercolorPortrait Component
 *
 * Fully responsive portrait card component with multi-layered background,
 * glowing halo, watercolor splash blooms, floating butterflies, cutout drop shadow,
 * and bottom floral vignette framing.
 *
 * @param {Object} props
 * @param {string} props.userImage - Cutout photo URL with transparent background
 * @param {string} [props.altText="Portrait"] - Accessible alt description
 * @param {string} [props.className=""] - Additional container classes
 */
export default function WatercolorPortrait({
  userImage,
  altText = 'Portrait',
  className = '',
}) {
  return (
    /* 1. BASE CONTAINER */
    <div className={`watercolor-portrait-card ${className}`}>
      {/* 2. LAYER 1: ABSOLUTE BACKGROUND GRADIENT */}
      <div className="watercolor-bg-gradient" />

      {/* 3. LAYER 2: BACKGROUND SPLASH EFFECTS (WATERCOLOR BLOOMS) */}
      <div className="watercolor-bloom bloom-pink" />
      <div className="watercolor-bloom bloom-indigo" />
      <div className="watercolor-bloom bloom-amber" />

      {/* 4. LAYER 3: FLOATING BACKGROUND ELEMENTS (BUTTERFLIES) */}
      <div className="butterflies-layer">
        <Butterfly
          className="butterfly-1 animate-butterfly-1"
          style={{ top: '14%', left: '12%', opacity: 0.55, transform: 'rotate(-18deg)' }}
          color="#8b5cf6"
        />
        <Butterfly
          className="butterfly-2 animate-butterfly-2"
          style={{ top: '10%', right: '15%', opacity: 0.6, transform: 'rotate(22deg)' }}
          color="#ec4899"
        />
        <Butterfly
          className="butterfly-3 animate-butterfly-3"
          style={{ top: '30%', right: '10%', opacity: 0.45, transform: 'rotate(35deg)' }}
          color="#06b6d4"
        />
        <Butterfly
          className="butterfly-4 animate-butterfly-4"
          style={{ top: '26%', left: '8%', opacity: 0.5, transform: 'rotate(-25deg)' }}
          color="#f59e0b"
        />
      </div>

      {/* 5. LAYER 4: THE SUBJECT PORTRAIT */}
      <div className="subject-container">
        {userImage ? (
          <img
            src={userImage}
            alt={altText}
            className="subject-img"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
            No portrait image provided
          </div>
        )}
      </div>

      {/* 6. LAYER 5: FOREGROUND VIGNETTE & FLORAL FRAMING */}
      <div className="bottom-vignette-overlay" />

      <div className="floral-row">
        <div style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '-12px', marginBottom: '-4px', transform: 'rotate(-8deg)' }}>
          <LeafBranch leafColor="#10b981" />
          <FlowerRose color="#f43f5e" centerColor="#fef08a" className="flower-svg-md" style={{ marginLeft: '-12px', marginBottom: '-4px' }} />
        </div>
        <div style={{ transform: 'rotate(12deg) scale(1.1)', marginBottom: '-8px' }}>
          <FlowerDaisy petalColor="#6366f1" centerColor="#fbbf24" className="flower-svg-md" />
        </div>
        <div style={{ transform: 'scale(1.25)', marginBottom: '-12px' }}>
          <FlowerRose color="#ec4899" centerColor="#fde047" className="flower-svg-lg" />
        </div>
        <div style={{ transform: 'rotate(-15deg) scale(1.05)', marginBottom: '-4px' }}>
          <FlowerDaisy petalColor="#06b6d4" centerColor="#f59e0b" className="flower-svg-md" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', marginRight: '-12px', marginBottom: '-4px', transform: 'rotate(10deg)' }}>
          <FlowerRose color="#a855f7" centerColor="#fef08a" className="flower-svg-md" style={{ marginRight: '-12px', marginBottom: '-4px' }} />
          <LeafBranch leafColor="#059669" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </div>
    </div>
  );
}
