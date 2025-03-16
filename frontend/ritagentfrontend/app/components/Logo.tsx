import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="relative">
        <svg 
          width="320" 
          height="80" 
          viewBox="0 0 320 80" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background shape */}
          <rect 
            x="10" 
            y="10" 
            width="300" 
            height="60" 
            rx="12" 
            fill="#e6f2ff" 
            stroke="#1e40af" 
            strokeWidth="2"
          />
          
          {/* Document icon */}
          <g transform="translate(30, 20)">
            <path 
              d="M0,0 L30,0 L40,10 L40,40 L0,40 Z" 
              fill="#ffffff" 
              stroke="#1e40af" 
              strokeWidth="2"
            />
            <path 
              d="M30,0 L30,10 L40,10" 
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="2"
            />
            <rect x="8" y="15" width="24" height="3" rx="1" fill="#1e40af" />
            <rect x="8" y="22" width="24" height="3" rx="1" fill="#1e40af" />
            <rect x="8" y="29" width="16" height="3" rx="1" fill="#1e40af" />
          </g>
          
          {/* Extraction arrow */}
          <g transform="translate(80, 25)">
            <path 
              d="M0,15 L20,15 M15,5 L25,15 L15,25" 
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </g>
          
          {/* Text */}
          <text 
            x="120" 
            y="45" 
            fontFamily="Arial, sans-serif" 
            fontSize="24" 
            fontWeight="bold" 
            fill="#1e40af"
          >
            Form Extractor
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Logo;
