import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Users, Search, Shield, UserX, UserCheck, Trash2, MapPin, Mail, ChevronRight, Activity } from 'lucide-react';

const StaffPage = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/staff');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/staff/${id}/toggle`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteUser = async (id: string) => {
    const confirmed = window.confirm('Terminate this identity from the enterprise network? This action is irreversible.');
    if (!confirmed) return;

    try {
      await api.delete(`/staff/${id}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredUsers = users.filter((staff) =>
    `${staff.fullName} ${staff.email} ${staff.role}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin mb-4"></div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black">Syncing Personnel Data</p>
        </div>
      </div>
    );
  }

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>
      {/* Workforce Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              Enterprise Human Resources
            </p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Workforce Intelligence
          </h1>
          <p className="text-white/40 text-sm mt-4 font-medium max-w-xl">
            Manage operational access and personnel identities across the global branch network.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-4 rounded-2xl flex items-center gap-4 shadow-2xl'>
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Activity size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className='text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1'>Global Active Staff</p>
            <p className='text-xl font-black text-white uppercase tracking-tighter'>{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div className='relative max-w-md w-full group'>
          <Search className='absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[var(--primary)] transition-colors' />
          <input
            type='text'
            placeholder='Search identities by name, role or email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full bg-[#0B0B0B] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-[var(--primary)]/50 focus:bg-[#121212] transition-all placeholder:text-white/10'
          />
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest font-black text-white/40 hover:text-white transition-all">
            Export Roster
          </button>
        </div>
      </div>

      {/* Personnel Matrix Table */}
      <div className='card bg-[#0B0B0B] border-white/5 p-0 overflow-hidden shadow-2xl'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-white/[0.02] border-b border-white/5'>
                <th className='p-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Personnel Identity</th>
                <th className='p-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Functional Role</th>
                <th className='p-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Assignment</th>
                <th className='p-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Access State</th>
                <th className='p-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/20'>Commands</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-white/[0.03]'>
              {filteredUsers.map((staff) => (
                <tr key={staff.id} className='group hover:bg-white/[0.01] transition-colors'>
                  <td className='p-8'>
                    <div className='flex items-center gap-6'>
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/5 shrink-0 bg-white/5">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${staff.fullName}&background=C5A059&color=050505&bold=true&size=128`} 
                          alt={staff.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className='font-bold text-lg text-white group-hover:text-[var(--primary)] transition-colors truncate'>{staff.fullName}</p>
                        <div className="flex items-center gap-2 mt-1 text-white/30 text-xs font-medium">
                          <Mail size={12} className="text-[var(--primary)]/50" />
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className='p-8'>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 shadow-sm">
                      <Shield size={12} className="text-[var(--primary)]" />
                      <span className='text-[10px] font-black uppercase tracking-widest text-white/70'>
                        {staff.role.replaceAll('_', ' ')}
                      </span>
                    </div>
                  </td>

                  <td className='p-8'>
                    <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                      <MapPin size={14} className="text-[var(--primary)]/50" />
                      <span>{staff.branch?.name || 'Global HQ'}</span>
                    </div>
                  </td>

                  <td className='p-8'>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      staff.isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${staff.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className='text-[9px] font-black uppercase tracking-widest'>
                        {staff.isActive ? 'Authorized' : 'Restricted'}
                      </span>
                    </div>
                  </td>

                  <td className='p-8'>
                    <div className='flex justify-end gap-3'>
                      <button
                        onClick={() => toggleStatus(staff.id)}
                        className={`p-3 rounded-xl transition-all border ${
                          staff.isActive 
                            ? 'bg-white/5 text-amber-500 border-white/10 hover:bg-amber-500 hover:text-black' 
                            : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-black'
                        }`}
                        title={staff.isActive ? 'Suspend Access' : 'Restore Access'}
                      >
                        {staff.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>

                      {authUser?.role === 'ADMIN' && (
                        <button
                          onClick={() => deleteUser(staff.id)}
                          className='p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all'
                          title="Purge Identity"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      
                      <button className="p-3 rounded-xl bg-white/5 text-white/20 border border-white/5 hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <p className="text-white/20 font-black uppercase tracking-[0.2em] text-sm">No identity profiles match your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Meta */}
      <div className="px-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-white/10">
        <span>Identity Database v2.4.0</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Real-time Network Sync Active</span>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
