import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db, DBDoctor, DBClinic } from './server/db.ts';
import { getSupabaseServerClient, hasSupabaseConfigured } from './server/supabase.ts';
import { migrateJsonToSupabase } from './server/migrate-json-to-supabase.ts';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'arabdoc-secret-jwt-key-2026';

app.use(express.json());

// Extend express Request interface
interface AuthenticatedRequest extends Request {
  doctor?: DBDoctor;
  clinic?: DBClinic;
}

// Authentication Middleware supporting both Supabase Auth tokens and custom JWTs
async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // 1. Try Supabase Auth Token verification if Supabase is configured
  if (hasSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (user && !error) {
          // Find matching doctor or create if needed
          let doctor = db.getDoctorByEmail(user.email || '');
          if (!doctor && user.id) {
            doctor = db.getDoctorById(user.id);
          }

          if (doctor) {
            const clinic = db.getClinic(doctor.clinicId);
            if (clinic) {
              req.doctor = doctor;
              req.clinic = clinic;
              next();
              return;
            }
          }
        }
      }
    } catch (_supabaseErr) {
      // Continue to custom JWT fallback
    }
  }

  // 2. Custom JWT Verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { doctorId: string; clinicId: string };
    const doctor = db.getDoctorById(decoded.doctorId);
    const clinic = db.getClinic(decoded.clinicId);

    if (!doctor || !clinic) {
      res.status(401).json({ error: 'جلسة غير صالحة أو تم حذف الحساب' });
      return;
    }

    req.doctor = doctor;
    req.clinic = clinic;
    next();
  } catch (err) {
    res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول' });
    return;
  }
}

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

// Register Doctor & Clinic
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { doctorName, email, password, specialty, clinicName, phone } = req.body;

    if (!doctorName || !email || !password) {
      res.status(400).json({ error: 'يرجى إدخال جميع الحقول الإلزامية (الاسم، البريد، كلمة المرور)' });
      return;
    }

    const existing = db.getDoctorByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' });
      return;
    }

    const { doctor, clinic } = db.createDoctorWithClinic({
      doctorName,
      email,
      password,
      specialty: specialty || 'طبيب عام',
      clinicName: clinicName || `عيادة ${doctorName}`,
      phone,
    });

    const token = jwt.sign({ doctorId: doctor.id, clinicId: clinic.id }, JWT_SECRET, { expiresIn: '30d' });

    const safeDoctor = { ...doctor };
    delete (safeDoctor as any).passwordHash;

    res.status(201).json({
      message: 'تم إنشاء الحساب والعيادة بنجاح',
      token,
      doctor: safeDoctor,
      clinic,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء التسجيل: ' + err.message });
  }
});

// Login Doctor
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const doctor = db.getDoctorByEmail(email);
    if (!doctor) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isValid = bcrypt.compareSync(password, doctor.passwordHash);
    if (!isValid) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const clinic = db.getClinic(doctor.clinicId);
    if (!clinic) {
      res.status(404).json({ error: 'لم يتم العثور على بيانات العيادة' });
      return;
    }

    const token = jwt.sign({ doctorId: doctor.id, clinicId: clinic.id }, JWT_SECRET, { expiresIn: '30d' });

    const safeDoctor = { ...doctor };
    delete (safeDoctor as any).passwordHash;

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      doctor: safeDoctor,
      clinic,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول: ' + err.message });
  }
});

// Get Current User Profile & Clinic Info
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const safeDoctor = { ...req.doctor };
  delete (safeDoctor as any).passwordHash;
  res.json({
    doctor: safeDoctor,
    clinic: req.clinic,
  });
});

// Update Profile & Clinic Info
app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { doctorName, specialty, phone, clinicName, clinicAddress, currency } = req.body;
    
    if (req.clinic) {
      db.updateClinic(req.clinic.id, {
        name: clinicName || req.clinic.name,
        address: clinicAddress ?? req.clinic.address,
        currency: currency || req.clinic.currency,
        phone: phone ?? req.clinic.phone,
      });
    }

    // Refresh updated data
    const updatedClinic = db.getClinic(req.clinic!.id);
    const safeDoctor = { ...req.doctor };
    delete (safeDoctor as any).passwordHash;

    res.json({
      message: 'تم تحديث البيانات بنجاح',
      doctor: safeDoctor,
      clinic: updatedClinic,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تحديث البيانات: ' + err.message });
  }
});

