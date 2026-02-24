export default function AnimatedBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-maroon via-maroon-accent to-maroon h-10 flex items-center animate-gradient">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block px-12 text-white tracking-widest uppercase text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          ✦ JCHS NEXUS — Your Hub ✦
        </span>
        <span className="inline-block px-12 text-white tracking-widest uppercase text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          ✦ JCHS NEXUS — Your Hub ✦
        </span>
      </div>
    </div>
  );
}
