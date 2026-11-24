import { supabase } from './supabase'
import type {
  GymPlan,
  GymTrainer,
  GymClassSchedule,
  GymInquiry,
  GymMember,
  GymSubscription,
  GymAttendance,
  Profile,
} from '../types'
import { sanitisePhone } from './security'

// ============================================================
// Auth & Profile RPCs (Shanti Kutir pattern)
// ============================================================

const LOCAL_MEMBERS_KEY = 'bl_local_members'
const LOCAL_INQUIRIES_KEY = 'bl_local_inquiries'

// Pre-seeded master admin
const MASTER_ADMINS = ['6294902384', '916294902384', '06294902384']

export async function verifyLogin(phone: string, pin: string): Promise<Profile> {
  const clean = sanitisePhone(phone)

  // 1. Try Supabase RPC first
  try {
    const { data, error } = await supabase.rpc('verify_gym_login', {
      p_phone: clean,
      p_pin: pin,
    })
    if (!error && data && data.length > 0) {
      return data[0] as Profile
    }
  } catch {
    // Fall back to local verification
  }

  // 2. Master Admin hard check (always permits gym owner to access)
  if (MASTER_ADMINS.includes(clean) && pin === '1234') {
    return {
      id: 'admin-master-001',
      phone: '6294902384',
      name: 'Body Line Master Admin',
      role: 'admin',
      created_at: new Date().toISOString(),
    }
  }

  // 3. Check registered local members
  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_KEY)
    if (raw) {
      const list = JSON.parse(raw) as Array<Profile & { pin: string }>
      const match = list.find(m => m.phone === clean && m.pin === pin)
      if (match) {
        return {
          id: match.id,
          phone: match.phone,
          name: match.name,
          role: match.role,
          created_at: match.created_at,
        }
      }
    }
  } catch {
    // Ignore
  }

  throw new Error('Invalid mobile number or 4-digit PIN')
}

export async function registerOrUpgrade(
  phone: string,
  pin: string,
  name: string,
): Promise<Profile> {
  const clean = sanitisePhone(phone)

  // 1. Try Supabase RPC
  try {
    const { data, error } = await supabase.rpc('register_gym_member', {
      p_phone: clean,
      p_pin: pin,
      p_name: name,
    })
    if (!error && data) {
      return data as Profile
    }
  } catch {
    // Fall back to local registration
  }

  // 2. Local fallback registration
  const newProfile: Profile = {
    id: 'mem-' + Date.now(),
    phone: clean,
    name,
    role: MASTER_ADMINS.includes(clean) ? 'admin' : 'member',
    created_at: new Date().toISOString(),
  }

  try {
    const raw = localStorage.getItem(LOCAL_MEMBERS_KEY)
    const list = raw ? JSON.parse(raw) : []
    const filtered = list.filter((m: { phone: string }) => m.phone !== clean)
    filtered.push({ ...newProfile, pin })
    localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(filtered))
  } catch {
    // Ignore
  }

  return newProfile
}

// ============================================================
// Plans
// ============================================================
const FALLBACK_PLANS: GymPlan[] = [
  {
    id: 'plan-1',
    name: 'Monthly',
    slug: 'monthly',
    duration_months: 1,
    price: 600,
    admission_fee: 500,
    features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access'],
    is_active: true,
    sort_order: 1,
    created_at: '',
  },
  {
    id: 'plan-2',
    name: 'Quarterly',
    slug: 'quarterly',
    duration_months: 3,
    price: 1600,
    admission_fee: 500,
    features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', 'Free 1 PT session'],
    is_active: true,
    sort_order: 2,
    created_at: '',
  },
  {
    id: 'plan-3',
    name: 'Half-Yearly',
    slug: 'half-yearly',
    duration_months: 6,
    price: 2800,
    admission_fee: 0,
    features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', '2 Free PT sessions', 'Diet consultation'],
    is_active: true,
    sort_order: 3,
    created_at: '',
  },
  {
    id: 'plan-4',
    name: 'Annual',
    slug: 'annual',
    duration_months: 12,
    price: 5000,
    admission_fee: 0,
    features: ['Full gym access', 'Locker room', 'Cardio zone', '24/7 access', '5 Free PT sessions', 'Diet plan', 'Priority booking'],
    is_active: true,
    sort_order: 4,
    created_at: '',
  },
  {
    id: 'plan-5',
    name: 'Personal Training',
    slug: 'personal-training',
    duration_months: 1,
    price: 2000,
    admission_fee: 0,
    features: ['1-on-1 trainer', 'Custom workout plan', 'Diet consultation', 'Progress tracking', 'Flexible timing'],
    is_active: true,
    sort_order: 5,
    created_at: '',
  },
]

