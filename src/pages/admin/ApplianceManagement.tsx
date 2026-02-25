import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Search, MonitorSmartphone, Trash2, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ApplianceManagement: React.FC = () => {
    const [appliances, setAppliances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        loadAppliances();
    }, []);

    const loadAppliances = () => {
        setLoading(true);
        adminApi.getAllAppliances()
            .then(res => setAppliances(res.data))
            .catch(err => {
                toast({ title: 'Error', description: 'Failed to load appliances.', variant: 'destructive' });
            })
            .finally(() => setLoading(false));
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this appliance? This action cannot be undone.')) return;
        try {
            await adminApi.deleteAppliance(id);
            toast({ title: 'Appliance Deleted', description: 'Appliance has been removed successfully.' });
            loadAppliances();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete appliance.', variant: 'destructive' });
        }
    };

    const filteredAppliances = appliances.filter((app) =>
        app.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.model?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.model?.brand_id?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.serial_number?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSkeleton rows={5} />;

    return (
        <div className="space-y-10 pb-20 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-950 uppercase italic tracking-tight">Inventory <span className="text-indigo-600">Matrix</span></h1>
                    <p className="text-slate-500 font-bold italic text-sm">Asset tracking and technical history sync.</p>
                </div>
                <div className="relative group w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Scan Registry..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-6 bg-white/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold placeholder:slate-400"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
            </div>

            {/* Asset Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-premium rounded-[2.5rem] border-white/60 shadow-2xl overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Unit</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Owner</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry Index</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Commissioned</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {filteredAppliances.map((app, idx) => (
                                    <motion.tr
                                        key={app._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-sm group-hover:scale-110 transition-transform">
                                                    <MonitorSmartphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase italic tracking-tight">
                                                        {app.model?.brand_id?.name} {app.model?.name}
                                                    </p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {app.model?.brand_id?.category_id?.name || 'Technical Unit'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-black text-slate-900 uppercase italic">{app.user?.name || 'Anonymous'}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{app.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-mono text-xs font-black text-slate-600 tracking-wider">
                                                {app.serial_number || 'UNASSIGNED'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-indigo-500" />
                                                <span className="text-[10px] font-black text-slate-950 uppercase italic">
                                                    {app.purchase_date ? format(new Date(app.purchase_date), 'MMM d, yyyy') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {app.invoice_url ? (
                                                <a
                                                    href={app.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
                                                >
                                                    <FileText className="w-3 h-3" /> Dossier
                                                </a>
                                            ) : (
                                                <span className="text-[10px] font-black text-slate-300 uppercase italic">No Link</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button
                                                onClick={() => handleDelete(app._id)}
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

                {filteredAppliances.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <MonitorSmartphone className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">No assets identified in this sector</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ApplianceManagement;
