export type UserRole = 'ADMIN' | 'EMPLOYEE'

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email?: string
  role: UserRole
  phone_number?: string
  raw_password?: string
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

  total_expenses: string
  photo?: string | null
  photo_url?: string | null
  created_at: string
  updated_at: string
}

export interface VehicleHistoryLog {
  id: number
  vehicle: string
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
  description: string
  stage: string
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
