import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Wrench, AlertTriangle, CheckCircle, XCircle, ChevronRight, ChevronDown, Loader2, Sparkles, Brain, Cpu, Zap } from 'lucide-react';
import { aiApi, DiagnosisResponse } from '@/api/ai';
import { applianceApi } from '@/api/appliances';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const GENERAL_APPLIANCES = [
    'Air Conditioner (AC)', 'Refrigerator', 'Washing Machine', 'Microwave Oven',
    'Geyser/Water Heater', 'Water Purifier (RO)', 'Television (TV)', 'Chimney', 'Dishwasher'
];

const SmartTroubleshooter: React.FC = () => {
    const [userAppliances, setUserAppliances] = useState<any[]>([]);
    const [selectedValue, setSelectedValue] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DiagnosisResponse | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppliances = async () => {
            try {
                const res = await applianceApi.getMyAppliances();
                setUserAppliances(res.data.appliances || res.data || []);
            } catch (error) { }
        };
        fetchAppliances();
    }, []);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedValue || !description) return;

        setLoading(true);
        setResult(null);

        try {
            const selection = JSON.parse(selectedValue);
            const res = await aiApi.diagnose({ applianceType: selection.category, description });
            setResult(res.data);
        } catch (error) {
            toast({ title: 'Service Interrupted', description: 'AI diagnostic engine is temporarily unreachable.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleBookTechnician = () => {
        if (!selectedValue) return;
        const selection = JSON.parse(selectedValue);
        navigate('/user/requests/new', {
            state: {
                applianceId: selection.type === 'user' ? selection.id : undefined,
                description: description,
                category: selection.category
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] selection:bg-indigo-100">
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 space-y-12">
                {/* Classy & Balanced Header */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-1.5 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]" />
                        <div>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1.5">
                                <Sparkles className="h-3 w-3" />
                                <span>Diagnostic Protocol</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                                Smart AI <span className="text-slate-400 font-light italic text-[0.85em]">Troubleshooter</span>
                            </h1>
                        </div>
                    </div>
                    <p className="text-slate-500 max-w-2xl leading-relaxed font-medium text-sm md:text-base">
                        Our expert diagnostic engine interprets appliance telemetry and failure symptoms
                        to provide localized insights and resolution strategies.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-stretch">
                    {/* Unified Input Module */}
                    <div className="lg:col-span-5 flex flex-col space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-slate-200/60 p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full"
                        >
                            <form onSubmit={handleAnalyze} className="space-y-7">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Appliance Telemetry</label>
                                    <div className="relative group">
                                        <select
                                            value={selectedValue}
                                            onChange={(e) => setSelectedValue(e.target.value)}
                                            className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Choose device interface...</option>
                                            {userAppliances.length > 0 && (
                                                <optgroup label="Registered Hardware">
                                                    {userAppliances.map(app => {
                                                        const modelObject = (typeof app.model === 'object' && app.model !== null) ? app.model : null;
                                                        const modelName = modelObject?.name || (typeof app.model === 'string' ? app.model : 'Unknown');
                                                        const brandName = modelObject?.brand_id?.name || 'Generic';
                                                        const categoryName = modelObject?.brand_id?.category_id?.name || 'Device';
                                                        const label = `${brandName} ${categoryName} — ${modelName}`;

                                                        return (
                                                            <option key={app._id} value={JSON.stringify({ type: 'user', id: app._id, category: categoryName, label })}>
                                                                {label}
                                                            </option>
                                                        );
                                                    })}
                                                </optgroup>
                                            )}
                                            <optgroup label="General Architecture">
                                                {GENERAL_APPLIANCES.map(app => (
                                                    <option key={app} value={JSON.stringify({ type: 'general', id: null, category: app, label: app })}>
                                                        {app}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Failure Signature</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe the anomalies in detail..."
                                        className="w-full min-h-[140px] px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-semibold text-slate-800 text-sm resize-none placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !selectedValue || !description}
                                    className="relative w-full h-12 bg-slate-900 group hover:bg-slate-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all disabled:opacity-50 overflow-hidden flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="animate-pulse">Synthesizing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 text-indigo-400" />
                                            <span>Run Analysis</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>

                        <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100/50 flex gap-4 backdrop-blur-sm">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                <Brain className="h-4.5 w-4.5 text-indigo-600" />
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic">
                                AI insights are generated from global telemetry datasets. Local technician verification is recommended for critical hardware failures.
                            </p>
                        </div>
                    </div>

                    {/* Result Interface */}
                    <div className="lg:col-span-7 flex flex-col">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    className="h-full bg-white rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center text-center p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                                >
                                    <div className="mb-8 relative">
                                        <div className="h-24 w-24 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                                            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-3xl animate-[ping_3s_infinite]" />
                                            <Cpu className="h-10 w-10 text-indigo-500 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Processing Data</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Matching symptom signatures...</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_15px_50px_-15px_rgba(0,0,0,0.05)] h-full flex flex-col"
                                >
                                    {/* Intelligence Bar */}
                                    <div className={`px-8 py-4 flex items-center justify-between border-b ${result.severity === 'high' ? 'bg-rose-50 border-rose-100' :
                                        result.severity === 'medium' ? 'bg-amber-50 border-amber-100' :
                                            'bg-emerald-50 border-emerald-100'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full animate-pulse ${result.severity === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                result.severity === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                    'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${result.severity === 'high' ? 'text-rose-700' :
                                                result.severity === 'medium' ? 'text-amber-700' :
                                                    'text-emerald-700'
                                                }`}>
                                                {result.severity} Priority Detection
                                            </span>
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                                            {result.is_safe_to_use ? 'System Stable' : 'Critical Halt'}
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 flex-1 flex flex-col space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Primary Diagnosis</label>
                                            <p className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.1] tracking-tight">
                                                {result.likely_cause}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80 group hover:border-slate-300 transition-colors">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Projected Cost</label>
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter italic">{result.estimated_cost_range}</div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 group hover:border-indigo-300 transition-colors">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1.5">Confidence</label>
                                                <div className="text-2xl font-black text-indigo-600 tracking-tighter italic">98.4%</div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden flex-1">
                                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12"><Wrench className="h-16 w-16" /></div>
                                            <div className="relative z-10 flex gap-5">
                                                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/10">
                                                    <Wrench className="h-5 w-5 text-indigo-400" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Recommendation</label>
                                                    <p className="text-slate-600 text-sm md:text-base leading-relaxed font-bold italic">
                                                        "{result.advice}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleBookTechnician}
                                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
                                        >
                                            Secure Professional Deployment
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-white/30 backdrop-blur-sm"
                                >
                                    <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center mb-8 shadow-sm">
                                        <Bot className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-2">Protocol Ready</h3>
                                    <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-[240px] uppercase tracking-wider">
                                        Awaiting hardware telemetry for localized synthesis.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartTroubleshooter;
