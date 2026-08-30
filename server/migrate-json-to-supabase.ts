import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient, hasSupabaseConfigured } from './supabase.ts';

export async function migrateJsonToSupabase() {
  if (!hasSupabaseConfigured()) {
    console.log('[Migration] Supabase credentials not configured, skipping cloud migration.');
    return { success: false, message: 'Supabase credentials missing' };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { success: false, message: 'Could not initialize Supabase client' };
  }

  try {
    const jsonPath = path.join(process.cwd(), 'data', 'arabdoc.json');
    if (!fs.existsSync(jsonPath)) {
      return { success: false, message: 'JSON database file not found' };
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(rawData);

    console.log('[Migration] Starting JSON to Supabase migration...');

    // 1. Migrate Clinics
    if (data.clinics && data.clinics.length > 0) {
      const clinicsToInsert = data.clinics.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || null,
        address: c.address || null,
        currency: c.currency || 'SAR',
        plan: c.plan || 'free',
        max_patients: c.maxPatients || 3,
        created_at: c.createdAt || new Date().toISOString(),
        updated_at: c.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('clinics')
        .upsert(clinicsToInsert, { onConflict: 'id' });

      if (error) {
        console.error('[Migration] Error migrating clinics:', error.message);
      } else {
        console.log(`[Migration] Migrated ${clinicsToInsert.length} clinics successfully.`);
      }
    }

    // 2. Migrate Doctors
    if (data.doctors && data.doctors.length > 0) {
      const doctorsToInsert = data.doctors.map((d: any) => ({
        id: d.id,
        clinic_id: d.clinicId,
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        specialty: d.specialty || 'طبيب عام',
        license_number: d.licenseNumber || null,
        avatar: d.avatar || null,
        created_at: d.createdAt || new Date().toISOString(),
        updated_at: d.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('doctors')
        .upsert(doctorsToInsert, { onConflict: 'id' });

      if (error) {
        console.error('[Migration] Error migrating doctors:', error.message);
      } else {
        console.log(`[Migration] Migrated ${doctorsToInsert.length} doctors successfully.`);
      }
    }

    // 3. Migrate Patients
    if (data.patients && data.patients.length > 0) {
      const patientsToInsert = data.patients.map((p: any) => ({
        id: p.id,
        clinic_id: p.clinicId,
        file_number: p.fileNumber,
        name: p.name,
        phone: p.phone,
        date_of_birth: p.dateOfBirth,
        gender: p.gender,
        blood_type: p.bloodType || null,
        chronic_diseases: p.chronicDiseases || null,
        allergies: p.allergies || null,
        emergency_contact: p.emergencyContact || null,
        national_id: p.nationalId || null,
        address: p.address || null,
        notes: p.notes || null,
        created_at: p.createdAt || new Date().toISOString(),
        updated_at: p.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('patients')
        .upsert(patientsToInsert, { onConflict: 'id' });

      if (error) {
        console.error('[Migration] Error migrating patients:', error.message);
      } else {
        console.log(`[Migration] Migrated ${patientsToInsert.length} patients successfully.`);
      }
    }

    // 4. Migrate Visits
    if (data.visits && data.visits.length > 0) {
      const visitsToInsert = data.visits.map((v: any) => ({
        id: v.id,
        clinic_id: v.clinicId,
        patient_id: v.patientId,
        visit_number: v.visitNumber || 1,
        visit_date: v.visitDate,
        case_description: v.caseDescription || '',
        diagnosis: v.diagnosis || '',
        treatment: v.treatment || '',
        doctor_notes: v.doctorNotes || null,
        condition_score: v.conditionScore || 5,
        is_improved: v.isImproved || false,
        follow_up_instructions: v.followUpInstructions || null,
        next_appointment_date: v.nextAppointmentDate || null,
        created_at: v.createdAt || new Date().toISOString(),
        updated_at: v.updatedAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('visits')
        .upsert(visitsToInsert, { onConflict: 'id' });

      if (error) {
        console.error('[Migration] Error migrating visits:', error.message);
      } else {
        console.log(`[Migration] Migrated ${visitsToInsert.length} visits successfully.`);
      }
    }

    // 5. Migrate Medications
    if (data.visit_medications && data.visit_medications.length > 0) {
      const medsToInsert = data.visit_medications.map((m: any) => ({
        id: m.id,
        clinic_id: m.clinicId,
        patient_id: m.patientId,
        visit_id: m.visitId,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        notes: m.notes || null,
        created_at: m.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('visit_medications')
        .upsert(medsToInsert, { onConflict: 'id' });

      if (error) {
        console.warn('[Migration] Notice for visit_medications:', error.message);
      } else {
        console.log(`[Migration] Migrated ${medsToInsert.length} medications successfully.`);
      }
    }

    // 6. Migrate Payments
    if (data.payments && data.payments.length > 0) {
      const paymentsToInsert = data.payments.map((py: any) => ({
        id: py.id,
        clinic_id: py.clinicId,
        patient_id: py.patientId,
        visit_id: py.visitId || null,
        amount: py.amount || 0,
        total_required: py.totalRequired || py.amount || 0,
        remaining_amount: py.remainingAmount || 0,
        payment_method: py.paymentMethod || 'cash',
        payment_date: py.paymentDate || new Date().toISOString().split('T')[0],
        notes: py.notes || null,
        created_at: py.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('payments')
        .upsert(paymentsToInsert, { onConflict: 'id' });

      if (error) {
        console.warn('[Migration] Notice for payments:', error.message);
      } else {
        console.log(`[Migration] Migrated ${paymentsToInsert.length} payments successfully.`);
      }
    }

    // 7. Migrate Appointments
    if (data.appointments && data.appointments.length > 0) {
      const appointmentsToInsert = data.appointments.map((a: any) => ({
        id: a.id,
        clinic_id: a.clinicId,
        patient_id: a.patientId,
        patient_name: a.patientName,
        patient_phone: a.patientPhone || '',
        patient_file_number: a.patientFileNumber || '',
        appointment_date: a.appointmentDate,
        appointment_time: a.appointmentTime || '10:00',
        type: a.type || 'consultation',
        status: a.status || 'scheduled',
        notes: a.notes || null,
        created_at: a.createdAt || new Date().toISOString(),
        updated_at: a.createdAt || new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('appointments')
        .upsert(appointmentsToInsert, { onConflict: 'id' });

      if (error) {
        console.warn('[Migration] Notice for appointments:', error.message);
      } else {
        console.log(`[Migration] Migrated ${appointmentsToInsert.length} appointments successfully.`);
      }
    }

    console.log('[Migration] Data migration to Supabase completed successfully.');

    return {
      success: true,
      message: 'Data migrated successfully',
    };

  } catch (err: any) {
    console.error('[Migration] Exception during data migration:', err);

    return {
      success: false,
      message: err.message,
    };
  }
}
