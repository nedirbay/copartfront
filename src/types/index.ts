export type UserRole = 'ADMIN' | 'EMPLOYEE'

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email?: string
  role: UserRole
  phone_number?: string
  telegram_chat_id?: string
  is_active?: boolean
  vehicles_count?: number
  created_at: string
}

export interface AppNotification {
  id: number
  vehicle: string | null
  kind: string
  message: string
  is_read: boolean
  created_at: string
}


export interface EmployeeCreated extends User {
  generated_password?: string
}

export type VehicleStatus = 'PURCHASED' | 'IN_TRANSIT' | 'ARRIVED_TKM' | 'SOLD' | string
export type VehicleLocation = 'USA_COPART' | 'SHIPPING_TRANSIT' | 'GEORGIA' | 'TURKMENISTAN_INTERNAL' | string

export interface DynamicStatus {
  id: number
  code: string
  name: string
}

export interface DynamicLocation {
  id: number
  code: string
  name: string
}

export interface Make {
  id: number
  name: string
}

export interface VehicleModel {
  id: number
  make: number
  make_name?: string
  name: string
}

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  usd_rate?: string
  rate_updated_at?: string | null
}

export interface ExpenseType {
  id: number
  name: string
}


export interface Vehicle {
  vin: string
  title: string
  make: string
  model: string
  year: number
  color: string
  mileage: number
  status: VehicleStatus
  location: VehicleLocation
  current_owner: number | null
  current_owner_detail?: User | null
  pending_handover_owner?: number | null
  pending_handover_owner_detail?: User | null
  is_handed_over: boolean
  status_changed_at?: string | null

  lot_number?: string
  auction_date?: string | null
  container_number?: string
  eta?: string | null

  purchase_price?: string | null
  purchase_currency?: string
  purchase_price_usd?: string | null
  sale_price?: string | null
  sale_currency?: string
  sale_price_usd?: string | null
  sold_at?: string | null
  buyer_name?: string
  buyer_phone?: string
  buyer_note?: string

  total_expenses: string
  expenses_by_currency?: Record<string, string>
  profit_usd?: string | null
  photo?: string | null
  photo_url?: string | null
  photos?: string[]
  created_at: string
  updated_at: string
}

export interface VehicleHistoryLog {
  id: number
  vehicle: string
  event?: string
  status: string
  location: string
  owner: number | null
  owner_detail?: User | null
  changed_by: number | null
  changed_by_detail?: User | null
  note: string
  created_at: string
}

export interface VehicleExpense {
  id: number
  vehicle: string
  title: string
  amount: string
  currency: string
  amount_usd?: string | null
  description: string
  stage: string
  receipt?: string | null
  created_by: number | null
  created_by_detail?: User | null
  created_at: string
}

export interface VehicleDocument {
  id: number
  vehicle: string
  file: string
  title: string
  document_type: string
  uploaded_by: number | null
  uploaded_by_detail?: User | null
  created_at: string
}
