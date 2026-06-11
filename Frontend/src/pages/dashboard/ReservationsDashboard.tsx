import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../api/axios';
import { socket } from '../../socket';
import { useAuth } from '../../context/AuthContext';

import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  CalendarCheck,
  Activity,
  Award
} from 'lucide-react';

const ReservationsDashboard = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [reservations, setReservations] =
    useState<any[]>([]);

  const [orders, setOrders] =
    useState<any[]>([]);

  const [filter, setFilter] =
    useState('ALL');

  const [loading, setLoading] =
    useState(true);

  const [tableAssignments, setTableAssignments] =
    useState<any>({});

  const fetchReservations =
    async () => {

      try {

        const res =
          await api.get('/reservations');

        setReservations(
          res.data.data?.reservations ||
          res.data.reservations ||
          res.data ||
          []
        );

      } catch (error) {

        console.error(
          'Failed to fetch reservations:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

  const fetchOrders =
    async () => {

      try {

        const res =
          await api.get('/orders');

        setOrders(
          res.data.orders ||
          res.data.data ||
          res.data ||
          []
        );

      } catch (error) {

        console.error(
          'Failed to fetch orders:',
          error
        );
      }
    };

  useEffect(() => {

    fetchReservations();
    fetchOrders();

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

    return () => {

      socket.off(
        'reservation:created'
      );

      socket.off(
        'reservation:updated'
      );

      socket.off(
        'reservation:deleted'
      );

      socket.off(
        'order:created'
      );

      socket.off(
        'order:updated'
      );
    };

  }, []);

  const updateStatus =
    async (
      id: number,
      status: string,
      tableNumber?: number
    ) => {

      try {

        await api.patch(
          `/reservations/${id}/status`,
          {
            status,
            tableNumber
          }
        );

        fetchReservations();

      } catch (error) {

        console.error(
          'Failed to update reservation:',
          error
        );
      }
    };

  const occupiedTableNumbers = new Set<number>([
    ...reservations
      .filter(
        (r) =>
          ['CONFIRMED', 'SEATED'].includes(
            String(r.status).toUpperCase()
          ) && r.tableNumber
      )
      .map((r) => r.tableNumber),
    ...orders
      .filter(
        (o: any) =>
          [
            'PENDING_PAYMENT',
            'PAID',
            'PREPARING',
            'READY',
            'SERVED'
          ].includes(String(o.status).toUpperCase()) &&
          o.tableNumber
      )
      .map((o: any) => o.tableNumber)
  ]);

  const availableTableNumbers = Array.from(
    { length: 20 },
    (_, i) => i + 1
  ).filter((tableNumber) => !occupiedTableNumbers.has(tableNumber));

  const hasConfirmedPayment =
    (res: any) =>
      orders.some(
        (o: any) =>
          o.tableNumber === res.tableNumber &&
          String(o.status).toUpperCase() === 'PAID'
      );

  const filteredReservations =
    filter === 'ALL'
      ? reservations
      : reservations.filter(
          (r) =>
            r.status === filter
        );

  const stats = [
    {
      label: 'Pending',
      value:
        reservations.filter(
          r => r.status === 'PENDING'
        ).length,
      icon: Clock,
      color: 'text-amber-500'
    },

    {
      label: 'Confirmed',
      value:
        reservations.filter(
          r => r.status === 'CONFIRMED'
        ).length,
      icon: CheckCircle,
      color: 'text-blue-500'
    },

    {
      label: 'Seated',
      value:
        reservations.filter(
          r => r.status === 'SEATED'
        ).length,
      icon: Users,
      color: 'text-emerald-500'
    },

    {
      label: 'Cancelled',
      value:
        reservations.filter(
          r => r.status === 'CANCELLED'
        ).length,
      icon: XCircle,
      color: 'text-red-500'
    }
  ];

  if (loading) {

    return (
      <div className='flex h-[60vh] items-center justify-center'>

        <div className='animate-pulse flex flex-col items-center'>

          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4'></div>

          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>
            Scanning Guest Ledger
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

            <CalendarCheck className='w-4 h-4 text-[var(--primary)]' />

            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Guest Logistics & Manifest
            </p>
          </div>

          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Live Reservations
          </h1>

          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Coordinate guest arrivals, seating assignments,
            and dining flow across the branch in real-time.
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
              Booking Feed
            </p>

            <p className='text-xs font-black text-white uppercase tracking-tighter'>
              Live Synchronization
            </p>
          </div>
        </div>
      </div>

      {/* KPI ROW */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>

        {stats.map(
          (
            stat,
            idx
          ) => (

            <div
              key={idx}
              className='card bg-[#0B0B0B] border-white/5 p-6 flex justify-between items-center group hover:border-white/20 transition-all'
            >

              <span className='text-[10px] uppercase tracking-[0.2em] font-black text-white/40'>
                {stat.label}
              </span>

              <div className='flex items-center gap-4'>

                <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>
                  {stat.value}
                </span>

                <stat.icon
                  size={16}
                  className={`${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* FILTERS */}
      <div className='flex flex-wrap gap-2 p-1.5 bg-[#0B0B0B] border border-white/5 rounded-2xl w-fit'>

        {[
          'ALL',
          'PENDING',
          'CONFIRMED',
          'SEATED',
          'COMPLETED',
          'CANCELLED'
        ].map((status) => (

          <button
            key={status}
            onClick={() =>
              setFilter(status)
            }
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              filter === status
                ? 'bg-[var(--primary)] text-black shadow-glow'
                : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* RESERVATIONS */}
      <div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>

        {filteredReservations.map(
          (res) => {

            const hasActiveOrder =
              orders.some(
                (o: any) =>
                  o.tableNumber ===
                    res.tableNumber &&
                  o.status !== 'COMPLETED'
              );

            return (

              <div
                key={res.id}
                className='group card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden hover:border-[var(--primary)]/30 hover:shadow-2xl transition-all duration-700 relative'
              >

                <div
                  className={`h-1.5 w-full ${
                    res.status === 'PENDING'
                      ? 'bg-amber-500'
                      : res.status === 'CONFIRMED'
                      ? 'bg-blue-500'
                      : res.status === 'SEATED'
                      ? 'bg-emerald-500'
                      : res.status === 'CANCELLED'
                      ? 'bg-red-500'
                      : 'bg-white/10'
                  }`}
                ></div>

                <div className='p-8 space-y-8'>

                  {/* HEADER */}
                  <div className='flex justify-between items-start gap-4'>

                    <div className='min-w-0'>

                      <div className='flex items-center gap-2 mb-2'>

                        {res.customerId && (

                          <div className='flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[7px] font-black text-[var(--primary)] uppercase tracking-widest'>

                            <Award size={8} />

                            <span>
                              Inner Circle
                            </span>
                          </div>
                        )}

                        <span className='px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[7px] font-black text-white/20 uppercase tracking-widest'>
                          ID: {res.id}
                        </span>
                      </div>

                      <h2 className='text-2xl font-black text-white group-hover:text-[var(--primary)] transition-colors truncate tracking-tighter uppercase'>
                        {res.customerName}
                      </h2>

                      {/* DETAILS */}
                      <div className='mt-4 space-y-3'>

                        <div className='flex items-center justify-between'>

                          <span className='text-[9px] uppercase tracking-widest text-white/30 font-black'>
                            Guests
                          </span>

                          <span className='text-sm font-black text-white'>
                            {res.guests}
                          </span>
                        </div>

                        <div className='flex items-center justify-between'>

                          <span className='text-[9px] uppercase tracking-widest text-white/30 font-black'>
                            Table
                          </span>

                          <span className='text-sm font-black text-[var(--primary)]'>
                            {res.tableNumber || 'Unassigned'}
                          </span>
                        </div>

                        <div className='flex items-center justify-between'>

                          <span className='text-[9px] uppercase tracking-widest text-white/30 font-black'>
                            Reservation Time
                          </span>

                          <span className='text-sm font-black text-white'>
                            {new Date(
                              res.reservationTime
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {res.specialRequests && (

                          <div className='pt-2 border-t border-white/5'>

                            <p className='text-[9px] uppercase tracking-widest text-white/30 font-black mb-2'>
                              Special Request
                            </p>

                            <p className='text-sm text-white/70 italic'>
                              "{res.specialRequests}"
                            </p>
                          </div>
                        )}

                      </div>

                    </div>

                    <span
                      className={`shrink-0 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border ${
                        res.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : res.status === 'CONFIRMED'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : res.status === 'SEATED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-white/5 text-white/40 border-white/10'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className='flex flex-col gap-3'>

                    {/* BRANCH MANAGER CONFIRM */}
                    {user?.role === 'BRANCH_MANAGER' &&
                      String(res.status).toUpperCase() ===
                      'PENDING' && (

                      <button
                        onClick={() =>
                          updateStatus(
                            res.id,
                            'CONFIRMED'
                          )
                        }
                        className='flex-1 py-4 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-glow'
                      >
                        Confirm Reservation
                      </button>
                    )}

                    {/* WAITER SEATING */}
                    {user?.role === 'WAITER' &&
                      String(res.status).toUpperCase() ===
                      'CONFIRMED' && (

                      <>

                        <select
                          value={tableAssignments[res.id] || ''}
                          onChange={(e) =>
                            setTableAssignments({
                              ...tableAssignments,
                              [res.id]: e.target.value
                            })
                          }
                          className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 outline-none focus:border-[var(--primary)]'
                        >
                          <option value='' disabled>
                            {availableTableNumbers.length
                              ? 'Select available table'
                              : 'No tables available'}
                          </option>
                          {availableTableNumbers.map((tableNumber) => (
                            <option key={tableNumber} value={tableNumber}>
                              Table {tableNumber}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            updateStatus(
                              res.id,
                              'SEATED',
                              Number(
                                tableAssignments[res.id]
                              )
                            )
                          }
                          className='flex-1 py-4 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                        >
                          Seat Guests
                        </button>

                      </>
                    )}

                    {/* START ORDER */}
                    {user?.role === 'WAITER' &&
                      String(res.status).toUpperCase() ===
                      'SEATED' &&
                      res.tableNumber &&
                      !hasActiveOrder && (

                      <button
                        onClick={() =>
  navigate(
    `/dashboard/orders/create?table=${res.tableNumber}`
  )
}
                        className='w-full py-4 rounded-xl bg-[var(--primary)] text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-glow'
                      >
                        Start Order
                      </button>
                    )}

                    {/* ACTIVE ORDER */}
                    {user?.role === 'WAITER' &&
                      String(res.status).toUpperCase() ===
                      'SEATED' &&
                      hasActiveOrder && (

                      <div className='w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center text-[10px] font-black uppercase tracking-widest'>
                        Active Order In Progress
                      </div>
                    )}

                    {/* COMPLETE DINING */}
                    {user?.role === 'WAITER' &&
                      String(res.status).toUpperCase() ===
                      'SEATED' &&
                      hasActiveOrder &&
                      hasConfirmedPayment(res) && (

                      <button
                        onClick={() =>
                          updateStatus(
                            res.id,
                            'COMPLETED'
                          )
                        }
                        className='w-full py-4 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all'
                      >
                        Complete Dining
                      </button>
                    )}

                  </div>

                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default ReservationsDashboard;