import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, AlertTriangle, CheckCircle, LogIn, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ text: '', type: '' });

    try {
      // Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);

      // Fetch user profile from users table
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      // If user profile not found, create it
      if (userError || !userData) {
        // List of admin emails
        const adminEmails = ['admin@bosomtwi.com'];
        const isAdmin = adminEmails.includes(authData.user.email || '');
        
        // Disable RLS temporarily for user creation (using service role would be ideal)
        // For now, use upsert with user's own credentials
        const userProfile = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.full_name || authData.user.email || 'User',
          role: isAdmin ? 'admin' : 'journalist',
        };

        // Try to insert first
        let { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([userProfile])
          .select()
          .single();

        if (insertError) {
          // If insert failed, try to fetch existing user by email
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', authData.user.email)
            .single();

          if (existingUser) {
            // User exists, use it and update role if needed
            if (isAdmin && existingUser.role !== 'admin') {
              const { error: updateError } = await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', existingUser.id);
              if (!updateError) {
                existingUser.role = 'admin';
              }
            }
            userData = existingUser;
          } else if (fetchError) {
            // User doesn't exist and insert failed - try to fetch by id one more time
            const { data: userById } = await supabase
              .from('users')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            
            if (userById) {
              userData = userById;
            } else {
              throw new Error(`Failed to create user profile: ${insertError?.message || 'Unknown error'}`);
            }
          } else {
            throw new Error('Failed to create user profile. Please contact admin.');
          }
        } else {
          userData = insertData;
        }
      }

      // Check if user has journalist or admin access
      if (userData.role !== 'journalist' && userData.role !== 'admin') {
        throw new Error('Access denied. Only journalists and admins can log in.');
      }

      setStatus({ text: `Welcome, ${userData.name}!`, type: 'success' });
      setTimeout(() => onLoginSuccess(userData), 800);
    } catch (err: any) {
      setStatus({ text: err.message || 'Login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1a0a35] to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-ashanti-gold rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-black text-black">BW</span>
          </div>
          <h1 className="text-3xl font-heading font-black text-white mb-1">BOSOMTWI WEB</h1>
          <p className="text-xs uppercase tracking-widest text-ashanti-gold font-bold">Journalist Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-black to-[#1a0a35] px-6 py-8 text-white">
            <h2 className="text-xl font-black flex items-center gap-2">
              <LogIn size={20} />
              Sign In to Dashboard
            </h2>
            <p className="text-xs text-white/60 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {status.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
                  status.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-green-50 text-green-600 border border-green-100'
                }`}
              >
                {status.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                {status.text}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-600 flex items-center gap-1.5">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="journalist@bosomtwi.com"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg py-3 px-4 font-medium focus:outline-none focus:border-ashanti-gold transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-black text-slate-600 flex items-center gap-1.5">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-lg py-3 px-4 font-medium focus:outline-none focus:border-ashanti-gold transition-all"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-ashanti-gold text-black rounded-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              For access, contact{' '}
              <span className="font-bold text-ashanti-gold">admin@bosomtwi.com</span>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/5 border border-ashanti-gold/20 rounded-xl p-4">
          <p className="text-xs text-white/70 leading-relaxed">
            <span className="font-bold text-ashanti-gold">🔒 Secure Access:</span> Only verified journalists and admins can access the dashboard. Your credentials are encrypted and secure.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
