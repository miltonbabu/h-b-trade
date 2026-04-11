// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// Product Request types
export interface ProductRequest {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  product_name: string;
  product_link?: string;
  quantity?: string;
  shipping_method?: string;
  message?: string;
  image?: string;
  tracking_number?: string;
  status: string;
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
  status: string;
  tracking_number?: string;
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  items?: Array<{
    productId?: string;
    productCode?: string;
    productName?: string;
    quantity?: number;
    price?: number;
    total?: number;
  }>;
  product_codes?: string;
  items_info?: string;
  payment_info?: string;
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
  product_name: string;
  product_link?: string;
  quantity?: string;
  shipping_method?: string;
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
