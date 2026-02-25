import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, Shield, Crown, Sparkles, ArrowRight, CreditCard, Lock, X } from 'lucide-react';
import { subscriptionApi } from '@/api/subscriptions';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SubscriptionPage: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plans = [
    {
      id: 'gold',
      name: 'Gold',
      price: 0,
      color: 'from-amber-200 via-yellow-400 to-amber-500',
      text: 'text-amber-900',
      icon: Shield,
      features: ['Standard Priority', 'Access Nearest Technicians', 'Unlimited Service Requests', 'Pay Per Visit (₹200)'],
      highlight: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299,
      color: 'from-blue-400 via-indigo-500 to-purple-600',
      text: 'text-white',
      icon: Star,
      features: ['High Priority Status', '2 Free Visits / Month', 'No Cancellation Penalty', 'Unlimited Service Requests'],
      highlight: true,
      badge: 'BEST VALUE'
    },
    {
      id: 'premium_pro',
      name: 'Premium Pro',
      price: 849,
      color: 'from-slate-900 via-indigo-900 to-slate-900',
      text: 'text-white',
      icon: Crown,
      features: ['Top Priority (VIP)', '6 Free Visits / Month', 'No Cancellation Penalty', 'Dedicated Support'],
      highlight: false,
      cosmic: true,
      badge: 'ENTERPRISE'
    },
  ];

  const handlePlanSelect = (plan: any) => {
    if (!user) return navigate('/login');
    if (plan.id === 'gold') return;
    if (user?.subscription?.plan === plan.id) return;

    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const processPayment = async () => {
    if (!selectedPlan) return;

    setLoading(selectedPlan.id);
    setShowCheckout(false);

    try {
      // Small artificial delay for "processing" feel
      await new Promise(resolve => setTimeout(resolve, 1500));

      await subscriptionApi.buy(selectedPlan.id);
      await refreshProfile();

      toast({
        title: 'Payment Successful',
        description: `Welcome to ${selectedPlan.name} membership!`,
        className: "bg-emerald-600 text-white border-none",
      });

      setLoading(null);
    } catch (error: any) {
      toast({
        title: 'Checkout Failed',
        description: error.response?.data?.message || 'Transaction was declined by the bank',
        variant: 'destructive'
      });
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50 to-transparent -z-10" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-fuchsia-300/20 rounded-full blur-[100px] -z-10" />

      {/* Hero Header */}
      <div className="text-center pt-16 md:pt-20 pb-12 md:pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-6"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">Upgrade Your Service Protocol</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter mb-6"
        >
          Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Experience.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium"
        >
          Choose an annual subscription plan that matches your technical requirements. Secure checkout and instant activation.
        </motion.p>
      </div>

      {/* Plans Container */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className={`relative p-1 rounded-[2.5rem] ${plan.highlight ? 'ring-4 ring-amber-400/30 z-10 scale-105' : ''}`}
          >
            <div className={`relative h-full rounded-[2.3rem] overflow-hidden p-8 flex flex-col ${plan.cosmic ? 'bg-slate-900 text-white' : 'bg-white border border-gray-100 text-gray-900 shadow-xl shadow-indigo-500/5'
              }`}>

              {plan.cosmic && (
                <div className="pointer-events-none">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/30 rounded-full blur-[80px]" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
                </div>
              )}

              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-[10px] font-black px-3 py-1 rounded-b-lg tracking-widest uppercase shadow-lg shadow-amber-500/20 z-20">
                  {plan.badge}
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${plan.color} shadow-lg z-10`}>
                <plan.icon className={`h-8 w-8 ${plan.text === 'text-white' ? 'text-white' : 'text-gray-900'}`} />
              </div>

              <h3 className={`text-2xl font-black mb-2 ${plan.cosmic ? 'text-white' : 'text-gray-900'} z-10`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6 z-10">
                <span className={`text-4xl font-black ${plan.cosmic ? 'text-white' : 'text-gray-900'}`}>₹{plan.price}</span>
                <span className={`text-sm font-bold opacity-60 ${plan.cosmic ? 'text-gray-400' : 'text-gray-500'}`}>/yr</span>
              </div>

              <div className="space-y-4 mb-8 flex-1 z-10">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.cosmic ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={`text-sm font-medium leading-relaxed ${plan.cosmic ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={loading === plan.id || user?.subscription?.plan === plan.id}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all z-20 ${plan.cosmic
                  ? 'bg-white text-slate-900 hover:bg-gray-100 shadow-lg shadow-white/10'
                  : plan.highlight
                    ? 'bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-xl hover:shadow-black/20'
                    : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {loading === plan.id ? (
                  <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : user?.subscription?.plan === plan.id || (!user?.subscription?.plan && plan.id === 'gold') ? (
                  'Active Plan'
                ) : plan.id === 'gold' ? (
                  'Standard Included'
                ) : (
                  <>
                    Upgrade Now <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dummy Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
          <div className="bg-slate-950 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield className="w-32 h-32" />
            </div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight">Secure <span className="text-indigo-400">Checkout</span></h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Encrypted Terminal 08-X</p>
              </div>
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Plan Summary</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-black italic">{selectedPlan?.name}</p>
                    <p className="text-xs text-slate-400 font-bold">Priority Support Access</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-400">₹{selectedPlan?.price}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase underline decoration-indigo-400/30">Auto Re-Sycn Year</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Card Index</label>
                  <div className="relative">
                    <input
                      readOnly
                      value="4242 4242 4242 4242"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-12 font-mono text-sm outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry</label>
                    <input readOnly value="12/28" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-mono text-sm outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CVC</label>
                    <input readOnly value="***" className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 font-mono text-sm outline-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={processPayment}
                className="w-full h-16 bg-white text-slate-950 rounded-2xl font-black uppercase italic tracking-wider hover:bg-indigo-400 transition-all active:scale-95 shadow-xl shadow-indigo-500/10"
              >
                Authorize Payment
              </button>

              <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                By clicking Authorize, you agree to the protocol terms
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPage;
