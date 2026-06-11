import { useState } from 'react';
import {
  Shield,
  Bell,
  Building2,
  Clock3,
  Database,
  Users,
  Save,
  Settings2,
  CheckCircle2,
  Lock,
  Cpu,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailReports: true,
    maintenanceMode: false,
    autoReservations: true,
    kitchenAlerts: true,
    analyticsAccess: true,
    branchVisibility: true,
    auditLogs: true
  });

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const role = user?.role;

  return (
    <div className='pb-20 space-y-12 animate-in fade-in duration-1000'>
      {/* Settings Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-8'>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-[var(--primary)]" />
            <p className='text-[10px] uppercase tracking-[0.4em] text-[var(--primary)] font-black'>
              System Architecture
            </p>
          </div>
          <h1 className='text-5xl font-bold text-white tracking-tight'>
            Operational Controls
          </h1>
          <p className="text-white/40 text-sm mt-4 font-medium max-w-xl">
            Configure enterprise-level infrastructure behavior, security protocols, and operational notification matrices.
          </p>
        </div>

        <div className='bg-[#0B0B0B] border border-white/5 p-1 rounded-2xl flex items-center shadow-2xl overflow-hidden'>
            <div className="px-6 py-4 bg-white/5 border-r border-white/5">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Active Authority</p>
              <p className="text-xs font-black text-[var(--primary)] uppercase tracking-tighter">
  {role?.split('_').join(' ')}
</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Node Status</p>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-tighter">Synchronized</p>
            </div>
        </div>
      </div>

      {/* Success Notification */}
      {saved && (
        <div className='card bg-emerald-500/10 border-emerald-500/20 p-6 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500'>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <div>
            <p className='text-emerald-500 font-bold'>Configuration Synchronized</p>
            <p className='text-emerald-500/60 text-xs font-medium'>Enterprise settings have been updated across the global network.</p>
          </div>
        </div>
      )}

      <div className='grid gap-10 lg:grid-cols-2'>
        {/* ====================================== */}
        {/* ADMIN SETTINGS */}
        {/* ====================================== */}
        {role === 'ADMIN' && (
          <>
            <div className='card bg-[#0B0B0B] border-white/5 p-10'>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Shield className='text-red-500' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Security Matrix</h2>
              </div>

              <div className='space-y-8'>
                {[
                  { label: 'Infrastructure Audit Logging', key: 'auditLogs', desc: 'Maintain detailed event logs for system forensics.' },
                  { label: 'System-Wide Maintenance', key: 'maintenanceMode', desc: 'Restricts access to all non-admin personnel.' },
                  { label: 'Real-time Security Alerts', key: 'notifications', desc: 'Receive immediate alerts for unauthorized attempts.' }
                ].map((item) => (
                  <div key={item.key} className='flex items-center justify-between group'>
                    <div className="max-w-[70%]">
                      <p className='font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{item.label}</p>
                      <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                        settings[item.key as keyof typeof settings] ? 'bg-[var(--primary)]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-500 ease-in-out ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='card bg-[#0B0B0B] border-white/5 p-10 relative overflow-hidden'>
              <div className="absolute top-0 right-0 p-8">
                <Database size={80} className="text-white/[0.02]" />
              </div>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Cpu className='text-blue-500' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Core Infrastructure</h2>
              </div>

              <div className='space-y-6'>
                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 group hover:border-emerald-500/20 transition-all'>
                  <p className='text-[10px] uppercase tracking-widest text-white/30 font-black mb-2'>Main Database</p>
                  <div className="flex items-center justify-between">
                    <p className='text-xl font-black text-emerald-500 tracking-tighter uppercase'>Healthy & Encrypted</p>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                </div>

                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 group hover:border-emerald-500/20 transition-all'>
                  <p className='text-[10px] uppercase tracking-widest text-white/30 font-black mb-2'>API Identity Gateway</p>
                  <div className="flex items-center justify-between">
                    <p className='text-xl font-black text-emerald-500 tracking-tighter uppercase'>V3.8 Operational</p>
                    <Zap size={16} className="text-emerald-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====================================== */}
        {/* HQ SETTINGS */}
        {/* ====================================== */}
        {role === 'HEADQUARTERS_MANAGER' && (
          <>
            <div className='card bg-[#0B0B0B] border-white/5 p-10'>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <Building2 className='text-[var(--primary)]' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Enterprise Configuration</h2>
              </div>

              <div className='space-y-8'>
                {[
                  { label: 'Global Branch Visibility', key: 'branchVisibility', desc: 'Allows executive cross-branch data analysis.' },
                  { label: 'Extended Analytics Access', key: 'analyticsAccess', desc: 'Enables advanced revenue forecasting models.' },
                  { label: 'Automated Executive Reports', key: 'emailReports', desc: 'Weekly strategic summaries via encrypted email.' }
                ].map((item) => (
                  <div key={item.key} className='flex items-center justify-between group'>
                    <div className="max-w-[70%]">
                      <p className='font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{item.label}</p>
                      <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                        settings[item.key as keyof typeof settings] ? 'bg-[var(--primary)]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-500 ease-in-out ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='card bg-[#0B0B0B] border-white/5 p-10'>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Bell className='text-purple-500' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Executive Alerts</h2>
              </div>

              <div className='space-y-6'>
                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/[0.08] transition-all cursor-pointer'>
                  <p className='font-bold text-white mb-2'>Operational Anomalies</p>
                  <p className='text-[10px] text-white/30 font-medium uppercase tracking-widest leading-relaxed'>
                    Receive critical alerts for branch stockouts, downtime, or security incidents.
                  </p>
                </div>

                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/[0.08] transition-all cursor-pointer'>
                  <p className='font-bold text-white mb-2'>Strategic Milestones</p>
                  <p className='text-[10px] text-white/30 font-medium uppercase tracking-widest leading-relaxed'>
                    Notifications for revenue targets, expansion progress, and global KPI health.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ====================================== */}
        {/* BRANCH SETTINGS */}
        {/* ====================================== */}
        {role === 'BRANCH_MANAGER' && (
          <>
            <div className='card bg-[#0B0B0B] border-white/5 p-10'>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Clock3 className='text-blue-500' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Branch Operations</h2>
              </div>

              <div className='space-y-8'>
                {[
                  { label: 'Auto Reservation Approval', key: 'autoReservations', desc: 'Accept standard bookings without manual verification.' },
                  { label: 'Kitchen Urgency Alerts', key: 'kitchenAlerts', desc: 'Enable visual/audio cues for rush-hour prep queues.' },
                  { label: 'Real-time Staff Paging', key: 'notifications', desc: 'Enable direct internal communications via mobile app.' }
                ].map((item) => (
                  <div key={item.key} className='flex items-center justify-between group'>
                    <div className="max-w-[70%]">
                      <p className='font-bold text-white group-hover:text-[var(--primary)] transition-colors'>{item.label}</p>
                      <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wider leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-500 focus:outline-none ${
                        settings[item.key as keyof typeof settings] ? 'bg-[var(--primary)]' : 'bg-white/10'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-500 ease-in-out ${
                        settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className='card bg-[#0B0B0B] border-white/5 p-10'>
              <div className='flex items-center gap-4 mb-10'>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Users className='text-emerald-500' size={20} />
                </div>
                <h2 className='text-2xl font-bold text-white tracking-tight'>Workforce & Capacity</h2>
              </div>

              <div className='space-y-6'>
                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/[0.08] transition-all cursor-pointer'>
                  <p className='font-bold text-white mb-2'>Shift Synchronization</p>
                  <p className='text-[10px] text-white/30 font-medium uppercase tracking-widest leading-relaxed'>
                    Manage digital attendance tracking and automated shift handover reports.
                  </p>
                </div>

                <div className='rounded-2xl bg-white/5 border border-white/5 p-6 hover:bg-white/[0.08] transition-all cursor-pointer'>
                  <p className='font-bold text-white mb-2'>Dynamic Capacity Limits</p>
                  <p className='text-[10px] text-white/30 font-medium uppercase tracking-widest leading-relaxed'>
                    Adjust guest intake thresholds based on live floor staffing levels.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* DEFAULT SETTINGS */}
        {![ 'ADMIN', 'HEADQUARTERS_MANAGER', 'BRANCH_MANAGER' ].includes(role || '') && (
          <div className='lg:col-span-2 card bg-[#0B0B0B] border-white/5 p-20 text-center'>
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-10">
              <Lock size={32} className="text-white/10" />
            </div>
            <h2 className='text-3xl font-bold text-white mb-4 tracking-tight uppercase'>Access Level Restriction</h2>
            <p className='text-white/30 text-lg max-w-md mx-auto leading-relaxed'>Advanced system preferences are currently limited to executive and administrative identities.</p>
          </div>
        )}
      </div>

      {/* Global Save Command */}
      <div className='pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8'>
        <div className="flex items-center gap-4 text-white/20">
          <Globe size={16} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Propagating to Global Cluster Nodes</p>
        </div>
        <button
          onClick={saveSettings}
          className='btn-primary min-w-[280px] py-5 flex items-center justify-center gap-4 group shadow-glow-gold'
        >
          <Save size={18} />
          <span className="text-sm font-black tracking-widest uppercase">Commit Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
