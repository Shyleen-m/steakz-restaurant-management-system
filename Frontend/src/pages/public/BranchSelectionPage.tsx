import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import { Star, Clock, MapPin, ChevronRight, Info } from 'lucide-react';

const branches = [
  {
    id: 'manchester',
    city: 'Manchester',
    rating: 4.9,
    hours: '12:00 - 23:00',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    description: 'Signature steaks, luxe hospitality, and dramatic service in the heart of the city.',
  },
  {
    id: 'london',
    city: 'London',
    rating: 4.8,
    hours: '12:00 - 00:00',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
    description: 'Grand dining rooms with refined menus and panoramic West End views.',
  },
  {
    id: 'birmingham',
    city: 'Birmingham',
    rating: 4.7,
    hours: '12:00 - 23:30',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Warm hospitality with premium aged cuts and bespoke crafted cocktails.',
  },
  {
    id: 'leeds',
    city: 'Leeds',
    rating: 4.8,
    hours: '12:00 - 23:00',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
    description: 'Bold steakhouse energy with contemporary dining comfort and local flair.',
  },
  {
    id: 'edinburgh',
    city: 'Edinburgh',
    rating: 4.7,
    hours: '12:00 - 23:00',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    description: 'A historic setting paired with modern menus for a truly standout experience.',
  },
  {
    id: 'cardiff',
    city: 'Cardiff',
    rating: 4.6,
    hours: '12:00 - 22:30',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    description: 'Elegant dining with bold flavors and our hallmark welcoming service.',
  },
];

const BranchSelectionPage = () => {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <main className='pt-32 pb-24'>
        <div className='container mx-auto px-6'>
          <BackToHome />
          
          {/* Header */}
          <div className='max-w-4xl mb-24 animate-in fade-in slide-in-from-left-8 duration-1000'>
            <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6'>Global Presence</p>
            <h1 className='text-6xl lg:text-7xl font-bold text-white leading-tight mb-8'>Choose Your <br/>Destination</h1>
            <p className='text-white/50 text-xl max-w-2xl leading-relaxed font-medium'>
              Each branch brings premium steakhouse hospitality with its own local flavor and branch-specific menu highlights.
            </p>
          </div>

          <div className='grid gap-10 md:grid-cols-2 xl:grid-cols-3'>
            {branches.map((branch, idx) => (
              <div 
                key={branch.id} 
                className='group card p-0 overflow-hidden bg-[#0B0B0B] border-white/5 hover:border-[var(--primary)]/30 hover:shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 duration-1000'
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Link to={`/branches/${branch.id}`} className='block'>
                  <div className='relative h-80 overflow-hidden'>
                    <img 
                      src={branch.image} 
                      alt={branch.city} 
                      className='h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110' 
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent' />
                    <div className='absolute bottom-8 left-8'>
                      <p className='text-[9px] uppercase tracking-[0.3em] font-black text-[var(--primary)] mb-2'>Destination</p>
                      <h2 className='text-4xl font-bold text-white tracking-tighter uppercase'>{branch.city}</h2>
                    </div>
                  </div>
                </Link>

                <div className='p-8 space-y-8'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-white/30 text-xs font-bold'>
                       <Clock size={14} className="text-[var(--primary)]" />
                       <span>{branch.hours}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-[var(--primary)] font-black'>
                      <Star size={12} fill="currentColor" />
                      <span className='text-xs uppercase tracking-tighter'>{branch.rating}</span>
                    </div>
                  </div>

                  <p className='text-white/50 text-sm leading-relaxed font-medium min-h-[3rem]'>
                    {branch.description}
                  </p>

                  <div className='pt-8 border-t border-white/5 flex gap-4'>
                    <Link to={`/branches/${branch.id}`} className='btn-primary flex-1 py-3 text-[10px] text-center'>
                      View Branch
                    </Link>
                    <Link to={`/menu/${branch.id}`} className='btn-secondary flex-1 py-3 text-[10px] text-center'>
                      Local Menu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Teaser */}
          <div className='mt-32 card bg-[#0B0B0B] border-white/5 p-16 text-center relative overflow-hidden group'>
             <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-[var(--primary)]/10"></div>
             <MapPin className="w-12 h-12 text-[var(--primary)] mx-auto mb-8" />
             <h2 className="text-4xl font-bold text-white mb-6">Nationwide Hospitality</h2>
             <p className="text-white/40 text-lg max-w-2xl mx-auto mb-12">We are constantly expanding our footprint. If we aren't in your city yet, our Manchester flagship is worth the journey.</p>
             <Link to="/contact" className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--primary)] hover:text-white transition-colors flex items-center justify-center gap-4">
                <span>Enquire About Events</span>
                <ChevronRight size={14} />
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BranchSelectionPage;
