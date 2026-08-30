import {
  Clinic,
  Doctor,
  Patient,
  Visit,
  Payment,
  Appointment,
  DashboardStats,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('arabdoc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error: any = new Error(data.error || 'حدث خطأ غير متوقع');
    error.code = data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: {
    doctorName: string;
    email: string;
    password: string;
    specialty?: string;
    clinicName?: string;
    phone?: string;
  }) => request<{ token: string; doctor: Doctor; clinic: Clinic; message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; doctor: Doctor; clinic: Clinic; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ doctor: Doctor; clinic: Clinic }>('/auth/me'),

  updateProfile: (payload: {
    doctorName?: string;
    specialty?: string;
    phone?: string;
    clinicName?: string;
    clinicAddress?: string;
    currency?: string;
  }) => request<{ doctor: Doctor; clinic: Clinic; message: string }>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  upgradePlan: () => request<{ clinic: Clinic; message: string }>('/auth/upgrade', {
    method: 'POST',
  }),

  resetDemo: () => request<{ message: string }>('/settings/reset-demo', {
    method: 'POST',
  }),

  exportData: () => request<any>('/settings/export'),

  // Dashboard
  getDashboard: () => request<DashboardStats>('/dashboard'),

  // Patients
  getPatients: (params?: { search?: string; gender?: string; condition?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.condition) query.append('condition', params.condition);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ patients: Patient[]; totalCount: number; clinicPlan: string; maxPatients: number }>(`/patients${qs}`);
  },

  getPatient: (id: string) =>
    request<{
      patient: Patient;
      visits: Visit[];
      medications: any[];
      payments: Payment[];
      appointments: Appointment[];
      conditionTrend: { visitNumber: number; visitDate: string; score: number; diagnosis: string; isImproved?: boolean }[];
    }>(`/patients/${id}`),

  createPatient: (payload: Partial<Patient>) =>
    request<{ patient: Patient; message: string }>('/patients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updatePatient: (id: string, payload: Partial<Patient>) =>
    request<{ patient: Patient; message: string }>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deletePatient: (id: string) =>
    request<{ message: string }>(`/patients/${id}`, {
      method: 'DELETE',
    }),

  // Visits
  createVisit: (patientId: string, payload: any) =>
    request<{ visit: Visit; message: string }>(`/patients/${patientId}/visits`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteVisit: (id: string) =>
    request<{ message: string }>(`/visits/${id}`, {
      method: 'DELETE',
    }),

  // Appointments
  getAppointments: () => request<Appointment[]>('/appointments'),

  createAppointment: (payload: Partial<Appointment>) =>
    request<{ appointment: Appointment; message: string }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateAppointment: (id: string, payload: Partial<Appointment>) =>
    request<{ appointment: Appointment; message: string }>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteAppointment: (id: string) =>
    request<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE',
    }),

  // Payments
  getPayments: () =>
    request<{ payments: (Payment & { patientName: string; patientPhone: string; patientFileNumber: string })[]; totalCollected: number; totalPending: number; currency: string }>('/payments'),

  createPayment: (payload: Partial<Payment>) =>
    request<{ payment: Payment; message: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Cases
  getCases: () =>
    request<{
      patient: Patient;
      latestVisit: Visit | null;
      previousVisit: Visit | null;
      score: number;
      visitsCount: number;
      trendText: string;
      needsFollowUp: boolean;
    }[]>('/cases'),

  // Reports
  getReports: () =>
    request<{
      totalPatients: number;
      totalVisits: number;
      totalRevenue: number;
      totalDebt: number;
      avgScore: string;
      improvementRate: number;
      paymentMethods: { name: string; amount: number }[];
    }>('/reports'),

  // Backup
  exportBackup: () =>
    request<any>('/backup'),
};
