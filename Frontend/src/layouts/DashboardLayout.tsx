import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BarChart3, ClipboardList, ChefHat, Package, Users, Settings, LayoutGrid, CalendarCheck, Armchair } from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const profileImages: Record<string, string> = {
    'Ethan Clark':    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    'Olivia Bennett': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    'Noah Carter':    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    'Lily Morgan':    'https://images.unsplash.com/photo-1517841905240-d2130fcb393e?w=400&h=400&fit=crop',
    'Avery Hayes':    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: LayoutGrid,
      // Waiter gets their own dashboard via DashboardPage role switch
      roles: ['BRANCH_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN', 'KITCHEN_STAFF', 'INVENTORY_MANAGER', 'WAITER'],
    },
    {
      label: 'Analytics',
      path: '/dashboard/analytics',
      icon: BarChart3,
      roles: ['HEADQUARTERS_MANAGER', 'ADMIN'],
    },
    {
      // Branch manager confirms/cancels reservations here
      label: 'Reservations',
      path: '/dashboard/reservations',
      icon: CalendarCheck,
      roles: ['BRANCH_MANAGER', 'KITCHEN_STAFF'],
    },
    {
      // Floor plan — waiter + kitchen see table grid; branch manager read-only
      label: 'Dining Floor',
      path: '/dashboard/tables',
      icon: Armchair,
      roles: ['BRANCH_MANAGER', 'KITCHEN_STAFF', 'WAITER'],
    },
    {
      label: 'Order Mgmt',
      path: '/dashboard/orders',
      icon: ClipboardList,
      roles: ['BRANCH_MANAGER', 'KITCHEN_STAFF', 'WAITER'],
    },
    {
      label: 'Kitchen Ops',
      path: '/dashboard/kitchen',
      icon: ChefHat,
      roles: ['KITCHEN_STAFF'],
    },
    {
      label: 'Inventory',
      path: '/dashboard/inventory',
      icon: Package,
      roles: ['INVENTORY_MANAGER', 'BRANCH_MANAGER'],
    },
    {
      label: 'Staffing',
      path: '/dashboard/staff',
      icon: Users,
      roles: ['BRANCH_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN'],
    },
    {
      label: 'Settings',
      path: '/dashboard/settings',
      icon: Settings,
      roles: ['BRANCH_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN'],
    },
  ];

  const visibleMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      BRANCH_MANAGER:       'Branch Director',
      HEADQUARTERS_MANAGER: 'Executive HQ',
      ADMIN:                'System Architect',
      KITCHEN_STAFF:        'Culinary Lead',
      INVENTORY_MANAGER:    'Asset Manager',
      WAITER:               'Front of House',
    };
    return roleMap[role] || role;
  };

  const getProfileImage = (name?: string) => {
    if (!name) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
    return profileImages[name] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
  };

  return (
    <div className='min-h-screen bg-[#050505] text-[#F5F5F5] font-sans selection:bg-[var(--primary)] selection:text-black'>
      <div className='flex min-h-screen'>

        {/* SIDEBAR */}
        <aside className='w-72 bg-[#0B0B0B] flex flex-col border-r border-white/5'>

          {/* Logo */}
          <div className='px-8 pt-10 pb-10'>
            <div className='group cursor-pointer' onClick={() => navigate('/')}>
              <h1 className='text-2xl font-black text-white tracking-[0.4em] group-hover:text-[var(--primary)] transition-colors'>
                STEAKZ
              </h1>
              <p className='text-[9px] text-[var(--primary)] font-bold tracking-[0.5em] mt-2 uppercase opacity-80'>
                Intelligence
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 space-y-1 overflow-y-auto'>
            <p className='px-4 mb-4 text-[10px] uppercase tracking-[0.3em] text-white/30 font-black'>
              Command Center
            </p>
            {visibleMenuItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-[11px] uppercase tracking-widest ${
                      isActive
                        ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(197,160,89,0.2)]'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={16} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className='m-4 p-5 bg-white/5 rounded-2xl border border-white/5'>
            <div className='flex items-center gap-4'>
              <img
                src={getProfileImage(user?.fullName)}
                alt={user?.fullName}
                className='w-10 h-10 rounded-full object-cover border border-[var(--primary)]/30'
              />
              <div className='min-w-0'>
                <p className='text-xs font-bold text-white truncate'>{user?.fullName}</p>
                <p className='text-[9px] text-[var(--primary)] mt-1 font-black uppercase tracking-wider'>
                  {getRoleLabel(user?.role || '')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className='mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all'
            >
              <LogOut size={14} />
              <span>Terminate Session</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className='flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-[#0B0B0B] to-[#050505]'>

          {/* Top Bar */}
          <header className='h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0B0B0B]/50 backdrop-blur-xl sticky top-0 z-40'>
            <div>
              <p className='text-[10px] uppercase tracking-[0.3em] text-[var(--primary)] font-black mb-1'>
                Operational Intelligence
              </p>
              <h2 className='text-lg font-bold text-white tracking-tight'>
                Welcome back, {user?.fullName?.split(' ')[0] || 'Executive'}
              </h2>
            </div>

            <div className='flex items-center gap-6'>
              <div className='hidden md:flex flex-col text-right'>
                <p className='text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold'>System Status</p>
                <div className='flex items-center gap-2 mt-1'>
                  <div className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse' />
                  <p className='text-[10px] font-black text-emerald-500 uppercase tracking-widest'>
                    Encryption Active
                  </p>
                </div>
              </div>

              <div className='h-10 w-px bg-white/10' />

              <div className='flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5'>
                <div className='text-right'>
                  <p className='text-[9px] uppercase tracking-[0.25em] text-white/50 font-black'>
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </p>
                  <p className='text-[11px] font-bold text-white uppercase tracking-tighter'>
                    {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className='flex-1 overflow-auto custom-scrollbar'>
            <div className='p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000'>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;