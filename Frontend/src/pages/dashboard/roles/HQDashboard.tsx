import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, MapPin, DollarSign, Users, Activity,
  Globe, AlertTriangle, ShoppingBag, Calendar,
  CheckCircle, Clock3, XCircle, UserCheck
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-[#0B0B0B] border border-white/10 p-4 rounded-xl shadow-2xl'>
        <p className='text-[10px] uppercase tracking-[0.2em] font-black text-[var(--primary)] mb-1'>{label}</p>
        <p className='text-xl font-black text-white'>£{Number(payload[0].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const STATUS_DOT: Record<string, string> = {
  PENDING_PAYMENT: 'bg-white/20',
  PAID:            'bg-amber-500',
  PREPARING:       'bg-blue-500',
  READY:           'bg-emerald-500',
  SERVED:          'bg-white',
  COMPLETED:       'bg-white/30',
  CANCELLED:       'bg-red-500',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting Payment',
  PAID:            'Paid',
  PREPARING:       'Preparing',
  READY:           'Ready to Serve',
  SERVED:          'Served',
  COMPLETED:       'Completed',
  CANCELLED:       'Cancelled',
};

const RESERVATION_STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  PENDING:   { color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: Clock3 },
  CONFIRMED: { color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: CheckCircle },
  SEATED:    { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: UserCheck },
  COMPLETED: { color: 'text-white/40',    bg: 'bg-white/5',        border: 'border-white/10',       icon: CheckCircle },
  CANCELLED: { color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     icon: XCircle },
  NO_SHOW:   { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     icon: XCircle },
};

const HQDashboard = () => {
  const [data, setData]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => { fetchHQData(); }, [branchId]);

  const fetchHQData = async () => {
    try {
      const res = await api.get(`/analytics?branchId=${branchId}`);
      setData(res.data);
      setBranches(res.data.branches || []);
    } catch (error) {
      console.error('HQ Dashboard fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className='animate-pulse flex flex-col items-center'>
          <div className='h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4' />
          <p className='text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black'>Syncing Global Intelligence</p>
        </div>
      </div>
    );
  }

  const recentActivity: any[]  = data?.charts?.recentActivity  || [];
  const reservationData: any[] = data?.charts?.reservations     || [];

  // Total reservation count across all statuses
  const totalReservations = reservationData.reduce((sum: number, r: any) => sum + (r.count || 0), 0);

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <Globe className='w-4 h-4 text-[var(--primary)]' />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>Executive Oversight</p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>Enterprise Intelligence</h1>
          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            A strategic unified view of the Steakz global network.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-1 rounded-2xl flex items-center shadow-2xl'>
          <select
            value={branchId}
            onChange={e => setBranchId(e.target.value)}
            className='bg-transparent text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white/5 rounded-xl transition-all appearance-none min-w-[200px]'
          >
            <option value='all'>Global Network</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Total Revenue',    value: `£${Number(data?.summary?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, trend: 'LIVE' },
          { label: 'Network Size',     value: data?.summary?.totalBranches || 0,                               icon: MapPin,      trend: 'ACTIVE' },
          { label: 'Active Personnel', value: data?.summary?.activeStaff || 0,                                 icon: Users,       trend: 'LIVE' },
          { label: 'Total Orders',     value: data?.summary?.totalOrders || 0,                                 icon: TrendingUp,  trend: 'REALTIME' },
        ].map((kpi, i) => (
          <div key={i} className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-[var(--primary)]/30 transition-all'>
            <div className='flex justify-between items-start mb-8'>
              <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors duration-500'>
                <kpi.icon size={20} className='text-[var(--primary)] group-hover:text-black transition-colors' />
              </div>
              <span className='text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500'>{kpi.trend}</span>
            </div>
            <p className='text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-1'>{kpi.label}</p>
            <p className='text-4xl font-black text-white tracking-tighter'>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* LOW STOCK ALERT */}
      <div className='card bg-[#0B0B0B] border border-red-500/10 rounded-3xl p-8 flex items-center justify-between'>
        <div className='flex items-center gap-5'>
          <div className='w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center'>
            <AlertTriangle className='w-6 h-6 text-red-500' />
          </div>
          <div>
            <p className='text-[10px] uppercase tracking-[0.3em] text-red-500 font-black mb-2'>Global Inventory Alert</p>
            <h3 className='text-2xl font-bold text-white'>
              {data?.summary?.lowStockItems || 0} Low Stock Items Detected
            </h3>
          </div>
        </div>
        <div className='hidden lg:block text-right'>
          <p className='text-sm text-white/30'>Real-time inventory monitoring active</p>
        </div>
      </div>

      {/* CHART + LIVE FEED */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>

        {/* REVENUE CHART */}
        <div className='lg:col-span-8 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-12'>
            <h3 className='text-2xl font-bold text-white'>Branch Revenue Distribution</h3>
            <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2'>Real-time branch performance</p>
          </div>
          <div className='h-96'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data?.charts?.branchComparison || []}>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />
                <XAxis dataKey='branch' axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey='revenue' radius={[4, 4, 0, 0]}>
                  {(data?.charts?.branchComparison || []).map((_: any, index: number) => (
                    <Cell key={index} fill={index === 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIVE ACTIVITY FEED */}
        <div className='lg:col-span-4 card bg-[#0B0B0B] border-white/5 p-10 flex flex-col'>
          <div className='flex items-center gap-3 mb-4'>
            <Activity className='w-5 h-5 text-[var(--primary)]' />
            <h3 className='text-2xl font-bold text-white'>Live Activity Feed</h3>
          </div>
          <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-8'>
            {recentActivity.length} recent orders
          </p>

          <div className='flex-1 space-y-4 overflow-y-auto pr-1 max-h-[400px]'>
            {recentActivity.length === 0 ? (
              <div className='flex flex-col items-center justify-center text-center py-20'>
                <ShoppingBag size={32} className='text-white/10 mb-4' />
                <p className='text-white/20 text-sm uppercase tracking-[0.2em] font-black'>No recent orders</p>
              </div>
            ) : (
              recentActivity.map((activity: any, i: number) => (
                <div key={i} className='group flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/20 transition-all'>
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${STATUS_DOT[activity.status] || 'bg-white/20'}`} />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-white group-hover:text-[var(--primary)] transition-colors leading-snug'>
                      {activity.message}
                    </p>
                    <div className='flex items-center gap-3 mt-1.5'>
                      <span className='text-[9px] font-black uppercase tracking-widest text-white/30'>
                        {STATUS_LABEL[activity.status] || activity.status}
                      </span>
                      <span className='text-white/10'>·</span>
                      <span className='text-[9px] text-white/20 font-black'>
                        {new Date(activity.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className='mt-8 w-full py-4 bg-white/5 border border-white/5 rounded-xl text-[10px] uppercase tracking-[0.3em] font-black text-white/50 hover:bg-white/10 hover:text-white transition-all'>
            Export Intelligence Report
          </button>
        </div>
      </div>

      {/* ── RESERVATIONS OVERVIEW ─────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>

        {/* Reservation status breakdown */}
        <div className='lg:col-span-7 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='flex items-center justify-between mb-10'>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <Calendar className='w-5 h-5 text-[var(--primary)]' />
                <h3 className='text-2xl font-bold text-white'>Reservation Overview</h3>
              </div>
              <p className='text-[10px] uppercase tracking-[0.2em] text-white/20 font-black'>
                Global booking status distribution
              </p>
            </div>
            <div className='px-4 py-2 rounded-xl bg-white/5 border border-white/5'>
              <p className='text-[10px] font-black text-white/40 uppercase tracking-widest'>{totalReservations} Total</p>
            </div>
          </div>

          {reservationData.length === 0 ? (
            <div className='py-16 text-center'>
              <Calendar size={32} className='text-white/10 mx-auto mb-4' />
              <p className='text-white/20 text-sm uppercase tracking-[0.2em] font-black'>No reservation data</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reservationData.map((r: any, i: number) => {
                const cfg = RESERVATION_STATUS_CONFIG[r.status] || RESERVATION_STATUS_CONFIG['PENDING'];
                const Icon = cfg.icon;
                const pct = totalReservations > 0 ? Math.round((r.count / totalReservations) * 100) : 0;
                return (
                  <div key={i} className='flex items-center gap-6'>
                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border min-w-[140px] ${cfg.bg} ${cfg.border}`}>
                      <Icon size={12} className={cfg.color} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.color}`}>{r.status}</span>
                    </div>

                    {/* Progress bar */}
                    <div className='flex-1 h-2 bg-white/5 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          r.status === 'PENDING'   ? 'bg-amber-500' :
                          r.status === 'CONFIRMED' ? 'bg-blue-500' :
                          r.status === 'SEATED'    ? 'bg-emerald-500' :
                          r.status === 'CANCELLED' || r.status === 'NO_SHOW' ? 'bg-red-500' :
                          'bg-white/20'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Count + pct */}
                    <div className='text-right min-w-[60px]'>
                      <p className='text-lg font-black text-white'>{r.count}</p>
                      <p className='text-[9px] text-white/20 font-black'>{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reservation summary stats */}
        <div className='lg:col-span-5 space-y-6'>
          <div className='card bg-[#0B0B0B] border-white/5 p-8'>
            <div className='flex items-center gap-3 mb-8'>
              <Calendar className='w-5 h-5 text-[var(--primary)]' />
              <h3 className='text-xl font-bold text-white'>Booking Pulse</h3>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              {[
                {
                  label: 'Pending',
                  value: reservationData.find((r: any) => r.status === 'PENDING')?.count || 0,
                  color: 'text-amber-500'
                },
                {
                  label: 'Confirmed',
                  value: reservationData.find((r: any) => r.status === 'CONFIRMED')?.count || 0,
                  color: 'text-blue-500'
                },
                {
                  label: 'Seated',
                  value: reservationData.find((r: any) => r.status === 'SEATED')?.count || 0,
                  color: 'text-emerald-500'
                },
                {
                  label: 'Cancelled',
                  value: (
                    (reservationData.find((r: any) => r.status === 'CANCELLED')?.count || 0) +
                    (reservationData.find((r: any) => r.status === 'NO_SHOW')?.count || 0)
                  ),
                  color: 'text-red-500'
                },
              ].map((stat, i) => (
                <div key={i} className='p-5 rounded-2xl bg-white/5 border border-white/5'>
                  <p className='text-[10px] uppercase tracking-widest font-black text-white/20 mb-2'>{stat.label}</p>
                  <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion rate card */}
          <div className='card bg-[#0B0B0B] border-white/5 p-8'>
            <p className='text-[10px] uppercase tracking-[0.3em] font-black text-white/20 mb-3'>Seating Conversion</p>
            <p className='text-4xl font-black text-white tracking-tighter mb-2'>
              {totalReservations > 0
                ? Math.round(
                    ((reservationData.find((r: any) => r.status === 'SEATED')?.count || 0) +
                     (reservationData.find((r: any) => r.status === 'COMPLETED')?.count || 0)) /
                    totalReservations * 100
                  )
                : 0}%
            </p>
            <p className='text-[10px] text-white/20 font-black uppercase tracking-widest'>
              Of reservations result in guests being seated
            </p>
            <div className='mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden'>
              <div
                className='h-full bg-[var(--primary)] rounded-full transition-all duration-700'
                style={{
                  width: totalReservations > 0
                    ? `${Math.round(
                        ((reservationData.find((r: any) => r.status === 'SEATED')?.count || 0) +
                         (reservationData.find((r: any) => r.status === 'COMPLETED')?.count || 0)) /
                        totalReservations * 100
                      )}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HQDashboard;