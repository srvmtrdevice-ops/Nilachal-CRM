import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth linked)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase UID
  email: text('email').notNull(),
  role: text('role').default('client').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// App configuration & key-value store
export const appConfig = pgTable('app_config', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customers
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').default('').notNull(),
  email: text('email').default('').notNull(),
  address: text('address').default('').notNull(),
  projectLocation: text('project_location').default('').notNull(),
  leadSource: text('lead_source').default('').notNull(),
  dateOfInquiry: text('date_of_inquiry').default('').notNull(),
  budget: integer('budget').default(0).notNull(),
  status: text('status').default('Lead').notNull(),
  notes: text('notes').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  roomTypes: jsonb('room_types').default([]).notNull(),
  stylePreference: text('style_preference').default('').notNull(),
  colorPreferences: text('color_preferences').default('').notNull(),
  materialPreferences: text('material_preferences').default('').notNull(),
  furnitureRequirements: text('furniture_requirements').default('').notNull(),
  falseCeiling: boolean('false_ceiling').default(false).notNull(),
  lighting: text('lighting').default('').notNull(),
  electricalRequirements: text('electrical_requirements').default('').notNull(),
  kitchenDetails: text('kitchen_details').default('').notNull(),
  wardrobeDetails: text('wardrobe_details').default('').notNull(),
  timelineWeeks: integer('timeline_weeks').default(4).notNull(),
  budget: integer('budget').default(0).notNull(),
  referenceImages: jsonb('reference_images').default([]).notNull(),
  siteMeasurements: jsonb('site_measurements').default([]).notNull(),
  designNotes: text('design_notes').default('').notNull(),
  qrCode: text('qr_code'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Portfolio
export const portfolio = pgTable('portfolio', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').default('').notNull(),
  location: text('location').default('').notNull(),
  areaSqFt: integer('area_sq_ft').default(0).notNull(),
  budgetRange: text('budget_range').default('').notNull(),
  completionDate: text('completion_date').default('').notNull(),
  category: text('category').default('Full Home Interior').notNull(),
  beforeImage: text('before_image').default('').notNull(),
  afterImage: text('after_image').default('').notNull(),
  galleryImages: jsonb('gallery_images').default([]).notNull(),
});

// Warranties
export const warranties = pgTable('warranties', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').default('').notNull(),
  productInstalled: text('product_installed').default('').notNull(),
  brand: text('brand').default('').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  warrantyCardUrl: text('warranty_card_url'),
  invoiceUrl: text('invoice_url'),
  serviceHistory: jsonb('service_history').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Documents
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  customerName: text('customer_name').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').notNull(),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Payments
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').default('').notNull(),
  amount: integer('amount').default(0).notNull(),
  type: text('type').default('Advance').notNull(),
  date: text('date').notNull(),
  status: text('status').default('Pending').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  notes: text('notes').default('').notNull(),
  paymentMode: text('payment_mode'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Estimates
export const estimates = pgTable('estimates', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').default('').notNull(),
  customerEmail: text('customer_email').default('').notNull(),
  customerAddress: text('customer_address').default('').notNull(),
  estimateNumber: text('estimate_number').notNull(),
  date: text('date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  items: jsonb('items').default([]).notNull(),
  subtotal: integer('subtotal').default(0).notNull(),
  discount: integer('discount').default(0).notNull(),
  gstRate: integer('gst_rate').default(18).notNull(),
  gstAmount: integer('gst_amount').default(0).notNull(),
  grandTotal: integer('grand_total').default(0).notNull(),
  notes: text('notes').default('').notNull(),
  status: text('status').default('Draft').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team
export const team = pgTable('team', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  phone: text('phone').default('').notNull(),
  email: text('email').default('').notNull(),
  assignedTasks: jsonb('assigned_tasks').default([]).notNull(),
  attendance: jsonb('attendance').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory
export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  quantity: integer('quantity').default(0).notNull(),
  unit: text('unit').default('Sheets').notNull(),
  minRequired: integer('min_required').default(5).notNull(),
  location: text('location').default('').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Schedules
export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  customerName: text('customer_name').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  purpose: text('purpose').default('').notNull(),
  assignedTo: text('assigned_to').default('').notNull(),
  status: text('status').default('Scheduled').notNull(),
});

// Customer Requirements
export const customerRequirements = pgTable('customer_requirements', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  modularKitchen: boolean('modular_kitchen').default(false).notNull(),
  wardrobe: boolean('wardrobe').default(false).notNull(),
  falseCeiling: boolean('false_ceiling').default(false).notNull(),
  tvUnit: boolean('tv_unit').default(false).notNull(),
  inverterBox: boolean('inverter_box').default(false).notNull(),
  shoeBox: boolean('shoe_box').default(false).notNull(),
  partition: boolean('partition').default(false).notNull(),
  doorPanelling: boolean('door_panelling').default(false).notNull(),
  chowkathPanelling: boolean('chowkath_panelling').default(false).notNull(),
  lockFitting: boolean('lock_fitting').default(false).notNull(),
  mainDoorPanelling: boolean('main_door_panelling').default(false).notNull(),
  customKitchenSpec: text('custom_kitchen_spec').default('').notNull(),
  customKitchenSqft: text('custom_kitchen_sqft').default(''),
  customWardrobeSpec: text('custom_wardrobe_spec').default('').notNull(),
  customWardrobeSqft: text('custom_wardrobe_sqft').default(''),
  customFurnitureSpec: text('custom_furniture_spec').default('').notNull(),
  customFurnitureSqft: text('custom_furniture_sqft').default(''),
  customCeilingSpec: text('custom_ceiling_spec').default('').notNull(),
  customCeilingSqft: text('custom_ceiling_sqft').default(''),
  dynamicCustomOrders: jsonb('dynamic_custom_orders').default([]).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subcontractor Payments
export const subcontractorPayments = pgTable('subcontractor_payments', {
  id: text('id').primaryKey(),
  memberId: text('member_id').notNull(),
  memberName: text('member_name').notNull(),
  date: text('date').notNull(),
  amount: integer('amount').default(0).notNull(),
  paymentType: text('payment_type').notNull(),
  projectName: text('project_name').default(''),
  paymentMode: text('payment_mode').default('Cash').notNull(),
  referenceNo: text('reference_no').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});
