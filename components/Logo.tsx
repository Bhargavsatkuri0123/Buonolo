import React from 'react';

interface LogoProps {
  className?: string;
  noBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", noBackground = false }) => {
  return (
    <div className={`${className} flex items-center justify-center inline-flex align-middle`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
        {!noBackground && <rect width="100" height="100" rx="24" fill="#0000FF" />}
        
        {/* Symmetrical Left Eye (O) - Balanced top position */}
        <circle cx="30" cy="30" r="14" stroke={noBackground ? "#0000FF" : "white"} strokeWidth="9" fill="none" />
        
        {/* Symmetrical Right Eye (O) - Balanced top position */}
        <circle cx="70" cy="30" r="14" stroke={noBackground ? "#0000FF" : "white"} strokeWidth="9" fill="none" />
        
        {/* Capital L at the bottom - Spacing adjusted for vertical balance between (O O) and (L) */}
        <path 
          d="M44 65 V85 H61" 
          stroke={noBackground ? "#0000FF" : "white"} 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none" 
        />
      </svg>
    </div>
  );
};

export default Logo;