import React, { useState, useMemo } from "react";
import { 
  UserPlus, Users, Briefcase, CreditCard, Plus, Search, 
  Share2, MessageSquare, Copy, Printer, Edit3, Trash2, 
  Building, Phone, Mail, FileText, CheckCircle2, Clock, 
  AlertCircle, IndianRupee, Filter, X, ChevronRight, 
  Hammer, Landmark, FileSpreadsheet, Check, ArrowUpRight
} from "lucide-react";
import { 
  Contractor, ContractorPayment, ContractorProjectContract, Project 
} from "../types";

interface ContractorsViewProps {
  contractors: Contractor[];
  contractorPayments: ContractorPayment[];
  projects: Project[];
  onAddContractor: (contractor: Omit<Contractor, "id" | "createdAt" | "updatedAt">) => Promise<string>;
  onUpdateContractor: (id: string, updates: Partial<Contractor>) => Promise<void>;
  onDeleteContractor: (id: string) => Promise<void>;
  onAddPayment: (payment: Omit<ContractorPayment, "id" | "createdAt">) => Promise<string>;
  onDeletePayment: (id: string) => Promise<void>;
}

export const TRADE_SPECIALTIES = [
  "Carpentry & Woodwork",
  "Electrical & Profile Lighting",
  "Plumbing & Sanitary",
  "Painting & Wall Finishes",
  "Civil & Tile Work",
  "False Ceiling & Gypsum",
  "Aluminum & Glass Fabrication",
  "Teak & Veneer Polishing",
  "Granite & Stone Fitting",
  "HVAC & AC Piping",
  "General Labor & Helpers",
  "Other Specialty"
];

