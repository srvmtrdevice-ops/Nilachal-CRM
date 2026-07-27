import React, { useState } from "react";
import { Plus, Trash2, Save, Ruler, CheckCircle } from "lucide-react";
import { MeasurementRow } from "../types";

interface MeasurementSheetProps {
  initialMeasurements?: MeasurementRow[];
  onSave: (measurements: MeasurementRow[]) => void;
}

export default function MeasurementSheet({ initialMeasurements, onSave }: MeasurementSheetProps) {
  const defaultRow = (): MeasurementRow => ({
    room: "Living Room",
    quantity: 1,
    area: 120,
    remarks: ""
  });

  const [rows, setRows] = useState<MeasurementRow[]>(
    initialMeasurements && initialMeasurements.length > 0 
      ? initialMeasurements 
      : [defaultRow()]
  );
  const [saved, setSaved] = useState(false);

  const handleAddRow = () => {
    setRows([...rows, defaultRow()]);
    setSaved(false);
  };

  const handleDeleteRow = (index: number) => {
    if (rows.length === 1) {
      setRows([defaultRow()]);
    } else {
      setRows(rows.filter((_, i) => i !== index));
    }
    setSaved(false);
  };

  const handleUpdateField = (index: number, field: keyof MeasurementRow, value: string | number) => {
    const updatedRows = [...rows];
    const row = { ...updatedRows[index] };

    if (field === "room" || field === "remarks") {
      row[field] = value as string;
    } else {
      const numValue = Number(value) || 0;
      row[field] = numValue as never; // Hack to satisfy TS with checked types
    }

    updatedRows[index] = row;
    setRows(updatedRows);
    setSaved(false);
  };

  const calculateTotalArea = () => {
    return rows.reduce((total, r) => total + r.area, 0);
  };

  const handleSave = () => {
    onSave(rows);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-serif font-semibold text-stone-100">Digital Measurement Sheet</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddRow}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Space
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              saved 
                ? "bg-green-600 text-white" 
                : "bg-amber-500 hover:bg-amber-600 text-stone-950"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Sheet
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-800 bg-stone-950">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-900 text-stone-400 font-semibold uppercase tracking-wider border-b border-stone-800">
              <th className="py-3 px-4">Room/Space</th>
              <th className="py-3 px-3 w-20 text-center">Qty</th>
              <th className="py-3 px-3 w-32 text-right">Total Area (sq. ft)</th>
              <th className="py-3 px-4">Specific Design Remarks / Wall Details</th>
              <th className="py-3 px-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-900">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-stone-900/40 transition-colors">
                <td className="py-2.5 px-4">
                  <input
                    type="text"
                    value={row.room}
                    onChange={(e) => handleUpdateField(idx, "room", e.target.value)}
                    placeholder="e.g. Master Bedroom"
                    className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/50 rounded px-2.5 py-1.5 text-stone-200 outline-none"
                  />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.quantity}
                    onChange={(e) => handleUpdateField(idx, "quantity", e.target.value)}
                    className="w-full text-center bg-stone-900 border border-stone-800 focus:border-amber-500/50 rounded px-1.5 py-1.5 text-stone-200 outline-none font-mono"
                  />
                </td>
                <td className="py-2.5 px-3 text-right">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={row.area || ""}
                    onChange={(e) => handleUpdateField(idx, "area", e.target.value)}
                    className="w-full text-right bg-stone-900 border border-stone-800 focus:border-amber-500/50 rounded px-2.5 py-1.5 text-stone-200 font-mono outline-none text-amber-500 font-bold"
                  />
                </td>
                <td className="py-2.5 px-4">
                  <input
                    type="text"
                    value={row.remarks}
                    onChange={(e) => handleUpdateField(idx, "remarks", e.target.value)}
                    placeholder="e.g. L-shape window cut, 10 sockets req"
                    className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/50 rounded px-2.5 py-1.5 text-stone-300 outline-none"
                  />
                </td>
                <td className="py-2.5 px-3 text-center">
                  <button
                    onClick={() => handleDeleteRow(idx)}
                    className="p-1 text-stone-500 hover:text-red-500 rounded transition-colors"
                    title="Delete row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-stone-950 p-3.5 rounded-lg border border-stone-800">
        <span className="text-xs text-stone-400">
          Total measured zones: <strong className="text-stone-200">{rows.length} rooms</strong>
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-stone-400 text-xs font-semibold">Total Carpet Area:</span>
          <span className="text-lg font-serif font-bold text-amber-500 font-mono">
            {calculateTotalArea().toFixed(1)} sq. ft.
          </span>
        </div>
      </div>
    </div>
  );
}
