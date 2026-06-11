import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { socket } from '../../../socket';
import {
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock3,
  Activity,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Truck,
  History
} from 'lucide-react';

const InventoryDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventorySummary();
    fetchReorderRequests();

    socket.on('reorder:created', (newRequest) => {
      setRequests(prev => [newRequest, ...prev]);
    });

    socket.on('reorder:updated', (updatedRequest) => {
      setRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
    });

    return () => {
      socket.off('reorder:created');
      socket.off('reorder:updated');
    };
  }, []);

  const fetchInventorySummary = async () => {
    try {
      const res = await api.get('/inventory/summary');
      setData(res.data.data);
    } catch (error) {
      console.error('Inventory summary fetch failed:', error);      
    } finally {
      setLoading(false);
    }
  };

  const fetchReorderRequests = async () => {
    try {
      const res = await api.get('/reorder-requests');
      setRequests(res.data.requests || res.data.reorderRequests || res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reorder requests:', error);    
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/reorder-requests/${id}`, { status });       
      fetchReorderRequests();
    } catch (error) {
      console.error('Failed to update reorder request:', error);    
    }
  };

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>   
        <div className="animate-pulse flex flex-col items-center">  
          <div className="h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4"></div>        
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black">Auditing Global Stock</p>
        </div>
      </div>
    );
  }

  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED').length;
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const totalRequests = requests.length || 1;

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>
      {/* Immersive Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[var(--primary)]" />   
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Supply Chain Intelligence
            </p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Inventory Control
          </h1>
          <p className="text-white/40 text-sm mt-4 font-medium max-w-xl">
            Unified stock monitoring across all branch nodes. Real-time reorder processing and logistics management.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-emerald-500" />  
          </div>
          <div>
            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>Asset Status</p>
            <p className='text-xs font-black text-white uppercase tracking-tighter'>Verified & Secure</p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[
          { label: 'Total SKU Count', value: data?.totalItems || 0, icon: Package, trend: 'Global' },
          { label: 'Stock Risk Items', value: data?.lowStockCount || 0, icon: TrendingDown, trend: 'Critical', color: data?.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500' },
          { label: 'Pending Requests', value: pendingRequests, icon: Clock3, trend: 'Live', color: 'text-amber-500' },
          { label: 'Logistics Health', value: `${Math.round((fulfilledRequests / totalRequests) * 100)}%`, icon: Truck, trend: 'Optimal', color: 'text-[var(--primary)]' },
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
            <p className={`text-4xl font-black tracking-tighter ${kpi.color || 'text-white'}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CRITICAL ALERTS */}
        <div className='lg:col-span-5 card bg-[#0B0B0B] border-white/5 p-10 relative overflow-hidden'>
          <div className="absolute top-0 right-0 p-8">
            <AlertTriangle size={40} className="text-red-500/[0.03]" />
          </div>
          <div className='mb-12'>
            <h3 className='text-2xl font-bold text-white'>Priority Stock Alerts</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Immediate attention required</p>        
          </div>

          <div className='space-y-4'>
            {(data?.criticalItems || []).map((item: any, i: number) => (
              <div key={i} className='group flex items-center justify-between p-6 rounded-2xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all shadow-[0_0_20px_rgba(239,68,68,0.05)]'>
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className='text-lg font-bold text-white group-hover:text-red-500 transition-colors'>{item.name}</span>
                </div>
                <div className="text-right">
                  <p className='text-[9px] uppercase font-black text-white/20 mb-1'>Current Balance</p>
                  <span className='text-sm font-black text-red-500'>{item.quantity} Units</span>
                </div>
              </div>
            ))}
            {(data?.criticalItems || []).length === 0 && (
              <div className="py-20 text-center">
                <p className="text-white/20 font-black uppercase tracking-[0.2em] text-xs">All primary stock levels stable</p>
              </div>
            )}
          </div>
        </div>

        {/* LOGISTICS FEED */}
        <div className='lg:col-span-7 card bg-[#0B0B0B] border-white/5 p-10'>
          <div className='mb-12 flex justify-between items-center'> 
            <div>
              <h3 className='text-2xl font-bold text-white'>Logistics Ledger</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mt-2">Recent asset movements</p>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] uppercase tracking-widest font-black text-white/40'>
              <History size={12} />
              <span>History</span>
            </div>
          </div>

          <div className='space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar'>
            {(data?.recentMovements || []).map((mv: any, i: number) => (
              <div key={i} className='group flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all'>
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    mv.type === 'IN' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {mv.type === 'IN' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className='text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{mv.itemName}</p>   
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className='text-[10px] text-white/20 font-black uppercase tracking-widest'>{mv.branchName}</p>
                      <div className="w-1 h-1 rounded-full bg-white/10"></div>
                      <span className="text-[9px] font-black text-white/40 uppercase">
                        {new Date(mv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-2xl font-black tracking-tighter ${mv.type === 'IN' ? 'text-emerald-500' : 'text-amber-500'}`}>   
                  {mv.type === 'IN' ? '+' : '-'}{mv.quantity}       
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OPERATIONAL QUEUE TABLE */}
      <div className='card bg-[#0B0B0B] border-white/5 p-10'>       
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black mb-2'>Logistics Workflow</p>
            <h2 className='text-3xl font-bold text-white tracking-tight'>Reorder Request Queue</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className='flex flex-col items-end'>
              <p className='text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2'>Fullfillment Rate</p>
              <div className='w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5'>
                <div 
                  className='h-full bg-[var(--primary)] transition-all duration-1000' 
                  style={{ width: `${(fulfilledRequests / totalRequests) * 100}%` }}
                ></div>
              </div>
            </div>
            <span className='px-4 py-2 bg-[var(--primary)]/10 rounded-xl text-[10px] font-black text-[var(--primary)] uppercase tracking-widest border border-[var(--primary)]/20'>
              {pendingRequests} Pending
            </span>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-white/5 text-left'>    
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Resource Identity</th>
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Origin Node</th>
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Authority</th>
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Volume</th>
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>State</th>
                <th className='pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-right'>Command</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/[0.03]'>        
              {requests.map(request => (
                <tr key={request.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className='py-6'>
                    <p className='font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{request.inventory?.name}</p>
                    <p className='text-[10px] text-white/20 font-black uppercase mt-1'>Material ID: {request.id.slice(-6).toUpperCase()}</p>
                  </td>
                  <td className='py-6'>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                      {request.branch?.name}
                    </div>
                  </td>
                  <td className='py-6'>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                      {request.requestedBy?.fullName}
                    </div>
                  </td>
                  <td className='py-6'>
                    <span className="text-lg font-black text-white tracking-tighter">{request.quantity}</span>
                  </td>
                  <td className='py-6'>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                      request.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      request.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      request.status === 'FULFILLED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className='py-6'>
                    <div className='flex justify-end gap-2'>        
                      {request.status === 'PENDING' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'APPROVED')}
                          className="p-2.5 rounded-xl bg-white/5 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all border border-white/5"
                          title="Approve Request"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {request.status === 'APPROVED' && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'FULFILLED')}
                          className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/20"
                          title="Fulfill Request"
                        >
                          <Package size={16} />
                        </button>
                      )}
                      {(request.status === 'PENDING' || request.status === 'APPROVED') && (
                        <button
                          onClick={() => updateRequestStatus(request.id, 'REJECTED')}
                          className="p-2.5 rounded-xl bg-white/5 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-white/5"
                          title="Reject Request"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      {request.status === 'FULFILLED' && <ChevronRight size={14} className="text-white/10" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
