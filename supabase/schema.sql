-- ============================================================================
-- ARABDOC CLINICAL MANAGEMENT SYSTEM - SUPABASE POSTGRESQL SCHEMA & RLS
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clinics Table
CREATE TABLE IF NOT EXISTS public.clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    currency TEXT NOT NULL DEFAULT 'SAR',
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    max_patients INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Doctors Table (Linked to auth.users and clinics)
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    specialty TEXT NOT NULL DEFAULT 'طبيب عام',
    license_number TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    file_number TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    blood_type TEXT,
    chronic_diseases TEXT,
    allergies TEXT,
    emergency_contact TEXT,
    national_id TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Visits Table (Cumulative clinical records)
CREATE TABLE IF NOT EXISTS public.visits (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_number INTEGER NOT NULL DEFAULT 1,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    case_description TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    doctor_notes TEXT,
    condition_score INTEGER NOT NULL CHECK (condition_score >= 1 AND condition_score <= 10),
    is_improved BOOLEAN NOT NULL DEFAULT false,
    follow_up_instructions TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Visit Medications Table (Prescription items)
CREATE TABLE IF NOT EXISTS public.visit_medications (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id TEXT NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Payments Table (Financial billing)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    visit_id TEXT REFERENCES public.visits(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_required NUMERIC(12, 2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'other')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Appointments Table (Bookings and schedules)
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    clinic_id TEXT NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_file_number TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'consultation' CHECK (type IN ('new_examination', 'follow_up', 'consultation', 'urgent')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE CLINICAL QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON public.doctors(email);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_file_number ON public.patients(clinic_id, file_number);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON public.visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id ON public.visits(clinic_id);
CREATE INDEX IF NOT EXISTS idx_visit_meds_visit_id ON public.visit_medications(visit_id);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_id ON public.payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date);

-- ============================================================================
-- PERMISSIONS GRANTS (Crucial for PostgREST & Supabase service / anon roles)
-- ============================================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS MULTI-TENANCY ISOLATION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_auth_doctor_clinic_id()
RETURNS TEXT AS $$
DECLARE
    v_clinic_id TEXT;
BEGIN
    SELECT clinic_id INTO v_clinic_id
    FROM public.doctors
    WHERE id = auth.uid()::TEXT OR email = auth.jwt()->>'email'
    LIMIT 1;
    
    RETURN v_clinic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 1. Clinics Policies
DROP POLICY IF EXISTS "Clinics SELECT" ON public.clinics;
DROP POLICY IF EXISTS "Clinics UPDATE" ON public.clinics;
DROP POLICY IF EXISTS "Clinics INSERT" ON public.clinics;

CREATE POLICY "Clinics SELECT"
    ON public.clinics FOR SELECT
    USING (true);

CREATE POLICY "Clinics UPDATE"
    ON public.clinics FOR UPDATE
    USING (id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Clinics INSERT"
    ON public.clinics FOR INSERT
    WITH CHECK (true);

-- 2. Doctors Policies
DROP POLICY IF EXISTS "Doctors SELECT" ON public.doctors;
DROP POLICY IF EXISTS "Doctors UPDATE" ON public.doctors;
DROP POLICY IF EXISTS "Doctors INSERT" ON public.doctors;

CREATE POLICY "Doctors SELECT"
    ON public.doctors FOR SELECT
    USING (true);

CREATE POLICY "Doctors UPDATE"
    ON public.doctors FOR UPDATE
    USING (id = auth.uid()::TEXT OR clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Doctors INSERT"
    ON public.doctors FOR INSERT
    WITH CHECK (true);

-- 3. Patients Policies
DROP POLICY IF EXISTS "Patients SELECT" ON public.patients;
DROP POLICY IF EXISTS "Patients INSERT" ON public.patients;
DROP POLICY IF EXISTS "Patients UPDATE" ON public.patients;
DROP POLICY IF EXISTS "Patients DELETE" ON public.patients;

CREATE POLICY "Patients SELECT"
    ON public.patients FOR SELECT
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Patients INSERT"
    ON public.patients FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Patients UPDATE"
    ON public.patients FOR UPDATE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Patients DELETE"
    ON public.patients FOR DELETE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- 4. Visits Policies
DROP POLICY IF EXISTS "Visits SELECT" ON public.visits;
DROP POLICY IF EXISTS "Visits INSERT" ON public.visits;
DROP POLICY IF EXISTS "Visits UPDATE" ON public.visits;
DROP POLICY IF EXISTS "Visits DELETE" ON public.visits;

CREATE POLICY "Visits SELECT"
    ON public.visits FOR SELECT
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Visits INSERT"
    ON public.visits FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Visits UPDATE"
    ON public.visits FOR UPDATE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Visits DELETE"
    ON public.visits FOR DELETE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- 5. Visit Medications Policies
DROP POLICY IF EXISTS "Medications SELECT" ON public.visit_medications;
DROP POLICY IF EXISTS "Medications INSERT" ON public.visit_medications;
DROP POLICY IF EXISTS "Medications UPDATE" ON public.visit_medications;
DROP POLICY IF EXISTS "Medications DELETE" ON public.visit_medications;

CREATE POLICY "Medications SELECT"
    ON public.visit_medications FOR SELECT
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Medications INSERT"
    ON public.visit_medications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Medications UPDATE"
    ON public.visit_medications FOR UPDATE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Medications DELETE"
    ON public.visit_medications FOR DELETE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- 6. Payments Policies
DROP POLICY IF EXISTS "Payments SELECT" ON public.payments;
DROP POLICY IF EXISTS "Payments INSERT" ON public.payments;
DROP POLICY IF EXISTS "Payments UPDATE" ON public.payments;
DROP POLICY IF EXISTS "Payments DELETE" ON public.payments;

CREATE POLICY "Payments SELECT"
    ON public.payments FOR SELECT
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Payments INSERT"
    ON public.payments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Payments UPDATE"
    ON public.payments FOR UPDATE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Payments DELETE"
    ON public.payments FOR DELETE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- 7. Appointments Policies
DROP POLICY IF EXISTS "Appointments SELECT" ON public.appointments;
DROP POLICY IF EXISTS "Appointments INSERT" ON public.appointments;
DROP POLICY IF EXISTS "Appointments UPDATE" ON public.appointments;
DROP POLICY IF EXISTS "Appointments DELETE" ON public.appointments;

CREATE POLICY "Appointments SELECT"
    ON public.appointments FOR SELECT
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Appointments INSERT"
    ON public.appointments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Appointments UPDATE"
    ON public.appointments FOR UPDATE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Appointments DELETE"
    ON public.appointments FOR DELETE
    USING (clinic_id = public.get_auth_doctor_clinic_id() OR auth.role() = 'service_role' OR auth.role() = 'anon');
