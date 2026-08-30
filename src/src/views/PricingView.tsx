import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  Check,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Zap,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';

export const PricingView: React.FC = () => {
  const { clinic, openUpgradeModal } = useAuth();
  const isFreePlan = clinic?.plan === 'free';

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-5xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md text-blue-800 text-xs font-bold border border-blue-100/80 shadow-xs">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>باقات ArabDoc المرنة لجميع التخصصات الطبية</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-cairo">
          اختر الباقة المناسبة لحجم ونشاط عيادتك
        </h2>
        <p className="text-xs lg:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          نظام طبي متكامل مصمم للأطباء من كافة التخصصات. ابدأ مجاناً وجرب كافة الميزات ثم رَقِّ مع توسع عيادتك.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 lg:p-8 shadow-xs flex flex-col justify-between relative space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">الباقة المجانية التجريبية</h3>
                <p className="text-xs text-slate-500 mt-0.5">لتجربة النظام واختبار كافة الخصائص السريرية</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shadow-xs">
                مجاناً
              </div>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-blue-100/60">
              <span className="text-3xl lg:text-4xl font-extrabold text-slate-900">$0</span>
              <span className="text-xs text-slate-500 font-semibold">/ مجاناً مدى الحياة</span>
            </div>

            {/* Features List */}
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>إدارة حتى <strong className="text-slate-900">3 مرضى</strong> بكافة تفاصيلهم</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>السجل الطبي الزمني الكامل (Medical Timeline)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>تقييم الحالة الصحية بنظام النجوم (1 إلى 10)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>سجل الأدوية والجرعات والتعليمات الطبية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>جدول المواعيد وإدارة الحجوزات اليومية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>متابعة المدفوعات والمبالغ المستحقة</span>
              </li>
            </ul>
          </div>

          <button
            disabled={isFreePlan}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
              isFreePlan
                ? 'bg-slate-100/80 text-slate-500 cursor-default border border-slate-200/50'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20'
            }`}
          >
            {isFreePlan ? 'باقتك الحالية' : 'الباقة الأساسية'}
          </button>
        </div>

        {/* Pro / Premium Plan Card */}
        <div className="bg-gradient-to-b from-blue-900/95 via-indigo-950/95 to-slate-900/95 backdrop-blur-xl text-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-blue-950/20 flex flex-col justify-between relative space-y-6 overflow-hidden border border-blue-400/30">
          <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            الأكثر طلباً
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">الباقة الاحترافية غير المحدودة</h3>
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">للعيادات والمراكز الطبية النشطة</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-blue-800/60">
              <span className="text-3xl lg:text-4xl font-extrabold text-white">$10</span>
              <span className="text-xs text-blue-200 font-semibold">/ شهرياً (أو ما يعادله بالعملة المحلية)</span>
            </div>

            {/* Features List */}
            <ul className="space-y-3 text-xs text-blue-100">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">عدد غير محدود من ملفات المرضى والسجلات</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>كافة ميزات السجل الطبي الزمني والتقييمات التراكمية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>مخططات بيانية متقدمة لتطور وشفاء الحالات السريرية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>طباعة تقارير الزيارات والروشتات الطبية الرسمية</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تصدير واستعادة النسخ الاحتياطية لقاعدة البيانات (JSON)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>متوافق مع الدفع المباشر عبر Google Play وتطبيق الأندرويد</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>دعم فني وأولوية التحديثات المستمرة</span>
              </li>
            </ul>
          </div>

          <button
            onClick={openUpgradeModal}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-900" />
            <span>{clinic?.plan === 'premium' ? 'حسابك مفعل بالباقة الاحترافية' : 'ترقية الحساب الآن ($10/شهر)'}</span>
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-6 lg:p-8 space-y-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>الأسئلة الشائعة حول الاشتراكات</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/60 border border-blue-100/70 space-y-1">
            <h4 className="font-bold text-slate-900">هل النظام مناسب لجميع التخصصات الطبية؟</h4>
            <p className="text-slate-600 leading-relaxed">
              نعم، تم تصميم ArabDoc كنظام طبي عالمي شامل (Universal Medical EHR) يلائم أطباء الباطنة، الأسنان، الجلدية، الأطفال، الجراحة، والعيون وكافة التخصصات دون حصر.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-blue-100/70 space-y-1">
            <h4 className="font-bold text-slate-900">كيف يتم تحصيل الاشتراك في تطبيق الأندرويد؟</h4>
            <p className="text-slate-600 leading-relaxed">
              تم تجهيز النظام ليدعم الشراء المباشر عبر متجر Google Play الرسمي بمجرد طرح التطبيق على الأجهزة الذكية.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-blue-100/70 space-y-1">
            <h4 className="font-bold text-slate-900">هل يمكنني تجربة كافة الميزات قبل الترقية؟</h4>
            <p className="text-slate-600 leading-relaxed">
              بالتأكيد، الباقة المجانية تتيح لك استخدام 100% من ميزات المنصة حتى 3 مرضى لتتأكد من ملاءمتها الكاملة لعيادتك.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-blue-100/70 space-y-1">
            <h4 className="font-bold text-slate-900">هل بيانات مرضاي آمنة ومشفرة؟</h4>
            <p className="text-slate-600 leading-relaxed">
              نعم، تعتمد المنصة تشفيراً دقيقاً لكافة السجلات وتتيح لك تصدير نسخة احتياطية محلية من بياناتك في أي وقت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
