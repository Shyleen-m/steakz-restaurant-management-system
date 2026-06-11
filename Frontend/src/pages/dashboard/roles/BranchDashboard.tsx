import { useEffect, useState, useCallback } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { socket } from '../../../socket';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';
import {
  DollarSign, ShoppingBag, Users, Clock3, AlertTriangle,
  Activity, UtensilsCrossed, ConciergeBell, Armchair,
  X, Receipt, MapPin, Hash, CreditCard, ChefHat,
  CheckCircle, Package, Utensils, ShoppingCart, CalendarCheck
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Awaiting Payment',     color: 'text-white/40',    bg: 'bg-white/5',        border: 'border-white/10',       icon: Clock3 },
  PAID:            { label: 'Paid — Kitchen Queue', color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Package },
  PREPARING:       { label: 'Being Prepared',       color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: ChefHat },
  READY:           { label: 'Ready to Serve',       color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Utensils },
  SERVED:          { label: 'Served',               color: 'text-white',       bg: 'bg-white/10',       border: 'border-white/20',       icon: CheckCircle },
  COMPLETED:       { label: 'Completed',            color: 'text-white/40',    bg: 'bg-white/5',        border: 'border-white/10',       icon: CheckCircle },
  CANCELLED:       { label: 'Cancelled',            color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: X },
};

const STATUS_FEED_COLOR: Record<string, string> = {
  PENDING_PAYMENT: 'text-white/40',
  PAID:            'text-amber-400',
  PREPARING:       'text-blue-400',
  READY:           'text-emerald-400',
  SERVED:          'text-white',
  COMPLETED:       'text-white/30',
  CANCELLED:       'text-red-400',
};

const BranchDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const closeModal = useCallback(() => setSelectedOrder(null), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeModal]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (error) {
      console.error('Dashboard fetch failed:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Orders fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchOrders();

    if (user?.branchId) {
      socket.emit('join_branch', user.branchId);
    }

    const refresh = () => { fetchDashboard(); fetchOrders(); };

    socket.on('order:created',       refresh);
    socket.on('order:updated',       refresh);
    socket.on('reservation:created', fetchDashboard);
    socket.on('reservation:updated', fetchDashboard);
    socket.on('inventory:updated',   fetchDashboard);

    return () => {
      socket.off('order:created',       refresh);
      socket.off('order:updated',       refresh);
      socket.off('reservation:created', fetchDashboard);
      socket.off('reservation:updated', fetchDashboard);
      socket.off('inventory:updated',   fetchDashboard);
    };
  }, [user?.branchId]);

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>Loading Branch Intelligence</p>
        </div>
      </div>
    );
  }

  const summary  = data?.summary || {};
  const charts   = {
    dailyRevenueTrend: data?.dailyRevenueTrend || [],
    dailyOrderTrend:   data?.dailyOrderTrend   || [],
    recentReservations: data?.recentReservations || [],
  };

  const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
  const recentOrders = orders.slice(0, 10);

  // ── LIVE ACTIVITY FEED ──────────────────────────────────────────────────────
  // Merge recent orders + reservations, sort by time, show latest 8
  const activityFeed = [
    ...orders.slice(0, 10).map((o: any) => ({
      type: 'order' as const,
      label: `Order #${o.id.slice(-6)} — ${o.customer?.fullName || 'Guest'}`,
      sub: o.status.replace(/_/g, ' '),
      time: o.createdAt,
      statusKey: o.status,
    })),
    ...charts.recentReservations.slice(0, 5).map((r: any) => ({
      type: 'reservation' as const,
      label: `Reservation — ${r.customerName}`,
      sub: r.status,
      time: r.createdAt,
      statusKey: r.status,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <Activity className='w-4 h-4 text-[var(--primary)]' />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>Branch Operations Centre</p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>Branch Intelligence</h1>
          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Live metrics, guest flow, dining activity and revenue for your branch.
          </p>
        </div>
        <div className='bg-[#0B0B0B] border border-[var(--primary)]/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl'>
          <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
          <div>
            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest'>Branch Status</p>
            <p className='text-xs font-black text-emerald-500 uppercase tracking-tighter'>Fully Operational</p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Revenue',      value: `£${Number(summary.totalRevenue || 0).toLocaleString()}`, icon: DollarSign,    color: 'text-emerald-500' },
          { label: 'Orders',       value: summary.totalOrders || 0,                                  icon: ShoppingBag,   color: 'text-[var(--primary)]' },
          { label: 'Reservations', value: summary.totalReservations || 0,                            icon: ConciergeBell, color: 'text-blue-500' },
          { label: 'Low Stock',    value: summary.inventoryAlerts?.total || 0,                       icon: AlertTriangle, color: 'text-amber-500' },
        ].map((item, i) => (
          <div key={i} className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-[var(--primary)]/20 transition-all'>
            <div className='flex justify-between items-start mb-8'>
              <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] transition-all duration-500'>
                <item.icon size={20} className='text-[var(--primary)] group-hover:text-black transition-colors' />
              </div>
              <div className={`text-[10px] uppercase tracking-widest font-black ${item.color}`}>Live</div>
            </div>
            <p className='text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-2'>{item.label}</p>
            <p className='text-4xl font-black text-white tracking-tighter'>{item.value}</p>
          </div>
        ))}
      </div>

      {/* CHARTS ROW 1 */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
        <div className='lg:col-span-8 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-10'>
            <h2 className='text-2xl font-bold text-white tracking-tight'>Weekly Revenue Trend</h2>
            <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2'>Daily branch revenue analytics</p>
          </div>
          <div className='w-full h-[320px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={charts.dailyRevenueTrend}>
                <defs>
                  <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%'  stopColor='#C5A059' stopOpacity={0.4} />
                    <stop offset='95%' stopColor='#C5A059' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />
                <XAxis dataKey='day' axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <Tooltip contentStyle={{ background: '#0B0B0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Area type='monotone' dataKey='revenue' stroke='#C5A059' fill='url(#revenueGradient)' strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className='lg:col-span-4 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-10'>
            <h2 className='text-2xl font-bold text-white tracking-tight'>Service Snapshot</h2>
            <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2'>Live branch operations</p>
          </div>
          <div className='space-y-5'>
            {[
              { label: 'Kitchen Queue',          value: (summary.orderStatusBreakdown?.PAID || 0) + (summary.orderStatusBreakdown?.PREPARING || 0), icon: UtensilsCrossed, color: 'text-[var(--primary)]' },
              { label: 'Ready to Serve',         value: summary.orderStatusBreakdown?.READY || 0,           icon: Utensils,     color: 'text-emerald-500' },
              { label: 'Guests Seated',          value: summary.reservationStatusBreakdown?.SEATED || 0,    icon: Armchair,     color: 'text-emerald-500' },
              { label: 'Confirmed Reservations', value: summary.reservationStatusBreakdown?.CONFIRMED || 0, icon: Users,        color: 'text-blue-500' },
            ].map((item, i) => (
              <div key={i} className='p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4'>
                <div className='w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0'>
                  <item.icon size={18} className={item.color} />
                </div>
                <div>
                  <p className='text-[10px] uppercase tracking-[0.2em] text-white/30 font-black mb-1'>{item.label}</p>
                  <p className='text-2xl font-black text-white tracking-tight'>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2 */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
        <div className='lg:col-span-7 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-10'>
            <h2 className='text-2xl font-bold text-white tracking-tight'>Weekly Order Trend</h2>
            <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2'>Daily order volume insights</p>
          </div>
          <div className='w-full h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={charts.dailyOrderTrend}>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />
                <XAxis dataKey='day' axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip contentStyle={{ background: '#0B0B0B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Bar dataKey='orders' fill='#C5A059' radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIVE ACTIVITY FEED */}
        <div className='lg:col-span-5 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-10 flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-white tracking-tight'>Live Activity Feed</h2>
              <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2'>Real-time branch events</p>
            </div>
            {activityFeed.length > 0 && (
              <div className='flex items-center gap-2'>
                <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                <span className='text-[9px] font-black text-emerald-500 uppercase tracking-widest'>Live</span>
              </div>
            )}
          </div>

          <div className='space-y-3 max-h-[320px] overflow-y-auto pr-1'>
            {activityFeed.length > 0 ? (
              activityFeed.map((item, i) => (
                <div
                  key={i}
                  className='p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/20 transition-all'
                >
                  <div className='flex items-center gap-3'>
                    {/* Icon differs by type */}
                    <div className='w-9 h-9 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0'>
                      {item.type === 'order'
                        ? <ShoppingCart size={14} className='text-[var(--primary)]' />
                        : <CalendarCheck size={14} className='text-blue-400' />
                      }
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-bold text-white truncate'>{item.label}</p>
                      <div className='flex items-center justify-between mt-1 gap-2'>
                        <p className={`text-[9px] uppercase tracking-widest font-black ${STATUS_FEED_COLOR[item.statusKey] || 'text-white/20'}`}>
                          {item.sub}
                        </p>
                        <p className='text-[9px] text-white/20 font-black shrink-0'>
                          {new Date(item.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='h-[250px] flex flex-col items-center justify-center text-center'>
                <Activity size={40} className='text-white/10 mb-5' />
                <h3 className='text-xl font-bold text-white mb-2'>Awaiting Live Activity</h3>
                <p className='text-white/20 text-sm uppercase tracking-[0.2em]'>No branch events detected yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ORDER TABLE */}
      <div className='card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden'>
        <div className='p-8 border-b border-white/5 flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-white tracking-tight'>Order Overview</h2>
            <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-1'>
              Click any row to view details · Press Escape or click outside to close
            </p>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5'>
            <div className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] font-black text-white/40 uppercase tracking-widest'>{activeOrders.length} Active</span>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-white/5'>
                {['Order', 'Table', 'Items', 'Status', 'Total', 'Time', ''].map((h, i) => (
                  <th key={i} className='p-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-white/[0.03]'>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-20 text-center'>
                    <p className='text-white/20 font-black uppercase tracking-widest text-xs'>No orders found</p>
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['PENDING_PAYMENT'];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className='group hover:bg-white/[0.02] transition-colors cursor-pointer'
                    >
                      <td className='p-6'>
                        <p className='font-black text-white group-hover:text-[var(--primary)] transition-colors uppercase tracking-tight'>
                          #{order.id.slice(-6)}
                        </p>
                        <p className='text-[10px] text-white/20 font-black uppercase mt-1'>
                          {order.customer?.fullName || 'Guest'}
                        </p>
                      </td>
                      <td className='p-6'>
                        <p className='text-xl font-black text-white'>T-{order.tableNumber}</p>
                      </td>
                      <td className='p-6 max-w-[200px]'>
                        <div className='flex flex-wrap gap-1.5'>
                          {order.items?.slice(0, 2).map((item: any, i: number) => (
                            <span key={i} className='px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-white/50'>
                              {item.quantity}× {item.menuItem?.name}
                            </span>
                          ))}
                          {order.items?.length > 2 && (
                            <span className='px-2 py-1 text-[10px] font-bold text-white/30'>+{order.items.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                          <Icon size={12} className={cfg.color} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className='p-6'>
                        <p className='text-lg font-black text-white'>£{Number(order.total).toFixed(2)}</p>
                      </td>
                      <td className='p-6'>
                        <p className='text-[10px] font-bold text-white/30'>
                          {new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className='p-6 text-right'>
                        <span className='text-[10px] font-black text-white/20 uppercase tracking-widest group-hover:text-[var(--primary)] transition-colors'>
                          View →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (() => {
        const cfg = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG['PENDING_PAYMENT'];
        const Icon = cfg.icon;
        return (
          <div
            className='fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300'
            onClick={closeModal}
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
                  onClick={closeModal}
                  className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-white/10 transition-all'
                  aria-label='Close'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='p-8 space-y-6 max-h-[65vh] overflow-y-auto'>
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <Icon size={16} className={cfg.color} />
                  <div>
                    <span className={`text-sm font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                    <p className='text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5'>
                      Status managed by kitchen & waiter staff
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1 flex items-center gap-1'><Hash size={9} /> Table</p>
                    <p className='text-xl font-black text-white'>T-{selectedOrder.tableNumber}</p>
                  </div>
                  <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1 flex items-center gap-1'><MapPin size={9} /> Branch</p>
                    <p className='text-sm font-black text-white'>{selectedOrder.branch?.name}</p>
                  </div>
                  <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1 flex items-center gap-1'><Clock3 size={9} /> Time</p>
                    <p className='text-sm font-black text-white'>
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                    <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1 flex items-center gap-1'><CreditCard size={9} /> Total</p>
                    <p className='text-xl font-black text-[var(--primary)]'>£{Number(selectedOrder.total).toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4'>Order Items</p>
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
                  <div className='flex items-start gap-3 p-4 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/20'>
                    <Receipt size={14} className='text-[var(--primary)] mt-0.5 shrink-0' />
                    <div>
                      <p className='text-[9px] uppercase tracking-widest font-black text-[var(--primary)]'>
                        Receipt #{selectedOrder.receipt.receiptNo}
                      </p>
                      <div className='grid grid-cols-2 gap-x-6 gap-y-1 mt-2'>
                        {[
                          { label: 'Subtotal',    value: selectedOrder.receipt.subtotal },
                          { label: 'Tax (10%)',   value: selectedOrder.receipt.taxAmount },
                          { label: 'Service (5%)', value: selectedOrder.receipt.serviceCharge },
                          { label: 'Grand Total', value: selectedOrder.receipt.total },
                        ].map(({ label, value }) => (
                          <div key={label} className='flex justify-between gap-4'>
                            <span className='text-[10px] text-white/30'>{label}</span>
                            <span className='text-[10px] font-black text-white'>£{Number(value).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.payment && (
                  <div className='flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5'>
                    <CreditCard size={14} className='text-white/30' />
                    <div>
                      <p className='text-[9px] uppercase tracking-widest font-black text-white/20'>Payment Method</p>
                      <p className='text-sm font-black text-white mt-0.5'>{selectedOrder.payment.paymentMethod}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='p-6 bg-white/[0.02] border-t border-white/5'>
                <button
                  onClick={closeModal}
                  className='w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-black text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2'
                >
                  <X size={14} />
                  Close — or press Escape
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BranchDashboard;