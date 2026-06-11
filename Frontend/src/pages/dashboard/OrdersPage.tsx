import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import {
  Clock, ChefHat, CheckCircle, AlertCircle,
  Eye, ClipboardList, CheckCircle2, Coffee,
  CreditCard, Plus, Trash2, X
} from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const reservationTable = Number(searchParams.get('table')) || null;

  const [orders, setOrders]             = useState<any[]>([]);
  const [menuItems, setMenuItems]       = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const ordersData = (res.data.orders || []).map((o: any) => ({
        ...o,
        tableNumber: o.tableNumber != null ? Number(o.tableNumber) : o.tableNumber
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data.menuItems || res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to load menu:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenu();

    if (user?.branchId) {
      socket.emit('join_branch', user.branchId);
    }

    socket.on('order:created', fetchOrders);
    socket.on('order:updated', fetchOrders);
    socket.on('order:deleted', fetchOrders);

    return () => {
      socket.off('order:created', fetchOrders);
      socket.off('order:updated', fetchOrders);
      socket.off('order:deleted', fetchOrders);
    };
  }, [user?.branchId]);

  const normalizeStatus = (status: string | undefined) => {
    const n = status?.toString().toLowerCase() || 'pending_payment';
    if (n.includes('ready'))    return 'ready';
    if (n.includes('prep'))     return 'preparing';
    if (n.includes('serve'))    return 'served';
    if (n.includes('complet'))  return 'completed';
    if (n === 'paid')           return 'paid';
    if (n.includes('pending'))  return 'pending_payment';
    return n;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_payment': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: CreditCard,    label: 'Awaiting Payment' };
      case 'paid':            return { color: 'text-amber-500',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: AlertCircle,   label: 'Paid — Kitchen Queue' };
      case 'preparing':       return { color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: ChefHat,       label: 'Kitchen' };
      case 'ready':           return { color: 'text-emerald-500',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',icon: CheckCircle,   label: 'Ready' };
      case 'served':          return { color: 'text-white/60',   bg: 'bg-white/5',       border: 'border-white/10',      icon: CheckCircle2,  label: 'Served' };
      case 'completed':       return { color: 'text-white/30',   bg: 'bg-white/5',       border: 'border-white/5',       icon: CheckCircle2,  label: 'Completed' };
      default:                return { color: 'text-white/40',   bg: 'bg-white/5',       border: 'border-white/5',       icon: Clock,         label: status };
    }
  };

  const addItem = (menuItem: any) => {
    const existing = selectedItems.find(i => i.menuItemId === menuItem.id);
    if (existing) {
      setSelectedItems(selectedItems.map(i =>
        i.menuItemId === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setSelectedItems([...selectedItems, { menuItemId: menuItem.id, quantity: 1, menuItem }]);
    }
  };

  const removeItem = (id: string) => setSelectedItems(selectedItems.filter(i => i.menuItemId !== id));

  const createOrder = async () => {
    try {
      setCreatingOrder(true);
      await api.post('/orders', {
        branchId: user?.branchId,
        tableNumber: Number(reservationTable),
        items: selectedItems.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
      });
      setSelectedItems([]);
      fetchOrders();
    } catch (error) {
      console.error('Order creation failed:', error);
    } finally {
      setCreatingOrder(false);
    }
  };

  /**
   * WAITER CONFIRMS PAYMENT
   * Only available when order is PENDING_PAYMENT
   * This moves it to PAID which is when kitchen sees it
   */
  const markAsPaid = async (orderId: string) => {
    try {
      await api.post('/payments', { orderId, paymentMethod: 'CASH' });
      fetchOrders();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  // Only show orders for this table if navigated from reservation
  const filteredOrders = orders.filter(order => {
    if (reservationTable && Number(reservationTable) !== order.tableNumber) return false;
    return true;
  });

  const categories = Array.from(new Set(menuItems.map((item: any) => item.category || 'OTHER'))).sort((a, b) => a.localeCompare(b));
  const filteredMenuItems = selectedCategory === 'ALL' ? menuItems : menuItems.filter((item: any) => (item.category || 'OTHER') === selectedCategory);

  // Can only create order if no active order exists for this table yet
  const tableHasActiveOrder = filteredOrders.some(o =>
    ['pending_payment', 'paid', 'preparing', 'ready'].includes(normalizeStatus(o.status))
  );

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>Syncing Order Ledger</p>
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
            <ClipboardList className='w-4 h-4 text-[var(--primary)]' />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>Live Logistics & Fulfillment</p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>Order Management</h1>
          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Waiter-driven table ordering and payment processing.
          </p>
          {reservationTable && (
            <div className='mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20'>
              <span className='text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]'>Active Table</span>
              <span className='text-lg font-black text-white'>Table {reservationTable}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE ORDER (only shown when no active order for this table) ── */}
      {reservationTable && user?.role === 'WAITER' && !tableHasActiveOrder && (
        <div className='card bg-[#0B0B0B] border-white/5 p-8 space-y-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-white'>Create Order</h2>
              <p className='text-white/30 text-sm mt-1'>Select items for this table</p>
            </div>
            <div className='px-4 py-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-black uppercase tracking-widest'>
              Table {reservationTable}
            </div>
          </div>

          {/* Category filter */}
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === 'ALL' ? 'bg-[var(--primary)] text-black' : 'bg-white/5 border border-white/10 text-white/60'
              }`}
            >
              All Items
            </button>
            {categories.map((category: string) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === category ? 'bg-[var(--primary)] text-black' : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu items grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
            {filteredMenuItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className='p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/30 transition-all text-left'
              >
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-white font-bold'>{item.name}</h3>
                  <Plus size={16} className='text-[var(--primary)]' />
                </div>
                <p className='text-white/30 text-sm'>£{item.price}</p>
              </button>
            ))}
          </div>

          {/* Selected items */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white'>Selected Items</h3>
            {selectedItems.length === 0 ? (
              <div className='text-white/20 text-sm'>No items selected yet</div>
            ) : (
              <div className='space-y-3'>
                {selectedItems.map((item, idx) => (
                  <div key={idx} className='flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5'>
                    <div>
                      <p className='text-white font-bold'>{item.menuItem.name}</p>
                      <p className='text-white/30 text-sm'>Qty: {item.quantity} · £{(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeItem(item.menuItemId)} className='text-red-500/50 hover:text-red-500'>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={creatingOrder || selectedItems.length === 0}
            onClick={createOrder}
            className='w-full py-5 rounded-2xl bg-[var(--primary)] text-black font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50'
          >
            <Coffee size={18} />
            {creatingOrder ? 'Creating Order...' : 'Send to Payment'}
          </button>
        </div>
      )}

      {/* ── ORDERS LIST ── */}
      <div className='space-y-4'>
        {filteredOrders.length === 0 && (
          <div className='card bg-[#0B0B0B] border-white/5 p-20 text-center border-dashed'>
            <ClipboardList className='w-10 h-10 text-white/10 mx-auto mb-4' />
            <p className='text-white/20 font-black uppercase tracking-widest text-xs'>No orders for this table yet</p>
          </div>
        )}

        {filteredOrders.map(order => {
          const status = normalizeStatus(order.status);
          const config = getStatusConfig(status);
          const Icon = config.icon;

          return (
            <div key={order.id} className='group card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden hover:border-[var(--primary)]/20 transition-all duration-500'>
              <div className='flex flex-col lg:flex-row'>
                <div className={`w-1.5 shrink-0 ${config.bg.replace('/10', '')}`} />

                <div className='flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 p-8 items-center'>
                  <div className='md:col-span-2'>
                    <p className='text-[9px] font-black text-white/20 uppercase tracking-widest mb-1'>Reference</p>
                    <p className='text-lg font-black text-white tracking-tighter uppercase'>#{String(order.id).slice(-6)}</p>
                  </div>

                  <div className='md:col-span-2'>
                    <p className='text-[9px] font-black text-white/20 uppercase tracking-widest mb-1'>Table</p>
                    <p className='text-2xl font-black text-white tracking-tighter'>T-{order.tableNumber}</p>
                  </div>

                  <div className='md:col-span-5'>
                    <p className='text-[9px] font-black text-white/20 uppercase tracking-widest mb-2'>Items</p>
                    <div className='flex flex-wrap gap-2'>
                      {order.items?.map((item: any, idx: number) => (
                        <span key={idx} className='px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-white/60'>
                          {item.quantity}x {item.menuItem?.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className='md:col-span-1'>
                    <p className='text-[9px] font-black text-white/20 uppercase tracking-widest mb-1'>Total</p>
                    <p className='text-xl font-black text-[var(--primary)] tracking-tighter'>£{order.total}</p>
                  </div>

                  <div className='md:col-span-2 flex flex-col items-end gap-3'>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.color}`}>
                      <Icon size={14} />
                      <span className='text-[9px] font-black uppercase tracking-widest'>{config.label}</span>
                    </div>

                    {/* ✅ PAYMENT BUTTON — only when PENDING_PAYMENT */}
                    {status === 'pending_payment' && user?.role === 'WAITER' && (
                      <button
                        onClick={() => markAsPaid(order.id)}
                        className='px-6 py-2 bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center gap-2'
                      >
                        <CreditCard size={12} />
                        Confirm Payment
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className='px-6 py-2 bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[var(--primary)] hover:text-black hover:border-[var(--primary)] transition-all flex items-center gap-2'
                    >
                      <Eye size={12} />
                      Inspect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6' onClick={() => setSelectedOrder(null)}>
          <div className='card bg-[#0B0B0B] border-white/10 max-w-lg w-full p-0 shadow-2xl overflow-hidden' onClick={e => e.stopPropagation()}>
            <div className='p-8 border-b border-white/5 flex items-center justify-between'>
              <div>
                <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-1'>Order Detail</p>
                <h2 className='text-3xl font-bold text-white uppercase'>#{selectedOrder.id.slice(-6)}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-red-500/20 border border-white/10 transition-all'>
                <X size={20} />
              </button>
            </div>
            <div className='p-8 space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Table</p>
                  <p className='text-xl font-black text-white'>T-{selectedOrder.tableNumber}</p>
                </div>
                <div className='p-4 rounded-xl bg-white/5 border border-white/5'>
                  <p className='text-[9px] uppercase tracking-widest font-black text-white/20 mb-1'>Total</p>
                  <p className='text-xl font-black text-[var(--primary)]'>£{Number(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-4'>Items</p>
                <div className='space-y-3'>
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className='flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5'>
                      <div className='flex items-center gap-4'>
                        <div className='w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-xs'>{item.quantity}</div>
                        <span className='text-sm font-bold text-white'>{item.menuItem?.name}</span>
                      </div>
                      <span className='text-sm font-black text-white/60'>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='p-6 border-t border-white/5'>
              <button onClick={() => setSelectedOrder(null)} className='w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-black text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2'>
                <X size={14} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;