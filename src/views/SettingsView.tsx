import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  Settings,
  User,
  Building2,
  Crown,
  Download,
  Database,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { doctor, clinic, updateProfile, openUpgradeModal } = useAuth();

  const [doctorName, setDoctorName] = useState(doctor?.name || '');
  const [specialty, setSpecialty] = useState(doctor?.specialty || 'استشاري طب عام وجراحة');
  const [phone, setPhone] = useState(doctor?.phone || '');
  const [clinicName, setClinicName] = useState(clinic?.name || 'العيادة التخصصية');
  const [address, setAddress] = useState(clinic?.address || 'الرياض، المملكة العربية السعودية');
  const [currency, setCurrency] = useState(clinic?.currency || 'SAR');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await updateProfile({
        doctorName,
        specialty,
        phone,
        clinicName,
        address,
        currency,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arabdoc-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data', err);
    }
  };

  const specialtiesList = [
    'طب عام وجراحة',
    'الباطنة والقلب',
    'طب وجراحة الفم والأسنان',
    'الجلدية والتجميل والليزر',
    'الأطفال وحديثي الولادة',
    'النساء والولادة وتأخر الإنجاب',
    'العظام والمفاصل والعمود الفقري',
    'العيون وجراحة القرنية',
    'الأنف والأذن والحنجرة',
    'المخ والأعصاب والطب النفسي',
    'المسالك البولية والتناسلية',
    'العلاج الطبيعي والتأهيل',
    'أخرى (تخصص مخصص)',
  ];

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto" dir="rtl">
      {savedSuccess && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>تم حفظ تحديثات الإعدادات والملف المهني بنجاح!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50/90 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-blue-100/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
              <Crown className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">باقة الاشتراك والترخيص</h3>
              <p className="text-xs text-slate-500">حالة خطة العيادة وسعة تخزين ملفات المرضى</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold ${
              clinic?.plan === 'premium'
                ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100/80 text-amber-900 border border-amber-200'
            }`}
          >
            {clinic?.plan === 'premium' ? 'الباقة غير المحدودة (نشطة)' : 'الباقة المجانية (Free Plan)'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 space-y-1">
            <p>
              السعة الحالية:{' '}
              <strong className="text-slate-800">
                {clinic?.plan === 'premium' ? 'مرضى غير محدودين' : '3 مرضى كحد أقصى'}
              </strong>
            </p>
            <p className="text-slate-400">
              مهيأ للتكامل مع مشتريات تطبيق الأندرويد الرسمي على متجر Google Play.
            </p>
          </div>

          {clinic?.plan === 'free' ? (
            <button
              onClick={openUpgradeModal}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ترقية الآن ($10/شهرياً)</span>
            </button>
          ) : (
            <div className="text-emerald-700 text-xs font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>حسابك مفعل بأعلى باقة</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Doctor & Clinic Profile */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-blue-100/60">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>بيانات الطبيب والعيادة</span>
            </h3>
            <p className="text-xs text-slate-500">
              تظهر هذه البيانات في ترويسة التقارير والروشتات الطبية المطبوعة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب</label>
              <input
                type="text"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                التخصص الطبي (شامل لجميع التخصصات)
              </label>
              <select
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              >
                {specialtiesList.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم العيادة أو المركز</label>
              <input
                type="text"
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف العيادة</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                dir="ltr"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان وموقع العيادة</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-blue-100/60 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Backup and Data Export */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-blue-100/60">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>النسخ الاحتياطي وتصدير البيانات</span>
          </h3>
          <p className="text-xs text-slate-500">
            تصدير قاعدة بيانات المرضى والسجلات الطبية كاملة بصيغة JSON آمنة
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 space-y-1">
            <p>يمكنك تنزيل نسخة احتياطية من جميع السجلات الطبية والزيارات في أي وقت.</p>
            <p className="text-slate-400">ملف مشفر وسهل الاستعادة لحماية بيانات عيادتك.</p>
          </div>

          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-white/80 hover:bg-white border border-blue-100 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تنزيل النسخة الاحتياطية (JSON)</span>
          </button>
        </div>
      </div>

      {/* Android Readiness Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 to-blue-950/90 backdrop-blur-xl text-white rounded-3xl p-6 shadow-md border border-white/10 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-blue-200">
            جاهزية تطبيق الأندرويد (Google Play Ready)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            تمت هندسة ArabDoc كمنصة سحابية متوافقة بالكامل مع واجهات برمجة تطبيقات تطبيقات الأندرويد
            وأنظمة الدفع عبر Google Play Billing، مما يتيح للأطباء إدارة عياداتهم من الهاتف أو المتصفح بسلاسة.
          </p>
        </div>
      </div>
    </div>
  );
};
