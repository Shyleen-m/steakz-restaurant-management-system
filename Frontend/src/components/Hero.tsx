import { Link } from 'react-router-dom';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  primaryAction?: { label: string; path: string };
  secondaryAction?: { label: string; path: string };
}

const Hero = ({ 
  title, 
  subtitle, 
  description, 
  image = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=80',
  primaryAction,
  secondaryAction
}: HeroProps) => {
  return (
    <div className="relative min-h-[70vh] flex items-center overflow-hidden bg-[#050505] rounded-3xl border border-white/5">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-12 relative z-10 py-20">
        <div className="max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
          {subtitle && (
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">
              {subtitle}
            </p>
          )}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-[0.9] mb-8">
            {title}
          </h1>
          {description && (
            <p className="text-white/60 text-lg leading-relaxed max-w-xl mb-12 font-medium">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-6">
            {primaryAction && (
              <Link to={primaryAction.path} className="btn-primary">
                {primaryAction.label}
              </Link>
            )}
            {secondaryAction && (
              <Link to={secondaryAction.path} className="btn-secondary">
                {secondaryAction.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-4 text-[var(--primary)]/30">
        <div className="w-24 h-px bg-current"></div>
        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Michelin Standards</span>
      </div>
    </div>
  );
};

export default Hero;
