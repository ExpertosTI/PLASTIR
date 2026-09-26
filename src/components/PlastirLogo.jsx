import React from 'react';

export const PlastirLogo = ({ className = "h-9 w-auto", showTagline = true, light = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon: Modern modular storage / geometric organization mark */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0058A3] to-[#003E75] shadow-md shadow-blue-900/30 border border-blue-400/30 flex-shrink-0">
        <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top lid / module */}
          <rect x="5" y="6" width="22" height="4" rx="2" fill="#FFDB00" />
          {/* Main container body */}
          <rect x="6" y="11" width="20" height="15" rx="3" stroke="white" strokeWidth="2.2" />
          {/* Snap latch clips */}
          <rect x="4" y="14" width="3" height="6" rx="1.5" fill="#FFDB00" />
          <rect x="25" y="14" width="3" height="6" rx="1.5" fill="#FFDB00" />
          {/* Organization inner grid lines */}
          <line x1="16" y1="13" x2="16" y2="24" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
          <line x1="8" y1="18" x2="24" y2="18" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
        </svg>
      </div>

      {/* Brand text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1 leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans uppercase">
            PLASTIR
          </span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FFDB00] text-slate-950 uppercase tracking-wider">
            RD
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] font-semibold text-blue-300 tracking-wider uppercase mt-0.5">
            Tienda por Departamentos
          </span>
        )}
      </div>
    </div>
  );
};
