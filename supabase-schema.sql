-- ============================================================
-- BODY LINE FITNESS CENTER - Database Schema
-- Run this in: https://supabase.com/dashboard/project/penzktygcpvymfsyslew/sql/new
-- Safe: uses gym_ prefix, won't touch existing TFG/SK tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gym_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  duration_months integer NOT NULL,
  price numeric(10,2) NOT NULL,
  admission_fee numeric(10,2) DEFAULT 0,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  photo_url text,
  member_code text UNIQUE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.gym_plans(id),
  start_date date NOT NULL,
  end_date date NOT NULL,
  amount_paid numeric(10,2) NOT NULL,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  payment_status text DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),
  transaction_ref text,
  renewed_from uuid REFERENCES public.gym_subscriptions(id),
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.gym_members(id) ON DELETE CASCADE,
  check_in_at timestamptz NOT NULL DEFAULT now(),
  check_out_at timestamptz,
  method text DEFAULT 'manual' CHECK (method IN ('manual', 'qr', 'rfid'))
);

CREATE TABLE IF NOT EXISTS public.gym_trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text,
  email text,
  photo_url text,
  specializations text[] DEFAULT '{}',
  bio text,
  experience_years integer DEFAULT 0,
  certifications text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name text NOT NULL,
  trainer_id uuid REFERENCES public.gym_trainers(id) ON DELETE SET NULL,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  capacity integer DEFAULT 20,
  batch text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  inquiry_type text DEFAULT 'general' CHECK (inquiry_type IN ('general', 'membership', 'personal_training', 'trial', 'other')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS gym_members_phone_idx ON public.gym_members(phone);
CREATE INDEX IF NOT EXISTS gym_members_user_id_idx ON public.gym_members(user_id);
CREATE INDEX IF NOT EXISTS gym_subscriptions_member_id_idx ON public.gym_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS gym_subscriptions_end_date_idx ON public.gym_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS gym_attendance_member_id_idx ON public.gym_attendance(member_id);
CREATE INDEX IF NOT EXISTS gym_attendance_check_in_at_idx ON public.gym_attendance(check_in_at DESC);

-- Seed membership plans (prices are placeholders — confirm with client)
INSERT INTO public.gym_plans (name, slug, duration_months, price, admission_fee, features, sort_order)
VALUES
  ('Monthly', 'monthly', 1, 600, 500, ARRAY['Full gym access','Locker room','Cardio zone','24/7 access'], 1),
  ('Quarterly', 'quarterly', 3, 1600, 500, ARRAY['Full gym access','Locker room','Cardio zone','24/7 access','Free 1 PT session'], 2),
  ('Half-Yearly', 'half-yearly', 6, 2800, 0, ARRAY['Full gym access','Locker room','Cardio zone','24/7 access','2 Free PT sessions','Diet consultation'], 3),
  ('Annual', 'annual', 12, 5000, 0, ARRAY['Full gym access','Locker room','Cardio zone','24/7 access','5 Free PT sessions','Diet plan','Priority booking'], 4),
  ('Personal Training', 'personal-training', 1, 2000, 0, ARRAY['1-on-1 trainer','Custom workout plan','Diet consultation','Progress tracking','Flexible timing'], 5)
ON CONFLICT (slug) DO NOTHING;

-- Seed head trainer
INSERT INTO public.gym_trainers (full_name, specializations, bio, experience_years, is_active, sort_order)
VALUES
  ('Head Trainer', ARRAY['Strength & Conditioning','Boxing','Weight Training','Cardio'], 'Certified fitness trainer with expertise in strength training and combat sports.', 5, true, 1)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.gym_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_gallery ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "gym_plans_public_read" ON public.gym_plans FOR SELECT USING (is_active = true);
CREATE POLICY "gym_trainers_public_read" ON public.gym_trainers FOR SELECT USING (is_active = true);
CREATE POLICY "gym_schedules_public_read" ON public.gym_class_schedules FOR SELECT USING (is_active = true);
CREATE POLICY "gym_gallery_public_read" ON public.gym_gallery FOR SELECT USING (is_active = true);

-- Public can submit inquiries
CREATE POLICY "gym_inquiries_public_insert" ON public.gym_inquiries FOR INSERT WITH CHECK (true);

-- Members can view/update their own record
CREATE POLICY "gym_members_own_read" ON public.gym_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "gym_members_own_update" ON public.gym_members FOR UPDATE USING (user_id = auth.uid());

-- Members can view their own subscriptions
CREATE POLICY "gym_subscriptions_own_read" ON public.gym_subscriptions
  FOR SELECT USING (member_id IN (SELECT id FROM public.gym_members WHERE user_id = auth.uid()));

-- Members can view their own attendance
CREATE POLICY "gym_attendance_own_read" ON public.gym_attendance
  FOR SELECT USING (member_id IN (SELECT id FROM public.gym_members WHERE user_id = auth.uid()));

-- ============================================================
-- AUTHENTICATION & PROFILES (Shanti Kutir style Phone + PIN)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.gym_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  pin_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'trainer', 'admin')),
  last_active timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gym_profiles_phone_idx ON public.gym_profiles(phone);

ALTER TABLE public.gym_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gym_profiles_public_read" ON public.gym_profiles FOR SELECT USING (true);

-- Verify Login by Phone + 4-digit PIN
CREATE OR REPLACE FUNCTION public.verify_gym_login(p_phone text, p_pin text)
RETURNS TABLE(id uuid, phone text, name text, role text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT pr.id, pr.phone, pr.name, pr.role, pr.created_at
  FROM public.gym_profiles pr
  WHERE pr.phone = p_phone
    AND pr.pin_hash = crypt(p_pin, pr.pin_hash);

  UPDATE public.gym_profiles
  SET last_active = now()
  WHERE phone = p_phone
    AND pin_hash = crypt(p_pin, pin_hash);
END;
$$;

-- Register or Upgrade Gym Member
CREATE OR REPLACE FUNCTION public.register_gym_member(
  p_phone text,
  p_pin   text,
  p_name  text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hash text;
  v_id   uuid;
  v_role text;
BEGIN
  v_hash := crypt(p_pin, gen_salt('bf'));

  INSERT INTO public.gym_profiles (phone, pin_hash, name, role)
  VALUES (p_phone, v_hash, p_name, 'member')
  ON CONFLICT (phone) DO UPDATE
    SET pin_hash = EXCLUDED.pin_hash,
        name     = EXCLUDED.name,
        last_active = now()
  RETURNING id, role INTO v_id, v_role;

  RETURN jsonb_build_object('id', v_id, 'phone', p_phone, 'name', p_name, 'role', v_role);
END;
$$;

-- Seed Master Admin (Owner phone: 6294902384, PIN: 1234)
INSERT INTO public.gym_profiles (phone, pin_hash, name, role)
VALUES ('6294902384', crypt('1234', gen_salt('bf')), 'Body Line Master Admin', 'admin')
ON CONFLICT (phone) DO UPDATE
  SET pin_hash = EXCLUDED.pin_hash,
      role = 'admin';
