import React, { useEffect } from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import { LoginView } from './components/auth/LoginView';
import { RegisterWizard } from './components/auth/RegisterWizard';
import { DashboardView } from './components/dashboard/DashboardView';
import { RegistrationSlipView } from './components/dashboard/RegistrationSlipView';
import { CapsView } from './components/dashboard/CapsView';
import { SetupModal } from './components/SetupModal';
import { InstructionsScreen } from './components/InstructionsScreen';
import { Header } from './components/Header';
import { SubjectTabs } from './components/SubjectTabs';
import { QuestionView } from './components/QuestionView';
import { QuestionPalette } from './components/QuestionPalette';
import { BottomNav } from './components/BottomNav';
import { OnscreenCalculator } from './components/OnscreenCalculator';
import { EightKeyGuide } from './components/EightKeyGuide';
import { SubmitModal } from './components/SubmitModal';
import { ResultSlip } from './components/ResultSlip';
import { ApiSettingsModal } from './components/modals/ApiSettingsModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { DisclaimerModal } from './components/modals/DisclaimerModal';

const ExamPortal = () => {
  const { phase, setPhase, currentUser, isLoadingQuestions, apiFetchNotice, isDisclaimerOpen, setIsDisclaimerOpen } = useExam();

  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path === '/admin' || hash === '#/admin' || search.includes('admin')) {
        setPhase('admin-login');
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [setPhase]);

  const renderCurrentView = () => {
    // Admin console routes
    if (phase === 'admin-login') {
      return <AdminLoginView />;
    }
    if (phase === 'admin') {
      return <AdminDashboard />;
    }

    // If not logged in, show candidate login or registration
    if (!currentUser) {
      if (phase === 'register') {
        return <RegisterWizard />;
      }
      return <LoginView />;
    }

    if (phase === 'login') {
      return <LoginView />;
    }

    if (phase === 'dashboard') {
      return <DashboardView />;
    }

    if (phase === 'registration-slip') {
      return <RegistrationSlipView />;
    }

    if (phase === 'caps') {
      return <CapsView />;
    }

    if (phase === 'setup') {
      return <SetupModal />;
    }

    if (phase === 'instructions') {
      return <InstructionsScreen />;
    }

    if (phase === 'result') {
      return <ResultSlip />;
    }

    // Active UTME Examination Simulation
    return (
      <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-slate-900 select-none">
        {/* Top Header with Candidate Bio and Live Countdown Timer */}
        <Header />

        {/* Live API Notice Banner if present */}
        {apiFetchNotice && (
          <div className="bg-emerald-800 text-white text-xs px-4 py-1.5 font-bold text-center flex items-center justify-center gap-2">
            <span>🌐 {apiFetchNotice}</span>
          </div>
        )}

        {/* 4-Subject Combination Navigation Tabs */}
        <SubjectTabs />

        {/* Main Examination Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          {/* Left / Center 3 Columns: Active Question & Choices */}
          <div className="lg:col-span-3 h-full">
            <QuestionView />
          </div>

          {/* Right 1 Column: Question Palette (1-60 color coded grid) */}
          <div className="lg:col-span-1 h-full hidden lg:block sticky top-28">
            <QuestionPalette />
          </div>
        </main>

        {/* Bottom Sticky Bar: 8-Key Navigation and Controls */}
        <BottomNav />

        {/* In-Exam Tools & Modals */}
        <OnscreenCalculator />
        <EightKeyGuide />
        <SubmitModal />
      </div>
    );
  };

  return (
    <>
      {renderCurrentView()}
      {phase === 'admin' && <ApiSettingsModal />}
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />

      {/* Network Loading Overlay when fetching live questions */}
      {isLoadingQuestions && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-white text-center animate-in fade-in duration-150">
          <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-black uppercase tracking-wider text-amber-300">
            Fetching Real JAMB Past Questions
          </h3>
          <p className="text-xs text-emerald-100 mt-1 max-w-md">
            Connecting to question servers and loading authenticated past questions for your 4 registered subjects...
          </p>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <ExamProvider>
      <ExamPortal />
    </ExamProvider>
  );
}
