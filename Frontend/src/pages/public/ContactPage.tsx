import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import BackToHome from '../../components/BackToHome';

const ContactPage = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        setBranches(res.data.branches || res.data || []);
      } catch (err) {
        console.error(err);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          <BackToHome />
          {/* Header */}
          <div className="max-w-4xl mb-24 animate-in fade-in slide-in-from-left-8 duration-1000">
            <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-6">Concierge & Enquiries</p>
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
              We're Here to <br/>Ensure Your Comfort
            </h1>
            <p className="text-white/50 text-xl max-w-2xl leading-relaxed font-medium">
              Whether you're planning a private event, have a dietary enquiry, or simply wish to share your feedback, our dedicated concierge team is at your service.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-16">
            {/* Left: Contact Form */}
            <div className="lg:col-span-7 space-y-12">
              <div className="card bg-[#0B0B0B] border-white/5 p-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Send a Message</h2>
                </div>

                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Alexander Knight"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="e.g. alex@luxury.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Subject</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all appearance-none cursor-pointer">
                      <option className="bg-[#050505]">General Enquiry</option>
                      <option className="bg-[#050505]">Private Dining / Events</option>
                      <option className="bg-[#050505]">Careers</option>
                      <option className="bg-[#050505]">Press & Media</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-white/30">Your Message</label>
                    <textarea 
                      rows={6}
                      placeholder="How may we assist you?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all resize-none"
                    ></textarea>
                  </div>

                  <button className="btn-primary w-full flex items-center justify-center gap-3 py-5 group">
                    <span>Send Message</span>
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Info & Branches */}
            <div className="lg:col-span-5 space-y-12">
              {/* Direct Info */}
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Direct Line</h3>
                    <p className="text-white/40 font-medium">+44 161 123 4567</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Email Concierge</h3>
                    <p className="text-white/40 font-medium">concierge@steakz.co.uk</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Operating Hours</h3>
                    <p className="text-white/40 font-medium leading-relaxed">
                      Mon - Thu: 12:00 PM - 11:00 PM <br/>
                      Fri - Sun: 12:00 PM - 00:00 AM
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch Quick Selection */}
              <div className="pt-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <h3 className="text-sm uppercase tracking-[0.3em] font-black text-white mb-8">Our Luxury Destinations</h3>
                <div className="space-y-4">
                  {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl"></div>)
                  ) : (
                    branches.map((branch) => (
                      <div 
                        key={branch.id}
                        className="group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-[var(--primary)]/30 hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <div>
                          <p className="text-lg font-bold text-white group-hover:text-[var(--primary)] transition-colors">{branch.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-white/30 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{branch.city}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest font-black text-white/20">Call Direct</p>
                          <p className="text-xs font-bold text-white/60 mt-1">{branch.phone}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
