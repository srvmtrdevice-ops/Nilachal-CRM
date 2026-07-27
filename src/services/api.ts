import { 
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, writeBatch, limit, getDoc, arrayUnion
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  Customer, Project, PortfolioItem, Warranty, Payment, 
  ProjectUpdate, TeamMember, InventoryItem, DocumentRecord,
  CustomerRequirements, Estimate
} from "../types";

// Dynamic Fallback Storage Wrapper
const useLocalStorageFallback = true; 

// Initial Mock Data to seed the application beautifully!
const initialCustomers: Customer[] = [
  {
    id: "cust_1",
    name: "Dr. Alok Mohapatra",
    phone: "+91 94370 12345",
    email: "alok.mohapatra@gmail.com",
    address: "Plot 422, Forest Park",
    projectLocation: "Forest Park, Bhubaneswar",
    leadSource: "Instagram Profile",
    dateOfInquiry: "2026-04-10",
    budget: 1200000,
    status: "In Progress",
    notes: "Client expects a warm minimalist design with walnut finishes.",
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-04-12T15:30:00Z"
  },
  {
    id: "cust_2",
    name: "Sarmistha Dash",
    phone: "+91 98610 67890",
    email: "sarmistha.dash@outlook.com",
    address: "Duplex 12, DN Regalia Enclave",
    projectLocation: "Patia, Bhubaneswar",
    leadSource: "Referral By Architect",
    dateOfInquiry: "2026-05-01",
    budget: 850000,
    status: "Design",
    notes: "Requires standard modular kitchen and 3 wardrobes.",
    createdAt: "2026-05-01T11:00:00Z",
    updatedAt: "2026-05-01T11:00:00Z"
  }
];

const initialProjects: Project[] = [
  {
    id: "proj_1",
    customerId: "cust_1",
    customerName: "Dr. Alok Mohapatra",
    roomTypes: ["Living Room", "Modular Kitchen", "Master Bedroom"],
    stylePreference: "Minimal",
    colorPreferences: "Warm beige, sage green accents, walnut wood veneer",
    materialPreferences: "18mm BWP Plywood, Century MDF, Merino high gloss laminate",
    furnitureRequirements: "L-shape sofa, console table, customized study table",
    falseCeiling: true,
    lighting: "Magnetic track profile lights, warm 3000k cob spotlights",
    electricalRequirements: "Two additional 16A points for microoven and baking deck",
    kitchenDetails: "G-profile handles, Hafele tandem boxes, quartz countertop",
    wardrobeDetails: "Lacquer glass sliding wardrobe with sensor-activated strip profiles",
    timelineWeeks: 8,
    budget: 1200000,
    referenceImages: [],
    siteMeasurements: [
      { room: "Kitchen Area", length: 12, width: 8.5, quantity: 1, area: 102, remarks: "Water point corner check" },
      { room: "Living Console", length: 15, width: 1.5, quantity: 1, area: 22.5, remarks: "Electrical casing alignment" }
    ],
    designNotes: "Keep the kitchen counters clear and incorporate integrated profile handles.",
    qrCode: "",
    createdAt: "2026-04-12T15:30:00Z",
    updatedAt: "2026-05-12T15:30:00Z"
  }
];

const initialPortfolio: PortfolioItem[] = [
  {
    id: "port_1",
    title: "Luxurious Oak Modular Kitchen",
    description: "Features anti-scratch matte charcoal shutters, automated touch-to-open overhead cabinets, and integrated premium Hafele hardware.",
    location: "Trishulia, Cuttack",
    areaSqFt: 180,
    budgetRange: "₹4.5 - 6 Lakhs",
    completionDate: "2026-03-15",
    category: "Modular Kitchen",
    beforeImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    galleryImages: []
  },
  {
    id: "port_2",
    title: "Minimalist Scandinavian Living Lounge",
    description: "Designed utilizing custom walnut veneers, hidden cable routing, and a custom slatted wood acoustic panel backdrop.",
    location: "Jaydev Vihar, Bhubaneswar",
    areaSqFt: 320,
    budgetRange: "₹6 - 8 Lakhs",
    completionDate: "2026-04-20",
    category: "Living Room",
    beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
    afterImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800",
    galleryImages: []
  }
];

