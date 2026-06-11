import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import {
  User, Calendar, Clock, ShoppingBag, MapPin,
  ChevronRight, Activity, ShieldCheck, LogOut,
  Hash, CheckCircle, ChefHat, Utensils, Package,
  Receipt, X, UtensilsCrossed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const orderStatusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Awaiting Payment',    color: 'text-white/40',    bg: 'bg-white/5',        border: 'border-white/10',       icon: Clock },
  PAID:            { label: 'Paid — Kitchen Queue', color: 'text-amber-500',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Package },
  PREPARING:       { label: 'Being Prepared',       color: 'text-blue-500',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: ChefHat },
  READY:           { label: 'Ready to Serve',       color: 'text-emerald-500',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Utensils },
  SERVED:          { label: 'Served',               color: 'text-white',      bg: 'bg-white/10',       border: 'border-white/20',       icon: CheckCircle },
  COMPLETED:       { label: 'Completed',            color: 'text-white/40',   bg: 'bg-white/5',        border: 'border-white/10',       icon: CheckCircle },
  CANCELLED:       { label: 'Cancelled',            color: 'text-red-500',    bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: X },
};

const ACTIVE_STATUSES = ['PAID', 'PREPARING', 'READY'];

// Maps branch name → menu slug (case-insensitive)
const BRANCH_SLUG_MAP: Record<string, string> = {
  manchester: 'manchester',
  birmingham: 'birmingham',
  cardiff:    'cardiff',
  edinburgh:  'edinburgh',
  leeds:      'leeds',
  london:     'london',
};

