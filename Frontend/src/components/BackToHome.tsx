import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackToHome = () => {
  return (
    <Link 
      to="/" 
      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] font-black text-white/30 hover:text-[var(--primary)] transition-all group mb-12"
    >
      <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
      <span>Back to Home</span>
    </Link>
  );
};

export default BackToHome;
