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
import { MalpracticeWarningModal } from './components/MalpracticeWarningModal';
import { PreExamSecurityModal } from './components/modals/PreExamSecurityModal';
import { X, Maximize2, ShieldCheck } from 'lucide-react';

const ExamPortal = () => {
  const {
    phase,
    setPhase,
    currentUser,
    isLoadingQuestions,
    apiFetchNotice,
    sessionRestoredNotice,
    isDisclaimerOpen,
    setIsDisclaimerOpen,
    isMobilePaletteOpen,
    setIsMobilePaletteOpen,
    isFullscreen,
    reEnterFullscreen,
    malpracticeStrikes,
    isDisqualified
  } = useExam();

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

        {/* Strict Fullscreen Enforcement Barrier (Active whenever browser leaves fullscreen mode) */}
        {!isFullscreen && !isDisqualified && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-150">
            <div className="max-w-lg w-full bg-slate-900 border-4 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto text-red-500 animate-pulse">
                <Maximize2 className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-red-950 text-red-300 px-3.5 py-1 rounded-full border border-red-800">
                Strict Fullscreen Security Lock
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase text-white">
                Examination Halted
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under official CBT regulations, this examination runs <strong>strictly in Full-Screen Mode</strong>. All questions, timers, and answer selections are locked while outside full-screen.
              </p>
              <div className="p-3.5 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 font-bold">
                ⚠️ Strike {malpracticeStrikes} of 3 Recorded: Exiting fullscreen mode or pressing ESCAPE is a violation. Upon Strike 3, your exam is terminated and your account disapproved.
              </div>
              <button
                type="button"
                onClick={reEnterFullscreen}
                className="w-full py-4 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Re-Enter Fullscreen Mode to Resume</span>
              </button>
            </div>
          </div>
        )}

        {/* Live API Notice Banner if present */}
        {apiFetchNotice && (
          <div className="bg-emerald-800 text-white text-xs px-4 py-1.5 font-bold text-center flex items-center justify-center gap-2">
            <span>🌐 {apiFetchNotice}</span>
          </div>
        )}

        {/* Resilient Session Recovery Notice Banner */}
        {sessionRestoredNotice && (
          <div className="bg-[#004d25] border-b-2 border-amber-400 text-white text-xs px-4 py-2 font-bold text-center flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>{sessionRestoredNotice}</span>
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

        {/* Mobile Slide-up Question Palette Drawer */}
        {isMobilePaletteOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
              <div className="p-3.5 bg-[#006633] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs uppercase tracking-wider">Question Navigator</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Tap any question number</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1 rounded-full hover:bg-white/20 text-white transition-all"
                  title="Close Question Navigator"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <QuestionPalette />
              </div>
            </div>
          </div>
        )}

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
      <MalpracticeWarningModal />
      <PreExamSecurityModal />

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
