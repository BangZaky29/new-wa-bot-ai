import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../core/services/api.service';

interface OTPVerificationProps {
    userId: string;
    onVerifySuccess: (user: any) => void;
    onGoBack: () => void;
}

export default function OTPVerification({ userId, onVerifySuccess, onGoBack }: OTPVerificationProps) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [timeLeft, setTimeLeft] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(60);
    const timerRef = useRef<any>(null);

    useEffect(() => {
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

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (resendCooldown === 0) setCanResend(true);
    }, [resendCooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                onVerifySuccess(res.user);
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
        <form onSubmit={handleVerify} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-4 text-xs font-bold text-center">{error}</div>}

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
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black py-5 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                {loading ? 'VERIFYING...' : timeLeft === 0 ? 'OTP EXPIRED' : 'VERIFY OTP'}
            </button>

            <div className="text-center space-y-4">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className={`text-xs font-black transition-all ${canResend ? 'text-cyan-400 hover:text-cyan-300 underline underline-offset-4' : 'text-slate-600'}`}
                >
                    {canResend ? 'RESEND OTP' : `RESEND IN ${resendCooldown}s`}
                </button>

                <button
                    type="button"
                    onClick={onGoBack}
                    className="block w-full text-center text-slate-500 hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest"
                >
                    Change Details
                </button>
            </div>
        </form>
    );
}
