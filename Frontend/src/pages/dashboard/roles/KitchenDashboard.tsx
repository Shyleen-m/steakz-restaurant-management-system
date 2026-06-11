import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { socket } from '../../../socket';
import {
  ChefHat,
  Clock,
  AlertCircle,
  Play,
  ArrowRight,
  Zap
} from 'lucide-react';

const KitchenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const fetchLiveOrders = async () => {
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/reservations')
      ]);

      const allReservations =
        reservationsRes.data.data?.reservations ||
        reservationsRes.data.reservations ||
        reservationsRes.data.data ||
        reservationsRes.data ||
        [];

      const completedReservationTables = (Array.isArray(allReservations) ? allReservations : [])
        .filter((r: any) =>
          String(r.status).toUpperCase() === 'COMPLETED' &&
          r.tableNumber !== undefined &&
          r.tableNumber !== null
        )
        .map((r: any) => Number(r.tableNumber));

      const liveOrders = (ordersRes.data.orders || ordersRes.data || []).filter((order: any) => {
        if (completedReservationTables.includes(Number(order.tableNumber))) return false;
        return ['PAID', 'PREPARING', 'READY'].includes(order.status);
      });

      setOrders(liveOrders);
    } catch (error) {
      console.error('Kitchen orders fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveOrders();

    if (user?.branchId) socket.emit('join_branch', user.branchId);

    const timer = setInterval(() => setNow(Date.now()), 1000);

    socket.on('order:created',      fetchLiveOrders);
    socket.on('order:updated',      fetchLiveOrders);
    socket.on('reservation:updated',fetchLiveOrders);

    return () => {
      clearInterval(timer);
      socket.off('order:created',       fetchLiveOrders);
      socket.off('order:updated',       fetchLiveOrders);
      socket.off('reservation:updated', fetchLiveOrders);
    };
  }, [user?.branchId]);

  const getElapsedTime = (createdAt: string) => {
    const diff = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  };

  const isRush = (order: any) => {
    if (order.metadata?.isDelayed) return true;
    return (now - new Date(order.createdAt).getTime()) > 15 * 60 * 1000;
  };

  const paid      = orders.filter(o => o.status === 'PAID');
  const preparing = orders.filter(o => o.status === 'PREPARING');
  const ready     = orders.filter(o => o.status === 'READY');
  const rushed    = orders.filter(o => isRush(o));

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Initializing Kitchen Link
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <ChefHat className='w-4 h-4 text-[var(--primary)]' />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Culinary Intelligence
            </p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>Kitchen Overview</h1>
          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Live queue summary. Head to the kitchen page to action orders.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>
          <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center'>
            <Zap size={20} className='text-emerald-500 animate-pulse' />
          </div>
          <div>
            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>
              Live Kitchen Stream
            </p>
            <p className='text-xs font-black text-white uppercase tracking-tighter'>
              Fully Synchronized
            </p>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Awaiting Cook', value: paid.length,      color: 'text-amber-500'   },
          { label: 'Preparing',     value: preparing.length, color: 'text-blue-500'    },
          { label: 'Ready',         value: ready.length,     color: 'text-emerald-500' },
          { label: 'Delayed',       value: rushed.length,    color: 'text-red-500'     },
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

      {/* RUSH ALERTS */}
      {rushed.length > 0 && (
        <div className='space-y-3'>
          <p className='text-[10px] uppercase tracking-[0.3em] text-red-500 font-black'>
            Delayed Orders
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {rushed.map(order => (
              <div
                key={order.id}
                className='card bg-[#0B0B0B] border-red-500/30 p-5 flex items-center justify-between gap-4'
              >
                <div className='flex items-center gap-4'>
                  <AlertCircle size={16} className='text-red-500 shrink-0' />
                  <div>
                    <p className='text-white font-black text-sm uppercase tracking-tight'>
                      Table {order.tableNumber}
                    </p>
                    <p className='text-white/30 text-[10px] uppercase tracking-widest font-black'>
                      {order.customer?.fullName || 'Guest'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2 text-red-500'>
                  <Clock size={12} />
                  <span className='text-[10px] font-black tracking-widest'>
                    {getElapsedTime(order.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUEUE PREVIEW — top 6 orders, no actions */}
      {orders.length > 0 && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] font-black'>
              Active Queue
            </p>
            <span className='text-[10px] uppercase tracking-widest font-black text-white/20'>
              Showing {Math.min(orders.length, 6)} of {orders.length}
            </span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {orders.slice(0, 6).map(order => {
              const rush = isRush(order);
              return (
                <div
                  key={order.id}
                  className={`card bg-[#0B0B0B] p-5 flex items-center justify-between gap-4 transition-all ${
                    rush ? 'border-red-500/30' : 'border-white/5'
                  }`}
                >
                  <div className='min-w-0'>
                    <p className='text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5'>
                      Table {order.tableNumber}
                    </p>
                    <p className='text-white font-black text-sm uppercase truncate'>
                      {order.customer?.fullName || 'Guest'}
                    </p>
                    <p className='text-white/20 text-[10px] font-black mt-1'>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className='flex flex-col items-end gap-2 shrink-0'>
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      order.status === 'PAID'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : order.status === 'PREPARING'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      {order.status}
                    </div>
                    <div className={`flex items-center gap-1 ${rush ? 'text-red-500' : 'text-white/20'}`}>
                      <Clock size={10} />
                      <span className='text-[9px] font-black'>
                        {getElapsedTime(order.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA — go to full kitchen queue */}
      <button
        onClick={() => navigate('/dashboard/kitchen')}
        className='w-full py-5 rounded-2xl bg-[var(--primary)] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-glow'
      >
        <Play size={14} fill='currentColor' />
        <span>Open Kitchen Queue</span>
        <ArrowRight size={14} />
      </button>

      {/* EMPTY STATE */}
      {orders.length === 0 && (
        <div className='py-24 card bg-[#0B0B0B] border-white/5 border-dashed flex flex-col items-center justify-center text-center'>
          <ChefHat size={40} className='text-white/10 mb-6' />
          <h3 className='text-2xl font-bold text-white mb-2 uppercase'>Kitchen Clear</h3>
          <p className='text-white/20 text-sm uppercase tracking-[0.2em]'>No Active Orders</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;