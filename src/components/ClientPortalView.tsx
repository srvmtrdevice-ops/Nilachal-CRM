import React, { useState, useEffect } from "react";
import { 
  Home, Clock, Download, ShieldCheck, DollarSign, Phone, Mail, 
  Send, CheckCircle, Info, Calendar, MessageSquare, Plus, AlertCircle, Wrench,
  Lock, Key, User, ShieldAlert, ArrowRight, Eye, EyeOff, ClipboardCheck
} from "lucide-react";
import { Project, Customer, ProjectUpdate, DocumentRecord, Warranty, Payment, CustomerRequirements, getOrgDetails } from "../types";
import Logo from "./Logo";

interface ClientPortalViewProps {
  projects: Project[];
  customers: Customer[];
  updates: ProjectUpdate[];
  documents: DocumentRecord[];
  warranties: Warranty[];
  payments: Payment[];
  requirements: CustomerRequirements[];
  onAddServiceRequest: (warrantyId: string, description: string) => Promise<void>;
  onContactSupport: (msg: string) => void;
}

export default function ClientPortalView({
  projects,
  customers,
  updates,
  documents,
  warranties,
  payments,
  requirements,
  onAddServiceRequest,
  onContactSupport
}: ClientPortalViewProps) {
  const [orgDetails, setOrgDetails] = useState(getOrgDetails);

  useEffect(() => {
    const handleUpdate = () => {
      setOrgDetails(getOrgDetails());
    };
    window.addEventListener("nilachal_org_details_updated", handleUpdate);
    return () => {
      window.removeEventListener("nilachal_org_details_updated", handleUpdate);
    };
  }, []);

  // Client portal authentication states
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggedInCustomer, setLoggedInCustomer] = useState<Customer | null>(() => {
    const cached = localStorage.getItem("nilachal_client_logged_in");
    if (cached) {
      try {
        return JSON.parse(cached) as Customer;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const verifiedCustomer = loggedInCustomer ? customers.find(c => c.id === loggedInCustomer.id) : null;

  // Sync selected project with client's active projects
  const clientProjects = verifiedCustomer ? projects.filter(p => p.customerId === verifiedCustomer.id) : [];
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (clientProjects.length > 0) {
      // If the current selection is invalid for this customer, default to their first project
      if (!selectedProjectId || !clientProjects.some(p => p.id === selectedProjectId)) {
        setSelectedProjectId(clientProjects[0].id);
      }
    } else {
      setSelectedProjectId("");
    }
  }, [verifiedCustomer, projects, selectedProjectId]);

  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketWarrantyId, setTicketWarrantyId] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [supportMsg, setSupportMsg] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeCustomer = activeProject ? customers.find(c => c.id === activeProject.customerId) : null;

  // Filter lists for current project
  const projectUpdates = updates.filter(u => u.projectId === selectedProjectId);
  const projectDocs = documents.filter(d => d.projectId === selectedProjectId);
  const projectWarranties = warranties.filter(w => w.projectId === selectedProjectId);
  const projectPayments = payments.filter(p => p.projectId === selectedProjectId);

  // Financial sums
  const totalInvoiced = projectPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = projectPayments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = totalInvoiced - totalPaid;

  const currentProgress = projectUpdates[0]?.progressPercentage || 0;

  const clientRequirements = verifiedCustomer ? requirements.find(r => r.customerId === verifiedCustomer.id) : null;

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription || !ticketWarrantyId) return;

    try {
      await onAddServiceRequest(ticketWarrantyId, ticketDescription);
      setTicketSubmitted(true);
      setTicketDescription("");
      setTimeout(() => setTicketSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg) return;
    onContactSupport(supportMsg);
    setSupportSubmitted(true);
    setSupportMsg("");
    setTimeout(() => setSupportSubmitted(false), 5000);
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const email = emailInput.trim().toLowerCase();
    const phone = phoneInput.trim();

    if (!email || !phone) {
      setLoginError("Please enter both your registered email and phone number.");
      return;
    }

    const sanitizeDigits = (str: string) => str.replace(/\D/g, "");
    const targetPhoneDigits = sanitizeDigits(phone);

    const found = customers.find(c => {
      const custEmail = c.email.trim().toLowerCase();
      const custPhoneDigits = sanitizeDigits(c.phone);

      const emailMatches = custEmail === email;
      const phoneMatches = 
        custPhoneDigits === targetPhoneDigits || 
        custPhoneDigits.endsWith(targetPhoneDigits) || 
        targetPhoneDigits.endsWith(custPhoneDigits);

      return emailMatches && phoneMatches;
    });

    if (found) {
      setLoggedInCustomer(found);
      localStorage.setItem("nilachal_client_logged_in", JSON.stringify(found));
    } else {
      setLoginError("No match found for that registered email and phone number combination. Please try again.");
    }
  };

  const handleClientLogout = () => {
    setLoggedInCustomer(null);
    localStorage.removeItem("nilachal_client_logged_in");
    setEmailInput("");
    setPhoneInput("");
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // If there are no customers at all in the database
  if (customers.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center max-w-md mx-auto text-stone-400 flex flex-col items-center justify-center space-y-4">
        <Logo size="lg" className="p-1 rounded-full bg-stone-950 border border-stone-800" />
        <div>
          <p className="font-serif font-bold text-stone-200">No Customers Registered</p>
          <p className="text-xs text-stone-500 mt-2">Please log a Customer and create a Project Brief in the Admin section to activate the Client Portal.</p>
        </div>
      </div>
    );
  }

  // FORCE LOGIN GATE if not logged in as a client
  if (!verifiedCustomer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-stone-100" id="client-login-gate">
        <div className="w-full max-w-md bg-stone-900/95 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFBE0B]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FFBE0B]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
            <div className="relative">
              <Logo size="xl" className="bg-stone-950 p-2 rounded-full border border-stone-800 shadow-xl" />
              <div className="absolute -bottom-1 -right-1 bg-[#FFBE0B] text-stone-950 p-1.5 rounded-full border-2 border-stone-900 shadow-md">
                <User className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-stone-100">
                Client Sign In
              </h2>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Log into your personalized interior design workspace to download CAD layouts, track weekly progress logs, and check billing ledgers.
              </p>
            </div>

            <form onSubmit={handleClientLogin} className="w-full space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] uppercase tracking-wider font-bold text-stone-500 font-mono">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 w-4 h-4" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="e.g. client@gmail.com"
                    className="w-full bg-stone-950/80 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-xl pl-10 pr-4 py-3 text-stone-100 placeholder-stone-600 outline-none transition text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[11px] uppercase tracking-wider font-bold text-stone-500 font-mono">
                  Registered Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-600 w-4 h-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={phoneInput}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="e.g. +91 94370 XXXXX"
                    className="w-full bg-stone-950/80 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-xl pl-10 pr-12 py-3 text-stone-100 placeholder-stone-600 outline-none transition text-xs font-mono"
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

              {loginError && (
                <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/30 rounded-xl text-xs text-red-400 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-semibold leading-relaxed text-left">{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-amber-500 hover:bg-[#FFBE0B] text-stone-950 font-black cursor-pointer shadow-md transition shadow-amber-500/10"
              >
                <span>Enter Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Client Header Workspace Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-950 p-4 rounded-xl border border-stone-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FFBE0B]/10 border border-[#FFBE0B]/30 flex items-center justify-center text-[#FFBE0B] font-bold text-sm shadow-sm">
            {verifiedCustomer.name[0]}
          </div>
          <div>
            <span className="text-[10px] text-[#FFBE0B] font-bold uppercase tracking-wider font-mono">Client Workspace</span>
            <h2 className="text-sm font-serif font-semibold text-stone-200">Welcome, {verifiedCustomer.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {clientProjects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-stone-900 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-stone-300 outline-none cursor-pointer w-full sm:w-56"
            >
              {clientProjects.map(p => (
                <option key={p.id} value={p.id}>{p.stylePreference} Site</option>
              ))}
            </select>
          )}
          <button
            onClick={handleClientLogout}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-red-900/30 text-stone-400 hover:text-red-400 font-semibold rounded-lg text-xs transition duration-200 flex items-center gap-1.5 whitespace-nowrap ml-auto"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {clientProjects.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center max-w-md mx-auto text-stone-400 flex flex-col items-center justify-center space-y-4">
          <Logo size="lg" className="p-1 rounded-full bg-stone-950 border border-stone-800" />
          <div>
            <p className="font-serif font-bold text-stone-200">No Projects Found</p>
            <p className="text-xs text-stone-500 mt-2">There are currently no active design or execution files mapped to your account. Please check back soon or contact support.</p>
          </div>
        </div>
      ) : activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT PANEL: Progress & site logs timeline */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual Circular progress banner */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Logo size="lg" className="shrink-0 bg-stone-950/40 p-1.5 rounded-full border border-stone-850 shadow-inner" />
                <div className="space-y-2 text-center sm:text-left">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                    {activeProject.stylePreference} Theme Design
                  </span>
                  <h3 className="text-xl font-serif font-bold text-stone-100">{activeProject.customerName} Residence</h3>
                  <p className="text-xs text-stone-400 max-w-md">Your turnkey interior transformation is under expert supervision. Check construction timelines, blueprint revisions, and balance ledger dues below.</p>
                </div>
              </div>

              {/* Dynamic Circular Progress Indicator */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1c1917" // Stone 900 background track
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#d97706" // Amber 600 fill
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * currentProgress) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono font-black text-stone-100">{currentProgress}%</span>
                  <span className="text-[8px] uppercase tracking-wider text-stone-500 font-bold">Progress</span>
                </div>
              </div>
            </div>

            {/* Daily updates site logs list */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-5">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
                <Clock className="w-4 h-4 text-amber-500" /> Live Construction Logs
              </h4>

              {projectUpdates.length === 0 ? (
                <div className="text-center py-12 text-xs text-stone-500">
                  Daily construction logs and photos will appear as execution begins.
                </div>
              ) : (
                <div className="space-y-5">
                  {projectUpdates.map(upd => (
                    <div key={upd.id} className="p-4 bg-stone-950 rounded-xl border border-stone-850 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">{upd.date}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-xs font-bold text-stone-200">{upd.statusText}</span>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed italic">
                          "{upd.workCompleted}"
                        </p>
                      </div>

                      {upd.photos && upd.photos.length > 0 && (
                        <div className="shrink-0 w-24 aspect-video rounded-lg overflow-hidden border border-stone-800 self-start md:self-center">
                          <img 
                            src={upd.photos[0]} 
                            alt="Construction Site Progress" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Requirements Segment */}
            {clientRequirements && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-5">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-500" /> Agreed Interior Fit-out Scope
                </h4>
                
                {/* Checkboxes items list */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "modularKitchen", label: "Modular Kitchen" },
                    { key: "wardrobe", label: "Wardrobes" },
                    { key: "falseCeiling", label: "False Ceilings" },
                    { key: "tvUnit", label: "TV Unit" },
                    { key: "inverterBox", label: "Inverter Box" },
                    { key: "shoeBox", label: "Shoe Box" },
                    { key: "partition", label: "Partition Wall" },
                    { key: "doorPanelling", label: "Door Panelling" },
                    { key: "chowkathPanelling", label: "Chowkath Panelling" },
                    { key: "lockFitting", label: "Lock Fitting" },
                    { key: "mainDoorPanelling", label: "Main Door Panelling" }
                  ].map((item) => {
                    const isSelected = !!(clientRequirements as any)[item.key];
                    return (
                      <span 
                        key={item.key} 
                        className={`text-[10.5px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-semibold transition ${
                          isSelected 
                            ? "bg-[#FFBE0B]/10 text-amber-400 border-amber-500/20 shadow-inner animate-in fade-in" 
                            : "bg-stone-950/40 text-stone-600 border-stone-900 line-through opacity-40"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-[#FFBE0B]" : "bg-stone-700"}`} />
                        {item.label}
                      </span>
                    );
                  })}
                </div>

                {/* Specific descriptions of Custom Orders */}
                {(clientRequirements.customKitchenSpec || clientRequirements.customWardrobeSpec || clientRequirements.customCeilingSpec || clientRequirements.customFurnitureSpec) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {clientRequirements.customKitchenSpec && (
                      <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-850/60 space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-500 font-mono">Kitchen Specifications</span>
                          {clientRequirements.customKitchenSqft && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{clientRequirements.customKitchenSqft} SQFT</span>
                          )}
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed font-medium">{clientRequirements.customKitchenSpec}</p>
                      </div>
                    )}
                    {clientRequirements.customWardrobeSpec && (
                      <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-850/60 space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-500 font-mono">Wardrobe Specifications</span>
                           {clientRequirements.customWardrobeSqft && (
                             <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{clientRequirements.customWardrobeSqft} SQFT</span>
                           )}
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed font-medium">{clientRequirements.customWardrobeSpec}</p>
                      </div>
                    )}
                    {clientRequirements.customCeilingSpec && (
                      <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-850/60 space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-500 font-mono">Ceiling & Lighting</span>
                           {clientRequirements.customCeilingSqft && (
                             <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{clientRequirements.customCeilingSqft} SQFT</span>
                           )}
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed font-medium">{clientRequirements.customCeilingSpec}</p>
                      </div>
                    )}
                    {clientRequirements.customFurnitureSpec && (
                      <div className="bg-stone-950/60 p-3.5 rounded-xl border border-stone-850/60 space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-500 font-mono">Bespoke Furniture & Accents</span>
                           {clientRequirements.customFurnitureSqft && (
                             <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{clientRequirements.customFurnitureSqft} SQFT</span>
                           )}
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed font-medium">{clientRequirements.customFurnitureSpec}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional dynamic customized orders */}
                {clientRequirements.dynamicCustomOrders && clientRequirements.dynamicCustomOrders.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-500 font-mono block">Dynamic Custom Orders</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {clientRequirements.dynamicCustomOrders.map((order, index) => (
                        <div key={index} className="bg-stone-950 border border-stone-850/60 p-3 rounded-lg text-xs space-y-0.5">
                          <strong className="text-stone-200 block font-bold">{order.label}</strong>
                          <span className="text-stone-400 block leading-relaxed text-[11px]">{order.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Document Blueprints download segment */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
                <Download className="w-4 h-4 text-amber-500" /> Blueprint & Quotation Downloads
              </h4>

              {projectDocs.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">Your blueprints and design proposals are undergoing drafting revisions.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectDocs.map(doc => (
                    <div key={doc.id} className="bg-stone-950 p-3 rounded-lg border border-stone-850 flex items-center justify-between text-xs hover:border-amber-500/20 transition">
                      <div>
                        <span className="font-bold text-stone-300 block truncate max-w-[160px]">{doc.title}</span>
                        <span className="text-[10px] text-stone-500 font-mono">{doc.fileName} ({doc.fileSize})</span>
                      </div>
                      <button
                        onClick={() => alert(`Downloading blueprint ${doc.fileName}...`)}
                        className="p-1.5 bg-stone-900 text-stone-400 hover:text-amber-500 hover:bg-stone-800 rounded transition"
                        title="Download CAD Layout"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Financial ledger, warranties, service ticket */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Project financial billing overview */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-md">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-amber-500" /> Account Statement
              </h4>
              <div className="space-y-3.5">
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Project Budget Estimate:</span>
                  <span className="font-mono font-bold text-stone-200">{formatCurrency(activeProject.budget)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Total Advances Paid:</span>
                  <span className="font-mono font-bold text-green-500">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-800 pt-3.5 text-xs">
                  <span className="text-stone-300 font-bold">Outstanding Balance:</span>
                  <span className="font-mono font-bold text-amber-500">{formatCurrency(balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Registered active warranties */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" /> Active Hardware Warranties
              </h4>

              {projectWarranties.length === 0 ? (
                <p className="text-[10.5px] text-stone-500 italic py-2">Warranties are registered upon site completions.</p>
              ) : (
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {projectWarranties.map(warr => (
                    <div key={warr.id} className="p-2.5 bg-stone-950 rounded border border-stone-850 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-stone-300">{warr.productInstalled}</span>
                        <span className="text-[9.5px] text-stone-500 font-mono">{warr.brand}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">Expires: <strong className="font-mono text-amber-500">{warr.endDate}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request service ticket form */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-md space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-stone-850 pb-2">
                <Wrench className="w-4 h-4 text-amber-500" /> Request Warranty Service
              </h4>

              {projectWarranties.length === 0 ? (
                <p className="text-[11px] text-stone-500 italic leading-relaxed">Service ticket can be submitted once modular fittings and appliances are installed and their warranties are registered.</p>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400">Select Warranted Component</label>
                    <select
                      value={ticketWarrantyId}
                      onChange={(e) => setTicketWarrantyId(e.target.value)}
                      required
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                    >
                      <option value="">Choose item...</option>
                      {projectWarranties.map(w => (
                        <option key={w.id} value={w.id}>{w.productInstalled} ({w.brand})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-400">Describe Maintenance Request</label>
                    <textarea
                      required
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Specify the issue (e.g., modular hydraulic cabinet door is slamming shut)..."
                      rows={3}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-2 text-xs text-stone-300 outline-none resize-none"
                    />
                  </div>

                  {ticketSubmitted && (
                    <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-[10.5px] text-green-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 shrink-0" /> Service ticket submitted successfully. Support team will contact you for site inspection.
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Service Ticket
                  </button>
                </form>
              )}
            </div>

            {/* Direct contact support panel */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Direct Support Hotline
              </h5>
              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{orgDetails.phone} ({orgDetails.hq})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>{orgDetails.email}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
