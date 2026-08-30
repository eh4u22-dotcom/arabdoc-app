import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { api } from '../lib/api';
import { X, UserPlus, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patient: Patient) => void;
  patientToEdit?: Patient | null;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patientToEdit,
}) => {
  const { openUpgradeModal } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    fileNumber: '',
    phone: '',
    dateOfBirth: '1990-01-01',
    gender: 'male' as 'male' | 'female',
    bloodType: '',
    chronicDiseases: '',
    allergies: '',
    emergencyContact: '',
    nationalId: '',
    address: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        name: patientToEdit.name || '',
        fileNumber: patientToEdit.fileNumber || '',
        phone: patientToEdit.phone || '',
        dateOfBirth: patientToEdit.dateOfBirth || '1990-01-01',
        gender: patientToEdit.gender || 'male',
        bloodType: patientToEdit.bloodType || '',
        chronicDiseases: patientToEdit.chronicDiseases || '',
        allergies: patientToEdit.allergies || '',
        emergencyContact: patientToEdit.emergencyContact || '',
        nationalId: patientToEdit.nationalId || '',
        address: patientToEdit.address || '',
        notes: patientToEdit.notes || '',
      });
    } else {
      setFormData({
        name: '',
        fileNumber: '',
        phone: '',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        bloodType: '',
        chronicDiseases: '',
        allergies: '',
        emergencyContact: '',
        nationalId: '',
        address: '',
        notes: '',
      });
    }
    setError(null);
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('يرجى إدخال اسم المريض ورقم الهاتف');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (patientToEdit) {
        const res = await api.updatePatient(patientToEdit.id, formData);
        onSuccess(res.patient);
        onClose();
      } else {
        const res = await api.createPatient(formData);
        onSuccess(res.patient);
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'LIMIT_REACHED') {
        onClose();
        openUpgradeModal();
      } else {
        setError(err.message || 'فشل حفظ بيانات المريض');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden text-right my-8"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100/60 bg-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              {patientToEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {patientToEdit ? 'تعديل بيانات المريض' : 'إضافة ملف مريض جديد'}
              </h3>
              <p className="text-xs text-slate-500">
                {patientToEdit ? 'تحديث المعلومات الشخصية والطبية' : 'تسجيل مريض جديد في قاعدة بيانات العيادة'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50/90 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                اسم المريض الثلاثي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: أحمد عبد الله الغامدي"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الجوال / الهاتف <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="مثال: 0501234567"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            {/* File Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم الملف الطبي (اختياري / تلقائي)
              </label>
              <input
                type="text"
                value={formData.fileNumber}
                onChange={e => setFormData({ ...formData, fileNumber: e.target.value })}
                placeholder="مثال: P-1005"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الجنس</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'male' })}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    formData.gender === 'male'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                      : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                  }`}
                >
                  ذكر 👨
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'female' })}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    formData.gender === 'female'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                      : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                  }`}
                >
                  أنثى 👩
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            {/* Blood Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">فصيلة الدم</label>
              <select
                value={formData.bloodType}
                onChange={e => setFormData({ ...formData, bloodType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              >
                <option value="">غير محدد</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Medical Alerts: Chronic & Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الأمراض المزمنة (إن وجدت)</label>
              <input
                type="text"
                value={formData.chronicDiseases}
                onChange={e => setFormData({ ...formData, chronicDiseases: e.target.value })}
                placeholder="مثال: سكري نوع 2، ضغط دم"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحساسية الدوائية / الغذائية</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="مثال: حساسية البنسلين، الأسبرين"
                className="w-full px-3.5 py-2.5 bg-rose-50/50 border border-rose-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Emergency & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">جهة الاتصال في الطوارئ</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="مثال: الأخ / 0551122334"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان / السكن</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="مثال: الرياض - حي الملقا"
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات عامة حول المريض</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="أي ملاحظات سريرية أو إدارية هامة..."
              className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null}
              <span>{patientToEdit ? 'حفظ التعديلات' : 'إضافة المريض'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
