import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  Receipt,
  CheckCircle,
  X,
  MapPin,
  Clock,
  Hash
} from 'lucide-react';
import BackToHome from '../../components/BackToHome';

interface ReceiptData {
  receiptNo: string;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  total: number;
  paymentMethod: string;
  order: {
    id: string;
    tableNumber: number;
    branch: { name: string; city: string };
    items: { quantity: number; price: number; menuItem: { name: string } }[];
    createdAt: string;
  };
}

const CartPage = () => {
const navigate = useNavigate();

const { user } = useAuth();

const {
  cart,
  total,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart
} = useCart();

  const [tableNumber, setTableNumber] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH' | 'ONLINE'>('CARD');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [occupiedTables, setOccupiedTables] = useState<number[]>([]);

  const availableTableNumbers = Array.from({ length: 20 }, (_, i) => i + 1).filter(
    (table) => !occupiedTables.includes(table)
  );

  useEffect(() => {
    const loadOccupiedTables = async () => {
      try {
        const [ordersRes, reservationsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/reservations')
        ]);

        const fetchedOrders = ordersRes.data.orders || ordersRes.data || [];
        const fetchedReservations =
          reservationsRes.data.data?.reservations ||
          reservationsRes.data.reservations ||
          reservationsRes.data ||
          [];

        const occupiedSet = new Set<number>();

        (Array.isArray(fetchedOrders) ? fetchedOrders : []).forEach((order: any) => {
          const status = String(order.status || '').toUpperCase();
          if (
            order.tableNumber &&
            [
              'PENDING_PAYMENT',
              'PAID',
              'PREPARING',
              'READY',
              'SERVED'
            ].includes(status)
          ) {
            occupiedSet.add(order.tableNumber);
          }
        });

        (Array.isArray(fetchedReservations) ? fetchedReservations : []).forEach((reservation: any) => {
          const status = String(reservation.status || '').toUpperCase();
          if (
            reservation.tableNumber &&
            ['CONFIRMED', 'SEATED'].includes(status)
          ) {
            occupiedSet.add(reservation.tableNumber);
          }
        });

        const occupiedArray = Array.from(occupiedSet).sort((a, b) => a - b);
        setOccupiedTables(occupiedArray);

        const availableTableNumbers = Array.from({ length: 20 }, (_, i) => i + 1).filter(
          (tableNumber) => !occupiedSet.has(tableNumber)
        );

        if (availableTableNumbers.length) {
          setTableNumber((prevTableNumber) =>
            occupiedSet.has(prevTableNumber)
              ? availableTableNumbers[0]
              : prevTableNumber
          );
        }
      } catch (error) {
        console.error('Failed to load table availability:', error);
      }
    };

    loadOccupiedTables();
  }, []);

  const checkout = async () => {

  // Require login only at checkout
  if (!user) {
    navigate("/login");
    return;
  }

  if (!cart.length) return;

  try {
      setLoading(true);

      // Step 1: Create order
      const orderRes = await api.post('/orders', {
        tableNumber,
        branchId: Number(cart[0].branchId),
        items: cart.map(item => ({
          menuItemId: String(item.id),
          quantity: item.quantity
        }))
      });

      const orderId = orderRes.data.order.id;

      // Step 2: Process payment — returns receipt
      const paymentRes = await api.post('/payments', {
        orderId,
        paymentMethod
      });

      // Step 3: Show receipt modal
      const receiptData = paymentRes.data.receipt || buildReceiptFromResponse(paymentRes.data);
      setReceipt(receiptData);
      setOrderPlaced(true);
      clearCart();

    } catch (error: any) {
      console.error('Checkout failed', error);
      alert(error?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fallback: build receipt display from order data if receipt model not returned
  const buildReceiptFromResponse = (data: any): ReceiptData => {
    const order = data.order;
    const subtotal = order.total;
    const taxAmount = subtotal * 0.1;
    const serviceCharge = subtotal * 0.05;
    return {
      receiptNo: data.payment?.id?.slice(-8).toUpperCase() || 'N/A',
      subtotal,
      taxAmount,
      serviceCharge,
      total: subtotal + taxAmount + serviceCharge,
      paymentMethod: data.payment?.paymentMethod || paymentMethod,
      order
    };
  };

  const handleDone = () => {
    setReceipt(null);
    navigate('/account');
  };

  // ─── RECEIPT MODAL ──────────────────────────────────────
  if (receipt) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
        <Navbar />
        <main className="pt-32 pb-24 flex items-center justify-center">
          <div className="w-full max-w-lg mx-auto px-6">
            {/* Success indicator */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-black mb-2">Payment Confirmed</p>
              <h1 className="text-4xl font-bold text-white">Order Placed</h1>
            </div>

            {/* Receipt card */}
            <div className="card bg-[#0B0B0B] border-white/10 overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-[var(--primary)]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[var(--primary)]">Receipt</span>
                  </div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">#{receipt.receiptNo}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <MapPin className="w-3 h-3 text-[var(--primary)]/60" />
                    <span>{receipt.order?.branch?.name || 'Steakz'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Hash className="w-3 h-3 text-[var(--primary)]/60" />
                    <span>Table {receipt.order?.tableNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock className="w-3 h-3 text-[var(--primary)]/60" />
                    <span>{new Date(receipt.order?.createdAt || Date.now()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <CreditCard className="w-3 h-3 text-[var(--primary)]/60" />
                    <span>{receipt.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-8 border-b border-white/5 space-y-3">
                {receipt.order?.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/5 text-[var(--primary)] text-[10px] font-black flex items-center justify-center">
                        {item.quantity}
                      </span>
                      <span className="text-sm text-white/70 font-medium">{item.menuItem?.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="p-8 space-y-3">
                <div className="flex justify-between text-sm text-white/40">
                  <span>Subtotal</span>
                  <span>£{receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/40">
                  <span>Tax (10%)</span>
                  <span>£{receipt.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/40">
                  <span>Service charge (5%)</span>
                  <span>£{receipt.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="h-px bg-white/5 my-4" />
                <div className="flex justify-between items-end">
                  <span className="text-sm uppercase tracking-[0.3em] font-black text-white">Total Paid</span>
                  <span className="text-3xl font-black text-white">£{receipt.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Status note */}
              <div className="px-8 pb-8">
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] uppercase tracking-widest font-black text-amber-500">
                    Your order is being prepared — track status in your account
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="btn-primary w-full py-5 mt-8 flex items-center justify-center gap-3"
            >
              <span className="text-sm font-black tracking-widest uppercase">Track My Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── CART VIEW ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Navbar />

      <main className='pt-32 pb-24'>
        <div className="container mx-auto px-6">
          <BackToHome />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-4">Your Selection</p>
              <h1 className="text-6xl font-bold text-white mb-6">Culinary Order</h1>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-white/30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="card bg-[#0B0B0B] border-white/5 p-24 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8">
                <ShoppingBag className="w-10 h-10 text-white/10" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
              <button onClick={() => navigate('/menu/manchester')} className="btn-primary px-12 py-5">
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 items-start">
              {/* Cart items */}
              <div className="lg:col-span-8 space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="card bg-[#0B0B0B] border-white/5 p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex flex-col md:flex-row items-center gap-8 flex-1">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-center md:text-left">
                          <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
                          <p className="text-[var(--primary)] font-black text-lg">£{item.price}</p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="mt-6 flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-red-500/50"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Item</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end gap-6 min-w-[140px]">
                        <div className="flex items-center gap-4 bg-white/5 rounded-xl p-1 border border-white/5">
                          <button onClick={() => decreaseQuantity(item.id)} className="w-10 h-10 rounded-lg flex items-center justify-center">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-lg min-w-[2ch] text-center">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.id)} className="w-10 h-10 rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-2xl font-black text-white">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-4 sticky top-32">
                <div className="card bg-[#0B0B0B] border-[var(--primary)]/20 p-10 shadow-2xl space-y-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-4">
                    <CreditCard className="w-8 h-8 text-[var(--primary)]" />
                    Finalization
                  </h2>

                  {/* Table Selection */}
<div className="space-y-4">

  <label className="text-[10px] uppercase tracking-widest font-black text-white/30">
    Available Tables
  </label>

  {availableTableNumbers.length === 0 ? (

    <div className="rounded-xl border border-red-500/20 bg-red-500/5 py-6 text-center">

      <p className="text-[10px] uppercase tracking-widest font-black text-red-400">
        No Tables Available
      </p>
    </div>

  ) : (

    <div className="grid grid-cols-3 gap-3">

      {availableTableNumbers.map(
        (table) => (

          <button
            key={table}
            onClick={() =>
              setTableNumber(table)
            }
            className={`
              py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all

              ${
                tableNumber === table
                  ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                  : 'bg-white/5 text-white/40 border-white/10 hover:border-[var(--primary)]/40 hover:text-white'
              }
            `}
          >

            Table {table}

          </button>
        )
      )}
    </div>
  )}

  <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-black">
    Occupied tables are automatically hidden
  </p>

</div>

                  {/* Payment method */}
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-white/30">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['CARD', 'CASH', 'ONLINE'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            paymentMethod === method
                              ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                              : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Totals preview */}
                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs text-white/30">
                      <span>Subtotal</span><span>£{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/30">
                      <span>Tax (10%)</span><span>£{(total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/30">
                      <span>Service (5%)</span><span>£{(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-3">
                      <span className="text-sm uppercase tracking-[0.3em] font-black text-white">Total</span>
                      <span className="text-3xl font-black text-white">£{(total * 1.15).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={checkout}
                    disabled={loading || availableTableNumbers.length === 0}
                    className="btn-primary w-full py-5 flex items-center justify-center gap-4"
                  >
                    <span className="text-lg font-black tracking-widest uppercase">
                      {loading ? 'Processing...' : 'Pay Now'}
                    </span>
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;