import React from "react";
import { ArrowLeft } from "lucide-react";
import { Theme } from "../types";
import { SAF } from "../constants";
import meetPeanutLogo from "../assets/images/meetpeanut-logo.jpeg";
import meetPeanutIcon from "../assets/images/meetpeanut-icon.jpeg";

export const PeanutLogo = ({ size = 24, className = "", monochrome = false }: { size?: number, className?: string, monochrome?: boolean }) => {
  const outlineColor = monochrome ? "currentColor" : "#FF5C00";
  const fillColor = monochrome ? "transparent" : "#FFD4A8";
  const gridColor = monochrome ? "currentColor" : "#FFE8CD";
  const eyeColor = monochrome ? "currentColor" : "#2D1600";
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path 
        d="M 30 31 C 30 10, 70 10, 70 31 C 70 43, 62 47, 62 51 C 62 55, 74 59, 74 74 C 74 97, 26 97, 26 74 C 26 59, 38 55, 38 51 C 38 47, 30 43, 30 31 Z" 
        fill={fillColor} 
        stroke={outlineColor} 
        strokeWidth="8" 
        strokeLinejoin="round" 
      />
      
      {/* Grid Lines */}
      {/* Vertical */}
      <line x1="50" y1="21" x2="50" y2="82" stroke={gridColor} strokeWidth="5" strokeLinecap="round" opacity={monochrome ? 0.4 : 1} />
      {/* Horizontal Top */}
      <line x1="33" y1="42" x2="67" y2="42" stroke={gridColor} strokeWidth="5" strokeLinecap="round" opacity={monochrome ? 0.4 : 1} />
      {/* Horizontal Bottom */}
      <line x1="29" y1="64" x2="71" y2="64" stroke={gridColor} strokeWidth="5" strokeLinecap="round" opacity={monochrome ? 0.4 : 1} />
      
      {/* Eyes */}
      <ellipse cx="41.5" cy="30" rx="3.5" ry="6" fill={eyeColor} />
      <ellipse cx="58.5" cy="30" rx="3.5" ry="6" fill={eyeColor} />
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

export const AppIcon = ({ size = 56 }: { size?: number }) => (
  <div className="rounded-2xl shadow-md bg-white overflow-hidden" style={{ width: size, height: size }}>
    <img src={meetPeanutIcon} alt="Meet Peanut" className="w-full h-full object-cover" />
  </div>
);

export const Logo = ({ onSaffron = false, onClick }: { onSaffron?: boolean; onClick?: () => void }) => (
  <div
    className={`inline-flex items-center rounded-xl bg-white px-2 py-1 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <img src={meetPeanutLogo} alt="Meet Peanut" className="h-6 w-auto object-contain" />
  </div>
);

interface HeaderProps {
  title?: React.ReactNode;
  back?: () => void;
  right?: React.ReactNode;
  onLogoClick?: () => void;
  T: Theme;
}

export const Header = ({ title, back, right, onLogoClick, T }: HeaderProps) => (
  <div className={`sticky top-0 z-20 ${T.bg} px-4 pt-4 pb-3 flex items-center justify-between`}>
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
