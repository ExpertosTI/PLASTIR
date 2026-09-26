import React from 'react';

export const PlastirLogo = ({ 
  className = "h-8 sm:h-9 w-auto", 
  showTagline = false, 
  light = false 
}) => {
  // Use logo-for-white-bg.png by default (orange running basket, charcoal text, orange RD emblem)
  // Use logo-original.png if explicitly rendered on dark backgrounds
  const logoSrc = light ? '/logo-original.png' : '/logo-for-white-bg.png';

  return (
    <div className="flex items-center gap-2 select-none group">
      <img
        src={logoSrc}
        alt="PLASTIR RD | Artículos para el Hogar y Organización"
        className={`${className} object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
      />
      {showTagline && (
        <span className="hidden sm:inline-block text-[10px] font-bold text-slate-500 tracking-wider uppercase border-l border-slate-200 pl-2">
          Hogar & Organización
        </span>
      )}
    </div>
  );
};

