export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} group`}>
      {/* Electronic Glow Aura */}
      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-150 group-hover:bg-indigo-400/30 transition-all duration-1000 group-hover:animate-pulse"></div>
      
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]"
      >
        {/* Sanctuary Arch - Geometric & Modern */}
        <path 
          d="M25 80V40C25 26.1929 36.1929 15 50 15V15C63.8071 15 75 26.1929 75 40V80" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="square"
          className="text-indigo-400/40"
        />
        
        {/* Dripping Digital Elements */}
        <rect x="35" y="25" width="2" height="15" fill="currentColor" className="text-indigo-500/30 animate-pulse" />
        <rect x="63" y="20" width="2" height="25" fill="currentColor" className="text-emerald-500/30 animate-pulse [animation-delay:0.7s]" />
        <rect x="50" y="10" width="2" height="10" fill="currentColor" className="text-indigo-500/30 animate-pulse [animation-delay:0.3s]" />

        {/* The Stream 'S' - Integrated Circuit feel */}
        <path 
          d="M50 20H35V45H65V70H50" 
          stroke="url(#circuit-grad)" 
          strokeWidth="6" 
          strokeLinecap="square"
          strokeLinejoin="miter"
          className="filter drop-shadow-sm"
        />
        
        {/* Connection Points (Nodes) */}
        <circle cx="50" cy="20" r="3" fill="#6366f1" />
        <circle cx="35" cy="45" r="3" fill="#6366f1" />
        <circle cx="65" cy="45" r="3" fill="#10b981" />
        <circle cx="50" cy="70" r="3" fill="#10b981" />
        
        {/* Core Radiance */}
        <circle 
          cx="50" 
          cy="45" 
          r="5" 
          fill="white" 
          className="animate-pulse shadow-lg blur-[1px]"
        />

        <defs>
          <linearGradient id="circuit-grad" x1="35" y1="20" x2="65" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <span className="sr-only">Sanctuary Stream</span>
    </div>
  );
}