const initialWarranties: Warranty[] = [
  {
    id: "warr_1",
    projectId: "proj_1",
    projectName: "Dr. Alok Mohapatra Residence",
    customerName: "Dr. Alok Mohapatra",
    customerEmail: "alok.mohapatra@gmail.com",
    productInstalled: "Hafele Hydraulic Lift Pump Cylinders",
    brand: "Hafele",
    startDate: "2026-05-15",
    endDate: "2031-05-15",
    warrantyCardUrl: "NC_WARR_HAFELE_4412.pdf",
    invoiceUrl: "INV_HAFELE_4412.pdf",
    serviceHistory: [
      { date: "2026-05-16", type: "Inspection", description: "Checked post-installation alignment", cost: 0, status: "Completed" }
    ],
    createdAt: "2026-05-15T12:00:00Z"
  }
];

const initialPayments: Payment[] = [
  {
    id: "pay_1",
    projectId: "proj_1",
    projectName: "Dr. Alok Mohapatra Site",
    customerName: "Dr. Alok Mohapatra",
    customerEmail: "alok.mohapatra@gmail.com",
    amount: 400000,
    type: "Advance",
    date: "2026-04-12",
    status: "Paid",
    invoiceNumber: "NC-2026-1044",
    notes: "Initial advance for plywood procurement.",
    createdAt: "2026-04-12T15:30:00Z"
  },
  {
    id: "pay_2",
    projectId: "proj_1",
    projectName: "Dr. Alok Mohapatra Site",
    customerName: "Dr. Alok Mohapatra",
    customerEmail: "alok.mohapatra@gmail.com",
    amount: 350000,
    type: "Progressive",
    date: "2026-05-25",
    status: "Pending",
    invoiceNumber: "NC-2026-1092",
    notes: "Milestone payment for modular carcass assembling.",
    createdAt: "2026-05-25T11:00:00Z"
  }
];

const initialUpdates: ProjectUpdate[] = [
  {
    id: "upd_1",
    projectId: "proj_1",
    projectName: "Dr. Alok Mohapatra Site",
    progressPercentage: 40,
    statusText: "Carpentry Framework Assembling",
    workCompleted: "Plywood cutting finished. Core modular kitchen cabinets successfully assembled and leveled.",
    photos: ["https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=400"],
    date: "2026-05-12",
    createdAt: "2026-05-12T18:00:00Z"
  },
  {
    id: "upd_2",
    projectId: "proj_1",
    projectName: "Dr. Alok Mohapatra Site",
    progressPercentage: 55,
    statusText: "Laminate pasting and drawer channels",
    workCompleted: "Anti-scratch laminates successfully hot-pressed to cabinet shutters. Assembled 6 drawer runner sets.",
    photos: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=400"],
    date: "2026-05-26",
    createdAt: "2026-05-26T18:00:00Z"
  }
];

const initialTeam: TeamMember[] = [
  {
    id: "team_1",
    name: "Sanjay Kumar Swain",
    role: "Carpenter",
    phone: "+91 94371 44556",
    email: "sanjay.swain@nilachal.com",
    assignedTasks: [
      { id: "task_1", title: "Mount kitchen soft-close hinges", projectId: "proj_1", projectName: "Alok Mohapatra Site", dueDate: "2026-06-02", status: "Pending" }
    ],
    attendance: ["2026-06-01", "2026-06-02"],
    createdAt: "2026-05-01T10:00:00Z"
  },
  {
    id: "team_2",
    name: "Pradip Jena",
    role: "Painter",
    phone: "+91 98533 11223",
    email: "pradip.jena@nilachal.com",
    assignedTasks: [],
    attendance: ["2026-06-01"],
    createdAt: "2026-05-02T10:00:00Z"
  }
];

const initialInventory: InventoryItem[] = [
  {
    id: "inv_1",
    name: "CenturyPly 18mm Club Prime BWP",
    category: "Plywood",
    quantity: 45,
    unit: "Sheets",
    minRequired: 15,
    location: "Patia Warehouse",
    updatedAt: "2026-06-25T10:00:00Z"
  },
  {
    id: "inv_2",
    name: "Ebco Soft-Close Auto Hinges (110°)",
    category: "Hardware Fittings",
    quantity: 120,
    unit: "Pairs",
    minRequired: 30,
    location: "Patia Warehouse",
    updatedAt: "2026-06-25T10:00:00Z"
  },
  {
    id: "inv_3",
    name: "Fevicol SH Architectural Adhesive",
    category: "Adhesive",
    quantity: 8,
    unit: "Buckets (10kg)",
    minRequired: 10,
    location: "Patia Warehouse",
    updatedAt: "2026-06-25T10:00:00Z"
  }
];

