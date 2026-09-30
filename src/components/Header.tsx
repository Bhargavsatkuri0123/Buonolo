import React from "react";
import { ArrowLeft } from "lucide-react";
import { Theme } from "../types";
import { SAF } from "../constants";

export const PeanutLogo = ({ size = 24, className = "", monochrome = false }: { size?: number, className?: string, monochrome?: boolean }) => {
  const outlineColor = monochrome ? "currentColor" : "#FA5C38";
  const fillColor = monochrome ? "transparent" : "#FFDFBE";
  const patchColor = monochrome ? "currentColor" : "#FFA450";
  const eyeColor = monochrome ? "currentColor" : "#1E293B";
  const clipId = React.useId().replace(/:/g, "");
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 inline-block ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Meet Peanut Mascot">
      <defs>
        <clipPath id={`innerBody-${clipId}`}>
           <path 
            transform="translate(12.5, 12.5) scale(0.75)"
            d="M 35 48 
               C 33 40, 29 35, 29 26 
               C 29 14.4, 38.4 5, 50 5 
               C 61.6 5, 71 14.4, 71 26 
               C 71 35, 67 40, 65 48 
               C 63 56, 75 60, 75 70 
               C 75 83.8, 63.8 95, 50 95 
               C 36.2 95, 25 83.8, 25 70 
               C 25 60, 37 56, 35 48 Z" 
           />
        </clipPath>
      </defs>

      {/* Body - Perfect C1 continuous bezier peanut shape */}
      <path 
        d="M 35 48 
           C 33 40, 29 35, 29 26 
           C 29 14.4, 38.4 5, 50 5 
           C 61.6 5, 71 14.4, 71 26 
           C 71 35, 67 40, 65 48 
           C 63 56, 75 60, 75 70 
           C 75 83.8, 63.8 95, 50 95 
           C 36.2 95, 25 83.8, 25 70 
           C 25 60, 37 56, 35 48 Z" 
        fill={fillColor} 
        stroke={outlineColor} 
        strokeWidth={monochrome ? "9" : "8"} 
        strokeLinejoin="round" 
      />
      
      {/* Shell Patches */}
      {!monochrome && (
        <g clipPath={`url(#innerBody-${clipId})`} opacity={1}>
          {/* Top */}
          <rect x="0" y="0" width="46.5" height="32" rx="5" fill={patchColor} />
          <rect x="53.5" y="0" width="46.5" height="32" rx="5" fill={patchColor} />
          
          {/* Middle */}
          <rect x="0" y="49" width="46.5" height="18" rx="5" fill={patchColor} />
          <rect x="53.5" y="49" width="46.5" height="18" rx="5" fill={patchColor} />
          
          {/* Bottom */}
          <rect x="0" y="73" width="46.5" height="27" rx="5" fill={patchColor} />
          <rect x="53.5" y="73" width="46.5" height="27" rx="5" fill={patchColor} />
        </g>
      )}
      
      {/* Eyes */}
      <ellipse cx="42" cy="41.5" rx="4.5" ry="7.5" fill={eyeColor} />
      <ellipse cx="58" cy="41.5" rx="4.5" ry="7.5" fill={eyeColor} />
      {!monochrome && (
        <>
          <circle cx="43.5" cy="39" r="1.5" fill="#ffffff" />
          <circle cx="59.5" cy="39" r="1.5" fill="#ffffff" />
          {/* Friendly happy smile */}
          <path d="M 46 48.5 Q 50 52.5 54 48.5" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export const Face = ({ h = 22, color = "#fff" }: { h?: number; color?: string }) => (
  <svg height={h} viewBox="0 0 170 140" fill="none" style={{ display: "block" }}>
    <path d="M16 27 Q40 7 64 27" stroke={color} strokeWidth="14" strokeLinecap="round" />
    <path d="M106 27 Q130 7 154 27" stroke={color} strokeWidth="14" strokeLinecap="round" />
    <circle cx="40" cy="64" r="23" stroke={color} strokeWidth="15" />
    <circle cx="130" cy="64" r="23" stroke={color} strokeWidth="15" />
    <line x1="85" y1="36" x2="85" y2="90" stroke={color} strokeWidth="15" strokeLinecap="round" />
    <path d="M32 106 Q85 141 138 106" stroke={color} strokeWidth="13" strokeLinecap="round" />
  </svg>
);

export const AppIcon = ({ size = 56, className = "" }: { size?: number; className?: string }) => (
  <div 
    className={`rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E8] dark:from-neutral-800 dark:to-neutral-900 border border-orange-200/80 dark:border-neutral-700 overflow-hidden shrink-0 ${className}`} 
    style={{ width: size, height: size }}
  >
    <PeanutLogo size={Math.round(size * 0.72)} />
  </div>
);

export const Logo = ({ 
  onSaffron = false, 
  onClick, 
  size = 28, 
  showIcon = true,
  className = "" 
}: { 
  onSaffron?: boolean; 
  onClick?: () => void; 
  size?: number; 
  showIcon?: boolean; 
  className?: string; 
}) => (
  <div 
    className={`inline-flex items-center gap-2 select-none group ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`} 
    onClick={onClick}
    role={onClick ? "button" : undefined}
  >
    {showIcon && (
      <div className="transition-transform group-hover:scale-105 duration-200 shrink-0">
        <PeanutLogo size={Math.round(size * 1.15)} />
      </div>
    )}
    <div className="flex items-center gap-1 leading-none tracking-tighter" style={{ fontFamily: "'Baloo 2', cursive" }}>
      <span 
        className="font-extrabold text-slate-800 dark:text-white transition-colors" 
        style={{ 
          fontSize: `${size}px`, 
          color: onSaffron ? "#FFFFFF" : undefined 
        }}
      >
        meet
      </span>
      <span 
        className="font-extrabold text-[#FA5C38]" 
        style={{ 
          fontSize: `${size}px`, 
          color: onSaffron ? "#FFF1EC" : "#FA5C38" 
        }}
      >
        peanut
      </span>
    </div>
  </div>
);

interface HeaderProps {
  title?: React.ReactNode;
  back?: () => void;
  right?: React.ReactNode;
  onLogoClick?: () => void;
  T: Theme;
  className?: string;
  hideOnDesktop?: boolean;
}

export const Header = ({ title, back, right, onLogoClick, T, className = "", hideOnDesktop = false }: HeaderProps) => (
  <div className={`sticky top-0 z-20 ${T.bg} px-4 pt-4 pb-3 flex items-center justify-between ${hideOnDesktop ? 'md:hidden' : ''} ${className}`}>
    <div className="flex items-center gap-3">
      {back && (
        <button onClick={back} className={`p-1 rounded-full ${T.card2}`}>
          <ArrowLeft size={18} className={T.text} />
        </button>
      )}
      {title ? (
        <div className={`disp font-bold text-2xl ${T.text} flex items-center gap-2`}>{title}</div>
      ) : (
        <Logo onClick={onLogoClick} />
      )}
    </div>
    {right}
  </div>
);
