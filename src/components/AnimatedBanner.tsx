export default function AnimatedBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-maroon via-maroon-accent to-maroon h-12 flex items-center animate-gradient">
      <div className="animate-scroll whitespace-nowrap">
        <span className="inline-block px-8 text-white font-semibold text-lg">
          🎓 Welcome to JCHS NEXUS - Here you can chat with classmates, share homework, get help, earn points, compete on the leaderboard, shop for merch, and have fun! 🎓
        </span>
        <span className="inline-block px-8 text-white font-semibold text-lg">
          🎓 Welcome to JCHS NEXUS - Here you can chat with classmates, share homework, get help, earn points, compete on the leaderboard, shop for merch, and have fun! 🎓
        </span>
      </div>
    </div>
  );
}
