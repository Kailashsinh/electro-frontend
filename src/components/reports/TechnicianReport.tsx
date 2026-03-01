import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import ReportFilters, { FilterConfig } from './ReportFilters';
import { motion } from 'framer-motion';
import { Star, Briefcase, IndianRupee, UserCheck, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

const TechnicianReport: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({ avgRating: 0, totalRevenue: 0, totalJobs: 0 });
    const [filters, setFilters] = useState<any>({ page: 1, limit: 100 });

    const getBase64ImageFromURL = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute("crossOrigin", "anonymous");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = (error) => reject(error);
            img.src = url;
        });
    };

    const filterConfig: FilterConfig[] = [
        { id: 'date', label: 'Joined Date', type: 'date-range' },
        {
            id: 'verificationStatus',
            label: 'Verification',
            type: 'select',
            options: [
                { label: 'Approved', value: 'approved' },
                { label: 'Pending', value: 'pending' },
                { label: 'Rejected', value: 'rejected' }
            ]
        },
        { id: 'rating', label: 'Rating Range', type: 'number-range' },
        { id: 'jobs', label: 'Jobs Range', type: 'number-range' },
        { id: 'city', label: 'Pincode/City', type: 'text' },
        {
            id: 'availability',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Busy', value: 'busy' },
                { label: 'Inactive', value: 'inactive' }
            ]
        }
    ];

    const fetchData = async (appliedFilters: any) => {
        setLoading(true);
        try {
            const res = await adminApi.getTechnicianPerformanceReport({ ...filters, ...appliedFilters });
            setData(res.data.data);
            setStats({
                avgRating: res.data.stats.avgRating,
                totalRevenue: res.data.stats.totalRevenue,
                totalJobs: res.data.stats.totalJobs
            });
            setFilters((prev: any) => ({ ...prev, ...appliedFilters }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'pdf' | 'csv') => {
        if (data.length === 0) {
            toast({ title: 'No Data', description: 'No records found to export.', variant: 'default' });
            return;
        }

        if (format === 'csv') {
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Name,Phone,Skills,Rating,Jobs,Earnings,Status\r\n";
            data.forEach(item => {
                csvContent += `"${item.name}","${item.phone}","${item.skills?.join(';')}",${item.rating || 0},${item.completed_jobs},${item.totalEarnings},"${item.verificationStatus}"\r\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `technician_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Success', description: 'CSV Report downloaded.' });
        } else {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;

            // Branding & Header Structure
            try {
                const logoBase64 = await getBase64ImageFromURL('/loogoo.png');
                doc.addImage(logoBase64, 'PNG', 14, 10, 35, 14); // Logo on left
            } catch (err) {
                console.error("Logo fetch fail", err);
            }

            // Title on the Right
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.setTextColor(15, 23, 42); // slate-900
            doc.text("TECHNICIAN ANALYTICS", pageWidth - 14, 20, { align: 'right' });

            // Sub-header Divider
            doc.setDrawColor(79, 70, 229); // indigo-600
            doc.setLineWidth(0.5);
            doc.line(14, 28, pageWidth - 14, 28);

            // Generation Intel
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`SECURITY LEVEL: CLASSIFIED`, 14, 34);
            doc.text(`EXTRACTED: ${new Date().toLocaleString().toUpperCase()}`, pageWidth - 14, 34, { align: 'right' });

            // Stats Summary Section
            doc.setFillColor(248, 250, 252); // slate-50
            doc.rect(14, 38, pageWidth - 28, 15, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(`AVG RATING: ${stats.avgRating.toFixed(2)}`, 20, 48);
            doc.text(`TOTAL OPS: ${stats.totalJobs}`, pageWidth / 2, 48, { align: 'center' });
            doc.text(`YIELD: INR ${stats.totalRevenue.toLocaleString()}`, pageWidth - 20, 48, { align: 'right' });

            const head = [['Technician Operative', 'Skills Matrix', 'Rating', 'Jobs', 'Total Yield', 'Status']];
            const body = data.map(item => [
                item.name.toUpperCase(),
                item.skills?.slice(0, 3).join(', ').toUpperCase() || 'NONE',
                item.rating?.toFixed(1) || '0.0',
                item.completed_jobs,
                `₹${item.totalEarnings.toLocaleString()}`,
                item.verificationStatus.toUpperCase()
            ]);

            autoTable(doc, {
                head: head,
                body: body,
                startY: 60,
                theme: 'grid',
                styles: { fontSize: 7, halign: 'center', cellPadding: 2.5, font: 'helvetica' },
                headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                didDrawPage: (data) => {
                    const pageCount = doc.internal.pages.length - 1;
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`ELECTROCARE INTEL CENTER - PAGE ${data.pageNumber} OF ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                }
            });

            doc.save(`technician_intel_${new Date().toISOString().split('T')[0]}.pdf`);
            toast({ title: 'Success', description: 'Premium PDF Dossier generated.' });
        }
    };

    useEffect(() => {
        fetchData(filters);
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: Star, color: 'amber' },
                    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'indigo' },
                    { label: 'Total Earnings', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'emerald' },
                    { label: 'Force Capacity', value: data.length, icon: UserCheck, color: 'blue' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-premium p-6 rounded-3xl border-white/60 shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-black text-slate-950 uppercase italic tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <ReportFilters config={filterConfig} onApply={fetchData} onReset={() => fetchData({})} onExport={handleExport} />

            <div className="glass-premium rounded-[2.5rem] border-white/60 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                {['Technician', 'Skills', 'Rating', 'Jobs', 'Earnings', 'Status'].map((h) => (
                                    <th key={h} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item, idx) => (
                                    <motion.tr
                                        key={idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-950 uppercase italic">{item.name}</span>
                                                <span className="text-[9px] text-slate-400 font-bold">{item.email || item.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.skills?.slice(0, 2).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[8px] font-bold uppercase">{s}</span>
                                                ))}
                                                {item.skills?.length > 2 && <span className="text-[8px] font-bold text-slate-400">+{item.skills.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span className="text-[11px] font-black text-slate-950 uppercase italic">{item.rating?.toFixed(1) || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black text-slate-950 uppercase italic tracking-tight">{item.completed_jobs}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-emerald-600 uppercase italic tracking-tight">₹{item.totalEarnings.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 ${item.verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-lg text-[9px] font-black uppercase`}>
                                                {item.verificationStatus}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-xs font-bold italic">
                                        No technician nodes detected in this sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TechnicianReport;
