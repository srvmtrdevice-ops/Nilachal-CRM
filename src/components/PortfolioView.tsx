import React, { useState } from "react";
import { Plus, Ruler, MapPin, Calendar, Layers, Eye, X, Lock, Sparkles } from "lucide-react";
import { PortfolioItem } from "../types";

interface PortfolioViewProps {
  portfolio: PortfolioItem[];
  onAdd: (item: Omit<PortfolioItem, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isAdminAuthenticated?: boolean;
}

export default function PortfolioView({ portfolio, onAdd, onDelete, isAdminAuthenticated = false }: PortfolioViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage for B&A slider
  const [isDragging, setIsDragging] = useState(false);

  // Secure passcode states for uploading
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [areaSqFt, setAreaSqFt] = useState(1500);
  const [budgetRange, setBudgetRange] = useState("₹8 - 12 Lakhs");
  const [completionDate, setCompletionDate] = useState("2026-04-12");
  const [category, setCategory] = useState<PortfolioItem["category"]>("Modular Kitchen");
  const [beforeImage, setBeforeImage] = useState("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"); // Standard messy tiles before
  const [afterImage, setAfterImage] = useState("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800"); // Modern modular kitchen after

  const categories = [
    "All",
    "Modular Kitchen",
    "Bedroom",
    "Living Room",
    "Office",
    "Restaurant",
    "Commercial",
    "Full Home Interior"
  ];

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - container.left;
    const percentage = Math.max(0, Math.min(100, (x / container.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !afterImage) return;

    try {
      await onAdd({
        title,
        description,
        location,
        areaSqFt: Number(areaSqFt) || 1200,
        budgetRange,
        completionDate,
        category,
        beforeImage: beforeImage || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
        afterImage,
        galleryImages: []
      });
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setLocation("");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = portfolio.filter(item => {
    return activeCategory === "All" || item.category === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Visual Header Banner */}
      <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-6 md:p-8 overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-mono uppercase tracking-wider font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Design Portfolio & Completed Handovers</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-stone-100">
            Project Gallery Showcase
          </h1>
          <p className="text-xs text-stone-400 max-w-xl">
            Explore finished turnkeys, modular kitchen models, false ceiling integrations, and compare the real raw transformations with our interactive before/after sliders.
          </p>
        </div>
      </div>

      {/* Category Selection Filter & Admin Add */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition ${
                activeCategory === cat
                  ? "bg-amber-500 text-stone-950"
                  : "bg-stone-950 text-stone-400 border border-stone-800 hover:text-stone-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (isAdminAuthenticated || isUnlocked) {
              setModalOpen(true);
            } else {
              setShowPasswordPrompt(true);
            }
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Showcase Project
        </button>
      </div>

      {/* Grid List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          No showcase items listed in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              {/* Interactive Before & After Slider Frame */}
              <div 
                className="relative h-64 sm:h-72 select-none overflow-hidden cursor-ew-resize bg-stone-950"
                onMouseMove={(e) => isDragging && handleSliderMove(e)}
                onTouchMove={(e) => handleSliderMove(e)}
                onMouseDown={(e) => { handleMouseDown(); handleSliderMove(e); }}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* AFTER image (Underneath) */}
                <img 
                  src={item.afterImage} 
                  alt="After" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                
                {/* AFTER tag (Bottom-right) */}
                <span className="absolute bottom-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                  Finished
                </span>

                {/* BEFORE image (Cropped/Overlaid on top) */}
                <div 
                  className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src={item.beforeImage} 
                    alt="Before" 
                    referrerPolicy="no-referrer"
                    className="absolute inset-y-0 left-0 w-full h-full object-cover max-w-none"
                    style={{ width: "100%", height: "100%", minWidth: "100%" }}
                  />
                  {/* BEFORE tag (Bottom-left) */}
                  <span className="absolute bottom-3 left-3 bg-stone-900/90 text-stone-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">
                    Before
                  </span>
                </div>

                {/* Sliding separator handle divider */}
                <div 
                  className="absolute inset-y-0 pointer-events-none w-0.5 bg-amber-500"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-500 text-stone-950 shadow-md border border-white flex items-center justify-center font-bold text-xs">
                    ↔
                  </div>
                </div>

                {/* Visual Hint */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-stone-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-amber-500" /> Drag center slider to compare
                </div>
              </div>

              {/* Details Pane */}
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-100">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.location || "Bhubaneswar"}</span>
                    </div>
                  </div>
                  <span className="bg-stone-950 border border-stone-800 text-stone-400 text-[10.5px] font-bold tracking-wide rounded-md px-2.5 py-1">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="grid grid-cols-3 gap-3 border-t border-stone-800/80 pt-4 text-center">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Built Area</span>
                    <span className="font-mono text-xs font-semibold text-stone-200 flex items-center justify-center gap-0.5 mt-0.5">
                      <Ruler className="w-3.5 h-3.5 text-amber-500/80" /> {item.areaSqFt} sq.ft.
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Budget Bracket</span>
                    <span className="font-mono text-xs font-semibold text-stone-200 block mt-0.5">
                      {item.budgetRange}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500">Handover Date</span>
                    <span className="font-mono text-xs font-semibold text-stone-200 block mt-0.5">
                      {item.completionDate}
                    </span>
                  </div>
                </div>

                {(isAdminAuthenticated || isUnlocked) && (
                  <div className="flex justify-end pt-2 border-t border-stone-850">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-xs text-stone-500 hover:text-red-500 transition font-medium"
                    >
                      Delete Portfolio Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Portfolio Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Add Portfolio Handover</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elegant Gold Trim Living Room"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Project Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the interior design styling, challenges solved, lighting profiles and custom laminates used..."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Cuttack Road, Bhubaneswar"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Category Type *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PortfolioItem["category"])}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Modular Kitchen">Modular Kitchen</option>
                    <option value="Bedroom">Bedroom</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Office">Office</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Full Home Interior">Full Home Interior</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Built Area (Sq.Ft.)</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(Number(e.target.value) || 1000)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Budget Range</label>
                  <input
                    type="text"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    placeholder="e.g. ₹5 - 7 Lakhs"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Completion Date</label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none"
                  />
                </div>
              </div>

              {/* Before and After Image URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-850 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Before Image URL (messy tiles, etc.)</label>
                  <input
                    type="url"
                    value={beforeImage}
                    onChange={(e) => setBeforeImage(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">After Finished Image URL *</label>
                  <input
                    type="url"
                    required
                    value={afterImage}
                    onChange={(e) => setAfterImage(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-300 outline-none font-mono"
                  />
                </div>
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
                  Publish Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secure Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => {
                setShowPasswordPrompt(false);
                setPasswordInput("");
                setPasswordError("");
              }} 
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-serif font-black text-stone-100">Gallery Secure Upload</h3>
              <p className="text-xs text-stone-400">
                Enter the master password to unlock photo uploads and project management.
              </p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput === "nilachal123") {
                  setIsUnlocked(true);
                  setShowPasswordPrompt(false);
                  setPasswordInput("");
                  setPasswordError("");
                  setModalOpen(true);
                } else {
                  setPasswordError("Incorrect master password");
                }
              }}
              className="space-y-3"
            >
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError("");
                }}
                placeholder="Enter master password..."
                className="w-full text-center bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-sm text-stone-200 outline-none"
                autoFocus
              />
              {passwordError && (
                <p className="text-[11px] text-red-400 font-semibold">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition"
              >
                Verify & Continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
