import React, { useState, useEffect } from 'react';
import { Appointment, Patient } from '../types';
import { api } from '../lib/api';
import { AppointmentModal } from '../components/AppointmentModal';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Trash2,
  Filter,
} from 'lucide-react';

interface AppointmentsViewProps {
  onSelectPatient: (patientId: string) => void;
  onOpenAddAppointment: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onSelectPatient,
  onOpenAddAppointment,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Edit/Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [apts, patsRes] = await Promise.all([
        api.getAppointments(),
        api.getPatients(),
      ]);
      setAppointments(apts);
      setPatients(patsRes.patients);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: any) => {
    try {
      await api.updateAppointment(id, { status });
      setAppointments(
        appointments.map(a => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete appointment', err);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (selectedDate && a.appointmentDate !== selectedDate) return false;
    return true;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Top Filter & Actions */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-4 lg:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">التاريخ:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                عرض الكل
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">الحالة:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">جميع الحالات</option>
              <option value="scheduled">مجدول (Scheduled)</option>
              <option value="confirmed">مؤكد (Confirmed)</option>
              <option value="completed">مكتمل (Completed)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setAppointmentToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>حجز موعد جديد</span>
        </button>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">جاري استرجاع المواعيد...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">لا توجد مواعيد مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            يمكنك حجز موعد جديد للمريض مع تحديد الوقت ونوع الكشف.
          </p>
          <button
            onClick={() => {
              setAppointmentToEdit(null);
              setIsModalOpen(true);
            }}
            className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            + حجز موعد الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map(apt => (
            <div
              key={apt.id}
              className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/60 hover:border-blue-300 hover:bg-white/90 p-5 shadow-xs transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-blue-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 text-sm">{apt.appointmentDate}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50/80 text-blue-800 border border-blue-100 flex items-center gap-1" dir="ltr">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span>{apt.appointmentTime}</span>
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      apt.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : apt.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {apt.status === 'completed'
                      ? 'مكتمل'
                      : apt.status === 'cancelled'
                      ? 'ملغي'
                      : apt.status === 'confirmed'
                      ? 'مؤكد'
                      : 'مجدول'}
                  </span>
                </div>

                {/* Patient Info */}
                <div
                  onClick={() => apt.patientId && onSelectPatient(apt.patientId)}
                  className="mt-3 cursor-pointer group"
                >
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                    {apt.patientName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-blue-100 font-semibold text-slate-700">
                      {apt.patientFileNumber || '-'}
                    </span>
                    <span dir="ltr">{apt.patientPhone}</span>
                  </div>
                </div>

                {/* Type & Notes */}
                <div className="mt-3 text-xs space-y-1">
                  <span className="font-semibold text-slate-600 block">
                    النوع: {apt.type === 'follow_up' ? 'متابعة / إعادة كشف' : apt.type === 'urgent' ? 'حالة طارئة' : 'كشف جديد'}
                  </span>
                  {apt.notes && (
                    <p className="text-slate-600 bg-blue-50/40 p-2.5 rounded-xl border border-blue-50 text-[11px] italic">
                      {apt.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-3 border-t border-blue-50 flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1">
                  {apt.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'completed')}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      إتمام
                    </button>
                  )}
                  {apt.status !== 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      تأكيد
                    </button>
                  )}
                  {apt.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-[11px] cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(apt.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="حذف الموعد"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        appointmentToEdit={appointmentToEdit}
        onSuccess={() => fetchData()}
      />
    </div>
  );
};