// Upgrade Subscription (Mock upgrade preparing for Google Play Billing)
app.post('/api/auth/upgrade', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.clinic) {
      res.status(400).json({ error: 'العيادة غير موجودة' });
      return;
    }

    const updated = db.updateClinic(req.clinic.id, {
      plan: 'premium',
      maxPatients: 999999,
    });

    res.json({
      message: 'تمت الترقية إلى الباقة الاحترافية بنجاح!',
      clinic: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل تحديث الاشتراك: ' + err.message });
  }
});

// Reset Demo Data
app.post('/api/settings/reset-demo', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    db.resetDemo();
    res.json({ message: 'تمت إعادة ضبط البيانات التجريبية بنجاح' });
  } catch (err: any) {
    res.status(500).json({ error: 'فشل إعادة ضبط البيانات: ' + err.message });
  }
});

// Export Data
app.get('/api/settings/export', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const raw = db.getRawData();
  const exportData = {
    clinic: db.getClinic(clinicId),
    doctor: req.doctor,
    patients: db.getPatients(clinicId),
    visits: db.getAllVisits(clinicId),
    medications: raw.visit_medications.filter(m => m.clinicId === clinicId),
    payments: db.getAllPayments(clinicId),
    appointments: db.getAppointments(clinicId),
    exportDate: new Date().toISOString(),
  };
  res.json(exportData);
});

// ----------------------------------------------------
// DASHBOARD STATS ROUTE
// ----------------------------------------------------
app.get('/api/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patients = db.getPatients(clinicId);
  const visits = db.getAllVisits(clinicId);
  const payments = db.getAllPayments(clinicId);
  const appointments = db.getAppointments(clinicId);

  const todayStr = new Date().toISOString().split('T')[0];

  // Enrich patients with stats
  const enrichedPatients = patients.map(p => {
    const patientVisits = visits.filter(v => v.patientId === p.id);
    const patientPayments = payments.filter(pay => pay.patientId === p.id);
    
    // Sort visits by date desc
    const sortedVisits = [...patientVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    const lastVisit = sortedVisits[0];
    const totalPaid = patientPayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
    const totalPending = patientPayments.reduce((sum, pay) => sum + (Number(pay.remainingAmount) || 0), 0);

    return {
      ...p,
      lastVisitDate: lastVisit ? lastVisit.visitDate : null,
      currentConditionScore: lastVisit ? lastVisit.conditionScore : null,
      totalPaid,
      totalPending,
      visitsCount: patientVisits.length,
    };
  });

  const totalPatients = patients.length;
  
  // New patients this month
  const currentYearMonth = todayStr.substring(0, 7);
  const newPatientsThisMonth = patients.filter(p => p.createdAt.startsWith(currentYearMonth)).length;

  // Today Appointments
  const todayAppointments = appointments.filter(a => a.appointmentDate === todayStr);
  
  // Today Visits
  const todayVisits = visits.filter(v => v.visitDate === todayStr);

  // Revenue & Debt
  const totalRevenue = payments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
  const totalPendingBalance = payments.reduce((sum, pay) => sum + (Number(pay.remainingAmount) || 0), 0);

  // Flagged Cases (Condition <= 5 or marked deteriorating)
  const flaggedCasesCount = enrichedPatients.filter(p => p.currentConditionScore !== null && p.currentConditionScore <= 5).length;

  // Recent 5 patients
  const recentPatients = [...enrichedPatients].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  // Recent 5 visits with patient names
  const recentVisits = [...visits].slice(0, 5).map(v => {
    const patient = patients.find(p => p.id === v.patientId);
    return {
      ...v,
      patientName: patient ? patient.name : 'مريض غير معروف',
      patientFileNumber: patient ? patient.fileNumber : '-',
    };
  });

  // Monthly Revenue Chart data for last 6 months
  const monthlyRevenueChart = [
    { month: 'مارس', amount: 1200, visits: 8 },
    { month: 'أبريل', amount: 1850, visits: 12 },
    { month: 'مايو', amount: 2400, visits: 15 },
    { month: 'يونيو', amount: 3100, visits: 20 },
    { month: 'يوليو', amount: 2900, visits: 18 },
    { month: 'أغسطس', amount: totalRevenue > 0 ? totalRevenue : 3800, visits: visits.length },
  ];

  // Condition distribution
  const conditionDistribution = {
    deteriorating: enrichedPatients.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 1 && p.currentConditionScore <= 3).length,
    weak: enrichedPatients.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 4 && p.currentConditionScore <= 5).length,
    moderate: enrichedPatients.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 6 && p.currentConditionScore <= 7).length,
    good: enrichedPatients.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 8 && p.currentConditionScore <= 9).length,
    excellent: enrichedPatients.filter(p => p.currentConditionScore === 10).length,
  };

  res.json({
    totalPatients,
    newPatientsThisMonth,
    todayAppointmentsCount: todayAppointments.length,
    todayVisitsCount: todayVisits.length,
    totalRevenue,
    totalPendingBalance,
    flaggedCasesCount,
    recentPatients,
    recentVisits,
    todayAppointments: todayAppointments.map(a => {
      const patient = patients.find(p => p.id === a.patientId);
      return {
        ...a,
        patientName: patient ? patient.name : 'مريض غير معروف',
        patientPhone: patient ? patient.phone : '-',
        patientFileNumber: patient ? patient.fileNumber : '-',
      };
    }),
    monthlyRevenueChart,
    conditionDistribution,
    clinicPlan: req.clinic!.plan,
    maxPatients: req.clinic!.maxPatients,
  });
});