const initialRequirements: CustomerRequirements[] = [
  {
    id: "req_1",
    customerId: "cust_1",
    customerName: "Dr. Alok Mohapatra",
    modularKitchen: true,
    wardrobe: true,
    falseCeiling: true,
    tvUnit: true,
    inverterBox: false,
    shoeBox: true,
    partition: true,
    doorPanelling: false,
    chowkathPanelling: false,
    lockFitting: true,
    mainDoorPanelling: true,
    customKitchenSpec: "Premium high gloss white acrylic panels with seamless Hafele Blum tandem drawers.",
    customKitchenSqft: "120",
    customWardrobeSpec: "Full height walnut wood veneer sliding wardrobe with automated interior LED tracks.",
    customWardrobeSqft: "180",
    customFurnitureSpec: "L-shaped ergonomic lounge sofa in customized micro-suede fabric.",
    customFurnitureSqft: "45",
    customCeilingSpec: "Modern shadow-gap plaster board false ceiling with integrated magnetic profile rails.",
    customCeilingSqft: "350",
    dynamicCustomOrders: [
      { label: "Pooja Mandir CNC Panel", value: "Custom teak wood CNC lattice partition screen with backlighting." }
    ],
    updatedAt: "2026-06-27T10:35:00Z"
  },
  {
    id: "req_2",
    customerId: "cust_2",
    customerName: "Sarmistha Dash",
    modularKitchen: true,
    wardrobe: true,
    falseCeiling: false,
    tvUnit: true,
    inverterBox: true,
    shoeBox: false,
    partition: false,
    doorPanelling: false,
    chowkathPanelling: false,
    lockFitting: false,
    mainDoorPanelling: false,
    customKitchenSpec: "Modern matte anti-fingerprint laminate modular kitchen with profile handle-less drawers.",
    customKitchenSqft: "95",
    customWardrobeSpec: "Dual swing-door wardrobes in premium wood-grain laminates.",
    customWardrobeSqft: "120",
    customFurnitureSpec: "",
    customFurnitureSqft: "",
    customCeilingSpec: "",
    customCeilingSqft: "",
    dynamicCustomOrders: [
      { label: "Living Entry Shoe Storage console", value: "Slim design wall-mounted entry console box." }
    ],
    updatedAt: "2026-06-27T10:35:00Z"
  }
];


// Helper to load localStorage with seeding fallback
function getLocalStorageItem<T>(key: string, defaultSeeding: T[]): T[] {
  const localVal = localStorage.getItem(`nilachal_${key}`);
  if (!localVal) {
    localStorage.setItem(`nilachal_${key}`, JSON.stringify(defaultSeeding));
    return defaultSeeding;
  }
  return JSON.parse(localVal);
}

// Helper to save localStorage
function saveLocalStorageItem<T>(key: string, data: T[]) {
  localStorage.setItem(`nilachal_${key}`, JSON.stringify(data));
}

