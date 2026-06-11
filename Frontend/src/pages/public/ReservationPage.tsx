import {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect
} from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BackToHome from '../../components/BackToHome';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Phone,
  Loader2,
  ChevronRight
} from 'lucide-react';

const branchOptions = [
  { id: 1, label: 'Manchester Central', city: 'Manchester' },
  { id: 2, label: 'London Mayfair', city: 'London' },
  { id: 3, label: 'Birmingham Jewellery Qtr', city: 'Birmingham' },
  { id: 4, label: 'Leeds Victoria', city: 'Leeds' },
  { id: 5, label: 'Edinburgh Old Town', city: 'Edinburgh' },
  { id: 6, label: 'Cardiff Bay', city: 'Cardiff' }
];

const ReservationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.fullName || '',
    phone: '',
    branchId: 1,
    date: '',
    time: '',
    guests: '2',
    requests: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.fullName
      }));
    }
  }, [user]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'branchId' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const reservationTime = new Date(`${form.date}T${form.time}`).toISOString();

await api.post('/reservations', {
  customerName: form.name,

  customerEmail:
    user?.email ||
    `${form.name
      .replace(/\s/g, '')
      .toLowerCase()}@guest.com`,

  customerPhone: form.phone,

  customerId:
    user?.role === 'CUSTOMER'
      ? user.id
      : undefined,

  branch:
    branchOptions.find(
      b => b.id === form.branchId
    )?.city.toLowerCase(),

  reservationTime,

  guests: Number(form.guests),

  specialRequests: form.requests
});

      setSubmitted(true);
    } catch (err: any) {
      console.error('Reservation creation failed', err);
      setError(err.response?.data?.message || "Failed to secure reservation. Please verify your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black'>
      <Navbar />

      <main className='relative pt-32 pb-24 overflow-hidden'>
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[var(--primary)]/5 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--primary)]/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className='container mx-auto px-6 relative z-10'>
          <BackToHome />

          <div className='max-w-6xl mx-auto'>
            {submitted ? (
              <div className='py-32 text-center animate-in zoom-in duration-1000'>
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-glow">
                  <CheckCircle className='w-12 h-12 text-emerald-500' />
                </div>
                <p className="text-[10px] uppercase tracking-[0.6em] text-[var(--primary)] font-black mb-6">Confirmed</p>
                <h2 className='text-6xl font-bold text-white tracking-tight mb-8'>Reservation Secured</h2>
                <p className='text-white/40 text-lg max-w-xl mx-auto font-medium leading-relaxed'>
                  Your place in our sanctuary is reserved. A confirmation protocol has been dispatched to your digital identity. We await your arrival.
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-16 btn-primary px-12 py-5"
                >
                  Return to Matrix
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-16 items-start">
                {/* Information Side */}
                <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-8 duration-1000">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-4">Securing Space</p>
                    <h1 className="text-6xl font-bold text-white tracking-tight leading-tight">Book Your Sanctuary</h1>
                    <p className="text-white/40 mt-8 text-lg font-medium leading-relaxed">
                      Experience the pinnacle of culinary artistry. Secure your table at one of our signature locations.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-6 group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[var(--primary)]/30 transition-all">
                        <MapPin className="text-[var(--primary)] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Prime Locations</h3>
                        <p className="text-white/30 text-sm font-medium">Available across 6 metropolitan nodes.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[var(--primary)]/30 transition-all">
                        <Users className="text-[var(--primary)] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Group Dining</h3>
                        <p className="text-white/30 text-sm font-medium">Bespoke arrangements for parties up to 20 guests.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-[var(--primary)]/30 transition-all">
                        <Clock className="text-[var(--primary)] w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Real-time Sync</h3>
                        <p className="text-white/30 text-sm font-medium">Instant confirmation from our branch servers.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#0B0B0B] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <MessageSquare size={80} />
                    </div>
                    <h4 className="text-white font-bold mb-4">Special Requests?</h4>
                    <p className="text-white/30 text-sm leading-relaxed mb-6 font-medium">
                      From dietary protocols to anniversary surprises, our hospitality suite is ready to accommodate your needs.
                    </p>
                    <div className="flex items-center gap-2 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest">
                      <span>Concierge Ready</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-1000">
                  <div className="card bg-[#0B0B0B]/80 backdrop-blur-2xl border-white/5 p-10 lg:p-16 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-20"></div>
                    
                    <form onSubmit={handleSubmit} className='space-y-10'>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Identity</label>
                          <input
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            placeholder='Full Name'
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Communication</label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                              name='phone'
                              value={form.phone}
                              onChange={handleChange}
                              placeholder='Phone Number'
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Location Selection</label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                          <select
                            name='branchId'
                            value={form.branchId}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium appearance-none"
                          >
                            {branchOptions.map(branch => (
                              <option key={branch.id} value={branch.id} className="bg-[#0B0B0B]">{branch.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Arrival Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                              type='date'
                              name='date'
                              value={form.date}
                              onChange={handleChange}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Time Slot</label>
                          <div className="relative">
                            <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                              type='time'
                              name='time'
                              value={form.time}
                              onChange={handleChange}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Party Size</label>
                          <div className="relative">
                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                              type='number'
                              name='guests'
                              value={form.guests}
                              onChange={handleChange}
                              min='1'
                              max='20'
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium font-black"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Special Manifest (Optional)</label>
                        <textarea
                          name='requests'
                          value={form.requests}
                          onChange={handleChange}
                          placeholder='Dietary requirements, celebrations, seating preferences...'
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] transition-all font-medium resize-none"
                        />
                      </div>

                      {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in zoom-in duration-300">
                          {error}
                        </div>
                      )}

                      <button
                        type='submit'
                        disabled={loading}
                        className="btn-primary w-full py-6 flex items-center justify-center gap-4 group disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span className="text-lg font-black tracking-widest uppercase">Initialize Reservation</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  <div className="mt-12 flex items-center justify-center gap-12 opacity-20">
                    <span className="text-2xl font-black tracking-tighter text-white">STEAKZ</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    <span className="text-2xl font-black tracking-tighter text-white">RESERVE</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReservationPage;
