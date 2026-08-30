import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { StarRating } from '../components/StarRating';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ChevronLeft,
  Search,
  Filter,
  User,
} from 'lucide-react';

interface CaseTrackerViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const CaseTrackerView: React.FC<CaseTrackerViewProps> = ({
  onSelectPatient,
}) => {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterScore, setFilterScore] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const data = await api.getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load cases', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = cases.filter(c => {
    if (search) {
      const matchName = c.patient.name.toLowerCase().includes(search.toLowerCase());
      const matchFile = c.patient.fileNumber.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchFile) return false;
    }

    if (filterScore === 'deteriorating') return c.score >= 1 && c.score <= 3;
    if (filterScore === 'weak') return c.score >= 4 && c.score <= 5;
    if (filterScore === 'moderate') return c.score >= 6 && c.score <= 7;
    if (filterScore === 'improved') return c.score >= 8;
    if (filterScore === 'urgent') return c.needsFollowUp;

    return true;
  });

  const deterioratingCount = cases.filter(c => c.score >= 1 && c.score <= 3).length;
  const weakCount = cases.filter(c => c.score >= 4 && c.score <= 5).length;
  const moderateCount = cases.filter(c => c.score >= 6 && c.score <= 7).length;
  const improvedCount = cases.filter(c => c.score >= 8).length;

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Category Summary Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterScore('deteriorating')}
          className={`p-4 rounded-3xl border text-right transition-all cursor-pointer backdrop-blur-xl ${
            filterScore === 'deteriorating'
              ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-300/60 shadow-xs'
              : 'bg-white/70 border-white/60 hover:bg-white/90 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold">تدهور (1-3)</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 mt-2 font-cairo">{deterioratingCount}</div>
          <span className="text-[11px] text-slate-400">تحتاج تعديل الخطة</span>
        </button>

        <button
          onClick={() => setFilterScore('weak')}
          className={`p-4 rounded-3xl border text-right transition-all cursor-pointer backdrop-blur-xl ${
            filterScore === 'weak'
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-300/60 shadow-xs'
              : 'bg-white/70 border-white/60 hover:bg-white/90 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold">ضعيفة (4-5)</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2 font-cairo">{weakCount}</div>
          <span className="text-[11px] text-slate-400">استجابة بطيئة</span>
        </button>

        <button
          onClick={() => setFilterScore('moderate')}
          className={`p-4 rounded-3xl border text-right transition-all cursor-pointer backdrop-blur-xl ${
            filterScore === 'moderate'
              ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-300/60 shadow-xs'
              : 'bg-white/70 border-white/60 hover:bg-white/90 hover:border-blue-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold">متوسطة (6-7)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800 mt-2 font-cairo">{moderateCount}</div>
          <span className="text-[11px] text-slate-400">تحسن تدريجي</span>
        </button>

        <button
          onClick={() => setFilterScore('improved')}
          className={`p-4 rounded-3xl border text-right transition-all cursor-pointer backdrop-blur-xl ${
            filterScore === 'improved'
              ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-300/60 shadow-xs'
              : 'bg-white/70 border-white/60 hover:bg-white/90 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold">تحسن جيد (8-10)</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-cairo">{improvedCount}</div>
          <span className="text-[11px] text-slate-400">استجابة ممتازة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-4 lg:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن مريض لمتابعة حالته السريرية..."
            className="w-full pr-10 pl-4 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">التصنيف:</span>
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">جميع الحالات المرضية</option>
            <option value="deteriorating">تدهور (1-3)</option>
            <option value="weak">ضعيفة (4-5)</option>
            <option value="moderate">متوسطة (6-7)</option>
            <option value="improved">تحسن ملحوظ (8-10)</option>
            <option value="urgent">تحتاج متابعة عاجلة (≤ 5)</option>
          </select>
        </div>
      </div>

      {/* Cases List Cards */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">جاري استرجاع تقييمات الحالات...</p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-12 text-center text-slate-400 text-sm shadow-xs">
          لا توجد حالات مسجلة مطابقة لمعايير التصفية.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map(item => (
            <div
              key={item.patient.id}
              onClick={() => onSelectPatient(item.patient.id)}
              className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/60 hover:border-blue-300 hover:bg-white/95 p-5 shadow-xs transition-all cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 group"
            >
              {/* Patient Basic Details */}
              <div className="flex items-center gap-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-900 font-extrabold text-lg flex items-center justify-center shrink-0 border border-blue-200">
                  {item.patient.name.substring(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                      {item.patient.name}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                      {item.patient.fileNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    الهاتف: <strong dir="ltr">{item.patient.phone}</strong> • إجمالي الزيارات: {item.visitsCount}
                  </p>
                </div>
              </div>

              {/* Latest Diagnosis & Trend */}
              <div className="flex-1 min-w-0 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">آخر تشخيص سريري:</span>
                <p className="text-slate-600 truncate font-medium">
                  {item.latestVisit ? item.latestVisit.diagnosis : 'لا توجد زيارة مسجلة'}
                </p>
                {item.latestVisit && (
                  <span className="text-[11px] text-slate-400">
                    تاريخ آخر فحص: {item.latestVisit.visitDate}
                  </span>
                )}
              </div>

              {/* Rating & Trend Badge */}
              <div className="flex items-center gap-6 self-end lg:self-center">
                <div className="text-left">
                  <StarRating score={item.score} size="sm" showBadge={true} />
                  <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-500 mt-1">
                    <span>مؤشر التطور:</span>
                    <strong className="text-blue-700">{item.trendText}</strong>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-xl bg-blue-50/70 group-hover:bg-blue-600 group-hover:text-white text-blue-500 flex items-center justify-center transition-colors shrink-0">
                  <ChevronLeft className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
