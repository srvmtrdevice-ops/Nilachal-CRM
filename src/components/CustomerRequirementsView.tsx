import React, { useState, useEffect } from "react";
import { 
  CheckCircle, AlertCircle, Save, Plus, Trash2, HelpCircle, Sparkles, 
  Layers, Hammer, Layout, FileText, ChevronRight, Bookmark, CheckSquare, Square
} from "lucide-react";
import { Customer, CustomerRequirements } from "../types";

interface CustomerRequirementsViewProps {
  customers: Customer[];
  requirements: CustomerRequirements[];
  onSave: (req: Omit<CustomerRequirements, "id" | "updatedAt"> & { id?: string }) => Promise<void>;
}

export default function CustomerRequirementsView({ 
  customers, 
  requirements, 
  onSave 
}: CustomerRequirementsViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [modularKitchen, setModularKitchen] = useState(false);
  const [wardrobe, setWardrobe] = useState(false);
  const [falseCeiling, setFalseCeiling] = useState(false);
  const [tvUnit, setTvUnit] = useState(false);
  const [inverterBox, setInverterBox] = useState(false);
  const [shoeBox, setShoeBox] = useState(false);
  const [partition, setPartition] = useState(false);
  const [doorPanelling, setDoorPanelling] = useState(false);
  const [chowkathPanelling, setChowkathPanelling] = useState(false);
  const [lockFitting, setLockFitting] = useState(false);
  const [mainDoorPanelling, setMainDoorPanelling] = useState(false);

  // Standard custom text boxes
  const [customKitchenSpec, setCustomKitchenSpec] = useState("");
  const [customKitchenSqft, setCustomKitchenSqft] = useState("");
  const [customWardrobeSpec, setCustomWardrobeSpec] = useState("");
  const [customWardrobeSqft, setCustomWardrobeSqft] = useState("");
  const [customFurnitureSpec, setCustomFurnitureSpec] = useState("");
  const [customFurnitureSqft, setCustomFurnitureSqft] = useState("");
  const [customCeilingSpec, setCustomCeilingSpec] = useState("");
  const [customCeilingSqft, setCustomCeilingSqft] = useState("");

  // Dynamic customized orders list
  const [dynamicCustomOrders, setDynamicCustomOrders] = useState<{ label: string; value: string }[]>([]);
  const [newOrderLabel, setNewOrderLabel] = useState("");
  const [newOrderValue, setNewOrderValue] = useState("");

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Auto-set first customer if available
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Load existing requirements when customer changes
  useEffect(() => {
    if (selectedCustomerId) {
      const existing = requirements.find(r => r.customerId === selectedCustomerId);
      if (existing) {
        setModularKitchen(existing.modularKitchen || false);
        setWardrobe(existing.wardrobe || false);
        setFalseCeiling(existing.falseCeiling || false);
        setTvUnit(existing.tvUnit || false);
        setInverterBox(existing.inverterBox || false);
        setShoeBox(existing.shoeBox || false);
        setPartition(existing.partition || false);
        setDoorPanelling(existing.doorPanelling || false);
        setChowkathPanelling(existing.chowkathPanelling || false);
        setLockFitting(existing.lockFitting || false);
        setMainDoorPanelling(existing.mainDoorPanelling || false);

        setCustomKitchenSpec(existing.customKitchenSpec || "");
        setCustomKitchenSqft(existing.customKitchenSqft || "");
        setCustomWardrobeSpec(existing.customWardrobeSpec || "");
        setCustomWardrobeSqft(existing.customWardrobeSqft || "");
        setCustomFurnitureSpec(existing.customFurnitureSpec || "");
        setCustomFurnitureSqft(existing.customFurnitureSqft || "");
        setCustomCeilingSpec(existing.customCeilingSpec || "");
        setCustomCeilingSqft(existing.customCeilingSqft || "");
        setDynamicCustomOrders(existing.dynamicCustomOrders || []);
      } else {
        // Reset to false/empty
        setModularKitchen(false);
        setWardrobe(false);
        setFalseCeiling(false);
        setTvUnit(false);
        setInverterBox(false);
        setShoeBox(false);
        setPartition(false);
        setDoorPanelling(false);
        setChowkathPanelling(false);
        setLockFitting(false);
        setMainDoorPanelling(false);

        setCustomKitchenSpec("");
        setCustomKitchenSqft("");
        setCustomWardrobeSpec("");
        setCustomWardrobeSqft("");
        setCustomFurnitureSpec("");
        setCustomFurnitureSqft("");
        setCustomCeilingSpec("");
        setCustomCeilingSqft("");
        setDynamicCustomOrders([]);
      }
    }
  }, [selectedCustomerId, requirements]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedCustomer) return;

    setSaving(true);
    setSuccessMsg(null);

    const existing = requirements.find(r => r.customerId === selectedCustomerId);

    const payload = {
      id: existing?.id,
      customerId: selectedCustomerId,
      customerName: selectedCustomer.name,
      modularKitchen,
      wardrobe,
      falseCeiling,
      tvUnit,
      inverterBox,
      shoeBox,
      partition,
      doorPanelling,
      chowkathPanelling,
      lockFitting,
      mainDoorPanelling,
      customKitchenSpec,
      customKitchenSqft,
      customWardrobeSpec,
      customWardrobeSqft,
      customFurnitureSpec,
      customFurnitureSqft,
      customCeilingSpec,
      customCeilingSqft,
      dynamicCustomOrders
    };

    try {
      await onSave(payload);
      setSuccessMsg(`Requirements for ${selectedCustomer.name} updated successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error("Failed to save requirements", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDynamicOrder = () => {
    if (!newOrderLabel.trim() || !newOrderValue.trim()) return;
    setDynamicCustomOrders(prev => [
      ...prev, 
      { label: newOrderLabel.trim(), value: newOrderValue.trim() }
    ]);
    setNewOrderLabel("");
    setNewOrderValue("");
  };

  const handleRemoveDynamicOrder = (index: number) => {
    setDynamicCustomOrders(prev => prev.filter((_, i) => i !== index));
  };

  if (customers.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center max-w-md mx-auto text-stone-400">
        <HelpCircle className="w-12 h-12 mx-auto text-stone-600 mb-4" />
        <h3 className="font-serif font-bold text-stone-200">No Customers Added Yet</h3>
        <p className="text-xs text-stone-500 mt-2">
          Add at least one customer in the "Customers" tab first to define and configure their tailored interior requirements.
        </p>
      </div>
    );
  }

  // Checkbox config definition to iterate cleanly
  const checkboxConfigs = [
    { id: "kitchen", label: "Modular Kitchen", checked: modularKitchen, setChecked: setModularKitchen, desc: "Cabinet layouts, chimney chimney provision, sink fittings." },
    { id: "wardrobe", label: "Wardrobe", checked: wardrobe, setChecked: setWardrobe, desc: "Built-in sliding or hinged wardrobe setups." },
    { id: "ceiling", label: "False Ceiling", checked: falseCeiling, setChecked: setFalseCeiling, desc: "Plasterboard, modular grid, or wood panel accents." },
    { id: "tvUnit", label: "TV Unit", checked: tvUnit, setChecked: setTvUnit, desc: "Floating TV panel, cable organizers, backlighting." },
    { id: "inverter", label: "Inverter Box", checked: inverterBox, setChecked: setInverterBox, desc: "Concealed heavy-duty electrical cabinet for backups." },
    { id: "shoeBox", label: "Shoe Box", checked: shoeBox, setChecked: setShoeBox, desc: "Entryway multi-tier ventilated footwear chest." },
    { id: "partition", label: "Partition / Screen", checked: partition, setChecked: setPartition, desc: "CNC jaali, fluted panel space divider, or foyer partition." },
    { id: "door", label: "Door Panelling", checked: doorPanelling, setChecked: setDoorPanelling, desc: "Decorative surface veneers or laminate skins on flush doors." },
    { id: "chowkath", label: "Chowkath Panelling", checked: chowkathPanelling, setChecked: setChowkathPanelling, desc: "Concealed framing and cladding around door jambs." },
    { id: "lock", label: "Lock Fitting", checked: lockFitting, setChecked: setLockFitting, desc: "Premium smart digital lock or mortise handles setup." },
    { id: "mainDoor", label: "Main Door Panelling", checked: mainDoorPanelling, setChecked: setMainDoorPanelling, desc: "Grand exterior door cladding with security trims." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="customer-requirements-view">
      
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute top-[-10%] right-[-5%] w-48 h-48 bg-[#FFBE0B]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#FFBE0B] font-mono text-xs uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Tailor-Made interior scope</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-stone-100">
              Client Requirements Tracker
            </h1>
            <p className="text-xs text-stone-400 max-w-xl">
              Map out modular fit-out scopes, lock fittings, panelling configurations, and write specific customized orders directly into the client portfolio profile.
            </p>
          </div>

          {/* Customer Dropdown Selector */}
          <div className="w-full md:w-80 space-y-2 bg-stone-950/80 border border-stone-800 p-4 rounded-xl shadow-inner">
            <label className="block text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">
              Select Client Scope
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setSuccessMsg(null);
              }}
              className="w-full bg-stone-900 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-lg px-3 py-2 text-xs text-stone-200 font-semibold outline-none cursor-pointer"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.projectLocation})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Section 1: Interactive Scope Tick Boxes */}
          <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className="bg-[#FFBE0B]/10 p-2 rounded-lg border border-[#FFBE0B]/20 text-[#FFBE0B]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-stone-100">
                  Standard Interior Checklists
                </h2>
                <p className="text-xs text-stone-400">
                  Select all required items for {selectedCustomer.name}'s project turnkey package.
                </p>
              </div>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkboxConfigs.map(item => (
                <div
                  key={item.id}
                  onClick={() => item.setChecked(!item.checked)}
                  className={`group flex items-start gap-3.5 p-4 rounded-xl border transition cursor-pointer select-none ${
                    item.checked
                      ? "bg-[#FFBE0B]/5 border-[#FFBE0B]/40 shadow-sm"
                      : "bg-stone-950/40 border-stone-850 hover:bg-stone-950/80 hover:border-stone-800"
                  }`}
                >
                  <div className="pt-0.5 shrink-0 transition group-hover:scale-105 duration-150">
                    {item.checked ? (
                      <CheckSquare className="w-5 h-5 text-[#FFBE0B] fill-[#FFBE0B]/10" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className={`text-xs font-bold leading-none ${item.checked ? "text-stone-100" : "text-stone-400"}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Customised Specifications Text Fields */}
          <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 text-[#FFBE0B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-stone-100">
                  Detailed Customized Orders
                </h2>
                <p className="text-xs text-stone-400">
                  Specify bespoke requirements, premium finishes, and exact material selections.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1: Kitchen Specification */}
              <div className="space-y-2 bg-stone-950/40 p-4 rounded-2xl border border-stone-850/60">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block truncate">
                    Kitchen Customizations & Hardware Spec
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">Sqft</span>
                    <input
                      type="text"
                      value={customKitchenSqft}
                      onChange={(e) => setCustomKitchenSqft(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-20 bg-stone-950 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-mono text-center outline-none transition"
                    />
                  </div>
                </div>
                <textarea
                  value={customKitchenSpec}
                  onChange={(e) => setCustomKitchenSpec(e.target.value)}
                  placeholder="e.g., L-shaped modular counter with tall pantry, soft-close Blum tandem drawer runners, integrated G-profile handles, 18mm Marine Plywood."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/50 rounded-xl px-4 py-3 text-xs text-stone-200 placeholder-stone-700 outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* Box 2: Wardrobes Specification */}
              <div className="space-y-2 bg-stone-950/40 p-4 rounded-2xl border border-stone-850/60">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block truncate">
                    Wardrobe Layout & Internal Finishes Spec
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">Sqft</span>
                    <input
                      type="text"
                      value={customWardrobeSqft}
                      onChange={(e) => setCustomWardrobeSqft(e.target.value)}
                      placeholder="e.g. 180"
                      className="w-20 bg-stone-950 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-mono text-center outline-none transition"
                    />
                  </div>
                </div>
                <textarea
                  value={customWardrobeSpec}
                  onChange={(e) => setCustomWardrobeSpec(e.target.value)}
                  placeholder="e.g., Slatted master bedroom wardrobe with clear profile glass doors, inner drawers with key-locks, and premium leatherette accessory organizers."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/50 rounded-xl px-4 py-3 text-xs text-stone-200 placeholder-stone-700 outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* Box 3: False Ceiling & Lighting Spec */}
              <div className="space-y-2 bg-stone-950/40 p-4 rounded-2xl border border-stone-850/60">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block truncate">
                    False Ceiling, Cove Heights & Lighting Spec
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">Sqft</span>
                    <input
                      type="text"
                      value={customCeilingSqft}
                      onChange={(e) => setCustomCeilingSqft(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-20 bg-stone-950 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-mono text-center outline-none transition"
                    />
                  </div>
                </div>
                <textarea
                  value={customCeilingSpec}
                  onChange={(e) => setCustomCeilingSpec(e.target.value)}
                  placeholder="e.g., Gyproc plasterboard flat ceiling with shadow groove. Double cove layout on side borders with Philips warm white LED strips, provision for heavy-duty fan hook."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/50 rounded-xl px-4 py-3 text-xs text-stone-200 placeholder-stone-700 outline-none transition resize-none leading-relaxed"
                />
              </div>

              {/* Box 4: Custom Furniture & Accents Spec */}
              <div className="space-y-2 bg-stone-950/40 p-4 rounded-2xl border border-stone-850/60">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-400 block truncate">
                    Bespoke Furniture, Panelling & General Accents Spec
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">Sqft</span>
                    <input
                      type="text"
                      value={customFurnitureSqft}
                      onChange={(e) => setCustomFurnitureSqft(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-20 bg-stone-950 border border-stone-800 focus:border-[#FFBE0B]/50 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-mono text-center outline-none transition"
                    />
                  </div>
                </div>
                <textarea
                  value={customFurnitureSpec}
                  onChange={(e) => setCustomFurnitureSpec(e.target.value)}
                  placeholder="e.g., Floating wood-finish TV console board with hidden wiring conduit. Fluted louvers panel at the entrance screen with vertical vanity mirror overlay."
                  rows={3}
                  className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/50 rounded-xl px-4 py-3 text-xs text-stone-200 placeholder-stone-700 outline-none transition resize-none leading-relaxed"
                />
              </div>

            </div>
          </div>

          {/* Section 3: Dynamic Customized Orders Block */}
          <div className="bg-stone-900 border border-stone-850 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
              <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20 text-[#FFBE0B]">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-stone-100">
                  Additional Dynamic Custom Orders
                </h2>
                <p className="text-xs text-stone-400">
                  Add custom order text boxes dynamically for anything not covered in standard checklists.
                </p>
              </div>
            </div>

            {/* Existing dynamic custom orders list */}
            {dynamicCustomOrders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500">
                  Configured Bespoke Sub-Orders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicCustomOrders.map((order, idx) => (
                    <div 
                      key={idx} 
                      className="bg-stone-950 border border-stone-850 rounded-xl p-4 flex justify-between items-start gap-4 shadow-sm relative overflow-hidden"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFBE0B]" />
                          <p className="text-xs font-bold text-stone-200">{order.label}</p>
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed pl-3.5">
                          {order.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDynamicOrder(idx)}
                        className="p-1.5 bg-stone-900 hover:bg-red-950/30 text-stone-500 hover:text-red-400 border border-stone-800 hover:border-red-900/20 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form to add a new dynamic customized order */}
            <div className="bg-stone-950/60 border border-stone-850 p-4 md:p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-stone-300">
                Create Separate Custom Order Field
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500 block">
                    Order Title / Label
                  </label>
                  <input
                    type="text"
                    value={newOrderLabel}
                    onChange={(e) => setNewOrderLabel(e.target.value)}
                    placeholder="e.g. Balcony Wooden Ceiling"
                    className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/40 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-700 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2 flex gap-3 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-stone-500 block">
                      Customized Specifications / Dimensions
                    </label>
                    <input
                      type="text"
                      value={newOrderValue}
                      onChange={(e) => setNewOrderValue(e.target.value)}
                      placeholder="e.g. Pine wood planks cladded over standard framework with clear melamine polish overlay."
                      className="w-full bg-stone-950 border border-stone-850 focus:border-[#FFBE0B]/40 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder-stone-700 outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDynamicOrder}
                    disabled={!newOrderLabel.trim() || !newOrderValue.trim()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-950 border border-stone-800 disabled:border-stone-900 text-xs font-bold font-mono tracking-wide rounded-lg text-amber-500 disabled:text-stone-700 transition h-[36px] flex items-center gap-1 shrink-0 uppercase"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer & Feedback */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-green-950/40 border border-green-900/30 rounded-xl text-xs text-green-400 animate-in fade-in max-w-md">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-semibold leading-relaxed">{successMsg}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-[#FFBE0B] text-stone-950 font-black cursor-pointer rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md shadow-amber-500/10 min-w-[200px]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Scope..." : `Save Requirements`}</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
