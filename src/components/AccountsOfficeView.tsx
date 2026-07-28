import React, { useState, useMemo, useEffect } from "react";
import { 
  Building, Lock, Eye, EyeOff, ShieldAlert, CheckCircle, Download, 
  Calendar, FileText, Landmark, Search, Filter, ArrowUpDown, CheckCircle2, 
  Clock, AlertTriangle, Printer, DollarSign, ChevronRight, FileSpreadsheet, RefreshCw
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Payment, Project, getOrgDetails } from "../types";
import Logo from "./Logo";
import { drawPdfLogo } from "../utils/logoUtils";
import { api } from "../services/api";

interface AccountsOfficeViewProps {
  payments: Payment[];
  projects: Project[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AccountsOfficeView({ payments, projects }: AccountsOfficeViewProps) {
  // Passcode gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("nilachal_accounts_auth") === "true";
  });
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Filters state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // Chronological sort
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const orgDetails = getOrgDetails();

  // Handle Passcode Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cloudPass = await api.getAccountsPasscode();
    const expectedPasscode = cloudPass || localStorage.getItem("nilachal_accounts_passcode") || "accounts1244";

    if (passcode === expectedPasscode) {
      setAuthSuccess(true);
      setTimeout(() => {
        setIsAuthenticated(true);
        localStorage.setItem("nilachal_accounts_auth", "true");
        setPasscode("");
        setAuthSuccess(false);
      }, 600);
    } else {
      setAuthError("Invalid Accounts Office passcode. Access denied.");
      setPasscode("");
    }
  };


  const handleLockAccounts = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nilachal_accounts_auth");
  };

  // Get list of available years from payments data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentDate.getFullYear());
    payments.forEach(p => {
      if (p.date) {
        const yr = new Date(p.date).getFullYear();
        if (!isNaN(yr)) years.add(yr);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [payments]);

  // Chronological All Invoices
  const sortedAllInvoices = useMemo(() => {
    return [...payments].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [payments, sortOrder]);

  // Monthly Invoices Filtered
  const monthlyInvoices = useMemo(() => {
    return sortedAllInvoices.filter(p => {
      if (!p.date) return false;
      const d = new Date(p.date);
      if (isNaN(d.getTime())) return false;
      const matchMonth = d.getMonth() === selectedMonth;
      const matchYear = d.getFullYear() === selectedYear;
      return matchMonth && matchYear;
    });
  }, [sortedAllInvoices, selectedMonth, selectedYear]);

  // Filtered displayed list (search + status + month filter)
  const displayedInvoices = useMemo(() => {
    return monthlyInvoices.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        p.invoiceNumber.toLowerCase().includes(query) ||
        p.customerName.toLowerCase().includes(query) ||
        p.projectName.toLowerCase().includes(query) ||
        (p.notes && p.notes.toLowerCase().includes(query));
      
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [monthlyInvoices, searchQuery, statusFilter]);

  // Monthly Stats
  const monthlyStats = useMemo(() => {
    const totalAmount = monthlyInvoices.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = monthlyInvoices.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = monthlyInvoices.filter(p => p.status !== "Paid").reduce((sum, p) => sum + p.amount, 0);
    return {
      count: monthlyInvoices.length,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  }, [monthlyInvoices]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper to download single invoice PDF
  const downloadSingleInvoicePDF = (payment: Payment) => {
    const doc = new jsPDF();

    // Dark Header Banner
    doc.setFillColor(28, 25, 23);
    doc.rect(0, 0, 210, 38, "F");

    drawPdfLogo(doc, 12, 7, 24);

    doc.setTextColor(245, 189, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(orgDetails.name.toUpperCase(), 40, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("High-End Modular Carpentry & Site Interiors", 40, 22);
    doc.text(`${orgDetails.address} • Ph: ${orgDetails.phone} • Email: ${orgDetails.email}`, 40, 28);

    doc.setFillColor(245, 158, 11);
    doc.rect(0, 38, 210, 10, "F");
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL PAYMENT INVOICE & RECEIPT", 14, 44.5);

    doc.setTextColor(28, 25, 23);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text(`Billed To: ${payment.customerName}`, 14, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`Project Site: ${payment.projectName}`, 14, 62);
    if (payment.customerEmail) {
      doc.text(`Email: ${payment.customerEmail}`, 14, 68);
    }

    doc.setFont("helvetica", "bold");
    doc.text(`Invoice Ref: ${payment.invoiceNumber}`, 120, 56);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Date: ${payment.date}`, 120, 62);
    doc.text(`Payment Mode: ${payment.paymentMode || "Bank Transfer"}`, 120, 68);
    doc.text(`Status: ${payment.status.toUpperCase()}`, 120, 74);

    doc.setDrawColor(229, 231, 235);
    doc.line(14, 78, 196, 78);

    const tableColumn = ["#", "Milestone / Service Description", "Tax Scope", "Amount (INR)"];
    const tableRows = [[
      1,
      payment.notes || `Interior design execution and fitments for project milestone: ${payment.type}`,
      "CGST+SGST 0%",
      `Rs. ${payment.amount.toLocaleString("en-IN")}`
    ]];

    autoTable(doc, {
      startY: 82,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [245, 158, 11],
        textColor: [28, 25, 23],
        fontStyle: "bold",
        fontSize: 9
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 110 },
        2: { cellWidth: 30, halign: "center" },
        3: { cellWidth: 35, halign: "right" }
      }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 120;

    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(120, finalY + 6, 76, 28, 2, 2, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(28, 25, 23);
    doc.text(`Subtotal:`, 124, finalY + 13);
    doc.text(`Rs. ${payment.amount.toLocaleString("en-IN")}`, 190, finalY + 13, { align: "right" });

    doc.text(`GST:`, 124, finalY + 19);
    doc.text(`Included`, 190, finalY + 19, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Total Amount:`, 124, finalY + 27);
    doc.text(`Rs. ${payment.amount.toLocaleString("en-IN")}`, 190, finalY + 27, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 25, 23);
    doc.text("Bank Account Details:", 14, finalY + 12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Account Name: Nilachal Creatives", 14, finalY + 17);
    doc.text("Account Number: 033311501000821 | IFSC: NESF0000333", 14, finalY + 22);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 25, 23);
    doc.text(`For ${orgDetails.name}`, 130, finalY + 48);

    doc.setDrawColor(203, 213, 225);
    doc.line(130, finalY + 43, 190, finalY + 43);

    // Disclaimer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("This is a computer generated invoice and does not need any signature.", 105, finalY + 58, { align: "center" });

    const fileName = `Invoice_${payment.invoiceNumber.replace(/\s+/g, "_")}_Nilachal.pdf`;
    doc.save(fileName);
  };

  // Download Batch PDF containing Statement + All Invoices in Selected Month
  const downloadMonthlyInvoicesBatchPDF = () => {
    if (monthlyInvoices.length === 0) {
      alert(`No invoices found for ${MONTH_NAMES[selectedMonth]} ${selectedYear}.`);
      return;
    }

    const doc = new jsPDF();
    const monthLabel = `${MONTH_NAMES[selectedMonth].toUpperCase()} ${selectedYear}`;

    // --- PAGE 1: MONTHLY EXECUTIVE ACCOUNTS & INVOICE LEDGER STATEMENT ---
    doc.setFillColor(28, 25, 23); // #1c1917
    doc.rect(0, 0, 210, 38, "F");

    drawPdfLogo(doc, 12, 7, 24);

    doc.setTextColor(245, 189, 31);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(orgDetails.name.toUpperCase(), 40, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("ACCOUNTS OFFICE - MONTHLY INVOICING & REVENUE LEDGER", 40, 22);
    doc.text(`${orgDetails.address} • Ph: ${orgDetails.phone} • Email: ${orgDetails.email}`, 40, 28);

    doc.setFillColor(245, 158, 11);
    doc.rect(0, 38, 210, 10, "F");
    doc.setTextColor(28, 25, 23);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`MONTHLY INVOICES STATEMENT: ${monthLabel}`, 14, 44.5);

    // Summary Metric Cards Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 53, 182, 26, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("TOTAL INVOICES GENERATED", 20, 60);
    doc.text("TOTAL INVOICED AMOUNT", 68, 60);
    doc.text("COLLECTED / PAID", 118, 60);
    doc.text("PENDING / OUTSTANDING", 158, 60);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 25, 23);
    doc.text(`${monthlyStats.count} Invoices`, 20, 71);
    doc.text(`Rs. ${monthlyStats.totalAmount.toLocaleString("en-IN")}`, 68, 71);
    
    doc.setTextColor(16, 185, 129); // Green
    doc.text(`Rs. ${monthlyStats.paidAmount.toLocaleString("en-IN")}`, 118, 71);

    doc.setTextColor(225, 29, 72); // Red
    doc.text(`Rs. ${monthlyStats.pendingAmount.toLocaleString("en-IN")}`, 158, 71);

    // Table of Monthly Invoices
    const tableColumns = ["#", "Date", "Invoice #", "Customer Name", "Project", "Type", "Status", "Amount (INR)"];
    const tableRows = monthlyInvoices.map((inv, idx) => [
      idx + 1,
      inv.date || "N/A",
      inv.invoiceNumber,
      inv.customerName,
      inv.projectName,
      inv.type,
      inv.status.toUpperCase(),
      `Rs. ${inv.amount.toLocaleString("en-IN")}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [tableColumns],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [28, 25, 23],
        textColor: [245, 189, 31],
        fontStyle: "bold",
        fontSize: 8.5
      },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 22 },
        2: { cellWidth: 28 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 },
        5: { cellWidth: 20 },
        6: { cellWidth: 18 },
        7: { cellWidth: 24, halign: "right" }
      }
    });

    let finalY = (doc as any).lastAutoTable?.finalY || 180;

    // Statement Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    doc.text("This is a computer generated invoice statement and does not need any signature.", 105, Math.min(finalY + 15, 280), { align: "center" });

    // --- SUBSEQUENT PAGES: INDIVIDUAL INVOICE SHEETS INCLUDED IN MONTHLY BATCH ---
    monthlyInvoices.forEach((payment, i) => {
      doc.addPage();

      // Header Banner
      doc.setFillColor(28, 25, 23);
      doc.rect(0, 0, 210, 38, "F");

      drawPdfLogo(doc, 12, 7, 24);

      doc.setTextColor(245, 189, 31);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(orgDetails.name.toUpperCase(), 40, 15);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text("High-End Modular Carpentry & Site Interiors", 40, 22);
      doc.text(`${orgDetails.address} • Ph: ${orgDetails.phone} • Email: ${orgDetails.email}`, 40, 28);

      doc.setFillColor(245, 158, 11);
      doc.rect(0, 38, 210, 10, "F");
      doc.setTextColor(28, 25, 23);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`OFFICIAL PAYMENT INVOICE (${i + 1} of ${monthlyInvoices.length})`, 14, 44.5);

      doc.setTextColor(28, 25, 23);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text(`Billed To: ${payment.customerName}`, 14, 56);
      doc.setFont("helvetica", "normal");
      doc.text(`Project Site: ${payment.projectName}`, 14, 62);
      if (payment.customerEmail) {
        doc.text(`Email: ${payment.customerEmail}`, 14, 68);
      }

      doc.setFont("helvetica", "bold");
      doc.text(`Invoice Ref: ${payment.invoiceNumber}`, 120, 56);
      doc.setFont("helvetica", "normal");
      doc.text(`Invoice Date: ${payment.date}`, 120, 62);
      doc.text(`Payment Mode: ${payment.paymentMode || "Bank Transfer"}`, 120, 68);
      doc.text(`Status: ${payment.status.toUpperCase()}`, 120, 74);

      doc.setDrawColor(229, 231, 235);
      doc.line(14, 78, 196, 78);

      const invTableCols = ["#", "Milestone / Service Description", "Tax Scope", "Amount (INR)"];
      const invTableRows = [[
        1,
        payment.notes || `Interior design execution and fitments for project milestone: ${payment.type}`,
        "CGST+SGST 0%",
        `Rs. ${payment.amount.toLocaleString("en-IN")}`
      ]];

      autoTable(doc, {
        startY: 82,
        head: [invTableCols],
        body: invTableRows,
        theme: "striped",
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: [28, 25, 23],
          fontStyle: "bold",
          fontSize: 9
        },
        bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 110 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 35, halign: "right" }
        }
      });

      const invY = (doc as any).lastAutoTable?.finalY || 120;

      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(120, invY + 6, 76, 28, 2, 2, "FD");

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(28, 25, 23);
      doc.text(`Subtotal:`, 124, invY + 13);
      doc.text(`Rs. ${payment.amount.toLocaleString("en-IN")}`, 190, invY + 13, { align: "right" });

      doc.text(`GST:`, 124, invY + 19);
      doc.text(`Included`, 190, invY + 19, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Total Amount:`, 124, invY + 27);
      doc.text(`Rs. ${payment.amount.toLocaleString("en-IN")}`, 190, invY + 27, { align: "right" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 25, 23);
      doc.text("Bank Account Details:", 14, invY + 12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Account Name: Nilachal Creatives", 14, invY + 17);
      doc.text("Account Number: 033311501000821 | IFSC: NESF0000333", 14, invY + 22);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(28, 25, 23);
      doc.text(`For ${orgDetails.name}`, 130, invY + 48);

      doc.setDrawColor(203, 213, 225);
      doc.line(130, invY + 43, 190, invY + 43);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 116, 139);
      doc.text("This is a computer generated invoice and does not need any signature.", 105, invY + 58, { align: "center" });
    });

    doc.save(`Monthly_Invoices_${MONTH_NAMES[selectedMonth]}_${selectedYear}_Nilachal.pdf`);
  };

  // IF NOT AUTHENTICATED -> SHOW ACCOUNTS OFFICE PASSCODE GATE
  if (!isAuthenticated) {
    return (
      <div 
        className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-stone-100"
        id="accounts-office-passcode-gate"
      >
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            
            <div className="relative">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-2xl shadow-xl text-amber-500">
                <Landmark className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 p-1.5 rounded-full border-2 border-stone-900 shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-stone-100">
                Accounts Office Gate
              </h2>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Restricted financial portal. Enter the Accounts Office security passcode to review chronological invoice ledgers and export monthly audit PDFs.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="w-full space-y-4 pt-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] uppercase tracking-wider font-bold text-stone-500 font-mono">
                  Accounts Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter passcode"
                    className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-stone-100 placeholder-stone-600 outline-none transition font-mono text-center tracking-widest text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-900/30 rounded-xl text-xs text-red-400 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span className="font-semibold">{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-950/50 border border-green-900/30 rounded-xl text-xs text-green-400 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                  <span className="font-semibold">Access Granted! Opening Accounts Office...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-amber-500/10 font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                Unlock Accounts Office
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: MAIN ACCOUNTS OFFICE DASHBOARD
  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 p-6 rounded-2xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-serif font-black text-stone-100 tracking-wide">
                Accounts Office
              </h2>
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                Secure Portal
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Chronological invoice audit logs, monthly financial reports, and monthly bulk PDF downloads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end relative z-10">
          <button
            onClick={downloadMonthlyInvoicesBatchPDF}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer"
            title="Download full statement + all invoices for selected month"
          >
            <Download className="w-4 h-4" /> Download {MONTH_NAMES[selectedMonth]} Pack
          </button>
          
          <button
            onClick={handleLockAccounts}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition border border-stone-700 flex items-center gap-1.5 cursor-pointer"
            title="Lock Accounts Office"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" /> Lock
          </button>
        </div>
      </div>

      {/* Month & Year Selection Bar + Stats */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-md space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
          
          {/* Month & Year Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-stone-400 font-bold uppercase">Period:</span>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-semibold text-stone-200 outline-none focus:border-amber-500 transition cursor-pointer"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Quick reset to current month */}
            {(selectedMonth !== currentDate.getMonth() || selectedYear !== currentDate.getFullYear()) && (
              <button
                onClick={() => {
                  setSelectedMonth(currentDate.getMonth());
                  setSelectedYear(currentDate.getFullYear());
                }}
                className="text-xs text-amber-400 hover:underline font-mono flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Current Month
              </button>
            )}
          </div>

          {/* Quick Action: Download Month PDF */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-mono">
              Invoices found: <strong className="text-stone-100">{monthlyInvoices.length}</strong>
            </span>
            <button
              onClick={downloadMonthlyInvoicesBatchPDF}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Monthly PDF
            </button>
          </div>

        </div>

        {/* Monthly Financial Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-amber-500">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">Invoices Generated</span>
              <span className="text-lg font-mono font-bold text-stone-100">{monthlyStats.count} Invoices</span>
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">Monthly Total Invoiced</span>
              <span className="text-lg font-mono font-bold text-amber-400">{formatCurrency(monthlyStats.totalAmount)}</span>
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-950/40 border border-green-800/40 rounded-lg text-green-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">Collected / Paid</span>
              <span className="text-lg font-mono font-bold text-green-400">{formatCurrency(monthlyStats.paidAmount)}</span>
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg text-red-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase font-bold tracking-wider block">Outstanding Balance</span>
              <span className="text-lg font-mono font-bold text-red-400">{formatCurrency(monthlyStats.pendingAmount)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Table Section Header & Search/Filter Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        
        <div className="p-5 border-b border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div>
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              Chronological Invoice Registry ({MONTH_NAMES[selectedMonth]} {selectedYear})
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Click any row action to download the standalone PDF with computer-generated signature disclaimer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Search invoice #, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300 outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            {/* Chronological Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
              className="px-3 py-1.5 bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-300 text-xs font-mono rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Toggle Chronological Order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </button>
          </div>

        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          {displayedInvoices.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="text-sm font-semibold text-stone-400">
                No invoices found for {MONTH_NAMES[selectedMonth]} {selectedYear}.
              </p>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">
                Select a different month/year from the period selector above or clear search filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-mono text-[11px] uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer & Project</th>
                  <th className="py-3.5 px-4">Milestone</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Download PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-850">
                {displayedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-stone-850/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-400 whitespace-nowrap">
                      {inv.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-100">{inv.customerName}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{inv.projectName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px] font-mono">
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-100">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                          inv.status === "Paid"
                            ? "bg-green-500/10 text-green-400 border border-green-500/30"
                            : inv.status === "Pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {inv.status === "Paid" && <CheckCircle2 className="w-3 h-3" />}
                        {inv.status === "Pending" && <Clock className="w-3 h-3" />}
                        {inv.status === "Overdue" && <AlertTriangle className="w-3 h-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => downloadSingleInvoicePDF(inv)}
                        className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition inline-flex items-center gap-1 cursor-pointer"
                        title="Download Standalone Invoice PDF"
                      >
                        <Download className="w-3 h-3" /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <span>Total records in list: {displayedInvoices.length}</span>
          <span className="italic">Note: All generated PDFs contain computer-generated invoice disclaimer.</span>
        </div>

      </div>

    </div>
  );
}
