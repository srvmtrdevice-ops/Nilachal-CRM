import { 
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, writeBatch, limit, getDoc, arrayUnion, onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  Customer, Project, PortfolioItem, Warranty, Payment, 
  ProjectUpdate, TeamMember, InventoryItem, DocumentRecord,
  CustomerRequirements, Estimate, ScheduleItem, SubcontractorPayment,
  Contractor, ContractorPayment
} from "../types";

// Dynamic Fallback Storage Wrapper
const useLocalStorageFallback = true; 

// Empty collections default (no dummy data)
const initialCustomers: Customer[] = [];
const initialProjects: Project[] = [];
const initialPortfolio: PortfolioItem[] = [];
const initialWarranties: Warranty[] = [];
const initialPayments: Payment[] = [];
const initialUpdates: ProjectUpdate[] = [];
const initialTeam: TeamMember[] = [];
const initialInventory: InventoryItem[] = [];
const initialRequirements: CustomerRequirements[] = [];
const initialSchedules: ScheduleItem[] = [];
const initialSubcontractorPayments: SubcontractorPayment[] = [];
const initialContractors: Contractor[] = [];
const initialContractorPayments: ContractorPayment[] = [];


// Helper to load localStorage with seeding fallback
function getLocalStorageItem<T>(key: string, defaultSeeding: T[]): T[] {
  const versionKey = "nilachal_dataset_version";
  const currentVersion = "1.0.0_cleared_all_v3";
  if (localStorage.getItem(versionKey) !== currentVersion) {
    // Clear old localStorage caches to wipe dummy data
    const collectionsToReset = [
      "customers", "projects", "portfolio", "warranties", "payments", 
      "updates", "team", "inventory", "customer_requirements", 
      "estimates", "documents", "schedules", "subcontractor_payments"
    ];
    collectionsToReset.forEach(col => {
      localStorage.removeItem(`nilachal_${col}`);
      try {
        getDocs(collection(db, col)).then(snap => {
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.docs.forEach(docSnap => batch.delete(docSnap.ref));
            batch.commit().catch(console.warn);
          }
        }).catch(console.warn);
      } catch (e) {
        console.warn("Error clearing Firestore docs for", col, e);
      }
    });
    localStorage.setItem(versionKey, currentVersion);
  }

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
  // Real-time listener subscription helper for multi-device synchronization
  subscribeToCollection: <T extends { id: string }>(
    collectionName: string,
    onData: (data: T[]) => void,
    defaultSeeding: T[]
  ) => {
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, async (snap) => {
      if (snap.empty && defaultSeeding.length > 0) {
        const localItems = getLocalStorageItem(collectionName, defaultSeeding);
        const itemsToSeed = localItems.length > 0 ? localItems : defaultSeeding;
        try {
          const batch = writeBatch(db);
          itemsToSeed.forEach((item) => {
            const itemDocRef = doc(db, collectionName, item.id);
            batch.set(itemDocRef, item);
          });
          await batch.commit();
        } catch (e) {
          console.warn(`Seeding ${collectionName} error:`, e);
        }
        onData(itemsToSeed);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
        saveLocalStorageItem(collectionName, items);
        onData(items);
      }
    }, (err) => {
      console.warn(`Realtime sub error for ${collectionName}:`, err);
      onData(getLocalStorageItem(collectionName, defaultSeeding));
    });
  },

  subscribeCustomers: (cb: (data: Customer[]) => void) => api.subscribeToCollection("customers", cb, initialCustomers),
  subscribeProjects: (cb: (data: Project[]) => void) => api.subscribeToCollection("projects", cb, initialProjects),
  subscribePortfolio: (cb: (data: PortfolioItem[]) => void) => api.subscribeToCollection("portfolio", cb, initialPortfolio),
  subscribeWarranties: (cb: (data: Warranty[]) => void) => api.subscribeToCollection("warranties", cb, initialWarranties),
  subscribePayments: (cb: (data: Payment[]) => void) => api.subscribeToCollection("payments", cb, initialPayments),
  subscribeUpdates: (cb: (data: ProjectUpdate[]) => void) => api.subscribeToCollection("updates", cb, initialUpdates),
  subscribeTeam: (cb: (data: TeamMember[]) => void) => api.subscribeToCollection("team", cb, initialTeam),
  subscribeInventory: (cb: (data: InventoryItem[]) => void) => api.subscribeToCollection("inventory", cb, initialInventory),
  subscribeDocuments: (cb: (data: DocumentRecord[]) => void) => api.subscribeToCollection("documents", cb, []),
  subscribeRequirements: (cb: (data: CustomerRequirements[]) => void) => api.subscribeToCollection("customer_requirements", cb, initialRequirements),
  subscribeEstimates: (cb: (data: Estimate[]) => void) => api.subscribeToCollection("estimates", cb, []),
  subscribeSchedules: (cb: (data: ScheduleItem[]) => void) => api.subscribeToCollection("schedules", cb, initialSchedules),
  subscribeSubcontractorPayments: (cb: (data: SubcontractorPayment[]) => void) => api.subscribeToCollection("subcontractor_payments", cb, initialSubcontractorPayments),
  subscribeContractors: (cb: (data: Contractor[]) => void) => api.subscribeToCollection("contractors", cb, initialContractors),
  subscribeContractorPayments: (cb: (data: ContractorPayment[]) => void) => api.subscribeToCollection("contractor_payments", cb, initialContractorPayments),

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
  deleteCustomer: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch {}
    const local = getLocalStorageItem("customers", initialCustomers);
    const filtered = local.filter(c => c.id !== id);
    saveLocalStorageItem("customers", filtered);
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
  deleteUpdate: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "updates", id));
    } catch {}
    const local = getLocalStorageItem("updates", initialUpdates);
    const filtered = local.filter(u => u.id !== id);
    saveLocalStorageItem("updates", filtered);
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

  updateTeamMember: async (id: string, member: Partial<TeamMember>): Promise<void> => {
    const local = getLocalStorageItem("team", initialTeam);
    const updated = local.map(m => m.id === id ? { ...m, ...member } : m);
    saveLocalStorageItem("team", updated);

    try {
      await updateDoc(doc(db, "team", id), member);
    } catch {}
  },
  deleteTeamMember: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "team", id));
    } catch {}
    const local = getLocalStorageItem("team", initialTeam);
    const filtered = local.filter(m => m.id !== id);
    saveLocalStorageItem("team", filtered);
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
  },

  // 13. SITE SCHEDULES
  getSchedules: async (): Promise<ScheduleItem[]> => {
    try {
      const q = query(collection(db, "schedules"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        return getLocalStorageItem("schedules", initialSchedules);
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ScheduleItem));
      saveLocalStorageItem("schedules", list);
      return list;
    } catch {
      return getLocalStorageItem("schedules", initialSchedules);
    }
  },
  addSchedule: async (sch: Omit<ScheduleItem, "id">): Promise<string> => {
    const id = `sch_${Date.now()}`;
    const payload = { ...sch };
    const local = getLocalStorageItem("schedules", initialSchedules);
    local.unshift({ id, ...payload });
    saveLocalStorageItem("schedules", local);

    try {
      const docRef = await addDoc(collection(db, "schedules"), payload);
      return docRef.id;
    } catch {
      return id;
    }
  },
  updateSchedule: async (id: string, sch: Partial<ScheduleItem>): Promise<void> => {
    const local = getLocalStorageItem("schedules", initialSchedules);
    const updated = local.map(s => s.id === id ? { ...s, ...sch } : s);
    saveLocalStorageItem("schedules", updated);

    try {
      await updateDoc(doc(db, "schedules", id), sch);
    } catch {}
  },
  deleteSchedule: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "schedules", id));
    } catch {}
    const local = getLocalStorageItem("schedules", initialSchedules);
    const filtered = local.filter(s => s.id !== id);
    saveLocalStorageItem("schedules", filtered);
  },

  // 14. SUBCONTRACTOR PAYMENTS & LEDGER
  getSubcontractorPayments: async (): Promise<SubcontractorPayment[]> => {
    try {
      const q = query(collection(db, "subcontractor_payments"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      if (snap.empty) {
        return getLocalStorageItem("subcontractor_payments", initialSubcontractorPayments);
      }
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubcontractorPayment));
      saveLocalStorageItem("subcontractor_payments", list);
      return list;
    } catch {
      return getLocalStorageItem("subcontractor_payments", initialSubcontractorPayments);
    }
  },
  addSubcontractorPayment: async (payment: Omit<SubcontractorPayment, "id" | "createdAt">): Promise<string> => {
    const local = getLocalStorageItem("subcontractor_payments", initialSubcontractorPayments);

    // Duplicate payment prevention check
    const trimmedRef = payment.referenceNo ? payment.referenceNo.trim().toLowerCase() : "";
    const isRefDuplicate = trimmedRef !== "" && local.some(p => 
      p.referenceNo && p.referenceNo.trim().toLowerCase() === trimmedRef
    );

    const isIdenticalDuplicate = local.some(p =>
      p.memberId === payment.memberId &&
      p.date === payment.date &&
      Number(p.amount) === Number(payment.amount) &&
      p.paymentType === payment.paymentType &&
      (p.projectName || "General Workshop").trim() === (payment.projectName || "General Workshop").trim()
    );

    if (isRefDuplicate || isIdenticalDuplicate) {
      console.warn("Prevented duplicate subcontractor payment creation in API service:", payment);
      const existing = local.find(p =>
        (trimmedRef !== "" && p.referenceNo && p.referenceNo.trim().toLowerCase() === trimmedRef) ||
        (p.memberId === payment.memberId && p.date === payment.date && Number(p.amount) === Number(payment.amount))
      );
      if (existing) return existing.id;
    }

    const id = `sp_${Date.now()}`;
    const payload = { 
      ...payment, 
      createdAt: new Date().toISOString() 
    };
    local.unshift({ id, ...payload });
    saveLocalStorageItem("subcontractor_payments", local);

    try {
      const docRef = await addDoc(collection(db, "subcontractor_payments"), payload);
      return docRef.id;
    } catch {
      return id;
    }
  },
  deleteSubcontractorPayment: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "subcontractor_payments", id));
    } catch {}
    const local = getLocalStorageItem("subcontractor_payments", initialSubcontractorPayments);
    const filtered = local.filter(p => p.id !== id);
    saveLocalStorageItem("subcontractor_payments", filtered);
  },

  // 15. CONTRACTORS MANAGEMENT
  getContractors: async (): Promise<Contractor[]> => {
    try {
      const snap = await getDocs(collection(db, "contractors"));
      if (snap.empty) {
        return getLocalStorageItem("contractors", initialContractors);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contractor));
    } catch {
      return getLocalStorageItem("contractors", initialContractors);
    }
  },
  addContractor: async (contractor: Omit<Contractor, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...contractor,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "contractors"), payload);
      const local = getLocalStorageItem("contractors", initialContractors);
      local.push({ id: docRef.id, ...payload });
      saveLocalStorageItem("contractors", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("contractors", initialContractors);
      const newId = `cnt_${Date.now()}`;
      local.push({ id: newId, ...payload });
      saveLocalStorageItem("contractors", local);
      return newId;
    }
  },
  updateContractor: async (id: string, updates: Partial<Contractor>): Promise<void> => {
    const timestamp = new Date().toISOString();
    try {
      await updateDoc(doc(db, "contractors", id), { ...updates, updatedAt: timestamp });
    } catch {}
    const local = getLocalStorageItem("contractors", initialContractors);
    const updated = local.map(c => c.id === id ? { ...c, ...updates, updatedAt: timestamp } : c);
    saveLocalStorageItem("contractors", updated);
  },
  deleteContractor: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "contractors", id));
    } catch {}
    const local = getLocalStorageItem("contractors", initialContractors);
    const filtered = local.filter(c => c.id !== id);
    saveLocalStorageItem("contractors", filtered);
  },

  // 16. CONTRACTOR PAYMENTS
  getContractorPayments: async (): Promise<ContractorPayment[]> => {
    try {
      const snap = await getDocs(collection(db, "contractor_payments"));
      if (snap.empty) {
        return getLocalStorageItem("contractor_payments", initialContractorPayments);
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContractorPayment));
    } catch {
      return getLocalStorageItem("contractor_payments", initialContractorPayments);
    }
  },
  addContractorPayment: async (payment: Omit<ContractorPayment, "id" | "createdAt">): Promise<string> => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...payment,
      createdAt: timestamp
    };
    try {
      const docRef = await addDoc(collection(db, "contractor_payments"), payload);
      const local = getLocalStorageItem("contractor_payments", initialContractorPayments);
      local.unshift({ id: docRef.id, ...payload });
      saveLocalStorageItem("contractor_payments", local);
      return docRef.id;
    } catch {
      const local = getLocalStorageItem("contractor_payments", initialContractorPayments);
      const newId = `cntp_${Date.now()}`;
      local.unshift({ id: newId, ...payload });
      saveLocalStorageItem("contractor_payments", local);
      return newId;
    }
  },
  deleteContractorPayment: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "contractor_payments", id));
    } catch {}
    const local = getLocalStorageItem("contractor_payments", initialContractorPayments);
    const filtered = local.filter(p => p.id !== id);
    saveLocalStorageItem("contractor_payments", filtered);
  },

  // 17. APP CONFIG & ACCOUNTS PASSCODE CLOUD SYNC
  getAccountsPasscode: async (): Promise<string> => {
    try {
      const snap = await getDoc(doc(db, "app_config", "general"));
      if (snap.exists() && snap.data().accountsPasscode) {
        return snap.data().accountsPasscode;
      }
    } catch {}
    return localStorage.getItem("nilachal_accounts_passcode") || "accounts1244";
  },
  saveAccountsPasscode: async (passcode: string): Promise<void> => {
    localStorage.setItem("nilachal_accounts_passcode", passcode);
    try {
      await setDoc(doc(db, "app_config", "general"), { accountsPasscode: passcode }, { merge: true });
    } catch (e) {
      console.warn("Error saving accounts passcode to Firestore:", e);
    }
  },
  subscribeAccountsPasscode: (cb: (passcode: string) => void) => {
    return onSnapshot(doc(db, "app_config", "general"), (snap) => {
      if (snap.exists() && snap.data().accountsPasscode) {
        const pass = snap.data().accountsPasscode;
        localStorage.setItem("nilachal_accounts_passcode", pass);
        cb(pass);
      } else {
        cb(localStorage.getItem("nilachal_accounts_passcode") || "accounts1244");
      }
    }, (err) => {
      cb(localStorage.getItem("nilachal_accounts_passcode") || "accounts1244");
    });
  },

  // 16. SYNC ALL DATA ACROSS ALL BROWSERS
  syncAllDataAcrossBrowsers: async (): Promise<void> => {
    const collectionsMap: { [key: string]: any[] } = {
      customers: initialCustomers,
      projects: initialProjects,
      portfolio: initialPortfolio,
      warranties: initialWarranties,
      payments: initialPayments,
      updates: initialUpdates,
      team: initialTeam,
      inventory: initialInventory,
      documents: [],
      customer_requirements: initialRequirements,
      estimates: [],
      schedules: initialSchedules,
      subcontractor_payments: initialSubcontractorPayments,
      contractors: initialContractors,
      contractor_payments: initialContractorPayments,
    };

    for (const [colName, defaultData] of Object.entries(collectionsMap)) {
      const localItems = getLocalStorageItem(colName, defaultData);
      if (localItems && localItems.length > 0) {
        try {
          const batch = writeBatch(db);
          localItems.forEach((item: any) => {
            if (item && item.id) {
              const itemRef = doc(db, colName, item.id);
              batch.set(itemRef, item, { merge: true });
            }
          });
          await batch.commit();
        } catch (e) {
          console.warn(`Sync batch error for ${colName}:`, e);
        }
      }
    }

    const localPasscode = localStorage.getItem("nilachal_accounts_passcode") || "accounts1244";
    try {
      await setDoc(doc(db, "app_config", "general"), { accountsPasscode: localPasscode }, { merge: true });
    } catch {}
  },

  // 17. EXPORT FULL APPLICATION STATE TO JSON BACKUP
  exportFullStateJSON: async (): Promise<void> => {
    try {
      const [
        customers, projects, customerRequirements, portfolio, warranties,
        payments, estimates, updates, team, inventory,
        documents, schedules, subcontractorPayments, accountsPasscode
      ] = await Promise.all([
        api.getCustomers(),
        api.getProjects(),
        api.getCustomerRequirements(),
        api.getPortfolio(),
        api.getWarranties(),
        api.getPayments(),
        api.getEstimates(),
        api.getUpdates(),
        api.getTeam(),
        api.getInventory(),
        api.getDocuments(),
        api.getSchedules(),
        api.getSubcontractorPayments(),
        api.getAccountsPasscode(),
      ]);

      const backupData = {
        metadata: {
          app: "Nilachal Creative Studio OS",
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
        },
        settings: {
          carpentryRate: Number(localStorage.getItem("nilachal_carpentry_rate")) || 1800,
          commercialRate: Number(localStorage.getItem("nilachal_commercial_rate")) || 3000,
          lowStockLimit: Number(localStorage.getItem("nilachal_low_stock_limit")) || 10,
          emailAlerts: localStorage.getItem("nilachal_email_alerts") !== "false",
          warrantyNotificationWeeks: Number(localStorage.getItem("nilachal_warranty_notification_weeks")) || 4,
          accountsPasscode,
        },
        orgDetails: JSON.parse(localStorage.getItem("nilachal_org_details") || "{}"),
        collections: {
          customers,
          projects,
          customerRequirements,
          portfolio,
          warranties,
          payments,
          estimates,
          updates,
          team,
          inventory,
          documents,
          schedules,
          subcontractorPayments,
        }
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().split("T")[0];
      const link = document.createElement("a");
      link.href = url;
      link.download = `nilachal_workspace_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export application state failed:", err);
      throw err;
    }
  }
};