// ----------------------------------------------------
// PATIENTS CRUD & FREE PLAN LIMIT
// ----------------------------------------------------

// List all patients
app.get('/api/patients', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patients = db.getPatients(clinicId);
  const visits = db.getAllVisits(clinicId);
  const payments = db.getAllPayments(clinicId);

  const search = (req.query.search as string || '').toLowerCase().trim();
  const genderFilter = req.query.gender as string;
  const conditionFilter = req.query.condition as string;

  let enriched = patients.map(p => {
    const patientVisits = visits.filter(v => v.patientId === p.id);
    const patientPayments = payments.filter(pay => pay.patientId === p.id);
    const sortedVisits = [...patientVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    const lastVisit = sortedVisits[0];
    const totalPaid = patientPayments.reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0);
    const totalPending = patientPayments.reduce((sum, pay) => sum + (Number(pay.remainingAmount) || 0), 0);

    return {
      ...p,
      lastVisitDate: lastVisit ? lastVisit.visitDate : null,
      currentConditionScore: lastVisit ? lastVisit.conditionScore : null,
      totalPaid,
      totalPending,
      visitsCount: patientVisits.length,
    };
  });

  // Apply filters
  if (search) {
    enriched = enriched.filter(p => 
      p.name.toLowerCase().includes(search) || 
      p.fileNumber.toLowerCase().includes(search) || 
      p.phone.includes(search)
    );
  }

  if (genderFilter && (genderFilter === 'male' || genderFilter === 'female')) {
    enriched = enriched.filter(p => p.gender === genderFilter);
  }

  if (conditionFilter) {
    if (conditionFilter === 'deteriorating') {
      enriched = enriched.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 1 && p.currentConditionScore <= 3);
    } else if (conditionFilter === 'weak') {
      enriched = enriched.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 4 && p.currentConditionScore <= 5);
    } else if (conditionFilter === 'moderate') {
      enriched = enriched.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 6 && p.currentConditionScore <= 7);
    } else if (conditionFilter === 'improved') {
      enriched = enriched.filter(p => p.currentConditionScore !== null && p.currentConditionScore >= 8);
    }
  }

  res.json({
    patients: enriched,
    totalCount: patients.length,
    clinicPlan: req.clinic!.plan,
    maxPatients: req.clinic!.maxPatients,
  });
});

