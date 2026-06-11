import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const branches = [
  {
    id: 'manchester',
    city: 'Manchester',
    rating: 4.9,
    hours: '12:00 - 23:00',
    image:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'london',
    city: 'London',
    rating: 4.8,
    hours: '12:00 - 00:00',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'birmingham',
    city: 'Birmingham',
    rating: 4.7,
    hours: '12:00 - 23:30',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'leeds',
    city: 'Leeds',
    rating: 4.8,
    hours: '12:00 - 23:00',
    image:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'edinburgh',
    city: 'Edinburgh',
    rating: 4.7,
    hours: '12:00 - 23:00',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cardiff',
    city: 'Cardiff',
    rating: 4.6,
    hours: '12:00 - 22:30',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
  },
];

const featuredDishes = [
  {
    id: '1',
    name: 'Wagyu Ribeye',
    description: 'Herb-crusted with smoked bone marrow butter.',
    price: '£58',
    spice: 'Mild',
    recommended: true,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '2',
    name: 'Charred Fillet',
    description: 'Finest cut with truffle jus and charred asparagus.',
    price: '£62',
    spice: 'Medium',
    recommended: true,
    image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '3',
    name: 'Seared Scallops',
    description: 'Citrus foam, black garlic, and baby kale.',
    price: '£24',
    spice: 'Low',
    recommended: false,
    image: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=1200&q=80',
  },
];

const promotions = [
  {
    id: 'p1',
    title: 'Steak Fridays',
    description: 'Enjoy a premium steak selection with complimentary champagne.',
  },
  {
    id: 'p2',
    title: 'Lunch Set Menu',
    description: 'Two courses from our signature collection for £28.',
  },
  {
    id: 'p3',
    title: 'Wagyu Night',
    description: 'Exclusive Wagyu cuts with live chef tasting stories.',
  },
];

const testimonials = [
  {
    id: 't1',
    name: 'Ava Morgan',
    quote: 'An unforgettable steakhouse experience with luxury service and flawless ambiance.',
  },
  {
    id: 't2',
    name: 'Liam Carter',
    quote: 'The dining feels premium from the first welcome until the final espresso.',
  },
];

