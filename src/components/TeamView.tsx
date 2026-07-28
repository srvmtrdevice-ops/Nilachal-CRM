import React, { useState } from "react";
import { 
  Plus, Users, User, Hammer, Phone, Mail, Check, Calendar, 
  ClipboardList, Trash2, Edit2, X, Star, CreditCard, FileText, 
  Download, Share2, DollarSign, ArrowUpRight, Building2, CheckCircle2
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TeamMember, TeamTask, Project, SubcontractorPayment, getOrgDetails } from "../types";
import Logo from "./Logo";
import { drawPdfLogo } from "../utils/logoUtils";

interface TeamViewProps {
  team: TeamMember[];
  projects: Project[];
  subcontractorPayments?: SubcontractorPayment[];
  onAdd: (member: Omit<TeamMember, "id" | "createdAt">) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onAddTask: (id: string, task: TeamTask) => Promise<void>;
  onToggleAttendance: (id: string, date: string) => Promise<void>;
  onAddPayment?: (payment: Omit<SubcontractorPayment, "id" | "createdAt">) => Promise<void>;
  onDeletePayment?: (id: string) => Promise<void>;
}

export default function TeamView({ 
  team, 
  projects, 
  subcontractorPayments = [],
  onAdd, 
  onUpdate, 
  onDelete, 
  onAddTask, 
  onToggleAttendance,
  onAddPayment,
  onDeletePayment
}: TeamViewProps) {
  const org = getOrgDetails();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Ledger & Payment Register Modal State
  const [ledgerMember, setLedgerMember] = useState<TeamMember | null>(null);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  // Form states - Member
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Carpenter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState("Assemble kitchen tall unit carcasses");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Form states - Payment
  const [payAmount, setPayAmount] = useState<number>(5000);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payType, setPayType] = useState<SubcontractorPayment["paymentType"]>("Progress Payment");
  const [payProject, setPayProject] = useState("");
  const [payMode, setPayMode] = useState<SubcontractorPayment["paymentMode"]>("UPI");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const todayDate = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName("");
    setRole("Carpenter");
    setPhone("+91 ");
    setEmail("");
    setModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setEmail(member.email || "");
    setModalOpen(true);
  };

  const handleOpenAddTask = (member: TeamMember) => {
    setSelectedMember(member);
    if (projects.length > 0) {
      setProjectId(projects[0]?.id);
    }
    setTaskTitle("Assemble tall unit drawers");
    setTaskModalOpen(true);
  };

  // Open Payment Ledger Modal
  const handleOpenLedger = (member: TeamMember) => {
    setLedgerMember(member);
  };

  // Open New Payment Form
  const handleOpenAddPayment = (member: TeamMember) => {
    setLedgerMember(member);
    setPayAmount(5000);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayType("Progress Payment");
    setPayProject(projects.length > 0 ? `${projects[0].customerName} Site` : "General Site Work");
    setPayMode("UPI");
    setPayRef("");
    setPayNotes("");
    setPaymentFormOpen(true);
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      if (editingMember && onUpdate) {
        await onUpdate(editingMember.id, {
          name,
          role,
          phone,
          email
        });
      } else {
        await onAdd({
          name,
          role,
          phone,
          email,
          assignedTasks: [],
          attendance: []
        });
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !taskTitle) return;

    const proj = projects.find(p => p.id === projectId);
    const projectName = proj ? proj.customerName + " Site" : "General Workshop";

    const newTask: TeamTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskTitle,
      projectId,
      projectName,
      dueDate,
      status: "Pending"
    };

    try {
      await onAddTask(selectedMember.id, newTask);
      setTaskModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerMember || !payAmount || payAmount <= 0) return;

    if (onAddPayment) {
      await onAddPayment({
        memberId: ledgerMember.id,
        memberName: ledgerMember.name,
        date: payDate,
        amount: payAmount,
        paymentType: payType,
        projectName: payProject || "General Workshop",
        paymentMode: payMode,
        referenceNo: payRef,
        notes: payNotes
      });
    }

    setPaymentFormOpen(false);
  };

  // Helper to filter payments for a specific member
  const getMemberPayments = (memberId: string) => {
    return subcontractorPayments.filter(p => p.memberId === memberId);
  };

  // Helper to get total amount paid to member
  const getMemberTotalPaid = (memberId: string) => {
    return getMemberPayments(memberId).reduce((sum, p) => sum + p.amount, 0);
  };

  // Export PDF Ledger Generator
  const handleGeneratePDF = (member: TeamMember) => {
    const memberPayments = getMemberPayments(member.id);
    const doc = new jsPDF();

    // Company Brand Header Banner
    doc.setFillColor(28, 25, 23); // Dark stone
    doc.rect(0, 0, 210, 36, "F");

    // Render official Nilachal Creatives Logo
    drawPdfLogo(doc, 12, 6, 24);

    doc.setTextColor(245, 158, 11); // Amber accent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(org.name.toUpperCase(), 40, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`${org.hq} • Turnkey Interior & Woodwork Execution`, 40, 22);
    doc.text(`${org.address} • Ph: ${org.phone} • Email: ${org.email}`, 40, 28);

    // Document Title Banner
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 36, 210, 10, "F");
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("SUBCONTRACTOR PAYMENT REGISTER & STATEMENT OF LEDGER", 14, 42.5);

    // Subcontractor & Statement Information Box
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Subcontractor Name: ${member.name}`, 14, 54);
    doc.text(`Trade / Role: ${member.role}`, 14, 61);

    doc.setFont("helvetica", "normal");
    doc.text(`Contact Phone: ${member.phone}`, 120, 54);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, 120, 61);

    // Divider Line
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 66, 196, 66);

    // Table Columns & Rows
    const tableColumn = ["#", "Date", "Payment Type", "Project / Site", "Mode & Ref", "Amount (INR)"];
    const tableRows = memberPayments.map((p, idx) => [
      idx + 1,
      p.date,
      p.paymentType,
      p.projectName || "General Site Work",
      `${p.paymentMode}${p.referenceNo ? ` (${p.referenceNo})` : ""}`,
      `Rs. ${p.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { 
        fillColor: [245, 158, 11], 
        textColor: [28, 25, 23], 
        fontStyle: 'bold',
        fontSize: 9 
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

    // Summary Box below table
    const finalY = (doc as any).lastAutoTable?.finalY || 140;

    doc.setFillColor(254, 243, 199); // Soft amber tint
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, finalY + 6, 182, 14, 2, 2, "FD");

    doc.setTextColor(28, 25, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`CUMULATIVE PAYMENTS SETTLED:`, 20, finalY + 15);
    doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, 150, finalY + 15);

    // Notes / Terms
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("Note: This statement lists all authorized payments disbursed for site execution work and materials reimbursement.", 14, finalY + 28);

    // Verification Signatures
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 25, 23);
    doc.text("For Nilachal Creative", 14, finalY + 45);
    doc.text("Subcontractor Acknowledgment", 130, finalY + 45);

    doc.setFont("helvetica", "normal");
    doc.text("(Authorized Signature)", 14, finalY + 50);
    doc.text("(Signature & Date)", 130, finalY + 50);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, finalY + 40, 75, finalY + 40);
    doc.line(130, finalY + 40, 190, finalY + 40);

    // Trigger Save Download
    const fileName = `Ledger_${member.name.replace(/\s+/g, "_")}_Nilachal.pdf`;
    doc.save(fileName);
  };

  // WhatsApp Share Helper
  const handleShareWhatsApp = (member: TeamMember) => {
    const memberPayments = getMemberPayments(member.id);
    const totalPaid = getMemberTotalPaid(member.id);
    
    let msg = `*Nilachal Creative - Subcontractor Payment Ledger*\n\n`;
    msg += `*Subcontractor:* ${member.name} (${member.role})\n`;
    msg += `*Phone:* ${member.phone}\n`;
    msg += `*Total Settled:* ₹${totalPaid.toLocaleString('en-IN')}\n\n`;
    msg += `*Recent Payments:* \n`;
    
    memberPayments.forEach((p, idx) => {
      msg += `${idx + 1}. ${p.date} - ₹${p.amount.toLocaleString('en-IN')} (${p.paymentType} via ${p.paymentMode})\n`;
    });

    msg += `\nThank you for your partnership with Nilachal Creative!`;

    const encoded = encodeURIComponent(msg);
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const waUrl = cleanPhone.length >= 10 ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Site Subcontractors, Attendance & Payment Registers</h3>
          <p className="text-xs text-stone-400">Keep records of carpenters, plumbers, and painters, track daily check-ins, log disbursements, and generate PDF ledgers.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Grid of Team Members */}
      {team.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No team members registered. Log carpenters or painters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map(member => {
            const hasCheckedInToday = member.attendance.includes(todayDate);
            const memberPayments = getMemberPayments(member.id);
            const totalPaid = getMemberTotalPaid(member.id);

            return (
              <div 
                key={member.id} 
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/20 hover:shadow-xl transition flex flex-col justify-between space-y-4"
              >
                {/* Details top */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-stone-100 text-base">{member.name}</h4>
                      <span className="text-[10.5px] uppercase font-bold tracking-wider text-amber-500">{member.role}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Attendance Check-in Switcher */}
                      <button
                        onClick={() => onToggleAttendance(member.id, todayDate)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                          hasCheckedInToday 
                            ? "bg-green-600 text-white" 
                            : "bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200"
                        }`}
                        title="Toggle Daily Attendance"
                      >
                        <Check className="w-3.5 h-3.5" /> 
                        {hasCheckedInToday ? "Present" : "Check-in"}
                      </button>

                      {/* Edit & Delete Actions */}
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="p-1.5 bg-stone-950 hover:bg-stone-800 text-stone-400 hover:text-amber-500 border border-stone-800 rounded-lg text-xs transition cursor-pointer"
                        title="Edit Subcontractor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDelete && (
                        <button
                          onClick={() => onDelete(member.id)}
                          className="p-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded-lg text-xs transition cursor-pointer"
                          title="Delete Subcontractor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="space-y-1.5 text-xs text-stone-300 font-mono">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{member.phone}</span>
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 font-sans truncate">
                        <Mail className="w-3.5 h-3.5 text-stone-500" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-850 font-sans text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>Attendance: <strong className="text-stone-300 font-mono">{member.attendance.length} Days</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Register Summary Box */}
                  <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-400 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Payment Register
                      </span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        ₹{totalPaid.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenLedger(member)}
                        className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" /> Ledger ({memberPayments.length})
                      </button>
                      <button
                        onClick={() => handleOpenAddPayment(member)}
                        className="py-1.5 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Log Payment"
                      >
                        <Plus className="w-3.5 h-3.5" /> Pay
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(member)}
                        className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-500 border border-stone-800 rounded-lg text-xs transition cursor-pointer"
                        title="Download PDF Ledger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center border-b border-stone-850 pb-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" /> Field Assignments
                      </span>
                      <button
                        onClick={() => handleOpenAddTask(member)}
                        className="text-[10px] text-amber-500 hover:text-amber-400 font-bold cursor-pointer"
                      >
                        + Assign Task
                      </button>
                    </div>

                    {member.assignedTasks && member.assignedTasks.length > 0 ? (
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {member.assignedTasks.map((t) => (
                          <div key={t.id} className="bg-stone-950/40 p-2 rounded text-[11px] border border-stone-850 flex justify-between items-center">
                            <div>
                              <strong className="text-stone-200">{t.title}</strong>
                              <span className="block text-[9.5px] text-stone-500">{t.projectName} • Due: {t.dueDate}</span>
                            </div>
                            <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 rounded-full font-bold">
                              {t.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-500 italic py-1">No pending field tasks assigned.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subcontractor Ledger Modal */}
      {ledgerMember && !paymentFormOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-stone-950 px-6 py-4 border-b border-stone-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-100 text-lg">
                    Payment Register & Ledger
                  </h3>
                  <p className="text-xs text-amber-500 font-semibold">
                    {ledgerMember.name} • <span className="uppercase text-stone-400">{ledgerMember.role}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setLedgerMember(null)}
                className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Summary Banner Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Total Settled</div>
                  <div className="text-2xl font-bold font-serif text-amber-400 mt-0.5">
                    ₹{getMemberTotalPaid(ledgerMember.id).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Total Transactions</div>
                  <div className="text-2xl font-bold font-serif text-stone-100 mt-0.5">
                    {getMemberPayments(ledgerMember.id).length} Entries
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl">
                  <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Contact Phone</div>
                  <div className="text-sm font-bold font-mono text-stone-200 mt-1">
                    {ledgerMember.phone}
                  </div>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div className="text-xs text-stone-400">
                  Manage disbursements, download official PDF statements, or share via WhatsApp.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddPayment(ledgerMember)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Log Payment
                  </button>
                  <button
                    onClick={() => handleGeneratePDF(ledgerMember)}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition border border-stone-700 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-amber-500" /> Export PDF
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(ledgerMember)}
                    className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
                  Payment History & Ledger Items
                </h4>

                {getMemberPayments(ledgerMember.id).length === 0 ? (
                  <div className="bg-stone-950 border border-stone-800 p-8 text-center rounded-xl text-stone-500 text-xs">
                    No payment transactions recorded yet for this subcontractor.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-800 rounded-xl bg-stone-950">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="bg-stone-900 text-[10px] uppercase font-mono text-stone-400 border-b border-stone-800">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Site / Project</th>
                          <th className="px-4 py-3">Mode & Ref</th>
                          <th className="px-4 py-3 text-right">Amount (₹)</th>
                          <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 font-sans">
                        {getMemberPayments(ledgerMember.id).map((p) => (
                          <tr key={p.id} className="hover:bg-stone-900/50 transition">
                            <td className="px-4 py-3 font-mono text-stone-400 font-medium">{p.date}</td>
                            <td className="px-4 py-3 font-semibold text-amber-400">{p.paymentType}</td>
                            <td className="px-4 py-3 text-stone-300">{p.projectName || "General"}</td>
                            <td className="px-4 py-3 text-stone-400 font-mono text-[11px]">
                              {p.paymentMode} {p.referenceNo ? `(${p.referenceNo})` : ""}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-stone-100">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {onDeletePayment && (
                                <button
                                  onClick={() => onDeletePayment(p.id)}
                                  className="p-1 hover:bg-red-950 text-stone-500 hover:text-red-400 rounded transition cursor-pointer"
                                  title="Delete Payment Entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-950 px-6 py-3 border-t border-stone-800 flex justify-between items-center shrink-0 text-xs text-stone-400">
              <div>
                Total Entries: <strong className="text-stone-200">{getMemberPayments(ledgerMember.id).length}</strong>
              </div>
              <button
                onClick={() => setLedgerMember(null)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Payment Modal */}
      {paymentFormOpen && ledgerMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-950 px-6 py-4 border-b border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif font-bold text-stone-100 text-base">
                  Log Subcontractor Payment
                </h3>
              </div>
              <button 
                onClick={() => setPaymentFormOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs">
                <div className="text-stone-400 font-mono text-[10px] uppercase">Subcontractor</div>
                <div className="font-serif font-bold text-stone-100 text-sm">{ledgerMember.name}</div>
                <div className="text-amber-500 text-[10px] uppercase font-bold">{ledgerMember.role}</div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              {/* Payment Type & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Payment Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as SubcontractorPayment["paymentType"])}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    <option value="Advance">Advance</option>
                    <option value="Progress Payment">Progress Payment</option>
                    <option value="Final Settlement">Final Settlement</option>
                    <option value="Daily Wages">Daily Wages</option>
                    <option value="Material Reimbursement">Material Reimbursement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as SubcontractorPayment["paymentMode"])}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Project / Site */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Project / Site Name</label>
                {projects.length > 0 ? (
                  <select
                    value={payProject}
                    onChange={(e) => setPayProject(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={`${p.customerName} Site`}>
                        {p.customerName} Site
                      </option>
                    ))}
                    <option value="General Workshop Work">General Workshop Work</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={payProject}
                    onChange={(e) => setPayProject(e.target.value)}
                    placeholder="e.g. Dr. Alok Mohapatra Site"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                )}
              </div>

              {/* Reference / Txn No */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. UPI/38291047291 or NEFT-3829"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 font-mono outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Remarks / Purpose</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Wardrobe panelling stage payment"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setPaymentFormOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Edit / Register Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">
                {editingMember ? "Edit Subcontractor Details" : "Register Subcontractor"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMember} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sanjay Swain"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Trade Specialty / Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamMember["role"])}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                >
                  <option value="Carpenter">Carpenter</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Painter">Painter</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Designer">Designer</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98533 11223"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sanjay@nilachal.com"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  {editingMember ? "Save Changes" : "Register Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {taskModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Assign Field Task: {selectedMember.name}</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Task Title / Instructions</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Target Site Project</label>
                {projects.length > 0 ? (
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.customerName} Site
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-stone-500 italic">No specific site project assigned.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-stone-400">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
