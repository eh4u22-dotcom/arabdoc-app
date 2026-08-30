import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { PatientsView } from './views/PatientsView';
import { PatientProfileView } from './views/PatientProfileView';
import { AppointmentsView } from './views/AppointmentsView';
import { CaseTrackerView } from './views/CaseTrackerView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { PricingView } from './views/PricingView';
import { AuthView } from './views/AuthView';
import { UpgradeModal } from './components/UpgradeModal';
import { PatientFormModal } from './components/PatientFormModal';
import { AppointmentModal } from './components/AppointmentModal';
import { Patient } from './types';
import { api } from './lib/api';

const AppContent: React.FC = () => {
  const { doctor, clinic, isLoading: isAuthLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global modals
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);

  const fetchQuickPatients = async () => {
    if (!doctor) return;
    try {
      const res = await api.getPatients();
      setPatientsList(res.patients);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (doctor) {
      fetchQuickPatients();
    }
  }, [doctor, isAddPatientOpen, isAddAppointmentOpen]);

  // When patient is selected
  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentTab('patients');
    // Fetch patient name for breadcrumbs
    try {
      const data = await api.getPatient(patientId);
      setSelectedPatientName(data.patient.name);
    } catch (e) {
      setSelectedPatientName(null);
    }
  };

  const handleBackToPatientsList = () => {
    setSelectedPatientId(null);
    setSelectedPatientName(null);
    fetchQuickPatients();
  };

  const handleTabChange = (tab: NavItem) => {
    setCurrentTab(tab);
    if (tab !== 'patients') {
      setSelectedPatientId(null);
      setSelectedPatientName(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f0f9ff] flex flex-col items-center justify-center text-slate-800" dir="rtl" style={{ background: 'radial-gradient(circle at 0% 0%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)' }}>
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-bold text-blue-900">جاري تحميل نظام ArabDoc الطبي...</p>
      </div>
    );
  }

  if (!doctor) {
    return <AuthView />;
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row text-slate-800 antialiased font-cairo"
      dir="rtl"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalPatientsCount={patientsList.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddPatient={() => {
            setPatientToEdit(null);
            setIsAddPatientOpen(true);
          }}
          onOpenAddAppointment={() => setIsAddAppointmentOpen(true)}
          selectedPatientName={selectedPatientName}
          onBackToPatients={handleBackToPatientsList}
        />

        {/* View Router */}
        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              onSelectPatient={handleSelectPatient}
              onNavigate={handleTabChange}
              onOpenAddPatient={() => {
                setPatientToEdit(null);
                setIsAddPatientOpen(true);
              }}
            />
          )}

          {currentTab === 'patients' && (
            selectedPatientId ? (
              <PatientProfileView
                patientId={selectedPatientId}
                onBack={handleBackToPatientsList}
              />
            ) : (
              <PatientsView
                onSelectPatient={handleSelectPatient}
                onOpenAddPatient={() => {
                  setPatientToEdit(null);
                  setIsAddPatientOpen(true);
                }}
                onOpenEditPatient={(patient) => {
                  setPatientToEdit(patient);
                  setIsAddPatientOpen(true);
                }}
              />
            )
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              onSelectPatient={handleSelectPatient}
              onOpenAddAppointment={() => setIsAddAppointmentOpen(true)}
            />
          )}

          {currentTab === 'cases' && (
            <CaseTrackerView onSelectPatient={handleSelectPatient} />
          )}

          {currentTab === 'payments' && (
            <PaymentsView onSelectPatient={handleSelectPatient} />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'settings' && <SettingsView />}

          {currentTab === 'pricing' && <PricingView />}
        </main>
      </div>

      {/* Global Modals */}
      <UpgradeModal />

      <PatientFormModal
        isOpen={isAddPatientOpen}
        onClose={() => {
          setIsAddPatientOpen(false);
          setPatientToEdit(null);
        }}
        patientToEdit={patientToEdit}
        onSuccess={(savedPatient) => {
          fetchQuickPatients();
          handleSelectPatient(savedPatient.id);
        }}
      />

      <AppointmentModal
        isOpen={isAddAppointmentOpen}
        onClose={() => setIsAddAppointmentOpen(false)}
        patients={patientsList}
        onSuccess={() => {
          fetchQuickPatients();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