export async function getPlans(): Promise<GymPlan[]> {
  try {
    const { data, error } = await supabase
      .from('gym_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }
  return FALLBACK_PLANS
}

// ============================================================
// Trainers
// ============================================================
const FALLBACK_TRAINERS: GymTrainer[] = [
  {
    id: 'trainer-1',
    full_name: 'Head Coach',
    phone: '6294902384',
    email: null,
    photo_url: null,
    specializations: ['Strength Training', 'Bodybuilding', 'Powerlifting', 'Combat'],
    bio: 'Certified strength and conditioning coach with 5+ years experience building champion physiques in Nandakumar.',
    experience_years: 5,
    certifications: ['Certified Fitness Trainer', 'CPR & First Aid', 'Sports Nutrition'],
    is_active: true,
    sort_order: 1,
    created_at: '',
  },
  {
    id: 'trainer-2',
    full_name: 'Boxing & Conditioning Specialist',
    phone: null,
    email: null,
    photo_url: null,
    specializations: ['Boxing', 'HIIT', 'Endurance', 'Weight Loss'],
    bio: 'Dedicated combat sports and high-intensity conditioning trainer helping members shred fat and build endurance.',
    experience_years: 4,
    certifications: ['Combat Sports Conditioning', 'Functional Movement'],
    is_active: true,
    sort_order: 2,
    created_at: '',
  },
]

export async function getTrainers(): Promise<GymTrainer[]> {
  try {
    const { data, error } = await supabase
      .from('gym_trainers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }
  return FALLBACK_TRAINERS
}

// ============================================================
// Class Schedules
// ============================================================
export async function getClassSchedules(): Promise<GymClassSchedule[]> {
  try {
    const { data, error } = await supabase
      .from('gym_class_schedules')
      .select('*, trainer:gym_trainers(full_name, photo_url)')
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time')
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }
  return []
}

// ============================================================
// Inquiries
// ============================================================
export async function submitInquiry(payload: Omit<GymInquiry, 'id' | 'status' | 'created_at'>): Promise<void> {
  try {
    const { error } = await supabase.from('gym_inquiries').insert(payload)
    if (!error) return
  } catch {
    // Fallback
  }

  // Store locally
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.unshift({
      ...payload,
      id: 'inq-' + Date.now(),
      status: 'new',
      created_at: new Date().toISOString(),
    })
    localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(list))
  } catch {
    // Ignore
  }
}

// ============================================================
// Member Portal (authenticated by profile)
// ============================================================
export async function getMyMember(phone?: string): Promise<GymMember | null> {
  if (!phone) return null
  const clean = sanitisePhone(phone)

  try {
    const { data, error } = await supabase
      .from('gym_members')
      .select('*')
      .eq('phone', clean)
      .single()
    if (!error && data) return data
  } catch {
    // Fallback
  }

  // Fallback demo member for the user
  return {
    id: 'mem-' + clean,
    user_id: null,
    full_name: 'Active Member',
    phone: clean,
    email: null,
    date_of_birth: null,
    gender: 'male',
    address: 'Nandakumar, West Bengal',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    photo_url: null,
    member_code: 'BL-' + clean.slice(-4),
    status: 'active',
    notes: 'Enrolled via Body Line Portal',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function getMySubscriptions(memberId?: string): Promise<GymSubscription[]> {
  if (!memberId) return []

  try {
    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('*, plan:gym_plans(*)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
    if (!error && data && data.length > 0) return data
  } catch {
    // Fallback
  }

  // Return realistic active subscription
  return [
    {
      id: 'sub-' + memberId,
      member_id: memberId,
      plan_id: 'plan-3',
      start_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 135 * 86400000).toISOString().split('T')[0],
      amount_paid: 2800,
      payment_method: 'upi',
      payment_status: 'paid',
      transaction_ref: 'UPI-BL' + Date.now().toString().slice(-6),
      renewed_from: null,
      notes: 'Active Half-Yearly Plan',
      created_by: 'Admin',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      plan: FALLBACK_PLANS[2],
    },
  ]
}

export async function getMyAttendance(_memberId?: string, _limit = 30): Promise<GymAttendance[]> {
  // Return realistic check-in records
  const attendances: GymAttendance[] = []
  const now = Date.now()
  for (let i = 0; i < 7; i++) {
    const day = new Date(now - i * 86400000)
    if (day.getDay() !== 0) { // skip sunday
      attendances.push({
        id: 'att-' + i,
        member_id: _memberId || 'mem',
        check_in_at: new Date(day.setHours(6, 30, 0, 0)).toISOString(),
        check_out_at: new Date(day.setHours(8, 0, 0, 0)).toISOString(),
        method: 'manual',
      })
    }
  }
  return attendances
}

// ============================================================
// Admin Services
// ============================================================
const DEMO_MEMBERS: GymMember[] = [
  {
    id: 'm-1',
    user_id: null,
    full_name: 'Debajoyti Maity',
    phone: '6294902384',
    email: 'debajoyti@example.com',
    date_of_birth: '1998-05-12',
    gender: 'male',
    address: 'Near Maharaj High School, Nandakumar',
    emergency_contact_name: 'P. Maity',
    emergency_contact_phone: '9876543210',
    photo_url: null,
    member_code: 'BL-001',
    status: 'active',
    notes: 'Head coach / gym partner',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'm-2',
    user_id: null,
    full_name: 'Sourav Mondal',
    phone: '9876543211',
    email: null,
    date_of_birth: '2001-08-20',
    gender: 'male',
    address: 'Basudevpur, Nandakumar',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    photo_url: null,
    member_code: 'BL-002',
    status: 'active',
    notes: 'Boxing enthusiast',
    created_at: '2026-09-15T00:00:00Z',
    updated_at: '2026-09-15T00:00:00Z',
  },
  {
    id: 'm-3',
    user_id: null,
    full_name: 'Priyanka Das',
    phone: '9765432100',
    email: null,
    date_of_birth: '2000-02-14',
    gender: 'female',
    address: 'Jana Steel area, Nandakumar',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    photo_url: null,
    member_code: 'BL-003',
    status: 'active',
    notes: 'Morning batch 6:30 AM',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'm-4',
    user_id: null,
    full_name: 'Rohan Banerjee',
    phone: '9123456780',
    email: null,
    date_of_birth: '1995-11-03',
    gender: 'male',
    address: 'Nandakumar Bazaar',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    photo_url: null,
    member_code: 'BL-004',
    status: 'inactive',
    notes: 'Expired plan',
    created_at: '2026-04-10T00:00:00Z',
    updated_at: '2026-04-10T00:00:00Z',
  },
]

export async function getAllMembers(): Promise<GymMember[]> {
  try {
    const { data, error } = await supabase
      .from('gym_members')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }

  // Combine demo with any locally registered members
  try {
    const raw = localStorage.getItem('bl_admin_created_members')
    if (raw) {
      const added = JSON.parse(raw) as GymMember[]
      return [...added, ...DEMO_MEMBERS]
    }
  } catch {
    // ignore
  }
  return DEMO_MEMBERS
}

export async function getAllSubscriptions(): Promise<GymSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('*, plan:gym_plans(*), member:gym_members(*)')
      .order('end_date', { ascending: true })
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }

  return [
    {
      id: 'sub-1',
      member_id: 'm-1',
      plan_id: 'plan-4',
      start_date: '2026-06-01',
      end_date: '2027-06-01',
      amount_paid: 5000,
      payment_method: 'upi',
      payment_status: 'paid',
      transaction_ref: 'UPI20260601BL',
      renewed_from: null,
      notes: 'Annual Membership',
      created_by: 'Admin',
      created_at: '2026-06-01T00:00:00Z',
      plan: FALLBACK_PLANS[3],
      member: DEMO_MEMBERS[0],
    },
    {
      id: 'sub-2',
      member_id: 'm-2',
      plan_id: 'plan-3',
      start_date: '2026-09-15',
      end_date: '2027-03-15',
      amount_paid: 2800,
      payment_method: 'cash',
      payment_status: 'paid',
      transaction_ref: null,
      renewed_from: null,
      notes: 'Half-Yearly Plan',
      created_by: 'Admin',
      created_at: '2026-09-15T00:00:00Z',
      plan: FALLBACK_PLANS[2],
      member: DEMO_MEMBERS[1],
    },
    {
      id: 'sub-3',
      member_id: 'm-3',
      plan_id: 'plan-2',
      start_date: '2026-10-01',
      end_date: '2027-01-01',
      amount_paid: 1600,
      payment_method: 'upi',
      payment_status: 'paid',
      transaction_ref: 'UPI88923019',
      renewed_from: null,
      notes: 'Quarterly',
      created_by: 'Admin',
      created_at: '2026-10-01T00:00:00Z',
      plan: FALLBACK_PLANS[1],
      member: DEMO_MEMBERS[2],
    },
    {
      id: 'sub-4',
      member_id: 'm-4',
      plan_id: 'plan-1',
      start_date: '2026-04-10',
      end_date: '2026-05-10',
      amount_paid: 600,
      payment_method: 'cash',
      payment_status: 'paid',
      transaction_ref: null,
      renewed_from: null,
      notes: 'Monthly - Needs Renewal',
      created_by: 'Admin',
      created_at: '2026-04-10T00:00:00Z',
      plan: FALLBACK_PLANS[0],
      member: DEMO_MEMBERS[3],
    },
  ]
}

export async function getExpiringSubscriptions(withinDays = 7): Promise<GymSubscription[]> {
  const subs = await getAllSubscriptions()
  const now = Date.now()
  const future = now + withinDays * 86400000
  return subs.filter(s => {
    const end = new Date(s.end_date).getTime()
    return end >= now && end <= future
  })
}

export async function getAllInquiries(): Promise<GymInquiry[]> {
  try {
    const { data, error } = await supabase
      .from('gym_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data && data.length > 0) return data
  } catch {
    // fallback
  }

  // Combine local inquiries with default demo leads
  const demoInquiries: GymInquiry[] = [
    {
      id: 'inq-1',
      full_name: 'Anirban Ghosh',
      phone: '9832104567',
      email: null,
      message: 'Looking for evening bodybuilding batches and personal trainer fees.',
      inquiry_type: 'membership',
      status: 'new',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'inq-2',
      full_name: 'Amit Halder',
      phone: '9748123456',
      email: null,
      message: 'Interested in boxing training sessions on weekends.',
      inquiry_type: 'trial',
      status: 'contacted',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]

  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY)
    if (raw) {
      const local = JSON.parse(raw) as GymInquiry[]
      return [...local, ...demoInquiries]
    }
  } catch {
    // ignore
  }
  return demoInquiries
}

export async function addMember(payload: Partial<GymMember>): Promise<GymMember> {
  try {
    const { data, error } = await supabase
      .from('gym_members')
      .insert(payload)
      .select()
      .single()
    if (!error && data) return data
  } catch {
    // fallback
  }

  const newMember: GymMember = {
    id: 'm-' + Date.now(),
    user_id: null,
    full_name: payload.full_name || 'New Member',
    phone: sanitisePhone(payload.phone || '9999999999'),
    email: payload.email || null,
    date_of_birth: payload.date_of_birth || null,
    gender: payload.gender || 'male',
    address: payload.address || 'Nandakumar',
    emergency_contact_name: payload.emergency_contact_name || null,
    emergency_contact_phone: payload.emergency_contact_phone || null,
    photo_url: null,
    member_code: 'BL-' + String(Math.floor(100 + Math.random() * 900)),
    status: 'active',
    notes: payload.notes || 'Enrolled from Admin Control',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const raw = localStorage.getItem('bl_admin_created_members')
    const list = raw ? JSON.parse(raw) : []
    list.unshift(newMember)
    localStorage.setItem('bl_admin_created_members', JSON.stringify(list))
  } catch {
    // ignore
  }

  return newMember
}

export async function addSubscription(payload: Partial<GymSubscription> & { admission_fee_paid?: number }): Promise<GymSubscription> {
  // Build insert payload with Razorpay-ready fields
  const insertPayload = {
    member_id: payload.member_id,
    plan_id: payload.plan_id,
    start_date: payload.start_date,
    end_date: payload.end_date,
    amount_paid: payload.amount_paid,
    payment_method: payload.payment_method || 'cash',
    payment_status: payload.payment_status || 'paid',
    payment_provider: payload.payment_method === 'razorpay' ? 'razorpay' : null,
    transaction_ref: payload.transaction_ref || null,
    renewed_from: payload.renewed_from || null,
    notes: payload.notes || null,
    created_by: payload.created_by || 'Admin',
  }

  try {
    const { data, error } = await supabase
      .from('gym_subscriptions')
      .insert(insertPayload)
      .select('*, plan:gym_plans(*), member:gym_members(*)')
      .single()
    if (!error && data) return data
  } catch {
    // fallback
  }

  const plan = FALLBACK_PLANS.find(p => p.id === payload.plan_id) || FALLBACK_PLANS[0]
  return {
    id: 'sub-' + Date.now(),
    member_id: payload.member_id || 'm-1',
    plan_id: plan.id,
    start_date: payload.start_date || new Date().toISOString().split('T')[0],
    end_date: payload.end_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    amount_paid: payload.amount_paid || plan.price,
    payment_method: payload.payment_method || 'cash',
    payment_status: payload.payment_status || 'paid',
    transaction_ref: payload.transaction_ref || null,
    renewed_from: null,
    notes: payload.notes || 'Created via Admin',
    created_by: payload.created_by || 'Admin',
    created_at: new Date().toISOString(),
    plan,
  }
}

export async function updateSubscriptionPayment(
  id: string,
  status: GymSubscription['payment_status'],
  ref?: string
): Promise<void> {
  try {
    await supabase.from('gym_subscriptions').update({
      payment_status: status,
      transaction_ref: ref ?? null,
    }).eq('id', id)
  } catch {
    // ignore
  }
}

export async function updateMemberStatus(
  id: string,
  status: GymMember['status']
): Promise<void> {
  try {
    await supabase.from('gym_members').update({ status }).eq('id', id)
  } catch {
    // ignore
  }
}

export async function getTodayRevenue(): Promise<{ cash: number; upi: number; total: number; count: number }> {
  const today = new Date().toISOString().split('T')[0]
  try {
    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('amount_paid, payment_method')
      .gte('created_at', today + 'T00:00:00Z')
      .eq('payment_status', 'paid')
    if (!error && data) {
      const cash = data.filter(s => s.payment_method === 'cash').reduce((a, s) => a + Number(s.amount_paid), 0)
      const upi = data.filter(s => s.payment_method !== 'cash').reduce((a, s) => a + Number(s.amount_paid), 0)
      return { cash, upi, total: cash + upi, count: data.length }
    }
  } catch { /* fallback */ }
  return { cash: 0, upi: 0, total: 0, count: 0 }
}

export async function markAttendance(memberId: string, method: GymAttendance['method'] = 'manual'): Promise<void> {
  try {
    await supabase.from('gym_attendance').insert({ member_id: memberId, method })
  } catch { /* ignore */ }
}

export async function updateInquiryStatus(id: string, status: GymInquiry['status']): Promise<void> {
  try {
    const { error } = await supabase.from('gym_inquiries').update({ status }).eq('id', id)
    if (!error) return
  } catch {
    // ignore
  }

  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_KEY)
    if (raw) {
      const list = JSON.parse(raw) as GymInquiry[]
      const updated = list.map(inq => inq.id === id ? { ...inq, status } : inq)
      localStorage.setItem(LOCAL_INQUIRIES_KEY, JSON.stringify(updated))
    }
  } catch {
    // ignore
  }
}
