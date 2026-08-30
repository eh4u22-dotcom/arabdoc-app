import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  CreditCard,
  BarChart3,
  Settings,
  Crown,
  LogOut,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';

export type NavItem = 'dashboard' | 'patients' | 'appointments' | 'cases' | 'payments' | 'reports' | 'settings' | 'pricing';

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalPatientsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  totalPatientsCount = 0,
}) => {
  const { doctor, clinic, logout, openUpgradeModal } = useAuth();

  const navLinks: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'patients',
      label: 'المرضى',
      icon: <Users className="w-5 h-5" />,
      badge: totalPatientsCount > 0 ? `${totalPatientsCount}` : undefined,
    },
    { id: 'appointments', label: 'المواعيد', icon: <Calendar className="w-5 h-5" /> },
    { id: 'cases', label: 'متابعة الحالات', icon: <Activity className="w-5 h-5" /> },
    { id: 'payments', label: 'المدفوعات', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'reports', label: 'التقارير', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
  ];

  const isFreePlan = clinic?.plan === 'free';

  const handleNavClick = (id: NavItem) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-40 w-64 bg-white/70 backdrop-blur-xl border-l border-blue-100/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
        }`}
        dir="rtl"
      >
        {/* Brand / Logo */}
        <div className="p-5 border-b border-blue-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl text-blue-900 tracking-tight font-cairo">
                  ArabDoc
                </span>
              </div>
              <p className="text-[11px] text-blue-600/70 font-medium truncate max-w-[130px]">
                {clinic?.name || 'المنصة الطبية'}
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Quick Profile */}
        <div className="px-4 py-3 mx-3 my-2 bg-white/60 backdrop-blur-md border border-blue-100/70 rounded-xl flex items-center gap-3 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            {doctor?.avatar ? (
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{doctor?.name ? doctor.name.substring(0, 2) : 'ط'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate">{doctor?.name || 'الطبيب'}</h4>
            <p className="text-[11px] text-blue-600/80 truncate font-medium">{doctor?.specialty || 'استشاري'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navLinks.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-blue-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-blue-500/70'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100/70 text-blue-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Plan & Upgrade Card in Sidebar */}
        <div className="p-3 border-t border-blue-100/50">
          {isFreePlan ? (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="text-xs font-bold text-blue-900">الباقة المجانية</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-white/70 px-2 py-0.5 rounded-full border border-blue-200/50">
                  {totalPatientsCount}/3 مرضى
                </span>
              </div>
              <p className="text-[11px] text-blue-700/80 leading-relaxed">
                رصيدك متبقي له {Math.max(0, 3 - totalPatientsCount)} مريض. رَقِّ حسابك للوصول غير المحدود.
              </p>
              <button
                type="button"
                onClick={openUpgradeModal}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ترقية الحساب ($10/شهر)</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Crown className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">باقة غير محدودة</span>
                  <span className="text-[10px] text-emerald-700 font-medium">الوصول الكامل النشط</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          )}

          {/* Logout button */}
          <button
            type="button"
            onClick={logout}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};
