import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { socket } from '../../../socket';
import { useAuth } from '../../../context/AuthContext';
import {
  ConciergeBell,
  Users,
  CheckCircle2,
  ArrowRight,
  UtensilsCrossed,
  Coffee,
  CreditCard,
  Check,
  Clock3
} from 'lucide-react';

const WaiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const waiterOrders = (res.data.orders || []).filter((o: any) =>
        ['PENDING_PAYMENT', 'PAID', 'PREPARING', 'READY', 'SERVED'].includes(
          String(o.status).toUpperCase()
        )
      );
      setOrders(waiterOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      const all =
        res.data.data?.reservations ||
        res.data.reservations ||
        res.data.data ||
        res.data ||
        [];
      const active = (Array.isArray(all) ? all : []).filter((r: any) =>
        ['PENDING', 'CONFIRMED', 'SEATED'].includes(String(r.status).toUpperCase())
      );
      setReservations(active);
    } catch (error) {
      console.error('Reservation fetch failed:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchReservations()]);
      setLoading(false);
    };
    load();

    if (user?.branchId) socket.emit('join_branch', user.branchId);

    socket.on('order:created',       fetchOrders);
    socket.on('order:updated',       fetchOrders);
    socket.on('payment:completed',   fetchOrders);
    socket.on('reservation:created', fetchReservations);
    socket.on('reservation:updated', fetchReservations);

    return () => {
      socket.off('order:created',       fetchOrders);
      socket.off('order:updated',       fetchOrders);
      socket.off('payment:completed',   fetchOrders);
      socket.off('reservation:created', fetchReservations);
      socket.off('reservation:updated', fetchReservations);
    };
  }, [user?.branchId]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order', error);
    }
  };

  const markAsPaid = async (orderId: string) => {
    try {
      await api.post('/payments', { orderId, paymentMethod: 'CASH' });
      fetchOrders();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const completeDining = async (reservation: any) => {
    const servedOrder = orders.find(
      o =>
        Number(o.tableNumber) === Number(reservation.tableNumber) &&
        String(o.status).toUpperCase() === 'SERVED'
    );
    if (servedOrder) {
      try {
        await api.patch(`/orders/${servedOrder.id}/status`, { status: 'COMPLETED' });
      } catch (err) {
        console.error('Failed to complete order during dining completion:', err);
      }
    }
    try {
      await api.patch(`/reservations/${reservation.id}/status`, { status: 'COMPLETED' });
      fetchReservations();
      fetchOrders();
    } catch (err) {
      console.error('Failed to complete reservation:', err);
    }
  };

  const isReservationOrder = (order: any) => !order.customerId;

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const readyOrders    = orders.filter(o => String(o.status).toUpperCase() === 'READY');
  const servedOrders   = orders.filter(o => String(o.status).toUpperCase() === 'SERVED');
  const pendingPayment = orders.filter(o => String(o.status).toUpperCase() === 'PENDING_PAYMENT');
  const confirmedRes   = reservations.filter(r => String(r.status).toUpperCase() === 'CONFIRMED');
  const seatedRes      = reservations.filter(r => String(r.status).toUpperCase() === 'SEATED');

  const needsAttention = readyOrders.length + servedOrders.length + pendingPayment.length + confirmedRes.length;

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Syncing Guest Flow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>

      {/* HEADER */}
      <div>
        <div className='flex items-center gap-2 mb-4'>
          <ConciergeBell className='w-4 h-4 text-[var(--primary)]' />
          <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
            Front Of House Operations
          </p>
        </div>
        <h1 className='text-5xl font-bold text-white tracking-tight'>Guest Experience Hub</h1>
        <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
          Live snapshot of orders and reservations.
        </p>
      </div>

      {/* KPI STATS */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Ready to Serve',   value: readyOrders.length,    color: 'text-emerald-500'         },
          { label: 'Awaiting Payment', value: pendingPayment.length,  color: 'text-orange-500'          },
          { label: 'Guests to Seat',   value: confirmedRes.length,    color: 'text-blue-500'            },
          { label: 'Seated Tables',    value: seatedRes.length,       color: 'text-[var(--primary)]'    },
        ].map((stat, idx) => (
          <div
            key={idx}
            className='card bg-[#0B0B0B] border-white/5 p-6 flex justify-between items-center group hover:border-white/20 transition-all'
          >
            <span className='text-[10px] uppercase tracking-[0.2em] font-black text-white/40'>
              {stat.label}
            </span>
            <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── NEEDS ATTENTION ─────────────────────────────────────────────────── */}
      <div className='space-y-4'>
        <p className='text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] font-black'>
          Needs Attention
        </p>

        {needsAttention === 0 ? (
          <div className='py-16 card bg-[#0B0B0B] border-white/5 border-dashed flex flex-col items-center justify-center text-center'>
            <CheckCircle2 size={32} className='text-white/10 mb-4' />
            <p className='text-white/20 text-sm uppercase tracking-[0.2em] font-black'>
              All clear — nothing needs attention
            </p>
          </div>
        ) : (
          <div className='space-y-3'>

            {/* READY — serve button inline */}
            {readyOrders.map(order => (
              <div
                key={order.id}
                className='card bg-[#0B0B0B] border-emerald-500/20 p-5 flex items-center justify-between gap-4 transition-all'
              >
                <div className='flex items-center gap-4 min-w-0'>
                  <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0'>
                    <UtensilsCrossed size={16} className='text-emerald-500' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-white font-black text-sm uppercase'>
                      Table {order.tableNumber} — Ready to Serve
                    </p>
                    <p className='text-white/30 text-[10px] uppercase tracking-widest font-black mt-0.5'>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · {order.customer?.fullName || 'Guest'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => updateOrderStatus(order.id, 'SERVED')}
                  className='shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                >
                  <Check size={12} />
                  Serve
                </button>
              </div>
            ))}

            {/* SERVED — complete order or complete dining */}
            {servedOrders.map(order => {
              const linkedReservation = reservations.find(
                r => Number(r.tableNumber) === Number(order.tableNumber) &&
                     String(r.status).toUpperCase() === 'SEATED'
              );
              const isResOrder = isReservationOrder(order);

              return (
                <div
                  key={order.id}
                  className='card bg-[#0B0B0B] border-white/10 p-5 flex items-center justify-between gap-4 transition-all'
                >
                  <div className='flex items-center gap-4 min-w-0'>
                    <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0'>
                      <CheckCircle2 size={16} className='text-white/40' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-white font-black text-sm uppercase'>
                        Table {order.tableNumber} — Order Served
                      </p>
                      <p className='text-white/30 text-[10px] uppercase tracking-widest font-black mt-0.5'>
                        {order.customer?.fullName || 'Guest'} · £{order.total}
                      </p>
                    </div>
                  </div>

                  {/* Reservation order: complete dining closes the table */}
                  {isResOrder && linkedReservation ? (
                    <button
                      onClick={() => completeDining(linkedReservation)}
                      className='shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all'
                    >
                      <CheckCircle2 size={12} />
                      Complete Dining
                    </button>
                  ) : (
                    /* Walk-in order: just complete the order */
                    !isResOrder && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className='shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                      >
                        <CheckCircle2 size={12} />
                        Complete Order
                      </button>
                    )
                  )}
                </div>
              );
            })}

            {/* PENDING PAYMENT — confirm payment inline */}
            {pendingPayment.map(order => (
              <div
                key={order.id}
                className='card bg-[#0B0B0B] border-orange-500/20 p-5 flex items-center justify-between gap-4 transition-all'
              >
                <div className='flex items-center gap-4 min-w-0'>
                  <div className='w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0'>
                    <CreditCard size={16} className='text-orange-500' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-white font-black text-sm uppercase'>
                      Table {order.tableNumber} — Awaiting Payment
                    </p>
                    <p className='text-white/30 text-[10px] uppercase tracking-widest font-black mt-0.5'>
                      £{order.total} · {order.customer?.fullName || 'Guest'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => markAsPaid(order.id)}
                  className='shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                >
                  <CreditCard size={12} />
                  Confirm Payment
                </button>
              </div>
            ))}

            {/* CONFIRMED RESERVATIONS — navigate to seat them */}
            {confirmedRes.map(reservation => (
              <div
                key={reservation.id}
                className='card bg-[#0B0B0B] border-blue-500/20 p-5 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-500/40 transition-all'
                onClick={() => navigate('/dashboard/reservations')}
              >
                <div className='flex items-center gap-4 min-w-0'>
                  <div className='w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0'>
                    <Users size={16} className='text-blue-500' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-white font-black text-sm uppercase'>
                      {reservation.customerName} — Ready to Seat
                    </p>
                    <p className='text-white/30 text-[10px] uppercase tracking-widest font-black mt-0.5'>
                      {reservation.guests} guests · {new Date(reservation.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className='shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest'>
                  <ArrowRight size={12} />
                  Seat Guests
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* ── CURRENTLY SEATED ────────────────────────────────────────────────── */}
      {seatedRes.length > 0 && (
        <div className='space-y-4'>
          <p className='text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] font-black'>
            Currently Seated
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {seatedRes.map(reservation => {
              const tableOrder = orders.find(
                o => Number(o.tableNumber) === Number(reservation.tableNumber)
              );
              return (
                <div
                  key={reservation.id}
                  className='card bg-[#0B0B0B] border-white/5 p-5 cursor-pointer hover:border-[var(--primary)]/30 transition-all'
                  onClick={() =>
                    navigate(`/dashboard/orders?table=${reservation.tableNumber}`)
                  }
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                      <div className='w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0'>
                        <Coffee size={14} className='text-[var(--primary)]' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-white font-black text-sm uppercase truncate'>
                          {reservation.customerName}
                        </p>
                        <p className='text-white/30 text-[9px] uppercase tracking-widest font-black'>
                          Table {reservation.tableNumber} · {reservation.guests} guests
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={14} className='text-white/20 shrink-0' />
                  </div>

                  {tableOrder ? (
                    <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit ${
                      String(tableOrder.status).toUpperCase() === 'READY'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : String(tableOrder.status).toUpperCase() === 'PREPARING'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        : String(tableOrder.status).toUpperCase() === 'SERVED'
                        ? 'bg-white/5 border-white/10 text-white/40'
                        : String(tableOrder.status).toUpperCase() === 'PENDING_PAYMENT'
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    }`}>
                      Order {tableOrder.status}
                    </div>
                  ) : (
                    <div className='px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-white/30 w-fit'>
                      No order yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QUICK NAV ───────────────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <button
          onClick={() => navigate('/dashboard/orders')}
          className='py-5 rounded-2xl bg-[var(--primary)] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-glow'
        >
          <UtensilsCrossed size={14} />
          <span>Manage Orders</span>
          <ArrowRight size={14} />
        </button>
        <button
          onClick={() => navigate('/dashboard/reservations')}
          className='py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3'
        >
          <ConciergeBell size={14} />
          <span>Manage Reservations</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};

export default WaiterDashboard;