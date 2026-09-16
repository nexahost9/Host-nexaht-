import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

interface NexaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

export const NexaLogo: React.FC<NexaLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = ''
}) => {
  const { settings } = useAuth();

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  // If user uploaded a custom logo image in Settings, render image
  if (settings?.logoUrl) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src={settings.logoUrl}
          alt={settings.companyName || 'Nexa Host'}
          className={`${iconSizes[size]} object-contain`}
        />
        {showText && (
          <span className={`font-extrabold tracking-wider font-['Rajdhani'] uppercase text-white ${textSizes[size]} ${textClassName}`}>
            {settings.companyName || 'Nexa Host'}
          </span>
        )}
      </div>
    );
  }

  // High-tech vector emblem for Nexa Host: Hexagonal core node with electric circuit connections
  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 blur-md group-hover:blur-lg transition-all duration-300" />
        
        {/* SVG Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nexaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="nodeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Hexagonal outer shield */}
          <polygon
            points="50,6 88,27 88,73 50,94 12,73 12,27"
            stroke="url(#nexaGrad)"
            strokeWidth="4"
            fill="#0b111e"
            strokeLinejoin="round"
          />

          {/* Internal circuit nodes */}
          <line x1="50" y1="20" x2="50" y2="38" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="62" x2="42" y2="52" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="72" y1="62" x2="58" y2="52" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Central stylized 'N' core server cube */}
          <polygon
            points="50,38 68,48 50,58 32,48"
            fill="url(#nodeGrad)"
            opacity="0.9"
          />
          <polygon
            points="32,48 50,58 50,78 32,68"
            fill="#0369a1"
            opacity="0.95"
          />
          <polygon
            points="68,48 50,58 50,78 68,68"
            fill="#4338ca"
            opacity="0.95"
          />

          {/* Tech Pulse dots */}
          <circle cx="50" cy="20" r="3.5" fill="#22d3ee" className="animate-pulse" />
          <circle cx="28" cy="62" r="3" fill="#38bdf8" />
          <circle cx="72" cy="62" r="3" fill="#a855f7" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-wider uppercase font-['Rajdhani'] text-white ${textSizes[size]} ${textClassName}`}>
              NEXA
            </span>
            <span className={`font-black tracking-wider uppercase font-['Rajdhani'] bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent ${textSizes[size]}`}>
              HOST
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.25em] text-cyan-400/80 font-mono -mt-1 font-semibold">
            HIGH PERFORMANCE VPS
          </span>
        </div>
      )}
    </div>
  );
};
