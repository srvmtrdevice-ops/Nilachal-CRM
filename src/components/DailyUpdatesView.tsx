import React, { useState } from "react";
import { Plus, Hammer, ChevronRight, Image, Check, ListChecks, Calendar, Trash2, X, Sparkles } from "lucide-react";
import { ProjectUpdate, Project } from "../types";

interface DailyUpdatesViewProps {
  updates: ProjectUpdate[];
  projects: Project[];
  onAdd: (update: Omit<ProjectUpdate, "id" | "createdAt">) => Promise<void>;
}

export default function DailyUpdatesView({ updates, projects, onAdd }: DailyUpdatesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [projectId, setProjectId] = useState("");
  const [progressPercentage, setProgressPercentage] = useState(45);
  const [statusText, setStatusText] = useState("Carpentry under execution");
  const [workCompleted, setWorkCompleted] = useState("Completed carcasses for modular kitchen base cabinets. Began shutter drilling.");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenAdd = () => {
    if (projects.length === 0) {
      alert("Please configure a Project Brief first before logging daily site progress!");
      return;
    }
    setProjectId(projects[0]?.id || "");
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
        progressPercentage,
        statusText,
        workCompleted,
        photos: ["https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=400"], // Realistic carpentry/workshop photo placeholder
        date
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Site Progress Logs</h3>
          <p className="text-xs text-stone-400">Post daily site supervisor updates, set progress completion, and share visual summaries with clients.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Log Site Progress
        </button>
      </div>

      {/* Timeline display */}
      {updates.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No daily site updates registered yet. Click "Log Site Progress" to start the timeline!
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-y-0 before:left-3.5 sm:before:left-1/2 before:w-0.5 before:bg-stone-800">
          {updates.map((upd, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={upd.id} 
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:gap-8 ${
                  isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Visual Circle Indicator */}
                <div className="absolute left-3.5 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500 border-4 border-stone-905 z-10" />

                {/* Date Label */}
                <div className="pl-8 sm:pl-0 sm:w-1/2 sm:text-right font-mono text-xs text-stone-400 font-bold uppercase tracking-wider">
                  <div className={`flex items-center gap-1.5 sm:justify-end ${isEven ? "" : "sm:justify-start sm:flex-row-reverse"}`}>
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>{upd.date}</span>
                  </div>
                </div>

                {/* Update Card */}
                <div className="pl-8 sm:pl-0 w-full sm:w-1/2">
                  <div className="bg-stone-900 border border-stone-800 hover:border-amber-500/20 rounded-2xl p-5 shadow-lg transition duration-200">
                    <div className="flex justify-between items-center border-b border-stone-850 pb-2 mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-stone-500">{upd.projectName}</span>
                        <h4 className="text-sm font-semibold text-stone-200 mt-0.5">{upd.statusText}</h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {upd.progressPercentage}% Complete
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed italic">
                      "{upd.workCompleted}"
                    </p>

                    {/* Progress Slider track visual */}
                    <div className="w-full bg-stone-950 h-1.5 rounded-full mt-4 overflow-hidden border border-stone-900">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full" 
                        style={{ width: `${upd.progressPercentage}%` }}
                      />
                    </div>

                    {/* Images placeholder */}
                    {upd.photos && upd.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-850">
                        {upd.photos.map((photo, pIdx) => (
                          <div key={pIdx} className="relative aspect-video rounded-lg overflow-hidden border border-stone-800">
                            <img 
                              src={photo} 
                              alt="Site update" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40 hover:bg-transparent transition duration-200 flex items-center justify-center">
                              <Image className="w-4 h-4 text-white/65" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Site Progress Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Log Site Progress Update</h3>
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
                    <option key={p.id} value={p.id}>{p.customerName} Residence</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-stone-400">Overall Progress Percentage</label>
                  <span className="text-amber-500 font-mono font-bold text-sm">{progressPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={progressPercentage}
                  onChange={(e) => setProgressPercentage(Number(e.target.value))}
                  className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Status Headline *</label>
                <input
                  type="text"
                  required
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  placeholder="e.g. False ceiling layout completed"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Daily Work Completed Brief *</label>
                <textarea
                  required
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  placeholder="Specify task completed (e.g., cut gypsum boards for living room ceiling, mounted LED profiles)..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Log Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
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
                  Post Progress Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
