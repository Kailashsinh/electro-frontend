import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '@/api/admin';
import { Search, Wrench, Calendar, Trash2 } from 'lucide-react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/StatusBadge';

const RequestManagement: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = () => {
        setLoading(true);
        adminApi.getAllServiceRequests()
            .then(res => setRequests(res.data))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this service request? This action cannot be undone.')) return;
        try {
            await adminApi.deleteServiceRequest(id);
            toast({ title: 'Request Deleted', description: 'Service request has been removed successfully.' });
            loadRequests();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete request.', variant: 'destructive' });
        }
    };

    const filteredRequests = requests.filter((r) =>
        r.user_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.appliance_type?.toLowerCase().includes(search.toLowerCase()) ||
        r.status?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSkeleton rows={5} />;

    return (
        <div className="space-y-10 pb-20 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-950 uppercase italic tracking-tight">Request <span className="text-indigo-600">Matrix</span></h1>
                    <p className="text-slate-500 font-bold italic text-sm">Centralized mission control for all service operations.</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Scan Requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 bg-white/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:slate-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
            </div>

            {/* Request Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-premium rounded-[2.5rem] border-white/60 shadow-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ticket</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client Operative</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Appliance Module</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Assigned</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status/Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {filteredRequests.map((req, idx) => (
                                    <motion.tr
                                        key={req._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                #{req._id.slice(-6).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black italic shadow-sm">
                                                    {req.user_id?.name?.charAt(0) || 'U'}
                                                </div>
                                                <p className="font-black text-slate-900 uppercase italic tracking-tight">{req.user_id?.name || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase italic">
                                                <Wrench className="h-4 w-4 text-indigo-500" /> {req.appliance_type}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {req.technician_id ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    <span className="text-sm font-black text-slate-900 uppercase italic">{req.technician_id.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Standby Mode</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="scale-75 origin-left">
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    <Calendar className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleDelete(req._id)}
                                                className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredRequests.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <Wrench className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">No active mission logs matching criteria</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default RequestManagement;
