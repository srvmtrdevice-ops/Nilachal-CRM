import React, { useState } from "react";
import { Plus, Folder, File, Download, Search, Tag, X, UploadCloud, Eye, Trash2 } from "lucide-react";
import { DocumentRecord, Project, DocumentCategory } from "../types";

interface DocumentViewProps {
  documents: DocumentRecord[];
  projects: Project[];
  onAdd: (doc: Omit<DocumentRecord, "id" | "uploadedAt">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function DocumentView({ documents, projects, onAdd, onDelete }: DocumentViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("Ground Floor Electric Plan");
  const [category, setCategory] = useState<DocumentCategory>("Drawing");
  const [fileName, setFileName] = useState("NC_GF_Electric_Plan_V2.dwg");
  const [fileSize, setFileSize] = useState("4.2 MB");

  const categories: (DocumentCategory | "All")[] = [
    "All",
    "Quotation",
    "Drawing",
    "2D Plan",
    "3D Render",
    "Invoice",
    "Agreement",
    "Site Photo",
    "Completion Certificate"
  ];

  const handleOpenAdd = () => {
    if (projects.length === 0) {
      alert("Please configure a Project Brief first before uploading design blueprints or invoices!");
      return;
    }
    setProjectId(projects[0]?.id || "");
    setTitle("Ground Floor Layout");
    setCategory("Drawing");
    setFileName("Nilachal_GF_Design.pdf");
    setFileSize("2.8 MB");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title || !fileName) return;

    const proj = projects.find(p => p.id === projectId);
    const customerName = proj ? proj.customerName : "General client";

    try {
      await onAdd({
        projectId,
        customerName,
        title,
        category,
        fileUrl: "Simulated Document Link",
        fileName,
        fileSize
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Format file size
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      // Update title based on name
      const cleanName = file.name.split(".")[0].replace(/_/g, " ");
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || doc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-md">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-center w-full">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search drawings, quotations, client..."
              className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500/50 rounded-lg pl-9 pr-4 py-2 text-xs text-stone-200 placeholder-stone-500 outline-none transition"
            />
          </div>

          {/* Folder tabs selectors */}
          <div className="flex items-center gap-2 overflow-x-auto w-full py-1">
            <span className="text-xs text-stone-500 font-semibold uppercase shrink-0">Folders:</span>
            <div className="flex gap-1.5 overflow-x-auto">
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                    activeCategory === cat
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                      : "bg-stone-950 text-stone-400 border border-stone-850 hover:text-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition"
        >
          <Plus className="w-4 h-4" /> Upload Blueprints / Quotations
        </button>
      </div>

      {/* Folders & Documents Listing */}
      {filteredDocs.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-500 max-w-md mx-auto">
          No files listed. Drag & drop architectural plans.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className="bg-stone-900 border border-stone-800/80 rounded-xl p-4 hover:border-amber-500/20 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 bg-stone-950 border border-stone-850 rounded-lg text-amber-500 shrink-0">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-stone-200 text-xs truncate">{doc.title}</h4>
                  <p className="text-[10px] text-stone-500 truncate">{doc.customerName} • {doc.category}</p>
                  <span className="text-[9.5px] font-mono text-stone-400 block mt-0.5">{doc.fileName} ({doc.fileSize})</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                <button
                  onClick={() => alert(`Simulating document open: Opening ${doc.fileName} in interactive dwg/pdf CAD viewer!`)}
                  className="p-1.5 hover:bg-stone-850 text-stone-400 hover:text-amber-500 rounded transition"
                  title="Open blueprint"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alert(`Simulating file download: Downloading ${doc.fileName} to local system...`)}
                  className="p-1.5 hover:bg-stone-850 text-stone-400 hover:text-amber-500 rounded transition"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 hover:bg-stone-850 text-stone-400 hover:text-red-500 rounded transition"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload File Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-stone-800">
              <h3 className="text-lg font-serif font-bold text-stone-100">Upload Blueprint File</h3>
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

              {/* Simulated Drag & Drop Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-400">File Attachment *</label>
                <div className="relative border-2 border-dashed border-stone-800 hover:border-amber-500/35 bg-stone-950 p-6 rounded-xl text-center cursor-pointer transition">
                  <input
                    type="file"
                    onChange={handleSimulateFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.dwg,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <UploadCloud className="w-8 h-8 text-stone-500 mx-auto mb-2" />
                  <span className="block text-xs font-semibold text-stone-300">Click to choose or Drag files here</span>
                  <span className="block text-[10px] text-stone-500 mt-1">Supports PDF, DWG, PNG up to 15MB</span>
                </div>
              </div>

              {/* Show selected file info */}
              {fileName && (
                <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-850 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-stone-200 block truncate max-w-[200px]">{fileName}</span>
                    <span className="text-[10px] text-stone-500 font-mono mt-0.5">{fileSize}</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">Ready</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">Document Display Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-400">File Category Folder</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-200 outline-none cursor-pointer"
                  >
                    <option value="Quotation">Quotation</option>
                    <option value="Drawing">2D/3D Cad Drawing</option>
                    <option value="2D Plan">2D Floor Layout</option>
                    <option value="3D Render">Photorealistic 3D Render</option>
                    <option value="Invoice">Supplier / Client Invoice</option>
                    <option value="Agreement">Agreement / Contract</option>
                    <option value="Site Photo">Site Condition Photograph</option>
                    <option value="Completion Certificate">Completion Certificate</option>
                  </select>
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
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
