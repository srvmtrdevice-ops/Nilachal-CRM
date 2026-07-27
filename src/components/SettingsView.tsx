import React, { useState } from "react";
import { Sliders, Shield, Bell, Wrench, RefreshCw, CheckCircle2, AlertOctagon, Sparkles, Building } from "lucide-react";
import { getOrgDetails, OrgDetails } from "../types";

export default function SettingsView() {
  const [carpentryRate, setCarpentryRate] = useState(() => Number(localStorage.getItem("nilachal_carpentry_rate")) || 1800); // INR per sqft
  const [commercialRate, setCommercialRate] = useState(() => Number(localStorage.getItem("nilachal_commercial_rate")) || 3000);
  const [lowStockLimit, setLowStockLimit] = useState(() => Number(localStorage.getItem("nilachal_low_stock_limit")) || 10);
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem("nilachal_email_alerts") !== "false");
  const [warrantyNotificationWeeks, setWarrantyNotificationWeeks] = useState(() => Number(localStorage.getItem("nilachal_warranty_notification_weeks")) || 4);
  const [dbStatus, setDbStatus] = useState<"connected" | "syncing">("connected");
  const [syncing, setSyncing] = useState(false);

  // Org details state
  const [orgDetails, setOrgDetails] = useState<OrgDetails>(getOrgDetails);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const saveGeneralSettings = (key: string, value: any) => {
    localStorage.setItem(`nilachal_${key}`, String(value));
    setShowSavedBadge(true);
    const timer = setTimeout(() => setShowSavedBadge(false), 2000);
    return () => clearTimeout(timer);
  };

  const updateOrgField = (field: keyof OrgDetails, value: string) => {
    const updated = { ...orgDetails, [field]: value };
    setOrgDetails(updated);
    localStorage.setItem("nilachal_org_details", JSON.stringify(updated));
    setShowSavedBadge(true);
    // Custom window event to notify other components instantly of organization data updates
    window.dispatchEvent(new Event("nilachal_org_details_updated"));
    const timer = setTimeout(() => setShowSavedBadge(false), 2000);
    return () => clearTimeout(timer);
  };


  return (
    <div className="space-y-6">
      {/* Intro block */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">System Administration & Templates</h3>
          <p className="text-xs text-stone-400">Configure global price matrices, materials inventory warnings, and sync local buffers with Cloud Firestore.</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-stone-950 hover:bg-stone-850 text-amber-500 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-amber-500/30 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing Schema..." : "Force Sync Cloud DB"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Cost Calculation Settings */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Sliders className="w-4 h-4 text-amber-500" /> Architectural Estimator Rates
          </h4>
          <div className="space-y-3.5 text-xs text-stone-300">
            <div className="space-y-1">
              <label className="text-stone-400">Standard Plywood Carpentry (INR per Sq.Ft.)</label>
              <input
                type="number"
                value={carpentryRate}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1000;
                  setCarpentryRate(val);
                  saveGeneralSettings("carpentry_rate", val);
                }}
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 font-mono outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="Premium Acrylic / Duco Painting (INR per Sq.Ft.)">Premium Acrylic / Duco Painting</label>
              <input
                type="number"
                value={commercialRate}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1000;
                  setCommercialRate(val);
                  saveGeneralSettings("commercial_rate", val);
                }}
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 font-mono outline-none"
              />
            </div>
            <p className="text-[10px] text-stone-500 italic">Changing standard rates dynamically adjusts calculated projections in the Cost Estimator module.</p>
          </div>
        </div>

        {/* Inventory and Alert Rules */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Bell className="w-4 h-4 text-amber-500" /> Automated Warnings & Alerts
          </h4>
          <div className="space-y-4 text-xs text-stone-300">
            <div className="space-y-1">
              <label className="text-stone-400">Low Stock Warning Threshold (Quantity limit)</label>
              <input
                type="number"
                value={lowStockLimit}
                onChange={(e) => {
                  const val = Number(e.target.value) || 5;
                  setLowStockLimit(val);
                  saveGeneralSettings("low_stock_limit", val);
                }}
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 font-mono outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-stone-950 border border-stone-850 rounded-lg">
              <span className="text-stone-300">Email supervisor on inventory shortage</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  const val = e.target.checked;
                  setEmailAlerts(val);
                  saveGeneralSettings("email_alerts", val);
                }}
                className="rounded border-stone-700 bg-stone-900 text-amber-500 w-4 h-4 focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-400">Warranty expiry alert window (Weeks before)</label>
              <input
                type="number"
                value={warrantyNotificationWeeks}
                onChange={(e) => {
                  const val = Number(e.target.value) || 4;
                  setWarrantyNotificationWeeks(val);
                  saveGeneralSettings("warranty_notification_weeks", val);
                }}
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 font-mono outline-none"
              />
            </div>
          </div>
        </div>

        {/* Organizational Information */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Building className="w-4 h-4 text-amber-500" /> Organizational Details & Corporate HQ Config
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-stone-400 text-xs font-semibold">Organization Name</label>
              <input
                type="text"
                value={orgDetails.name}
                onChange={(e) => updateOrgField("name", e.target.value)}
                placeholder="e.g. Nilachal Creatives"
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-400 text-xs font-semibold">Headquarters (HQ) Location</label>
              <input
                type="text"
                value={orgDetails.hq}
                onChange={(e) => updateOrgField("hq", e.target.value)}
                placeholder="e.g. Bhubaneswar HQ"
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-400 text-xs font-semibold">Phone Numbers / Hotline</label>
              <input
                type="text"
                value={orgDetails.phone}
                onChange={(e) => updateOrgField("phone", e.target.value)}
                placeholder="e.g. +91 94370 XXXXX"
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-400 text-xs font-semibold">Support Email Address</label>
              <input
                type="text"
                value={orgDetails.email}
                onChange={(e) => updateOrgField("email", e.target.value)}
                placeholder="e.g. support@nilachalcreatives.com"
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-stone-400 text-xs font-semibold">Corporate Address</label>
              <textarea
                value={orgDetails.address}
                onChange={(e) => updateOrgField("address", e.target.value)}
                placeholder="e.g. Patia, Bhubaneswar • Odisha - 751024"
                rows={2}
                className="w-full bg-stone-950 border border-stone-850 rounded-lg px-3 py-2 text-stone-200 text-xs outline-none focus:border-amber-500/50 resize-none font-sans"
              />
            </div>
          </div>
          <div className="flex justify-between items-center pt-2">
            <p className="text-[10px] text-stone-500 italic">Updating corporate metadata dynamically syncs references across all active PDF invoices, Client Portals, and support pipelines.</p>
            {showSavedBadge && (
              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-right-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> SYSTEM SAVED
              </span>
            )}
          </div>
        </div>

        {/* System Credentials Information */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Shield className="w-4 h-4 text-amber-500" /> Role-Based Security State
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 text-stone-400">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Database Handshake</span>
              <div className="flex items-center gap-1.5 mt-1.5 text-green-400 font-semibold font-mono">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Firestore Connected
              </div>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 text-stone-400">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">SuperAdmin Email</span>
              <span className="block mt-1.5 font-mono text-stone-200 text-[11px] truncate">srv.mtr.device@gmail.com</span>
            </div>
            <div className="p-3 bg-stone-950 rounded-xl border border-stone-850 text-stone-400">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">System Environment</span>
              <span className="block mt-1.5 font-semibold text-stone-300">AI Studio Sandboxed Container</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
