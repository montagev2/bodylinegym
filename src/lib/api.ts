import { supabase } from './supabase'
import type { GymPlan, GymTrainer, GymClassSchedule, GymInquiry, GymMember, GymSubscription, GymAttendance } from '../types'

// ============================================================
// Plans
// ============================================================
export async function getPlans(): Promise<GymPlan[]> {
  const { data, error } = await supabase
    .from('gym_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

// ============================================================
// Trainers
// ============================================================
export async function getTrainers(): Promise<GymTrainer[]> {
  const { data, error } = await supabase
    .from('gym_trainers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

// ============================================================
// Class Schedules
// ============================================================
export async function getClassSchedules(): Promise<GymClassSchedule[]> {
  const { data, error } = await supabase
    .from('gym_class_schedules')
    .select('*, trainer:gym_trainers(full_name, photo_url)')
    .eq('is_active', true)
    .order('day_of_week')
    .order('start_time')
  if (error) throw error
  return data ?? []
}

// ============================================================
// Inquiries
// ============================================================
export async function submitInquiry(payload: Omit<GymInquiry, 'id' | 'status' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('gym_inquiries').insert(payload)
  if (error) throw error
}

// ============================================================
// Member Portal (authenticated)
// ============================================================
export async function getMyMember(): Promise<GymMember | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('gym_members')
    .select('*')
    .eq('user_id', user.id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function getMySubscriptions(): Promise<GymSubscription[]> {
  const member = await getMyMember()
  if (!member) return []

  const { data, error } = await supabase
    .from('gym_subscriptions')
    .select('*, plan:gym_plans(*)')
    .eq('member_id', member.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getMyAttendance(limit = 30): Promise<GymAttendance[]> {
  const member = await getMyMember()
  if (!member) return []

  const { data, error } = await supabase
    .from('gym_attendance')
    .select('*')
    .eq('member_id', member.id)
    .order('check_in_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// ============================================================
// Admin (service-role or admin user)
// ============================================================
export async function getAllMembers(): Promise<GymMember[]> {
  const { data, error } = await supabase
    .from('gym_members')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAllSubscriptions(): Promise<GymSubscription[]> {
  const { data, error } = await supabase
    .from('gym_subscriptions')
    .select('*, plan:gym_plans(*), member:gym_members(*)')
    .order('end_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getExpiringSubscriptions(withinDays = 7): Promise<GymSubscription[]> {
  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + withinDays * 86400000).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('gym_subscriptions')
    .select('*, plan:gym_plans(*), member:gym_members(*)')
    .gte('end_date', today)
    .lte('end_date', future)
    .eq('payment_status', 'paid')
    .order('end_date')
  if (error) throw error
  return data ?? []
}

export async function getAllInquiries(): Promise<GymInquiry[]> {
  const { data, error } = await supabase
    .from('gym_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function addMember(payload: Partial<GymMember>): Promise<GymMember> {
  const { data, error } = await supabase
    .from('gym_members')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addSubscription(payload: Partial<GymSubscription>): Promise<GymSubscription> {
  const { data, error } = await supabase
    .from('gym_subscriptions')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateInquiryStatus(id: string, status: GymInquiry['status']): Promise<void> {
  const { error } = await supabase.from('gym_inquiries').update({ status }).eq('id', id)
  if (error) throw error
}
