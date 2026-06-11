import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import {useSearchParams} from "react-router-dom";

import {
  ShoppingBag,
  Plus,
  Minus,
  ChefHat,
  Trash2,
  ArrowRight,
  Activity,
  Search,
  Info
} from 'lucide-react';

const CreateOrderPage = () => {

  const [menuItems, setMenuItems] =
    useState<any[]>([]);

  const [orders, setOrders] =
    useState<any[]>([]);

  const [selectedItems, setSelectedItems] =
    useState<any[]>([]);

  const [searchParams] = useSearchParams();

const reservationTable =
  Number(searchParams.get('table')) || 1;

const [tableNumber, setTableNumber] =
  useState(reservationTable);

  const { user } = useAuth();

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState('');

  useEffect(() => {

    fetchMenu();
    fetchOrders();

  }, []);

  const fetchMenu = async () => {

    try {

      const res =
        await api.get('/menu');

      setMenuItems(
        res.data.menuItems || []
      );

    } catch (error) {

      console.error(
        'Failed to fetch menu',
        error
      );

    } finally {

      setLoading(false);
    }
  };

  const fetchOrders = async () => {

    try {

      const res =
        await api.get('/orders');

      setOrders(
        res.data.orders || []
      );

    } catch (error) {

      console.error(
        'Failed to fetch orders',
        error
      );
    }
  };

  const addItem = (item: any) => {

    const existing =
      selectedItems.find(
        i => i.id === item.id
      );

    if (existing) {

      setSelectedItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                quantity:
                  i.quantity + 1
              }
            : i
        )
      );

      return;
    }

    setSelectedItems(prev => [
      ...prev,
      {
        ...item,
        quantity: 1
      }
    ]);
  };

  const increaseQuantity =
    (id: string) => {

      setSelectedItems(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1
              }
            : item
        )
      );
    };

  const decreaseQuantity =
    (id: string) => {

      setSelectedItems(prev =>
        prev
          .map(item =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1
                }
              : item
          )
          .filter(
            item =>
              item.quantity > 0
          )
      );
    };

  const removeItem =
    (id: string) => {

      setSelectedItems(prev =>
        prev.filter(
          item =>
            item.id !== id
        )
      );
    };

  const total = useMemo(() => {

    return selectedItems.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.quantity,
      0
    );

  }, [selectedItems]);

  const submitOrder =
    async () => {

      if (
        !selectedItems.length
      ) {

        alert(
          'Please add menu items'
        );

        return;
      }

      try {

        setSubmitting(true);

        await api.post('/orders', {
  branchId: user?.branchId,
  tableNumber: Number(tableNumber),
  status: 'PENDING_PAYMENT',
  items: selectedItems.map(item => ({
    menuItemId: item.id,
    quantity: item.quantity
  }))
});

        alert(
          'Order transmitted successfully'
        );

        setSelectedItems([]);

        fetchOrders();

      } catch (error) {

        console.error(
          'Failed to create order',
          error
        );

        alert(
          'Transmission failed'
        );

      } finally {

        setSubmitting(false);
      }
    };

  const filteredMenu =
    menuItems.filter(
      item =>
        item.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        item.category
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );

  const occupiedTables =
    (orders
      ?.filter(
        (o: any) =>
          [
            'PENDING_PAYMENT',
            'PAID',
            'PREPARING',
            'READY',
            'SERVED'
          ].includes(String(o.status).toUpperCase())
      )
      .map((o: any) => Number(o.tableNumber)) ) || [];

  const availableTables = Array.from({ length: 20 }, (_, i) => i + 1).filter(
    table => !occupiedTables.includes(table)
  );

  if (loading) {

    return (
      <div className='flex h-[60vh] items-center justify-center'>

        <div className='animate-pulse flex flex-col items-center'>

          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4'></div>

          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Syncing Culinary Cluster
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

            <ShoppingBag className='w-4 h-4 text-[var(--primary)]' />

            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Point of Sale & Gastronomy
            </p>
          </div>

          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Create Order
          </h1>

          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Build bespoke guest orders and transmit manifests directly to the culinary preparation queue.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>

          <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center'>

            <Activity
              size={20}
              className='text-emerald-500 animate-pulse'
            />
          </div>

          <div>

            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>
              Menu Sync
            </p>

            <p className='text-xs font-black text-white uppercase tracking-tighter'>
              Live Database
            </p>
          </div>
        </div>
      </div>

      <div className='grid gap-12 lg:grid-cols-[1fr_400px]'>

        {/* MENU */}
        <div className='space-y-10'>

          <div className='relative group'>

            <Search className='absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[var(--primary)] transition-colors' />

            <input
              type='text'
              placeholder='Search culinary collection...'
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className='w-full bg-[#0B0B0B] border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-sm text-white focus:outline-none focus:border-[var(--primary)]/50 focus:bg-[#121212] transition-all placeholder:text-white/10 shadow-xl'
            />
          </div>

          <div className='grid gap-8 md:grid-cols-2'>

            {filteredMenu.map(
              item => (

                <div
                  key={item.id}
                  className='group card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-2xl transition-all duration-700'
                >

                  <div className='relative h-48 overflow-hidden'>

                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={item.name}
                      className='w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110'
                    />

                    <div className='absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent opacity-60'></div>

                    <div className='absolute bottom-4 left-6'>

                      <p className='text-[9px] font-black text-[var(--primary)] uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-[var(--primary)]/20 inline-block'>

                        {item.category ||
                          'Signature'}

                      </p>
                    </div>
                  </div>

                  <div className='p-8'>

                    <div className='flex justify-between items-start gap-4 mb-6'>

                      <div>

                        <h2 className='text-xl font-bold text-white group-hover:text-[var(--primary)] transition-colors tracking-tight'>
                          {item.name}
                        </h2>

                        <p className='mt-2 text-white/30 text-xs font-medium leading-relaxed line-clamp-2 italic'>

                          "
                          {item.description ||
                            "A masterfully crafted selection featuring the season's finest ingredients."}
                          "

                        </p>
                      </div>

                      <span className='text-xl font-black text-white tracking-tighter'>
                        £{item.price}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        addItem(item)
                      }
                      className='w-full py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:bg-[var(--primary)] hover:text-black hover:border-[var(--primary)] transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]'
                    >

                      <Plus size={14} />

                      <span>
                        Incorporate to Order
                      </span>
                    </button>
                  </div>
                </div>
              )
            )}

            {filteredMenu.length ===
              0 && (

              <div className='col-span-full py-32 card bg-[#0B0B0B] border-white/5 border-dashed flex flex-col items-center justify-center text-center'>

                <Info className='w-12 h-12 text-white/10 mb-6' />

                <p className='text-[10px] font-black uppercase text-white/20 tracking-widest'>
                  No culinary files match your query
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ORDER PANEL */}
        <div className='relative'>

          <div className='sticky top-28 space-y-8'>

            <div className='card bg-[#0B0B0B] border-[var(--primary)]/20 p-8 shadow-2xl relative overflow-hidden group'>

              <div className='absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full -mr-16 -mt-16 blur-3xl'></div>

              <div className='flex items-center gap-4 mb-10'>

                <div className='w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20'>

                  <ChefHat
                    size={20}
                    className='text-[var(--primary)]'
                  />
                </div>

                <div>

                  <h2 className='text-2xl font-bold text-white tracking-tight'>
                    Active Station
                  </h2>

                  <p className='text-[9px] uppercase font-black text-white/20 tracking-widest'>
                    Manifest v1.2
                  </p>
                </div>
              </div>

              {/* TABLES */}
              <div className='space-y-4'>

                <label className='text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center gap-2'>
                  Available Tables
                </label>

                <div className='grid grid-cols-3 gap-3'>

                  {availableTables.map(
                    table => (

                      <button
                        key={table}
                        onClick={() =>
                          setTableNumber(
                            table
                          )
                        }
                        className={`
                          py-4 rounded-xl border text-xs font-black uppercase tracking-widest transition-all
                          ${
                            tableNumber ===
                            table
                              ? 'bg-[var(--primary)] text-black border-[var(--primary)]'
                              : 'bg-white/5 text-white/50 border-white/10 hover:border-[var(--primary)]/40 hover:text-white'
                          }
                        `}
                      >

                        Table {table}

                      </button>
                    )
                  )}
                </div>

                <p className='text-[9px] uppercase tracking-[0.2em] text-white/20 font-black pt-2'>
                  Occupied tables are automatically hidden
                </p>
              </div>

              {/* ITEMS */}
              <div className='pt-8 border-t border-white/5 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mt-8'>

                {selectedItems.length ===
                0 ? (

                  <div className='py-20 text-center'>

                    <p className='text-[9px] font-black uppercase text-white/10 tracking-[0.2em]'>
                      Matrix Empty - Select Items
                    </p>
                  </div>

                ) : (

                  selectedItems.map(
                    item => (

                      <div
                        key={item.id}
                        className='group/item flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all'
                      >

                        <div className='flex justify-between items-start gap-4'>

                          <div className='min-w-0'>

                            <h3 className='font-bold text-white text-sm truncate'>
                              {item.name}
                            </h3>

                            <p className='text-[10px] text-white/20 font-black mt-1 uppercase'>
                              £{item.price} Unit
                            </p>
                          </div>

                          <p className='font-black text-white tracking-tighter'>
                            £
                            {(
                              item.price *
                              item.quantity
                            ).toFixed(2)}
                          </p>
                        </div>

                        <div className='mt-4 flex items-center justify-between'>

                          <button
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className='text-red-500/30 hover:text-red-500 transition-colors'
                          >

                            <Trash2 size={12} />
                          </button>

                          <div className='flex items-center gap-3 bg-black p-1 rounded-lg border border-white/5'>

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.id
                                )
                              }
                              className='w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all'
                            >

                              <Minus size={10} />
                            </button>

                            <span className='font-black text-xs text-white min-w-[1.5ch] text-center'>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.id
                                )
                              }
                              className='w-6 h-6 rounded-md flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all'
                            >

                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>

              {/* TOTAL */}
              <div className='pt-8 border-t border-white/5 mt-8'>

                <div className='flex justify-between items-end mb-8'>

                  <span className='text-[10px] uppercase font-black text-white/20 tracking-[0.3em]'>
                    Capital Total
                  </span>

                  <span className='text-4xl font-black text-white tracking-tighter'>
                    £{total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={submitOrder}
                  disabled={
                    submitting ||
                    selectedItems.length ===
                      0
                  }
                  className='w-full py-5 rounded-xl bg-[var(--primary)] text-black text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] disabled:opacity-20 transition-all'
                >

                  {submitting
                    ? 'Transmitting...'
                    : 'Dispatch to Kitchen'}

                  {!submitting && (
                    <ArrowRight
                      size={14}
                    />
                  )}
                </button>
              </div>
            </div>

            <div className='px-6 text-center'>

              <p className='text-[9px] font-black text-white/10 uppercase tracking-[0.3em]'>
                Authorized Session v1.0.4
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;