import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative group">
        <div className="transform group-hover:scale-105 transition-all duration-500">
          <svg
            className="w-10 h-10"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a6ff00" />
                <stop offset="100%" stopColor="#d4ff66">
                  <animate
                    attributeName="offset"
                    values="1;0.5;1"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>

              <filter id="techGlow">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feFlood floodColor="#a6ff00" floodOpacity="0.6" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g filter="url(#techGlow)">
              <circle 
                cx="24" 
                cy="24" 
                r="6" 
                fill="none" 
                stroke="url(#brandGradient)" 
                strokeWidth="2"
              >
                <animate
                  attributeName="r"
                  values="5;6;5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>

              {[0, 72, 144, 216, 288].map((angle, i) => (
                <g key={i}>
                  <circle
                    cx={24 + 14 * Math.cos((angle * Math.PI) / 180)}
                    cy={24 + 14 * Math.sin((angle * Math.PI) / 180)}
                    r="4"
                    fill="none"
                    stroke="url(#brandGradient)"
                    strokeWidth="2"
                  >
                    <animate
                      attributeName="r"
                      values="3;4;3"
                      dur={`${1.5 + i * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <line
                    x1="24"
                    y1="24"
                    x2={24 + 14 * Math.cos((angle * Math.PI) / 180)}
                    y2={24 + 14 * Math.sin((angle * Math.PI) / 180)}
                    stroke="url(#brandGradient)"
                    strokeWidth="1.5"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      values="0 20;20 0"
                      dur={`${2 + i * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </line>
                </g>
              ))}

              {[0, 72, 144, 216, 288].map((angle, i) => (
                <circle
                  key={`particle-${i}`}
                  cx={24 + 10 * Math.cos((angle * Math.PI) / 180)}
                  cy={24 + 10 * Math.sin((angle * Math.PI) / 180)}
                  r="1"
                  fill="#a6ff00"
                >
                  <animate
                    attributeName="r"
                    values="0.5;1.5;0.5"
                    dur={`${1 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.3;1;0.3"
                    dur={`${1 + i * 0.2}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          </svg>
        </div>
      </div>

      <span className="text-2xl font-bold text-[#a6ff00] tracking-wide">
        FutureCo
      </span>
    </div>
  );
};

export default Logo;