export const ContractorsView: React.FC<ContractorsViewProps> = ({
  contractors,
  contractorPayments,
  projects,
  onAddContractor,
  onUpdateContractor,
  onDeleteContractor,
  onAddPayment,
  onDeletePayment
}) => {
  // State
  const [activeTab, setActiveTab] = useState<"directory" | "contracts" | "payments">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("All");
  
  // Helper to render color-coded status badges
  const renderPaymentStatusBadge = (status?: "Paid" | "Pending" | "Partial") => {
    const st = status || "Paid";
    if (st === "Paid") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Paid</span>
        </span>
      );
    }
    if (st === "Pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-2xs">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Pending</span>
        </span>
      );
    }
    if (st === "Partial") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-2xs">
          <AlertCircle className="w-3 h-3 text-blue-400" />
          <span>Partial</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-stone-800 text-stone-300 border border-stone-700">
        <span>{st}</span>
      </span>
    );
  };
  
  // Modals state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedContractorForContract, setSelectedContractorForContract] = useState<Contractor | null>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContractorForPayment, setSelectedContractorForPayment] = useState<Contractor | null>(null);

  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedContractorForLedger, setSelectedContractorForLedger] = useState<Contractor | null>(null);
  const [ledgerProjectFilter, setLedgerProjectFilter] = useState<string>("ALL");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Forms state
  const [contractorForm, setContractorForm] = useState({
    name: "",
    companyName: "",
    tradeSpecialty: TRADE_SPECIALTIES[0],
    customTrade: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    pan: "",
    bankAccountNo: "",
    bankName: "",
    bankIfsc: "",
    bankHolderName: "",
    status: "Active" as "Active" | "Onboarding" | "Inactive"
  });

  const [contractForm, setContractForm] = useState({
    projectId: "",
    contractAmount: "",
    scopeOfWork: "",
    startDate: new Date().toISOString().split("T")[0],
    targetCompletionDate: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    contractorId: "",
    projectId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentCategory: "Progress Payment" as ContractorPayment["paymentCategory"],
    paymentMode: "Bank Transfer" as ContractorPayment["paymentMode"],
    paymentStatus: "Paid" as "Paid" | "Pending" | "Partial",
    referenceNo: "",
    notes: ""
  });

  // Calculate totals helper
  const getContractorStats = (contractor: Contractor) => {
    const totalContractAmount = (contractor.projectContracts || []).reduce((acc, c) => acc + (Number(c.contractAmount) || 0), 0);
    const payments = contractorPayments.filter(p => p.contractorId === contractor.id);
    const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const balanceDue = totalContractAmount - totalPaid;
    return { totalContractAmount, totalPaid, balanceDue, paymentsCount: payments.length };
  };

  // KPI Overall Summaries
  const totalAgreedValue = useMemo(() => {
    return contractors.reduce((acc, contractor) => {
      return acc + (contractor.projectContracts || []).reduce((sum, c) => sum + (Number(c.contractAmount) || 0), 0);
    }, 0);
  }, [contractors]);

  const totalDisbursedPayments = useMemo(() => {
    return contractorPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [contractorPayments]);

  const totalOutstandingPayable = totalAgreedValue - totalDisbursedPayments;

  // Filtered Contractors
  const filteredContractors = useMemo(() => {
    return contractors.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.tradeSpecialty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTrade = tradeFilter === "All" || c.tradeSpecialty === tradeFilter;
      return matchesSearch && matchesTrade;
    });
  }, [contractors, searchQuery, tradeFilter]);

  // Filtered Contractor Payments for Disbursement Logs
  const filteredPayments = useMemo(() => {
    return contractorPayments.filter(p => {
      const st = p.status || "Paid";
      const matchesStatus = paymentStatusFilter === "All" || st === paymentStatusFilter;
      
      if (!searchQuery) return matchesStatus;
      const q = searchQuery.toLowerCase();
      const contractor = contractors.find(c => c.id === p.contractorId);
      const matchesSearch = 
        p.contractorName.toLowerCase().includes(q) ||
        (p.projectName || "").toLowerCase().includes(q) ||
        (p.referenceNo || "").toLowerCase().includes(q) ||
        p.paymentCategory.toLowerCase().includes(q) ||
        p.paymentMode.toLowerCase().includes(q) ||
        (contractor?.tradeSpecialty || "").toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [contractorPayments, paymentStatusFilter, searchQuery, contractors]);

  const paymentCounts = useMemo(() => {
    return {
      All: contractorPayments.length,
      Paid: contractorPayments.filter(p => (p.status || "Paid") === "Paid").length,
      Pending: contractorPayments.filter(p => p.status === "Pending").length,
      Partial: contractorPayments.filter(p => p.status === "Partial").length,
    };
  }, [contractorPayments]);

  // Handlers for Onboarding / Editing Contractor
  const handleOpenOnboard = (contractor?: Contractor) => {
    if (contractor) {
      setEditingContractor(contractor);
      setContractorForm({
        name: contractor.name,
        companyName: contractor.companyName || "",
        tradeSpecialty: TRADE_SPECIALTIES.includes(contractor.tradeSpecialty) ? contractor.tradeSpecialty : "Other Specialty",
        customTrade: TRADE_SPECIALTIES.includes(contractor.tradeSpecialty) ? "" : contractor.tradeSpecialty,
        phone: contractor.phone,
        email: contractor.email || "",
        address: contractor.address || "",
        gstin: contractor.gstin || "",
        pan: contractor.pan || "",
        bankAccountNo: contractor.bankDetails?.accountNo || "",
        bankName: contractor.bankDetails?.bankName || "",
        bankIfsc: contractor.bankDetails?.ifsc || "",
        bankHolderName: contractor.bankDetails?.holderName || "",
        status: contractor.status
      });
    } else {
      setEditingContractor(null);
      setContractorForm({
        name: "",
        companyName: "",
        tradeSpecialty: TRADE_SPECIALTIES[0],
        customTrade: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
        pan: "",
        bankAccountNo: "",
        bankName: "",
        bankIfsc: "",
        bankHolderName: "",
        status: "Active"
      });
    }
    setShowOnboardModal(true);
  };

  const handleSaveContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorForm.name.trim() || !contractorForm.phone.trim()) {
      alert("Please provide Contractor Name and Phone Number.");
      return;
    }

    const trade = contractorForm.tradeSpecialty === "Other Specialty" && contractorForm.customTrade.trim()
      ? contractorForm.customTrade.trim()
      : contractorForm.tradeSpecialty;

    const payload = {
      name: contractorForm.name.trim(),
      companyName: contractorForm.companyName.trim() || undefined,
      tradeSpecialty: trade,
      phone: contractorForm.phone.trim(),
      email: contractorForm.email.trim() || undefined,
      address: contractorForm.address.trim() || undefined,
      gstin: contractorForm.gstin.trim() || undefined,
      pan: contractorForm.pan.trim() || undefined,
      bankDetails: (contractorForm.bankAccountNo || contractorForm.bankName) ? {
        accountNo: contractorForm.bankAccountNo.trim() || undefined,
        bankName: contractorForm.bankName.trim() || undefined,
        ifsc: contractorForm.bankIfsc.trim() || undefined,
        holderName: contractorForm.bankHolderName.trim() || undefined
      } : undefined,
      status: contractorForm.status,
      projectContracts: editingContractor ? editingContractor.projectContracts : []
    };

    if (editingContractor) {
      await onUpdateContractor(editingContractor.id, payload);
    } else {
      await onAddContractor(payload);
    }

    setShowOnboardModal(false);
  };

  // Handlers for Setting Contract Amount per Project
  const handleOpenSetContract = (contractor: Contractor) => {
    setSelectedContractorForContract(contractor);
    setContractForm({
      projectId: projects[0]?.id || "",
      contractAmount: "",
      scopeOfWork: "",
      startDate: new Date().toISOString().split("T")[0],
      targetCompletionDate: ""
    });
    setShowContractModal(true);
  };

  const handleSaveProjectContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractorForContract || !contractForm.projectId || !contractForm.contractAmount) {
      alert("Please select a project and enter a valid contract amount.");
      return;
    }

    const selectedProj = projects.find(p => p.id === contractForm.projectId);
    const amount = Number(contractForm.contractAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Contract amount must be a positive number.");
      return;
    }

    const newContract: ContractorProjectContract = {
      id: `cnt_proj_${Date.now()}`,
      projectId: contractForm.projectId,
      projectName: selectedProj ? selectedProj.customerName : "Project",
      contractAmount: amount,
      scopeOfWork: contractForm.scopeOfWork.trim() || undefined,
      startDate: contractForm.startDate || undefined,
      targetCompletionDate: contractForm.targetCompletionDate || undefined
    };

    const existingContracts = selectedContractorForContract.projectContracts || [];
    // Replace if project contract already exists, or append
    const updatedContracts = existingContracts.some(c => c.projectId === contractForm.projectId)
      ? existingContracts.map(c => c.projectId === contractForm.projectId ? { ...c, ...newContract } : c)
      : [...existingContracts, newContract];

    await onUpdateContractor(selectedContractorForContract.id, {
      projectContracts: updatedContracts
    });

    setShowContractModal(false);
  };

  const handleDeleteProjectContract = async (contractorId: string, contractId: string) => {
    if (!confirm("Are you sure you want to remove this project contract assignment?")) return;
    const contractor = contractors.find(c => c.id === contractorId);
    if (!contractor) return;

    const updatedContracts = (contractor.projectContracts || []).filter(c => c.id !== contractId);
    await onUpdateContractor(contractorId, {
      projectContracts: updatedContracts
    });
  };

  // Handlers for Recording Payments
  const handleOpenRecordPayment = (contractor?: Contractor) => {
    const target = contractor || contractors[0];
    setSelectedContractorForPayment(target || null);
    
    // Choose first assigned project or empty
    const firstProjId = target?.projectContracts?.[0]?.projectId || projects[0]?.id || "";

    setPaymentForm({
      contractorId: target?.id || "",
      projectId: firstProjId,
      amount: "",
      date: new Date().toISOString().split("T")[0],
      paymentCategory: "Progress Payment",
      paymentMode: "Bank Transfer",
      paymentStatus: "Paid",
      referenceNo: "",
      notes: ""
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const contractorId = paymentForm.contractorId || selectedContractorForPayment?.id;
    if (!contractorId) {
      alert("Please select a contractor.");
      return;
    }

    const contractor = contractors.find(c => c.id === contractorId);
    const amount = Number(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const selectedProj = projects.find(p => p.id === paymentForm.projectId);
    const assignedContract = contractor?.projectContracts?.find(c => c.projectId === paymentForm.projectId);

    await onAddPayment({
      contractorId: contractorId,
      contractorName: contractor?.name || "Contractor",
      projectId: paymentForm.projectId || undefined,
      projectName: assignedContract?.projectName || selectedProj?.customerName || undefined,
      amount,
      date: paymentForm.date,
      paymentCategory: paymentForm.paymentCategory,
      paymentMode: paymentForm.paymentMode,
      status: paymentForm.paymentStatus,
      referenceNo: paymentForm.referenceNo.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined
    });

    setShowPaymentModal(false);
  };

  // Handlers for Ledger & WhatsApp Sharing
  const handleOpenLedger = (contractor: Contractor) => {
    setSelectedContractorForLedger(contractor);
    setLedgerProjectFilter("ALL");
    setShowLedgerModal(true);
  };

  // Generate WhatsApp Ledger Text
  const generateWhatsAppMessage = (contractor: Contractor, projectFilter: string) => {
    const payments = contractorPayments.filter(p => p.contractorId === contractor.id && (
      projectFilter === "ALL" || p.projectId === projectFilter
    ));

    const contracts = (contractor.projectContracts || []).filter(c => (
      projectFilter === "ALL" || c.projectId === projectFilter
    ));

    const totalContractVal = contracts.reduce((acc, c) => acc + c.contractAmount, 0);
    const totalPaidVal = payments.reduce((acc, p) => acc + p.amount, 0);
    const balanceVal = totalContractVal - totalPaidVal;

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    let text = `*STATEMENT OF ACCOUNT / PAYMENT LEDGER*\n`;
    text += `*NILACHAL CREATIVES STUDIO*\n`;
    text += `------------------------------------\n`;
    text += `*Contractor Name:* ${contractor.name}\n`;
    if (contractor.companyName) text += `*Firm/Company:* ${contractor.companyName}\n`;
    text += `*Specialty:* ${contractor.tradeSpecialty}\n`;
    text += `*Phone:* ${contractor.phone}\n\n`;

    text += `*PROJECT CONTRACT SUMMARY:*\n`;
    if (contracts.length === 0) {
      text += `• No contract amounts specified\n`;
    } else {
      contracts.forEach((c, idx) => {
        text += `${idx + 1}. *${c.projectName}*: ₹${c.contractAmount.toLocaleString('en-IN')}\n`;
        if (c.scopeOfWork) text += `   Scope: ${c.scopeOfWork}\n`;
      });
    }
    text += `------------------------------------\n`;
    text += `*TOTAL CONTRACT VALUE:* ₹${totalContractVal.toLocaleString('en-IN')}\n\n`;

    text += `*PAYMENTS DISBURSED LOG:*\n`;
    if (payments.length === 0) {
      text += `No payment records logged yet.\n`;
    } else {
      payments.forEach((p, idx) => {
        const pDate = new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        text += `${idx + 1}. *${pDate}* - ₹${p.amount.toLocaleString('en-IN')}\n`;
        text += `   Category: ${p.paymentCategory} | Mode: ${p.paymentMode} | Status: [${p.status || "Paid"}]\n`;
        if (p.projectName) text += `   Project: ${p.projectName}\n`;
        if (p.referenceNo) text += `   Ref No: ${p.referenceNo}\n`;
      });
    }

    text += `\n------------------------------------\n`;
    text += `*TOTAL PAID TO DATE:* ₹${totalPaidVal.toLocaleString('en-IN')}\n`;
    text += `*OUTSTANDING BALANCE DUE:* ₹${balanceVal.toLocaleString('en-IN')}\n`;
    text += `------------------------------------\n`;
    text += `Statement generated on: ${todayStr}\n`;
    text += `For queries, contact Nilachal Creatives Team.`;

    return text;
  };

  const handleSendWhatsApp = (contractor: Contractor) => {
    const message = generateWhatsAppMessage(contractor, ledgerProjectFilter);
    const cleanedPhone = contractor.phone.replace(/[^0-9]/g, "");
    // If Indian number without country code, add 91
    const targetPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleCopyLedgerText = (contractor: Contractor) => {
    const message = generateWhatsAppMessage(contractor, ledgerProjectFilter);
    navigator.clipboard.writeText(message);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 p-6 rounded-2xl border border-stone-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs tracking-widest uppercase mb-1">
            <Hammer className="w-4 h-4" />
            <span>Subcontractors & Trade Management</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-100 tracking-tight">Contractors Office</h1>
          <p className="text-stone-400 text-sm mt-0.5">
            Onboard trade contractors, set project contract amounts, record payment disbursements, and share statements via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenRecordPayment()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm rounded-xl border border-emerald-500/20 transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => handleOpenOnboard()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Contractor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Total Contractors</p>
            <h3 className="text-2xl font-serif font-bold text-stone-100 mt-0.5">{contractors.length}</h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">
              {contractors.filter(c => c.status === "Active").length} Active on projects
            </p>
          </div>
        </div>

        <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Agreed Contract Value</p>
            <h3 className="text-2xl font-serif font-bold text-stone-100 mt-0.5">₹{totalAgreedValue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-blue-400 font-medium mt-0.5">Total across assigned projects</p>
          </div>
        </div>

        <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Total Disbursed</p>
            <h3 className="text-2xl font-serif font-bold text-emerald-400 mt-0.5">₹{totalDisbursedPayments.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {contractorPayments.length} Payments recorded
            </p>
          </div>
        </div>

        <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Outstanding Payable</p>
            <h3 className="text-2xl font-serif font-bold text-amber-400 mt-0.5">₹{Math.max(0, totalOutstandingPayable).toLocaleString('en-IN')}</h3>
            <p className="text-xs text-amber-400 font-medium mt-0.5">Remaining balance to clear</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-xs overflow-hidden">
        <div className="border-b border-stone-800 px-6 pt-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("directory")}
              className={`pb-3.5 px-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "directory"
                  ? "border-amber-500 text-amber-500 font-bold"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Contractors Directory ({filteredContractors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              className={`pb-3.5 px-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "contracts"
                  ? "border-amber-500 text-amber-500 font-bold"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Project Contracts</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`pb-3.5 px-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                activeTab === "payments"
                  ? "border-amber-500 text-amber-500 font-bold"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Disbursement Logs ({contractorPayments.length})</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 pb-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contractor, trade, phone..."
                className="w-full pl-9 pr-3 py-1.5 bg-stone-950 text-stone-100 placeholder:text-stone-500 text-sm rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="px-3 py-1.5 bg-stone-950 text-stone-200 text-sm rounded-xl border border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="All">All Trade Specialties</option>
              {TRADE_SPECIALTIES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: CONTRACTORS DIRECTORY */}
        {activeTab === "directory" && (
          <div className="p-6">
            {filteredContractors.length === 0 ? (
              <div className="text-center py-16 bg-stone-950/50 rounded-xl border border-dashed border-stone-800">
                <Users className="w-12 h-12 text-stone-600 mx-auto mb-3" />
                <h3 className="text-stone-200 font-semibold text-lg">No contractors found</h3>
                <p className="text-stone-400 text-sm mt-1 max-w-sm mx-auto">
                  {searchQuery || tradeFilter !== "All"
                    ? "Try adjusting your search criteria or trade filter."
                    : "Start by onboarding your first subcontractor or trade partner."}
                </p>
                <button
                  onClick={() => handleOpenOnboard()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard New Contractor</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredContractors.map(contractor => {
                  const stats = getContractorStats(contractor);
                  return (
                    <div
                      key={contractor.id}
                      className="bg-stone-900 rounded-2xl border border-stone-800 p-5 shadow-xs hover:border-stone-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20 mb-1.5">
                              {contractor.tradeSpecialty}
                            </span>
                            <h3 className="text-stone-100 font-serif font-bold text-lg leading-snug">{contractor.name}</h3>
                            {contractor.companyName && (
                              <p className="text-stone-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-stone-500" />
                                <span>{contractor.companyName}</span>
                              </p>
                            )}
                          </div>

                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
                            contractor.status === "Active" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : contractor.status === "Onboarding" 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                              : "bg-stone-800 text-stone-400 border border-stone-700"
                          }`}>
                            {contractor.status}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="space-y-1.5 text-xs text-stone-300 border-t border-stone-800 pt-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <a href={`tel:${contractor.phone}`} className="hover:text-amber-400 font-medium">{contractor.phone}</a>
                          </div>
                          {contractor.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              <span className="truncate">{contractor.email}</span>
                            </div>
                          )}
                          {contractor.address && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              <span className="truncate">{contractor.address}</span>
                            </div>
                          )}
                          {contractor.bankDetails?.accountNo && (
                            <div className="flex items-center gap-2 text-stone-300 bg-stone-950 p-2 rounded-lg mt-2 border border-stone-800">
                              <Landmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="font-mono text-[11px]">
                                {contractor.bankDetails.bankName ? `${contractor.bankDetails.bankName}: ` : ""}
                                A/C {contractor.bankDetails.accountNo}
                                {contractor.bankDetails.ifsc ? ` (${contractor.bankDetails.ifsc})` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Financial summary metrics */}
                        <div className="bg-stone-950 rounded-xl p-3 border border-stone-800 mb-4 grid grid-cols-3 gap-2 text-center">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-stone-400 block">Agreed</span>
                            <span className="text-xs font-bold text-stone-100 mt-0.5 block">
                              ₹{stats.totalContractAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold uppercase text-stone-400 block">Disbursed</span>
                            <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                              ₹{stats.totalPaid.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold uppercase text-stone-400 block">Balance</span>
                            <span className="text-xs font-bold text-amber-400 mt-0.5 block">
                              ₹{Math.max(0, stats.balanceDue).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Assigned Projects list */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Assigned Projects ({(contractor.projectContracts || []).length})</span>
                            <button
                              onClick={() => handleOpenSetContract(contractor)}
                              className="text-amber-400 hover:text-amber-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Set Contract
                            </button>
                          </p>

                          {(contractor.projectContracts || []).length === 0 ? (
                            <p className="text-xs text-stone-500 italic bg-stone-950 p-2.5 rounded-lg border border-dashed border-stone-800">
                              No active project contract set. Click "+ Set Contract" to assign a project & amount.
                            </p>
                          ) : (
                            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                              {contractor.projectContracts.map(c => (
                                <div key={c.id} className="text-xs bg-stone-950 p-2 rounded-lg border border-stone-800 flex items-center justify-between">
                                  <div className="truncate pr-2">
                                    <span className="font-semibold text-stone-200 block truncate">{c.projectName}</span>
                                    {c.scopeOfWork && (
                                      <span className="text-[11px] text-stone-400 truncate block">{c.scopeOfWork}</span>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-stone-100 block">₹{c.contractAmount.toLocaleString('en-IN')}</span>
                                    <button
                                      onClick={() => handleDeleteProjectContract(contractor.id, c.id)}
                                      className="text-red-400 hover:text-red-300 text-[10px] underline cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-3 border-t border-stone-800 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenLedger(contractor)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Ledger & WhatsApp</span>
                        </button>

                        <button
                          onClick={() => handleOpenRecordPayment(contractor)}
                          className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenOnboard(contractor)}
                          className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                          title="Edit Contractor"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete contractor ${contractor.name}?`)) {
                              onDeleteContractor(contractor.id);
                            }
                          }}
                          className="px-2 py-2 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Contractor"
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

        {/* TAB 2: PROJECT CONTRACTS ASSIGNMENTS */}
        {activeTab === "contracts" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-stone-100 font-serif font-bold text-base">Project Contract Values</h3>
                <p className="text-stone-400 text-xs mt-0.5">Assigned contractor amounts and scope of work breakdown per project site.</p>
              </div>

              <button
                onClick={() => {
                  if (contractors.length === 0) {
                    alert("Please onboard a contractor first.");
                    return;
                  }
                  handleOpenSetContract(contractors[0]);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Set New Project Contract</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-800 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-950 text-stone-400 uppercase text-xs font-semibold border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4">Trade Specialty</th>
                    <th className="py-3 px-4">Project Site</th>
                    <th className="py-3 px-4">Scope of Work</th>
                    <th className="py-3 px-4 text-right">Agreed Contract (₹)</th>
                    <th className="py-3 px-4 text-right">Disbursed (₹)</th>
                    <th className="py-3 px-4 text-right">Balance Due (₹)</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {contractors.flatMap(contractor => 
                    (contractor.projectContracts || []).map(contract => {
                      const projPayments = contractorPayments.filter(p => p.contractorId === contractor.id && p.projectId === contract.projectId);
                      const paid = projPayments.reduce((sum, p) => sum + p.amount, 0);
                      const balance = contract.contractAmount - paid;

                      return (
                        <tr key={`${contractor.id}_${contract.id}`} className="hover:bg-stone-850/60 transition-colors text-stone-200">
                          <td className="py-3 px-4 font-bold text-stone-100">
                            {contractor.name}
                            {contractor.companyName && (
                              <span className="block text-xs font-normal text-stone-400">{contractor.companyName}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-md border border-amber-500/20">
                              {contractor.tradeSpecialty}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-stone-200">
                            {contract.projectName}
                          </td>
                          <td className="py-3 px-4 text-xs text-stone-400 max-w-xs truncate">
                            {contract.scopeOfWork || "Standard contract work"}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-stone-100">
                            ₹{contract.contractAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                            ₹{paid.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-amber-400">
                            ₹{Math.max(0, balance).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenLedger(contractor)}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                                title="View Ledger"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProjectContract(contractor.id, contract.id)}
                                className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                                title="Delete Contract"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {contractors.every(c => (c.projectContracts || []).length === 0) && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        No project contracts assigned yet. Click "Set New Project Contract" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DISBURSEMENT LOGS */}
        {activeTab === "payments" && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-stone-100 font-serif font-bold text-base">Payment Disbursement Records</h3>
                <p className="text-stone-400 text-xs mt-0.5">Log of all payments, advances, and settlements paid to contractors.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status filter tabs */}
                <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
                  {(["All", "Paid", "Pending", "Partial"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setPaymentStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                        paymentStatusFilter === st
                          ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        paymentStatusFilter === st ? "bg-stone-950 text-amber-400 font-bold" : "bg-stone-800 text-stone-300"
                      }`}>
                        {paymentCounts[st]}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleOpenRecordPayment()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/20 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-800 rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-950 text-stone-400 uppercase text-xs font-semibold border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mode & Ref</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {filteredPayments.map(p => {
                    const contractor = contractors.find(c => c.id === p.contractorId);
                    return (
                      <tr key={p.id} className="hover:bg-stone-850/60 transition-colors text-stone-200">
                        <td className="py-3 px-4 font-mono text-xs text-stone-400">
                          {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-stone-100">
                          {p.contractorName}
                          {contractor?.tradeSpecialty && (
                            <span className="block text-xs font-normal text-stone-400">{contractor.tradeSpecialty}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-stone-200">
                          {p.projectName || "General / Unallocated"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            p.paymentCategory === "Advance" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                            p.paymentCategory === "Final Settlement" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {p.paymentCategory}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderPaymentStatusBadge(p.status)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-semibold text-stone-200 block">{p.paymentMode}</span>
                          {p.referenceNo && (
                            <span className="font-mono text-stone-400 text-[11px] block">Ref: {p.referenceNo}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400 text-base">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm("Delete this payment record?")) {
                                onDeletePayment(p.id);
                              }
                            }}
                            className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                            title="Delete Payment Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        {contractorPayments.length === 0 
                          ? "No contractor payments recorded yet." 
                          : `No payments found with status '${paymentStatusFilter}'.`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ONBOARD / EDIT CONTRACTOR */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 rounded-2xl max-w-xl w-full shadow-2xl border border-stone-800 overflow-hidden my-8 text-stone-100">
            <div className="px-6 py-4 bg-stone-950 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg">{editingContractor ? "Edit Contractor Profile" : "Onboard New Contractor"}</h3>
              </div>
              <button onClick={() => setShowOnboardModal(false)} className="text-stone-400 hover:text-stone-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContractor} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Contractor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contractorForm.name}
                    onChange={(e) => setContractorForm({ ...contractorForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar Swain"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    type="text"
                    value={contractorForm.companyName}
                    onChange={(e) => setContractorForm({ ...contractorForm, companyName: e.target.value })}
                    placeholder="e.g. Swain Interior & Modular Solutions"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Trade Specialty *
                  </label>
                  <select
                    value={contractorForm.tradeSpecialty}
                    onChange={(e) => setContractorForm({ ...contractorForm, tradeSpecialty: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {TRADE_SPECIALTIES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {contractorForm.tradeSpecialty === "Other Specialty" ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                      Specify Trade
                    </label>
                    <input
                      type="text"
                      value={contractorForm.customTrade}
                      onChange={(e) => setContractorForm({ ...contractorForm, customTrade: e.target.value })}
                      placeholder="e.g. Wallpaper & POP Specialist"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                      Phone Number * (For WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      value={contractorForm.phone}
                      onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })}
                      placeholder="+91 98000 00000"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                    />
                  </div>
                )}
              </div>

              {contractorForm.tradeSpecialty === "Other Specialty" && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Phone Number * (For WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={contractorForm.phone}
                    onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contractorForm.email}
                    onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })}
                    placeholder="contractor@domain.com"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={contractorForm.status}
                    onChange={(e) => setContractorForm({ ...contractorForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Address / Office Location
                </label>
                <input
                  type="text"
                  value={contractorForm.address}
                  onChange={(e) => setContractorForm({ ...contractorForm, address: e.target.value })}
                  placeholder="e.g. Unit 4, Industrial Area, Patia, Bhubaneswar"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                />
              </div>

              {/* Tax & Bank Details Section */}
              <div className="pt-3 border-t border-stone-800">
                <h4 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-amber-500" />
                  <span>Tax & Bank Account Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={contractorForm.gstin}
                      onChange={(e) => setContractorForm({ ...contractorForm, gstin: e.target.value.toUpperCase() })}
                      placeholder="21AAAAA0000A1Z5"
                      className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-100 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={contractorForm.pan}
                      onChange={(e) => setContractorForm({ ...contractorForm, pan: e.target.value.toUpperCase() })}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs font-mono text-stone-100 uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={contractorForm.bankName}
                      onChange={(e) => setContractorForm({ ...contractorForm, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder:text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={contractorForm.bankAccountNo}
                      onChange={(e) => setContractorForm({ ...contractorForm, bankAccountNo: e.target.value })}
                      placeholder="501000282190"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs font-mono text-stone-100 placeholder:text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={contractorForm.bankIfsc}
                      onChange={(e) => setContractorForm({ ...contractorForm, bankIfsc: e.target.value.toUpperCase() })}
                      placeholder="HDFC0001234"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs font-mono uppercase text-stone-100 placeholder:text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={contractorForm.bankHolderName}
                      onChange={(e) => setContractorForm({ ...contractorForm, bankHolderName: e.target.value })}
                      placeholder="e.g. Rajesh Kumar Swain"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder:text-stone-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2 border border-stone-800 text-stone-300 font-medium text-sm rounded-xl hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-xs cursor-pointer"
                >
                  {editingContractor ? "Update Profile" : "Save & Onboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SET PROJECT CONTRACT AMOUNT */}
      {showContractModal && selectedContractorForContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-800 overflow-hidden text-stone-100">
            <div className="px-6 py-4 bg-stone-950 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg">Set Project Contract Amount</h3>
              </div>
              <button onClick={() => setShowContractModal(false)} className="text-stone-400 hover:text-stone-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectContract} className="p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center shrink-0">
                  {selectedContractorForContract.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-stone-100 text-sm">{selectedContractorForContract.name}</h4>
                  <p className="text-xs text-amber-400 font-medium">{selectedContractorForContract.tradeSpecialty}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Select Project Site *
                </label>
                <select
                  required
                  value={contractForm.projectId}
                  onChange={(e) => setContractForm({ ...contractForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.customerName} ({p.roomTypes.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Agreed Contract Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-500 font-semibold">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={contractForm.contractAmount}
                    onChange={(e) => setContractForm({ ...contractForm, contractAmount: e.target.value })}
                    placeholder="e.g. 150000"
                    className="w-full pl-8 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm font-semibold text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Scope of Work Description
                </label>
                <textarea
                  rows={3}
                  value={contractForm.scopeOfWork}
                  onChange={(e) => setContractForm({ ...contractForm, scopeOfWork: e.target.value })}
                  placeholder="e.g. Full modular carcass fitting, 4 wardrobes assembly, and shutter laminates installation."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 placeholder:text-stone-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={contractForm.targetCompletionDate}
                    onChange={(e) => setContractForm({ ...contractForm, targetCompletionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 border border-stone-800 text-stone-300 font-medium text-sm rounded-xl hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-xs cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-800 overflow-hidden text-stone-100">
            <div className="px-6 py-4 bg-stone-950 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif font-bold text-lg">Record Contractor Disbursement</h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-stone-400 hover:text-stone-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Contractor *
                </label>
                <select
                  required
                  value={paymentForm.contractorId || selectedContractorForPayment?.id || ""}
                  onChange={(e) => {
                    const sel = contractors.find(c => c.id === e.target.value);
                    setSelectedContractorForPayment(sel || null);
                    setPaymentForm({ ...paymentForm, contractorId: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">Select contractor...</option>
                  {contractors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.tradeSpecialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Project Site
                </label>
                <select
                  value={paymentForm.projectId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">General / Unallocated Advance</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.customerName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Disbursement Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm font-bold text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={paymentForm.paymentCategory}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentCategory: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-medium text-stone-100"
                  >
                    <option value="Progress Payment">Progress Payment</option>
                    <option value="Advance">Advance</option>
                    <option value="Final Settlement">Final Settlement</option>
                    <option value="Material Reimbursement">Material Reimbursement</option>
                    <option value="Retention Release">Retention Release</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Status *
                  </label>
                  <select
                    value={paymentForm.paymentStatus}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentStatus: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-bold text-stone-100"
                  >
                    <option value="Paid">✓ Paid</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="Partial">⚡ Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                    Mode
                  </label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMode: e.target.value as any })}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs font-medium text-stone-100"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Reference / UTR / Transaction No
                </label>
                <input
                  type="text"
                  value={paymentForm.referenceNo}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                  placeholder="e.g. UTR3819024190 / Chq 441029"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm font-mono text-stone-100 placeholder:text-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Notes / Payment Remarks
                </label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="e.g. Released post kitchen carcass installation verification"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder:text-stone-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-stone-800 text-stone-300 font-medium text-sm rounded-xl hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm rounded-xl shadow-xs cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PAYMENT LEDGER & WHATSAPP SHARING */}
      {showLedgerModal && selectedContractorForLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-800 overflow-hidden my-6 text-stone-100">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-stone-950 text-stone-100 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg">Contractor Payment Ledger Statement</h3>
              </div>
              <button onClick={() => setShowLedgerModal(false)} className="text-stone-400 hover:text-stone-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Project Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-950 p-4 rounded-xl border border-stone-800">
                <div>
                  <h4 className="font-bold text-stone-100 text-base">{selectedContractorForLedger.name}</h4>
                  <p className="text-xs text-stone-400 font-medium">{selectedContractorForLedger.tradeSpecialty} • Phone: {selectedContractorForLedger.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 font-medium">Filter Site:</span>
                  <select
                    value={ledgerProjectFilter}
                    onChange={(e) => setLedgerProjectFilter(e.target.value)}
                    className="px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs font-semibold text-stone-200"
                  >
                    <option value="ALL">All Projects Merged</option>
                    {(selectedContractorForLedger.projectContracts || []).map(c => (
                      <option key={c.projectId} value={c.projectId}>{c.projectName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Printable Statement Area */}
              <div id="printable-ledger" className="bg-stone-950 border border-stone-800 rounded-2xl p-5 shadow-xs space-y-4">
                {/* Org branding header */}
                <div className="border-b border-stone-800 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold tracking-wider uppercase text-amber-500">Nilachal Creatives Studio</span>
                    <h2 className="text-xl font-serif font-bold text-stone-100">STATEMENT OF ACCOUNT</h2>
                  </div>
                  <div className="text-right text-xs text-stone-400">
                    <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
                    <p className="font-semibold text-stone-300">Official Ledger Copy</p>
                  </div>
                </div>

                {/* KPI Metrics */}
                {(() => {
                  const contracts = (selectedContractorForLedger.projectContracts || []).filter(c => (
                    ledgerProjectFilter === "ALL" || c.projectId === ledgerProjectFilter
                  ));
                  const payments = contractorPayments.filter(p => p.contractorId === selectedContractorForLedger.id && (
                    ledgerProjectFilter === "ALL" || p.projectId === ledgerProjectFilter
                  ));

                  const totContract = contracts.reduce((sum, c) => sum + c.contractAmount, 0);
                  const totPaid = payments.reduce((sum, p) => sum + p.amount, 0);
                  const balDue = totContract - totPaid;

                  return (
                    <>
                      <div className="grid grid-cols-3 gap-3 bg-stone-900 text-stone-100 p-4 rounded-xl text-center border border-stone-800">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">Total Agreed</span>
                          <span className="text-base font-bold mt-0.5 block">₹{totContract.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Total Paid</span>
                          <span className="text-base font-bold text-emerald-400 mt-0.5 block">₹{totPaid.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Balance Payable</span>
                          <span className="text-base font-bold text-amber-400 mt-0.5 block">₹{Math.max(0, balDue).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Project Agreements breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">1. Project Contract Commitments</h4>
                        {contracts.length === 0 ? (
                          <p className="text-xs text-stone-500 italic">No specific project contract amounts set.</p>
                        ) : (
                          <table className="w-full text-xs text-left border border-stone-800 rounded-lg overflow-hidden">
                            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800">
                              <tr>
                                <th className="py-2 px-3">Project Name</th>
                                <th className="py-2 px-3">Scope of Work</th>
                                <th className="py-2 px-3 text-right">Contract Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800/80">
                              {contracts.map(c => (
                                <tr key={c.id}>
                                  <td className="py-2 px-3 font-semibold text-stone-100">{c.projectName}</td>
                                  <td className="py-2 px-3 text-stone-400">{c.scopeOfWork || "General Trade Work"}</td>
                                  <td className="py-2 px-3 text-right font-bold text-stone-100">₹{c.contractAmount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>

                      {/* Payments Log breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">2. Disbursed Payments Log</h4>
                        {payments.length === 0 ? (
                          <p className="text-xs text-stone-500 italic">No payments recorded yet.</p>
                        ) : (
                          <table className="w-full text-xs text-left border border-stone-800 rounded-lg overflow-hidden">
                            <thead className="bg-stone-900 text-stone-400 font-semibold border-b border-stone-800">
                              <tr>
                                <th className="py-2 px-3">Date</th>
                                <th className="py-2 px-3">Project</th>
                                <th className="py-2 px-3">Category</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3">Mode / Ref</th>
                                <th className="py-2 px-3 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-800/80">
                              {payments.map(p => (
                                <tr key={p.id}>
                                  <td className="py-2 px-3 font-mono text-stone-400">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                                  <td className="py-2 px-3 font-medium text-stone-200">{p.projectName || "General"}</td>
                                  <td className="py-2 px-3 text-stone-400">{p.paymentCategory}</td>
                                  <td className="py-2 px-3">{renderPaymentStatusBadge(p.status)}</td>
                                  <td className="py-2 px-3 text-stone-400">{p.paymentMode} {p.referenceNo ? `(${p.referenceNo})` : ''}</td>
                                  <td className="py-2 px-3 text-right font-bold text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Formatted Text Box for WhatsApp Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase mb-1">
                  Formatted WhatsApp Message Preview
                </label>
                <textarea
                  readOnly
                  rows={8}
                  value={generateWhatsAppMessage(selectedContractorForLedger, ledgerProjectFilter)}
                  className="w-full p-3 bg-stone-950 text-emerald-400 font-mono text-xs rounded-xl border border-stone-800 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => handleCopyLedgerText(selectedContractorForLedger)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Statement Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-stone-800 text-stone-300 hover:bg-stone-800 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print PDF</span>
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(selectedContractorForLedger)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Share via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
