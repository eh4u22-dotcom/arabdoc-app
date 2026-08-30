import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Crown,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form state
  const [email, setEmail] = useState('doctor@arabdoc.com');
  const [password, setPassword] = useState('doctor123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regSpecialty, setRegSpecialty] = useState('طب عام وجراحة');
  const [regClinicName, setRegClinicName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regClinicName) {
      setError('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await register({
        name: regName,
        specialty: regSpecialty,
        clinicName: regClinicName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
      });
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء حساب الطبيب.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('doctor@arabdoc.com');
    setPassword('doctor123');
    setIsRegisterMode(false);
  };

  return (
    <div
      className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(186,230,253,0.5),rgba(255,255,255,0.9))] flex items-center justify-center p-4 lg:p-8"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white/75 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden text-right">
        {/* Top Brand Banner */}
        <div className="bg-gradient-to-l from-blue-600 via-indigo-600 to-blue-700 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold font-cairo">ArabDoc</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            المنصة الطبية السحابية لإدارة العيادات والسجلات السريرية التراكمية
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 lg:p-8 space-y-5">
          {/* Toggle Tab */}
          <div className="flex bg-blue-50/70 p-1 rounded-2xl border border-blue-100/60">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-white text-blue-900 shadow-xs border border-white/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-white text-blue-900 shadow-xs border border-white/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              طبيب جديد (حساب عيادة)
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50/90 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegisterMode ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="w-full pr-10 pl-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-3.5 py-2.5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : null}
                <span>دخول إلى لوحة العيادة</span>
              </button>

              {/* Demo Account Autofill Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="w-full py-2.5 bg-white/80 hover:bg-white text-blue-800 rounded-xl text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>دخول مباشر بالحساب التجريبي (د. أحمد الشريف)</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطبيب الكامل</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="د. محمد السعيد"
                  className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العيادة</label>
                  <input
                    type="text"
                    required
                    value={regClinicName}
                    onChange={e => setRegClinicName(e.target.value)}
                    placeholder="عيادة الشفاء"
                    className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التخصص الطبي</label>
                  <select
                    value={regSpecialty}
                    onChange={e => setRegSpecialty(e.target.value)}
                    className="w-full px-2 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none text-slate-800"
                  >
                    <option value="طب عام وجراحة">طب عام وجراحة</option>
                    <option value="الباطنة والقلب">الباطنة والقلب</option>
                    <option value="طب وجراحة الأسنان">طب وجراحة الأسنان</option>
                    <option value="الجلدية والتجميل">الجلدية والتجميل</option>
                    <option value="الأطفال وحديثي الولادة">الأطفال</option>
                    <option value="العظام والمفاصل">العظام والمفاصل</option>
                    <option value="النساء والولادة">النساء والولادة</option>
                    <option value="العيون وجراحة القرنية">العيون</option>
                    <option value="تخصص طبي آخر">تخصص طبي آخر</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الهاتف</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full px-3.5 py-2 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : null}
                <span>إنشاء حساب العيادة والبدء مجاناً</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400">
              ArabDoc • نظام طبي آمن وسحابي لجميع الأطباء في العالم العربي
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
