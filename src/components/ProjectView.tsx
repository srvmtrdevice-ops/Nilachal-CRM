import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, Home, Palette, Layers, Calendar, DollarSign, 
  Ruler, QrCode, FileText, ChevronDown, Check, Sparkles, Sliders, X
} from "lucide-react";
import { Project, Customer, MeasurementRow } from "../types";
import MeasurementSheet from "./MeasurementSheet";
import QRGenerator from "./QRGenerator";

interface ProjectViewProps {
  projects: Project[];
  customers: Customer[];
  onAdd: (proj: Omit<Project, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Project>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ProjectView({ projects, customers, onAdd, onUpdate, onDelete }: ProjectViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeProjectForQR, setActiveProjectForQR] = useState<Project | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState("");
  const [roomTypesInput, setRoomTypesInput] = useState("");
  const [stylePreference, setStylePreference] = useState("Modern");
  const [colorPreferences, setColorPreferences] = useState("");
  const [materialPreferences, setMaterialPreferences] = useState("");
  const [furnitureRequirements, setFurnitureRequirements] = useState("");
  const [falseCeiling, setFalseCeiling] = useState(false);
  const [lighting, setLighting] = useState("");
  const [electricalRequirements, setElectricalRequirements] = useState("");
  const [kitchenDetails, setKitchenDetails] = useState("");
  const [wardrobeDetails, setWardrobeDetails] = useState("");
  const [timelineWeeks, setTimelineWeeks] = useState(6);
  const [budget, setBudget] = useState(600000);
  const [designNotes, setDesignNotes] = useState("");
  const [siteMeasurements, setSiteMeasurements] = useState<MeasurementRow[]>([]);

  const handleOpenAdd = () => {
    if (customers.length === 0) {
      alert("Please create a Customer profile first before generating project specifications!");
      return;
    }
    setEditingProject(null);
    setCustomerId(customers[0]?.id || "");
    setRoomTypesInput("Kitchen, Living Room, Master Bedroom");
    setStylePreference("Modern");
    setColorPreferences("Warm Beige, Cream, Walnut wood accents");
    setMaterialPreferences("18mm BWP Plywood, Merino high-gloss laminate");
    setFurnitureRequirements("L-Shape sofa, 6-seater dining table, king-sized bed with storage");
    setFalseCeiling(true);
    setLighting("COB spotlights, LED strip profiles");
    setElectricalRequirements("Additional kitchen counter sockets, TV console routing");
    setKitchenDetails("Tandem boxes, profile handles, tall pantry unit");
    setWardrobeDetails("Sliding 3-door wardrobe with lacquer glass panel");
    setTimelineWeeks(8);
    setBudget(650000);
    setDesignNotes("Prioritize storage and hidden lighting.");
    setSiteMeasurements([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setCustomerId(proj.customerId);
    setRoomTypesInput(proj.roomTypes.join(", "));
    setStylePreference(proj.stylePreference);
    setColorPreferences(proj.colorPreferences);
    setMaterialPreferences(proj.materialPreferences);
    setFurnitureRequirements(proj.furnitureRequirements);
    setFalseCeiling(proj.falseCeiling);
    setLighting(proj.lighting);
    setElectricalRequirements(proj.electricalRequirements);
    setKitchenDetails(proj.kitchenDetails);
    setWardrobeDetails(proj.wardrobeDetails);
    setTimelineWeeks(proj.timelineWeeks);
    setBudget(proj.budget);
    setDesignNotes(proj.designNotes);
    setSiteMeasurements(proj.siteMeasurements || []);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    const selectedCustomer = customers.find(c => c.id === customerId);
    if (!selectedCustomer) return;

    const rooms = roomTypesInput.split(",").map(r => r.trim()).filter(Boolean);

    const payload = {
      customerId,
      customerName: selectedCustomer.name,
      roomTypes: rooms,
      stylePreference,
      colorPreferences,
      materialPreferences,
      furnitureRequirements,
      falseCeiling,
      lighting,
      electricalRequirements,
      kitchenDetails,
      wardrobeDetails,
      timelineWeeks: Number(timelineWeeks) || 6,
      budget: Number(budget) || 0,
      referenceImages: [],
      siteMeasurements,
      designNotes,
      qrCode: "",
    };

    try {
      if (editingProject) {
        await onUpdate(editingProject.id, payload);
      } else {
        await onAdd(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Nilachal Creatives Project Specifications</h3>
          <p className="text-xs text-stone-400">Log style briefings, false ceiling wiring, and measure-sheets for modular carpentry.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Start Project Brief
        </button>
      </div>

      {/* Main Grid: Projects Listing */}
      {projects.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No projects configured yet. Tap "Start Project Brief" above to configure.
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map(proj => {
            const customer = customers.find(c => c.id === proj.customerId);
            return (
              <div 
                key={proj.id} 
                className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg transition duration-200 hover:border-amber-500/20"
              >
                {/* Project Brief Header */}
                <div className="bg-stone-950/60 px-5 py-4 border-b border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-amber-500" />
                      <h4 className="font-serif font-bold text-stone-100 text-base">{proj.customerName} - Site Interior Design</h4>
                    </div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                      Pipeline Phase: <strong className="text-stone-300">{customer?.status || "Inquiry"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveProjectForQR(activeProjectForQR?.id === proj.id ? null : proj)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                        activeProjectForQR?.id === proj.id
                          ? "bg-amber-500 text-stone-950"
                          : "bg-stone-900 hover:bg-stone-800 text-stone-300"
                      }`}
                      title="Generate Shareable QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Client QR Code
                    </button>
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-500 rounded transition"
                      title="Edit Brief"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(proj.id)}
                      className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-500 rounded transition"
                      title="Delete Brief"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project QR expander drawer */}
                {activeProjectForQR?.id === proj.id && (
                  <div className="bg-stone-950/40 p-5 border-b border-stone-800 animate-in slide-in-from-top duration-200">
                    <QRGenerator 
                      value={`${window.location.origin}/?portalId=${proj.id}`} 
                      projectName={proj.customerName} 
                    />
                  </div>
                )}

                {/* Project Specs Content */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Column 1: Aesthetics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400 border-b border-stone-800 pb-2">
                      <Palette className="w-4 h-4 text-amber-500/80" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Aesthetics & Styles</span>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li>Style Preference: <strong className="text-stone-100 font-medium">{proj.stylePreference}</strong></li>
                      <li>Color Palette: <span className="text-stone-400">{proj.colorPreferences}</span></li>
                      <li>Selected Materials: <span className="text-stone-400">{proj.materialPreferences}</span></li>
                      <li>Furniture Brief: <span className="text-stone-400">{proj.furnitureRequirements}</span></li>
                    </ul>
                  </div>

                  {/* Column 2: Fabrication Specs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400 border-b border-stone-800 pb-2">
                      <Layers className="w-4 h-4 text-amber-500/80" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Fabrication Specs</span>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li className="flex items-center gap-1.5">
                        False Ceiling: 
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${proj.falseCeiling ? "bg-green-500/10 text-green-400" : "bg-stone-800 text-stone-500"}`}>
                          {proj.falseCeiling ? "Required" : "No"}
                        </span>
                      </li>
                      <li>Lighting Layout: <span className="text-stone-400">{proj.lighting}</span></li>
                      <li>Kitchen Cabinetry: <span className="text-stone-400">{proj.kitchenDetails}</span></li>
                      <li>Wardrobe Woodwork: <span className="text-stone-400">{proj.wardrobeDetails}</span></li>
                    </ul>
                  </div>

                  {/* Column 3: Site Logistics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400 border-b border-stone-800 pb-2">
                      <Calendar className="w-4 h-4 text-amber-500/80" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-200">Site & Logistics</span>
                    </div>
                    <ul className="space-y-2 text-xs text-stone-300">
                      <li>Target Budget: <strong className="text-amber-500 font-mono">{formatCurrency(proj.budget)}</strong></li>
                      <li>Timeline Duration: <strong className="text-stone-200">{proj.timelineWeeks} Weeks</strong></li>
                      <li>Planned Spaces: <span className="text-amber-400/80 font-medium">{proj.roomTypes.join(", ")}</span></li>
                      {proj.designNotes && (
                        <li className="bg-stone-950 p-2 rounded text-[11px] text-stone-400 border border-stone-850 italic">
                          "{proj.designNotes}"
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Embedded dynamic measurements visualization if existing */}
                {proj.siteMeasurements && proj.siteMeasurements.length > 0 && (
                  <div className="bg-stone-950/50 p-5 border-t border-stone-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-amber-500" /> Recorded Carpet Measurements
                      </span>
                      <span className="text-xs font-bold text-amber-500 font-mono">
                        Total: {proj.siteMeasurements.reduce((sum, r) => sum + r.area, 0).toFixed(1)} sq. ft.
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {proj.siteMeasurements.map((m, idx) => (
                        <div key={idx} className="bg-stone-900 p-2.5 rounded border border-stone-800/80 text-[11px]">
                          <div className="font-bold text-stone-300">{m.room}</div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            {m.length && m.width ? `${m.length}' x ${m.width}' ` : ""}Qty: {m.quantity}
                          </div>
                          <div className="text-amber-500 font-bold font-mono text-[10.5px] mt-1">{m.area.toFixed(0)} sq.ft</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Specification Intake & Measurement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">
                {editingProject ? "Update Interior Specifications" : "Start Brand New Project Brief"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Customer Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Associated Client *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={!!editingProject}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.projectLocation})</option>
                    ))}
                  </select>
                </div>

                {/* Spaces list */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Target Spaces (comma separated)</label>
                  <input
                    type="text"
                    value={roomTypesInput}
                    onChange={(e) => setRoomTypesInput(e.target.value)}
                    placeholder="e.g. Kitchen, Guest Room, Foyer"
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>

                {/* Theme Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Style Aesthetic</label>
                  <select
                    value={stylePreference}
                    onChange={(e) => setStylePreference(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Modern">Modern Elegant</option>
                    <option value="Minimal">Scandinavian Minimalist</option>
                    <option value="Luxury">Art Deco / Luxury Premium</option>
                    <option value="Classical">Traditional / Classical</option>
                    <option value="Industrial">Urban Industrial</option>
                  </select>
                </div>
              </div>

              {/* Design briefs details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-850 pt-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Material & Theme Palette</h4>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-400">Color Prefs</label>
                    <input
                      type="text"
                      value={colorPreferences}
                      onChange={(e) => setColorPreferences(e.target.value)}
                      placeholder="e.g. Charcoal gray, rose gold highlights"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-400">Material specifications</label>
                    <input
                      type="text"
                      value={materialPreferences}
                      onChange={(e) => setMaterialPreferences(e.target.value)}
                      placeholder="e.g. MDF, acrylic high gloss shutter, quartz counter"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-400">Furniture briefs</label>
                    <input
                      type="text"
                      value={furnitureRequirements}
                      onChange={(e) => setFurnitureRequirements(e.target.value)}
                      placeholder="e.g. Sofa set, dresser, console drawers"
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Fabrication Specs</h4>
                  
                  <div className="flex items-center justify-between p-2.5 bg-stone-950 border border-stone-800 rounded-lg">
                    <label className="text-xs font-semibold text-stone-300">False Ceiling Work Required</label>
                    <input
                      type="checkbox"
                      checked={falseCeiling}
                      onChange={(e) => setFalseCeiling(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-amber-500 w-4 h-4 focus:ring-0 focus:ring-offset-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] text-stone-400">Lighting Layout</label>
                      <input
                        type="text"
                        value={lighting}
                        onChange={(e) => setLighting(e.target.value)}
                        placeholder="e.g. profiles, cob spotlights"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] text-stone-400">Electrical Points</label>
                      <input
                        type="text"
                        value={electricalRequirements}
                        onChange={(e) => setElectricalRequirements(e.target.value)}
                        placeholder="e.g. chimney plug, footlamps"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] text-stone-400">Modular Kitchen brief</label>
                      <input
                        type="text"
                        value={kitchenDetails}
                        onChange={(e) => setKitchenDetails(e.target.value)}
                        placeholder="e.g. g-profile, Tandem baskets"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10.5px] text-stone-400">Wardrobe briefs</label>
                      <input
                        type="text"
                        value={wardrobeDetails}
                        onChange={(e) => setWardrobeDetails(e.target.value)}
                        placeholder="e.g. sliding, wood laminate"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-200 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Budget */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-stone-850 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Timeline (Weeks)</label>
                  <input
                    type="number"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value) || 4)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Target Budget (INR)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-xs font-semibold text-stone-400">Site Briefing Notes</label>
                  <input
                    type="text"
                    value={designNotes}
                    onChange={(e) => setDesignNotes(e.target.value)}
                    placeholder="General comments..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
              </div>

              {/* Site Measurement Sheet Embed */}
              <div className="border-t border-stone-850 pt-4 space-y-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Include Digital Site Measurement Sheet</span>
                <MeasurementSheet 
                  initialMeasurements={siteMeasurements} 
                  onSave={(rows) => setSiteMeasurements(rows)} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-stone-800">
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
                  {editingProject ? "Save Briefing" : "Create Briefing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
