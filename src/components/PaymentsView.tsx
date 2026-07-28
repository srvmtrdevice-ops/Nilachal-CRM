import React, { useState } from "react";
import { Plus, DollarSign, FileText, CheckCircle, AlertTriangle, Calendar, Printer, X, CreditCard, Clock, Trash2 } from "lucide-react";
import { Payment, Project, getOrgDetails } from "../types";
import Logo from "./Logo";

interface PaymentsViewProps {
  payments: Payment[];
  projects: Project[];
  onAdd: (payment: Omit<Payment, "id" | "createdAt">) => Promise<void>;
  onMarkPaid: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function PaymentsView({ payments, projects, onAdd, onMarkPaid, onDelete }: PaymentsViewProps) {
  const orgDetails = getOrgDetails();
  const [modalOpen, setModalOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState<Payment | null>(null);

  // Form states
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState(150000);
  const [type, setType] = useState<Payment["type"]>("Advance");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Payment["status"]>("Pending");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    return `NC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [notes, setNotes] = useState("Advance deposit for modular plywood procurement.");

  const handleOpenAdd = () => {
    if (projects.length === 0) {
      alert("Please start a Project Brief first before logging payments or invoices!");
      return;
    }
    setProjectId(projects[0]?.id || "");
    setInvoiceNumber(`NC-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setPaymentMode("Bank Transfer");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    try {
      await onAdd({
        projectId,
        projectName: proj.customerName + " Site",
        customerName: proj.customerName,
        customerEmail: "", // derived or logged
        amount: Number(amount) || 0,
        type,
        date,
        status,
        invoiceNumber,
        notes,
        paymentMode
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for KPI summaries
  const totalInvoiced = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = payments.filter(p => p.status === "Pending" || p.status === "Overdue").reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* KPI Ledger Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider block">Total Estimated Billing</span>
            <span className="text-xl font-mono font-bold text-stone-100 mt-1 block">{formatCurrency(totalInvoiced)}</span>
          </div>
          <div className="p-3 bg-stone-850 rounded-lg text-stone-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider block">Advances / Payments Received</span>
            <span className="text-xl font-mono font-bold text-green-500 mt-1 block">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 font-medium uppercase tracking-wider block">Outstanding Receivables</span>
            <span className="text-xl font-mono font-bold text-amber-500 mt-1 block">{formatCurrency(totalOutstanding)}</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ledger Table controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Financial Ledger</h3>
          <p className="text-xs text-stone-400">Monitor payments schedule, view receipt invoices, and generate outstanding collection alerts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Issue Invoice / Record Ledger
        </button>
      </div>

      {/* Ledger Table */}
      {payments.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No ledger entries. Generate an invoice above.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-950 text-stone-400 font-semibold uppercase tracking-wider border-b border-stone-800">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client / Project</th>
                <th className="py-3 px-4">Milestone Stage</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-stone-850/40 transition">
                  <td className="py-3.5 px-4 font-mono font-semibold text-stone-300">{p.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-medium text-stone-200">{p.customerName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-stone-950 text-stone-300 rounded text-[10px] font-medium border border-stone-800">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" /> {p.date}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-100">{formatCurrency(p.amount)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        p.status === "Paid" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {p.status}
                      </span>
                      {p.paymentMode && (
                        <span className="text-[9px] text-stone-500 font-mono font-medium tracking-tight">{p.paymentMode}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.status === "Pending" && (
                        <button
                          onClick={() => onMarkPaid(p.id)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-semibold transition"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => setInvoicePreview(p)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] font-semibold flex items-center gap-1 transition"
                      >
                        <Printer className="w-3 h-3" /> View Invoice
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="px-2.5 py-1 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 rounded text-[10px] font-semibold flex items-center gap-1 transition border border-red-900/30"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Issue Milestone Invoice</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Select Project Site *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Milestone Stage</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as Payment["type"])}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Estimate">Complete Project Estimate</option>
                    <option value="Advance">Advance (Plywood Procurement)</option>
                    <option value="Progressive">Progressive (Woodwork / Painting)</option>
                    <option value="Final">Final Handover Balance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Bill Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Due Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Payment["status"])}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending Collection</option>
                    <option value="Paid">Received / Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Bill Notes / Description</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 50% mobilization advance for Modular Kitchen fabrication..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
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
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Premium Printable Viewer Overlay */}
      {invoicePreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:p-0 print:bg-white overflow-y-auto">
          <div className="bg-white text-stone-900 rounded-2xl w-full max-w-2xl shadow-2xl my-8 print:my-0 print:shadow-none print:rounded-none overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Top Toolbar (Hidden on print) */}
            <div className="bg-stone-900 text-white px-6 py-3.5 flex justify-between items-center print:hidden">
              <span className="font-serif font-bold text-sm text-amber-500">Nilachal Creatives Invoice Portal</span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
                <button
                  onClick={() => setInvoicePreview(null)}
                  className="p-1.5 hover:bg-stone-800 rounded transition text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Page */}
            <div id="invoice-printable" className="p-8 md:p-12 space-y-8 bg-white text-stone-900">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-stone-200 pb-6">
                <div className="flex items-center gap-4">
                  <Logo size="xl" className="shrink-0" />
                  <div>
                    <h1 className="text-2xl font-serif font-black tracking-tight text-stone-900 leading-none uppercase">{orgDetails.name}</h1>
                    <p className="text-xs text-stone-500 mt-1">High-End Modular Carpentry & Site Interiors</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">{orgDetails.address} • {orgDetails.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-stone-500 tracking-wider">Invoice</div>
                  <div className="text-[10.5px] text-stone-500 mt-1">Date: {invoicePreview.date}</div>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="pb-2 border-b border-stone-100 mb-2">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Invoice Number:</span>
                    <span className="text-sm font-mono font-bold text-stone-900 block">{invoicePreview.invoiceNumber}</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Billed To:</span>
                  <span className="text-sm font-bold text-stone-900 block">{invoicePreview.customerName}</span>
                  <span className="text-xs text-stone-600 block">Residential Site Execution</span>
                  <span className="text-[10.5px] text-stone-500 block">Email verified link</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Payment Details:</span>
                  <span className="text-xs font-bold text-stone-800 block">Milestone: {invoicePreview.type}</span>
                  <div className="flex flex-col items-end gap-1 mt-1">
                    <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      invoicePreview.status === "Paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {invoicePreview.status}
                    </span>
                    {invoicePreview.paymentMode && (
                      <span className="text-[10px] font-mono text-stone-600 font-medium">Mode: {invoicePreview.paymentMode}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-stone-200 rounded-lg overflow-hidden mt-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-4">Milestone Service Description</th>
                      <th className="py-2.5 px-4 text-center w-24">Tax Scope</th>
                      <th className="py-2.5 px-4 text-right w-36">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    <tr>
                      <td className="py-4 px-4 font-semibold text-stone-800">
                        {invoicePreview.notes || `Interior design execution and fitments for project milestone: ${invoicePreview.type}`}
                      </td>
                      <td className="py-4 px-4 text-center text-stone-500">CGST+SGST 0%</td>
                      <td className="py-4 px-4 text-right font-mono text-stone-900 font-bold">{formatCurrency(invoicePreview.amount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ledger Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(invoicePreview.amount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Integrated GST:</span>
                    <span className="font-mono">Included</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900 text-sm">
                    <span>Grand Total:</span>
                    <span className="font-mono">{formatCurrency(invoicePreview.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Signature Placeholder / Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-stone-200 text-xs">
                <div className="space-y-1.5 text-stone-600">
                  <h5 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Bank Details</h5>
                  <div className="text-[10px] space-y-0.5 leading-relaxed font-medium">
                    <div><span className="text-stone-400 font-semibold">Account Name:</span> Nilachal Creatives</div>
                    <div><span className="text-stone-400 font-semibold">Account Number:</span> 033311501000821</div>
                    <div><span className="text-stone-400 font-semibold">IFSC:</span> NESF0000333</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-stone-600">
                  <h5 className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">Terms & Conditions</h5>
                  <p className="text-[10px] leading-relaxed">
                    Please make payments via bank transfer or cheque in favor of "Nilachal Creatives". Warranty for all items delivered becomes effective only after final invoice clearance.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end items-end h-20">
                  <div className="w-36 border-b border-stone-300" />
                  <span className="text-[10px] text-stone-400 block mt-1.5">Authorized Signatory</span>
                  <span className="text-[9px] text-stone-500 block uppercase font-bold tracking-wider mt-0.5">{orgDetails.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
