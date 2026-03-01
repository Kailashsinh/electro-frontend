import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Filter, X, Search, RotateCcw, Check, Download, FileText, Calendar } from 'lucide-react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig {
    id: string;
    label: string;
    type: 'select' | 'multi-select' | 'date-range' | 'text' | 'number-range' | 'status';
    options?: FilterOption[];
    placeholder?: string;
}

interface ReportFiltersProps {
    config: FilterConfig[];
    onApply: (filters: any) => void;
    onReset: () => void;
    onExport?: (format: 'pdf' | 'csv') => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ config, onApply, onReset, onExport }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [filters, setFilters] = useState<any>({});

    const handleFilterChange = (id: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleApply = () => {
        onApply(filters);
    };

    const handleReset = () => {
        setFilters({});
        onReset();
    };

    const removeFilter = (id: string) => {
        const newFilters = { ...filters };
        delete newFilters[id];
        setFilters(newFilters);
    };

    const activeFiltersCount = Object.keys(filters).length;

    return (
        <div className="w-full space-y-4">
            {/* Filter Header / Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all group"
                >
                    <div className={`p-2 rounded-lg ${activeFiltersCount > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Filter className="w-4 h-4" />
                    </div>
                    <span className="font-black text-slate-900 uppercase italic tracking-tight text-sm">
                        Localized Tactical Filters
                    </span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {activeFiltersCount}
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="Reset All"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    {onExport && (
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => onExport('pdf')}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
                            >
                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PDF</span>
                            </button>
                            <div className="w-px h-4 bg-slate-200" />
                            <button
                                onClick={() => onExport('csv')}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
                            >
                                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CSV</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expandable Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-premium p-8 rounded-[2rem] border-white/60 shadow-xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {config.map((item) => (
                                    <div key={item.id} className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            {item.label}
                                        </label>

                                        {item.type === 'text' && (
                                            <div className="relative group">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={filters[item.id] || ''}
                                                    onChange={(e) => handleFilterChange(item.id, e.target.value)}
                                                    placeholder={item.placeholder || 'Search...'}
                                                    className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                                />
                                            </div>
                                        )}

                                        {item.type === 'select' && (
                                            <select
                                                value={filters[item.id] || ''}
                                                onChange={(e) => handleFilterChange(item.id, e.target.value)}
                                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="">All {item.label}s</option>
                                                {item.options?.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {item.type === 'date-range' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative group">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={filters[`${item.id}_start`] || ''}
                                                        onChange={(e) => handleFilterChange(`${item.id}_start`, e.target.value)}
                                                        className="w-full h-12 pl-8 pr-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                                    <input
                                                        type="date"
                                                        value={filters[`${item.id}_end`] || ''}
                                                        onChange={(e) => handleFilterChange(`${item.id}_end`, e.target.value)}
                                                        className="w-full h-12 pl-8 pr-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {item.type === 'number-range' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={filters[`${item.id}_min`] || ''}
                                                    onChange={(e) => handleFilterChange(`${item.id}_min`, e.target.value)}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={filters[`${item.id}_max`] || ''}
                                                    onChange={(e) => handleFilterChange(`${item.id}_max`, e.target.value)}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleApply}
                                    className="flex items-center gap-2 px-8 py-3 bg-slate-950 text-white rounded-xl shadow-lg shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all group"
                                >
                                    <Check className="w-4 h-4 text-indigo-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Apply Tactical Matrix</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Applied Filter Chips */}
            <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([id, value]) => {
                    if (!value) return null;
                    const configItem = config.find(c => c.id === id || id.startsWith(c.id));
                    if (!configItem) return null;

                    return (
                        <div key={id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-white border border-slate-200 rounded-full text-[9px] font-bold text-slate-600 shadow-sm">
                            <span className="text-slate-400 uppercase tracking-tighter">{configItem.label}:</span>
                            <span className="text-slate-900">{value as string}</span>
                            <button
                                onClick={() => removeFilter(id)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportFilters;
