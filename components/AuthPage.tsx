import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      
      if (isMounted.current) {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          if (isMounted.current) onAuthSuccess();
        }, 800);
      }
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || success) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      // Note: Supabase OAuth redirects away from the page, so the rest won't run immediately if redirecting.
    } catch (err: any) {
      if (isMounted.current) {
        setError(err.message || "An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-8 md:p-12 space-y-8 relative overflow-hidden">
        
        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl animate-bounce">
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">Authenticated!</h3>
              <p className="text-slate-500 font-bold text-sm">Opening your localization hub...</p>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-4xl font-black text-primary">Buonolo</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {isLogin ? 'Sign in to access your localization news' : 'Join Buonolo to stay connected'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold animate-in shake">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading || success}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary outline-none transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading || success}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-primary outline-none transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-4 bg-primary text-white font-black rounded-[1.5rem] shadow-sm hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500 font-medium tracking-widest text-[10px] uppercase">Or continue with</span>
          </div>
        </div>

        <div className="space-y-5">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || success}
            className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-[1.5rem] shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
          >
            {loading ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <>
                <i className="fa-brands fa-google text-primary"></i>
                Google
              </>
            )}
          </button>
        </div>

        <div className="pt-6 border-t border-slate-50 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? "New to Buonolo?" : "Already a member?"}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              disabled={loading || success}
              className="font-black text-primary hover:underline transition-all disabled:opacity-50"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;