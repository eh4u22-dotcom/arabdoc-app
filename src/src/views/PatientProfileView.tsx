import React, { useState, useEffect } from 'react';
import { Patient, Visit, Payment, Appointment } from '../types';
import { api } from '../lib/api';
import { StarRating, getConditionStatus } from '../components/StarRating';
import { VisitFormModal } from '../components/VisitFormModal';
import { PatientFormModal } from '../components/PatientFormModal';
import { AppointmentModal } from '../components/AppointmentModal';
import {
  User,
  Phone,
  Calendar,
  Clock,
  HeartPulse,
  Activity,
  Plus,
  Edit2,
  Trash2,
  Pill,
  DollarSign,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Printer,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

interface PatientProfileViewProps {
  patientId: string;
  onBack: () => void;
}

type ProfileTab = 'timeline' | 'progress' | 'medications' | 'payments' | 'notes' | 'followup';

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patientId,
  onBack,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conditionTrend, setConditionTrend] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('timeline');

  // Modals
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPatient(patientId);
      setPatient(data.patient);
      setVisits(data.visits);
      setPayments(data.payments);
      setAppointments(data.appointments);
      setConditionTrend(data.conditionTrend);
    } catch (err) {
      console.error('Failed to load patient profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [patientId]);

  const handleDeleteVisit = async (visitId: string) => {
    try {
      await api.deleteVisit(visitId);
      setVisits(visits.filter(v => v.id !== visitId));
      setVisitToDelete(null);
      fetchProfile();
    } catch (err) {
      console.error('Failed to delete visit', err);
    }
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 mt-4">جاري تحميل السجل الطبي للمريض...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <h3 className="text-lg font-bold text-slate-800">لم يتم العثور على ملف المريض</h3>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
        >
          ← العودة لقائمة المرضى
        </button>
      </div>
    );
  }

  const latestScore = patient.currentConditionScore || (visits.length > 0 ? visits[visits.length - 1].conditionScore : null);
  const conditionStatus = latestScore ? getConditionStatus(latestScore) : null;

  // Calculate age
  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return isNaN(age) ? '-' : `${age} سنة (${dob})`;
  };

  // Collect all medications chronologically
  const allMedications: { visitNumber: number; visitDate: string; med: any }[] = [];
  visits.forEach(v => {
    if (v.medications && Array.isArray(v.medications)) {
      v.medications.forEach(m => {
        allMedications.push({
          visitNumber: v.visitNumber,
          visitDate: v.visitDate,
          med: m,
        });
      });
    }
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-white/60 backdrop-blur-sm transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <span>← المرضى</span>
          </button>
          <span className="text-blue-200">/</span>
          <span className="text-xs font-bold text-blue-900 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-xl border border-blue-100/80 shadow-2xs">
            {patient.name} ({patient.fileNumber})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPrescription}
            className="px-3.5 py-2 rounded-xl border border-blue-100 bg-white/70 backdrop-blur-sm hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="طباعة تقرير / وصفة طبية"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>طباعة السجل الطبي</span>
          </button>

          <button
            onClick={() => setIsEditPatientModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-blue-100 bg-white/70 backdrop-blur-sm hover:bg-white text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-blue-500" />
            <span>تعديل البيانات</span>
          </button>

          <button
            onClick={() => setIsVisitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل زيارة جديدة</span>
          </button>
        </div>
      </div>

      {/* Hero Patient Header Card (👤 بيانات المريض & 🩺 حالة المريض) */}
      <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Col 1 & 2: Patient Info */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              {patient.name.substring(0, 1)}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl lg:text-2xl font-extrabold text-blue-950 font-cairo">
                  {patient.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50/80 text-blue-900 border border-blue-100">
                  {patient.fileNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-white text-slate-700 border border-slate-200">
                  {patient.gender === 'male' ? 'ذكر ♂' : 'أنثى ♀'}
                </span>
                {patient.bloodType && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    🩸 {patient.bloodType}
                  </span>
                )}
              </div>

              {/* Personal Details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <strong className="text-slate-800" dir="ltr">{patient.phone}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>العمر: {calculateAge(patient.dateOfBirth)}</span>
                </span>
                {patient.emergencyContact && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <span>طوارئ: {patient.emergencyContact}</span>
                  </span>
                )}
              </div>

              {/* Alerts: Chronic diseases & Allergies */}
              <div className="flex flex-wrap gap-2 pt-1">
                {patient.chronicDiseases && (
                  <div className="text-[11px] font-semibold text-amber-900 bg-amber-50/90 px-2.5 py-1 rounded-xl border border-amber-200">
                    ⚠️ أمراض مزمنة: {patient.chronicDiseases}
                  </div>
                )}
                {patient.allergies && (
                  <div className="text-[11px] font-bold text-rose-800 bg-rose-50/90 px-2.5 py-1 rounded-xl border border-rose-200">
                    🚫 حساسية دوائية: {patient.allergies}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Col 3: Current Condition Status Badge (🩺 حالة المريض) */}
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-blue-100/70 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">حالة المريض الحالية</span>
              <HeartPulse className="w-5 h-5 text-blue-600" />
            </div>

            {latestScore ? (
              <div className="space-y-2">
                <StarRating score={latestScore} size="md" showBadge={true} />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {conditionStatus?.description}
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-blue-50 flex items-center justify-between">
                  <span>إجمالي الزيارات: {visits.length}</span>
                  <span>آخر كشف: {patient.lastVisitDate || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400">
                لم يتم تسجيل أي زيارة سريرية بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Financial & Visit Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white/65 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">عدد الزيارات الكلي</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{visits.length}</div>
          <span className="text-[10px] text-slate-400">سجل تراكمي</span>
        </div>

        <div className="bg-white/65 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700">إجمالي المدفوعات</span>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">
            {(patient.totalPaid || 0).toLocaleString()} <span className="text-xs font-bold">SAR</span>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">محصل بالكامل</span>
        </div>

        <div className="bg-white/65 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600">المبلغ المتبقي (ذمم)</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {(patient.totalPending || 0).toLocaleString()} <span className="text-xs font-bold">SAR</span>
          </div>
          <span className="text-[10px] text-rose-500">مستحق للمراجعة</span>
        </div>

        <div className="bg-white/65 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-700">الأدوية الموصوفة</span>
          <div className="text-2xl font-extrabold text-indigo-800 mt-1">{allMedications.length}</div>
          <span className="text-[10px] text-indigo-500">عبر كل الزيارات</span>
        </div>
      </div>

      {/* Navigation Tabs for Patient Profile */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-2 shadow-xs flex flex-wrap gap-1.5 no-print">
        {[
          { id: 'timeline', label: '📅 الزيارات والسجل الزمني', count: visits.length },
          { id: 'progress', label: '📈 تطور الحالة والتحسن', badge: visits.length > 1 ? 'متاح' : undefined },
          { id: 'medications', label: '💊 الأدوية والعلاج', count: allMedications.length },
          { id: 'payments', label: '💰 المدفوعات والفوترة', count: payments.length },
          { id: 'notes', label: '📝 ملاحظات الطبيب السريرية' },
          { id: 'followup', label: '🔄 المتابعة والمواعيد', count: appointments.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ProfileTab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-600 hover:text-blue-900 hover:bg-white/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-800'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: MEDICAL TIMELINE (The Heart of ArabDoc) */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>السجل الطبي الزمني الكامل للزيارات</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-100">
                  {visits.length} زيارة مسجلة
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                تسلسل زمني يحتوي على وصف كل حالة، التشخيص، العلاج، الأدوية، والتقييم بالنجوم
              </p>
            </div>

            <button
              onClick={() => setIsVisitModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1 cursor-pointer no-print"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>تسجيل زيارة جديدة</span>
            </button>
          </div>

          {visits.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-12 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">لا توجد زيارات مسجلة للمريض حتى الآن</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ابدأ بتسجيل أول زيارة طبية لتوثيق التشخيص والعلاج ومتابعة تقييم الحالة الصحية.
              </p>
              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                + تسجيل الزيارة الأولى الآن
              </button>
            </div>
          ) : (
            <div className="relative border-r-2 border-blue-400/40 pr-6 space-y-8 mr-2">
              {visits.map((visit, index) => {
                const isFirstVisit = index === 0;
                const prevVisit = index > 0 ? visits[index - 1] : null;
                const scoreDiff = prevVisit ? visit.conditionScore - prevVisit.conditionScore : 0;

                return (
                  <div key={visit.id} className="relative group">
                    {/* Timeline Node Icon on line */}
                    <div className="absolute -right-[33px] top-4 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ring-4 ring-white font-bold text-[10px]">
                      {visit.visitNumber || index + 1}
                    </div>

                    {/* Visit Card */}
                    <div className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/70 p-5 lg:p-6 shadow-xs hover:border-blue-300 hover:bg-white/90 transition-all space-y-4">
                      {/* Card Header: Visit Number, Date, and Rating */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-blue-50">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-blue-900 bg-blue-50/80 px-3 py-1 rounded-xl border border-blue-100">
                              الزيارة رقم {visit.visitNumber || index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span>{visit.visitDate}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Rating Stars 1 to 10 */}
                          <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-blue-100 shadow-2xs">
                            <StarRating score={visit.conditionScore} size="sm" showBadge={true} />
                          </div>

                          {/* Delete Visit button */}
                          <button
                            onClick={() => handleDeleteVisit(visit.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors no-print"
                            title="حذف الزيارة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Improvement Status Comparison */}
                      {!isFirstVisit && (
                        <div className="p-3 bg-blue-50/50 backdrop-blur-sm border border-blue-100/80 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">هل حدث تحسن مقارنة بالزيارة السابقة؟</span>
                            {visit.isImproved !== undefined ? (
                              visit.isImproved ? (
                                <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>نعم (تحسن ملحوظ)</span>
                                </span>
                              ) : (
                                <span className="font-extrabold text-rose-700 bg-rose-100/90 px-2.5 py-0.5 rounded-lg">
                                  لا / استقرار الأعراض
                                </span>
                              )
                            ) : scoreDiff > 0 ? (
                              <span className="font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg">
                                نعم (+{scoreDiff} نقاط)
                              </span>
                            ) : (
                              <span className="font-extrabold text-slate-600 bg-slate-200/80 px-2.5 py-0.5 rounded-lg">
                                مستقرة
                              </span>
                            )}
                          </div>

                          <div className="text-slate-500 font-semibold hidden sm:block">
                            الزيارة السابقة: {prevVisit?.conditionScore}/10 ← الحالية: {visit.conditionScore}/10
                          </div>
                        </div>
                      )}

                      {/* Clinical Content: Description, Diagnosis, Treatment */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        {/* Case Description */}
                        <div className="bg-white/60 p-3.5 rounded-2xl border border-blue-50 space-y-1">
                          <span className="font-bold text-slate-500 block">وصف الحالة والأعراض:</span>
                          <p className="text-slate-800 leading-relaxed font-medium">
                            {visit.caseDescription}
                          </p>
                        </div>

                        {/* Diagnosis */}
                        <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100/80 space-y-1">
                          <span className="font-bold text-blue-900 block">التشخيص الطبي:</span>
                          <p className="text-blue-950 font-bold leading-relaxed">
                            {visit.diagnosis}
                          </p>
                        </div>

                        {/* Treatment */}
                        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                          <span className="font-bold text-emerald-800 block">العلاج والإجراء السريري:</span>
                          <p className="text-emerald-950 leading-relaxed font-medium">
                            {visit.treatment}
                          </p>
                        </div>
                      </div>

                      {/* Prescribed Medications in this visit */}
                      {visit.medications && visit.medications.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Pill className="w-4 h-4 text-blue-600" />
                            <span>الأدوية الموصوفة ({visit.medications.length}):</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {visit.medications.map((med, mIdx) => (
                              <div
                                key={mIdx}
                                className="bg-white/90 border border-blue-100/80 rounded-2xl p-3.5 text-xs space-y-1 shadow-2xs"
                              >
                                <div className="font-bold text-blue-950 text-sm flex items-center justify-between">
                                  <span>{med.name}</span>
                                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                    {med.dosage || 'جرعة محددة'}
                                  </span>
                                </div>
                                <div className="text-slate-600 font-medium">
                                  {med.frequency && <span>التكرار: {med.frequency}</span>}
                                  {med.duration && <span> • المدة: {med.duration}</span>}
                                </div>
                                {med.notes && (
                                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                                    {med.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor Notes & Follow-up */}
                      {(visit.doctorNotes || visit.followUpInstructions || visit.nextAppointmentDate) && (
                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1.5">
                          {visit.doctorNotes && (
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-amber-900 shrink-0">ملاحظات الطبيب:</span>
                              <span className="text-slate-800">{visit.doctorNotes}</span>
                            </div>
                          )}
                          {visit.followUpInstructions && (
                            <div className="flex items-start gap-1.5">
                              <span className="font-bold text-amber-900 shrink-0">تعليمات المتابعة:</span>
                              <span className="text-slate-800">{visit.followUpInstructions}</span>
                            </div>
                          )}
                          {visit.nextAppointmentDate && (
                            <div className="flex items-center gap-1.5 text-blue-900 font-bold pt-1">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>موعد المراجعة القادمة: {visit.nextAppointmentDate}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Financial info for visit */}
                      {visit.payment && (
                        <div className="flex flex-wrap items-center justify-between text-xs bg-white/60 px-3.5 py-2.5 rounded-2xl border border-blue-100/60">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-600">المبلغ المدفوع:</span>
                            <span className="font-extrabold text-blue-900 text-sm">
                              {visit.payment.amountPaid} SAR
                            </span>
                            <span className="text-slate-400">
                              (طريقة الدفع: {visit.payment.paymentMethod === 'card' ? 'بطاقة' : 'نقدي'})
                            </span>
                          </div>

                          {visit.payment.remainingAmount > 0 && (
                            <div className="font-bold text-rose-600">
                              المتبقي: {visit.payment.remainingAmount} SAR
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROGRESS CHART (📈 تطور الحالة) */}
      {activeTab === 'progress' && (
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">مخطط تطور وتحسن الحالة الصحية</h3>
              <p className="text-xs text-slate-500">
                رسم بياني يوضح تقييم المريض (من 1 إلى 10) عبر تسلسل الزيارات
              </p>
            </div>

            {conditionTrend.length > 0 && (
              <div className="text-left">
                <span className="text-xs font-bold text-slate-500 block">آخر تقييم</span>
                <span className="text-xl font-extrabold text-blue-700">
                  {conditionTrend[conditionTrend.length - 1].score}/10
                </span>
              </div>
            )}
          </div>

          {conditionTrend.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا توجد زيارات كافية لرسم منحنى تطور الحالة.
            </div>
          ) : (
            <>
              {/* Chart Component */}
              <div className="h-72 w-full pt-4" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={conditionTrend.map((d, i) => ({
                      name: `الزيارة ${d.visitNumber || i + 1}`,
                      score: d.score,
                      date: d.visitDate,
                      diagnosis: d.diagnosis,
                    }))}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} stroke="#64748b" fontSize={12} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1 text-right" dir="rtl">
                              <p className="font-bold text-blue-300">{data.name} ({data.date})</p>
                              <p className="font-extrabold text-base">التقييم: {data.score} من 10</p>
                              <p className="text-slate-300 text-[11px] truncate max-w-xs">{data.diagnosis}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Step-by-step Visit Rating Summary Cards */}
              <div className="space-y-3 pt-4 border-t border-blue-50">
                <h4 className="text-xs font-bold text-slate-700">سجل التقييمات عبر الزيارات:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {conditionTrend.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">
                          الزيارة {item.visitNumber || idx + 1}
                        </span>
                        <span className="text-xs text-slate-500">{item.visitDate}</span>
                      </div>
                      <StarRating score={item.score} size="sm" showBadge={true} />
                      <p className="text-[11px] text-slate-600 truncate mt-1">
                        {item.diagnosis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: MEDICATIONS (💊 الأدوية والعلاج) */}
      {activeTab === 'medications' && (
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-blue-50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">السجل التراكمي للأدوية والعلاجات الموصوفة</h3>
              <p className="text-xs text-slate-500">
                قائمة بكافة الوصفات والجرعات التي قُدمت للمريض عبر جميع الزيارات
              </p>
            </div>
            <button
              onClick={handlePrintPrescription}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors no-print cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الروشتة</span>
            </button>
          </div>

          {allMedications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا توجد أدوية مسجلة في سجل المريض حتى الآن.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allMedications.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 space-y-2 hover:bg-white hover:border-blue-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-950 text-base">{item.med.name}</h4>
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      الزيارة {item.visitNumber} ({item.visitDate})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                    <div>
                      <span className="text-slate-400">الجرعة: </span>
                      <strong className="text-slate-800">{item.med.dosage || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">التكرار: </span>
                      <strong className="text-slate-800">{item.med.frequency || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">المدة: </span>
                      <strong className="text-slate-800">{item.med.duration || '-'}</strong>
                    </div>
                  </div>

                  {item.med.notes && (
                    <p className="text-[11px] text-slate-500 pt-1.5 border-t border-blue-50 italic">
                      تعليمات: {item.med.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PAYMENTS (💰 المدفوعات) */}
      {activeTab === 'payments' && (
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">السجل المالي ودفعات المريض</h3>
              <p className="text-xs text-slate-500">تفاصيل المبالغ المحصلة والمتبقية وطرق الدفع</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="bg-blue-50 text-blue-900 px-3 py-1.5 rounded-xl border border-blue-200">
                إجمالي المدفوع: {(patient.totalPaid || 0).toLocaleString()} SAR
              </div>
              <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200">
                المتبقي (ذمم): {(patient.totalPending || 0).toLocaleString()} SAR
              </div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا توجد دفعات مسجلة لهذا المريض.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(pay => (
                <div
                  key={pay.id}
                  className="flex flex-wrap items-center justify-between p-4 rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm hover:bg-white transition-all text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{pay.notes || 'دفعة كشف طبي'}</span>
                      <span className="text-slate-500">({pay.paymentDate})</span>
                    </div>
                    <p className="text-slate-500">
                      طريقة الدفع: {pay.paymentMethod === 'card' ? 'بطاقة بنكية / مدى' : pay.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'نقدي'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-left" dir="ltr">
                    <div>
                      <span className="text-slate-400 text-[11px] block">المبلغ المدفوع</span>
                      <span className="font-extrabold text-blue-900 text-base">
                        {pay.amount.toLocaleString()} SAR
                      </span>
                    </div>
                    {pay.remainingAmount > 0 && (
                      <div className="text-rose-600">
                        <span className="text-rose-400 text-[11px] block">متبقي</span>
                        <span className="font-bold text-sm">
                          {pay.remainingAmount.toLocaleString()} SAR
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DOCTOR NOTES (📝 ملاحظات الطبيب) */}
      {activeTab === 'notes' && (
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-4 shadow-xs">
          <div className="pb-3 border-b border-blue-50">
            <h3 className="font-bold text-slate-900 text-base">الملاحظات السريرية والتوجيهات الطبية</h3>
            <p className="text-xs text-slate-500">ملاحظات الطبيب المجمعة من ملف المريض ومختلف الزيارات</p>
          </div>

          {patient.notes && (
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 space-y-1 text-xs">
              <span className="font-bold text-blue-900 block">الملاحظات العامة في ملف المريض:</span>
              <p className="text-slate-800 leading-relaxed">{patient.notes}</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-700">ملاحظات الزيارات السابقة:</h4>
            {visits.filter(v => v.doctorNotes).length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد ملاحظات إضافية في الزيارات.</p>
            ) : (
              visits
                .filter(v => v.doctorNotes)
                .map(v => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-700">
                      <span>الزيارة {v.visitNumber} ({v.visitDate})</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{v.doctorNotes}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FOLLOW-UP (🔄 المتابعة) */}
      {activeTab === 'followup' && (
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-blue-50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">جدول المتابعة والمواعيد القادمة</h3>
              <p className="text-xs text-slate-500">إدارة مواعيد المراجعة والاستشارات الخاصة بهذا المريض</p>
            </div>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer no-print shadow-md shadow-blue-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>حجز موعد متابعة</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا توجد مواعيد مجدولة لهذا المريض.
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div
                  key={apt.id}
                  className="flex flex-wrap items-center justify-between p-4 rounded-2xl border border-blue-100 bg-white/70 backdrop-blur-sm text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {apt.type === 'follow_up' ? 'جلسة متابعة' : apt.type === 'urgent' ? 'حالة عاجلة' : 'استشارة'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {apt.status === 'confirmed' ? 'مؤكد' : 'مجدول'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      تاريخ الموعد: <strong>{apt.appointmentDate}</strong> الساعة <strong>{apt.appointmentTime}</strong>
                    </p>
                    {apt.notes && <p className="text-slate-500 italic">ملاحظات: {apt.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <VisitFormModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        patientId={patient.id}
        patientName={patient.name}
        onSuccess={() => fetchProfile()}
      />

      <PatientFormModal
        isOpen={isEditPatientModalOpen}
        onClose={() => setIsEditPatientModalOpen(false)}
        patientToEdit={patient}
        onSuccess={() => fetchProfile()}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        patients={[patient]}
        preselectedPatientId={patient.id}
        onSuccess={() => fetchProfile()}
      />
    </div>
  );
};