// Create new patient (Enforce 3 patients limit on Free Plan)
app.post('/api/patients', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const currentCount = db.getPatients(clinicId).length;
  const clinic = req.clinic!;

  if (clinic.plan === 'free' && currentCount >= clinic.maxPatients) {
    res.status(403).json({
      error: 'وصلت إلى الحد الأقصى للباقة المجانية (3 مرضى). يرجى الترقية إلى الباقة الاحترافية لإضافة عدد غير محدود من المرضى.',
      code: 'LIMIT_REACHED',
      currentCount,
      maxPatients: clinic.maxPatients,
    });
    return;
  }

  const { name, phone, fileNumber, dateOfBirth, gender, bloodType, chronicDiseases, allergies, emergencyContact, nationalId, address, notes } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'اسم المريض ورقم الهاتف مطلوبان' });
    return;
  }

  // Auto-generate file number if empty
  const finalFileNumber = fileNumber && fileNumber.trim() ? fileNumber.trim() : `P-${1000 + currentCount + 1}`;

  const patient = db.createPatient(clinicId, {
    name,
    phone,
    fileNumber: finalFileNumber,
    dateOfBirth: dateOfBirth || '1990-01-01',
    gender: gender || 'male',
    bloodType: bloodType || '',
    chronicDiseases: chronicDiseases || '',
    allergies: allergies || '',
    emergencyContact: emergencyContact || '',
    nationalId: nationalId || '',
    address: address || '',
    notes: notes || '',
  });

  res.status(201).json({
    message: 'تمت إضافة المريض بنجاح',
    patient,
  });
});

// Get single patient with complete medical history (Visits, Timeline, Medications, Payments, Appointments)
app.get('/api/patients/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patientId = req.params.id;

  const patient = db.getPatientById(clinicId, patientId);
  if (!patient) {
    res.status(404).json({ error: 'لم يتم العثور على المريض' });
    return;
  }

  const visits = db.getVisitsByPatient(clinicId, patientId);
  const medications = db.getMedicationsByPatient(clinicId, patientId);
  const payments = db.getPaymentsByPatient(clinicId, patientId);
  const appointments = db.getAppointments(clinicId).filter(a => a.patientId === patientId);

  // Attach medications & payments to visits for timeline view
  const enrichedVisits = visits.map(v => {
    const vMeds = medications.filter(m => m.visitId === v.id);
    const vPay = payments.find(p => p.visitId === v.id);
    return {
      ...v,
      medications: vMeds,
      payment: vPay ? {
        amountPaid: vPay.amount,
        remainingAmount: vPay.remainingAmount,
        paymentMethod: vPay.paymentMethod,
        paymentDate: vPay.paymentDate,
      } : undefined,
    };
  });

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = payments.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);
  const latestVisit = visits.length > 0 ? visits[visits.length - 1] : null;

  // Condition trend array for chart
  const conditionTrend = visits.map((v, idx) => ({
    visitNumber: v.visitNumber || idx + 1,
    visitDate: v.visitDate,
    score: v.conditionScore,
    diagnosis: v.diagnosis,
    isImproved: v.isImproved,
  }));

  res.json({
    patient: {
      ...patient,
      lastVisitDate: latestVisit ? latestVisit.visitDate : null,
      currentConditionScore: latestVisit ? latestVisit.conditionScore : null,
      totalPaid,
      totalPending,
      visitsCount: visits.length,
    },
    visits: enrichedVisits,
    medications,
    payments,
    appointments,
    conditionTrend,
  });
});

// Update patient profile
app.put('/api/patients/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patientId = req.params.id;

  const updated = db.updatePatient(clinicId, patientId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'لم يتم العثور على المريض' });
    return;
  }

  res.json({
    message: 'تم تحديث بيانات المريض بنجاح',
    patient: updated,
  });
});

// Delete patient with confirmation
app.delete('/api/patients/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patientId = req.params.id;

  const deleted = db.deletePatient(clinicId, patientId);
  if (!deleted) {
    res.status(404).json({ error: 'لم يتم العثور على المريض أو تعذر الحذف' });
    return;
  }

  res.json({ message: 'تم حذف ملف المريض وكافة سجلاته بنجاح' });
});

// ----------------------------------------------------
// VISITS & TIMELINE
// ----------------------------------------------------

