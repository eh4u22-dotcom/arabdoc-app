export type Gender = 'male' | 'female';

export type ConditionLevel = 'deteriorating' | 'weak' | 'moderate' | 'good' | 'excellent';

export interface Clinic {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  currency: string;
  plan: 'free' | 'premium';
  maxPatients: number;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  licenseNumber?: string;
  avatar?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  clinicId: string;
  fileNumber: string;
  name: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: Gender;
  bloodType?: string;
  chronicDiseases?: string;
  allergies?: string;
  emergencyContact?: string;
  nationalId?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Computed / aggregated fields from visits
  lastVisitDate?: string | null;
  currentConditionScore?: number | null; // 1-10
  totalPaid?: number;
  totalPending?: number;
  visitsCount?: number;
}

export interface VisitMedication {
  id: string;
  visitId: string;
  patientId: string;
  clinicId: string;
  name: string; // اسم الدواء
  dosage: string; // الجرعة (e.g. 500 ملغ)
  frequency: string; // عدد المرات (e.g. 3 مرات يومياً بعد الأكل)
  duration: string; // مدة العلاج (e.g. 7 أيام)
  notes?: string; // ملاحظات (e.g. مع شرب كمية كافية من الماء)
  createdAt: string;
}

export interface Payment {
  id: string;
  clinicId: string;
  patientId: string;
  visitId?: string | null;
  amount: number; // المبلغ المدفوع
  totalRequired?: number; // إجمالي تكلفة الزيارة / الفحص
  remainingAmount: number; // المبلغ المتبقي
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other'; // طريقة الدفع
  paymentDate: string; // تاريخ الدفع
  notes?: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  clinicId: string;
  patientId: string;
  visitNumber: number; // الزيارة 1، 2، 3 ...
  visitDate: string; // تاريخ الزيارة YYYY-MM-DD
  caseDescription: string; // وصف الحالة
  diagnosis: string; // التشخيص
  treatment: string; // العلاج
  doctorNotes?: string; // ملاحظات الطبيب
  conditionScore: number; // 1 to 10
  isImproved?: boolean; // هل حدث تحسن؟
  followUpInstructions?: string; // تعليمات المتابعة
  nextAppointmentDate?: string | null; // موعد الزيارة القادمة
  
  // Attached medications and payments
  medications: VisitMedication[];
  payment?: {
    amountPaid: number;
    remainingAmount: number;
    paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'other';
    paymentDate: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientFileNumber: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  type: 'new_examination' | 'follow_up' | 'consultation' | 'urgent';
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  todayAppointmentsCount: number;
  todayVisitsCount: number;
  totalRevenue: number;
  totalPendingBalance: number;
  flaggedCasesCount: number; // Cases scoring 1-5 or needing urgent follow up
  recentPatients: Patient[];
  recentVisits: (Visit & { patientName: string; patientFileNumber: string })[];
  todayAppointments: Appointment[];
  monthlyRevenueChart: { month: string; amount: number; visits: number }[];
  conditionDistribution: {
    deteriorating: number; // 1-3
    weak: number; // 4-5
    moderate: number; // 6-7
    good: number; // 8-9
    excellent: number; // 10
  };
}

export interface AuthState {
  token: string | null;
  doctor: Doctor | null;
  clinic: Clinic | null;
  isAuthenticated: boolean;
}
