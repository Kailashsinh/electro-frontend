import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import UserReport from '@/components/reports/UserReport';
import TechnicianReport from '@/components/reports/TechnicianReport';
import RevenueReport from '@/components/reports/RevenueReport';

const Reports: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'technicians' | 'revenue'>('users');

    const tabs = [
        { id: 'users', title: 'User Roster', desc: 'Personnel Database' },
        { id: 'technicians', title: 'Technicians', desc: 'Performance Matrix' },
        { id: 'revenue', title: 'Revenue', desc: 'Financial Dossier' },
    ];

    return (
        <div className="space-y-12 pb-20 relative overflow-hidden">
            {/* Intelligence Header */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-950 uppercase italic tracking-tighter flex items-center gap-3">
                        <div className="p-4 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-500/20 rotate-3">
                            <FileDown className="w-10 h-10" />
                        </div>
                        Intelligence <span className="text-indigo-600">Center</span>
                    </h1>
                    <p className="text-slate-500 font-bold italic text-sm pl-0 lg:pl-4 transition-all">
                        High-fidelity tactical data extraction and operational reporting.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-100 p-2 rounded-[2rem] border border-slate-200/60 shadow-inner">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Active Report Module */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "circOut" }}
            >
                {activeTab === 'users' && <UserReport />}
                {activeTab === 'technicians' && <TechnicianReport />}
                {activeTab === 'revenue' && <RevenueReport />}
            </motion.div>

            {/* Intelligence Message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-premium p-10 rounded-[3rem] border-white/60 shadow-2xl text-center max-w-3xl mx-auto mt-20 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                    </div>
                    <p className="text-slate-900 font-black italic text-[11px] uppercase tracking-[0.2em]">
                        System Status: Enterprise Vector Logic Engaged
                    </p>
                </div>
                <p className="text-slate-500 font-bold italic text-[10px] uppercase tracking-widest leading-relaxed">
                    Advanced aggregation filters are now processing real-time data nodes. <br />
                    Select a localized dossier above to begin tactical extraction.
                </p>
            </motion.div>
        </div>
    );
};

export default Reports;