// Add visit to patient
app.post('/api/patients/:id/visits', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patientId = req.params.id;

  const patient = db.getPatientById(clinicId, patientId);
  if (!patient) {
    res.status(404).json({ error: 'المريض غير موجود' });
    return;
  }

  const {
    visitDate,
    caseDescription,
    diagnosis,
    treatment,
    doctorNotes,
    conditionScore,
    isImproved,
    followUpInstructions,
    nextAppointmentDate,
    medications,
    payment,
  } = req.body;

  if (!caseDescription || !diagnosis || !treatment) {
    res.status(400).json({ error: 'يرجى كتابة وصف الحالة والتشخيص وخطة العلاج' });
    return;
  }

  const newVisit = db.createVisit(clinicId, {
    patientId,
    visitDate: visitDate || new Date().toISOString().split('T')[0],
    caseDescription,
    diagnosis,
    treatment,
    doctorNotes,
    conditionScore: Number(conditionScore) || 5,
    isImproved: Boolean(isImproved),
    followUpInstructions,
    nextAppointmentDate,
    medications,
    payment,
  });

  // Update patient timestamp
  db.updatePatient(clinicId, patientId, {});

  res.status(201).json({
    message: 'تم تسجيل الزيارة والسجل الطبي بنجاح',
    visit: newVisit,
  });
});

// Delete visit
app.delete('/api/visits/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const visitId = req.params.id;

  const deleted = db.deleteVisit(clinicId, visitId);
  if (!deleted) {
    res.status(404).json({ error: 'الزيارة غير موجودة' });
    return;
  }

  res.json({ message: 'تم حذف الزيارة وسجلاتها بنجاح' });
});

// ----------------------------------------------------
// APPOINTMENTS
// ----------------------------------------------------

app.get('/api/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const appointments = db.getAppointments(clinicId);
  const patients = db.getPatients(clinicId);

  const enriched = appointments.map(a => {
    const p = patients.find(pat => pat.id === a.patientId);
    return {
      ...a,
      patientName: p ? p.name : 'مريض غير محدد',
      patientPhone: p ? p.phone : '',
      patientFileNumber: p ? p.fileNumber : '',
    };
  });

  res.json(enriched);
});

app.post('/api/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const { patientId, appointmentDate, appointmentTime, type, notes } = req.body;

  if (!patientId || !appointmentDate) {
    res.status(400).json({ error: 'يرجى تحديد المريض وتاريخ الموعد' });
    return;
  }

  const apt = db.createAppointment(clinicId, {
    patientId,
    appointmentDate,
    appointmentTime: appointmentTime || '16:00',
    type: type || 'follow_up',
    status: 'scheduled',
    notes: notes || '',
  });

  res.status(201).json({
    message: 'تم حجز الموعد بنجاح',
    appointment: apt,
  });
});

app.put('/api/appointments/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const aptId = req.params.id;

  const updated = db.updateAppointment(clinicId, aptId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'الموعد غير موجود' });
    return;
  }

  res.json({
    message: 'تم تحديث الموعد بنجاح',
    appointment: updated,
  });
});

app.delete('/api/appointments/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const aptId = req.params.id;

  const deleted = db.deleteAppointment(clinicId, aptId);
  if (!deleted) {
    res.status(404).json({ error: 'الموعد غير موجود' });
    return;
  }

  res.json({ message: 'تم إلغاء وحذف الموعد بنجاح' });
});

// ----------------------------------------------------
// PAYMENTS
// ----------------------------------------------------

app.get('/api/payments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const payments = db.getAllPayments(clinicId);
  const patients = db.getPatients(clinicId);

  const enriched = payments.map(pay => {
    const p = patients.find(pat => pat.id === pay.patientId);
    return {
      ...pay,
      patientName: p ? p.name : 'مريض غير محدد',
      patientPhone: p ? p.phone : '',
      patientFileNumber: p ? p.fileNumber : '',
    };
  });

  const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = payments.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);

  res.json({
    payments: enriched,
    totalCollected,
    totalPending,
    currency: req.clinic!.currency,
  });
});

app.post('/api/payments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const { patientId, visitId, amount, totalRequired, remainingAmount, paymentMethod, paymentDate, notes } = req.body;

  if (!patientId || !amount) {
    res.status(400).json({ error: 'يرجى تحديد المريض والمبلغ المدفوع' });
    return;
  }

  const payment = db.createPayment(clinicId, {
    patientId,
    visitId: visitId || null,
    amount: Number(amount) || 0,
    totalRequired: Number(totalRequired) || Number(amount) || 0,
    remainingAmount: Number(remainingAmount) || 0,
    paymentMethod: paymentMethod || 'cash',
    paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
  });

  res.status(201).json({
    message: 'تم تسجيل الدفعة المالية بنجاح',
    payment,
  });
});

