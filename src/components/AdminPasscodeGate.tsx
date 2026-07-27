import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";
import Logo from "./Logo";

interface AdminPasscodeGateProps {
  onSuccess: () => void;
}

export default function AdminPasscodeGate({ onSuccess }: AdminPasscodeGateProps) {
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Secure simple verification
    if (passcode === "nilachal123") {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setError("Incorrect passcode. Please check and try again.");
      // Auto shake feedback or clear input
      setPasscode("");
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-stone-100"
      id="admin-passcode-gate"
    >
      <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Glow ambient highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBE0B]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFBE0B]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
          
          {/* Circular logo frame */}
          <div className="relative">
            <Logo size="xl" className="bg-stone-950 p-2 rounded-full border border-stone-800 shadow-xl" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 p-1.5 rounded-full border-2 border-stone-900 shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-stone-100">
              Admin Authentication
            </h2>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Access to core design blueprints, contractor matrices, invoicing ledgers, and inventory controls is restricted.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4 pt-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-bold text-stone-500 font-mono">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-950/80 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 outline-none transition font-mono text-center tracking-widest text-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/30 rounded-xl text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-950/50 border border-green-900/30 rounded-xl text-xs text-green-400 animate-in fade-in">
                <CheckCircle className="w-4 h-4 shrink-0 text-green-500 animate-bounce" />
                <span className="font-semibold">Authentication success! Unlocking workspace...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={success || !passcode}
              className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md ${
                success
                  ? "bg-green-500 text-stone-950"
                  : passcode
                  ? "bg-amber-500 hover:bg-[#FFBE0B] text-stone-950 font-black cursor-pointer shadow-amber-500/10"
                  : "bg-stone-800 text-stone-500 cursor-not-allowed"
              }`}
            >
              <span>{success ? "Success" : "Unlock Workspace"}</span>
              {!success && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>



        </div>
      </div>
    </div>
  );
}
