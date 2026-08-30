import React, { useState, useEffect } from 'react';
import { Payment, Patient } from '../types';
import { api } from '../lib/api';
import {
  DollarSign,
  CreditCard,
  Wallet,
  ArrowDownLeft,
  Search,
  Calendar,
  Plus,
  User,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface PaymentsViewProps {
  onSelectPatient: (patientId: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onSelectPatient }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Add payment modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [amount, setAmount] = useState<number>(150);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [pays, patsRes] = await Promise.all([
        api.getPayments(),
        api.getPatients(),
      ]);
      setPayments(pays);
      setPatients(patsRes.patients);
      if (patsRes.patients.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patsRes.patients[0].id);
      }
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalPending = payments.reduce((acc, p) => acc + (p.remainingAmount || 0), 0);
  const cashTotal = payments.filter(p => p.paymentMethod === 'cash').reduce((acc, p) => acc + p.amount, 0);
  const cardTotal = payments.filter(p => p.paymentMethod === 'card').reduce((acc, p) => acc + p.amount, 0);

  const filteredPayments = payments.filter(p => {
    if (search) {
      const matchName = (p.patientName || '').toLowerCase().includes(search.toLowerCase());
      const matchNotes = (p.notes || '').toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchNotes) return false;
    }
    if (methodFilter && p.paymentMethod !== methodFilter) return false;
    return true;
  });

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || amount <= 0) {
      setFormError('يرجى اختيار المريض وتحديد مبلغ صحيح');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.createPayment({
        patientId: selectedPatientId,
        amount: Number(amount),
        remainingAmount: Number(remainingAmount || 0),
        paymentMethod,
        paymentDate,
        notes: notes || 'دفعة محصلة في العيادة',
      });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ الدفعة المالية');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6" dir="rtl">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Revenue */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الإيرادات المحصلة</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-blue-950 font-cairo">
              {totalCollected.toLocaleString()}
            </span>
            <span className="text-xs text-blue-600 font-bold">SAR</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-700 font-semibold">
            نقدي: {cashTotal.toLocaleString()} SAR • بطاقات: {cardTotal.toLocaleString()} SAR
          </div>
        </div>

        {/* Total Debt / Pending */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي المبالغ المستحقة (ذمم)</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-rose-600 font-cairo">
              {totalPending.toLocaleString()}
            </span>
            <span className="text-xs text-rose-500 font-bold">SAR</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-500 font-medium">
            مبالغ مؤجلة بانتظار السداد في الزيارات القادمة
          </div>
        </div>

        {/* Transactions Count */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">عدد العمليات المسجلة</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl lg:text-3xl font-extrabold text-indigo-950 font-cairo">
              {payments.length}
            </span>
            <span className="text-xs text-indigo-500 font-medium">سند قبض</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">توثيق مالي متكامل</div>
        </div>
      </div>

      {/* Filter and Add Button Bar */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-4 lg:p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-blue-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم المريض أو البيان المالي..."
            className="w-full pr-10 pl-4 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">جميع طرق الدفع</option>
            <option value="cash">نقدي (Cash)</option>
            <option value="card">بطاقة مدى / ائتمان</option>
            <option value="bank_transfer">تحويل بنكي</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل سند قبض جديد</span>
          </button>
        </div>
      </div>

      {/* Transactions Table/Card List */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-2">جاري استرجاع السجلات المالية...</p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 p-12 text-center text-slate-400 text-sm shadow-xs">
          لا توجد دفعات مالية مسجلة مطابقة لمعايير البحث.
        </div>
      ) : (
        <div className="bg-white/75 backdrop-blur-md rounded-3xl border border-white/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-blue-50/50 border-b border-blue-100/60 text-slate-700 font-bold">
                <tr>
                  <th className="py-3.5 px-4">تاريخ السند</th>
                  <th className="py-3.5 px-4">اسم المريض</th>
                  <th className="py-3.5 px-4">طريقة الدفع</th>
                  <th className="py-3.5 px-4">البيان / الملاحظات</th>
                  <th className="py-3.5 px-4">المبلغ المدفوع</th>
                  <th className="py-3.5 px-4">المتبقي</th>
                  <th className="py-3.5 px-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50/60 font-medium">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-white/90 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {p.paymentDate}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => p.patientId && onSelectPatient(p.patientId)}
                        className="font-bold text-slate-900 hover:text-blue-700 hover:underline text-right cursor-pointer"
                      >
                        {p.patientName || 'مريض'}
                      </button>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-100 font-semibold text-[11px]">
                        {p.paymentMethod === 'card'
                          ? 'بطاقة بنكية'
                          : p.paymentMethod === 'bank_transfer'
                          ? 'تحويل بنكي'
                          : 'نقدي'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {p.notes || '-'}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-blue-900 whitespace-nowrap" dir="ltr">
                      {p.amount.toLocaleString()} SAR
                    </td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap" dir="ltr">
                      {p.remainingAmount > 0 ? (
                        <span className="text-rose-600">+{p.remainingAmount.toLocaleString()} SAR</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => p.patientId && onSelectPatient(p.patientId)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        الملف الطبي
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full p-6 text-right space-y-4 border border-white/60" dir="rtl">
            <div className="flex items-center justify-between pb-3 border-b border-blue-50">
              <h3 className="font-bold text-slate-900 text-base">تسجيل سند قبض / دفعة جديدة</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50/90 text-rose-700 rounded-2xl text-xs flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المريض</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs text-slate-800"
                  required
                >
                  <option value="">-- اختر مريضاً --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.fileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المحصل (SAR)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المتبقي إن وجد</label>
                  <input
                    type="number"
                    min="0"
                    value={remainingAmount}
                    onChange={e => setRemainingAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs text-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs text-slate-800"
                  >
                    <option value="cash">نقدي</option>
                    <option value="card">بطاقة بنكية / مدى</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التحصيل</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البيان / الملاحظات</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="مثال: دفعة جلسة كشف ومتابعة..."
                  className="w-full px-3 py-2 bg-white/70 border border-blue-100 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-blue-50">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ السند المالي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
