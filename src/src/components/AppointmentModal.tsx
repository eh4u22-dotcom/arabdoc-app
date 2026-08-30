import React, { useState, useEffect } from 'react';
import { Appointment, Patient } from '../types';
import { api } from '../lib/api';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (apt: Appointment) => void;
  patients: Patient[];
  preselectedPatientId?: string;
  appointmentToEdit?: Appointment | null;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  patients,
  preselectedPatientId,
  appointmentToEdit,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [appointmentDate, setAppointmentDate] = useState(today);
  const [appointmentTime, setAppointmentTime] = useState('17:00');
  const [type, setType] = useState<'new_examination' | 'follow_up' | 'consultation' | 'urgent'>('follow_up');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentToEdit) {
      setPatientId(appointmentToEdit.patientId);
      setAppointmentDate(appointmentToEdit.appointmentDate);
      setAppointmentTime(appointmentToEdit.appointmentTime || '17:00');
      setType(appointmentToEdit.type);
      setNotes(appointmentToEdit.notes || '');
    } else {
      setPatientId(preselectedPatientId || (patients.length > 0 ? patients[0].id : ''));
      setAppointmentDate(today);
      setAppointmentTime('17:00');
      setType('follow_up');
      setNotes('');
    }
    setError(null);
  }, [appointmentToEdit, preselectedPatientId, isOpen, patients]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !appointmentDate) {
      setError('يرجى اختيار المريض وتحديد تاريخ الموعد');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (appointmentToEdit) {
        const res = await api.updateAppointment(appointmentToEdit.id, {
          patientId,
          appointmentDate,
          appointmentTime,
          type,
          notes,
        });
        onSuccess(res.appointment);
      } else {
        const res = await api.createAppointment({
          patientId,
          appointmentDate,
          appointmentTime,
          type,
          notes,
        });
        onSuccess(res.appointment);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الموعد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div
        className="relative w-full max-w-lg bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden text-right"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100/60 bg-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {appointmentToEdit ? 'تعديل بيانات الموعد' : 'حجز موعد مريض جديد'}
              </h3>
              <p className="text-xs text-slate-500">تنظيم جدول مواعيد وحجوزات العيادة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50/90 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اختر المريض <span className="text-rose-500">*</span>
            </label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
            >
              <option value="">-- اختر مريضاً من القائمة --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.fileNumber}) - {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الموعد</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت الموعد</label>
              <div className="relative">
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={e => setAppointmentTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">نوع الموعد</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('new_examination')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'new_examination'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                كشف جديد
              </button>
              <button
                type="button"
                onClick={() => setType('follow_up')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'follow_up'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                متابعة / إعادة كشف
              </button>
              <button
                type="button"
                onClick={() => setType('consultation')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'consultation'
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                    : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                استشارة طبية
              </button>
              <button
                type="button"
                onClick={() => setType('urgent')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'urgent'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold shadow-xs'
                    : 'border-blue-100 bg-white/50 text-slate-600 hover:bg-white/80'
                }`}
              >
                حالة عاجلة / طارئة
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الموعد</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: فحص نتائج التحاليل، تجديد الوصفة..."
              className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
            />
          </div>

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
              <span>{appointmentToEdit ? 'حفظ التعديلات' : 'تأكيد الحجز'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
