// ============================================================
// All TypeScript types for Body Line Fitness Center
// ============================================================

export interface GymPlan {
  id: string
  name: string
  slug: string
  duration_months: number
  price: number
  admission_fee: number
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface GymMember {
  id: string
  user_id: string | null
  full_name: string
  phone: string
  email: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  photo_url: string | null
  member_code: string | null
  status: 'active' | 'inactive' | 'suspended'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GymSubscription {
  id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  amount_paid: number
  payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other'
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded'
  transaction_ref: string | null
  renewed_from: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  // Joined
  plan?: GymPlan
  member?: GymMember
}

export interface GymAttendance {
  id: string
  member_id: string
  check_in_at: string
  check_out_at: string | null
  method: 'manual' | 'qr' | 'rfid'
}

export interface GymTrainer {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  photo_url: string | null
  specializations: string[]
  bio: string | null
  experience_years: number
  certifications: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface GymClassSchedule {
  id: string
  class_name: string
  trainer_id: string | null
  day_of_week: number // 0=Sun, 1=Mon...6=Sat
  start_time: string
  end_time: string
  capacity: number
  batch: string | null
  is_active: boolean
  created_at: string
  // Joined
  trainer?: GymTrainer
}

export interface GymInquiry {
  id: string
  full_name: string
  phone: string
  email: string | null
  message: string | null
  inquiry_type: 'general' | 'membership' | 'personal_training' | 'trial' | 'other'
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

export interface GymGallery {
  id: string
  title: string | null
  image_url: string
  category: string
  sort_order: number
  is_active: boolean
  created_at: string
}

// Auth & Profile (Shanti Kutir style Phone + PIN)
export type UserRole = 'admin' | 'trainer' | 'member'

export interface Profile {
  id: string
  phone: string
  name: string
  role: UserRole
  created_at: string
}

export interface AuthState {
  profile: Profile | null
  loading: boolean
  error: string | null
}

export interface AuthUser {
  id: string
  phone: string
  name?: string
  role?: UserRole
}

// UI State
export interface LoadingState {
  loading: boolean
  error: string | null
}

// Member portal combined view
export interface MemberPortalData {
  member: GymMember
  activeSubscription: GymSubscription | null
  recentAttendance: GymAttendance[]
  daysRemaining: number
  isExpired: boolean
  isExpiringSoon: boolean // within 7 days
}
