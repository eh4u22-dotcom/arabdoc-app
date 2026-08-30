import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types';
import { api } from '../lib/api';
import { StarRating } from '../components/StarRating';
import {
  Users,
  UserPlus,
  Calendar,
  Stethoscope,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronLeft,
  Activity,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onSelectPatient: (patientId: string) => void;
  onNavigate: (tab: any) => void;
  onOpenAddPatient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectPatient,
  onNavigate,
  onOpenAddPatient,
}) => {
  const { clinic, openUpgradeModal } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 mt-4">جاري تحميل بيانات العيادة والإحصائيات...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 lg:p-7 text-white relative overflow-hidden shadow-xl shadow-blue-500/15 border border-white/20">
        {/* Background glow circle */}
        <div className="absolute -left-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-3 backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>نظام ArabDoc الطبي السحابي الشامل</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold font-cairo">
            مرحباً بك، د. {clinic?.name ? clinic.name : 'الطبيب'}
          </h2>
          <p className="text-blue-100 text-xs lg:text-sm mt-1.5 leading-relaxed font-medium">
            نظام السجلات الطبية التراكمية، ومتابعة تطور الحالات الصحية بالنجوم، وجداول المواعيد والتحصيل المالي.
          </p>
        </div>

        {clinic?.plan === 'free' && (
          <div className="relative z-10 mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-blue-100">
              <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>
                أنت حالياً على الباقة المجانية ({stats.totalPatients} من 3 مرضى مسجلين).
              </span>
            </div>
            <button
              onClick={openUpgradeModal}
              className="px-4 py-2 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer"
            >
              ترقية للباقة غير المحدودة ($10)
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Grid (Frosted Glass with backdrop-blur-md) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div
          onClick={() => onNavigate('patients')}
          className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المرضى</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">{stats.totalPatients}</span>
            <span className="text-xs text-blue-600 font-bold">مريض مسجل</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">سعة الباقة: {clinic?.plan === 'premium' ? 'غير محدود' : '3 كحد أقصى'}</div>
        </div>

        {/* New Patients This Month */}
        <div className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مرضى جدد هذا الشهر</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-emerald-700">+{stats.newPatientsThisMonth}</span>
            <span className="text-xs text-slate-500 font-medium">مريض جديد</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>تسجيل مستمر</span>
          </div>
        </div>

        {/* Today Appointments */}
        <div
          onClick={() => onNavigate('appointments')}
          className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مواعيد اليوم</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">{stats.todayAppointmentsCount}</span>
            <span className="text-xs text-sky-700 font-bold">موعد مجدول</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">في انتظار الكشف أو المتابعة</div>
        </div>

        {/* Today Visits */}
        <div className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">زيارات اليوم</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-indigo-700">{stats.todayVisitsCount}</span>
            <span className="text-xs text-slate-500 font-medium">زيارة تمت</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">مسجلة في السجل الزمني</div>
        </div>

        {/* Total Revenue */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المدفوعات</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-blue-900">
              {stats.totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-bold">SAR</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-semibold">محصلة نقدياً وعبر البطاقات</div>
        </div>

        {/* Pending Debt */}
        <div
          onClick={() => onNavigate('payments')}
          className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المبالغ المستحقة (الذمم)</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-rose-600">
              {stats.totalPendingBalance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-bold">SAR</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500 font-semibold">مبالغ مؤجلة قيد التحصيل</div>
        </div>

        {/* Flagged Cases */}
        <div
          onClick={() => onNavigate('cases')}
          className="p-5 bg-white/65 backdrop-blur-md border border-white/60 hover:bg-white/85 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">حالات تحتاج متابعة</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold text-amber-600">{stats.flaggedCasesCount}</span>
            <span className="text-xs text-slate-500 font-medium">حالة صحية</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 font-semibold">تقييم الحالة ≤ 5/10</div>
        </div>

        {/* Clinic Performance Card (Frosted Gradient) */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-blue-500/15 flex flex-col justify-between border border-white/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-100">مؤشر أداء العيادة</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">ممتاز</span>
            </div>
            <div className="text-2xl lg:text-3xl font-black mt-2">
              {stats.totalPatients > 0 ? '94%' : '100%'}
            </div>
          </div>
          <div className="space-y-1.5 mt-3">
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[94%] rounded-full"></div>
            </div>
            <p className="text-[10px] text-blue-100 opacity-90">متابعة نشطة للمرضى والتحسن</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Patients & Today Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients List (2 Columns) */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100/50">
            <div>
              <h3 className="font-bold text-blue-950 text-base flex items-center gap-2">
                <span className="p-1.5 bg-blue-100/70 text-blue-600 rounded-xl">🩺</span>
                <span>آخر المرضى المسجلين والمحدثين</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">سجل المرضى وتاريخ آخر زيارة وتقييم الحالة السريرية</p>
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
            >
              <span>عرض السجل الكامل</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.recentPatients.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">لا يوجد مرضى مسجلين حتى الآن.</div>
            ) : (
              stats.recentPatients.map(patient => (
                <div
                  key={patient.id}
                  onClick={() => onSelectPatient(patient.id)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-50 bg-white/80 backdrop-blur-sm hover:bg-blue-50/60 hover:border-blue-200 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center shrink-0 border border-blue-200/50">
                      {patient.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                          {patient.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {patient.fileNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {patient.phone} • {patient.gender === 'female' ? 'أنثى' : 'ذكر'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {patient.currentConditionScore ? (
                      <div className="hidden sm:block text-left">
                        <StarRating
                          score={patient.currentConditionScore}
                          size="sm"
                          showBadge={true}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">لم تُسجل زيارة بعد</span>
                    )}

                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today Appointments List (1 Column) */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100/50">
            <div>
              <h3 className="font-bold text-blue-950 text-base flex items-center gap-2">
                <span className="p-1.5 bg-blue-100/70 text-blue-600 rounded-xl">📅</span>
                <span>مواعيد اليوم</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">حجوزات واستشارات اليوم</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-100 transition-colors"
            >
              <span>الجدول</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {stats.todayAppointments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                <p>لا توجد مواعيد مجدولة لليوم.</p>
              </div>
            ) : (
              stats.todayAppointments.map(apt => (
                <div
                  key={apt.id}
                  onClick={() => apt.patientId && onSelectPatient(apt.patientId)}
                  className="p-3.5 rounded-2xl border border-blue-50 bg-white/80 backdrop-blur-sm hover:bg-blue-50/60 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{apt.patientName}</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.appointmentTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>{apt.type === 'follow_up' ? 'متابعة كشف' : apt.type === 'urgent' ? 'طارئ' : 'كشف عام'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {apt.status === 'confirmed' ? 'مؤكد' : 'مجدول'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
