import { useEffect, useState } from 'react';
import api from '../../../api/axios';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import {
  ShieldCheck,
  Activity,
  Database,
  Network,
  Cpu,
  Zap,
  AlertCircle,
  Server,
  Lock,
  Terminal,
  Globe,
  Users
} from 'lucide-react';

const CustomTooltip = ({
  active,
  payload,
  label
}: any) => {

  if (
    active &&
    payload &&
    payload.length
  ) {

    return (
      <div className='bg-[#0B0B0B] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl'>

        <p className='text-[10px] uppercase tracking-[0.2em] font-black text-[var(--primary)] mb-1'>
          {label}
        </p>

        <p className='text-xl font-black text-white'>
          {Number(
            payload[0].value
          ).toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

const AdminDashboard = () => {

  const [data, setData] =
    useState<any>(null);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        const res =
          await api.get(
            '/dashboard'
          );

        setData(
          res.data
        );

      } catch (error) {

        console.error(
          error
        );
      }
    };

  if (!data) {

    return (
      <div className='flex h-[60vh] items-center justify-center'>

        <div className='animate-pulse flex flex-col items-center'>

          <div className='h-12 w-12 rounded-full border-2 border-red-500 border-t-transparent animate-spin mb-4'></div>

          <p className='text-[10px] uppercase tracking-[0.5em] text-red-500 font-black'>
            Decrypting Infrastructure
          </p>
        </div>
      </div>
    );
  }

  const securityData = [

    {
      name: 'Healthy',
      value:
        data.summary.activeStaff
    },

    {
      name: 'Low Stock',
      value:
        data.summary.lowStockItems
    }
  ];

  const SECURITY_COLORS = [
    '#C5A059',
    'rgba(255,255,255,0.05)'
  ];

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>

      {/* HEADER */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>

        <div>

          <div className='flex items-center gap-2 mb-4'>

            <ShieldCheck className='w-4 h-4 text-red-500' />

            <p className='text-[10px] uppercase tracking-[0.4em] text-red-500 font-black'>
              System Architecture & Security
            </p>
          </div>

          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Admin Command Center
          </h1>

          <p className='text-white/40 text-sm mt-4 font-medium max-w-xl'>
            Real-time infrastructure monitoring, security audit feeds,
            and enterprise-wide operational intelligence.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-red-500/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl'>

          <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>

          <div>

            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest'>
              Core Engine Status
            </p>

            <p className='text-xs font-black text-emerald-500 uppercase tracking-tighter'>
              Fully Operational
            </p>
          </div>
        </div>
      </div>

      {/* SYSTEM HEALTH */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>

        {[
          {
            label: 'Database',
            value: 'Operational',
            icon: Database
          },

          {
            label: 'Socket Gateway',
            value: 'Connected',
            icon: Zap
          },

          {
            label: 'API Identity',
            value: 'Secure',
            icon: Cpu
          },

          {
            label: 'Security Layer',
            value: 'Protected',
            icon: Lock
          }
        ].map((item) => (

          <div
            key={item.label}
            className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-red-500/30 transition-all'
          >

            <div className='flex justify-between items-start mb-6'>

              <div className='w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-colors'>

                <item.icon
                  size={20}
                  className='text-red-500 group-hover:scale-110 transition-transform'
                />
              </div>

              <Activity
                size={14}
                className='text-white/10'
              />
            </div>

            <p className='text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-1'>
              {item.label}
            </p>

            <p className='text-2xl font-black text-emerald-500 uppercase tracking-tighter'>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* METRICS */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4'>

        {[
          {
            label: 'Staff',
            value:
              data.summary.activeStaff,
            icon: Users
          },

          {
            label: 'Branches',
            value:
              data.summary.totalBranches,
            icon: Network
          },

          {
            label: 'Orders',
            value:
              data.summary.totalOrders,
            icon: Zap
          },

          {
            label: 'Revenue',
            value:
              `£${Number(
                data.summary.totalRevenue
              ).toLocaleString()}`,
            icon: Server
          },

          {
            label: 'Low Stock',
            value:
              data.summary.lowStockItems,
            icon: AlertCircle,
            alert: true
          },

          {
            label: 'Security',
            value: 'Stable',
            icon: Globe
          }
        ].map((item) => (

          <div
            key={item.label}
            className={`card bg-[#0B0B0B] border-white/5 p-6 hover:bg-[#121212] transition-colors ${
              item.alert
                ? 'border-amber-500/20'
                : ''
            }`}
          >

            <p className='text-[9px] uppercase tracking-widest text-white/30 font-black mb-4'>
              {item.label}
            </p>

            <p className={`text-4xl font-black tracking-tighter ${
              item.alert
                ? 'text-amber-500'
                : 'text-white'
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>

        {/* REVENUE TREND */}
        <div className='lg:col-span-7 card bg-[#0B0B0B] border-white/5 p-10 relative overflow-hidden'>

          <div className='absolute top-0 right-0 p-8'>

            <Terminal
              size={40}
              className='text-white/[0.02]'
            />
          </div>

          <div className='mb-12'>

            <h2 className='text-2xl font-bold text-white tracking-tight'>
              Branch Revenue Intelligence
            </h2>

            <p className='text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2'>
              Real-time operational throughput
            </p>
          </div>

          <div className='h-[350px]'>

            <ResponsiveContainer width='100%' height='100%'>

              <LineChart
                data={
                  data.charts.branchComparison
                }
              >

                <CartesianGrid
                  strokeDasharray='0'
                  vertical={false}
                  stroke='rgba(255,255,255,0.03)'
                />

                <XAxis
                  dataKey='branch'
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      'rgba(255,255,255,0.3)',

                    fontSize: 10,

                    fontWeight: 900
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      'rgba(255,255,255,0.3)',

                    fontSize: 10,

                    fontWeight: 900
                  }}
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#C5A059'
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#C5A059',
                    strokeWidth: 0
                  }}
                  activeDot={{
                    r: 6,
                    fill: '#C5A059',
                    stroke: '#0B0B0B',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE */}
        <div className='lg:col-span-5 card bg-[#0B0B0B] border-white/5 p-10'>

          <div className='mb-12 text-center'>

            <h2 className='text-2xl font-bold text-white tracking-tight'>
              Infrastructure Health
            </h2>

            <p className='text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2'>
              Operational ecosystem distribution
            </p>
          </div>

          <div className='h-[350px]'>

            <ResponsiveContainer width='100%' height='100%'>

              <PieChart>

                <Pie
                  data={securityData}
                  dataKey='value'
                  nameKey='name'
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  stroke='none'
                >

                  {securityData.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          SECURITY_COLORS[index]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>

        {/* ORDERS CHART */}
        <div className='lg:col-span-4 card bg-[#0B0B0B] border-white/5 p-10'>

          <div className='mb-12'>

            <h2 className='text-2xl font-bold text-white tracking-tight'>
              Branch Order Load
            </h2>

            <p className='text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2'>
              Live branch order activity
            </p>
          </div>

          <div className='h-[350px]'>

            <ResponsiveContainer width='100%' height='100%'>

              <BarChart
                data={
                  data.charts.branchComparison
                }
              >

                <CartesianGrid
                  strokeDasharray='0'
                  vertical={false}
                  stroke='rgba(255,255,255,0.03)'
                />

                <XAxis
                  dataKey='branch'
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      'rgba(255,255,255,0.3)',

                    fontSize: 10,

                    fontWeight: 900
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  hide
                />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey='orders'
                  fill='var(--primary)'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVITY FEED */}
        <div className='lg:col-span-8 card bg-[#0B0B0B] border-white/5 p-10'>

          <div className='flex items-center justify-between mb-12'>

            <div>

              <h2 className='text-2xl font-bold text-white tracking-tight'>
                Security Audit Feed
              </h2>

              <p className='text-[10px] text-white/20 uppercase tracking-[0.2em] font-black mt-2'>
                Real-time system event logging
              </p>
            </div>

            <button className='px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] uppercase tracking-widest font-black text-white/40 hover:text-white hover:bg-white/10 transition-all'>

              Live Logs
            </button>
          </div>

          <div className='space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2'>

            {(data?.charts?.recentActivity || []).map(
              (
                item: any,
                index: number
              ) => (

                <div
                  key={index}
                  className='flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/10 transition-all group'
                >

                  <div className='w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0'>

                    <Activity
                      size={16}
                      className='text-red-500 group-hover:animate-pulse'
                    />
                  </div>

                  <div className='flex-1 min-w-0'>

                    <p className='font-bold text-sm text-white/80 group-hover:text-white transition-colors truncate'>

                      {item.message}
                    </p>

                    <div className='flex items-center gap-4 mt-1.5'>

                      <p className='text-[10px] text-white/20 font-black uppercase tracking-widest'>
                        {item.type}
                      </p>

                      <div className='w-1 h-1 rounded-full bg-white/10'></div>

                      <span className='text-[9px] font-black text-emerald-500/50 uppercase'>
                        Verified
                      </span>
                    </div>
                  </div>

                  <Globe
                    size={14}
                    className='text-white/5'
                  />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
