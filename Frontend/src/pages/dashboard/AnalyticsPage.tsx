import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../../api/axios';
import { BarChart3, TrendingUp, Users, Package, Activity, Globe, ChevronRight, Star, Download, Clock } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B0B0B] border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">    
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[var(--primary)] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xl font-black text-white">
            {entry.name === 'revenue' ? `£${Number(entry.value).toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('all');
  const [branches, setBranches] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics?branchId=${branchId}`);
      setAnalytics(res.data);
      setBranches(res.data.branches || []);
    } catch (error) {
      console.error('Analytics fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [branchId]);

  const handleDownloadReport = async () => {
    try {
      setExporting(true);
      const res = await api.get('/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `steakz-report-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4"></div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black">Decrypting Analytics</p>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const charts = analytics?.charts || {};
  const insights = analytics?.insights || {};
  const PIE_COLORS = ['var(--primary)', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>
      {/* Executive Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[var(--primary)]" />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>       
              Strategic Intelligence Matrix
            </p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Performance Insights
          </h1>
          <p className="text-white/40 text-sm mt-4 font-medium max-w-xl">
            Unified data analysis across the Steakz global network. Deep operational metrics and revenue forecasting.
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <button 
            onClick={handleDownloadReport}
            disabled={exporting}
            className='bg-white/5 border border-white/10 p-4 rounded-xl text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all flex items-center gap-2'
          >
            <Download size={18} className={exporting ? 'animate-bounce' : ''} />
            <span className='text-[10px] font-black uppercase tracking-widest'>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </span>
          </button>
          <div className='bg-[#0B0B0B] border border-white/5 p-1 rounded-2xl flex items-center shadow-2xl'> 
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className='bg-transparent text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-white/5 rounded-xl transition-all appearance-none min-w-[220px]'   
            >
              <option value='all' className="bg-[#050505]">Global Matrix</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id} className="bg-[#050505]">
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strategic KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Network Revenue', value: `£${Number(summary.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, trend: '+18.4%' },
          { label: 'Order Volume', value: summary.totalOrders || 0, icon: Activity, trend: '+5.2%' },     
          { label: 'Personnel Count', value: summary.activeStaff || 0, icon: Users, trend: 'Optimal' },
          { label: 'Supply Risk', value: summary.lowStockItems || 0, icon: Package, trend: summary.lowStockItems > 0 ? 'Action Reqd' : 'Stable', alert: summary.lowStockItems > 0 },
        ].map((kpi, i) => (
          <div key={i} className='card bg-[#0B0B0B] border-white/5 p-8 group hover:border-[var(--primary)]/30 transition-all'>
            <div className='flex justify-between items-start mb-8'>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors duration-500">
                <kpi.icon size={20} className="text-[var(--primary)] group-hover:text-black transition-colors" />
              </div>
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg bg-white/5 text-white/40 uppercase tracking-widest border border-white/5`}>
                {kpi.trend}
              </span>
            </div>
            <p className='text-[10px] uppercase tracking-[0.3em] text-white/30 font-black mb-1'>{kpi.label}</p>
            <p className={`text-4xl font-black tracking-tighter ${kpi.alert ? 'text-red-500' : 'text-white'}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Main Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* AREA CHART: REVENUE TREND */}
        <div className='lg:col-span-12 card bg-[#0B0B0B] border-white/5 p-10 relative overflow-hidden'>   
          <div className="absolute top-0 right-0 p-10">
            <Globe size={100} className="text-white/[0.01]" />
          </div>
          <div className='mb-12'>
            <h3 className='text-3xl font-bold text-white tracking-tight'>Growth Trajectory</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Historical revenue distribution</p>
          </div>

          <div className='h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={charts.revenueTrend || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />    
                <XAxis
                  dataKey='date'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART: CATEGORY PERFORMANCE */}
        <div className='lg:col-span-12 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-12'>
            <h3 className='text-2xl font-bold text-white tracking-tight'>Category Performance</h3>      
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Revenue contribution by menu segment</p>
          </div>

          <div className='h-[350px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={insights.categoryPerformance || []}>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />    
                <XAxis
                  dataKey='category'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />       
                <Bar dataKey='revenue' fill='var(--primary)' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART: BRANCH PERFORMANCE */}
        <div className='lg:col-span-7 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-12 flex justify-between items-center'>
            <div>
              <h3 className='text-2xl font-bold text-white tracking-tight'>Network Benchmarking</h3>      
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Revenue & Volume comparison</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)]"></div>
                <span className="text-[9px] uppercase font-black text-white/30">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-[9px] uppercase font-black text-white/30">Orders</span>
              </div>
            </div>
          </div>

          <div className='h-[350px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={charts.branchComparison || []}>
                <CartesianGrid strokeDasharray='0' vertical={false} stroke='rgba(255,255,255,0.03)' />    
                <XAxis
                  dataKey='branch'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />       
                <Bar dataKey='revenue' fill='var(--primary)' radius={[4, 4, 0, 0]} />
                <Bar dataKey='orders' fill='#3b82f6' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: KITCHEN OPS */}
        <div className='lg:col-span-5 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-12'>
            <h3 className='text-2xl font-bold text-white tracking-tight'>Culinary Distribution</h3>       
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Operational state analysis</p>
          </div>

          <div className='h-[350px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={charts.kitchenStatus || []}
                  dataKey='count'
                  nameKey='status'
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  stroke="none"
                >
                  {(charts.kitchenStatus || []).map((_: any, index: number) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }: any) => (
                    <div className="flex flex-wrap justify-center gap-6 mt-8">
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-[9px] uppercase tracking-widest font-black text-white/30">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
        <div className='lg:col-span-8 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='flex justify-between items-center mb-12'>
            <div>
              <h3 className='text-2xl font-bold text-white tracking-tight'>Popular Gastronomy</h3>        
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Highest performing menu assets</p>
            </div>
          </div>

          <div className='grid sm:grid-cols-2 gap-6'>
            {insights.popularItems?.map((item: any) => (
              <div key={item.menuItemId} className='group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/20 transition-all'>
                <div className='flex items-center gap-5'>
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center">
                    <Star size={18} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className='font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{item.name}</p>
                    <p className='text-[10px] text-white/20 font-black uppercase mt-1'>{item.category}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-2xl font-black text-white tracking-tighter'>{item.quantity}</p>      
                  <p className='text-[9px] text-white/20 font-black uppercase'>Orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='lg:col-span-4 card bg-[var(--primary)] p-10 flex flex-col justify-between overflow-hidden relative group'>
          <div className="absolute top-0 right-0 p-8">
            <TrendingUp size={120} className="text-black/5 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div>
            <p className='text-[10px] uppercase tracking-[0.4em] text-black/40 font-black mb-6'>Executive Summary</p>
            <h3 className='text-3xl font-black text-black leading-tight mb-8'>Optimal Network <br/>Efficiency Detected</h3>
            <p className='text-black/60 text-sm font-medium leading-relaxed'>
              Strategic analysis indicates an 18.4% increase in global revenue compared to the previous cycle. Inventory management has achieved a 98.2% health rating across all branch nodes.
            </p>
          </div>
          <button 
            onClick={handleDownloadReport}
            disabled={exporting}
            className='mt-12 w-full py-4 bg-black text-white rounded-xl text-[10px] uppercase tracking-[0.3em] font-black hover:bg-black/80 transition-all flex items-center justify-center gap-3'
          >
            <span>{exporting ? 'Generating...' : 'Download Report'}</span>
            {exporting ? <Activity size={14} className="animate-spin" /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
