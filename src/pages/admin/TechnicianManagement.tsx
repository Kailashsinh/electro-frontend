import React, { useEffect, useState } from 'react';
import { adminApi } from '@/api/admin';
import { Search, UserCog, CheckCircle, XCircle, Star, Pencil, Trash2, Save, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const TechnicianManagement: React.FC = () => {
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { toast } = useToast();

    // Verification Modal State
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [selectedTech, setSelectedTech] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadTechnicians();
    }, []);

    const loadTechnicians = () => {
        setLoading(true);
        adminApi.getAllTechnicians()
            .then(res => setTechnicians(res.data))
            .finally(() => setLoading(false));
    };

    const handleVerificationAction = async (status: 'approved' | 'rejected') => {
        if (!selectedTech) return;
        try {
            await adminApi.verifyTechnician(selectedTech._id, status, status === 'rejected' ? rejectionReason : undefined);
            toast({ title: `Technician ${status}`, description: `Verification has been ${status}.` });
            setVerifyModalOpen(false);
            setRejectionReason('');
            loadTechnicians();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update verification status.', variant: 'destructive' });
        }
    };

    const openVerifyModal = (tech: any) => {
        setSelectedTech(tech);
        setVerifyModalOpen(true);
    };

    const filteredTechnicians = technicians.filter((t) =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            submitted: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles] || styles.pending}`}>
                {status?.toUpperCase()}
            </span>
        );
    };

    const getValidUrl = (path: string) => {
        if (!path) return '';
        let cleanedPath = path.trim();
        // If it's an absolute URL (handles cases like /http://...)
        if (cleanedPath.includes('://')) {
            return cleanedPath.startsWith('/') ? cleanedPath.substring(1) : cleanedPath;
        }
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
        const normalizedPath = cleanedPath.startsWith('/') ? cleanedPath.substring(1) : cleanedPath;
        return `${baseUrl}/${normalizedPath}`;
    };

    if (loading) return <LoadingSkeleton rows={5} />;

    return (
        <div className="space-y-10 pb-20 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-950 uppercase italic tracking-tight">Operative <span className="text-indigo-600">Matrix</span></h1>
                    <p className="text-slate-500 font-bold italic text-sm">Deployment clearance & certification oversight.</p>
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

            {/* Operative Data Table */}
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
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Specialization</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comm Link</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Clearance</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {filteredTechnicians.map((tech, idx) => (
                                    <motion.tr
                                        key={tech._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-black italic shadow-lg group-hover:scale-110 transition-transform">
                                                    {tech.name?.charAt(0) || 'T'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 uppercase italic tracking-tight">{tech.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tech.averageRating || 'N/A'} RATING</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {tech.skills?.slice(0, 2).map((skill: string) => (
                                                    <span key={skill} className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded-md uppercase tracking-tighter">
                                                        {skill}
                                                    </span>
                                                )) || <span className="text-slate-300 italic text-[10px]">No Skills Listed</span>}
                                                {(tech.skills?.length > 2) && <span className="text-[9px] font-black text-indigo-500">+{tech.skills.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-700">{tech.email}</p>
                                                <p className="text-xs text-slate-500 font-medium">{tech.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="scale-90 origin-left">
                                                    {getStatusBadge(tech.verificationStatus || 'pending')}
                                                </div>
                                                {(tech.verificationStatus === 'submitted' || tech.verificationStatus === 'approved') && (
                                                    <button
                                                        onClick={() => openVerifyModal(tech)}
                                                        className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-600 hover:text-white"
                                                        title="Review Documents"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { }}
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { }}
                                                    className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredTechnicians.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                            <UserCog className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">No matching operatives found</p>
                    </div>
                )}
            </motion.div>

            {/* Verification Modal */}
            <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Verify Technician: {selectedTech?.name}</DialogTitle>
                        <DialogDescription>Review the uploaded documents below.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="md:col-span-2 border p-4 rounded-lg bg-gray-50">
                            <h4 className="font-bold text-sm text-gray-500 uppercase">Aadhaar Number</h4>
                            <p className="text-2xl font-mono font-bold tracking-wider text-gray-900">{selectedTech?.aadhaar_number || 'N/A'}</p>
                        </div>

                        <div className="border p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Aadhaar Card (Front)</h4>
                            {selectedTech?.documents?.id_proof ? (
                                <div className="space-y-2">
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-48 border">
                                        <img
                                            src={getValidUrl(selectedTech.documents.id_proof)}
                                            alt="ID Proof"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <a
                                        href={getValidUrl(selectedTech.documents.id_proof)}
                                        target="_blank"
                                        className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Full Size
                                    </a>
                                </div>
                            ) : <p className="text-red-500">Not Uploaded</p>}
                        </div>

                        <div className="border p-4 rounded-lg">
                            <h4 className="font-bold mb-2">Live Photo Capture</h4>
                            {selectedTech?.documents?.live_photo ? (
                                <div className="space-y-2">
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-48 border">
                                        <img
                                            src={getValidUrl(selectedTech.documents.live_photo)}
                                            alt="Live Photo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <a
                                        href={getValidUrl(selectedTech.documents.live_photo)}
                                        target="_blank"
                                        className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Full Size
                                    </a>
                                </div>
                            ) : <p className="text-red-500">Not Captured</p>}
                        </div>

                        <div className="border p-4 rounded-lg md:col-span-2">
                            <h4 className="font-bold mb-2">Certification (Optional)</h4>
                            {selectedTech?.documents?.certification ? (
                                <div className="space-y-2">
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-64 border">
                                        <img
                                            src={getValidUrl(selectedTech.documents.certification)}
                                            alt="Certification"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <a
                                        href={getValidUrl(selectedTech.documents.certification)}
                                        target="_blank"
                                        className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" /> View Full Size
                                    </a>
                                </div>
                            ) : <p className="text-gray-400 italic">Not Uploaded</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Rejection Reason (If rejecting)</label>
                        <Textarea
                            placeholder="e.g. ID Proof is blurry..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="destructive" onClick={() => handleVerificationAction('rejected')}>
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleVerificationAction('approved')}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TechnicianManagement;
