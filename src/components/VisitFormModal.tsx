import React, { useState } from 'react';
import { api } from '../lib/api';
import { StarRating } from './StarRating';
import { X, Plus, Trash2, Stethoscope, DollarSign, Calendar, Pill, AlertCircle } from 'lucide-react';
import { Visit } from '../types';

interface VisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSuccess: (visit: Visit) => void;
}

interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export const VisitFormModal: React.FC<VisitFormModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [visitDate, setVisitDate] = useState(today);
  const [caseDescription, setCaseDescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [conditionScore, setConditionScore] = useState<number>(6);
  const [isImproved, setIsImproved] = useState<boolean>(true);
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');

  // Medications list
  const [medications, setMedications] = useState<MedicationInput[]>([
    { name: '', dosage: '', frequency: '', duration: '', notes: '' },
  ]);

  // Payment
  const [amountPaid, setAmountPaid] = useState<string>('150');
  const [remainingAmount, setRemainingAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'other'>('cash');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '', notes: '' },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: keyof MedicationInput, val: string) => {
    const updated = [...medications];
    updated[index][field] = val;
    setMedications(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseDescription.trim() || !diagnosis.trim() || !treatment.trim()) {
      setError('يرجى ملء الحقول الأساسية: وصف الحالة، التشخيص، وخطة العلاج');
      return;
    }

    setIsLoading(true);
    setError(null);

    const validMedications = medications.filter(m => m.name.trim() !== '');

    try {
      const res = await api.createVisit(patientId, {
        visitDate,
        caseDescription,
        diagnosis,
        treatment,
        doctorNotes,
        conditionScore,
        isImproved,
        followUpInstructions,
        nextAppointmentDate: nextAppointmentDate || null,
        medications: validMedications,
        payment: {
          amountPaid: Number(amountPaid) || 0,
          remainingAmount: Number(remainingAmount) || 0,
          paymentMethod,
        },
      });

      onSuccess(res.visit);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل حفظ بيانات الزيارة');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden text-right my-8 max-h-[92vh] flex flex-col"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100/60 bg-white/40 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">تسجيل زيارة طبية جديدة</h3>
              <p className="text-xs text-slate-500 font-medium">المريض: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 bg-rose-50/90 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Visit Info & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 p-4 rounded-2xl border border-blue-100/60">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ الزيارة <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={visitDate}
                  onChange={e => setVisitDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/80 border border-blue-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            {/* Condition Rating (1 to 10) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تقييم حالة المريض (1 إلى 10) <span className="text-rose-500">*</span>
              </label>
              <div className="bg-white/80 p-2 border border-blue-100 rounded-xl flex items-center justify-between">
                <StarRating
                  score={conditionScore}
                  interactive={true}
                  onChange={val => setConditionScore(val)}
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* Improvement Checkbox / Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <span className="text-sm font-bold text-slate-800">هل حدث تحسن في الحالة مقارنة بالزيارات السابقة؟</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsImproved(true)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isImproved ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-white/80 text-slate-600 border border-blue-100 hover:bg-white'
                }`}
              >
                نعم 👍
              </button>
              <button
                type="button"
                onClick={() => setIsImproved(false)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isImproved ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20' : 'bg-white/80 text-slate-600 border border-blue-100 hover:bg-white'
                }`}
              >
                لا / لم يتغير
              </button>
            </div>
          </div>

          {/* Section 2: Clinical Description, Diagnosis, Treatment */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                وصف الحالة والأعراض المشكو منها <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={caseDescription}
                onChange={e => setCaseDescription(e.target.value)}
                placeholder="تفاصيل شكوى المريض، شدة الأعراض، وتاريخ بدايتها..."
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التشخيص الطبي <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  placeholder="التشخيص النهائي أو المبدئي ونتائج الفحص..."
                  className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  خطة العلاج والإجراءات السريرية <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}
                  placeholder="الإجراءات المتخذة في العيادة، جلسات العلاج، والتدخلات..."
                  className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات الطبيب الخاصة</label>
              <input
                type="text"
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                placeholder="ملاحظات سريرية أو ملاحظات متابعة خاصة..."
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Section 3: Medications Repeater */}
          <div className="border border-blue-100/80 rounded-2xl p-4 bg-white/50 backdrop-blur-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-800">الأدوية الموصوفة في هذه الزيارة</h4>
              </div>
              <button
                type="button"
                onClick={handleAddMedication}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100/70 hover:bg-blue-200/70 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة دواء آخر</span>
              </button>
            </div>

            {medications.map((med, index) => (
              <div
                key={index}
                className="bg-white/80 border border-blue-100 rounded-2xl p-3.5 space-y-2 relative shadow-xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-blue-50 text-xs font-semibold text-slate-500">
                  <span>الدواء #{index + 1}</span>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف الدواء"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الدواء</label>
                    <input
                      type="text"
                      placeholder="مثال: Augmentin"
                      value={med.name}
                      onChange={e => handleMedChange(index, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/70 border border-blue-100 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الجرعة</label>
                    <input
                      type="text"
                      placeholder="مثال: 500 ملغ"
                      value={med.dosage}
                      onChange={e => handleMedChange(index, 'dosage', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/70 border border-blue-100 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">عدد المرات / التكرار</label>
                    <input
                      type="text"
                      placeholder="مثال: مرتين يومياً بعد الأكل"
                      value={med.frequency}
                      onChange={e => handleMedChange(index, 'frequency', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/70 border border-blue-100 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">مدة العلاج</label>
                    <input
                      type="text"
                      placeholder="مثال: 7 أيام"
                      value={med.duration}
                      onChange={e => handleMedChange(index, 'duration', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white/70 border border-blue-100 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">ملاحظات وتعليمات الاستعمال</label>
                  <input
                    type="text"
                    placeholder="مثال: مع شرب كمية وافرة من الماء، تجنب القيادة بعد تناوله..."
                    value={med.notes}
                    onChange={e => handleMedChange(index, 'notes', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white/70 border border-blue-100 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Payment Details */}
          <div className="border border-blue-100/80 rounded-2xl p-4 bg-white/50 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-800">بيانات الفوترة والتحصيل المالي للزيارة</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المدفوع (SAR)</label>
                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/80 border border-blue-100 rounded-xl text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المتبقي (آجل / ذمم)</label>
                <input
                  type="number"
                  min="0"
                  value={remainingAmount}
                  onChange={e => setRemainingAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/80 border border-blue-100 rounded-xl text-sm font-bold text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white/80 border border-blue-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="cash">نقدي (Cash)</option>
                  <option value="card">بطاقة مدى / ائتمان</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Follow-up & Next Appointment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تعليمات المتابعة والنصائح للمريض</label>
              <textarea
                rows={2}
                value={followUpInstructions}
                onChange={e => setFollowUpInstructions(e.target.value)}
                placeholder="مثال: الراحة التامة وتجنب الإجهاد، قياس الحرارة مرتين يومياً..."
                className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">موعد المراجعة القادمة (حجز تلقائي)</label>
              <div className="relative">
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={e => setNextAppointmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">سيتم إدراج الموعد في جدول مواعيد العيادة فوراً</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100/60 sticky bottom-0 bg-white/80 backdrop-blur-md z-10">
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
              <span>حفظ الزيارة وإضافتها للسجل الطبي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
