import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  HeartPulse,
  DollarSign,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await api.getReports();
      setReportData(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-2">جاري إعداد التقارير السريرية والمالية...</p>
      </div>
    );
  }

  if (!reportData) return null;

  const COLORS = ['#e11d48', '#f59e0b', '#0284c7', '#10b981'];

  const conditionPieData = [
    { name: 'تدهور (1-3)', value: reportData.scoreDistribution?.deteriorating || 0 },
    { name: 'ضعيفة (4-5)', value: reportData.scoreDistribution?.weak || 0 },
    { name: 'متوسطة (6-7)', value: reportData.scoreDistribution?.moderate || 0 },
    { name: 'تحسن (8-10)', value: reportData.scoreDistribution?.improved || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Top Clinical & Financial KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Recovery Rate */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">معدل التحسن السريري</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-700">
              {reportData.recoveryRate || 85}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">نسبة المرضى ذوي تقييم 6 نجوم فأكثر</p>
        </div>

        {/* Total Visits */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">إجمالي الكشوفات والزيارات</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-blue-900">
              {reportData.totalVisits || 0}
            </span>
            <span className="text-xs text-slate-500">زيارة</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">مسجلة في السجل الزمني</p>
        </div>

        {/* Total Collected */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">إجمالي الإيرادات</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-sky-800">
              {(reportData.totalRevenue || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-bold">SAR</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">المحصل الفعلي</p>
        </div>

        {/* Avg Visit Price */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">متوسط قيمة الكشف</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-amber-800">
              {reportData.avgVisitAmount || 150}
            </span>
            <span className="text-xs text-slate-500 font-bold">SAR</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">لكل زيارة مريض</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Condition Distribution Chart */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-4 shadow-xs">
          <div className="pb-2 border-b border-blue-100/60">
            <h3 className="font-bold text-slate-900 text-base">توزيع الحالات الصحية السريرية</h3>
            <p className="text-xs text-slate-500">تصنيف المرضى حسب تقييم النجوم (1 إلى 10)</p>
          </div>

          <div className="h-64 flex items-center justify-center" dir="ltr">
            {conditionPieData.length === 0 ? (
              <p className="text-xs text-slate-400">لا توجد بيانات كافية</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {conditionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/90 backdrop-blur-md text-white p-2.5 rounded-2xl text-xs text-right border border-white/10" dir="rtl">
                            <span className="font-bold">{data.name}: </span>
                            <span className="font-extrabold">{data.value} مريض</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-100/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-700">تحسن جيد (8-10)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500"></span>
              <span className="text-slate-700">متوسطة (6-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-700">ضعيفة (4-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-700">تدهور (1-3)</span>
            </div>
          </div>
        </div>

        {/* Monthly Visits / Revenue */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 space-y-4 shadow-xs">
          <div className="pb-2 border-b border-blue-100/60">
            <h3 className="font-bold text-slate-900 text-base">نشاط الكشوفات والزيارات الشهرية</h3>
            <p className="text-xs text-slate-500">معدل مراجعات العيادة عبر الأشهر</p>
          </div>

          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.monthlyVisits || [
                  { month: 'مايو', count: 18 },
                  { month: 'يونيو', count: 24 },
                  { month: 'يوليو', count: 32 },
                  { month: 'أغسطس', count: 45 },
                ]}
                margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/90 backdrop-blur-md text-white p-2.5 rounded-2xl text-xs text-right border border-white/10" dir="rtl">
                          <p className="font-bold">{data.month}</p>
                          <p className="text-blue-300 font-extrabold">{data.count} كشف طبي</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
