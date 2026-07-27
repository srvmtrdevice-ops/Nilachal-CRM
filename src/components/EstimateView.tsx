import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit, Printer, Share2, FileText, CheckCircle, 
  X, Sparkles, Calculator, User, Phone, Mail, MapPin, 
  ChevronRight, Calendar, Info, RefreshCw
} from "lucide-react";
import { Estimate, EstimateItem, Customer, getOrgDetails } from "../types";

interface EstimateViewProps {
  estimates: Estimate[];
  customers: Customer[];
  onAdd: (estimate: Omit<Estimate, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  onUpdate: (id: string, estimate: Partial<Estimate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EstimateView({ 
  estimates, 
  customers, 
  onAdd, 
  onUpdate, 
  onDelete 
}: EstimateViewProps) {
  const orgDetails = getOrgDetails();
  
  // App States
  const [activeForm, setActiveForm] = useState<"list" | "create" | "edit">("list");
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  
  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [estimateNumber, setEstimateNumber] = useState("");
  const [date, setDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Estimate["status"]>("Draft");
  const [gstRate, setGstRate] = useState<number>(18);
  const [discount, setDiscount] = useState<number>(0);

  // Print Preview modal
  const [previewEstimate, setPreviewEstimate] = useState<Estimate | null>(null);

  // Temp item states
  const [tempRoom, setTempRoom] = useState("Living Room");
  const [tempDesc, setTempDesc] = useState("");
  const [tempQty, setTempQty] = useState<number>(1);
  const [tempRate, setTempRate] = useState<number>(0);

  // Generate automatic estimate number
  useEffect(() => {
    if (activeForm === "create") {
      const num = `NC-EST-${Date.now().toString().slice(-6)}`;
      setEstimateNumber(num);
      setDate(new Date().toISOString().split("T")[0]);
      
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      setExpiryDate(exp.toISOString().split("T")[0]);
      setItems([]);
      setNotes("1. 50% Advance is required to initiate design works.\n2. 40% Progressive payment is required before carpentry material procurement.\n3. Balance 10% on completion and prior to handover.\n4. Design layout changes post-approval will attract extra charges.\n5. Rates are valid for 30 days from the date of estimate.");
      setSelectedCustomer("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
      setGstRate(18);
      setDiscount(0);
    }
  }, [activeForm]);

  // Handle customer change
  const handleCustomerChange = (custId: string) => {
    setSelectedCustomer(custId);
    const found = customers.find(c => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerEmail(found.email);
      setCustomerAddress(found.projectLocation || found.address);
    } else {
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setCustomerAddress("");
    }
  };

  // Pre-populate with design presets
  const applyPreset = (style: "minimal" | "modern" | "luxury" | "royal") => {
    let presetItems: Omit<EstimateItem, "id" | "amount">[] = [];
    if (style === "minimal") {
      presetItems = [
        { room: "Living Room", description: "Minimalist modular TV unit with hidden wire management & matte finish laminates", quantity: 1, rate: 45000 },
        { room: "Modular Kitchen", description: "Standard modular kitchen cabinets (L-Shape) in high-gloss waterproof BWR plywood", quantity: 1, rate: 165000 },
        { room: "Master Bedroom", description: "Bespoke 3-door wardrobe with high-quality soft close hinges and standard loft", quantity: 1, rate: 70000 },
        { room: "All Areas", description: "Premium emulsion paint application (Asian Paints Royale / equivalent) including putty & sanding", quantity: 1200, rate: 25 }
      ];
    } else if (style === "modern") {
      presetItems = [
        { room: "Living Room", description: "Contemporary TV paneling with charcoal louvers and golden metallic highlights", quantity: 1, rate: 85000 },
        { room: "Modular Kitchen", description: "Premium modular kitchen with acrylic finish shutters, tandem boxes, and tall unit spacer", quantity: 1, rate: 240000 },
        { room: "Master Bedroom", description: "Luxury floor-to-ceiling sliding wardrobe with tinted glass profile doors and profile lighting", quantity: 1, rate: 120000 },
        { room: "False Ceiling", description: "Gypsum false ceiling with sleek perimeter LED cove light cutouts and decorative spot lamps", quantity: 1000, rate: 110 }
      ];
    } else if (style === "luxury") {
      presetItems = [
        { room: "Living Room", description: "Ultra-luxury Italian marble backpaneling paired with customized backlit onyx stone elements", quantity: 1, rate: 185000 },
        { room: "Modular Kitchen", description: "Premium PU-lacquered modular kitchen, customized cutlery trays, pull-outs, and quartz stone countertop", quantity: 1, rate: 390000 },
        { room: "Master Bedroom", description: "King-size designer upholstered bed with matching side tables and integrated wireless chargers", quantity: 1, rate: 140000 },
        { room: "Smart Automation", description: "Smart lighting control and automated motorized curtains integration with home hub", quantity: 1, rate: 95000 }
      ];
    } else {
      presetItems = [
        { room: "Royal Palace Entry", description: "Hand-carved premium Burma Teak wood door framing with exquisite classic brass locksets", quantity: 1, rate: 125000 },
        { room: "Dining Lounge", description: "Bespoke royal-classic dining table set, custom gold-leaf gilded polish, premium velvet seats", quantity: 1, rate: 250000 },
        { room: "Modular Kitchen", description: "Bespoke classic country-style kitchen cabinets with integrated high-end built-in appliances (Faber/Hafele)", quantity: 1, rate: 480000 },
        { room: "Premium Ceilings", description: "Custom geometric false ceilings incorporating real walnut wood veneers and crystal chandeliers support", quantity: 1500, rate: 180 }
      ];
    }

    const compiled: EstimateItem[] = presetItems.map((item, index) => {
      const id = `item_${Date.now()}_${index}`;
      return {
        id,
        ...item,
        amount: item.quantity * item.rate
      };
    });

    setItems(compiled);
  };

  // Add individual line item
  const handleAddItem = () => {
    if (!tempDesc.trim() || tempQty <= 0 || tempRate < 0) return;
    
    const newItem: EstimateItem = {
      id: `item_${Date.now()}`,
      room: tempRoom,
      description: tempDesc,
      quantity: tempQty,
      rate: tempRate,
      amount: tempQty * tempRate
    };

    setItems([...items, newItem]);
    setTempDesc("");
    setTempQty(1);
    setTempRate(0);
  };

  // Remove individual line item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calculations helper
  const getSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
  const getGstAmount = (sub: number) => Math.round((sub - discount) * (gstRate / 100));
  const getGrandTotal = (sub: number, gst: number) => Math.round(sub - discount + gst);

  // Edit action
  const handleEditEstimate = (est: Estimate) => {
    setSelectedEstimateId(est.id);
    setSelectedCustomer(est.customerId);
    setCustomerName(est.customerName);
    setCustomerPhone(est.customerPhone);
    setCustomerEmail(est.customerEmail);
    setCustomerAddress(est.customerAddress);
    setEstimateNumber(est.estimateNumber);
    setDate(est.date);
    setExpiryDate(est.expiryDate);
    setItems(est.items || []);
    setNotes(est.notes || "");
    setStatus(est.status);
    setGstRate(est.gstRate || 18);
    setDiscount(est.discount || 0);
    setActiveForm("edit");
  };

  // Save/Submit Form
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) return;

    const sub = getSubtotal();
    const gstAmt = getGstAmount(sub);
    const total = getGrandTotal(sub, gstAmt);

    const estPayload: Omit<Estimate, "id" | "createdAt" | "updatedAt"> = {
      customerId: selectedCustomer || "walk_in",
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      estimateNumber,
      date,
      expiryDate,
      items,
      subtotal: sub,
      discount,
      gstRate,
      gstAmount: gstAmt,
      grandTotal: total,
      notes,
      status
    };

    if (activeForm === "create") {
      await onAdd(estPayload);
    } else if (activeForm === "edit" && selectedEstimateId) {
      await onUpdate(selectedEstimateId, estPayload);
    }

    setActiveForm("list");
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-850 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-medium text-xs tracking-widest uppercase mb-1 font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Gilded Proposals
          </div>
          <h2 className="text-2xl font-serif text-stone-100 font-bold">Bespoke Design Estimates</h2>
        </div>
        
        {activeForm === "list" ? (
          <button
            onClick={() => setActiveForm("create")}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer font-mono"
          >
            <Plus className="w-4 h-4" /> Create Design Estimate
          </button>
        ) : (
          <button
            onClick={() => setActiveForm("list")}
            className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl text-xs font-bold uppercase tracking-wider transition font-mono cursor-pointer"
          >
            Back to Estimates List
          </button>
        )}
      </div>

      {/* FORM: Create or Edit */}
      {activeForm !== "list" && (
        <form onSubmit={handleSaveForm} className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: Client Selection & Details */}
            <div className="lg:col-span-4 space-y-5 bg-stone-900 border border-stone-850 p-5 rounded-2xl">
              <h3 className="text-sm font-serif font-bold text-amber-500 border-b border-stone-850 pb-2 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Client Link & Registry
              </h3>

              {/* Link Existing Customer */}
              <div className="space-y-1.5">
                <label className="text-xs text-stone-400 font-medium">Link with Customer Registry</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition font-medium"
                >
                  <option value="">-- Select from Customer Registry --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                  <option value="custom">-- Unlisted / Walk-In Client --</option>
                </select>
                <p className="text-[10px] text-stone-500 italic">Selecting a customer automatically fetches details from their profile.</p>
              </div>

              {/* Customer Manual Details */}
              <div className="space-y-4 pt-3 border-t border-stone-850/60">
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-500" /> Client Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-stone-500" /> Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-500" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" /> Project / Site Location
                  </label>
                  <textarea
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Bespoke project site address..."
                    className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500 transition font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Estimate Details & Line Items */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Meta details & presets */}
              <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-850 pb-3">
                  <h3 className="text-sm font-serif font-bold text-amber-500 flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Estimate Properties
                  </h3>

                  {/* Aesthetic style presets trigger */}
                  <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-850 rounded-xl px-3 py-1">
                    <span className="text-[10px] font-bold text-stone-400 font-mono uppercase">Templates:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset("minimal")}
                      className="text-[10px] text-amber-400 font-semibold hover:text-white px-1.5 py-0.5 rounded transition hover:bg-stone-800"
                    >
                      Minimal
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("modern")}
                      className="text-[10px] text-amber-400 font-semibold hover:text-white px-1.5 py-0.5 rounded transition hover:bg-stone-800"
                    >
                      Modern
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("luxury")}
                      className="text-[10px] text-amber-400 font-semibold hover:text-white px-1.5 py-0.5 rounded transition hover:bg-stone-800"
                    >
                      Luxury
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("royal")}
                      className="text-[10px] text-amber-400 font-semibold hover:text-white px-1.5 py-0.5 rounded transition hover:bg-stone-800"
                    >
                      Royal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-stone-500">Proposal Num</label>
                    <input
                      type="text"
                      required
                      value={estimateNumber}
                      onChange={(e) => setEstimateNumber(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-stone-500">Date Issued</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-1.5 text-xs text-stone-300 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-stone-500">Proposal Valid Until</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-1.5 text-xs text-stone-300 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono font-bold text-stone-500">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Estimate["status"])}
                      className="w-full bg-stone-950 border border-stone-850 rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dynamic Line Items Editor */}
              <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-serif font-bold text-stone-100 border-b border-stone-850 pb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" /> Dynamic Proposal Line Items
                </h3>

                {/* Adding individual item row */}
                <div className="p-4 bg-stone-950 rounded-xl border border-stone-850 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] text-stone-400 font-semibold uppercase">Room / Space</label>
                    <select
                      value={tempRoom}
                      onChange={(e) => setTempRoom(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1.5 text-xs text-stone-200"
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Master Bedroom">Master Bedroom</option>
                      <option value="Kid's Bedroom">Kid's Bedroom</option>
                      <option value="Guest Bedroom">Guest Bedroom</option>
                      <option value="False Ceiling">False Ceiling</option>
                      <option value="Dining Room">Dining Room</option>
                      <option value="Foyer Space">Foyer Space</option>
                      <option value="Balcony Area">Balcony Area</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="Other Area">Other Area</option>
                    </select>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] text-stone-400 font-semibold uppercase">Scope & Materials Description</label>
                    <input
                      type="text"
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                      placeholder="e.g. Laminates, soft close hinges..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-stone-400 font-semibold uppercase">Quantity / Unit</label>
                    <input
                      type="number"
                      min="1"
                      value={tempQty}
                      onChange={(e) => setTempQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 text-center font-mono focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] text-stone-400 font-semibold uppercase">Rate (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tempRate}
                      onChange={(e) => setTempRate(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 text-center font-mono focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!tempDesc.trim() || tempRate <= 0}
                      className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Table of items added */}
                <div className="overflow-x-auto border border-stone-850 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-950 text-[10px] uppercase font-mono tracking-wider text-stone-400 border-b border-stone-850">
                        <th className="py-2.5 px-3">Room</th>
                        <th className="py-2.5 px-3">Scope Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Total</th>
                        <th className="py-2.5 px-3 text-center w-12">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850/60 text-xs">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-stone-500 italic">
                            No items added to this proposal yet. Use the selector above or choose a preset template.
                          </td>
                        </tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id} className="hover:bg-stone-850/30 text-stone-200">
                            <td className="py-2.5 px-3 font-semibold text-amber-500">{item.room}</td>
                            <td className="py-2.5 px-3 text-stone-300 break-words">{item.description}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.rate)}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-100">{formatCurrency(item.amount)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 text-stone-500 hover:text-red-400 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals & GST block */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-stone-850/50">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-stone-400 font-semibold uppercase">Proposal Notes / Legal terms & conditions</label>
                      <textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter terms of payments, warranties..."
                        className="w-full bg-stone-950 border border-stone-850 rounded-xl p-3 text-xs text-stone-300 focus:outline-none focus:border-amber-500 font-medium leading-relaxed resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-stone-950 p-4 rounded-xl border border-stone-850/60 space-y-3.5 self-start">
                    <div className="flex justify-between items-center text-xs text-stone-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-stone-200 font-semibold">{formatCurrency(getSubtotal())}</span>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-stone-400 shrink-0">Flat discount value (₹):</span>
                      <input
                        type="number"
                        min="0"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="w-28 text-right bg-stone-900 border border-stone-800 rounded px-2 py-0.5 text-xs text-stone-200 font-mono focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <span className="text-xs text-stone-400">GST Rate (%):</span>
                      <select
                        value={gstRate}
                        onChange={(e) => setGstRate(Number(e.target.value))}
                        className="bg-stone-900 border border-stone-800 rounded px-2 py-0.5 text-xs text-stone-200"
                      >
                        <option value="0">0% (GST Exempt)</option>
                        <option value="5">5% GST</option>
                        <option value="12">12% GST</option>
                        <option value="18">18% GST (Standard)</option>
                        <option value="28">28% GST</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center text-xs text-stone-400 pt-2 border-t border-stone-850/60">
                      <span>GST Amount:</span>
                      <span className="font-mono text-amber-500/80">{formatCurrency(getGstAmount(getSubtotal()))}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-stone-100 font-bold pt-2 border-t border-amber-500/20">
                      <span className="text-amber-500 uppercase tracking-wider text-[11px] font-mono">Bespoke Grand Total:</span>
                      <span className="font-serif text-lg text-amber-400">{formatCurrency(getGrandTotal(getSubtotal(), getGstAmount(getSubtotal())))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="flex justify-end gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveForm("list")}
                  className="px-5 py-2.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-bold uppercase tracking-wider font-mono transition cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider font-mono shadow-lg shadow-amber-500/10 transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" /> Save Gilded Estimate
                </button>
              </div>

            </div>

          </div>
        </form>
      )}

      {/* ESTIMATES DIRECTORY LIST */}
      {activeForm === "list" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-stone-400 tracking-widest">
              Gilded Proposals Archives ({estimates.length})
            </span>
          </div>

          {estimates.length === 0 ? (
            <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-stone-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-base text-stone-300 font-bold">No Proposals Issued</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  You haven't generated any estimates or design drafts yet. Tap 'Create Design Estimate' to model a luxury layout.
                </p>
              </div>
              <button
                onClick={() => setActiveForm("create")}
                className="px-4 py-2 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition hover:bg-amber-600 font-mono cursor-pointer"
              >
                Draft First Estimate
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {estimates.map(est => {
                const isExpired = new Date(est.expiryDate) < new Date();
                return (
                  <div 
                    key={est.id} 
                    className="bg-stone-900 border border-stone-850 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-xl transition duration-300 space-y-4 relative"
                  >
                    {/* Expiry / status tag */}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-semibold text-amber-500 tracking-wider">
                        {est.estimateNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                        est.status === "Approved" 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" 
                          : est.status === "Draft" 
                            ? "bg-stone-950 text-stone-400 border border-stone-850" 
                            : est.status === "Sent" 
                              ? "bg-blue-950 text-blue-400 border border-blue-900/40" 
                              : "bg-red-950 text-red-400 border border-red-900/40"
                      }`}>
                        {est.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-stone-100 text-sm tracking-tight leading-tight">
                        {est.customerName}
                      </h4>
                      {est.customerPhone && (
                        <p className="text-xs text-stone-400 font-medium font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-600" /> {est.customerPhone}
                        </p>
                      )}
                      {est.customerAddress && (
                        <p className="text-xs text-stone-500 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-600" /> {est.customerAddress}
                        </p>
                      )}
                    </div>

                    {/* Financial summary */}
                    <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono uppercase text-stone-500">Issued Total</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{formatCurrency(est.grandTotal)}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-mono uppercase text-stone-500">Valid Until</span>
                        <span className={`text-[10px] font-mono font-medium ${isExpired ? "text-red-400 font-bold" : "text-stone-300"}`}>
                          {est.expiryDate} {isExpired && "(Expired)"}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2 pt-2 border-t border-stone-850/50">
                      <button
                        onClick={() => handleEditEstimate(est)}
                        className="flex-1 py-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition border border-stone-800 font-mono flex items-center justify-center gap-1 cursor-pointer"
                        title="Edit Proposal details"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => setPreviewEstimate(est)}
                        className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-lg transition font-mono flex items-center justify-center gap-1 cursor-pointer"
                        title="Share Proposal as PDF / Print preview"
                      >
                        <Printer className="w-3 h-3" /> Share PDF
                      </button>
                      <button
                        onClick={() => onDelete(est.id)}
                        className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition"
                        title="Delete estimate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LUXURY DESIGN PRINT/PDF PREVIEW MODAL */}
      {previewEstimate && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl w-full max-w-4xl shadow-2xl my-8 relative flex flex-col">
            
            {/* Modal Controls Bar - Hidden during printing */}
            <div className="p-4 bg-stone-900 border-b border-stone-800 flex justify-between items-center shrink-0 print:hidden rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-serif font-bold text-stone-200">Luxury Client Proposal Print Stage</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewEstimate(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINT-OPTIMIZED PRINTING CANVAS */}
            <div className="p-8 md:p-12 overflow-y-auto bg-white text-stone-900 font-sans print:p-0 print:m-0 rounded-b-2xl max-h-[80vh] print:max-h-none print:overflow-visible flex flex-col justify-between">
              
              <div className="space-y-8">
                {/* PDF Header with Brand Logo */}
                <div className="flex justify-between items-start border-b-2 border-stone-800 pb-6">
                  <div>
                    {/* Visual Brand Emblem */}
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white font-serif font-bold italic text-base border border-amber-500/40">
                        N
                      </div>
                      <h1 className="text-xl font-serif font-black tracking-widest text-stone-900 uppercase">
                        {orgDetails.name}
                      </h1>
                    </div>
                    <p className="text-[10px] text-stone-500 font-mono tracking-wider uppercase">Bespoke Architectural Interiors & Modular Layouts</p>
                    <p className="text-[10px] text-stone-500 leading-relaxed max-w-xs mt-1">
                      {orgDetails.address} • {orgDetails.hq}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <h2 className="text-2xl font-serif font-black text-stone-800 uppercase tracking-tight">DESIGN PROPOSAL</h2>
                    <p className="text-xs text-stone-500 font-mono font-semibold">REF: <span className="text-amber-600 font-bold">{previewEstimate.estimateNumber}</span></p>
                    <div className="pt-2 text-[10px] font-mono text-stone-500">
                      <div>DATE: <span className="text-stone-800 font-bold">{previewEstimate.date}</span></div>
                      <div>VALIDITY: <span className="text-stone-800 font-bold">{previewEstimate.expiryDate}</span></div>
                      <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          previewEstimate.status === "Approved" 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>{previewEstimate.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Link Details */}
                <div className="grid grid-cols-2 gap-8 bg-stone-50 p-4 border border-stone-100 rounded-xl">
                  <div>
                    <span className="text-[9px] uppercase font-mono font-bold text-stone-500 tracking-wider">Prepared Exclusively For:</span>
                    <h3 className="text-sm font-serif font-black text-stone-950 mt-1 leading-tight">{previewEstimate.customerName}</h3>
                    {previewEstimate.customerPhone && (
                      <div className="text-xs text-stone-600 mt-1 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-stone-400 shrink-0" /> {previewEstimate.customerPhone}
                      </div>
                    )}
                    {previewEstimate.customerEmail && (
                      <div className="text-xs text-stone-600 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-stone-400 shrink-0" /> {previewEstimate.customerEmail}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono font-bold text-stone-500 tracking-wider">Project Site Landmark:</span>
                    <p className="text-xs text-stone-700 font-semibold mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" /> {previewEstimate.customerAddress || "Bespoke Residence / Site Not Specified"}
                    </p>
                  </div>
                </div>

                {/* Estimate Table */}
                <div className="space-y-2">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-stone-800 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600">
                        <th className="py-2.5 px-2">Space / Room</th>
                        <th className="py-2.5 px-2">Scope & Architectural Specifications</th>
                        <th className="py-2.5 px-2 text-center w-12">Qty</th>
                        <th className="py-2.5 px-2 text-right w-24">Rate</th>
                        <th className="py-2.5 px-2 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
                      {previewEstimate.items && previewEstimate.items.length > 0 ? (
                        previewEstimate.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-stone-50/40">
                            <td className="py-3 px-2 font-serif font-bold text-stone-950">{item.room}</td>
                            <td className="py-3 px-2 text-stone-600 whitespace-pre-line leading-relaxed">{item.description}</td>
                            <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                            <td className="py-3 px-2 text-right font-mono">{formatCurrency(item.rate)}</td>
                            <td className="py-3 px-2 text-right font-mono font-bold text-stone-950">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-stone-500">No items available in proposal ledger</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal, discount & GST totals */}
                <div className="flex flex-col md:flex-row md:justify-between items-start gap-6 border-t border-stone-200 pt-6">
                  {/* Notes & payment conditions */}
                  <div className="flex-1 space-y-1 bg-amber-50/40 border border-amber-100/60 p-4 rounded-xl max-w-md">
                    <span className="text-[9px] uppercase font-mono font-bold text-amber-800 tracking-wider flex items-center gap-1.5">
                      <Info className="w-3 h-3 text-amber-600" /> Proposal T&C & Terms of Engagement
                    </span>
                    <p className="text-[10px] text-stone-600 leading-relaxed whitespace-pre-line">
                      {previewEstimate.notes}
                    </p>
                  </div>

                  <div className="w-full md:w-80 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600 font-medium">
                      <span>Valuation Subtotal:</span>
                      <span className="font-mono text-stone-850 font-semibold">{formatCurrency(previewEstimate.subtotal)}</span>
                    </div>

                    {previewEstimate.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Corporate Discount:</span>
                        <span className="font-mono">-{formatCurrency(previewEstimate.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600 font-medium">
                      <span>GST Levy ({previewEstimate.gstRate}%):</span>
                      <span className="font-mono text-stone-850">{formatCurrency(previewEstimate.gstAmount)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-stone-950 font-black border-t-2 border-stone-800 pt-3.5">
                      <span className="uppercase tracking-widest text-[10px] font-mono text-stone-700">Proposal Net Worth:</span>
                      <span className="font-serif text-lg text-stone-900">{formatCurrency(previewEstimate.grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Signature section */}
                <div className="pt-16 grid grid-cols-2 gap-12 text-center text-[10px] font-mono text-stone-500">
                  <div className="space-y-4">
                    <div className="w-40 border-b border-stone-350 mx-auto" />
                    <span>Client Authorization & Seal</span>
                  </div>
                  <div className="space-y-4">
                    <div className="w-40 border-b border-stone-350 mx-auto" />
                    <span>For, {orgDetails.name}</span>
                  </div>
                </div>
              </div>

              {/* PDF Footer statement */}
              <div className="pt-12 text-center text-[9px] text-stone-400 font-mono tracking-wider border-t border-stone-100 mt-12 print:mt-16">
                Thank you for choosing {orgDetails.name} for your bespoke interior journey.
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Sub-components to keep clean
interface LayersProps {
  className?: string;
}
function Layers({ className }: LayersProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 3-10 5 10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}
