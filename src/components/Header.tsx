import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Plus, Calendar, Crown, ShieldAlert } from 'lucide-react';
import { NavItem } from './Sidebar';

interface HeaderProps {
  currentTab: NavItem;
  onOpenMobileSidebar: () => void;
  onOpenAddPatient: () => void;
  onOpenAddAppointment: () => void;
  selectedPatientName?: string | null;
  onBackToPatients?: () => void;
}

const titles: Record<NavItem, { title: string; subtitle: string }> = {
  dashboard: { title: 'لوحة التحكم الرئيسية', subtitle: 'نظرة عامة على نشاط العيادة والمرضى والمواعيد اليوم' },
  patients: { title: 'سجل المرضى', subtitle: 'إدارة ملفات المراجعين والتاريخ الطبي والبحث والتصفية' },
  appointments: { title: 'جدول المواعيد', subtitle: 'مواعيد الكشوفات والمراجعات والاستشارات القادمة' },
  cases: { title: 'متابعة تطور الحالات', subtitle: 'مراقبة تحسن المرضى وتحديد الحالات التي تحتاج عناية خاصة' },
  payments: { title: 'السجل المالي والمدفوعات', subtitle: 'متابعة الإيرادات والمبالغ المحصلة والذمم المتبقية' },
  reports: { title: 'التقارير والإحصائيات', subtitle: 'تحليلات الأداء السريري ومعدلات الشفاء والإيرادات' },
  settings: { title: 'إعدادات العيادة والحساب', subtitle: 'تخصيص الملف المهني، وتفاصيل العيادة، والنسخ الاحتياطي' },
  pricing: { title: 'الاشتراكات والأسعار', subtitle: 'باقات الخدمة وإدارة السعة' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenAddPatient,
  onOpenAddAppointment,
  selectedPatientName,
  onBackToPatients,
}) => {
  const { clinic, openUpgradeModal } = useAuth();
  const currentInfo = titles[currentTab] || { title: 'ArabDoc', subtitle: 'النظام الطبي' };

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-blue-100/80 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs" dir="rtl">
      {/* Right side: Mobile Menu + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-blue-50/80 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          {selectedPatientName && currentTab === 'patients' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToPatients}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors cursor-pointer"
              >
                ← العودة للمرضى
              </button>
              <h1 className="text-lg lg:text-xl font-extrabold text-blue-950 font-cairo">
                الملف الطبي: {selectedPatientName}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-lg lg:text-xl font-extrabold text-blue-950 font-cairo">
                {currentInfo.title}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {currentInfo.subtitle}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Left side: Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {clinic?.plan === 'free' && (
          <button
            onClick={openUpgradeModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/90 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer backdrop-blur-xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>باقة مجانية (ترقية)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddAppointment}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 border border-blue-100 text-xs font-bold transition-all shadow-2xs cursor-pointer backdrop-blur-sm"
          title="حجز موعد"
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">حجز موعد</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddPatient}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مريض</span>
        </button>
      </div>
    </header>
  );
};
