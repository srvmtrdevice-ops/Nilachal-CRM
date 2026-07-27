import React, { useState } from "react";
import { Plus, Package, Ruler, Layers, AlertCircle, RefreshCw, X, Sliders } from "lucide-react";
import { InventoryItem } from "../types";

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAdd: (item: Omit<InventoryItem, "id" | "updatedAt">) => Promise<void>;
  onAddStock: (id: string, qty: number) => Promise<void>;
}

export default function InventoryView({ inventory, onAdd, onAddStock }: InventoryViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states - Item
  const [name, setName] = useState("CenturyPly 19mm Club Prime BWP");
  const [category, setCategory] = useState<InventoryItem["category"]>("Plywood");
  const [quantity, setQuantity] = useState(40);
  const [unit, setUnit] = useState("Sheets");
  const [minStock, setMinStock] = useState(15);
  const [location, setLocation] = useState("Patia Warehouse");

  // Form states - Stock
  const [addQty, setAddQty] = useState(20);

  const handleOpenAdd = () => {
    setName("Ebco Soft-Close Drawer Rails");
    setCategory("Hardware Fittings");
    setQuantity(25);
    setUnit("Pairs");
    setMinStock(10);
    setLocation("Patia Warehouse");
    setModalOpen(true);
  };

  const handleOpenAddStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAddQty(10);
    setStockModalOpen(true);
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || quantity < 0) return;

    try {
      await onAdd({
        name,
        category,
        quantity,
        unit,
        minRequired: minStock,
        location
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || addQty === 0) return;

    try {
      await onAddStock(selectedItem.id, addQty);
      setStockModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div>
          <h3 className="font-serif font-bold text-stone-200 text-sm">Materials & Hardware Inventory</h3>
          <p className="text-xs text-stone-400">Monitor carpentry hardware reserves, laminates, adhesives, and receive shortage warnings on low-stock items.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition duration-200"
        >
          <Plus className="w-4 h-4" /> Register New Inventory Item
        </button>
      </div>

      {/* Grid listing */}
      {inventory.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No inventory items registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map(item => {
            const isLowStock = item.quantity <= item.minRequired;
            return (
              <div 
                key={item.id} 
                className={`bg-stone-900 border rounded-2xl p-5 hover:shadow-lg transition flex flex-col justify-between ${
                  isLowStock ? "border-red-500/30 bg-red-500/[0.01]" : "border-stone-800"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-stone-100 text-sm">{item.name}</h4>
                      <span className="text-[10.5px] uppercase font-bold tracking-wider text-stone-500">{item.category}</span>
                    </div>

                    {isLowStock && (
                      <span className="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    )}
                  </div>

                  {/* Quantities indicator */}
                  <div className="grid grid-cols-2 gap-3 bg-stone-950 p-3.5 rounded-xl border border-stone-850 text-xs text-stone-300">
                    <div className="space-y-1">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase block">In Stock</span>
                      <span className="font-mono font-bold text-stone-200 block text-base">
                        {item.quantity} <span className="text-xs text-stone-400 font-sans font-medium">{item.unit}</span>
                      </span>
                    </div>
                    <div className="space-y-1 border-l border-stone-800 pl-3">
                      <span className="text-stone-500 text-[10px] font-semibold uppercase block">Min Alert Level</span>
                      <span className="font-mono text-stone-400 block text-xs mt-1">
                        {item.minRequired} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Warehousing info */}
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>Warehouse: <strong className="text-stone-400 font-normal">{item.location}</strong></span>
                  </div>
                </div>

                {/* Foot restock button */}
                <div className="mt-4 pt-3 border-t border-stone-850 flex justify-end">
                  <button
                    onClick={() => handleOpenAddStock(item)}
                    className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/20 text-[10.5px] text-amber-500 font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Restock / Add Qty
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Register Inventory Item</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitItem} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Material / Fittings Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ebco Soft Close Auto-Hinges"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryItem["category"])}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Hardware Fittings">Hardware Fittings</option>
                    <option value="Plywood">Plywood Sheets</option>
                    <option value="Laminate">Decorative Laminate</option>
                    <option value="Adhesive">Fevicol / Adhesives</option>
                    <option value="Paint">Paint & Emulsions</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Quantity Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Sheets, Pairs, Boxes"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Current Qty in Stock</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Low Stock Alert Level</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value) || 5)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Warehouse Storage Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
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
                  Register Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Item Modal */}
      {stockModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-base font-serif font-bold text-stone-100">
                Add Stock: {selectedItem.name}
              </h3>
              <button onClick={() => setStockModalOpen(false)} className="text-stone-500 hover:text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStock} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">Restock Quantity ({selectedItem.unit})</label>
                <input
                  type="number"
                  required
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value) || 1)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition"
                >
                  Save Stock Quantity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
