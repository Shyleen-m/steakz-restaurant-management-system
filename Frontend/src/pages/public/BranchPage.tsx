import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import api from '../../api/axios';
import { MapPin, Clock, Phone, Info, Calendar, ArrowRight } from 'lucide-react';

const BranchPage = () => {
  const { id } = useParams();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await api.get('/branches');
        const branches = res.data;
        const found = branches.find(
          (b: any) => {
            const bName = b.name?.toLowerCase() || '';
            const bCity = b.city?.toLowerCase() || '';
            const lowerId = id?.toLowerCase() || '';
            return bName.includes(lowerId) || bCity.includes(lowerId);
          }
        );
        setBranch(found || null);
      } catch (err) {
        console.error('Failed to load branch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranch();
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4"></div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black">Locating Branch</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className='min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6'>
        <Info className="w-16 h-16 text-red-500/20 mb-8" />
        <h2 className='text-3xl font-bold text-white mb-4'>Destination Not Found</h2>
        <Link to="/branches" className="btn-primary">View All Branches</Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <main className="pt-20">
        {/* Cinematic Branch Hero */}
        <section className="relative h-[80vh] flex items-end overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src={branch.image || 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=2000&q=80'} 
              alt={branch.name} 
              className="w-full h-full object-cover transition-transform duration-[3000ms] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/60 via-transparent to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 pb-20 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">Our Destinations</p>
            <h1 className="text-7xl lg:text-8xl font-bold text-white leading-tight mb-8">
              {branch.city}
            </h1>
            <div className="flex flex-wrap gap-8 items-center text-white/70 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--primary)]" />
                <span>{branch.openingHours}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-32">
          <BackToHome />
          
          <div className="grid lg:grid-cols-12 gap-20">
            {/* Description */}
            <div className="lg:col-span-7 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">The Atmosphere</p>
                <h2 className="text-5xl font-bold text-white mb-8 leading-tight">{branch.name}</h2>
                <p className="text-white/50 text-xl leading-relaxed font-medium">
                  {branch.description || "Experience the pinnacle of steakhouse dining in an atmosphere designed for elegance and drama. Every corner of our Manchester branch reflects our commitment to luxury and cinematic energy."}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8 pt-12 border-t border-white/5">
                <div className="card bg-[#0B0B0B] border-white/5 p-8 group hover:bg-[#0F0F0F] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] transition-colors">
                    <Phone className="w-5 h-5 text-[var(--primary)] group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Direct Concierge</h3>
                  <p className="text-white/40 text-sm font-medium">{branch.phone}</p>
                </div>

                <div className="card bg-[#0B0B0B] border-white/5 p-8 group hover:bg-[#0F0F0F] transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--primary)] transition-colors">
                    <Clock className="w-5 h-5 text-[var(--primary)] group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Service Hours</h3>
                  <p className="text-white/40 text-sm font-medium">{branch.openingHours}</p>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="card bg-[#0B0B0B] border-[var(--primary)]/20 p-10 lg:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[var(--primary)]/10 transition-all"></div>
                
                <Calendar className="w-10 h-10 text-[var(--primary)] mb-8" />
                <h3 className="text-3xl font-bold text-white mb-6">Plan Your Experience</h3>
                <p className="text-white/50 mb-10 leading-relaxed">
                  Book your table at {branch.city} and enjoy an evening of unparalleled culinary excellence.
                </p>
                
                <div className="space-y-4">
                  <Link to='/reservations' className="btn-primary w-full flex items-center justify-center gap-3 py-5 group">
                    <span>Reserve a Table</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link to={`/menu/${branch.city.toLowerCase()}`} className="btn-secondary w-full py-5 flex items-center justify-center gap-3">
                    View Local Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Gallery Teaser */}
        <section className="bg-[#0B0B0B] py-32 border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mb-16">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">Visual Story</p>
              <h2 className="text-5xl font-bold text-white">Local Atmosphere</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
              ].map((img, i) => (
                <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 group">
                  <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="Gallery" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BranchPage;
