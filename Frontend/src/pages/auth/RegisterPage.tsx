import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BackToHome from "../../components/BackToHome";

import {
  User,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Loader2
} from "lucide-react";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const RegisterPage = () => {

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const navigate = useNavigate();

  const { setAuth } = useAuth();

  const handleRegister = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError("");

    setIsLoading(true);

    try {

      // REGISTER
      await api.post(
        "/auth/register",
        {
          fullName,
          email,
          password
        }
      );

      // AUTO LOGIN
      const loginRes =
        await api.post(
          "/auth/login",
          {
            email,
            password
          }
        );

      const {
        user: returnedUser,
        token
      } = loginRes.data.data;

      // SAVE AUTH CONTEXT
      setAuth(
        returnedUser,
        token
      );

      // SAVE TO LOCAL STORAGE
      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          returnedUser
        )
      );

      // REDIRECT
      navigate("/");

    } catch (err: any) {

      const message =
        err?.response?.data?.message ||
        "Registration failed";

      setError(message);

    } finally {

      setIsLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] selection:bg-[var(--primary)] selection:text-black">

      <Navbar />

      <main className="relative pt-32 pb-24 overflow-hidden flex items-center justify-center">

        {/* BACKGROUND */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">

          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[150px] animate-pulse"></div>

          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--primary)]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

        </div>

        <div className="container mx-auto px-6 relative z-10">

          <div className="max-w-md mx-auto">

            <BackToHome />

            {/* HEADER */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--primary)]/10 mb-6 border border-[var(--primary)]/20">

                <User className="w-8 h-8 text-[var(--primary)]" />

              </div>

              <p className="text-[10px] uppercase tracking-[0.5em] text-[var(--primary)] font-black mb-4">
                New Identity
              </p>

              <h1 className="text-4xl font-bold text-white tracking-tight">
                Join the Inner Circle
              </h1>

              <p className="text-white/40 mt-4 font-medium">
                Create your credentials to experience the pinnacle of steakhouse luxury.
              </p>

            </div>

            {/* CARD */}
            <div className="card bg-[#0B0B0B]/80 backdrop-blur-xl border-white/5 p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">

              <form
                onSubmit={handleRegister}
                className="space-y-6"
              >

                {/* FULL NAME */}
                <div className="space-y-2">

                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">
                    Full Name
                  </label>

                  <div className="relative group">

                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      placeholder="Alexander Knight"
                    />

                  </div>

                </div>

                {/* EMAIL */}
                <div className="space-y-2">

                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">
                    Email Address
                  </label>

                  <div className="relative group">

                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      placeholder="alex@example.com"
                    />

                  </div>

                </div>

                {/* PASSWORD */}
                <div className="space-y-2">

                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 ml-1">
                    Secure Password
                  </label>

                  <div className="relative group">

                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-[var(--primary)] transition-colors" />

                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white focus:outline-none focus:border-[var(--primary)] focus:bg-white/10 transition-all"
                      placeholder="••••••••"
                    />

                  </div>

                  <p className="text-[10px] text-white/30 mt-2 ml-1">
                    Password must be at least 6 characters
                  </p>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in zoom-in duration-300">

                    {error}

                  </div>
                )}

                {/* TERMS */}
                <div className="flex items-start gap-3 px-2 py-4">

                  <div className="w-5 h-5 rounded border border-white/10 flex-shrink-0 bg-white/5 mt-0.5 flex items-center justify-center">

                    <ShieldCheck className="w-3 h-3 text-[var(--primary)]" />

                  </div>

                  <p className="text-[10px] text-white/30 leading-relaxed">

                    By registering, you agree to our{" "}

                    <span className="text-white/50">
                      Terms of Service
                    </span>

                    {" "}and acknowledge our{" "}

                    <span className="text-white/50">
                      Privacy Protocol
                    </span>.

                  </p>

                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-5 group relative overflow-hidden"
                >

                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>
                        Initialize Account
                      </span>

                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* LOGIN LINK */}
              <div className="mt-10 text-center border-t border-white/5 pt-10">

                <p className="text-white/30 text-xs font-medium">

                  Already a member?{" "}

                  <Link
                    to="/login"
                    className="text-[var(--primary)] font-bold hover:underline"
                  >
                    Access Vault
                  </Link>

                </p>

              </div>

            </div>

            {/* BRAND */}
            <div className="mt-12 text-center opacity-20">

              <span className="text-4xl font-black tracking-tighter text-white uppercase">
                Steakz Luxury
              </span>

            </div>

          </div>

        </div>

      </main>

      <Footer />

    </div>
  );
};

export default RegisterPage;