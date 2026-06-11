import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Hero from '../../components/Hero';
import BackToHome from '../../components/BackToHome';
import { ChefHat, Star, Users, History } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <BackToHome />
        </div>

        <Hero 
          title="The Heritage"
          subtitle="A Legacy of Excellence"
          description="Steakz blends fine dining with cinematic steakhouse energy, creating a luxury restaurant destination for the discerning guest."
          image="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=2000&q=80"
          primaryAction={{ label: "View Our Menu", path: "/menu/manchester" }}
        />

        <section className="container mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">Our Philosophy</p>
              <h2 className="text-5xl font-bold text-white mb-8 leading-tight">Crafting the Perfect <br/>Dining Experience</h2>
              <p className="text-white/60 text-lg leading-relaxed mb-8">
                Founded with a singular mission: to redefine the modern steakhouse. We believe that dining is an art form, where every detail—from the selection of the cut to the temperature of the wine—must be flawless.
              </p>
              <p className="text-white/60 text-lg leading-relaxed">
                Our commitment to Michelin-star standards means we never compromise on quality, sourcing only the finest Wagyu and prime cuts from sustainable partners across the globe.
              </p>
            </div>
            <div className="relative group rounded-3xl overflow-hidden border border-white/5 animate-in fade-in slide-in-from-right-8 duration-1000">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80" 
                alt="Chef at work" 
                className="w-full h-[500px] object-cover transition duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60"></div>
            </div>
          </div>
        </section>

        <section className="bg-[#0B0B0B] py-32 border-y border-white/5">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: 'The Origin', 
                  text: 'Founded to bring premium steak experiences to the UK, mixing bold flavors and dramatic plating.', 
                  icon: History 
                },
                { 
                  title: 'Culinary Art', 
                  text: 'Our chefs source the best cuts and craft every dish with precision, smoke, and unrivaled flavor.', 
                  icon: ChefHat 
                },
                { 
                  title: 'Hospitality', 
                  text: 'Luxury and consistency are at the heart of every branch, from Manchester to the heart of London.', 
                  icon: Users 
                },
                { 
                  title: 'Excellence', 
                  text: 'Every guest experience is designed to feel effortlessly premium, from arrival to the final espresso.', 
                  icon: Star 
                },
              ].map((item, idx) => (
                <div key={idx} className="card bg-[#121212] hover:bg-[#1A1A1A] group">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-8 group-hover:bg-[var(--primary)] transition-colors">
                    <item.icon className="w-6 h-6 text-[var(--primary)] group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-32 text-center">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">The Atmosphere</p>
            <h2 className="text-5xl font-bold text-white mb-10 leading-tight">An Immersive Journey <br/>Into Luxury</h2>
            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-12">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80" 
                alt="Restaurant Interior" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-40"></div>
            </div>
            <p className="text-white/60 text-xl leading-relaxed max-w-2xl mx-auto">
              Our restaurants are more than just places to eat; they are cinematic destinations where modern design meets classical hospitality.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
