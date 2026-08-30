import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { api } from '../lib/api';
import { StarRating } from '../components/StarRating';
import {
  Search,
  UserPlus,
  Filter,
  Trash2,
  Edit2,
  ChevronLeft,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PatientsViewProps {
  onSelectPatient: (patientId: string) => void;
  onOpenAddPatient: () => void;
  onOpenEditPatient: (patient: Patient) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onSelectPatient,
  onOpenAddPatient,
  onOpenEditPatient,
}) => {
  const { clinic, openUpgradeModal } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // Delete confirmation modal state
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPatients({
        search: search || undefined,
        gender: genderFilter || undefined,
        condition: conditionFilter || undefined,
      });
      setPatients(res.patients);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, genderFilter, conditionFilter]);

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await api.deletePatient(patientToDelete.id);
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      setPatientToDelete(null);
    } catch (err) {
      console.error('Failed to delete patient', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return isNaN(age) ? '-' : `${age} سنة`;
  };

  const isFreePlanLimitReached = clinic?.plan === 'free' && patients.length >= (clinic.maxPatients || 3);

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Top Controls Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-4 lg:p-6 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث برقم الملف، اسم المريض، أو رقم الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">كل الفئات (الذكور والإناث)</option>
            <option value="male">ذكور فقط 👨</option>
            <option value="female">إناث فقط 👩</option>
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">كل تقييمات الحالات الصحية</option>
            <option value="deteriorating">تدهور (1-3) 🔴</option>
            <option value="weak">ضعيفة (4-5) 🟠</option>
            <option value="moderate">متوسطة (6-7) 🔵</option>
            <option value="improved">تحسن ملحوظ (8-10) 🟢</option>
          </select>

          {/* Add Patient Button */}
          <button
            onClick={isFreePlanLimitReached ? openUpgradeModal : onOpenAddPatient}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مريض</span>
            {isFreePlanLimitReached && <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300 mr-1" />}
          </button>
        </div>
      </div>

      {/* Free plan alert banner if close to limit */}
      {clinic?.plan === 'free' && (
        <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
            <span>
              الباقة المجانية: مسجل لديك حالياً <strong>{patients.length}</strong> من أصل <strong>3 مرضى</strong> متاحين.
            </span>
          </div>
          <button
            onClick={openUpgradeModal}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            ترقية إلى Premium
          </button>
        </div>
      )}

      {/* Patients Grid Cards */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">جاري استرجاع قائمة المرضى...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد سجلات مرضى مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? 'لم نجد أي مريض يطابق عبارة البحث الحالية. جرب البحث برقم أو اسم آخر.'
              : 'ابدأ بإضافة أول ملف مريض في عيادتك لتوثيق الزيارات ومتابعة الحالة الصحية.'}
          </p>
          <button
            onClick={onOpenAddPatient}
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            + إضافة مريض الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(patient => (
            <div
              key={patient.id}
              className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/60 hover:bg-white/90 hover:border-blue-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header */}
              <div
                onClick={() => onSelectPatient(patient.id)}
                className="p-5 cursor-pointer border-b border-blue-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                      {patient.name.substring(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                        <span>{patient.name}</span>
                        {patient.gender === 'female' ? (
                          <span className="text-xs text-pink-500 font-normal">♀</span>
                        ) : (
                          <span className="text-xs text-sky-500 font-normal">♂</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                          {patient.fileNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {calculateAge(patient.dateOfBirth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Health & Condition Rating */}
                <div className="mt-4 pt-3 border-t border-blue-50/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">تقييم الحالة الحالية:</span>
                  {patient.currentConditionScore ? (
                    <StarRating
                      score={patient.currentConditionScore}
                      size="sm"
                      showBadge={true}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">بانتظار أول زيارة</span>
                  )}
                </div>

                {/* Chronic diseases warning tag */}
                {patient.chronicDiseases && (
                  <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/90 px-2.5 py-1 rounded-xl border border-amber-200/60 truncate font-semibold">
                    ⚠️ {patient.chronicDiseases}
                  </div>
                )}
              </div>

              {/* Card Meta & Financials */}
              <div className="px-5 py-3 bg-blue-50/40 text-xs text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>الهاتف:</span>
                  </span>
                  <span className="font-semibold text-slate-800" dir="ltr">
                    {patient.phone}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>آخر زيارة:</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    {patient.lastVisitDate || 'لا يوجد بعد'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-blue-100/50">
                  <span className="flex items-center gap-1 text-blue-700 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                    <span>إجمالي المدفوع:</span>
                  </span>
                  <span className="font-extrabold text-blue-900">
                    {(patient.totalPaid || 0).toLocaleString()} SAR
                  </span>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="p-3 bg-white/70 backdrop-blur-sm border-t border-blue-50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>فتح الملف الطبي</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEditPatient(patient)}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  title="تعديل بيانات المريض"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setPatientToDelete(patient)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="حذف المريض"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-6 text-right space-y-4 border border-white/60" dir="rtl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-slate-900">تأكيد حذف ملف المريض</h3>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من رغبتك في حذف ملف المريض <strong>{patientToDelete.name}</strong> ({patientToDelete.fileNumber})؟
                سيتم حذف كافة الزيارات والأدوية والمدفوعات والمواعيد المرتبطة به نهائياً.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
