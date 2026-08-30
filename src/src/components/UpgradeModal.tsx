import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, Check, Zap, Sparkles, X, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeToPremium, clinic } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await upgradeToPremium();
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        setSuccess(false);
        closeUpgradeModal();
      }, 1600);
    } catch (err) {
      console.error('Upgrade failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isAlreadyPremium = clinic?.plan === 'premium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden text-right"
        dir="rtl"
      >
        {/* Header background banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
          <button
            onClick={closeUpgradeModal}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
            <Crown className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>
          <h3 className="text-2xl font-bold font-cairo">ترقية إلى باقة الطبيب المحترف</h3>
          <p className="text-blue-100 text-sm mt-1">
            افتح السعة الكاملة لعيادتك مع إدارة غير محدودة للمرضى
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Price Tag Card */}
          <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                الباقة الاحترافية (Premium)
              </span>
              <h4 className="text-xl font-bold text-slate-800 mt-1">وصول كامل ومستمر</h4>
            </div>
            <div className="text-left" dir="ltr">
              <span className="text-3xl font-extrabold text-blue-700">$10</span>
              <span className="text-slate-500 text-xs font-medium"> / شهرياً</span>
            </div>
          </div>

          {/* Features checklist */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 text-slate-700 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">مرضى غير محدودين:</span> إضافة وتوثيق ملفات كافة مراجعي العيادة بدون أي حد أقصى.
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">سجل زمني متقدم:</span> متابعة تطور الحالات الصحية ومخطط تحسن النجوم 1-10 لكل زيارة.
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">إدارة الأدوية والمدفوعات:</span> سجل تراكمي للوصفات الطبية والمستحقات المالية.
              </div>
            </div>

            <div className="flex items-start gap-3 text-slate-700 text-sm">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-slate-900">جاهز للتطبيق المحمول:</span> متوافق مع نظام الاشتراكات عبر Google Play Billing قريباً.
              </div>
            </div>
          </div>

          {/* Android Google Play Notice */}
          <div className="bg-white/60 border border-blue-100 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              نظام الفوترة المباشر مفعل تجريبياً للنسخة الحالية، وسيرتبط مباشرة مع حسابك في متجر Google Play عند إطلاق التطبيق.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2">
            {isAlreadyPremium ? (
              <div className="text-center py-3 bg-emerald-50/80 text-emerald-700 rounded-2xl font-bold text-sm border border-emerald-200">
                عيادتك مفعلة بالفعل على الباقة الاحترافية (Unlimited) 🎉
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={isProcessing || success}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {success ? (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>تمت الترقية بنجاح! مبروك 🎉</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تفعيل الاشتراك...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                    <span>تفعيل الباقة الاحترافية الآن ($10/شهر)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
