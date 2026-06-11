import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { socket } from '../../socket';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Armchair,
  XCircle,
  Check,
  UserCheck,
  LayoutDashboard,
  Zap,
  Hash,
  Coffee
} from 'lucide-react';

interface Reservation {
  id: string;
  customerName: string;
  branch?: { name: string };
  reservationTime: string;
  guests: number;
  specialRequests?: string;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'SEATED'
    | 'COMPLETED'
    | 'CANCELLED';
  tableNumber?: number;
}

interface ActiveOrder {
  id: string;
  tableNumber: number;
  status: string;
  total: number;
  items: {
    quantity: number;
    menuItem: { name: string };
  }[];
}

const TablesPage = () => {

  const { user } = useAuth();

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [activeOrders, setActiveOrders] =
    useState<ActiveOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [seatingReservationId, setSeatingReservationId] =
    useState<string | null>(null);

  const [selectedTable, setSelectedTable] =
    useState<number | null>(null);

  const fetchReservations =
    useCallback(async () => {

      try {

        const res =
          await api.get('/reservations');

        const reservationsData =
          res.data.data?.reservations ||
          res.data.reservations ||
          res.data ||
          [];

        setReservations(reservationsData);
        return reservationsData;

      } catch (error) {

        console.error(
          'Failed to fetch reservations',
          error
        );
        return [];
      }
    }, []);

  const fetchOrders =
    useCallback(async (reservationList?: Reservation[]) => {

      try {

        const res =
          await api.get('/orders');

        const all =
          res.data.orders || [];

        const reservationsToCheck =
          reservationList || reservations;

        const completedReservationTables =
          reservationsToCheck
            .filter(
              r =>
                r.tableNumber !== undefined &&
                r.status === 'COMPLETED'
            )
            .map(r => Number(r.tableNumber));

        setActiveOrders(
          all.filter((o: any) => {
            const status = String(o.status || '').toUpperCase();
            const orderTable = Number(o.tableNumber);

            if (
              completedReservationTables.includes(
                orderTable
              )
            ) {
              return false;
            }

            return (
              status === 'PENDING_PAYMENT' ||
              [
                'PAID',
                'PREPARING',
                'READY',
                'SERVED'
              ].includes(status)
            );
          })
        );

      } catch (error) {

        console.error(
          'Failed to fetch orders',
          error
        );
      }
    }, [reservations]);

  useEffect(() => {

    const loadTables = async () => {
      const reservationsData = await fetchReservations();
      await fetchOrders(reservationsData);
      setLoading(false);
    };

    loadTables();

    if (user?.branchId) {
      socket.emit(
        'join_branch',
        user.branchId
      );
    }

    socket.on(
      'reservation:created',
      fetchReservations
    );

    socket.on(
      'reservation:updated',
      fetchReservations
    );

    socket.on(
      'reservation:deleted',
      fetchReservations
    );

    socket.on(
      'order:created',
      fetchOrders
    );

    socket.on(
      'order:updated',
      fetchOrders
    );

    socket.on(
      'order:deleted',
      fetchOrders
    );

    return () => {

      socket.off(
        'reservation:created',
        fetchReservations
      );

      socket.off(
        'reservation:updated',
        fetchReservations
      );

      socket.off(
        'reservation:deleted',
        fetchReservations
      );

      socket.off(
        'order:created',
        fetchOrders
      );

      socket.off(
        'order:updated',
        fetchOrders
      );

      socket.off(
        'order:deleted',
        fetchOrders
      );
    };

  }, [
    fetchReservations,
    fetchOrders,
    user?.branchId
  ]);

  const updateReservationStatus =
    async (
      id: string,
      status: string,
      tableNumber?: number
    ) => {

      try {

        const payload: any = { status };
        if (tableNumber !== undefined) {
          payload.tableNumber = tableNumber;
        }

        await api.patch(
          `/reservations/${id}/status`,
          payload
        );

        setSeatingReservationId(null);
        setSelectedTable(null);
        fetchReservations();

      } catch (error) {

        console.error(
          `Failed to update reservation status`,
          error
        );
      }
    };

  const totalTables = 20;

  const hasCompletedPayment =
    (order: any) =>
      Boolean(
        order?.status?.toUpperCase() === 'PAID' ||
        order?.payment?.id ||
        String(order?.payment?.status || '')
          .toUpperCase()
          .includes('PAID')
      );

  const tables =
    Array.from(
      { length: totalTables },
      (_, i) => {

        const tableNum = i + 1;

        const activeRes =
          reservations.find(r =>
            Number(r.tableNumber) ===
              tableNum &&
            (
              r.status ===
                'CONFIRMED' ||
              r.status ===
                'SEATED'
            )
          );

        const activeOrder =
          activeOrders.find(
            o =>
              Number(o.tableNumber) ===
              tableNum
          );

        let status:
          | 'AVAILABLE'
          | 'RESERVED'
          | 'OCCUPIED'
          | 'DINING' =
          'AVAILABLE';

        if (
          activeOrder &&
          [
            'PAID',
            'PREPARING',
            'READY'
          ].includes(
            activeOrder.status
          )
        ) {
          status = 'DINING';
        }

        else if (
          activeOrder?.status ===
          'SERVED'
        ) {
          status = 'DINING';
        }

        else if (
          activeRes?.status ===
          'SEATED'
        ) {
          status = 'OCCUPIED';
        }

        else if (
          activeRes?.status ===
          'CONFIRMED'
        ) {
          status = 'RESERVED';
        }

        return {
          number: tableNum,
          status,
          reservation: activeRes,
          order: activeOrder
        };
      }
    );

  const stats = {

    available:
      tables.filter(
        t =>
          t.status ===
          'AVAILABLE'
      ).length,

    reserved:
      tables.filter(
        t =>
          t.status ===
          'RESERVED'
      ).length,

    occupied:
      tables.filter(
        t =>
          t.status ===
          'OCCUPIED'
      ).length,

    dining:
      tables.filter(
        t =>
          t.status ===
          'DINING'
      ).length
  };

  const getStatusBadgeStyles =
    (status: string) => {

      switch (status) {

        case 'PENDING':
          return 'bg-amber-500/10 text-amber-500 border-amber-500/20';

        case 'CONFIRMED':
          return 'bg-blue-500/10 text-blue-500 border-blue-500/20';

        case 'SEATED':
          return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

        case 'COMPLETED':
          return 'bg-white/5 text-white/40 border-white/10';

        default:
          return 'bg-white/5 text-white/20 border-white/5';
      }
    };

  const getTableStyles =
    (status: string) => {

      switch (status) {

        case 'DINING':
          return 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-glow scale-[1.02]';

        case 'OCCUPIED':
          return 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-[1.02]';

        case 'RESERVED':
          return 'bg-blue-500/20 border-blue-500/40 text-white';

        default:
          return 'bg-[#0B0B0B] border-white/5 hover:border-[var(--primary)]/30 text-white';
      }
    };

  if (loading) {

    return (
      <div className='flex h-[60vh] items-center justify-center'>

        <div className='animate-pulse flex flex-col items-center'>

          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4'></div>

          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Syncing Floor Plan
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

            <LayoutDashboard className='w-4 h-4 text-[var(--primary)]' />

            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Floor Management & Seating
            </p>
          </div>

          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Dining Room Flow
          </h1>

          <p className='mt-4 text-white/40 text-sm font-medium max-w-xl'>
            Live table occupancy, reservations and active orders for{' '}
            <span className='text-white font-bold'>
              {user?.branch?.name || 'Steakz'}
            </span>.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>

          <div className='w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center'>

            <Zap
              size={20}
              className='text-emerald-500 animate-pulse'
            />
          </div>

          <div>

            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>
              Floor Link
            </p>

            <p className='text-xs font-black text-white uppercase tracking-tighter'>
              Live Active Session
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>

        {[
          {
            label: 'Available',
            count: stats.available,
            color: 'text-white/40'
          },

          {
            label: 'Reserved',
            count: stats.reserved,
            color: 'text-blue-500'
          },

          {
            label: 'Occupied',
            count: stats.occupied,
            color: 'text-white'
          },

          {
            label: 'Dining',
            count: stats.dining,
            color: 'text-[var(--primary)]'
          }
        ].map((stat, idx) => (

          <div
            key={idx}
            className='card bg-[#0B0B0B] border-white/5 p-6 flex justify-between items-center group hover:border-white/20 transition-all'
          >

            <span className='text-[10px] uppercase tracking-[0.2em] font-black text-white/40'>
              {stat.label}
            </span>

            <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>
              {stat.count}
            </span>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>

        {/* RESERVATIONS */}
        <div className='lg:col-span-7 space-y-6'>

          <h2 className='text-2xl font-bold text-white flex items-center gap-3'>

            <Clock className='w-5 h-5 text-[var(--primary)]' />

            Manifest Queue
          </h2>

          <div className='space-y-4'>

            {reservations.filter(
              r =>
                r.status !==
                  'COMPLETED' &&
                r.status !==
                  'CANCELLED'
            ).length === 0 ? (

              <div className='card bg-[#0B0B0B] border-white/5 p-20 text-center border-dashed'>

                <Calendar className='w-10 h-10 text-white/10 mx-auto mb-6' />

                <p className='text-[10px] uppercase font-black text-white/20 tracking-[0.3em]'>
                  Queue Neutral — No Pending Seating
                </p>
              </div>

            ) : (

              reservations
                .filter(
                  r =>
                    r.status !==
                      'COMPLETED' &&
                    r.status !==
                      'CANCELLED'
                )
                .map(res => (

                  <div
                    key={res.id}
                    className='group card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden hover:border-[var(--primary)]/20 transition-all duration-500'
                  >

                    <div className='flex flex-col md:flex-row'>

                      <div
                        className={`w-1.5 shrink-0 ${
                          res.status === 'PENDING'
                            ? 'bg-amber-500'
                            : res.status === 'CONFIRMED'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                      ></div>

                      <div className='flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8'>

                        <div className='space-y-4 flex-1'>

                          <div className='flex items-center gap-4'>

                            <span
                              className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${getStatusBadgeStyles(res.status)}`}
                            >
                              {res.status}
                            </span>

                            <div className='flex items-center gap-2 text-white/20'>

                              <Clock className='w-3 h-3' />

                              <span className='text-[10px] font-black uppercase tracking-widest'>
                                {new Date(
                                  res.reservationTime
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>

                            {res.tableNumber && (

                              <div className='flex items-center gap-1 text-white/20'>

                                <Hash className='w-3 h-3' />

                                <span className='text-[10px] font-black uppercase tracking-widest'>
                                  Table {res.tableNumber}
                                </span>
                              </div>
                            )}
                          </div>

                          <div>

                            <h3 className='text-2xl font-bold text-white group-hover:text-[var(--primary)] transition-colors'>
                              {res.customerName}
                            </h3>

                            <div className='flex items-center gap-4 mt-1.5 text-white/30 text-[10px] font-black uppercase tracking-widest'>

                              <span className='flex items-center gap-1.5'>

                                <Users
                                  size={10}
                                  className='text-[var(--primary)]'
                                />

                                {res.guests} Guests
                              </span>

                              {res.specialRequests && (

                                <>

                                  <span className='w-1 h-1 rounded-full bg-white/5'></span>

                                  <span className='italic text-white/20 normal-case'>
                                    {res.specialRequests}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className='flex flex-wrap md:flex-col gap-2 min-w-[160px]'>

                          {/* BRANCH MANAGER */}
                          {user?.role === 'BRANCH_MANAGER' &&
                            res.status === 'PENDING' && (

                            <>

                              <button
                                onClick={() =>
                                  updateReservationStatus(
                                    res.id,
                                    'CONFIRMED'
                                  )
                                }
                                className='w-full py-3 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2'
                              >

                                <Check className='w-3 h-3' />

                                Authorize
                              </button>

                              <button
                                onClick={() =>
                                  updateReservationStatus(
                                    res.id,
                                    'CANCELLED'
                                  )
                                }
                                className='w-full py-3 rounded-xl bg-white/5 border border-white/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2'
                              >

                                <XCircle className='w-3 h-3' />

                                Nullify
                              </button>
                            </>
                          )}

                          {/* WAITER */}
                          {user?.role === 'WAITER' &&
                            res.status === 'CONFIRMED' && (

                            <button
                              onClick={() => {
                                setSeatingReservationId(res.id);
                                setSelectedTable(null);
                              }}
                              className='w-full py-4 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2'
                            >

                              <UserCheck className='w-4 h-4' />

                              Seat Guests
                            </button>
                          )}

                         {/* WAITER */}
{user?.role === 'WAITER' &&
  res.status === 'SEATED' && (

  <div className='flex flex-col gap-2 w-full'>

    {/* CREATE ORDER */}
    {!activeOrders.find(
      o =>
        Number(o.tableNumber) ===
        Number(res.tableNumber)
    ) && (

      <button
        onClick={() =>
          window.location.href =
            `/dashboard/orders?table=${res.tableNumber}`
        }
        className='w-full py-4 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2'
      >

        <Coffee className='w-4 h-4' />

        Create Order
      </button>
    )}

    {/* ORDER EXISTS */}
    {activeOrders.find(
      o =>
        Number(o.tableNumber) ===
        Number(res.tableNumber)
    ) && (

      <button
        onClick={() =>
          window.location.href =
            `/dashboard/orders?table=${res.tableNumber}`
        }
        className='w-full py-4 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2'
      >

        <Coffee className='w-4 h-4' />

        Manage Order
      </button>
    )}

{/* COMPLETE DINING */}
{activeOrders.find(
  o =>
    Number(o.tableNumber) === Number(res.tableNumber) &&
    String(o.status).toUpperCase() === 'SERVED'
) && (

  <button
    onClick={async () => {
      const order = activeOrders.find(
        o =>
          Number(o.tableNumber) === Number(res.tableNumber) &&
          String(o.status).toUpperCase() === 'SERVED'
      );
      if (order) {
        try {
          await api.patch(`/orders/${order.id}/status`, { status: 'COMPLETED' });
        } catch (err) {
          console.error('Failed to complete order during dining completion:', err);
        }
      }
      updateReservationStatus(
        res.id,
        'COMPLETED'
      )
    }}
    className='w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2'
  >

    <CheckCircle2 className='w-4 h-4' />

    Complete Dining

  </button>
)}
  </div>
)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* TABLE SELECTION MODAL */}
        {seatingReservationId && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='card bg-[#0B0B0B] border border-[var(--primary)]/30 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto'>
              <h2 className='text-3xl font-bold text-white mb-6'>
                Select Available Table
              </h2>
              <p className='text-white/40 text-sm mb-6'>
                Click on an available table to seat the guests
              </p>
              <div className='grid grid-cols-5 gap-4 mb-8'>
                {tables
                  .filter(t => t.status === 'AVAILABLE')
                  .map(table => (
                    <button
                      key={table.number}
                      onClick={() =>
                        setSelectedTable(table.number)
                      }
                      className={`aspect-square rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all border-2 ${
                        selectedTable === table.number
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-lg scale-105'
                          : 'bg-white/5 border-white/10 hover:border-[var(--primary)]/50 text-white'
                      }`}
                    >
                      <Armchair className='w-6 h-6 mb-2' />
                      <p className='text-sm font-black'>
                        {table.number}
                      </p>
                    </button>
                  ))}
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => {
                    setSeatingReservationId(null);
                    setSelectedTable(null);
                  }}
                  className='flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all'
                >
                  Cancel
                </button>
                <button
                  disabled={selectedTable === null}
                  onClick={() => {
                    if (selectedTable !== null) {
                      updateReservationStatus(
                        seatingReservationId,
                        'SEATED',
                        selectedTable
                      );
                    }
                  }}
                  className='flex-1 py-3 rounded-xl bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Confirm Seating
                </button>
              </div>
            </div>
          </div>
        )}
        <div className='lg:col-span-5 space-y-6'>

          <h2 className='text-2xl font-bold text-white flex items-center gap-3'>

            <Armchair className='w-5 h-5 text-[var(--primary)]' />

            Station Matrix
          </h2>

          <div className='grid grid-cols-4 gap-3'>

            {tables.map(table => (

              <div
                key={table.number}
                className={`aspect-square rounded-2xl p-3 flex flex-col items-center justify-center text-center transition-all duration-500 border-2 ${getTableStyles(table.status)}`}
              >

                <p
                  className={`text-[7px] font-black uppercase tracking-[0.15em] mb-1 ${
                    table.status === 'AVAILABLE'
                      ? 'text-white/20'
                      : 'opacity-60'
                  }`}
                >

                  {table.status === 'DINING'
                    ? 'Dining'
                    : table.status === 'OCCUPIED'
                    ? 'Seated'
                    : table.status === 'RESERVED'
                    ? 'Reserved'
                    : 'Free'}
                </p>

                <div className='relative mb-1'>

                  {table.status === 'DINING' ? (

                    <Coffee className='w-6 h-6' />

                  ) : (

                    <Armchair
                      className={`w-6 h-6 ${
                        table.status === 'AVAILABLE'
                          ? 'text-white/10'
                          : ''
                      }`}
                    />
                  )}

                  {table.status !==
                    'AVAILABLE' && (

                    <div className='absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full flex items-center justify-center'>

                      <div
                        className={`w-1 h-1 rounded-full ${
                          table.status === 'DINING'
                            ? 'bg-[var(--primary)]'
                            : table.status ===
                              'OCCUPIED'
                            ? 'bg-emerald-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                    </div>
                  )}
                </div>

                <p className='text-base font-black tracking-tighter'>
                  {table.number}
                </p>

                {table.reservation && (

                  <p className='text-[7px] font-bold mt-0.5 opacity-50 truncate max-w-full uppercase tracking-widest'>
                    {
                      table.reservation.customerName.split(
                        ' '
                      )[0]
                    }
                  </p>
                )}

                {table.order &&
                  !table.reservation && (

                  <p className='text-[7px] font-bold mt-0.5 opacity-50 uppercase tracking-widest'>
                    {
                      table.order.items
                        ?.length
                    } items
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* LEGEND */}
          <div className='card bg-[#0B0B0B] border-white/5 p-6 space-y-4'>

            <p className='text-[10px] font-black uppercase tracking-[0.3em] text-white/10'>
              Reference Legend
            </p>

            <div className='flex flex-wrap gap-6'>

              {[
                {
                  color:
                    'bg-white/10 border border-white/5',
                  label:
                    'Available'
                },

                {
                  color:
                    'bg-blue-500',
                  label:
                    'Reserved'
                },

                {
                  color:
                    'bg-white',
                  label:
                    'Seated'
                },

                {
                  color:
                    'bg-[var(--primary)]',
                  label:
                    'Dining'
                }
              ].map(
                ({
                  color,
                  label
                }) => (

                  <div
                    key={label}
                    className='flex items-center gap-3'
                  >

                    <div
                      className={`w-2.5 h-2.5 rounded-full ${color}`}
                    ></div>

                    <span className='text-[9px] font-black text-white/30 uppercase tracking-widest'>
                      {label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablesPage;