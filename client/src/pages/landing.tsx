import { motion } from "framer-motion";
import { Stethoscope, ShieldCheck, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background selection:bg-primary/20">
      {/* Left Panel - Branding & Visuals */}
      <div className="lg:w-[55%] relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-slate-900 to-slate-950 z-0" />
        
        {/* abstract medical tech overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-display">Aetheris</span>
        </div>

        <div className="relative z-10 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-display"
          >
            Intelligent <br/>
            <span className="text-teal-400">Clinical Charting</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-300 leading-relaxed mb-10"
          >
            Empower your practice with AI-assisted documentation, automated symptom analysis, and evidence-based clinical recommendations.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Zap className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Lightning Fast</h4>
                <p className="text-slate-400 text-xs mt-1">Reduce documentation time by 60%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Secure & Private</h4>
                <p className="text-slate-400 text-xs mt-1">Enterprise-grade data protection</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm">
          © {new Date().getFullYear()} Aetheris Medical Systems.
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 relative bg-white dark:bg-slate-950">
        
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Stethoscope className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-display">Aetheris</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-teal-100 dark:border-teal-800/50">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground font-display tracking-tight">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to securely access your patient records and AI tools.</p>
          </div>

          <Button 
            size="lg" 
            className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-gradient-to-r from-primary to-teal-500 text-white"
            onClick={() => window.location.href = '/api/login'}
          >
            Secure Provider Log In
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-8 px-4">
            By signing in, you agree to our Terms of Service and HIPAA Business Associate Agreement.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
