import React from "react";
import { 
  Briefcase, CheckCircle2, Calendar, AlertTriangle, Users, TrendingUp,
  Clock, Plus, Hammer, DollarSign, ChevronRight, ShieldAlert, PackageOpen, Wrench
} from "lucide-react";
import { Customer, Project, Payment, Warranty, ScheduleItem, InventoryItem } from "../types";
import Logo from "./Logo";

interface DashboardViewProps {
  customers: Customer[];
  projects: Project[];
  payments: Payment[];
  warranties: Warranty[];
  schedules: ScheduleItem[];
  inventory: InventoryItem[];
  onNavigate: (tab: string) => void;
  onAddInquiry: () => void;
}

export default function DashboardView({
  customers,
  projects,
  payments,
  warranties,
  schedules,
  inventory,
  onNavigate,
  onAddInquiry
}: DashboardViewProps) {
  // Calculations
  const activeProjects = projects.filter(p => {
    const cust = customers.find(c => c.id === p.customerId);
    return cust && cust.status === "In Progress";
  }).length;

  const completedProjects = customers.filter(c => c.status === "Completed").length;
  
  const upcomingVisitsCount = schedules.filter(s => {
    return s.status === "Scheduled";
  }).length;

  const totalPendingPayments = payments
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  // Check warranties expiring in next 90 days
  const now = new Date();
  const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const warrantiesExpiringSoon = warranties.filter(w => {
    const end = new Date(w.endDate);
    return end >= now && end <= ninetyDaysFromNow;
  });

  // Extract warranty claims raised by clients
  const clientClaims = warranties.flatMap(w => 
    (w.serviceHistory || [])
      .filter(srv => srv.type === "Service Request" || srv.type?.toLowerCase().includes("claim") || srv.type?.toLowerCase().includes("ticket"))
      .map(srv => ({
        ...srv,
        warrantyId: w.id,
        projectName: w.projectName,
        customerName: w.customerName,
        productInstalled: w.productInstalled,
        brand: w.brand,
        startDate: w.startDate,
        endDate: w.endDate
      }))
  );

  // Material low inventory list
  const lowInventory = inventory.filter(i => i.quantity <= i.minRequired);

  // Lead Funnel stats
  const leadCount = customers.filter(c => c.status === "Lead").length;
  const designCount = customers.filter(c => c.status === "Design").length;
  const progressCount = customers.filter(c => c.status === "In Progress").length;
  const doneCount = customers.filter(c => c.status === "Completed").length;

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <Logo size="lg" className="shrink-0 bg-stone-950/40 p-1.5 rounded-full border border-stone-800" />
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-amber-500 font-semibold text-xs tracking-widest uppercase">Nilachal Creatives Management</div>
            <h1 className="text-2xl md:text-3xl font-serif text-stone-100 font-bold">Studio Overview & Analytics</h1>
            <p className="text-xs text-stone-400 max-w-xl">Welcome back to the command center. Track lead pipelines, monitor carpentry progress, view drawings, and manage service requests.</p>
          </div>
        </div>
        <button
          onClick={onAddInquiry}
          className="relative z-10 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 shadow-md shadow-amber-500/10 hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Log New Lead/Inquiry
        </button>
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Projects */}
        <div 
          onClick={() => onNavigate("projects")}
          className="cursor-pointer bg-stone-900 hover:bg-stone-900/80 border border-stone-800/80 p-5 rounded-xl transition duration-200 flex items-center gap-4 group col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Active Sites</div>
            <div className="text-2xl font-serif font-bold text-stone-100 mt-0.5">{activeProjects}</div>
          </div>
        </div>

        {/* Card 2: Completed Projects */}
        <div 
          onClick={() => onNavigate("customers")}
          className="cursor-pointer bg-stone-900 hover:bg-stone-900/80 border border-stone-800/80 p-5 rounded-xl transition duration-200 flex items-center gap-4 group col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-stone-800 text-green-500 group-hover:bg-green-500/10 transition-colors">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Completed Projects</div>
            <div className="text-2xl font-serif font-bold text-stone-100 mt-0.5">{completedProjects}</div>
          </div>
        </div>

        {/* Card 3: Upcoming Site Visits */}
        <div 
          onClick={() => onNavigate("calendar")}
          className="cursor-pointer bg-stone-900 hover:bg-stone-900/80 border border-stone-800/80 p-5 rounded-xl transition duration-200 flex items-center gap-4 group col-span-1 md:col-span-2 lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-stone-800 text-blue-400 group-hover:bg-blue-400/10 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Site Schedules</div>
            <div className="text-2xl font-serif font-bold text-stone-100 mt-0.5">{upcomingVisitsCount}</div>
          </div>
        </div>

        {/* Card 4: Outstanding Receivables */}
        <div 
          onClick={() => onNavigate("payments")}
          className="cursor-pointer bg-stone-900 hover:bg-stone-900/80 border border-stone-800/80 p-5 rounded-xl transition duration-200 flex items-center gap-4 group col-span-1 md:col-span-3 lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Pending Payments</div>
            <div className="text-2xl font-mono font-bold text-amber-500 mt-0.5">{formatCurrency(totalPendingPayments)}</div>
          </div>
        </div>

        {/* Card 5: Warranty Claims Raised */}
        <div 
          onClick={() => onNavigate("warranties")}
          className="cursor-pointer bg-stone-900 hover:bg-stone-900/80 border border-stone-800/80 p-5 rounded-xl transition duration-200 flex items-center gap-4 group col-span-2 md:col-span-3 lg:col-span-1"
        >
          <div className="p-3 rounded-lg bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Active Claims</div>
            <div className="text-2xl font-serif font-bold text-red-500 mt-0.5">{clientClaims.length}</div>
          </div>
        </div>
      </div>

      {/* Charts & Lead Pipe Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead pipeline Funnel */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-serif font-semibold text-stone-200 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Inquiry Conversion Funnel
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Live Stages</span>
            </div>

            {/* Custom SVG Funnel Chart */}
            <div className="relative h-44 flex items-center justify-center bg-stone-950 rounded-lg p-3 border border-stone-900">
              <svg width="100%" height="100%" viewBox="0 0 400 140" preserveAspectRatio="none" className="overflow-visible">
                {/* Stage 1: Lead (Width 320 to 240) */}
                <polygon points="40,10 360,10 320,38 80,38" fill="rgba(217, 119, 6, 0.9)" />
                <text x="200" y="25" fill="#1c1917" textAnchor="middle" fontSize="10.5" fontWeight="bold">
                  Inquiry / Leads ({leadCount})
                </text>

                {/* Stage 2: Design (Width 240 to 160) */}
                <polygon points="80,41 320,41 270,69 130,69" fill="rgba(217, 119, 6, 0.7)" />
                <text x="200" y="56" fill="#1c1917" textAnchor="middle" fontSize="10.5" fontWeight="bold">
                  Design & Estimation ({designCount})
                </text>

                {/* Stage 3: In Progress (Width 160 to 100) */}
                <polygon points="130,72 270,72 230,100 170,100" fill="rgba(217, 119, 6, 0.5)" />
                <text x="200" y="87" fill="white" textAnchor="middle" fontSize="10.5" fontWeight="bold">
                  Active Execution ({progressCount})
                </text>

                {/* Stage 4: Completed (Width 100 to 60) */}
                <polygon points="170,103 230,103 210,131 190,131" fill="rgba(16, 185, 129, 0.8)" />
                <text x="200" y="118" fill="white" textAnchor="middle" fontSize="10.5" fontWeight="bold">
                  Completed Handover ({doneCount})
                </text>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center mt-4 border-t border-stone-800/80 pt-4">
            <div onClick={() => onNavigate("customers")} className="cursor-pointer hover:bg-stone-800/55 p-1 rounded transition">
              <span className="block text-[10px] text-stone-500 font-bold uppercase">Leads</span>
              <span className="text-base font-bold font-mono text-stone-200">{leadCount}</span>
            </div>
            <div onClick={() => onNavigate("customers")} className="cursor-pointer hover:bg-stone-800/55 p-1 rounded transition">
              <span className="block text-[10px] text-stone-500 font-bold uppercase">Designing</span>
              <span className="text-base font-bold font-mono text-stone-200">{designCount}</span>
            </div>
            <div onClick={() => onNavigate("projects")} className="cursor-pointer hover:bg-stone-800/55 p-1 rounded transition">
              <span className="block text-[10px] text-stone-500 font-bold uppercase">Site Work</span>
              <span className="text-base font-bold font-mono text-stone-200">{progressCount}</span>
            </div>
            <div onClick={() => onNavigate("customers")} className="cursor-pointer hover:bg-stone-800/55 p-1 rounded transition">
              <span className="block text-[10px] text-stone-500 font-bold uppercase">Finished</span>
              <span className="text-base font-bold font-mono text-stone-200">{doneCount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Site visit Calendar Quick list */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif font-semibold text-stone-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Pending Site Schedules
              </h3>
              <button 
                onClick={() => onNavigate("calendar")}
                className="text-amber-500 hover:text-amber-400 text-xs font-semibold flex items-center gap-0.5 transition"
              >
                Calendar <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[175px] overflow-y-auto pr-1">
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  No site visits or designer meetings scheduled currently.
                </div>
              ) : (
                schedules.map(visit => (
                  <div key={visit.id} className="p-2.5 bg-stone-950 border border-stone-800 rounded-lg flex items-center justify-between text-xs hover:border-stone-700 transition">
                    <div className="space-y-1">
                      <div className="font-semibold text-stone-300">{visit.title}</div>
                      <div className="text-[10px] text-stone-500">{visit.projectName} • {visit.purpose}</div>
                    </div>
                    <div className="text-right font-mono text-[10px] text-amber-500 font-bold">
                      {visit.date}
                      <span className="block text-stone-400 font-normal">{visit.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-stone-800/80 pt-4 text-center">
            <span className="text-[10px] text-stone-400 italic">Assign site supervisors to log digital measurement sheets directly on location.</span>
          </div>
        </div>
      </div>

      {/* Secondary Information row (Inventory low warning, Warranties expiring, Recent customer inquiries, Client Warranty Claims) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Box 1: Recent Inquiries */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" /> Recent Customer Leads
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {customers.length === 0 ? (
                <p className="text-[11px] text-stone-500 py-4 text-center">No inquiry logs.</p>
              ) : (
                customers.slice(0, 3).map(c => (
                  <div key={c.id} className="bg-stone-950 p-2 rounded border border-stone-800 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-stone-200">{c.name}</span>
                      <span className="block text-[10px] text-stone-500">{c.projectLocation || "Address pending"}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold tracking-wider ${
                      c.status === "Lead" ? "bg-amber-500/10 text-amber-500" :
                      c.status === "Design" ? "bg-blue-500/10 text-blue-400" :
                      c.status === "In Progress" ? "bg-purple-500/10 text-purple-400" : "bg-green-500/10 text-green-400"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate("customers")}
            className="w-full text-center py-1.5 text-[10.5px] border border-stone-800 text-stone-400 hover:text-amber-500 rounded mt-3 transition duration-200"
          >
            Manage Customers & Leads
          </button>
        </div>

        {/* Box 2: Warranties expiring */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Warranty Expirations (90d)
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {warrantiesExpiringSoon.length === 0 ? (
                <p className="text-[11px] text-stone-500 py-8 text-center">No warranties expiring soon.</p>
              ) : (
                warrantiesExpiringSoon.map(w => (
                  <div key={w.id} className="bg-stone-950 p-2 rounded border border-red-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-stone-200">{w.productInstalled}</span>
                      <span className="block text-[10px] text-stone-500">{w.customerName} • {w.brand}</span>
                    </div>
                    <span className="text-[10px] text-red-400 font-mono font-semibold">{w.endDate}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate("warranties")}
            className="w-full text-center py-1.5 text-[10.5px] border border-stone-800 text-stone-400 hover:text-amber-500 rounded mt-3 transition duration-200"
          >
            Check Warranties & Services
          </button>
        </div>

        {/* Box 3: Low Inventory log */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <PackageOpen className="w-3.5 h-3.5 text-amber-500" /> Inventory Stock Alerts
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {lowInventory.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-stone-500">
                  ✓ All standard laminate sheets, adhesives, & paint are stocked.
                </div>
              ) : (
                lowInventory.map(item => (
                  <div key={item.id} className="bg-stone-950 p-2 rounded border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-stone-200">{item.name}</span>
                      <span className="block text-[9.5px] text-stone-500">{item.category} • Min req: {item.minRequired} {item.unit}</span>
                    </div>
                    <span className="text-[10.5px] text-amber-500 font-mono font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> {item.quantity} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate("settings")} // Inventory is placed in Settings/Extras view
            className="w-full text-center py-1.5 text-[10.5px] border border-stone-800 text-stone-400 hover:text-amber-500 rounded mt-3 transition duration-200"
          >
            Manage Material Inventory
          </button>
        </div>

        {/* Box 4: Client Warranty Claims */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-red-400" /> Client Warranty Claims
            </h4>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {clientClaims.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-stone-500">
                  ✓ No warranty claims raised by clients.
                </div>
              ) : (
                clientClaims.map((claim, idx) => (
                  <div key={idx} className="bg-stone-950 p-2 rounded border border-red-500/20 flex flex-col gap-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-stone-200 block truncate">{claim.productInstalled}</span>
                        <span className="text-[10px] text-stone-500 block truncate">{claim.customerName} • {claim.brand}</span>
                      </div>
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1 py-0.5 rounded font-mono font-bold shrink-0">{claim.date}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 italic bg-stone-900/50 p-1.5 rounded border border-stone-800/40 line-clamp-2">
                      "{claim.description}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
          <button 
            onClick={() => onNavigate("warranties")}
            className="w-full text-center py-1.5 text-[10.5px] border border-stone-800 text-stone-400 hover:text-amber-500 rounded mt-3 transition duration-200"
          >
            Manage Warranty Claims
          </button>
        </div>
      </div>
    </div>
  );
}
