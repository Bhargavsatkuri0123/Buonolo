import React from "react";
import { ArrowLeft } from "lucide-react";
import { Theme } from "../types";
import { SAF } from "../constants";

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
  <div className="rounded-2xl flex items-center justify-center shadow-md" style={{ width: size, height: size, background: SAF }}>
    <Face h={size * 0.46} />
  </div>
);

export const Logo = ({ onSaffron = false, onClick }: { onSaffron?: boolean; onClick?: () => void }) => (
  <div className={`flex items-end gap-1.5 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
    <span className={`disp font-extrabold text-2xl leading-none tracking-tight ${onSaffron ? "text-white" : ""}`}
      style={onSaffron ? {} : { color: "#F26A00" }}>buon</span>
    <span className="pb-0.5"><Face h={24} color={onSaffron ? "#fff" : "#F26A00"} /></span>
  </div>
);

interface HeaderProps {
  title?: string;
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
        <h1 className={`disp font-bold text-2xl ${T.text}`}>{title}</h1>
      ) : (
        <Logo onClick={onLogoClick} />
      )}
    </div>
    {right}
  </div>
);
