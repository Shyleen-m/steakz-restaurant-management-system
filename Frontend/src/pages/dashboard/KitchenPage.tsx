import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import {
  ChefHat, Clock, CheckCircle2, Play,
  ChevronRight, MapPin, Zap
} from 'lucide-react';

const KitchenPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const normalizeOrderStatus = (status: any) => String(status || '').toUpperCase();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');

      // ✅ Only show PAID, PREPARING, READY — never PENDING_PAYMENT
      const kitchenOrders = (res.data.orders || []).filter((order: any) => {
        const status = normalizeOrderStatus(order.status);
        return ['PAID', 'PREPARING', 'READY'].includes(status);
      });

      setOrders(kitchenOrders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (user?.branchId) {
      socket.emit('join_branch', user.branchId);
    }

    socket.on('order:created',       fetchOrders);
    socket.on('order:updated',       fetchOrders);
    socket.on('payment:completed',   fetchOrders);

    return () => {
      socket.off('order:created',     fetchOrders);
      socket.off('order:updated',     fetchOrders);
      socket.off('payment:completed', fetchOrders);
    };
  }, [user?.branchId]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredOrders =
    filter === 'ALL'
      ? orders
      : orders.filter(o => normalizeOrderStatus(o.status) === normalizeOrderStatus(filter));

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>Connecting Kitchen Hub</p>
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
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>Culinary Operations Control</p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>Live Kitchen Queue</h1>
          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Real-time kitchen workflow and preparation management.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>
          <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center'>
            <Zap size={20} className='text-emerald-500 animate-pulse' />
          </div>
          <div>
            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>Live Kitchen Stream</p>
            <p className='text-xs font-black text-white uppercase tracking-tighter'>Fully Synchronized</p>
          </div>
        </div>
      </div>

      {/* FILTERS — PENDING_PAYMENT removed */}
      <div className='flex flex-wrap gap-2 p-1.5 bg-[#0B0B0B] border border-white/5 rounded-2xl w-fit'>
        {['ALL', 'PAID', 'PREPARING', 'READY'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              filter === status
                ? 'bg-[var(--primary)] text-black shadow-glow'
                : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            {status === 'PAID' ? 'Paid — Queue' : status}
          </button>
        ))}
      </div>

      {/* ORDERS GRID */}
      <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
        {filteredOrders.map(order => {
          const orderStatus = normalizeOrderStatus(order.status);

          return (
            <div
              key={order.id}
              className='group card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-2xl transition-all duration-700'
            >
              {/* STATUS BAR */}
              <div className={`h-1.5 w-full ${
                orderStatus === 'PAID'      ? 'bg-amber-500' :
                orderStatus === 'PREPARING' ? 'bg-blue-500' :
                'bg-emerald-500'
              }`} />

              <div className='p-8 space-y-8'>

                {/* CARD HEADER */}
                <div className='flex justify-between items-start gap-4'>
                  <div className='min-w-0'>
                    <p className='text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1'>Order Reference</p>
                    <h2 className='text-3xl font-black text-white group-hover:text-[var(--primary)] transition-colors truncate uppercase tracking-tighter'>
                      #{order.id.slice(-6)}
                    </h2>
                    <p className='text-sm text-white/50 mt-2'>
                      {order.customer?.fullName || 'Guest Customer'}
                    </p>
                  </div>

                  <div className='text-right shrink-0'>
                    <div className='flex items-center gap-2 justify-end text-[var(--primary)] mb-2'>
                      <MapPin size={10} />
                      <span className='text-[10px] font-black uppercase tracking-widest'>Table {order.tableNumber}</span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest font-black border mb-2 ${
                      orderStatus === 'PAID'      ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      orderStatus === 'PREPARING' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}>
                      {orderStatus === 'PAID' ? 'Paid — Start Cooking' : orderStatus}
                    </div>
                    <div className='flex items-center gap-2 justify-end text-white/20'>
                      <Clock size={10} />
                      <span className='text-[10px] font-bold'>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className='space-y-3'>
                  <p className='text-[8px] uppercase tracking-[0.3em] font-black text-white/10 mb-4'>Order Items</p>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className='flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group/item hover:bg-white/[0.05] transition-all'>
                      <div className='flex items-center gap-4'>
                        <div className='w-8 h-8 rounded-lg bg-black flex items-center justify-center text-[var(--primary)] font-black text-xs'>
                          {item.quantity}
                        </div>
                        <span className='font-bold text-white/80 group-hover/item:text-[var(--primary)] transition-colors'>
                          {item.menuItem?.name}
                        </span>
                      </div>
                      <ChevronRight size={12} className='text-white/10' />
                    </div>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className='pt-4 flex flex-wrap gap-3'>

                  {/* ✅ Only PAID orders can start cooking — never PENDING_PAYMENT */}
                  {orderStatus === 'PAID' && (
                    <button
                      onClick={() => updateStatus(order.id, 'PREPARING')}
                      className='flex-1 py-4 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-glow flex items-center justify-center gap-2'
                    >
                      <Play size={12} fill='currentColor' />
                      <span>Start Cooking</span>
                    </button>
                  )}

                  {orderStatus === 'PREPARING' && (
                    <button
                      onClick={() => updateStatus(order.id, 'READY')}
                      className='flex-1 py-4 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2'
                    >
                      <CheckCircle2 size={12} />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {orderStatus === 'READY' && (
                    <div className='flex-1 py-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 flex items-center justify-center gap-2'>
                      <CheckCircle2 size={12} />
                      <span className='text-[10px] uppercase font-black tracking-widest'>Ready for Waiter</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className='col-span-full py-40 card bg-[#0B0B0B] border-white/5 border-dashed flex flex-col items-center justify-center text-center'>
            <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8'>
              <ChefHat size={32} className='text-white/10' />
            </div>
            <h3 className='text-2xl font-bold text-white mb-2 uppercase tracking-tight'>Kitchen Queue Clear</h3>
            <p className='text-white/20 text-sm font-medium uppercase tracking-[0.2em]'>No active kitchen orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPage;