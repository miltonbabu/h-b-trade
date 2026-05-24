// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  role: 'customer';
  created_at: string;
  updated_at?: string;
}

export interface CustomerSignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
}

// Product Request types
export interface ProductRequest {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  product_name: string;
  product_link?: string;
  target_price?: string;
  quantity?: string;
  packaging_type?: string;
  pack_quantity?: string;
  master_pack_quantity?: string;
  pack_dimensions?: string;
  weight_per_pack?: string;
  sample_needed?: string;
  shipping_method?: string;
  specifications?: string;
  message?: string;
  image?: string;
  tracking_number?: string;
  status: string;
  converted_to_order?: string;
  customer_id?: string;
  created_at: string;
}

// Order types
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  quantity?: string;
  shipping_method?: string;
  price?: number;
  net_weight?: string;
  status: string;
  tracking_number?: string;
  customer_info?: string;
  items_info?: string;
  product_codes?: string;
  product_link?: string;
  notes?: string;
  payment_info?: string;
  estimated_delivery?: string;
  customer_id?: string;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

// Tracking types
export interface Tracking {
  id: string;
  tracking_number: string;
  status: string;
  location?: string;
  note?: string;
  created_at: string;
}

// Message types
export interface Message {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Settings types
export interface Settings {
  id: string;
  phone?: string;
  email?: string;
  whatsapp_link?: string;
  facebook_page?: string;
  facebook_group?: string;
  office_address?: string;
  company_name?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalOrders: number;
  totalRequests: number;
  totalMessages: number;
  unreadMessages: number;
  pendingOrders: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Contact form
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// Product request form
export interface ProductRequestFormData {
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  product_name: string;
  product_link?: string;
  target_price?: string;
  quantity?: string;
  packaging_type?: string;
  pack_quantity?: string;
  master_pack_quantity?: string;
  pack_dimensions?: string;
  weight_per_pack?: string;
  sample_needed?: string;
  shipping_method?: string;
  specifications?: string;
  message?: string;
}

// Video types
export interface Video {
  id: string;
  title: string;
  youtube_url: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Service Request types
export interface ServiceRequest {
  id: string;
  service_type: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  details?: string;
  parsedDetails?: Record<string, string>;
  message?: string;
  image?: string;
  status: string;
  tracking_number?: string;
  admin_notes?: string;
  price?: number;
  converted_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestFormData {
  service_type: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  details?: Record<string, string>;
  message?: string;
}

export interface InvoiceItem {
  productName: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  perPiecePrice?: number;
  weight?: string;
  volume?: string;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  dueDate: string;
  orderNumber: string;
  trackingNumber?: string;
  status: string;
  shippingMethod?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerWhatsapp?: string;
  customerAddress?: string;
  deliveryAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingCost?: number;
  discount?: number;
  totalAmount: number;
  netWeight?: string;
  paymentInfo?: string;
  notes?: string;
  signatureUrl?: string;
  useLogoAsSignature?: boolean;
}
