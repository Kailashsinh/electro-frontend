import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, Mail, Phone, MapPin, Camera, Edit2, LogOut, Shield, Star, Wallet, CreditCard, ChevronRight, Calendar, CheckCircle, Settings, Award } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock } from "lucide-react";

const ProfilePage: React.FC = () => {
  const { user, role, refreshProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: ''
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast({ title: 'Password Changed Successfully' });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to change password', variant: 'destructive' });
    }
  };

  React.useEffect(() => { refreshProfile(); }, [refreshProfile]);

  React.useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await authApi.updateProfile({ profile_picture: reader.result as string });
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
      await authApi.updateProfile(formData);
      await refreshProfile();
      setIsEditing(false);
      toast({ title: 'Profile Updated' });
    } catch { toast({ title: 'Update Failed', variant: 'destructive' }); }
  };

  if (!user) return <LoadingSkeleton rows={5} />;

  const freeVisits = user.subscription ? (
    user.subscription.plan === 'premium' ? 2 - (user.subscription.free_visits_used || 0) :
      user.subscription.plan === 'premium_pro' ? 6 - (user.subscription.free_visits_used || 0) : 0
  ) : 0;

  const totalPossibleVisits = user.subscription?.plan === 'premium' ? 2 : user.subscription?.plan === 'premium_pro' ? 6 : 1;
  const visitProgress = (freeVisits / totalPossibleVisits) * 100;

  // Use registered_at for original joining date
  const joiningDate = user.registered_at || user.createdAt || user.created_at;
  const formattedJoiningDate = joiningDate
    ? new Date(joiningDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24">
      {/* Premium Header Architecture */}
      <div className="relative min-h-[420px] md:h-80 bg-slate-950 overflow-hidden pt-16 md:pt-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 md:h-full flex flex-col md:justify-end pb-20 md:pb-12 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
            {/* Elegant Avatar Section */}
            <div className="relative group mx-auto md:mx-0">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] overflow-hidden border-[6px] md:border-[8px] border-white/10 backdrop-blur-md shadow-2xl relative bg-white/5"
              >
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white italic">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-10 h-10 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
              <div
                className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-2.5 md:p-3 rounded-2xl shadow-xl border-4 border-slate-950 cursor-pointer hover:bg-indigo-400 transition-transform hover:rotate-12"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>

            {/* Profile Identity */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter italic uppercase break-words leading-tight">
                  {user.name}
                </h1>
                <span className="inline-flex px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/30 backdrop-blur-md w-fit mx-auto md:mx-0 whitespace-nowrap">
                  {role} PROTOCOL
                </span>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-slate-400 font-bold italic text-sm md:text-base">
                <div className="flex items-center gap-2 max-w-[250px] md:max-w-none"><Mail className="w-4 h-4 text-indigo-400 shrink-0" /> <span className="truncate">{user.email}</span></div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400 shrink-0" /> Joined {formattedJoiningDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* Dashboard Hub (Stats) */}
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: 'Wallet Balance', value: `₹${user.wallet_balance || 0}`, icon: Wallet, color: 'indigo', detail: 'Available Credits' },
                { label: 'Loyalty Points', value: user.loyalty_points || 0, icon: Star, color: 'amber', detail: 'Reward Status' },
                { label: 'Active Plan', value: user.subscription?.plan?.replace('_', ' ') || 'Gold', icon: Shield, color: 'emerald', detail: user.subscription ? `Expires ${new Date(user.subscription.end_date).toLocaleDateString()}` : 'Standard Membership' },
                { label: 'Free Visits', value: freeVisits, icon: CheckCircle, color: 'blue', detail: `${freeVisits} of ${totalPossibleVisits} remaining`, progress: true }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-8 -mt-8 md:-mr-12 md:-mt-12 transition-opacity group-hover:opacity-100`} />
                  <div className="relative z-10">
                    <div className={`p-3 md:p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl md:rounded-2xl w-fit mb-4 md:mb-6`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase">{stat.value}</h3>
                    <p className="text-xs font-bold text-slate-500 mt-2 italic">{stat.detail}</p>
                    {stat.progress && (
                      <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`}
                          style={{ width: `${visitProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Detailed Configuration (Form) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 italic uppercase underline decoration-indigo-500 decoration-4 underline-offset-4 md:underline-offset-8">Account Parameters</h2>
                  <p className="text-slate-500 font-bold italic mt-2 md:mt-4 uppercase text-[10px] tracking-widest">Protocol modification terminal</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] md:text-xs tracking-widest hover:bg-black hover:shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleUpdate}
                    className="space-y-6 md:space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      {[
                        { label: 'Full Identity', field: 'name', type: 'text' },
                        { label: 'Comms Link (Email)', field: 'email', type: 'email' },
                        { label: 'Physical Interface (Phone)', field: 'phone', type: 'tel' },
                        { label: 'Installation Node (Address)', field: 'address', type: 'text', full: true },
                      ].map((input, i) => (
                        <div key={i} className={`${input.full ? 'md:col-span-2' : ''} space-y-2 md:space-y-3`}>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{input.label}</label>
                          <input
                            value={(formData as any)[input.field]}
                            onChange={e => setFormData({ ...formData, [input.field]: e.target.value })}
                            className="w-full h-14 md:h-16 px-5 md:px-6 rounded-xl md:rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500/50 focus:bg-white outline-none transition-all font-bold italic text-slate-900 text-sm md:text-base"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-4 pt-6 md:pt-8 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 md:px-8 py-3 md:py-4 text-slate-500 font-black uppercase italic text-[10px] md:text-xs tracking-widest hover:text-slate-900 transition-colors"
                      >
                        Abort
                      </button>
                      <button
                        type="submit"
                        className="px-8 md:px-12 py-3 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase italic text-[10px] md:text-xs tracking-widest shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
                      >
                        Execute
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
                  >
                    {[
                      { label: 'Register Email', val: user.email, icon: Mail },
                      { label: 'Direct Line', val: user.phone, icon: Phone },
                      { label: 'Geo Location', val: user.address || 'No Coordinate Set', icon: MapPin, full: true },
                    ].map((detail, i) => (
                      <div key={i} className={`${detail.full ? 'md:col-span-2' : ''} group p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-indigo-500/20 hover:bg-indigo-50/10 transition-all`}>
                        <div className="flex items-center gap-3 mb-2 md:mb-3">
                          <detail.icon className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{detail.label}</span>
                        </div>
                        <p className="text-base md:text-lg font-black text-slate-900 italic break-words" title={detail.val}>{detail.val}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Operations & Security (Actions) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8 order-1 lg:order-2">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-50">
                <h3 className="text-lg font-black text-slate-900 italic uppercase">Security Wing</h3>
                <p className="text-slate-400 font-bold italic text-[10px] tracking-widest mt-1">Maintenance protocols</p>
              </div>
              <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all text-slate-700 font-black uppercase italic text-[10px] md:text-xs tracking-widest"
                >
                  <div className="p-2 md:p-3 bg-slate-100 text-slate-600 rounded-lg md:rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm shrink-0">
                    <Lock className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  System Auth Reset
                  <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>
                <button
                  onClick={logout}
                  className="w-full group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-red-50 transition-all text-red-600 font-black uppercase italic text-[10px] md:text-xs tracking-widest"
                >
                  <div className="p-2 md:p-3 bg-red-100 text-red-600 rounded-lg md:rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm shrink-0">
                    <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  Terminate Session
                </button>
              </div>
            </div>

            {/* Achievement / Status Card */}
            <div className="bg-gradient-to-br from-slate-900 to-black rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-indigo-500/20 rounded-full blur-[60px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <Award className="w-8 h-8 md:w-10 md:h-10 text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-black italic uppercase tracking-tight text-sm md:text-base">Prime Status</h4>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest">Verified ElectroCare Identity</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] md:text-xs font-bold italic">
                    <span className="text-slate-400">Security Clearance</span>
                    <span className="text-emerald-400 uppercase">Tier 1 Active</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full">
                    <div className="h-full w-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-2xl max-w-[90vw] md:max-w-md p-6">
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl md:text-2xl font-black italic uppercase text-slate-900">Auth Synchronization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 md:space-y-6 py-4 md:py-6">
            {[
              { label: 'Current Key', field: 'currentPassword' },
              { label: 'New Command Key', field: 'newPassword' },
              { label: 'Confirm New Key', field: 'confirmPassword' },
            ].map((input, i) => (
              <div key={i} className="space-y-1.5 md:space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{input.label}</label>
                <input
                  type="password"
                  className="w-full h-12 md:h-14 px-4 md:px-5 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-mono text-sm"
                  value={(passwordForm as any)[input.field]}
                  onChange={e => setPasswordForm({ ...passwordForm, [input.field]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="p-0 flex-row justify-end gap-4">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-4 md:px-6 py-2 md:py-3 text-slate-500 font-black uppercase italic text-[10px] md:text-xs tracking-widest"
            >
              Abort
            </button>
            <button
              onClick={handleChangePassword}
              className="px-6 md:px-8 py-2 md:py-3 bg-slate-900 text-white rounded-xl font-black uppercase italic text-[10px] md:text-xs tracking-widest shadow-lg hover:bg-black transition-all"
            >
              Update Auth
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
