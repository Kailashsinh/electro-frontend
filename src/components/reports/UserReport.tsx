import React, { useState, useEffect } from 'react';
import { adminApi } from '@/api/admin';
import ReportFilters, { FilterConfig } from './ReportFilters';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Wallet, Trophy, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

const UserReport: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
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
                { label: 'Verified', value: 'true' },
                { label: 'Unverified', value: 'false' }
            ]
        },
        { id: 'wallet', label: 'Wallet Balance', type: 'number-range' },
        { id: 'points', label: 'Loyalty Points', type: 'number-range' },
        {
            id: 'subscriptionStatus',
            label: 'Subscription',
            type: 'select',
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Expired', value: 'Expired' },
                { label: 'None', value: 'None' }
            ]
        },
        { id: 'city', label: 'City Search', type: 'text' },
        { id: 'search', label: 'Global Search', type: 'text', placeholder: 'Name/Email/Phone' }
    ];

    const fetchData = async (appliedFilters: any) => {
        setLoading(true);
        try {
            const res = await adminApi.getUserRosterReport({ ...filters, ...appliedFilters });
            setData(res.data.data);
            setTotalCount(res.data.totalCount);
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
            csvContent += "Name,Email,Phone,Verified,Wallet,Points,Joined\r\n";
            data.forEach(item => {
                csvContent += `"${item.name}","${item.email}","${item.phone}",${item.isVerified},${item.wallet_balance},${item.loyalty_points},"${new Date(item.createdAt).toLocaleDateString()}"\r\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `user_report_${new Date().toISOString().split('T')[0]}.csv`);
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
            doc.text("USER ROSTER DOSSIER", pageWidth - 14, 20, { align: 'right' });

            // Sub-header Divider
            doc.setDrawColor(79, 70, 229); // indigo-600
            doc.setLineWidth(0.5);
            doc.line(14, 28, pageWidth - 14, 28);

            // Generation Intel
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(`SECURITY LEVEL: INTERNAL USE ONLY`, 14, 34);
            doc.text(`EXTRACTED: ${new Date().toLocaleString().toUpperCase()}`, pageWidth - 14, 34, { align: 'right' });

            // Stats Summary Section
            doc.setFillColor(248, 250, 252); // slate-50
            doc.rect(14, 38, pageWidth - 28, 15, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(15, 23, 42);
            doc.text(`TOTAL ENTITIES: ${totalCount}`, 20, 48);
            doc.text(`VERIFIED NODES: ${data.filter(u => u.isVerified).length}`, pageWidth / 2, 48, { align: 'center' });
            doc.text(`TOTAL FLOAT: INR ${data.reduce((acc, u) => acc + u.wallet_balance, 0).toLocaleString()}`, pageWidth - 20, 48, { align: 'right' });

            const head = [['Identity', 'Contact Info', 'Logic Unit', 'Verity', 'Wallet', 'XP']];
            const body = data.map(item => [
                item.name.toUpperCase(),
                `${item.email.toUpperCase()}\n${item.phone}`,
                item.subStatus?.toUpperCase() || 'NONE',
                item.isVerified ? 'VERIFIED' : 'PENDING',
                `₹${item.wallet_balance}`,
                `${item.loyalty_points} XP`
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

            doc.save(`user_intel_${new Date().toISOString().split('T')[0]}.pdf`);
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
                    { label: 'Total Base', value: totalCount, icon: Users, color: 'indigo' },
                    { label: 'Verified Nodes', value: data.filter(u => u.isVerified).length, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Total Float', value: `₹${data.reduce((acc, u) => acc + u.wallet_balance, 0).toLocaleString()}`, icon: Wallet, color: 'blue' },
                    { label: 'Loyalty Surge', value: data.reduce((acc, u) => acc + u.loyalty_points, 0).toLocaleString(), icon: Trophy, color: 'amber' },
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
                                {['User Identity', 'Verification', 'Wallet', 'Points', 'Subscription', 'Joined'].map((h) => (
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
                                                <span className="text-[9px] text-slate-400 font-bold">{item.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 ${item.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-lg text-[9px] font-black uppercase`}>
                                                {item.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black text-slate-950 uppercase italic tracking-tight">₹{item.wallet_balance}</td>
                                        <td className="px-6 py-4 text-[11px] font-black text-indigo-600 uppercase italic tracking-tight">{item.loyalty_points} XP</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 ${item.subStatus === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'} rounded-lg text-[9px] font-black uppercase`}>
                                                {item.subStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-slate-400 font-mono">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400 text-xs font-bold italic">
                                        No user entities detected in this sector.
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

export default UserReport;
