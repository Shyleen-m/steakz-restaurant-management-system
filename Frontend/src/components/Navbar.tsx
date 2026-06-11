import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, LogOut, LayoutGrid, Settings, ChevronDown, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const STAFF_ROLES = ['BRANCH_MANAGER', 'KITCHEN_STAFF', 'WAITER', 'INVENTORY_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN'];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isStaff = user && STAFF_ROLES.includes(user.role);
  const isCustomer = user && user.role === 'CUSTOMER';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Branches', path: '/branches' },
    { name: 'Menu', path: '/menu/manchester' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Promotions', path: '/promotions' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="group flex flex-col"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="text-2xl font-black tracking-[0.4em] text-white group-hover:text-[var(--primary)] transition-colors duration-300">
              STEAKZ
            </span>
            <span className="text-[10px] uppercase tracking-[0.6em] text-[var(--primary)] font-bold mt-1 opacity-80">
              Premium Steakhouse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[11px] uppercase tracking-[0.3em] font-black transition-all duration-300 hover:text-[var(--primary)] relative group/link ${
                  location.pathname === link.path ? 'text-[var(--primary)]' : 'text-white/70'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-[var(--primary)] transition-all duration-300 group-hover/link:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">

            {/* Only show cart to customers/guests, not staff */}
            {!isStaff && (
              <Link to="/cart" className="relative group p-2 transition-transform active:scale-95">
                <ShoppingBag className="w-5 h-5 text-white group-hover:text-[var(--primary)] transition-colors" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-black text-[10px] font-black rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 pl-6 border-l border-white/10 group focus:outline-none"
                >
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black">Account</p>
                    <p className="text-xs font-bold text-white group-hover:text-[var(--primary)] transition-colors flex items-center gap-2">
                      {user.fullName?.split(' ')[0] || 'User'}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-[var(--primary)]/30 p-0.5 group-hover:border-[var(--primary)] transition-all overflow-hidden bg-[#121212]">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.fullName}&background=C5A059&color=050505&bold=true`} 
                      alt={user.fullName} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-4 w-64 bg-[#0B0B0B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top-right ${
                  isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                  <div className="p-6 bg-white/[0.02] border-b border-white/5">
                    <p className="text-xs font-bold text-white">{user.fullName}</p>
                    <p className="text-[10px] text-white/30 font-medium truncate mt-1">{user.email}</p>
                    {/* Role badge */}
                    <p className="text-[9px] uppercase tracking-widest font-black text-[var(--primary)] mt-2">
                      {user.role.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-2">
                    {isStaff ? (
                      // Staff: dashboard link + settings
                      <>
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <LayoutGrid size={16} className="text-[var(--primary)]" />
                          Executive Dashboard
                        </Link>
                        <Link 
                          to="/dashboard/settings" 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} className="text-[var(--primary)]" />
                          System Preferences
                        </Link>
                      </>
                    ) : (
                      // Customer: profile + account details
                      <>
                        <Link 
                          to="/account" 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Star size={16} className="text-[var(--primary)]" />
                          Member Experience
                        </Link>
                        <Link 
                          to="/account" 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} className="text-[var(--primary)]" />
                          Account Details
                        </Link>
                      </>
                    )}
                    <div className="h-px bg-white/5 my-2 mx-4"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500/70 hover:text-red-500 hover:bg-red-500/5 transition-all"
                    >
                      <LogOut size={16} />
                      Terminate Session
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary scale-90 px-6 py-2.5"
              >
                Member Access
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-white transition-transform active:scale-90"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-[var(--primary)]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`lg:hidden fixed inset-x-0 top-0 bottom-0 bg-[#050505] z-[-1] transition-all duration-700 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col justify-center p-12 gap-8">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-4xl font-black tracking-tighter transition-all duration-500 delay-[${idx * 100}ms] ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
              } ${location.pathname === link.path ? 'text-[var(--primary)]' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className={`pt-12 mt-12 border-t border-white/5 flex flex-col gap-6 transition-all duration-500 delay-500 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>

            {/* Mobile cart — customers/guests only */}
            {!isStaff && (
              <Link 
                to="/cart" 
                className="flex items-center justify-between text-2xl font-bold text-white/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Current Cart</span>
                <span className="px-4 py-1 bg-[var(--primary)] text-black rounded-full text-sm font-black">{cart.length}</span>
              </Link>
            )}
            
            {user ? (
              <Link 
                to={isStaff ? '/dashboard' : '/account'}
                className="btn-primary py-5 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {isStaff ? 'Go to Dashboard' : 'My Account'}
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="btn-primary py-5 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Member Access
              </Link>
            )}
          </div>
        </div>

        {/* Decoration */}
        <div className="absolute bottom-12 left-12 opacity-10">
            <span className="text-8xl font-black tracking-tighter text-white">STEAKZ</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;