import React, { useState } from "react";
import { Plus, ShieldCheck, ShieldAlert, Calendar, User, Hammer, X, Wrench, FileCheck, Printer, Download } from "lucide-react";
import { Warranty, Project, WarrantyServiceRecord, getOrgDetails } from "../types";
import Logo from "./Logo";

interface WarrantyViewProps {
  warranties: Warranty[];
  projects: Project[];
  onAdd: (warranty: Omit<Warranty, "id" | "createdAt">) => Promise<void>;
  onAddService: (id: string, service: WarrantyServiceRecord) => Promise<void>;
}

export default function WarrantyView({ warranties, projects, onAdd, onAddService }: WarrantyViewProps) {
  const org = getOrgDetails();
  const [modalOpen, setModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [certWarranty, setCertWarranty] = useState<Warranty | null>(null);

  // Form states - Warranty
  const [projectId, setProjectId] = useState("");
  const [productInstalled, setProductInstalled] = useState("Hydraulic Lift Pump");
  const [brand, setBrand] = useState("Hafele");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 5); // Default 5 years warranty
    return d.toISOString().split('T')[0];
  });

  // Form states - Service Record
  const [serviceType, setServiceType] = useState("Maintenance");
  const [serviceDesc, setServiceDesc] = useState("Regular inspection and hinge alignment");
  const [serviceCost, setServiceCost] = useState(0);

  const handleOpenAdd = () => {
    if (projects.length === 0) {
      alert("Please configure a Project and a Client first before logging product warranties!");
      return;
    }
    setProjectId(projects[0]?.id || "");
    setProductInstalled("Soft-Close Hinges");
    setBrand("Ebco");
    setModalOpen(true);
  };

  const handleOpenService = (warr: Warranty) => {
    setSelectedWarranty(warr);
    setServiceType("Repair");
    setServiceDesc("Replaced sliding drawer runner channels under warranty");
    setServiceCost(0);
    setServiceModalOpen(true);
  };

  const handleSubmitWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    try {
      await onAdd({
        projectId,
        projectName: proj.customerName + " Residence",
        customerName: proj.customerName,
        customerEmail: "", // derived
        productInstalled,
        brand,
        startDate,
        endDate,
        warrantyCardUrl: "Simulated Warranty Certificate",
        invoiceUrl: "Simulated Purchase Invoice",
        serviceHistory: []
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty) return;

    const newRecord: WarrantyServiceRecord = {
      date: new Date().toISOString().split('T')[0],
      type: serviceType,
      description: serviceDesc,
      cost: Number(serviceCost) || 0,
      status: "Completed"
    };

    try {
      await onAddService(selectedWarranty.id, newRecord);
      setServiceModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isExpiringSoon = (dateStr: string) => {
    const end = new Date(dateStr);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Nilachal Warranty Tracker</h3>
          <p className="text-xs text-stone-400">Keep records of high-end hardware brands, invoice uploads, start dates, and maintenance service history.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Register New Warranty Item
        </button>
      </div>

      {/* Warranties Grid */}
      {warranties.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No warranties logged yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warranties.map(warr => {
            const expiring = isExpiringSoon(warr.endDate);
            return (
              <div 
                key={warr.id} 
                className={`bg-stone-900 border rounded-2xl overflow-hidden shadow-lg transition duration-200 flex flex-col justify-between ${
                  expiring ? "border-red-500/30 bg-red-500/[0.01]" : "border-stone-800"
                }`}
              >
                {/* Upper Details */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-stone-100 text-base">{warr.productInstalled}</h4>
                      <span className="text-xs font-mono font-semibold text-amber-500">{warr.brand}</span>
                    </div>
                    {expiring ? (
                      <span className="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider">
                        <ShieldAlert className="w-3.5 h-3.5" /> Expiring Soon
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" /> Active Coverage
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3 rounded-lg border border-stone-850 text-xs">
                    <div className="space-y-1">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase block">Customer Name</span>
                      <span className="text-stone-300 font-medium flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-500" /> {warr.customerName}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase block">Expires On</span>
                      <span className="text-stone-300 font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" /> {warr.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Service History Segment */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-stone-800 pb-1.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-amber-500/80" /> Service Maintenance Log
                      </span>
                      <button
                        onClick={() => handleOpenService(warr)}
                        className="text-[10.5px] text-amber-500 hover:text-amber-400 font-bold transition"
                      >
                        + Log Service
                      </button>
                    </div>

                    {warr.serviceHistory && warr.serviceHistory.length > 0 ? (
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {warr.serviceHistory.map((srv, idx) => (
                          <div key={idx} className="bg-stone-950/40 p-2 rounded text-[11px] border border-stone-850 flex justify-between items-center">
                            <div>
                              <strong className="text-stone-300">{srv.type}</strong>
                              <span className="block text-[10px] text-stone-500">{srv.date} • {srv.description}</span>
                            </div>
                            {srv.cost > 0 && (
                              <span className="font-mono text-stone-400 font-semibold">{formatCurrency(srv.cost)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-500 italic py-1">No service repairs logged yet. Product running in perfect order.</p>
                    )}
                  </div>
                </div>

                {/* Footer Buttons / Certificate Download */}
                <div className="bg-stone-950/60 px-5 py-3 border-t border-stone-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCertWarranty(warr)}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="View / Print Official Warranty Certificate"
                    >
                      <Printer className="w-3 h-3" /> Certificate
                    </button>
                    {warr.warrantyCardUrl && (
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 select-none">
                        <FileCheck className="w-3.5 h-3.5 text-stone-500" /> Card Uploaded
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono">Coverage: {warr.startDate} to {warr.endDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Warranty Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Register Product Warranty</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWarranty} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Select Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.customerName} Site</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Product Installed *</label>
                <input
                  type="text"
                  required
                  value={productInstalled}
                  onChange={(e) => setProductInstalled(e.target.value)}
                  placeholder="e.g. 19mm Marine Ply cabinets, Dishwasher"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Ebco, Hafele, Hettich, CenturyPly"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Warranty Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Warranty Expiration Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition"
                >
                  Register Warranty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Service History Modal */}
      {serviceModalOpen && selectedWarranty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-base font-serif font-bold text-stone-100">
                Log Maintenance: {selectedWarranty.productInstalled}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Service / Maintenance Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                >
                  <option value="Maintenance">Regular Inspection & Oil</option>
                  <option value="Repair">Hardware Repair</option>
                  <option value="Replacement">Component Replacement</option>
                  <option value="Cleansing">Deep Cleansing/Polishing</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Description of Service Performed *</label>
                <textarea
                  required
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  placeholder="Specify task completed (e.g., realigned hydraulic pump cylinders to soft close nicely)..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Service Charge / Cost (INR) - 0 if under warranty</label>
                <input
                  type="number"
                  value={serviceCost}
                  onChange={(e) => setServiceCost(Number(e.target.value) || 0)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition"
                >
                  Save Service Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE WARRANTY CERTIFICATE MODAL */}
      {certWarranty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 print:p-0 print:bg-white overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none animate-in fade-in zoom-in-95 duration-200 my-8 print:my-0">
            {/* Modal Control Bar (Hidden on Print) */}
            <div className="bg-stone-900 text-white px-6 py-3.5 flex justify-between items-center print:hidden border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span className="font-serif font-bold text-sm">Official Warranty Certificate Preview</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setCertWarranty(null)}
                  className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Certificate Body Canvas */}
            <div className="p-8 md:p-12 space-y-8 bg-amber-50/20 border-8 border-double border-amber-500/30 m-4 rounded-xl print:m-0 print:border-8 print:border-double print:border-amber-600">
              {/* Header with Brand Logo */}
              <div className="flex justify-between items-center border-b-2 border-stone-800 pb-6">
                <div className="flex items-center gap-4">
                  <Logo size="xl" className="shrink-0" />
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-wider text-stone-900 uppercase">{org.name}</h1>
                    <p className="text-xs text-stone-600 font-medium">Architectural Turnkey Interiors & Hardware Systems</p>
                    <p className="text-[10px] text-stone-500 font-mono mt-0.5">{org.address} • Ph: {org.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full">
                    Official Guarantee
                  </span>
                  <div className="text-xs font-mono font-bold text-stone-700 mt-2">CERT REF: <span className="text-stone-900">NIL-WARR-{certWarranty.id.slice(0,6).toUpperCase()}</span></div>
                </div>
              </div>

              {/* Certificate Title Banner */}
              <div className="text-center space-y-2 py-4">
                <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight uppercase">
                  CERTIFICATE OF WARRANTY
                </h2>
                <p className="text-xs text-stone-600 italic max-w-xl mx-auto">
                  This document certifies that the hardware installation and turnkey woodwork specified below is backed by Nilachal Creatives Quality Assurance.
                </p>
              </div>

              {/* Product & Site Details */}
              <div className="grid grid-cols-2 gap-6 bg-white p-6 border border-amber-200 rounded-xl shadow-sm">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block">Product / Hardware Installed</span>
                  <span className="text-base font-serif font-bold text-stone-900 block mt-0.5">{certWarranty.productInstalled}</span>
                  <span className="text-xs text-amber-700 font-mono font-semibold block mt-1">Brand: {certWarranty.brand || "Nilachal Prime Series"}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block">Installation Site / Project</span>
                  <span className="text-base font-serif font-bold text-stone-900 block mt-0.5">{certWarranty.projectName}</span>
                  <span className="text-xs text-stone-600 block mt-1">Coverage Status: <strong className="text-emerald-700">ACTIVE</strong></span>
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4 bg-amber-100/50 p-4 border border-amber-300/60 rounded-xl text-center">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">Warranty Effective From</span>
                  <span className="text-sm font-mono font-extrabold text-stone-900 block mt-0.5">{certWarranty.startDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-stone-500 block">Warranty Expiry Date</span>
                  <span className="text-sm font-mono font-extrabold text-amber-900 block mt-0.5">{certWarranty.endDate}</span>
                </div>
              </div>

              {/* Terms */}
              <div className="text-[11px] text-stone-600 space-y-1.5 leading-relaxed bg-white p-4 rounded-xl border border-stone-200">
                <strong className="text-stone-900 block font-serif">Coverage Terms & Guarantee Scope:</strong>
                <p>• Covers hydraulic mechanism failures, alignment sagging, soft-close runner defects, and manufacturing flaws.</p>
                <p>• Free onsite repair or component replacement by authorized Nilachal Creatives technicians during the warranty tenure.</p>
              </div>

              {/* Signature & Seal Row */}
              <div className="pt-8 flex justify-between items-end">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 text-amber-700 font-serif font-black text-xs flex items-center justify-center mx-auto mb-2">
                    NILACHAL<br/>SEAL
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold text-stone-500">Quality Assured</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="border-b border-stone-400 w-48 pb-1 text-xs font-serif italic text-stone-800">
                    Sanjay Swain / Authorized Signatory
                  </div>
                  <span className="text-[10px] font-bold text-stone-900 block uppercase">Nilachal Creatives</span>
                  <span className="text-[9px] text-stone-500 font-mono block">Bhubaneswar, Odisha</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
