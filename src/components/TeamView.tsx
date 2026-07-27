import React, { useState } from "react";
import { Plus, Users, User, Hammer, Phone, Mail, Check, Calendar, ClipboardList, Trash2, X, Star } from "lucide-react";
import { TeamMember, TeamTask, Project } from "../types";

interface TeamViewProps {
  team: TeamMember[];
  projects: Project[];
  onAdd: (member: Omit<TeamMember, "id" | "createdAt">) => Promise<void>;
  onAddTask: (id: string, task: TeamTask) => Promise<void>;
  onToggleAttendance: (id: string, date: string) => Promise<void>;
}

export default function TeamView({ team, projects, onAdd, onAddTask, onToggleAttendance }: TeamViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form states - Member
  const [name, setName] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("Carpenter");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Form states - Task
  const [taskTitle, setTaskTitle] = useState("Assemble kitchen tall unit carcasses");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const todayDate = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setName("");
    setPhone("+91 ");
    setEmail("");
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

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      await onAdd({
        name,
        role,
        phone,
        email,
        assignedTasks: [],
        attendance: []
      });
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

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Site Subcontractors & Attendance</h3>
          <p className="text-xs text-stone-400">Keep records of carpenters, plumbers, and painters, coordinate field assignments, and track daily check-ins.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
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
            return (
              <div 
                key={member.id} 
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/10 hover:shadow-lg transition flex flex-col justify-between"
              >
                {/* Details top */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-stone-100 text-base">{member.name}</h4>
                      <span className="text-[10.5px] uppercase font-bold tracking-wider text-amber-500">{member.role}</span>
                    </div>

                    {/* Attendance Check-in Switcher */}
                    <button
                      onClick={() => onToggleAttendance(member.id, todayDate)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                        hasCheckedInToday 
                          ? "bg-green-600 text-white" 
                          : "bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200"
                      }`}
                      title="Toggle Daily Attendance"
                    >
                      <Check className="w-3.5 h-3.5" /> 
                      {hasCheckedInToday ? "Present Today" : "Check-in"}
                    </button>
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
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-850 font-sans text-stone-400">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      <span>Attendance: <strong className="text-stone-300 font-mono">{member.attendance.length} Days</strong></span>
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
                        className="text-[10px] text-amber-500 hover:text-amber-400 font-bold"
                      >
                        + Assign Task
                      </button>
                    </div>

                    {member.assignedTasks && member.assignedTasks.length > 0 ? (
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                        {member.assignedTasks.map((t, tIdx) => (
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

      {/* Add Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Register Subcontractor</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMember} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">FullName *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Behera"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Trade Skill Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeamMember["role"])}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                >
                  <option value="Carpenter">Lead Carpenter (Modular Woodwork)</option>
                  <option value="Electrician">Electrician (Cables & Profile LED)</option>
                  <option value="Painter">Painter (Emulsion & Texture Walls)</option>
                  <option value="Plumber">Plumber (Fittings & Drain lines)</option>
                  <option value="Supervisor">Site Supervisor</option>
                  <option value="Designer">Draftsman / Designer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh@nilachal.com"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-250 outline-none"
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
                  Register Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {taskModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-base font-serif font-bold text-stone-100">
                Assign Task to {selectedMember.name}
              </h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Project Location Site *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.customerName} Residence</option>
                  ))}
                  <option value="">General Workshop / Nilachal HQ</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Brief Description of Task *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Route false ceiling cove wiring"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition"
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
