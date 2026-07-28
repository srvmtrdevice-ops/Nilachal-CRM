import React, { useState } from "react";
import { 
  Plus, Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, 
  Edit2, Trash2, Search, Filter, MapPin, Sparkles, X, Check, Building2, UserCheck
} from "lucide-react";
import { ScheduleItem, Project, Customer, TeamMember } from "../types";

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  projects: Project[];
  customers: Customer[];
  team?: TeamMember[];
  onAdd: (sch: Omit<ScheduleItem, "id">) => Promise<string | void>;
  onUpdate: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ScheduleView({
  schedules,
  projects,
  customers,
  team = [],
  onAdd,
  onUpdate,
  onDelete
}: ScheduleViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Scheduled" | "Completed" | "Cancelled">("All");

  // Form State
  const [projectId, setProjectId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("11:00 AM");
  const [purpose, setPurpose] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<"Scheduled" | "Completed" | "Cancelled">("Scheduled");

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    if (projects.length > 0) {
      const p = projects[0];
      setProjectId(p.id);
      setProjectName(`${p.customerName} Site`);
      setCustomerName(p.customerName);
    } else if (customers.length > 0) {
      const c = customers[0];
      setProjectId("");
      setProjectName(`${c.name} Site`);
      setCustomerName(c.name);
    } else {
      setProjectId("");
      setProjectName("");
      setCustomerName("");
    }
    setTitle("Site Measurement & Layout Inspection");
    setDate(new Date().toISOString().split('T')[0]);
    setTime("11:00 AM");
    setPurpose("Verify modular cabinetry clearances and water/electrical points.");
    setAssignedTo(team.length > 0 ? team[0].name : "Site Supervisor");
    setStatus("Scheduled");
    setModalOpen(true);
  };

  const handleOpenEdit = (sch: ScheduleItem) => {
    setEditingSchedule(sch);
    setProjectId(sch.projectId || "");
    setProjectName(sch.projectName);
    setCustomerName(sch.customerName);
    setTitle(sch.title);
    setDate(sch.date);
    setTime(sch.time);
    setPurpose(sch.purpose);
    setAssignedTo(sch.assignedTo);
    setStatus(sch.status);
    setModalOpen(true);
  };

  const handleProjectSelect = (selectedProjId: string) => {
    setProjectId(selectedProjId);
    const p = projects.find(item => item.id === selectedProjId);
    if (p) {
      setProjectName(`${p.customerName} Site`);
      setCustomerName(p.customerName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const payload = {
      projectId,
      projectName: projectName || "Site Project",
      customerName: customerName || "Client",
      title,
      date,
      time,
      purpose,
      assignedTo: assignedTo || "Site Supervisor",
      status
    };

    try {
      if (editingSchedule) {
        await onUpdate(editingSchedule.id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Error saving site schedule:", err);
    }
  };

  const handleQuickStatusChange = async (sch: ScheduleItem, newStatus: "Scheduled" | "Completed" | "Cancelled") => {
    await onUpdate(sch.id, { status: newStatus });
  };

  // Filtered schedules
  const filteredSchedules = schedules.filter(s => {
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      !searchQuery ||
      s.title.toLowerCase().includes(q) ||
      s.projectName.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.assignedTo.toLowerCase().includes(q) ||
      s.purpose.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // KPI Counters
  const totalCount = schedules.length;
  const scheduledCount = schedules.filter(s => s.status === "Scheduled").length;
  const completedCount = schedules.filter(s => s.status === "Completed").length;
  const cancelledCount = schedules.filter(s => s.status === "Cancelled").length;

  return (
    <div className="space-y-6">
      {/* Top Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-widest">
            <Calendar className="w-4 h-4" /> Site Inspection & Visit Planner
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-100 mt-0.5">Site Schedules</h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Track site inspections, supervisor walkthroughs, and designer client appointments across all active sites.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/10 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Schedule Site Visit
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-stone-900 border border-stone-800/80 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Total Visits</div>
            <div className="text-xl font-bold font-serif text-stone-100">{totalCount}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Scheduled</div>
            <div className="text-xl font-bold font-serif text-blue-400">{scheduledCount}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Completed</div>
            <div className="text-xl font-bold font-serif text-emerald-400">{completedCount}</div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800/80 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-400 rounded-lg">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-stone-400">Cancelled</div>
            <div className="text-xl font-bold font-serif text-stone-400">{cancelledCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-stone-900/80 border border-stone-800/80 p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search site schedules by title, client, supervisor..."
            className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-200 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Scheduled", "Completed", "Cancelled"] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                statusFilter === st
                  ? "bg-amber-500 text-stone-950 font-bold"
                  : "bg-stone-950 hover:bg-stone-800 text-stone-400 border border-stone-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items List */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center text-stone-500 space-y-3">
          <Calendar className="w-10 h-10 text-stone-600 mx-auto" />
          <p className="text-sm font-semibold">No site schedules found matching criteria.</p>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Schedule New Visit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map(sch => (
            <div
              key={sch.id}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Row: Date & Status Badge */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-amber-500 font-mono font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      {sch.date}
                      <span className="text-stone-400 border-l border-stone-800 pl-1.5">{sch.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sch.status === "Scheduled"
                          ? "bg-blue-950 text-blue-400 border border-blue-800"
                          : sch.status === "Completed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-red-950 text-red-400 border border-red-800"
                      }`}
                    >
                      {sch.status}
                    </span>
                  </div>
                </div>

                {/* Title & Customer */}
                <div>
                  <h3 className="font-serif font-bold text-stone-100 text-base leading-snug">{sch.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-stone-300">{sch.projectName}</span>
                    <span>•</span>
                    <span>{sch.customerName}</span>
                  </div>
                </div>

                {/* Purpose details */}
                {sch.purpose && (
                  <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850 text-xs text-stone-300 leading-relaxed">
                    <strong className="text-stone-400 font-mono text-[10px] uppercase block mb-0.5">Visit Objective:</strong>
                    {sch.purpose}
                  </div>
                )}

                {/* Assigned Supervisor */}
                <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                  <div className="flex items-center gap-1.5 text-stone-300">
                    <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-stone-400">Assigned:</span>
                    <span className="font-semibold">{sch.assignedTo}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Actions: Status quick toggle + Edit & Delete options */}
              <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                {/* Status Quick Switch */}
                <div className="flex items-center gap-1">
                  {sch.status !== "Completed" && (
                    <button
                      onClick={() => handleQuickStatusChange(sch, "Completed")}
                      className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Mark as Completed"
                    >
                      <Check className="w-3 h-3" /> Complete
                    </button>
                  )}
                  {sch.status !== "Scheduled" && (
                    <button
                      onClick={() => handleQuickStatusChange(sch, "Scheduled")}
                      className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Mark as Scheduled"
                    >
                      <Clock className="w-3 h-3" /> Schedule
                    </button>
                  )}
                  {sch.status !== "Cancelled" && (
                    <button
                      onClick={() => handleQuickStatusChange(sch, "Cancelled")}
                      className="px-2 py-1 bg-stone-950 hover:bg-stone-850 text-stone-400 border border-stone-800 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Mark as Cancelled"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  )}
                </div>

                {/* Edit & Delete Option Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(sch)}
                    className="p-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-amber-500 border border-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Edit Site Schedule"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete(sch.id)}
                    className="p-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title="Delete Site Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-stone-950/80 px-6 py-4 border-b border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif font-bold text-stone-100 text-base">
                  {editingSchedule ? "Edit Site Visit Schedule" : "Schedule New Site Visit"}
                </h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Project / Customer Select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Site Project / Customer</label>
                {projects.length > 0 ? (
                  <select
                    value={projectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.customerName} - Site Interior Brief
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      setCustomerName(e.target.value);
                    }}
                    placeholder="Enter Client or Project Name"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                )}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Schedule Title / Purpose</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electrical & False Ceiling Height Verification"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Visit Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              {/* Objectives & Notes */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Inspection Objectives / Notes</label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Details on what needs to be measured or verified on site..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-xs text-stone-200 outline-none"
                />
              </div>

              {/* Assigned To & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Assigned To</label>
                  {team.length > 0 ? (
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                    >
                      {team.map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="e.g. Sanjay Swain"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold text-stone-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Scheduled" | "Completed" | "Cancelled")}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {editingSchedule ? "Save Changes" : "Create Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