// ----------------------------------------------------
// CASE TRACKER / FOLLOW-UP STATS
// ----------------------------------------------------

app.get('/api/cases', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patients = db.getPatients(clinicId);
  const visits = db.getAllVisits(clinicId);

  const cases = patients.map(p => {
    const pVisits = visits.filter(v => v.patientId === p.id);
    const sorted = [...pVisits].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    const latest = sorted[0];
    const previous = sorted[1];

    let trendText = 'حالة جديدة';
    if (latest && previous) {
      if (latest.conditionScore > previous.conditionScore) trendText = 'في تحسن ↗';
      else if (latest.conditionScore < previous.conditionScore) trendText = 'في تراجع ↘';
      else trendText = 'مستقرة →';
    }

    return {
      patient: p,
      latestVisit: latest || null,
      previousVisit: previous || null,
      score: latest ? latest.conditionScore : 0,
      visitsCount: pVisits.length,
      trendText,
      needsFollowUp: latest ? latest.conditionScore <= 5 : true,
    };
  });

  res.json(cases);
});

// ----------------------------------------------------
// REPORTS / ANALYTICS
// ----------------------------------------------------

app.get('/api/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const patients = db.getPatients(clinicId);
  const visits = db.getAllVisits(clinicId);
  const payments = db.getAllPayments(clinicId);

  const totalPatients = patients.length;
  const totalVisits = visits.length;
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalDebt = payments.reduce((sum, p) => sum + (Number(p.remainingAmount) || 0), 0);

  // Score stats
  const scores = visits.map(v => v.conditionScore);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0';

  const improvedVisitsCount = visits.filter(v => v.isImproved === true || v.conditionScore >= 7).length;
  const improvementRate = totalVisits > 0 ? Math.round((improvedVisitsCount / totalVisits) * 100) : 100;

  // Payment methods breakdown
  const cashTotal = payments.filter(p => p.paymentMethod === 'cash').reduce((s, p) => s + Number(p.amount), 0);
  const cardTotal = payments.filter(p => p.paymentMethod === 'card').reduce((s, p) => s + Number(p.amount), 0);
  const transferTotal = payments.filter(p => p.paymentMethod === 'bank_transfer').reduce((s, p) => s + Number(p.amount), 0);

  res.json({
    totalPatients,
    totalVisits,
    totalRevenue,
    totalDebt,
    avgScore,
    improvementRate,
    paymentMethods: [
      { name: 'نقدي (Cash)', amount: cashTotal },
      { name: 'بطاقة مدى / ائتمان', amount: cardTotal },
      { name: 'تحويل بنكي', amount: transferTotal },
    ],
  });
});

// ----------------------------------------------------
// BACKUP / EXPORT
// ----------------------------------------------------

app.get('/api/backup', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const clinicId = req.clinic!.id;
  const clinic = req.clinic;
  const doctor = req.doctor;
  const patients = db.getPatients(clinicId);
  const visits = db.getAllVisits(clinicId);
  const payments = db.getAllPayments(clinicId);
  const appointments = db.getAppointments(clinicId);

  res.json({
    exportDate: new Date().toISOString(),
    system: 'ArabDoc Medical SaaS',
    clinic,
    doctor,
    patients,
    visits,
    payments,
    appointments,
  });
});

// ----------------------------------------------------
// SYSTEM & SUPABASE MIGRATION STATUS
// ----------------------------------------------------

app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    database: hasSupabaseConfigured() ? 'supabase-postgresql' : 'local-json',
    supabaseConnected: hasSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/system/migrate', async (_req: Request, res: Response) => {
  try {
    const result = await migrateJsonToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Migration failed: ' + err.message });
  }
});

// ----------------------------------------------------
// SERVER & VITE MIDDLEWARE SETUP
// ----------------------------------------------------
async function startServer() {
  // If Supabase credentials are configured, trigger background migration of existing JSON data
  if (hasSupabaseConfigured()) {
    migrateJsonToSupabase().catch((err) => {
      console.error('[Startup] Supabase background data sync error:', err);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArabDoc Medical Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
