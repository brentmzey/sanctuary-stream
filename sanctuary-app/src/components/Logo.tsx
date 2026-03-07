export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} group`}>
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-indigo-600/30 blur-2xl rounded-full animate-pulse group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
      <div className="absolute inset-2 bg-emerald-500/10 blur-xl rounded-full animate-bounce [animation-duration:4s]"></div>
      
      {/* Main Logo Vessel */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]"
      >
        {/* Outer Sanctuary Arch */}
        <path 
          d="M20 80C20 40 35 20 50 20C65 20 80 40 80 80" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
          className="text-indigo-500/40"
        />
        
        {/* The 'S' Stream Path */}
        <path 
          d="M50 25C35 25 25 35 25 50C25 65 50 65 50 80C50 95 65 95 75 80" 
          stroke="url(#logo-gradient)" 
          strokeWidth="8" 
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw"
        />
        
        {/* Core Radiance Point */}
        <circle 
          cx="50" 
          cy="45" 
          r="6" 
          fill="currentColor"
          className="text-white shadow-lg animate-pulse"
        />
        
        {/* Signal Waves */}
        <path 
          d="M65 35C70 40 70 50 65 55" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="text-emerald-400 opacity-60 animate-ping [animation-duration:3s]"
        />
        <path 
          d="M75 25C85 35 85 55 75 65" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          className="text-emerald-400 opacity-30 animate-ping [animation-duration:4s]"
        />

        <defs>
          <linearGradient id="logo-gradient" x1="25" y1="25" x2="75" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Hidden text for accessibility */}
      <span className="sr-only">Sanctuary Stream Logo</span>
    </div>
  );
}
