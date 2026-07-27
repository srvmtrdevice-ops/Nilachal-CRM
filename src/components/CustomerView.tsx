import React, { useState } from "react";
import { Search, Filter, Plus, Phone, Mail, MapPin, Edit2, Trash2, CalendarRange, Landmark, CheckSquare, X } from "lucide-react";
import { Customer, CustomerStatus } from "../types";

interface CustomerViewProps {
  customers: Customer[];
  onAdd: (cust: Omit<Customer, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CustomerView({ customers, onAdd, onUpdate, onDelete }: CustomerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All">("All");
  
  // Modal toggle & edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [leadSource, setLeadSource] = useState("Reference");
  const [dateOfInquiry, setDateOfInquiry] = useState(new Date().toISOString().split('T')[0]);
  const [budget, setBudget] = useState(500000);
  const [status, setStatus] = useState<CustomerStatus>("Lead");
  const [notes, setNotes] = useState("");

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setProjectLocation("");
    setLeadSource("Reference");
    setDateOfInquiry(new Date().toISOString().split('T')[0]);
    setBudget(500000);
    setStatus("Lead");
    setNotes("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setPhone(cust.phone);
    setEmail(cust.email);
    setAddress(cust.address);
    setProjectLocation(cust.projectLocation);
    setLeadSource(cust.leadSource);
    setDateOfInquiry(cust.dateOfInquiry);
    setBudget(cust.budget);
    setStatus(cust.status);
    setNotes(cust.notes);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) return;

    const payload = {
      name,
      phone,
      email,
      address,
      projectLocation,
      leadSource,
      dateOfInquiry,
      budget: Number(budget) || 0,
      status,
      notes,
    };

    try {
      if (editingCustomer) {
        await onUpdate(editingCustomer.id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          c.projectLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customers, phone, city..."
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-200 placeholder-stone-500 outline-none transition"
            />
          </div>

          {/* Filter Status select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | "All")}
              className="bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-2.5 py-2 text-xs text-stone-300 outline-none transition w-full sm:w-auto cursor-pointer"
            >
              <option value="All">All Inquiries</option>
              <option value="Lead">Lead Intake</option>
              <option value="Design">Design Estimation</option>
              <option value="In Progress">Execution In Progress</option>
              <option value="Completed">Handed Over / Completed</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Add Inquiry Lead
        </button>
      </div>

      {/* Customer List cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No customer inquiries found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map(cust => (
            <div 
              key={cust.id} 
              className="bg-stone-900 border border-stone-800/80 rounded-xl p-5 hover:border-amber-500/20 hover:shadow-lg transition duration-200 flex flex-col justify-between"
            >
              {/* Card top */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-stone-100 text-base">{cust.name}</h3>
                    <span className="text-[10px] text-stone-500 italic">Inquiry: {cust.dateOfInquiry}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    cust.status === "Lead" ? "bg-amber-500/10 text-amber-500" :
                    cust.status === "Design" ? "bg-blue-500/10 text-blue-400" :
                    cust.status === "In Progress" ? "bg-purple-500/10 text-purple-400" : "bg-green-500/10 text-green-400"
                  }`}>
                    {cust.status === "In Progress" ? "Execution" : cust.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="font-mono">{cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <span>{cust.projectLocation || cust.address || "No site address"}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
                    <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider">Estimated Budget:</span>
                    <span className="font-mono font-bold text-amber-500">{formatCurrency(cust.budget)}</span>
                  </div>
                </div>

                {cust.notes && (
                  <p className="text-xs text-stone-400 bg-stone-950 p-2.5 rounded border border-stone-800 italic leading-relaxed">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-stone-800 text-stone-500">
                <span className="text-[10px] uppercase font-semibold text-stone-500">Source: <strong className="text-stone-400">{cust.leadSource}</strong></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(cust)}
                    className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-amber-500 rounded transition"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(cust.id)}
                    className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-red-500 rounded transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Intake/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">
                {editingCustomer ? "Modify Customer Details" : "New Customer Intake Record"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyabrata Mohanty"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya@gmail.com"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Project / Site Location</label>
                  <input
                    type="text"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Patia, Bhubaneswar"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Billing Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Billing address..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Inquiry Date</label>
                  <input
                    type="date"
                    value={dateOfInquiry}
                    onChange={(e) => setDateOfInquiry(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Lead Source</label>
                  <select
                    value={leadSource}
                    onChange={(e) => setLeadSource(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none cursor-pointer"
                  >
                    <option value="Reference">Reference</option>
                    <option value="Instagram">Instagram / Meta</option>
                    <option value="Justdial">Justdial</option>
                    <option value="Website">Website</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Budget Range (INR)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                    placeholder="e.g. 800000"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Pipeline Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none cursor-pointer"
                  >
                    <option value="Lead">Lead Intake</option>
                    <option value="Design">Design Estimation</option>
                    <option value="In Progress">Execution In Progress</option>
                    <option value="Completed">Completed Handover</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Lead Design Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter custom room type requests, false ceiling requirements, or specific wood polish references..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
                />
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
                  {editingCustomer ? "Save Changes" : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
