import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import {
  ShoppingBag,
  ChevronRight,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

const branches = [
  'manchester',
  'birmingham',
  'cardiff',
  'edinburgh',
  'leeds',
  'london'
];

const branchMap: Record<string, number> = {
  manchester: 1,
  birmingham: 2,
  cardiff:    3,
  edinburgh:  4,
  leeds:      5,
  london:     6
};

// ─── IMAGE LOOKUP ────────────────────────────────────────────────────────────
// Keyed by keyword (checked against item name + category, lowercase).
// First match wins, so put more-specific terms before broad ones.
const IMAGE_RULES: { keywords: string[]; url: string }[] = [
  // STEAKS — specific cuts first
  { keywords: ['wagyu'],        url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['tomahawk'],     url: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['ribeye','rib-eye','rib eye'], url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['fillet','filet','tenderloin'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['sirloin'],      url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['t-bone','tbone','t bone'], url: 'https://images.unsplash.com/photo-1607116667981-ff148b686cce?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['rump steak'],   url: 'https://images.unsplash.com/photo-1611564494260-6f21b80af7ea?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['steak'],        url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },

  // BURGERS
  { keywords: ['smash burger','smash'], url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['cheeseburger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['burger'],       url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80' },

  // CHICKEN
  { keywords: ['chicken wings','wings'], url: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['chicken breast'], url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['grilled chicken','chicken'], url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=1200&q=80' },

  // SEAFOOD
  { keywords: ['lobster'],      url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['salmon'],       url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['prawn','shrimp'], url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['fish','sea bass','cod','tuna'], url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['seafood'],      url: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=80' },

  // LAMB / PORK / RIBS
  { keywords: ['lamb chop','lamb rack','rack of lamb'], url: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['lamb'],         url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['ribs','baby back','pork rib'], url: 'https://images.unsplash.com/photo-1558030137-a56c1b002c8c?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['pork belly'],   url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['pork'],         url: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=1200&q=80' },

  // STARTERS / APPETISERS
  { keywords: ['calamari'],     url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['bruschetta'],   url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['soup'],         url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['nachos'],       url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['spring roll'],  url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['bread','garlic bread'], url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?auto=format&fit=crop&w=1200&q=80' },

  // SALADS
  { keywords: ['caesar salad'], url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['salad'],        url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80' },

  // SIDES
  { keywords: ['mac and cheese','mac & cheese','macaroni'], url: 'https://images.unsplash.com/photo-1543352634-99a5d50ae78e?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['truffle fries','fries','chips'], url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['onion rings'],  url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['mash','mashed potato'], url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['corn','sweetcorn'], url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['mushroom'],     url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['spinach','greens','vegetables','veg'], url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80' },

  // DESSERTS
  { keywords: ['lava cake','molten'],  url: 'https://images.unsplash.com/photo-1617305855058-336d24456869?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['cheesecake'],   url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['brownie'],      url: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['ice cream','gelato'], url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['tiramisu'],     url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['crème brûlée','creme brulee'], url: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['sticky toffee','toffee pudding'], url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['chocolate'],    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['cake'],         url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['dessert','sweet'], url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80' },

  // DRINKS
  { keywords: ['cocktail','mojito','margarita'], url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['wine'],         url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['beer','lager','ale'], url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['juice','lemonade','soft drink'], url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['coffee','espresso','latte'], url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80' },

  // CATEGORY-LEVEL FALLBACKS
  { keywords: ['starter','appetiser','appetizer'], url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['side'],         url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80' },
  { keywords: ['drink','beverage'], url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80' },

  // ABSOLUTE FALLBACK
  { keywords: [''],             url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80' },
];

const getMenuImage = (item: any): string => {
  if (item.image) return item.image;
  const haystack = `${item.name} ${item.category} ${item.description}`.toLowerCase();
  for (const rule of IMAGE_RULES) {
    if (rule.keywords.some(kw => kw && haystack.includes(kw))) {
      return rule.url;
    }
  }
  return IMAGE_RULES[IMAGE_RULES.length - 1].url;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

const MenuPage = () => {
  const navigate = useNavigate();
  const { branchId } = useParams();
  const { addToCart, total, cart, cartBranchId, clearCart } = useCart();

  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetchMenu();
  }, [branchId]);

  const fetchMenu = async () => {
    setLoading(true);
    setActiveCategory('All');
    try {
      const res = await api.get('/menu');
      const all = res.data.data || res.data.menuItems || res.data || [];
      const thisBranchId = branchMap[branchId as string];
      const filtered = all.filter(
        (item: any) =>
          item.branchId === null ||
          item.branchId === undefined ||
          item.branchId === thisBranchId
      );
      setMenuItems(filtered);
    } catch (error) {
      console.error('Failed to fetch menu', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: any) => {
    const result = addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: getMenuImage(item),
      quantity: 1,
      branchId: branchMap[branchId as string]
    });
    if (!result.success) {
      setBranchError(result.message || 'Cannot mix items from different branches.');
    }
  };

  const handleClearAndAdd = (item: any) => {
    clearCart();
    setBranchError(null);
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: getMenuImage(item),
      quantity: 1,
      branchId: branchMap[branchId as string]
    });
  };

  const branchTitle = branchId
    ? branchId.charAt(0).toUpperCase() + branchId.slice(1)
    : 'Steakz';

  const cartBranchName = cartBranchId
    ? Object.entries(branchMap).find(([, id]) => id === cartBranchId)?.[0] || 'another branch'
    : null;

  // Derive sorted category list
  const categories = ['All', ...Array.from(new Set(menuItems.map((i: any) => i.category || 'Other'))).sort()];

  const visibleItems =
    activeCategory === 'All'
      ? menuItems
      : menuItems.filter((i: any) => (i.category || 'Other') === activeCategory);

  // Group visible items by category (only needed for "All" view)
  const groupedMenu = visibleItems.reduce((acc: any, item: any) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>Curating Menu</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <div className='pt-32 pb-24 relative overflow-hidden'>
        <div className='container mx-auto px-6 relative z-10'>
          <BackToHome />

          {/* ── BRANCH CONFLICT BANNER ──────────────────── */}
          {branchError && (
            <div className='mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start justify-between gap-4'>
              <div className='flex items-start gap-4'>
                <AlertTriangle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-black text-red-400 mb-1'>Branch Conflict</p>
                  <p className='text-[13px] text-red-400/70 leading-relaxed'>
                    Your cart has items from{' '}
                    <span className='capitalize font-bold text-red-400'>{cartBranchName}</span>.
                    You can't mix items from different branches.
                  </p>
                  <div className='flex gap-3 mt-4'>
                    <button
                      onClick={() => { clearCart(); setBranchError(null); }}
                      className='px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                    >
                      Clear Cart & Order Here
                    </button>
                    <button
                      onClick={() => navigate(`/menu/${cartBranchName}`)}
                      className='px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all'
                    >
                      Go Back to {cartBranchName && cartBranchName.charAt(0).toUpperCase() + cartBranchName.slice(1)}
                    </button>
                    <button onClick={() => setBranchError(null)} className='ml-auto p-2 text-white/20 hover:text-white transition-colors'>
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── HEADER ──────────────────────────────────── */}
          <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16'>
            <div className='max-w-2xl'>
              <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-4'>
                Gastronomic Excellence
              </p>
              <h1 className='text-7xl font-bold text-white mb-8 tracking-tight'>
                {branchTitle}{' '}
                <span className='text-[var(--primary)]'>Menu</span>
              </h1>
              <p className='text-white/50 text-xl leading-relaxed font-medium'>
                Embark on a culinary journey through our signature selections.
              </p>
            </div>

            {/* Cart summary */}
            <div className='card bg-[#0B0B0B] border-[var(--primary)]/20 p-8 min-w-[360px] shadow-2xl'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center'>
                  <ShoppingBag className='w-6 h-6 text-[var(--primary)]' />
                </div>
                <div>
                  <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/30 mb-1'>Your Collection</p>
                  <p className='text-lg font-bold text-white tracking-tight'>{cart.length} signature items</p>
                  {cartBranchName && (
                    <p className='text-[10px] font-black text-[var(--primary)] uppercase tracking-widest mt-1 capitalize'>
                      {cartBranchName} branch
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-end justify-between mb-10'>
                <p className='text-5xl font-black text-white tracking-tighter'>£{total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => navigate('/cart')}
                className='btn-primary w-full flex items-center justify-center gap-3 py-5 group'
              >
                <span className='text-sm font-black tracking-widest uppercase'>Secure Checkout</span>
                <ChevronRight className='w-5 h-5 transition-transform group-hover:translate-x-1' />
              </button>
            </div>
          </div>

          {/* ── BRANCH TABS ─────────────────────────────── */}
          <div className='mb-10 flex flex-wrap gap-3 pb-10 border-b border-white/5'>
            {branches.map(branch => (
              <button
                key={branch}
                onClick={() => { setBranchError(null); navigate(`/menu/${branch}`); }}
                className={`px-10 py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 border ${
                  branchId === branch
                    ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                }`}
              >
                {branch}
                {cartBranchId === branchMap[branch] && cart.length > 0 && (
                  <span className='ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] align-middle' />
                )}
              </button>
            ))}
          </div>

          {/* ── CATEGORY FILTER ─────────────────────────── */}
          {categories.length > 2 && (
            <div className='mb-16 flex flex-wrap gap-3'>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] font-black transition-all duration-300 border ${
                    activeCategory === cat
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white/70'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className={`ml-2 text-[9px] ${activeCategory === cat ? 'text-black/50' : 'text-white/20'}`}>
                      {menuItems.filter((i: any) => (i.category || 'Other') === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── MENU ITEMS ──────────────────────────────── */}
          {visibleItems.length === 0 ? (
            <div className='card bg-[#0B0B0B] p-32 text-center border-white/5'>
              <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8'>
                <Info className='w-10 h-10 text-white/10' />
              </div>
              <h2 className='text-4xl font-bold text-white mb-6'>No Menu Available</h2>
              <p className='text-white/30 text-lg'>This branch has no items listed yet.</p>
            </div>
          ) : (
            <div className='space-y-40'>
              {Object.entries(groupedMenu).map(([category, items]: any) => (
                <div key={category}>
                  <div className='flex items-center gap-10 mb-20'>
                    <h2 className='text-5xl font-black text-white uppercase tracking-tighter whitespace-nowrap'>
                      {category}
                    </h2>
                    <div className='h-px flex-1 bg-gradient-to-r from-white/10 to-transparent' />
                  </div>

                  <div className='grid gap-12 md:grid-cols-2 xl:grid-cols-3'>
                    {items.map((item: any) => {
                      const lockedOut =
                        cart.length > 0 &&
                        cartBranchId !== null &&
                        cartBranchId !== branchMap[branchId as string];

                      return (
                        <div
                          key={item.id || item._id}
                          className={`group card p-0 overflow-hidden bg-[#0B0B0B] transition-all duration-300 ${lockedOut ? 'opacity-50' : ''}`}
                        >
                          <div className='relative h-72 overflow-hidden'>
                            <img
                              src={getMenuImage(item)}
                              alt={item.name}
                              className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                              onError={(e) => {
                                // Fallback if Unsplash image fails
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80';
                              }}
                            />
                            {/* Category pill on image */}
                            <div className='absolute top-4 left-4'>
                              <span className='px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-white/70'>
                                {item.category || 'Signature'}
                              </span>
                            </div>
                          </div>

                          <div className='p-10'>
                            <div className='flex justify-between items-start gap-8 mb-10'>
                              <div className='flex-1'>
                                <h3 className='text-2xl font-bold text-white mb-4'>{item.name}</h3>
                                <p className='text-white/40 text-sm leading-relaxed font-medium'>{item.description}</p>
                              </div>
                              <div className='text-right shrink-0'>
                                <span className='text-2xl font-black text-white tracking-tighter'>£{item.price}</span>
                              </div>
                            </div>

                            <div className='flex items-center justify-between pt-8 border-t border-white/5'>
                              <div className='flex items-center gap-3'>
                                <div className={`w-2 h-2 rounded-full ${item.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${item.available ? 'text-emerald-500/60' : 'text-red-500/60'}`}>
                                  {item.available ? 'Available' : 'Sold Out'}
                                </span>
                              </div>
                              <button
                                disabled={!item.available}
                                onClick={() => handleAddToCart(item)}
                                className={`btn-primary scale-90 px-8 py-3.5 ${
                                  !item.available ? 'opacity-10 cursor-not-allowed grayscale' : 'hover:scale-100'
                                }`}
                              >
                                Add to Order
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MenuPage;