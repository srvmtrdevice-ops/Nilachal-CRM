import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Users, Ruler, Calculator, ShieldCheck, 
  CalendarClock, Package, Hammer, FileText, Landmark, UserCheck, Settings,
  Menu, X, Sparkles, Building, Lock, ClipboardCheck, Image, AlertTriangle,
  FileSpreadsheet
} from "lucide-react";

// Import Views
import DashboardView from "./components/DashboardView";
import CustomerView from "./components/CustomerView";
import ProjectView from "./components/ProjectView";
import CustomerRequirementsView from "./components/CustomerRequirementsView";
import CostCalculator from "./components/CostCalculator";
import WarrantyView from "./components/WarrantyView";
import DailyUpdatesView from "./components/DailyUpdatesView";
import InventoryView from "./components/InventoryView";
import TeamView from "./components/TeamView";
import DocumentView from "./components/DocumentView";
import PaymentsView from "./components/PaymentsView";
import ClientPortalView from "./components/ClientPortalView";
import SettingsView from "./components/SettingsView";
import PortfolioView from "./components/PortfolioView";
import EstimateView from "./components/EstimateView";
import Logo from "./components/Logo";
import AdminPasscodeGate from "./components/AdminPasscodeGate";

// Import Services & Types
import { api } from "./services/api";
import { 
  Customer, Project, PortfolioItem, Warranty, Payment, 
  ProjectUpdate, TeamMember, InventoryItem, DocumentRecord, ScheduleItem,
  CustomerRequirements, Estimate
} from "./types";

