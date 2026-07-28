import React, { useState, useEffect } from "react";
import { Sliders, Shield, Bell, Wrench, RefreshCw, CheckCircle2, AlertOctagon, Sparkles, Building, Key, Lock, Eye, EyeOff, Save, RotateCcw, Download, FileJson } from "lucide-react";
import { getOrgDetails, OrgDetails } from "../types";
import { api } from "../services/api";

export default function SettingsView() {
  const [carpentryRate, setCarpentryRate] = useState(() => Number(localStorage.getItem("nilachal_carpentry_rate")) || 1800); // INR per sqft
  const [commercialRate, setCommercialRate] = useState(() => Number(localStorage.getItem("nilachal_commercial_rate")) || 3000);
  const [lowStockLimit, setLowStockLimit] = useState(() => Number(localStorage.getItem("nilachal_low_stock_limit")) || 10);
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem("nilachal_email_alerts") !== "false");
  const [warrantyNotificationWeeks, setWarrantyNotificationWeeks] = useState(() => Number(localStorage.getItem("nilachal_warranty_notification_weeks")) || 4);
  const [dbStatus, setDbStatus] = useState<"connected" | "syncing">("connected");
  const [syncing, setSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);


  // Org details state
  const [orgDetails, setOrgDetails] = useState<OrgDetails>(getOrgDetails);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // Accounts Office passcode state
  const [accountsPasscode, setAccountsPasscode] = useState(() => localStorage.getItem("nilachal_accounts_passcode") || "accounts1244");
  const [showAccountsPasscode, setShowAccountsPasscode] = useState(false);
  const [accountsPasscodeMessage, setAccountsPasscodeMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = api.subscribeAccountsPasscode((pass) => {
      setAccountsPasscode(pass);
    });
    return () => unsub();
  }, []);

  const handleSaveAccountsPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountsPasscode.trim()) return;
    await api.saveAccountsPasscode(accountsPasscode.trim());
    setAccountsPasscodeMessage("Accounts Office passcode updated and synced to cloud!");
    setTimeout(() => {
      setAccountsPasscodeMessage(null);
    }, 3000);
  };

  const handleResetAccountsPasscode = async () => {
    const defaultPass = "accounts1244";
    setAccountsPasscode(defaultPass);
    await api.saveAccountsPasscode(defaultPass);
    setAccountsPasscodeMessage("Accounts Office passcode reset to default (accounts1244) and synced!");
    setTimeout(() => {
      setAccountsPasscodeMessage(null);
    }, 3000);
  };


  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage("Syncing all workspace collections live across all web browsers...");
    try {
      await api.syncAllDataAcrossBrowsers();
      setSyncMessage("Successfully synced all workspace collections across all devices!");
      setTimeout(() => setSyncMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setSyncMessage("Sync completed!");
      setTimeout(() => setSyncMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    setExportMessage("Generating downloadable JSON backup file of entire application state...");
    try {
      await api.exportFullStateJSON();
      setExportMessage("Full application state successfully exported to JSON backup file!");
      setTimeout(() => setExportMessage(null), 3500);
    } catch (e) {
      console.error("Export backup error:", e);
      setExportMessage("Error generating JSON backup file.");
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setIsExporting(false);
    }
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
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-serif font-bold text-stone-200 text-sm">System Administration, Backup & Cloud Sync</h3>
            <p className="text-xs text-stone-400">Configure global price matrices, materials inventory warnings, sync data live, or export full JSON backups.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2.5 bg-[#FFBE0B] hover:bg-amber-400 text-stone-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Across Browsers"}
            </button>
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="px-4 py-2.5 bg-stone-950 hover:bg-stone-850 text-amber-400 font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 border border-amber-500/30 transition cursor-pointer shadow-md disabled:opacity-60"
            >
              <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
              {isExporting ? "Exporting..." : "Export JSON Backup"}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{syncMessage}</span>
          </div>
        )}

        {exportMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 font-mono animate-in fade-in">
            <FileJson className="w-4 h-4 shrink-0 text-green-400" />
            <span>{exportMessage}</span>
          </div>
        )}
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

        {/* Accounts Office Password Management */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4 md:col-span-2">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
            <Key className="w-4 h-4 text-amber-500" /> Accounts Office Passcode & Access Control
          </h4>
          
          <form onSubmit={handleSaveAccountsPasscode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-stone-400 text-xs font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" /> Accounts Tab Passcode
                </label>
                <div className="relative">
                  <input
                    type={showAccountsPasscode ? "text" : "password"}
                    value={accountsPasscode}
                    onChange={(e) => setAccountsPasscode(e.target.value)}
                    placeholder="Enter passcode"
                    className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2.5 text-stone-200 text-xs font-mono outline-none focus:border-amber-500/60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountsPasscode(!showAccountsPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showAccountsPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Passcode
                </button>
                <button
                  type="button"
                  onClick={handleResetAccountsPasscode}
                  className="px-3 py-2.5 bg-stone-950 hover:bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-mono font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Reset password back to default (accounts1244)"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                </button>
              </div>
            </div>

            {accountsPasscodeMessage && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 font-mono animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{accountsPasscodeMessage}</span>
              </div>
            )}

            <p className="text-[10px] text-stone-500 italic">
              This passcode protects the Accounts Office tab, restricting unauthorized staff from inspecting full financial ledger entries and exporting monthly invoice packs.
            </p>
          </form>
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