const HomePage = () => {
  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />
      
      <header className='relative pt-32 pb-20 overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(197,160,89,0.08),transparent_40%)] pointer-events-none' />
        <div className='container mx-auto px-6'>
          <div className='grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center'>
            <div className='max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000'>
              <span className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>The Art of the Steak</span>
              <h1 className='mt-6 text-6xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-white'>
                STEAKZ
                <span className='block text-[var(--primary)] mt-4 text-4xl sm:text-5xl lg:text-6xl tracking-tight'>Unrivaled Luxury</span>
              </h1>
              <p className='mt-8 text-lg text-white/60 max-w-xl leading-relaxed font-medium'>
                Experience the pinnacle of Michelin-star hospitality. Hand-selected cuts, master craftsmanship, and a cinematic dining atmosphere designed for the discerning.
              </p>

              <div className='mt-10 flex flex-wrap gap-4'>
                <Link to='/menu/manchester' className='btn-primary'>
                  Explore Menu
                </Link>
                <Link to='/reservations' className='btn-secondary'>
                  Reserve a Table
                </Link>
              </div>
            </div>

            <div className='relative group rounded-3xl overflow-hidden border border-white/5 bg-[#0B0B0B] shadow-2xl animate-in fade-in slide-in-from-right-8 duration-1000'>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 opacity-60"></div>
              <img
                src='https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80'
                alt='Premium steak dinner'
                className='h-[600px] w-full object-cover transition duration-1000 group-hover:scale-110'
              />
            </div>
          </div>
        </div>
      </header>

      <section id='featured' className='container mx-auto px-6 py-32'>
        <div className='max-w-3xl mb-16'>
          <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] mb-4 font-black'>Exquisite Selections</p>
          <h2 className='text-5xl font-bold text-white'>Signature Highlights</h2>
          <p className='mt-6 text-white/50 text-lg'>Luxurious steakhouse plates curated for the modern guest.</p>
        </div>

        <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
          {featuredDishes.map(dish => (
            <article key={dish.id} className='card group p-0 overflow-hidden'>
              <div className="relative h-72 overflow-hidden">
                <img src={dish.image} alt={dish.name} className='h-full w-full object-cover transition duration-700 group-hover:scale-110' />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-80"></div>
              </div>
              <div className='p-8'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-bold text-white'>{dish.name}</h3>
                  <span className='text-[var(--primary)] font-black text-xl'>{dish.price}</span>
                </div>
                <p className='mt-4 text-white/50 leading-relaxed'>{dish.description}</p>
                <div className='mt-6 flex items-center justify-between'>
                  <span className='text-[10px] uppercase tracking-widest font-black text-white/30'>{dish.spice} spice</span>
                  {dish.recommended && (
                    <span className='text-[10px] uppercase tracking-widest font-black text-[var(--primary)] px-3 py-1 rounded-full border border-[var(--primary)]/20'>
                      Chef's Choice
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id='why' className='bg-[#0B0B0B] py-32 border-y border-white/5'>
        <div className='container mx-auto px-6'>
          <div className='max-w-3xl mb-20 text-center mx-auto'>
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] mb-4 font-black'>The Standard</p>
            <h2 className='text-5xl font-bold text-white'>Elevated Hospitality</h2>
          </div>

          <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-4'>
            {[
              { title: 'Prime Cuts', text: 'Market-fresh produce and hand-selected cuts for every menu.', icon: '🥩' },
              { title: 'Master Chefs', text: 'Executive chefs crafting each plate with precision and care.', icon: '👨‍🍳' },
              { title: 'Bespoke Service', text: 'Daily prep and premium service standards across every branch.', icon: '🌿' },
              { title: 'Atmosphere', text: 'Refined interiors and table service that feel effortlessly premium.', icon: '✨' },
            ].map((item, idx) => (
              <div key={idx} className='card bg-[#121212] hover:bg-[#1A1A1A] text-center flex flex-col items-center'>
                <div className='w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform'>
                  {item.icon}
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>{item.title}</h3>
                <p className='text-white/40 leading-relaxed text-sm'>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='branches' className='container mx-auto px-6 py-32'>
        <div className='max-w-3xl mb-20'>
          <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] mb-4 font-black'>Our Locations</p>
          <h2 className='text-5xl font-bold text-white'>Branch Showcase</h2>
        </div>

        <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
          {branches.map(branch => (
            <Link key={branch.id} to={`/branches/${branch.id}`} className='group card p-0 overflow-hidden'>
              <div className='relative h-80 overflow-hidden'>
                <img src={branch.image} alt={branch.city} className='h-full w-full object-cover transition duration-1000 group-hover:scale-110' />
                <div className='absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent' />
                <div className='absolute bottom-8 left-8'>
                  <p className='text-[10px] uppercase tracking-[0.3em] font-black text-[var(--primary)] mb-2'>Branch</p>
                  <h3 className='text-4xl font-bold text-white'>{branch.city}</h3>
                </div>
              </div>
              <div className='p-8'>
                <div className='flex items-center justify-between mb-6'>
                  <span className='text-[11px] font-bold text-white/30 tracking-widest uppercase'>{branch.hours}</span>
                  <div className='flex items-center gap-1.5 text-[var(--primary)] font-black'>
                    <span className='text-sm'>★</span>
                    <span className='text-xs uppercase tracking-tighter'>{branch.rating}</span>
                  </div>
                </div>
                <p className='text-white/50 text-sm leading-relaxed mb-8'>Premium dining, bespoke service, and an elegant steakhouse atmosphere.</p>
                <div className='flex items-center gap-2 text-[var(--primary)] text-[10px] uppercase tracking-[0.3em] font-black group-hover:gap-4 transition-all'>
                  <span>Explore Location</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