const getBranchSlug = (branchName?: string): string | null => {
  if (!branchName) return null;
  const key = branchName.toLowerCase().trim();
  // Direct match
  if (BRANCH_SLUG_MAP[key]) return BRANCH_SLUG_MAP[key];
  // Partial match (e.g. "Steakz Manchester" → "manchester")
  for (const slug of Object.keys(BRANCH_SLUG_MAP)) {
    if (key.includes(slug)) return slug;
  }
  return null;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const AccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();

    socket.emit('join_customer', user.id);

    socket.on('customer:order_created', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on('customer:order_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setSelectedOrder((prev: any) => prev?.id === updatedOrder.id ? updatedOrder : prev);
    });

    socket.on('reservation:updated', () => { fetchData(); });

    return () => {
      socket.off('customer:order_created');
      socket.off('customer:order_updated');
      socket.off('reservation:updated');
    };
  }, [user]);

  const fetchData = async () => {
    try {
      const [resRes, ordersRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/orders'),
      ]);
      setReservations(resRes.data.data?.reservations || resRes.data.reservations || resRes.data || []);
      setOrders(ordersRes.data.orders || ordersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch account data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const pastOrders   = orders.filter(o => !ACTIVE_STATUSES.includes(o.status));

  if (loading) {
    return (
      <div className='min-h-screen bg-[#050505] flex items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Syncing Your Experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <main className='pt-32 pb-24'>
        <div className='container mx-auto px-6'>
          <BackToHome />

          <div className='flex flex-col lg:flex-row gap-16 items-start'>

            {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
            <aside className='w-full lg:w-80 space-y-8 lg:sticky lg:top-32'>
              <div className='card bg-[#0B0B0B] border-white/5 p-8 text-center relative overflow-hidden group'>
                <div className='absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/5 rounded-full -mr-12 -mt-12 blur-2xl' />
                <div className='w-24 h-24 rounded-full border-2 border-[var(--primary)]/30 p-1 mx-auto mb-6 group-hover:border-[var(--primary)] transition-all'>
                  <img
                    src={`https://ui-avatars.com/api/?name=${user?.fullName}&background=C5A059&color=050505&bold=true&size=200`}
                    alt={user?.fullName}
                    className='w-full h-full rounded-full object-cover'
                  />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>{user?.fullName}</h2>
                <p className='text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] font-black mt-2'>
                  Elite Member
                </p>
                <div className='h-px bg-white/5 my-8' />
                <div className='space-y-4 text-left'>
                  <div className='flex items-center gap-3 text-white/40 text-xs'>
                    <User size={14} className='text-[var(--primary)]/50' />
                    <span className='truncate'>{user?.email}</span>
                  </div>
                  <div className='flex items-center gap-3 text-white/40 text-xs'>
                    <ShieldCheck size={14} className='text-[var(--primary)]/50' />
                    <span>Verified Identity</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className='mt-10 w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-white/30 hover:text-red-500 hover:bg-red-500/5 transition-all flex items-center justify-center gap-3'
                >
                  <LogOut size={14} />
                  <span>Terminate Session</span>
                </button>
              </div>

              {activeOrders.length > 0 && (
                <div className='card bg-amber-500/5 border-amber-500/20 p-6'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-2 h-2 rounded-full bg-amber-500 animate-pulse' />
                    <p className='text-[10px] uppercase tracking-widest font-black text-amber-500'>Live Orders</p>
                  </div>
                  <p className='text-3xl font-black text-white'>{activeOrders.length}</p>
                  <p className='text-[10px] text-white/30 font-black uppercase tracking-widest mt-1'>Currently active</p>
                </div>
              )}
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
            <div className='flex-1 space-y-16'>

              {/* ── LIVE ORDERS ────────────────────────────────────────────── */}
              {activeOrders.length > 0 && (
                <section className='space-y-8'>
                  <div className='flex items-center gap-4 border-b border-white/5 pb-6'>
                    <div className='w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center'>
                      <Activity className='w-5 h-5 text-amber-500' />
                    </div>
                    <h3 className='text-3xl font-bold text-white tracking-tight uppercase'>Live Orders</h3>
                    <div className='w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-2' />
                  </div>

                  <div className='grid gap-6'>
                    {activeOrders.map(order => {
                      const cfg = orderStatusConfig[order.status] || orderStatusConfig['PAID'];
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-[var(--primary)]/20 transition-all duration-500 cursor-pointer'
                        >
                          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                            <div className='flex items-start gap-6'>
                              <div className={`w-12 h-12 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={cfg.color} />
                              </div>
                              <div>
                                <p className='text-lg font-black text-white uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors'>
                                  Order #{order.id.slice(-6)}
                                </p>
                                <div className='flex flex-wrap items-center gap-3 mt-2 text-[10px] uppercase tracking-widest font-black text-white/30'>
                                  <span className='flex items-center gap-1'><Hash size={9} className='text-[var(--primary)]' /> Table {order.tableNumber}</span>
                                  <span className='w-1 h-1 rounded-full bg-white/10' />
                                  <span className='flex items-center gap-1'><MapPin size={9} className='text-[var(--primary)]' /> {order.branch?.name}</span>
                                  <span className='w-1 h-1 rounded-full bg-white/10' />
                                  <span className='flex items-center gap-1'><Clock size={9} className='text-[var(--primary)]' /> {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className='flex flex-wrap gap-2 mt-4'>
                                  {order.items?.map((item: any, i: number) => (
                                    <span key={i} className='px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-white/50'>
                                      {item.quantity}× {item.menuItem?.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className='flex flex-col items-end gap-3 shrink-0'>
                              <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <p className='text-xl font-black text-white'>£{Number(order.total).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── RESERVATIONS ───────────────────────────────────────────── */}
              <section className='space-y-8'>
                <div className='flex items-center justify-between border-b border-white/5 pb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center'>
                      <Calendar className='w-5 h-5 text-[var(--primary)]' />
                    </div>
                    <h3 className='text-3xl font-bold text-white tracking-tight uppercase'>Booking Manifest</h3>
                  </div>
                  <span className='text-[10px] uppercase tracking-widest font-black text-white/20'>
                    {reservations.length} total
                  </span>
                </div>

                <div className='grid gap-6'>
                  {reservations.length === 0 ? (
                    <div className='card bg-[#0B0B0B] border-white/5 p-12 text-center border-dashed'>
                      <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20'>
                        No active reservations detected
                      </p>
                    </div>
                  ) : (
                    reservations.map(res => {
                      const hasActiveOrder =
  orders.some(
    (o: any) =>
      o.tableNumber ===
        res.tableNumber &&
      o.status !== 'COMPLETED'
  );
                      const branchSlug = getBranchSlug(res.branch?.name);
                      const isSeated   = res.status === 'SEATED';

                      return (
                        <div
                          key={res.id}
                          className={`card border-white/5 p-8 group transition-all duration-500 ${
                            isSeated
                              ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                              : 'bg-[#0B0B0B] hover:border-[var(--primary)]/20'
                          }`}
                        >
                          <div className='flex flex-col md:flex-row md:items-center justify-between gap-8'>
                            {/* Date + info */}
                            <div className='flex items-center gap-8'>
                              <div className='w-16 h-16 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/5 shrink-0'>
                                <span className='text-[10px] font-black text-[var(--primary)] uppercase tracking-tighter'>
                                  {new Date(res.reservationTime).toLocaleDateString('en-GB', { month: 'short' })}
                                </span>
                                <span className='text-2xl font-black text-white leading-none mt-1'>
                                  {new Date(res.reservationTime).toLocaleDateString('en-GB', { day: '2-digit' })}
                                </span>
                              </div>
                              <div>
                                <p className='text-xl font-bold text-white group-hover:text-[var(--primary)] transition-colors'>
                                  {res.branch?.name || 'Steakz'}
                                </p>
                                <div className='flex items-center gap-6 mt-2 text-white/30 text-[10px] font-black uppercase tracking-widest'>
                                  <span className='flex items-center gap-2'>
                                    <Clock size={10} className='text-[var(--primary)]' />
                                    {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className='flex items-center gap-2'>
                                    <User size={10} className='text-[var(--primary)]' />
                                    {res.guests} Guests
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status + Start Order button */}
                            <div className='flex flex-col items-end gap-3 shrink-0'>
                              <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${
                                res.status === 'PENDING'   ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'     :
                                res.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'         :
                                res.status === 'SEATED'    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20':
                                'bg-white/5 text-white/40 border-white/5'
                              }`}>
                                {res.status}
                              </span>

                              {/* Fallback: seated but no branch slug matched */}
                              {isSeated && !branchSlug && (
                                <button
                                  onClick={() => navigate('/branches')}
                                  className='flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-glow'
                                >
                                  <UtensilsCrossed size={14} />
                                  <span>Start Order</span>
                                  <ChevronRight size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* ── ORDER HISTORY ──────────────────────────────────────────── */}
              <section className='space-y-8'>
                <div className='flex items-center justify-between border-b border-white/5 pb-6'>
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center'>
                      <ShoppingBag className='w-5 h-5 text-[var(--primary)]' />
                    </div>
                    <h3 className='text-3xl font-bold text-white tracking-tight uppercase'>Order History</h3>
                  </div>
                  <span className='text-[10px] uppercase tracking-widest font-black text-white/20'>
                    {pastOrders.length} records
                  </span>
                </div>

                <div className='grid gap-6'>
                  {pastOrders.length === 0 ? (
                    <div className='card bg-[#0B0B0B] border-white/5 p-12 text-center border-dashed'>
                      <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20'>No past orders found</p>
                    </div>
                  ) : (
                    pastOrders.map(order => {
                      const cfg = orderStatusConfig[order.status] || orderStatusConfig['COMPLETED'];
                      const Icon = cfg.icon;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-[var(--primary)]/20 transition-all duration-500 cursor-pointer'
                        >
                          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                            <div className='flex items-center gap-6'>
                              <div className='w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0'>
                                <Icon size={16} className='text-white/20' />
                              </div>
                              <div>
                                <p className='text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors tracking-tight uppercase'>
                                  Order #{order.id.slice(-6)}
                                </p>
                                <div className='flex flex-wrap items-center gap-3 mt-2 text-[10px] uppercase tracking-widest font-black text-white/30'>
                                  <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                  <span className='w-1 h-1 rounded-full bg-white/5' />
                                  <span className='flex items-center gap-1'><Hash size={9} /> Table {order.tableNumber}</span>
                                  <span className='w-1 h-1 rounded-full bg-white/5' />
                                  <span>{order.branch?.name}</span>
                                </div>
                                <div className='flex flex-wrap gap-2 mt-3'>
                                  {order.items?.map((item: any, i: number) => (
                                    <span key={i} className='text-[10px] text-white/30 font-medium'>
                                      {i > 0 && <span className='mr-2 text-white/10'>·</span>}
                                      {item.quantity}× {item.menuItem?.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className='flex flex-col items-end gap-3 shrink-0'>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              <p className='text-lg font-black text-white'>£{Number(order.total).toFixed(2)}</p>
                              <ChevronRight size={14} className='text-white/10 group-hover:text-white transition-colors' />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── ORDER DETAIL MODAL ───────────────────────────────────────────────── */}
      {selectedOrder && (
        <div
          className='fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300'
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className='card bg-[#0B0B0B] border-white/10 max-w-lg w-full p-0 shadow-2xl overflow-hidden'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-8 border-b border-white/5 flex items-center justify-between'>
              <div>
                <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-1'>Order Detail</p>
                <h2 className='text-3xl font-bold text-white uppercase'>#{selectedOrder.id.slice(-6)}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-8 space-y-6 max-h-[70vh] overflow-y-auto'>
              {(() => {
                const cfg = orderStatusConfig[selectedOrder.status] || orderStatusConfig['PAID'];
                const Icon = cfg.icon;
                return (
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <Icon size={16} className={cfg.color} />
                    <span className={`text-sm font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })()}

              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Table</p>
                  <p className='text-xl font-black text-white'>T-{selectedOrder.tableNumber}</p>
                </div>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Branch</p>
                  <p className='text-sm font-black text-white'>{selectedOrder.branch?.name}</p>
                </div>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Time</p>
                  <p className='text-sm font-black text-white'>
                    {new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Total</p>
                  <p className='text-xl font-black text-[var(--primary)]'>£{Number(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4'>Your Order</p>
                <div className='space-y-3'>
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className='flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5'>
                      <div className='flex items-center gap-4'>
                        <div className='w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xs'>
                          {item.quantity}
                        </div>
                        <span className='text-sm font-bold text-white'>{item.menuItem?.name}</span>
                      </div>
                      <span className='text-sm font-black text-white/60'>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.receipt && (
                <div className='flex items-center gap-3 p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20'>
                  <Receipt size={14} className='text-[var(--primary)]' />
                  <div>
                    <p className='text-[9px] uppercase tracking-widest font-black text-[var(--primary)]'>
                      Receipt #{selectedOrder.receipt.receiptNo}
                    </p>
                    <p className='text-xs text-white/40 mt-0.5'>
                      Total paid: £{Number(selectedOrder.receipt.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;