type ActiveTab = 
  | "dashboard" 
  | "customers" 
  | "projects" 
  | "requirements"
  | "calculator" 
  | "estimates"
  | "updates" 
  | "documents" 
  | "warranties" 
  | "inventory" 
  | "team" 
  | "payments" 
  | "portal" 
  | "gallery"
  | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("portal");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("nilachal_admin_auth") === "true";
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("nilachal_admin_auth");
  };

  // Global collections state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requirements, setRequirements] = useState<CustomerRequirements[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([
    {
      id: "sch_1",
      projectId: "proj_1",
      projectName: "Dr. Alok Mohapatra Site",
      customerName: "Dr. Alok Mohapatra",
      title: "Electrical & Modular Layout Verification",
      date: "2026-07-01",
      time: "11:30 AM",
      purpose: "Check water plumbing inlet clearance for modular sink",
      assignedTo: "Sanjay Swain",
      status: "Scheduled"
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDetails?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch all initial data from API service
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        custData, projData, reqData, portData, warrData, payData, estData, updData, teamData, invData, docData
      ] = await Promise.all([
        api.getCustomers(),
        api.getProjects(),
        api.getCustomerRequirements(),
        api.getPortfolio(),
        api.getWarranties(),
        api.getPayments(),
        api.getEstimates(),
        api.getUpdates(),
        api.getTeam(),
        api.getInventory(),
        api.getDocuments()
      ]);

      setCustomers(custData);
      setProjects(projData);
      setRequirements(reqData);
      setPortfolio(portData);
      setWarranties(warrData);
      setPayments(payData);
      setEstimates(estData);
      setUpdates(updData);
      setTeam(teamData);
      setInventory(invData);
      setDocuments(docData);
    } catch (err) {
      console.error("Error loading turnkey workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // API Call wrappers to maintain real-time state synchronization
  const handleAddCustomer = async (cust: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    const id = await api.addCustomer(cust);
    const timestamp = new Date().toISOString();
    setCustomers(prev => [...prev, { id, ...cust, createdAt: timestamp, updatedAt: timestamp }]);
  };

  const handleUpdateCustomer = async (id: string, updates: Partial<Customer>) => {
    await api.updateCustomer(id, updates);
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteCustomer = async (id: string): Promise<void> => {
    const cust = customers.find(c => c.id === id);
    const detailsName = cust ? `${cust.name} (${cust.phone || "No Phone"})` : "";
    
    setConfirmDelete({
      isOpen: true,
      title: "Delete Customer Record",
      message: "Are you sure you want to permanently delete this customer intake record? This action is irreversible and all associated requirements, projects, or documents will lose their reference.",
      itemDetails: detailsName,
      onConfirm: async () => {
        // Sync local state
        setCustomers(prev => prev.filter(c => c.id !== id));
        // Optional firebase sync
        try {
          const { deleteDoc, doc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          await deleteDoc(doc(db, "customers", id));
        } catch {}
        // localStorage sync
        try {
          const local = JSON.parse(localStorage.getItem("nilachal_customers") || "[]");
          const filtered = local.filter((c: any) => c.id !== id);
          localStorage.setItem("nilachal_customers", JSON.stringify(filtered));
        } catch {}
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddProject = async (proj: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const id = await api.addProject(proj);
    setProjects(prev => [...prev, { id, ...proj }]);
  };

  const handleUpdateProject = async (id: string, upd: Partial<Project>) => {
    await api.updateProject(id, upd);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...upd } : p));
  };

  const handleDeleteProject = async (id: string): Promise<void> => {
    const proj = projects.find(p => p.id === id);
    const detailsName = proj ? `Execution brief for ${proj.customerName}` : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Project Brief",
      message: "Are you sure you want to permanently delete this active project brief? This will erase specifications, timelines, and payment milestone references.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveCustomerRequirements = async (reqRecord: Omit<CustomerRequirements, "id" | "updatedAt"> & { id?: string }) => {
    const id = await api.saveCustomerRequirements(reqRecord);
    const timestamp = new Date().toISOString();
    setRequirements(prev => {
      const existingIdx = prev.findIndex(r => r.customerId === reqRecord.customerId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...reqRecord, id, updatedAt: timestamp };
        return updated;
      } else {
        return [...prev, { ...reqRecord, id, updatedAt: timestamp }];
      }
    });
  };

  const handleAddPortfolio = async (item: Omit<PortfolioItem, "id">) => {
    const id = await api.addPortfolio(item);
    setPortfolio(prev => [...prev, { id, ...item }]);
  };

  const handleDeletePortfolio = async (id: string): Promise<void> => {
    const item = portfolio.find(p => p.id === id);
    const detailsName = item ? item.title : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Portfolio Gallery Item",
      message: "Are you sure you want to permanently delete this portfolio gallery showcase item? This will remove the design card from public view.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deletePortfolio(id);
        setPortfolio(prev => prev.filter(p => p.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddWarranty = async (warr: Omit<Warranty, "id" | "createdAt">) => {
    const id = await api.addWarranty(warr);
    setWarranties(prev => [...prev, { id, ...warr }]);
  };

  const handleAddWarrantyService = async (id: string, record: any) => {
    await api.addWarrantyServiceRecord(id, record);
    setWarranties(prev => prev.map(w => w.id === id ? { ...w, serviceHistory: [...(w.serviceHistory || []), record] } : w));
  };

  const handleAddPayment = async (pay: Omit<Payment, "id" | "createdAt">) => {
    const id = await api.addPayment(pay);
    setPayments(prev => [...prev, { id, ...pay }]);
  };

  const handleMarkPaymentPaid = async (id: string) => {
    await api.markPaymentPaid(id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "Paid" } : p));
  };

  const handleDeletePayment = async (id: string): Promise<void> => {
    const pay = payments.find(p => p.id === id);
    const detailsName = pay ? `Invoice ${pay.invoiceNumber} for ${pay.customerName} (${pay.type})` : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Milestone Invoice",
      message: "Are you sure you want to permanently delete this milestone invoice / payment ledger record? This will remove it from financial estimates and outstanding balance calculations.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deletePayment(id);
        setPayments(prev => prev.filter(p => p.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddEstimate = async (est: Omit<Estimate, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const id = await api.addEstimate(est);
    setEstimates(prev => [{ id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...est }, ...prev]);
    return id;
  };

  const handleUpdateEstimate = async (id: string, est: Partial<Estimate>) => {
    await api.updateEstimate(id, est);
    setEstimates(prev => prev.map(e => e.id === id ? { ...e, ...est, updatedAt: new Date().toISOString() } : e));
  };

  const handleDeleteEstimate = async (id: string): Promise<void> => {
    const est = estimates.find(e => e.id === id);
    const detailsName = est ? `${est.estimateNumber} for ${est.customerName}` : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Design Estimate",
      message: "Are you sure you want to permanently delete this design estimate proposal? This action is irreversible and will remove it from workspace ledger entries.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deleteEstimate(id);
        setEstimates(prev => prev.filter(e => e.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddUpdate = async (upd: Omit<ProjectUpdate, "id" | "createdAt">) => {
    const id = await api.addUpdate(upd);
    setUpdates(prev => [{ id, ...upd }, ...prev]);
  };

  const handleDeleteUpdate = async (id: string): Promise<void> => {
    const upd = updates.find(u => u.id === id);
    const detailsName = upd ? `${upd.projectName} - ${upd.statusText} (${upd.date})` : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Daily Site Log",
      message: "Are you sure you want to permanently delete this daily site progress log? This action is irreversible and will remove the timeline log entry.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deleteUpdate(id);
        setUpdates(prev => prev.filter(u => u.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddTeamMember = async (member: Omit<TeamMember, "id" | "createdAt">) => {
    const id = await api.addTeamMember(member);
    setTeam(prev => [...prev, { id, ...member }]);
  };

  const handleAddTeamTask = async (memberId: string, task: any) => {
    await api.addTaskToMember(memberId, task);
    setTeam(prev => prev.map(m => m.id === memberId ? { ...m, assignedTasks: [...(m.assignedTasks || []), task] } : m));
  };

  const handleToggleAttendance = async (memberId: string, date: string) => {
    await api.toggleAttendance(memberId, date);
    setTeam(prev => prev.map(m => {
      if (m.id === memberId) {
        const index = m.attendance.indexOf(date);
        let newAtt = [...m.attendance];
        if (index > -1) {
          newAtt.splice(index, 1);
        } else {
          newAtt.push(date);
        }
        return { ...m, attendance: newAtt };
      }
      return m;
    }));
  };

  const handleAddInventory = async (item: Omit<InventoryItem, "id" | "updatedAt">) => {
    const id = await api.addInventoryItem(item);
    setInventory(prev => [...prev, { id, ...item }]);
  };

  const handleAddInventoryStock = async (id: string, qty: number) => {
    await api.addStockQuantity(id, qty);
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + qty) } : i));
  };

  const handleAddDocument = async (docObj: Omit<DocumentRecord, "id" | "uploadedAt">) => {
    const id = await api.addDocument(docObj);
    setDocuments(prev => [...prev, { id, uploadedAt: new Date().toISOString(), ...docObj }]);
  };

  const handleDeleteDocument = async (id: string): Promise<void> => {
    const docObj = documents.find(d => d.id === id);
    const detailsName = docObj ? `${docObj.fileName} (${docObj.tag})` : "";

    setConfirmDelete({
      isOpen: true,
      title: "Delete Blueprint Document",
      message: "Are you sure you want to permanently delete this design drawing/blueprint document? This will remove it from project records.",
      itemDetails: detailsName,
      onConfirm: async () => {
        await api.deleteDocument(id);
        setDocuments(prev => prev.filter(d => d.id !== id));
        setConfirmDelete(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddPortalServiceRequest = async (warrantyId: string, desc: string) => {
    const record = {
      date: new Date().toISOString().split('T')[0],
      type: "Service Request",
      description: desc,
      cost: 0,
      status: "Completed"
    };
    await handleAddWarrantyService(warrantyId, record);
  };

  // Nav definitions
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "projects", label: "Project Briefs", icon: Ruler },
    { id: "calculator", label: "Cost Estimator", icon: Calculator },
    { id: "estimates", label: "Generate Estimate", icon: FileSpreadsheet },
    { id: "updates", label: "Daily Logs", icon: CalendarClock },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "warranties", label: "Warranties", icon: ShieldCheck },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "team", label: "Subcontractors", icon: Hammer },
    { id: "payments", label: "Ledger & Invoices", icon: Landmark },
    { id: "portal", label: "Client Portal", icon: UserCheck },
    { id: "requirements", label: "Client Requirements", icon: ClipboardCheck },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#2A2312] font-sans text-stone-100 flex flex-col antialiased relative overflow-hidden">
      {/* Decorative ambient gold glows utilizing #FFBE0B */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#FFBE0B]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FFBE0B]/4 blur-[100px] pointer-events-none" />
      {/* Top Header */}
      <header className="bg-stone-900 border-b border-stone-850 px-6 py-4 flex justify-between items-center z-30 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="font-serif font-black tracking-widest text-stone-100 uppercase text-sm sm:text-base">Nilachal Creatives</h1>
            <p className="text-[10px] text-stone-400 font-mono tracking-wider">Premium Interior Business Hub</p>
          </div>
        </div>

        {/* Desktop Quick Indicator */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-stone-950 border border-stone-800 rounded-full px-3.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-stone-400 font-mono">Guwahati HQ (Active)</span>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="ml-2 pl-2 border-l border-stone-800 text-[#FFBE0B] hover:text-amber-400 text-[10px] font-mono font-bold transition flex items-center gap-1 uppercase"
              title="Lock Admin Workspace"
            >
              <Lock className="w-3 h-3" />
              Lock
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 bg-stone-800 rounded text-stone-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR: Desktop */}
        <aside className="hidden md:flex md:w-64 bg-stone-900/60 border-r border-stone-850 flex-col justify-between shrink-0">
          <div className="py-6 px-4 space-y-1.5 overflow-y-auto">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 ${
                    isActive 
                      ? "bg-amber-500 text-stone-950 shadow-md" 
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-850"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {!isAuthenticated && item.id !== "portal" && item.id !== "requirements" && item.id !== "gallery" && (
                    <Lock className={`w-3 h-3 shrink-0 ${isActive ? "text-stone-950" : "text-stone-500"}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-stone-850 bg-stone-950/40 text-center flex flex-col gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-stone-900 border border-stone-800 rounded-lg text-xs font-bold tracking-wider hover:text-[#FFBE0B] text-stone-400 transition flex items-center justify-center gap-1.5 uppercase font-mono shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Lock Workspace
              </button>
            )}
            <div className="text-[10px] text-stone-500 font-mono">
              Designed by Nilachal Creatives
            </div>
          </div>
        </aside>

        {/* SIDEBAR: Mobile Overlay */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 bg-black/80 z-20 md:hidden animate-in fade-in duration-200">
            <div className="w-64 bg-stone-900 h-full p-5 space-y-2 border-r border-stone-800 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-stone-800 mb-4">
                  <span className="font-serif font-black text-xs text-amber-500 tracking-wider">WORKSPACE</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-stone-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {sidebarItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as ActiveTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition duration-150 ${
                          isActive 
                            ? "bg-amber-500 text-stone-950" 
                            : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {!isAuthenticated && item.id !== "portal" && item.id !== "requirements" && item.id !== "gallery" && (
                          <Lock className={`w-3 h-3 shrink-0 ${isActive ? "text-stone-950" : "text-stone-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAuthenticated && (
                <div className="pt-4 border-t border-stone-800 mt-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs font-bold tracking-wider text-amber-500 hover:text-amber-400 transition flex items-center justify-center gap-1.5 uppercase font-mono"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENT MAIN STAGE */}
        <main className="flex-1 overflow-y-auto bg-[#2A2312]/30 backdrop-blur-sm p-5 md:p-8 relative z-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-stone-500 font-mono uppercase tracking-widest">Constructing Blueprint Space...</p>
            </div>
          ) : !isAuthenticated && activeTab !== "portal" && activeTab !== "requirements" && activeTab !== "gallery" ? (
            <AdminPasscodeGate onSuccess={() => setIsAuthenticated(true)} />
          ) : (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
              
              {/* Conditional view rendering */}
              {activeTab === "dashboard" && (
                <DashboardView 
                  customers={customers}
                  projects={projects}
                  warranties={warranties}
                  payments={payments}
                  inventory={inventory}
                  schedules={schedules}
                  onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
                  onAddInquiry={() => setActiveTab("customers")}
                />
              )}

              {activeTab === "customers" && (
                <CustomerView 
                  customers={customers}
                  onAdd={handleAddCustomer}
                  onUpdate={handleUpdateCustomer}
                  onDelete={handleDeleteCustomer}
                />
              )}

              {activeTab === "projects" && (
                <ProjectView 
                  projects={projects}
                  customers={customers}
                  onAdd={handleAddProject}
                  onUpdate={handleUpdateProject}
                  onDelete={handleDeleteProject}
                />
              )}

              {activeTab === "requirements" && (
                <CustomerRequirementsView 
                  customers={customers}
                  requirements={requirements}
                  onSave={handleSaveCustomerRequirements}
                />
              )}

              {activeTab === "calculator" && (
                <CostCalculator />
              )}

              {activeTab === "estimates" && (
                <EstimateView 
                  estimates={estimates}
                  customers={customers}
                  onAdd={handleAddEstimate}
                  onUpdate={handleUpdateEstimate}
                  onDelete={handleDeleteEstimate}
                />
              )}

              {activeTab === "updates" && (
                <DailyUpdatesView 
                  updates={updates}
                  projects={projects}
                  onAdd={handleAddUpdate}
                  onDelete={handleDeleteUpdate}
                  isAdmin={isAuthenticated}
                />
              )}

              {activeTab === "documents" && (
                <DocumentView 
                  documents={documents}
                  projects={projects}
                  onAdd={handleAddDocument}
                  onDelete={handleDeleteDocument}
                />
              )}

              {activeTab === "warranties" && (
                <WarrantyView 
                  warranties={warranties}
                  projects={projects}
                  onAdd={handleAddWarranty}
                  onAddService={handleAddWarrantyService}
                />
              )}

              {activeTab === "inventory" && (
                <InventoryView 
                  inventory={inventory}
                  onAdd={handleAddInventory}
                  onAddStock={handleAddInventoryStock}
                />
              )}

              {activeTab === "team" && (
                <TeamView 
                  team={team}
                  projects={projects}
                  onAdd={handleAddTeamMember}
                  onAddTask={handleAddTeamTask}
                  onToggleAttendance={handleToggleAttendance}
                />
              )}

              {activeTab === "payments" && (
                <PaymentsView 
                  payments={payments}
                  projects={projects}
                  onAdd={handleAddPayment}
                  onMarkPaid={handleMarkPaymentPaid}
                  onDelete={handleDeletePayment}
                />
              )}

              {activeTab === "portal" && (
                <ClientPortalView 
                  projects={projects}
                  customers={customers}
                  updates={updates}
                  documents={documents}
                  warranties={warranties}
                  payments={payments}
                  requirements={requirements}
                  onAddServiceRequest={handleAddPortalServiceRequest}
                  onContactSupport={(msg) => alert(`Message dispatched to Nilachal site supervisor: "${msg}"`)}
                />
              )}

              {activeTab === "gallery" && (
                <PortfolioView 
                  portfolio={portfolio}
                  onAdd={handleAddPortfolio}
                  onDelete={handleDeletePortfolio}
                  isAdminAuthenticated={isAuthenticated}
                />
              )}

              {activeTab === "settings" && (
                <SettingsView />
              )}

            </div>
          )}
        </main>

        {/* Global Confirmation Dialogue Box */}
        {confirmDelete.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-5 relative">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-950/30 border border-red-900/30 rounded-xl shrink-0 text-red-500">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-stone-100 leading-tight">
                    {confirmDelete.title}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Irreversible action warning
                  </p>
                </div>
              </div>

              <div className="text-xs text-stone-300 leading-relaxed">
                {confirmDelete.message}
              </div>

              {confirmDelete.itemDetails && (
                <div className="bg-stone-950/60 border border-stone-850 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider">Item to delete:</span>
                  <span className="text-xs font-mono font-semibold text-amber-500 break-words">{confirmDelete.itemDetails}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 px-4 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-800 hover:border-stone-700 rounded-xl text-xs font-bold uppercase tracking-wider transition font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete.onConfirm()}
                  className="flex-1 py-2.5 px-4 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/30 hover:border-red-800/50 rounded-xl text-xs font-bold uppercase tracking-wider transition font-mono cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
