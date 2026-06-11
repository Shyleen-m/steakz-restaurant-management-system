import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BackToHome from "../../components/BackToHome";
import { LockKeyhole, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const { user: returnedUser, token } = res.data.data;

      setAuth(returnedUser, token);

      if (returnedUser.role === "CUSTOMER") {
        navigate("/");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black">
      <Navbar />

      <main className="relative pt-32 pb-24 overflow-hidden flex items-center justify-center">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[150px] animate-pulse delay-700"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-md mx-auto">
            <BackToHome />
            
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 mb-6 border border-[var(--primary)]/20">
                <LockKeyhole className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-4">Secure Access</p>
              <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-white/40 mt-4 font-medium">Please enter your credentials to access your Steakz account.</p>
            </div>

            <div className="card bg-[#0B0B0B]/80 backdrop-blur-xl border-white/5 p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Password</label>
                    <Link to="/contact" className="text-[9px] uppercase tracking-widest font-black text-[var(--primary)] hover:opacity-100 opacity-60 transition-opacity">Forgot?</Link>
                  </div>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in zoom-in duration-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-5 group relative overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-white/30 text-xs font-medium">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-[var(--primary)] font-bold hover:underline">Create an identity</Link>
                </p>
              </div>
            </div>

            <div className="mt-12 text-center opacity-20">
              <span className="text-4xl font-black tracking-tighter text-white">STEAKZ</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