// API Service exports wrapping database fetch
export const api = {
  // 1. CUSTOMERS
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const snap = await getDocs(collection(db, "customers"));
      if (snap.empty) {
        return getLocalStorageItem("customers", initialCustomers);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    } catch {
      return getLocalStorageItem("customers", initialCustomers);
    }
  },
  addCustomer: async (customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...customer,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "customers"), payload);
      const local = getLocalStorageItem("customers", initialCustomers);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("customers", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("customers", initialCustomers);
      const newId = `cust_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("customers", local);
      return newId;
    }
  },
  updateCustomer: async (id: string, updates: Partial<Customer>): Promise<void> => {
    const timestamp = new Date().toISOString();
    try {
      await updateDoc(doc(db, "customers", id), { ...updates, updatedAt: timestamp });
    } catch {}
    const local = getLocalStorageItem("customers", initialCustomers);
    const updated = local.map(c => c.id === id ? { ...c, ...updates, updatedAt: timestamp } : c);
    saveLocalStorageItem("customers", updated);
  },

  // 2. PROJECTS
  getProjects: async (): Promise<Project[]> => {
    try {
      const snap = await getDocs(collection(db, "projects"));
      if (snap.empty) {
        return getLocalStorageItem("projects", initialProjects);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    } catch {
      return getLocalStorageItem("projects", initialProjects);
    }
  },
  addProject: async (project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...project,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "projects"), payload);
      const local = getLocalStorageItem("projects", initialProjects);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("projects", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("projects", initialProjects);
      const newId = `proj_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("projects", local);
      return newId;
    }
  },
  updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
    const timestamp = new Date().toISOString();
    try {
      await updateDoc(doc(db, "projects", id), {
        ...updates,
        updatedAt: timestamp
      });
    } catch {}
    const local = getLocalStorageItem("projects", initialProjects);
    const updated = local.map(p => p.id === id ? { ...p, ...updates, updatedAt: timestamp } : p);
    saveLocalStorageItem("projects", updated);
  },
  deleteProject: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "projects", id));
    } catch {}
    const local = getLocalStorageItem("projects", initialProjects);
    const filtered = local.filter(p => p.id !== id);
    saveLocalStorageItem("projects", filtered);
  },

  // 3. PORTFOLIO
  getPortfolio: async (): Promise<PortfolioItem[]> => {
    try {
      const snap = await getDocs(collection(db, "portfolio"));
      if (snap.empty) {
        return getLocalStorageItem("portfolio", initialPortfolio);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem));
    } catch {
      return getLocalStorageItem("portfolio", initialPortfolio);
    }
  },
  addPortfolio: async (item: Omit<PortfolioItem, "id">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "portfolio"), item);
      const local = getLocalStorageItem("portfolio", initialPortfolio);
      local.push({ id: docRef.id, ...item });
      saveLocalStorageItem("portfolio", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("portfolio", initialPortfolio);
      const newId = `port_${Date.now()}`;
      local.push({ id: newId, ...item });
      saveLocalStorageItem("portfolio", local);
      return newId;
    }
  },
  deletePortfolio: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "portfolio", id));
    } catch {}
    const local = getLocalStorageItem("portfolio", initialPortfolio);
    const filtered = local.filter(p => p.id !== id);
    saveLocalStorageItem("portfolio", filtered);
  },

  // 4. WARRANTIES
  getWarranties: async (): Promise<Warranty[]> => {
    try {
      const snap = await getDocs(collection(db, "warranties"));
      if (snap.empty) {
        return getLocalStorageItem("warranties", initialWarranties);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Warranty));
    } catch {
      return getLocalStorageItem("warranties", initialWarranties);
    }
  },
  addWarranty: async (warranty: Omit<Warranty, "id" | "createdAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...warranty,
      createdAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "warranties"), payload);
      const local = getLocalStorageItem("warranties", initialWarranties);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("warranties", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("warranties", initialWarranties);
      const newId = `warr_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("warranties", local);
      return newId;
    }
  },
  addWarrantyServiceRecord: async (warrantyId: string, service: any): Promise<void> => {
    try {
      await updateDoc(doc(db, "warranties", warrantyId), {
        serviceHistory: arrayUnion(service)
      });
    } catch {}
    const local = getLocalStorageItem("warranties", initialWarranties);
    const updated = local.map(w => {
      if (w.id === warrantyId) {
        return {
          ...w,
          serviceHistory: [...(w.serviceHistory || []), service]
        };
      }
      return w;
    });
    saveLocalStorageItem("warranties", updated);
  },

  // 5. PAYMENTS
  getPayments: async (): Promise<Payment[]> => {
    try {
      const snap = await getDocs(collection(db, "payments"));
      if (snap.empty) {
        return getLocalStorageItem("payments", initialPayments);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
    } catch {
      return getLocalStorageItem("payments", initialPayments);
    }
  },
  addPayment: async (payment: Omit<Payment, "id" | "createdAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...payment,
      createdAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "payments"), payload);
      const local = getLocalStorageItem("payments", initialPayments);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("payments", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("payments", initialPayments);
      const newId = `pay_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("payments", local);
      return newId;
    }
  },
  markPaymentPaid: async (id: string): Promise<void> => {
    try {
      await updateDoc(doc(db, "payments", id), { status: "Paid" });
    } catch {}
    const local = getLocalStorageItem("payments", initialPayments);
    const updated = local.map(p => p.id === id ? { ...p, status: "Paid" as const } : p);
    saveLocalStorageItem("payments", updated);
  },
  deletePayment: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "payments", id));
    } catch {}
    const local = getLocalStorageItem("payments", initialPayments);
    const filtered = local.filter(p => p.id !== id);
    saveLocalStorageItem("payments", filtered);
  },

  // 6. DAILY UPDATES
  getUpdates: async (): Promise<ProjectUpdate[]> => {
    try {
      const snap = await getDocs(collection(db, "updates"));
      if (snap.empty) {
        return getLocalStorageItem("updates", initialUpdates);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectUpdate));
    } catch {
      return getLocalStorageItem("updates", initialUpdates);
    }
  },
  addUpdate: async (update: Omit<ProjectUpdate, "id" | "createdAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...update,
      createdAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "updates"), payload);
      const local = getLocalStorageItem("updates", initialUpdates);
      local.unshift({ id: docRef.id, ...payload });
      saveLocalStorageItem("updates", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("updates", initialUpdates);
      const newId = `upd_${Date.now()}`;
      local.unshift({ id: newId, ...payload });
      saveLocalStorageItem("updates", local);
      return newId;
    }
  },

  // 7. TEAM MEMBERS
  getTeam: async (): Promise<TeamMember[]> => {
    try {
      const snap = await getDocs(collection(db, "team"));
      if (snap.empty) {
        return getLocalStorageItem("team", initialTeam);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamMember));
    } catch {
      return getLocalStorageItem("team", initialTeam);
    }
  },
  addTeamMember: async (member: Omit<TeamMember, "id" | "createdAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...member,
      createdAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "team"), payload);
      const local = getLocalStorageItem("team", initialTeam);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("team", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("team", initialTeam);
      const newId = `team_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("team", local);
      return newId;
    }
  },
  addTaskToMember: async (memberId: string, task: any): Promise<void> => {
    try {
      await updateDoc(doc(db, "team", memberId), {
        assignedTasks: arrayUnion(task)
      });
    } catch {}
    const local = getLocalStorageItem("team", initialTeam);
    const updated = local.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          assignedTasks: [...(m.assignedTasks || []), task]
        };
      }
      return m;
    });
    saveLocalStorageItem("team", updated);
  },
  toggleAttendance: async (memberId: string, date: string): Promise<void> => {
    const local = getLocalStorageItem("team", initialTeam);
    const updated = local.map(m => {
      if (m.id === memberId) {
        const index = m.attendance.indexOf(date);
        let newAttendance = [...m.attendance];
        if (index > -1) {
          newAttendance.splice(index, 1);
        } else {
          newAttendance.push(date);
        }
        return { ...m, attendance: newAttendance };
      }
      return m;
    });
    saveLocalStorageItem("team", updated);
    
    // Attempt Firestore update
    try {
      const target = updated.find(m => m.id === memberId);
      if (target) {
        await updateDoc(doc(db, "team", memberId), {
          attendance: target.attendance
        });
      }
    } catch {}
  },

  // 8. MATERIALS INVENTORY
  getInventory: async (): Promise<InventoryItem[]> => {
    try {
      const snap = await getDocs(collection(db, "inventory"));
      if (snap.empty) {
        return getLocalStorageItem("inventory", initialInventory);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem));
    } catch {
      return getLocalStorageItem("inventory", initialInventory);
    }
  },
  addInventoryItem: async (item: Omit<InventoryItem, "id" | "updatedAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...item,
      updatedAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "inventory"), payload);
      const local = getLocalStorageItem("inventory", initialInventory);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("inventory", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("inventory", initialInventory);
      const newId = `inv_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("inventory", local);
      return newId;
    }
  },
  addStockQuantity: async (id: string, qty: number): Promise<void> => {
    const timestamp = new Date().toISOString();
    const local = getLocalStorageItem("inventory", initialInventory);
    const updated = local.map(i => {
      if (i.id === id) {
        return {
          ...i,
          quantity: Math.max(0, i.quantity + qty),
          updatedAt: timestamp
        };
      }
      return i;
    });
    saveLocalStorageItem("inventory", updated);

    try {
      const target = updated.find(i => i.id === id);
      if (target) {
        await updateDoc(doc(db, "inventory", id), {
          quantity: target.quantity,
          updatedAt: timestamp
        });
      }
    } catch {}
  },

  // 9. DOCUMENTS
  getDocuments: async (): Promise<DocumentRecord[]> => {
    return getLocalStorageItem("documents", []);
  },
  addDocument: async (docRecord: Omit<DocumentRecord, "id" | "uploadedAt">): Promise<string> => {
    const local = getLocalStorageItem("documents", []);
    const newId = `doc_${Date.now()}`;
    const payload = {
      id: newId,
      uploadedAt: new Date().toISOString(),
      ...docRecord
    };
    local.push(payload);
    saveLocalStorageItem("documents", local);
    return newId;
  },
  deleteDocument: async (id: string): Promise<void> => {
    const local = getLocalStorageItem("documents", []);
    const filtered = local.filter(d => d.id !== id);
    saveLocalStorageItem("documents", filtered);
  },

  // 10. CLIENT REQUIREMENTS
  getCustomerRequirements: async (): Promise<CustomerRequirements[]> => {
    try {
      const snap = await getDocs(collection(db, "customer_requirements"));
      if (snap.empty) {
        return getLocalStorageItem("customer_requirements", initialRequirements);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerRequirements));
    } catch {
      return getLocalStorageItem("customer_requirements", initialRequirements);
    }
  },
  saveCustomerRequirements: async (reqRecord: Omit<CustomerRequirements, "id" | "updatedAt"> & { id?: string }): Promise<string> => {
    const timestamp = new Date().toISOString();
    const id = reqRecord.id || `req_${Date.now()}`;
    const payload = {
      customerId: reqRecord.customerId,
      customerName: reqRecord.customerName,
      modularKitchen: reqRecord.modularKitchen,
      wardrobe: reqRecord.wardrobe,
      falseCeiling: reqRecord.falseCeiling,
      tvUnit: reqRecord.tvUnit,
      inverterBox: reqRecord.inverterBox,
      shoeBox: reqRecord.shoeBox,
      partition: reqRecord.partition,
      doorPanelling: reqRecord.doorPanelling,
      chowkathPanelling: reqRecord.chowkathPanelling,
      lockFitting: reqRecord.lockFitting,
      mainDoorPanelling: reqRecord.mainDoorPanelling,
      customKitchenSpec: reqRecord.customKitchenSpec,
      customKitchenSqft: reqRecord.customKitchenSqft || "",
      customWardrobeSpec: reqRecord.customWardrobeSpec,
      customWardrobeSqft: reqRecord.customWardrobeSqft || "",
      customFurnitureSpec: reqRecord.customFurnitureSpec,
      customFurnitureSqft: reqRecord.customFurnitureSqft || "",
      customCeilingSpec: reqRecord.customCeilingSpec,
      customCeilingSqft: reqRecord.customCeilingSqft || "",
      dynamicCustomOrders: reqRecord.dynamicCustomOrders,
      updatedAt: timestamp
    };

    const local = getLocalStorageItem("customer_requirements", initialRequirements);
    const existingIndex = local.findIndex(r => r.customerId === reqRecord.customerId);
    
    let activeId = id;
    if (existingIndex > -1) {
      activeId = local[existingIndex].id;
      local[existingIndex] = { id: activeId, ...payload };
    } else {
      local.push({ id, ...payload });
    }
    saveLocalStorageItem("customer_requirements", local);

    try {
      const qSnap = await getDocs(query(collection(db, "customer_requirements"), where("customerId", "==", reqRecord.customerId)));
      if (!qSnap.empty) {
        const docId = qSnap.docs[0].id;
        await updateDoc(doc(db, "customer_requirements", docId), payload);
        return docId;
      } else {
        const docRef = await addDoc(collection(db, "customer_requirements"), payload);
        return docRef.id;
      }
    } catch {
      return activeId;
    }
  },

  // 12. ESTIMATES
  getEstimates: async (): Promise<Estimate[]> => {
    try {
      const q = query(collection(db, "estimates"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Estimate));
      saveLocalStorageItem("estimates", list);
      return list;
    } catch {
      return getLocalStorageItem("estimates", []);
    }
  },
  addEstimate: async (est: Omit<Estimate, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const id = `est_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const payload = {
      ...est,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const local = getLocalStorageItem("estimates", [] as Estimate[]);
    local.unshift({ id, ...payload });
    saveLocalStorageItem("estimates", local);

    try {
      const docRef = await addDoc(collection(db, "estimates"), payload);
      return docRef.id;
    } catch {
      return id;
    }
  },
  updateEstimate: async (id: string, est: Partial<Estimate>): Promise<void> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...est,
      updatedAt: timestamp
    };
    const local = getLocalStorageItem("estimates", [] as Estimate[]);
    const updated = local.map(e => e.id === id ? { ...e, ...payload } : e);
    saveLocalStorageItem("estimates", updated);

    try {
      await updateDoc(doc(db, "estimates", id), payload);
    } catch {}
  },
  deleteEstimate: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "estimates", id));
    } catch {}
    const local = getLocalStorageItem("estimates", [] as Estimate[]);
    const filtered = local.filter(e => e.id !== id);
    saveLocalStorageItem("estimates", filtered);
  }
};
