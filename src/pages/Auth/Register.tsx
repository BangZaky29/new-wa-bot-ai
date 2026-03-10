import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Phone, Lock, User, ArrowLeft, Eye, EyeOff, AtSign, Mail } from 'lucide-react';
import { apiService } from '../../core/services/api.service';
import OTPVerification from './OTPVerification';

interface RegisterProps {
    onRegisterSuccess: (user: any) => void;
    onSwitchLogin: () => void;
}

export default function Register({ onRegisterSuccess, onSwitchLogin }: RegisterProps) {
    const [form, setForm] = useState({
        phone: '',
        username: '',
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Flow State
    const [step, setStep] = useState<'creds' | 'otp'>('creds');
    const [userId, setUserId] = useState('');

    const getPasswordStrength = (pw: string) => {
        if (!pw) return { score: 0, label: '', color: 'bg-slate-700', text: 'text-slate-500' };
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
        if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-500' };
        return { score: 3, label: 'Strong', color: 'bg-green-500', text: 'text-green-500' };
    };

    const strength = getPasswordStrength(form.password);
    const isMatching = form.password && form.confirmPassword ? form.password === form.confirmPassword : null;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { confirmPassword, ...registerData } = form;
            const res = await apiService.register(registerData);
            if (res.success) {
                setUserId(res.userId);
                setStep('otp');
            } else {
                setError(res.error || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] shadow-2xl"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-1">Create Account</h1>
                    <p className="text-slate-400 text-sm font-medium">Join the next-gen AI network</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 text-xs font-bold text-center">{error}</div>}

                {step === 'creds' ? (
                    <form onSubmit={handleRegister} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    value={form.full_name}
                                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="username"
                                    required
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${form.email ? (isEmailValid ? 'text-green-500' : 'text-red-500') : 'text-slate-500'}`} />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
                                    className={`w-full bg-slate-800/50 border rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all font-bold text-sm ${form.email ? (isEmailValid ? 'border-green-500/30 focus:ring-green-500' : 'border-red-500/30 focus:ring-red-500') : 'border-slate-700/50 focus:ring-purple-500'}`}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="0812... or 62812..."
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Password Field */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                                    {form.password && <span className={`text-[9px] font-black uppercase ${strength.text}`}>{strength.label}</span>}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setShowSuggestions(false)}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-bold text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>

                                    {/* Strength Meter Bar */}
                                    {form.password && (
                                        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-slate-800 overflow-hidden rounded-full">
                                            <div
                                                className={`h-full transition-all duration-500 ${strength.color}`}
                                                style={{ width: `${(strength.score / 3) * 100}%` }}
                                            />
                                        </div>
                                    )}

                                    {/* Suggestions Popover */}
                                    <AnimatePresence>
                                        {showSuggestions && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                className="absolute bottom-full left-0 w-[200px] mb-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl z-50 pointer-events-none"
                                            >
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Requirement:</div>
                                                <ul className="space-y-1.5">
                                                    <li className={`flex items-center gap-2 text-[10px] font-bold ${form.password.length >= 8 ? 'text-green-500' : 'text-slate-500'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${form.password.length >= 8 ? 'bg-green-500' : 'bg-slate-600'}`} /> Min. 8 characters
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-[10px] font-bold ${/[A-Z]/.test(form.password) ? 'text-green-500' : 'text-slate-500'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${/[A-Z]/.test(form.password) ? 'bg-green-500' : 'bg-slate-600'}`} /> One Uppercase
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-[10px] font-bold ${/[0-9]/.test(form.password) ? 'text-green-500' : 'text-slate-500'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${/[0-9]/.test(form.password) ? 'bg-green-500' : 'bg-slate-600'}`} /> One Number
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-[10px] font-bold ${/[^A-Za-z0-9]/.test(form.password) ? 'text-green-500' : 'text-slate-500'}`}>
                                                        <div className={`w-1 h-1 rounded-full ${/[^A-Za-z0-9]/.test(form.password) ? 'bg-green-500' : 'bg-slate-600'}`} /> One Special
                                                    </li>
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            {/* Confirm Field */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confirm</label>
                                    {form.confirmPassword && (
                                        <span className={`text-[9px] font-black uppercase ${isMatching ? 'text-green-500' : 'text-red-500'}`}>
                                            {isMatching ? '✓ Match' : '✗ No Match'}
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                        className={`w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all font-bold text-sm ${isMatching === false ? 'focus:ring-red-500 border-red-500/30' : 'focus:ring-purple-500'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading || isMatching === false || strength.score < 2 || !isEmailValid}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all mt-4 disabled:opacity-50 text-sm"
                        >
                            {loading ? 'REGISTERING...' : 'GET STARTED'}
                        </button>
                        <button
                            type="button"
                            onClick={onSwitchLogin}
                            className="w-full py-2 text-slate-500 font-bold hover:text-slate-300 transition-colors flex items-center justify-center gap-2 text-xs"
                        >
                            <ArrowLeft className="w-3 h-3" /> BACK TO LOGIN
                        </button>
                    </form>
                ) : (
                    <OTPVerification
                        userId={userId}
                        onVerifySuccess={onRegisterSuccess}
                        onGoBack={() => setStep('creds')}
                    />
                )}
            </motion.div>
        </div>
    );
}
