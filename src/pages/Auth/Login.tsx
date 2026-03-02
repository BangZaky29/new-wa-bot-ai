import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { apiService } from '../../core/services/api.service';

interface LoginProps {
    onLoginSuccess: (user: any) => void;
    onSwitchRegister: () => void;
}

export default function Login({ onLoginSuccess, onSwitchRegister }: LoginProps) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'creds' | 'otp'>('creds');
    const [userId, setUserId] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        if (step === 'otp') {
            setTimeLeft(300);
            setCanResend(false);
            setResendCooldown(60);

            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });

                setResendCooldown((prev) => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [step]);

    useEffect(() => {
        if (resendCooldown === 0) {
            setCanResend(true);
        }
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await apiService.login({ identifier, password });
            if (res.success) {
                setUserId(res.userId);
                setStep('otp');
            } else {
                setError(res.error || 'Login failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (timeLeft === 0) {
            setError('OTP Expired. Please resend.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await apiService.verifyOtp({ userId, code: otp });
            if (res.success) {
                onLoginSuccess(res.user);
            } else {
                setError(res.error || 'Invalid OTP');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await apiService.resendOtp(userId);
            if (res.success) {
                setTimeLeft(300);
                setCanResend(false);
                setResendCooldown(60);
                setError('OTP Resent successfully!');
            } else {
                setError(res.error || 'Resend failed');
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20">
                        <LogIn className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400 font-medium">Elevate your WhatsApp Experience</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-sm font-bold text-center">{error}</div>}

                {step === 'creds' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Username or Phone</label>
                            <div className="relative">
                                {identifier.match(/^\d+$/) ? (
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                ) : (
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                )}
                                <input
                                    type="text"
                                    placeholder="Username, 0812... or 62812..."
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-5 pl-14 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-bold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'PROCESSING...' : 'SIGN IN'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">OTP (Sent via WhatsApp)</label>
                                <span className={`text-xs font-black ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={6}
                                disabled={timeLeft === 0}
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className={`w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-5 px-6 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-black text-3xl tracking-[0.5em] text-center ${timeLeft === 0 ? 'opacity-50 grayscale' : ''}`}
                            />
                        </div>
                        <button
                            disabled={loading || timeLeft === 0}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black py-5 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'VERIFYING...' : timeLeft === 0 ? 'OTP EXPIRED' : 'VERIFY OTP'}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={!canResend || loading}
                                className={`text-xs font-black transition-all ${canResend ? 'text-cyan-400 hover:text-cyan-300 underline underline-offset-4' : 'text-slate-600'}`}
                            >
                                {canResend ? 'RESEND OTP' : `RESEND IN ${resendCooldown}s`}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center text-sm">
                    <span className="text-slate-500 font-bold">New user? </span>
                    <button onClick={onSwitchRegister} className="text-cyan-400 font-black hover:text-cyan-300 transition-colors">CREATE ACCOUNT</button>
                </div>
            </motion.div>
        </div>
    );
}
