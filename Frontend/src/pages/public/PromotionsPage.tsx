import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import { Link } from 'react-router-dom';
import { Star, Clock, Check, ArrowRight } from 'lucide-react';

const promotions = [
  {
    id: 'p1',
    title: 'Steak Fridays',
    description:
      'Enjoy a premium steak selection with complimentary champagne. A celebratory end to your week.',
    days: 'Every Friday',
    time: '6:00 PM – 11:00 PM',
    includes: [
      'Premium steak selection',
      'Complimentary champagne',
      'Live jazz atmosphere',
    ],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p2',
    title: 'Lunch Set Menu',
    description:
      'Two courses from our signature collection for £28. Perfect for executive business lunches.',
    days: 'Monday – Thursday',
    time: '12:00 PM – 4:00 PM',
    includes: [
      'Starter + main course',
      'Fresh daily ingredients',
      'Chef-selected desserts',
    ],
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'p3',
    title: 'Wagyu Night',
    description:
      'Exclusive Wagyu cuts with live chef tasting stories. An educational gastronomic journey.',
    days: 'Saturday Evenings',
    time: '7:00 PM – 11:30 PM',
    includes: [
      'A5 Wagyu tasting menu',
      'Chef presentation',
      'Luxury wine pairing',
    ],
    image:
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80',
  },
];

const PromotionsPage = () => {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <main className='pt-32 pb-24'>
        <div className='container mx-auto px-6'>
          <BackToHome />

          {/* Header */}
          <div className='max-w-4xl mb-24 animate-in fade-in slide-in-from-left-8 duration-1000'>
            <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6'>Exclusive Curations</p>
            <h1 className='text-6xl lg:text-7xl font-bold text-white leading-tight mb-8'>Luxury Promotions & <br/>Signature Events</h1>
            <p className='text-white/50 text-xl max-w-2xl leading-relaxed font-medium'>
              Discover curated dining experiences, premium seasonal menus, and exclusive steakhouse events across the Steakz global network.
            </p>
          </div>

          <div className='grid gap-12 lg:grid-cols-3'>
            {promotions.map((promo, idx) => (
              <div 
                key={promo.id} 
                className='group card p-0 overflow-hidden bg-[#0B0B0B] border-white/5 hover:border-[var(--primary)]/30 hover:shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 duration-1000'
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className='relative h-64 overflow-hidden'>
                  <img 
                    src={promo.image} 
                    alt={promo.title} 
                    className='h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110' 
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent' />
                  <div className='absolute top-6 right-6'>
                     <span className='px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-[var(--primary)]'>Limited Availability</span>
                  </div>
                </div>

                <div className='p-10 space-y-8'>
                  <div>
                    <h3 className='text-3xl font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{promo.title}</h3>
                    <p className='mt-4 text-white/40 text-sm leading-relaxed font-medium'>{promo.description}</p>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                       <p className='text-[8px] uppercase font-black text-white/20 tracking-widest'>Frequency</p>
                       <p className='text-xs font-bold text-white/70'>{promo.days}</p>
                    </div>
                    <div className='space-y-1'>
                       <p className='text-[8px] uppercase font-black text-white/20 tracking-widest'>Service Window</p>
                       <p className='text-xs font-bold text-white/70'>{promo.time}</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <p className='text-[8px] uppercase font-black text-white/20 tracking-widest'>The Package Includes</p>
                    <ul className='space-y-3'>
                      {promo.includes.map((item, i) => (
                        <li key={i} className='flex items-center gap-3 text-white/50 text-xs font-medium'>
                          <Check size={14} className="text-[var(--primary)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='pt-8 border-t border-white/5'>
                    <Link to='/reservations' className='btn-primary w-full py-4 text-[10px] text-center flex items-center justify-center gap-3 group/btn'>
                      <span>Secure Reservation</span>
                      <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Newsletter / CTA */}
          <div className='mt-32 card bg-white/5 border-white/5 p-16 text-center border-dashed'>
             <Star className="w-10 h-10 text-[var(--primary)] mx-auto mb-8 opacity-20" />
             <h2 className="text-3xl font-bold text-white mb-6">Never Miss a Curated Event</h2>
             <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">Join our inner circle to receive priority invitations to our most exclusive culinary showcases.</p>
             <Link to="/contact" className="btn-secondary px-12 py-4 text-[10px]">
                Request Membership
             </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PromotionsPage;
