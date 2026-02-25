import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/api/admin';
import { Search, CreditCard, Landmark, Smartphone, CheckCircle, Clock, ExternalLink, IndianRupee, User, Copy, Check } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';

const PayoutManagement: React.FC = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadPayouts();
    }, []);

    const loadPayouts = () => {
        setLoading(true);
        adminApi.getTechnicianPayouts()
            .then(res => setPayouts(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: 'Error', description: 'Failed to sync with financial grid.', variant: 'destructive' });
            })
            .finally(() => setLoading(false));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast({ title: 'Copied', description: 'Details transferred to clipboard.' });
    };

    const filteredPayouts = payouts.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.bank?.bank_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.upi?.upi_id?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSkeleton rows={6} />;

    return (
        <div className="space-y-10 pb-20 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-950 uppercase italic tracking-tight">Payout <span className="text-indigo-600">Uplink</span></h1>
                    <p className="text-slate-500 font-bold italic text-sm">Financial disbursement & technician settlement terminal.</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search Financials..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 bg-white/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:slate-400 shadow-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
            </div>

            {/* Financial Status Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-premium p-6 rounded-3xl border-white/60 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technician Liability</p>
                        <p className="text-2xl font-black text-slate-950 italic">₹{payouts.reduce((acc, p) => acc + (p.wallet_balance || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass-premium p-6 rounded-3xl border-white/60 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Channels</p>
                        <p className="text-2xl font-black text-slate-950 italic">{payouts.length} Units</p>
                    </div>
                </div>
                <div className="glass-premium p-6 rounded-3xl border-white/60 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Settlement Cycle</p>
                        <p className="text-2xl font-black text-slate-950 italic">21:00 HRS</p>
                    </div>
                </div>
            </div>

            {/* Payout Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-premium rounded-[2.5rem] border-white/60 shadow-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operative</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settlement Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Terminal Balance</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {filteredPayouts.map((p, idx) => (
                                    <motion.tr
                                        key={p._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black italic shadow-lg">
                                                    {p.name?.charAt(0) || 'T'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase italic tracking-tight">{p.name}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{p.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {p.method === 'bank' ? (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 shadow-sm">
                                                        <Landmark className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Bank</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-100 shadow-sm">
                                                        <Smartphone className="w-3 h-3" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">UPI</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {p.method === 'bank' ? (
                                                <div className="space-y-1 group/details relative">
                                                    <p className="text-sm font-black text-slate-950 italic">{p.bank?.bank_name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xs font-mono font-bold text-slate-600 tracking-wider">A/C: {p.bank?.account_number}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(p.bank?.account_number, p._id + 'ac')}
                                                            className="opacity-0 group-hover/details:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                                                        >
                                                            {copiedId === p._id + 'ac' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                                        IFSC: {p.bank?.ifsc_code}
                                                        <button
                                                            onClick={() => copyToClipboard(p.bank?.ifsc_code, p._id + 'ifsc')}
                                                            className="opacity-0 group-hover/details:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                                                        >
                                                            {copiedId === p._id + 'ifsc' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                        </button>
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="group/details relative">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-black text-slate-950 italic tracking-tight uppercase">{p.upi?.upi_id}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(p.upi?.upi_id, p._id + 'upi')}
                                                            className="opacity-0 group-hover/details:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
                                                        >
                                                            {copiedId === p._id + 'upi' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-900 italic leading-none">₹{p.wallet_balance?.toLocaleString() || 0}</span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Pending Clearance</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {p.is_verified ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 w-fit">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full border border-slate-200 w-fit">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={loadPayouts}
                                                className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredPayouts.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <CreditCard className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">No payout records found in grid</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PayoutManagement;
