export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type CustomerStatus = "Lead" | "Design" | "In Progress" | "Completed";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  projectLocation: string;
  leadSource: string;
  dateOfInquiry: string;
  budget: number;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementRow {
  room: string;
  length?: number; // in feet (optional)
  width?: number;  // in feet (optional)
  quantity: number;
  area: number;   // total area
  remarks: string;
}

export interface Project {
  id: string;
  customerId: string;
  customerName: string;
  roomTypes: string[]; // e.g. ["Kitchen", "Master Bedroom", "Living Room"]
  stylePreference: string; // e.g. Modern, Minimal, Luxury, Classical
  colorPreferences: string;
  materialPreferences: string;
  furnitureRequirements: string;
  falseCeiling: boolean;
  lighting: string;
  electricalRequirements: string;
  kitchenDetails: string;
  wardrobeDetails: string;
  timelineWeeks: number;
  budget: number;
  referenceImages: string[]; // Mock or uploaded image URLs
  siteMeasurements: MeasurementRow[]; // Interactive measurement sheets
  designNotes: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  location: string;
  areaSqFt: number;
  budgetRange: string;
  completionDate: string;
  category: "Modular Kitchen" | "Bedroom" | "Living Room" | "Office" | "Restaurant" | "Commercial" | "Full Home Interior";
  beforeImage: string;
  afterImage: string;
  galleryImages: string[];
}

export interface WarrantyServiceRecord {
  date: string;
  type: string; // e.g. Maintenance, Repair, Replacement
  description: string;
  cost: number;
  status: "Completed" | "Pending";
}

export interface Warranty {
  id: string;
  projectId: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  productInstalled: string;
  brand: string;
  startDate: string;
  endDate: string;
  warrantyCardUrl?: string; // or base64 / name
  invoiceUrl?: string;
  serviceHistory: WarrantyServiceRecord[];
  createdAt: string;
}

export type DocumentCategory = 
  | "Quotation" 
  | "Drawing" 
  | "2D Plan" 
  | "3D Render" 
  | "Invoice" 
  | "Agreement" 
  | "Site Photo" 
  | "Completion Certificate";

export interface DocumentRecord {
  id: string;
  projectId: string;
  customerName: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string; // simulated or base64
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  projectName: string;
  progressPercentage: number;
  statusText: string;
  workCompleted: string;
  photos: string[]; // Site photo urls or base64
  videoUrl?: string; // Video URL or base64 data
  videos?: string[]; // Array of video URLs
  date: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  projectName: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  type: "Estimate" | "Advance" | "Progressive" | "Final";
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  invoiceNumber: string;
  notes: string;
  paymentMode?: string;
  createdAt: string;
}

export interface EstimateItem {
  id: string;
  description: string;
  room: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Estimate {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  estimateNumber: string;
  date: string;
  expiryDate: string;
  items: EstimateItem[];
  subtotal: number;
  discount: number; // flat discount value
  gstRate: number; // percentage, e.g. 18
  gstAmount: number;
  grandTotal: number;
  notes: string;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

export interface TeamTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
}

export interface SubcontractorPayment {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  amount: number;
  paymentType: "Advance" | "Progress Payment" | "Final Settlement" | "Daily Wages" | "Material Reimbursement";
  projectName?: string;
  paymentMode: "Cash" | "Bank Transfer" | "UPI" | "Cheque";
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Carpenter" | "Electrician" | "Plumber" | "Painter" | "Supervisor" | "Designer";
  phone: string;
  email: string;
  assignedTasks: TeamTask[];
  attendance: string[]; // list of dates present, e.g. ["2026-06-27", "2026-06-26"]
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string; // e.g. Laminates, Plywood, Hardware, Paint, Adhesives
  quantity: number;
  unit: string; // e.g. Sheets, Boxes, Liters, Kgs
  minRequired: number; // For low stock alert
  location: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  projectId: string;
  projectName: string;
  customerName: string;
  title: string;
  date: string;
  time: string;
  purpose: string;
  assignedTo: string; // supervisor or designer
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface CustomerRequirements {
  id: string;
  customerId: string;
  customerName: string;
  // Checklist requirements
  modularKitchen: boolean;
  wardrobe: boolean;
  falseCeiling: boolean;
  tvUnit: boolean;
  inverterBox: boolean;
  shoeBox: boolean;
  partition: boolean;
  doorPanelling: boolean;
  chowkathPanelling: boolean;
  lockFitting: boolean;
  mainDoorPanelling: boolean;
  
  // Customised orders text boxes
  customKitchenSpec: string;
  customKitchenSqft?: string;
  customWardrobeSpec: string;
  customWardrobeSqft?: string;
  customFurnitureSpec: string;
  customFurnitureSqft?: string;
  customCeilingSpec: string;
  customCeilingSqft?: string;
  
  // Dynamic additional customized text boxes
  dynamicCustomOrders: { label: string; value: string }[];
  updatedAt: string;
}

export interface OrgDetails {
  name: string;
  hq: string;
  address: string;
  phone: string;
  email: string;
}

export function getOrgDetails(): OrgDetails {
  const saved = localStorage.getItem("nilachal_org_details");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    name: "Nilachal Creatives",
    hq: "Guwahati HQ",
    address: "Ulubari, Guwahati • Assam - 781007",
    phone: "+91 60036 01011",
    email: "nilachal.creatives@gmail.com"
  };
}


