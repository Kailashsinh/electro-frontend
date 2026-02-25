import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Edit2, LogOut, ShieldCheck, PenTool, Award, Briefcase, Star, Settings, ChevronRight, CheckCircle, Loader2, CreditCard, Landmark, Check, ArrowRight, Smartphone } from 'lucide-react';
import { authApi } from '@/api/auth';
import { serviceRequestApi } from '@/api/serviceRequests';
import { useToast } from '@/hooks/use-toast';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

const TechnicianProfile: React.FC = () => {
    const { user, refreshProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const [stats, setStats] = useState({
        rating: 4.8,
        jobsCompleted: 0,
        experience: '1 Year',
        badge: 'Verified Pro'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await serviceRequestApi.getTechnicianRequests();
                const reqs = res.data?.requests || res.data || [];
                const completed = reqs.filter((r: any) => r.status === 'completed').length;
                const memberSince = user?.created_at ? new Date(user.created_at) : new Date();
                const yearDiff = new Date().getFullYear() - memberSince.getFullYear();
                const exp = yearDiff < 1 ? 'Fresh' : `${yearDiff} Year${yearDiff > 1 ? 's' : ''}`;
                setStats(prev => ({ ...prev, jobsCompleted: completed, experience: exp }));
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [user]);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: ''
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const [payoutSettings, setPayoutSettings] = useState<any>(null);
    const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
    const [payoutForm, setPayoutForm] = useState({
        method: 'bank',
        password: '',
        bank: { bank_name: '', account_number: '', ifsc_code: '', account_holder: '' },
        upi: { upi_id: '' }
    });

    const fetchPayoutSettings = async () => {
        try {
            const res = await authApi.getPayoutSettings();
            setPayoutSettings(res.data);
            if (res.data) {
                setPayoutForm(prev => ({
                    ...prev,
                    method: res.data.method || 'bank',
                    bank: {
                        bank_name: res.data.bank?.bank_name || '',
                        account_number: '', // Don't pre-fill sensitive data
                        ifsc_code: res.data.bank?.ifsc_code || '',
                        account_holder: res.data.bank?.account_holder || ''
                    },
                    upi: { upi_id: res.data.upi?.upi_id || '' }
                }));
            }
        } catch (error) { console.error("Failed to fetch payout settings", error); }
    };

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
            fetchPayoutSettings();
        }
    }, [user]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast({ title: 'File too large', description: 'Max 2MB', variant: 'destructive' });
            return;
        }
        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await authApi.updateTechnicianProfile({ profile_picture: reader.result as string });
                await refreshProfile();
                toast({ title: 'Avatar Updated' });
            } catch (error) {
                toast({ title: 'Upload Failed', variant: 'destructive' });
            } finally { setUploading(false); }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authApi.updateTechnicianProfile(formData);
            await refreshProfile();
            setIsEditing(false);
            toast({ title: 'Profile Updated' });
        } catch { toast({ title: 'Update Failed', variant: 'destructive' }); }
    };

    const [submittingPayout, setSubmittingPayout] = useState(false);
    const handleUpdatePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingPayout(true);
        try {
            await authApi.updatePayoutSettings(payoutForm);
            toast({ title: 'Success', description: 'Payout settings updated securely.' });
            setIsPayoutModalOpen(false);
            fetchPayoutSettings();
            setPayoutForm(prev => ({ ...prev, password: '' })); // Clear password
        } catch (err: any) {
            toast({ title: 'Security Failure', description: err.response?.data?.message || 'Failed to update settings', variant: 'destructive' });
        } finally { setSubmittingPayout(false); }
    };

    if (!user) return <LoadingSkeleton rows={5} />;

    return (
        <div className="min-h-screen pb-20 relative">
            {/* Background elements */}
            <div className="fixed inset-0 -z-10 bg-[#fbfcfd] overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-10 space-y-8">
                {/* Unified Dossier Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-premium border-white/60 shadow-2xl rounded-[3rem] overflow-hidden"
                >
                    <div className="h-40 bg-slate-950 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/50 via-slate-950 to-purple-900/50" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    </div>
                    <br />
                    <br />
                    <div className="px-8 md:px-12 pb-12 relative flex flex-col md:flex-row items-center md:items-end gap-8 -mt-20">
                        <div className="relative group">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            <div className="w-44 h-44 rounded-[2.5rem] border-[8px] border-white shadow-2xl overflow-hidden bg-white relative">
                                {user.profile_picture ? (
                                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-5xl font-black text-indigo-200 italic">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer"
                                >
                                    <Camera className="w-8 h-8 text-white" />
                                </button>
                                {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-600 animate-spin" /></div>}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left pb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                                Certified Technician
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-950 uppercase italic tracking-tighter mb-4 leading-none">{user.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-500 font-bold italic text-sm uppercase tracking-wide">
                                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100/50 border border-slate-200/50"><Briefcase className="w-4 h-4" /> Senior Lead</span>
                                <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100/50 border border-slate-200/50"><Award className="w-4 h-4" /> {stats.experience} Exp</span>
                            </div>
                        </div>

                        <div className="flex gap-4 md:pb-4">
                            <div className="glass-premium px-6 py-4 rounded-3xl text-center border-white/40 shadow-xl min-w-[120px]">
                                <p className="text-2xl font-black text-slate-950 flex items-center justify-center gap-1 leading-none italic">{stats.rating}<Star className="w-5 h-5 text-amber-500 fill-amber-500 mb-1" /></p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Rating</p>
                            </div>
                            <div className="glass-premium px-6 py-4 rounded-3xl text-center border-white/40 shadow-xl min-w-[120px]">
                                <p className="text-2xl font-black text-slate-950 leading-none italic">{stats.jobsCompleted}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Jobs Done</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Essential Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-premium p-8 rounded-[2.5rem] border-white/60 shadow-xl space-y-8"
                        >
                            <h3 className="text-sm font-black text-slate-950 uppercase italic tracking-widest flex items-center gap-3">
                                <Mail className="w-5 h-5 text-indigo-600" /> Identification
                            </h3>

                            <div className="space-y-6">
                                {[
                                    { label: 'Uplink Address', val: user.email, icon: Mail },
                                    { label: 'Direct Line', val: user.phone, icon: Phone },
                                    { label: 'Sector Hub', val: user.address || 'Not Set', icon: MapPin }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2 group">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
                                            <item.icon className="w-4 h-4 text-indigo-500" />
                                            <span className="font-bold text-slate-900 italic text-sm truncate">{item.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-premium p-4 rounded-[2rem] border-white/60 shadow-lg space-y-2"
                        >
                            <button onClick={() => setIsPasswordModalOpen(true)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                                <span className="flex items-center gap-3 font-black text-slate-600 uppercase italic text-[10px] tracking-widest">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Lock className="w-4 h-4" /></div>
                                    Update Security
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                            </button>
                            <button onClick={logout} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 rounded-2xl transition-all group">
                                <span className="flex items-center gap-3 font-black text-rose-600 uppercase italic text-[10px] tracking-widest">
                                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all"><LogOut className="w-4 h-4" /></div>
                                    End Session
                                </span>
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column: Mastery & Config */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-premium p-10 rounded-[3rem] border-white/60 shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-widest flex items-center gap-3">
                                    <PenTool className="w-6 h-6 text-emerald-600" /> Technical Mastery
                                </h3>
                                <div className="h-10 px-4 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl flex items-center gap-2 uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" /> Verified Skills
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {(user.skills?.length > 0 ? user.skills : ['Mechanical Repair', 'System Tuning', 'Circuit Board Repair', 'Diagnostic Scan']).map((skill: string) => (
                                    <span key={skill} className="px-5 py-3 bg-white/50 border border-slate-100 rounded-2xl text-xs font-black text-slate-900 italic uppercase flex items-center gap-3 hover:border-emerald-200 transition-colors shadow-sm">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-premium p-10 rounded-[3rem] border-white/60 shadow-xl"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-widest flex items-center gap-3">
                                        <Settings className="w-6 h-6 text-indigo-600" /> Operative Dossier
                                    </h3>
                                    <p className="text-slate-500 font-bold italic text-sm mt-1">Configure your profile parameters.</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white' : 'bg-slate-950 text-white hover:bg-indigo-600 shadow-xl active:scale-95'}`}
                                >
                                    {isEditing ? 'Abort' : 'Edit Profile'}
                                </button>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: 'Full Name', key: 'name' },
                                        { label: 'Email Address', key: 'email' },
                                        { label: 'Phone Line', key: 'phone' },
                                        { label: 'Operating Sector', key: 'address' }
                                    ].map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{field.label}</label>
                                            <input
                                                value={(formData as any)[field.key]}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-black text-slate-900"
                                            />
                                        </div>
                                    ))}
                                    <div className="md:col-span-2 pt-6">
                                        <button type="submit" className="w-full h-16 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-950 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95">
                                            Commit Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center bg-slate-50/30">
                                    <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 border border-slate-100">
                                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <p className="text-lg font-black text-slate-950 uppercase italic mb-1">Dossier Encrypted</p>
                                    <p className="text-xs text-slate-500 font-bold italic">Profile is securely active on the technician grid.</p>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-premium p-10 rounded-[3rem] border-white/60 shadow-xl"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-widest flex items-center gap-3">
                                        <CreditCard className="w-6 h-6 text-indigo-600" /> Payout Uplink
                                    </h3>
                                    <p className="text-slate-500 font-bold italic text-sm mt-1">Manage where your earnings are dispatched.</p>
                                </div>
                                <button
                                    onClick={() => setIsPayoutModalOpen(true)}
                                    className="h-12 px-8 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600 shadow-xl active:scale-95"
                                >
                                    Manage Methods
                                </button>
                            </div>

                            {!payoutSettings || payoutSettings.method === 'none' ? (
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center bg-slate-50/30">
                                    <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 border border-slate-100 italic font-black text-slate-200">!</div>
                                    <p className="text-lg font-black text-slate-950 uppercase italic mb-1">No Payout Method Set</p>
                                    <p className="text-xs text-slate-500 font-bold italic">You must configure a bank or UPI account for job settlements.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            {payoutSettings.method === 'bank' ? <Landmark className="w-20 h-20" /> : <Smartphone className="w-20 h-20" />}
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Primary Channel Active</span>
                                            </div>

                                            {payoutSettings.method === 'bank' ? (
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Settlement Bank</p>
                                                        <h4 className="text-xl font-black italic">{payoutSettings.bank?.bank_name}</h4>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Account Terminal</p>
                                                            <p className="font-mono text-lg font-bold tracking-wider">{payoutSettings.bank?.account_number}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">IFSC Vector</p>
                                                            <p className="font-bold italic uppercase">{payoutSettings.bank?.ifsc_code}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Unified Link (UPI)</p>
                                                        <h4 className="text-2xl font-black italic tracking-tight">{payoutSettings.upi?.upi_id}</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="glass-premium p-6 rounded-3xl border-slate-100 flex flex-col justify-center">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 uppercase italic leading-none">Status Link</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Secured & Verified</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold italic leading-relaxed">
                                            All settlements are currently dispatched at 21:00 HRS IST on day of completion.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
                <DialogContent className="max-w-2xl rounded-[2.5rem] border-white/60 p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                    <div className="bg-slate-950 p-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Payout Configuration</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Security Level: High (AES-256)</p>
                        </div>
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Lock className="w-5 h-5" />
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePayout} className="p-8 space-y-8">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                            <button
                                type="button"
                                onClick={() => setPayoutForm({ ...payoutForm, method: 'bank' })}
                                className={`flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${payoutForm.method === 'bank' ? 'bg-white shadow-lg text-slate-950 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Bank Transfer
                            </button>
                            <button
                                type="button"
                                onClick={() => setPayoutForm({ ...payoutForm, method: 'upi' })}
                                className={`flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${payoutForm.method === 'upi' ? 'bg-white shadow-lg text-slate-950 scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                UPI Link
                            </button>
                        </div>

                        {payoutForm.method === 'bank' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
                                    <input
                                        required
                                        value={payoutForm.bank.bank_name}
                                        onChange={e => setPayoutForm({ ...payoutForm, bank: { ...payoutForm.bank, bank_name: e.target.value } })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm italic"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
                                    <input
                                        required
                                        type="password"
                                        value={payoutForm.bank.account_number}
                                        onChange={e => setPayoutForm({ ...payoutForm, bank: { ...payoutForm.bank, account_number: e.target.value } })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-mono text-sm"
                                        placeholder="Full account number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
                                    <input
                                        required
                                        value={payoutForm.bank.ifsc_code}
                                        onChange={e => setPayoutForm({ ...payoutForm, bank: { ...payoutForm.bank, ifsc_code: e.target.value.toUpperCase() } })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Holder</label>
                                    <input
                                        required
                                        value={payoutForm.bank.account_holder}
                                        onChange={e => setPayoutForm({ ...payoutForm, bank: { ...payoutForm.bank, account_holder: e.target.value } })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm italic"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Virtual Payment Address (UPI ID)</label>
                                <input
                                    required
                                    value={payoutForm.upi.upi_id}
                                    onChange={e => setPayoutForm({ ...payoutForm, upi: { ...payoutForm.upi, upi_id: e.target.value } })}
                                    placeholder="yourname@upi"
                                    className="w-full h-14 px-6 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-lg italic"
                                />
                            </div>
                        )}

                        <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-[2rem] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg"><Lock className="w-4 h-4" /></div>
                                <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest">Security Clearance Required</h4>
                            </div>
                            <input
                                required
                                type="password"
                                value={payoutForm.password}
                                onChange={e => setPayoutForm({ ...payoutForm, password: e.target.value })}
                                placeholder="Verify with your session password"
                                className="w-full h-14 px-6 bg-white border-2 border-indigo-200 rounded-2xl focus:border-indigo-600 outline-none font-bold transition-all shadow-inner"
                            />
                        </div>

                        <button
                            disabled={submittingPayout}
                            className="w-full h-16 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {submittingPayout ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Secure Update & Encrypt <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-white/60 p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                    <div className="bg-slate-950 p-10 text-center">
                        <Lock className="h-16 w-16 text-indigo-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Security Protocol</h2>
                    </div>
                    <div className="p-10 text-center space-y-6">
                        <p className="text-slate-500 font-bold italic leading-relaxed text-sm">
                            Password resets are currently handled via administrative uplink. Please contact HQ support for credentials modification.
                        </p>
                        <button
                            onClick={() => setIsPasswordModalOpen(false)}
                            className="w-full h-14 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all"
                        >
                            Back to Command
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TechnicianProfile;
