import React from "react";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  // Sizing map for convenient responsive usage
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`inline-block select-none ${selectedSize} ${className}`} id="nilachal-logo-container">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        id="nilachal-logo-svg"
      >
        {/* Outer hand-drawn organic circle stroke */}
        <path
          d="M 85,15 A 44,44 0 1,1 12,80 A 44,44 0 0,1 85,15"
          fill="none"
          stroke="#1c1917" /* stone-900 */
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="240 20"
          className="stroke-stone-900 dark:stroke-stone-100"
        />
        
        {/* Yellow filled circle */}
        <circle 
          cx="50" 
          cy="50" 
          r="38" 
          fill="#f5bd1f" /* Nilachal Premium Gold */
        />
        
        {/* Text Group with counter-clockwise rotation matching the brand identity */}
        <g transform="rotate(-6 50 50)">
          {/* Nilachal */}
          <text
            x="50"
            y="43"
            fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
            fontWeight="900"
            fontSize="14"
            textAnchor="middle"
            fill="#1c1917"
            letterSpacing="-0.03em"
            id="logo-text-nilachal"
          >
            Nilachal
          </text>
          
          {/* Creatives */}
          <text
            x="50"
            y="58"
            fontFamily="'Space Grotesk', 'Inter', system-ui, sans-serif"
            fontWeight="900"
            fontSize="14"
            textAnchor="middle"
            fill="#1c1917"
            letterSpacing="-0.03em"
            id="logo-text-creatives"
          >
            Creatives
          </text>
          
          {/* Underline beneath Creatives */}
          <line
            x1="22"
            y1="64"
            x2="78"
            y2="60"
            stroke="#1c1917"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
