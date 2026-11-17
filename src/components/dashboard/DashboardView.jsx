import React, { useRef, useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../../data/subjects';
import { ChoicesModal } from '../modals/ChoicesModal';
import { PaymentModal } from '../modals/PaymentModal';
import { AppealModal } from '../modals/AppealModal';
import {
  FileText,
  Award,
  GraduationCap,
  Clock,
  Printer,
  LogOut,
  Calendar,
  Building,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  ShieldCheck,
  UserCheck,
  Globe,
  Camera,
  Upload,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Edit3,
  Lock,
  Info,
  CreditCard,
  Send
} from 'lucide-react';

export const DashboardView = () => {
  const {
    currentUser,
    logout,
    setPhase,
    startExam,
    setExamMode,
    setExamLength,
    updateCandidatePhoto,
    examSettings,
    setIsDisclaimerOpen,
    finalResult,
    setFinalResult
  } = useExam();

  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [isChoicesModalOpen, setIsChoicesModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [paymentTargetName, setPaymentTargetName] = useState('all portal services');
  const [mobileActiveMode, setMobileActiveMode] = useState('simulation_standard');

  if (!currentUser) return null;

  const status = currentUser.status || 'Pending';
  const isMalpracticeSanctioned = status === 'Suspended' || status === 'Disapproved' || status === 'Banned' || Boolean(currentUser.malpracticeBlocked);

  const triggerPaymentPrompt = (featureName) => {
    setPaymentTargetName(featureName);
    setIsPaymentModalOpen(true);
  };

  const handleStartExamMode = (mode, length) => {
    if (isMalpracticeSanctioned) {
      setIsAppealModalOpen(true);
      return;
    }

    if (status === 'Pending') {
      triggerPaymentPrompt('CBT Examinations & Mock Testing');
      return;
    }
    const isFullMock = mode === 'simulation' && length === 'standard';
    if (!isFullMock && !examSettings?.allowStudentPracticeMode) {
      alert('Practice Mode Disabled: Practice & Test examination modes are currently disabled by the administrator under CBT Rules. Candidates may only sit for the Full Mock Examination.');
      return;
    }
    setExamMode(mode);
    setExamLength(length);
    setPhase('instructions');
  };

  const handleOpenSlip = () => {
    // Registration slip is available immediately upon registration!
    setPhase('registration-slip');
  };

  const handleOpenCaps = () => {
    if (isMalpracticeSanctioned) {
      setIsAppealModalOpen(true);
      return;
    }
    if (status !== 'Approved') {
      triggerPaymentPrompt('JAMB Central Admission Processing System (CAPS)');
      return;
    }
    setPhase('caps');
  };

  const handleOpenResults = () => {
    if (isMalpracticeSanctioned) {
      setIsAppealModalOpen(true);
      return;
    }
    if (status !== 'Approved') {
      triggerPaymentPrompt('Mock Results & Scoring Records');
      return;
    }
    const hasHistory = (currentUser.examHistory && currentUser.examHistory.length > 0) || finalResult;
    if (hasHistory) {
      if (!finalResult && currentUser.examHistory?.length > 0) {
        const latest = currentUser.examHistory[0];
        const sanitizedCandidateForSlip = currentUser ? {
          id: currentUser.id,
          name: currentUser.name || 'Candidate',
          regNumber: currentUser.regNumber || 'N/A',
          seatNumber: currentUser.seatNumber || 'N/A',
          center: currentUser.center || 'ONLINE JAMB CBT SIMULATION',
          passport: currentUser.passport || ''
        } : null;

        const reconstructed = {
          candidate: sanitizedCandidateForSlip,
          completedAt: latest.dateTaken || latest.date || new Date().toISOString(),
          timeSpentSeconds: latest.timeSpentSeconds || 0,
          aggregateScore: latest.aggregateScore || 0,
          subjectBreakdown: latest.subjectBreakdown || [],
          totalQuestionsCount: (latest.subjectBreakdown || []).reduce((sum, b) => sum + (b.totalQuestions || 0), 0),
          totalRawCorrect: (latest.subjectBreakdown || []).reduce((sum, b) => sum + (b.correctCount || 0), 0),
          examData: latest.examData || {}
        };
        setFinalResult(reconstructed);
        try {
          localStorage.setItem('jamb_final_result', JSON.stringify(reconstructed));
        } catch (e) {}
      }
      setPhase('result');
    } else {
      alert("You have not taken any mock examination yet. Click 'Full Mock' to start!");
    }
  };

  const handleOpenChoices = () => {
    // Choices and O'Level are available to all registered candidates immediately!
    setIsChoicesModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setPhotoError('Image file is too large (max 3MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      updateCandidatePhoto(event.target.result);
      setPhotoError('');
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const latestScore = currentUser.examHistory?.[0]?.aggregateScore;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#004d25] text-white border-b-4 border-amber-400 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
                <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
              </svg>
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-300 leading-none">
                JAMB Practice Platform
              </div>
              <div className="text-xs sm:text-base font-black tracking-tight uppercase leading-snug">
                Candidate CBT Dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold uppercase">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-200 font-mono">Reg: {currentUser.regNumber}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-red-700/80 hover:bg-red-700 text-white rounded-lg text-[11px] sm:text-xs font-bold transition-all border border-red-500/50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Candidate Suspended Notice if Suspended for Malpractice */}
        {(status === 'Suspended' || currentUser.malpracticeBlocked) && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-md flex items-start gap-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-200 text-red-900 px-2.5 py-0.5 rounded-full border border-red-300">
                  Account Suspended
                </span>
                <span className="text-xs font-black text-red-950 uppercase">
                  Anti-Malpractice Security Protocol
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-red-950 mt-1">
                Candidate Barred: Multiple Examination Navigation Violations
              </h3>
              <p className="text-xs text-red-900 mt-1 leading-relaxed">
                Your examination session was terminated and your account locked due to repeated tab switching, window minimization, or exiting fullscreen mode during an active examination.
              </p>
              <div className="mt-2 text-[11px] font-bold text-red-900 flex items-center gap-1.5 bg-red-100/90 p-2.5 rounded-lg border border-red-300">
                <Lock className="w-3.5 h-3.5 text-red-700 flex-shrink-0" />
                <span>You are strictly barred from sitting for any examination until a Platform Administrator reviews your case and clears your account.</span>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Pending Approval Notice if Pending */}
        {status === 'Pending' && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Registration Awaiting Clearance
                </span>
                <span className="text-xs font-black text-amber-950 uppercase">
                  Account Status: Pending Approval
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-amber-950 mt-1">
                Your Account is Awaiting Platform Administrator Approval
              </h3>
              <p className="text-xs text-amber-900 mt-1">
                Your registration has been submitted and your email address is verified. All examination features, test simulations, and candidate e-slips remain locked until a platform administrator approves your registration.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-amber-900 flex items-center gap-1.5 bg-amber-100/80 p-2 rounded-lg border border-amber-300">
                <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>All test facilities, slips, and admission services are currently locked.</span>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Disapproval Notice if Disapproved */}
        {status === 'Disapproved' && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                  Registration Flagged
                </span>
                <span className="text-xs font-black text-rose-900 uppercase">
                  Platform Administrator Action
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-rose-950 mt-1">
                Your Candidate Registration Has Been Disapproved
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                Reason: <strong className="font-semibold">{currentUser.disapprovalReason || 'Passport photograph or candidate bio-data verification failed.'}</strong>
              </p>
              <p className="text-[11px] text-rose-700 mt-1.5">
                Action Required: Please update your passport photo below, or request your CBT centre administrator to re-verify your biometric record.
              </p>
            </div>
          </div>
        )}

        {/* Candidate Profile Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Passport Photo with Direct Upload Trigger */}
            <div className="relative group flex-shrink-0">
              <img
                src={currentUser.passport}
                alt="Candidate Passport"
                className="w-24 h-28 object-cover rounded-xl border-2 border-[#006633] shadow-md bg-slate-100"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Candidate&background=006633&color=fff";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                title="Click to update passport photo"
              >
                <Camera className="w-5 h-5 text-amber-300" />
                <span className="text-[10px] font-bold uppercase">Change Photo</span>
              </button>
              <div
                className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-white shadow ${
                  status === 'Approved' ? 'bg-green-600' : (status === 'Suspended' || currentUser.malpracticeBlocked) ? 'bg-red-600' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-600'
                }`}
                title={`Biometric Status: ${status === 'Suspended' || currentUser.malpracticeBlocked ? 'Suspended (Malpractice)' : status}`}
              >
                {status === 'Approved' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                ) : (status === 'Suspended' || currentUser.malpracticeBlocked) ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-white" />
                ) : status === 'Pending' ? (
                  <Clock className="w-3.5 h-3.5 text-white" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#006633] text-[11px] font-bold">
                  <UserCheck className="w-3 h-3" />
                  <span>2026/2027 UTME Candidate</span>
                </div>

                {/* Candidate Approval Status Pill */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase border ${
                  (status === 'Suspended' || currentUser.malpracticeBlocked)
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : status === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {(status === 'Suspended' || currentUser.malpracticeBlocked) && '🚨 Suspended (Malpractice)'}
                  {status === 'Approved' && !currentUser.malpracticeBlocked && '✓ Approved to Sit'}
                  {status === 'Pending' && !currentUser.malpracticeBlocked && '⏳ Approval Pending'}
                  {status === 'Disapproved' && !currentUser.malpracticeBlocked && '✕ Disapproved'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
                {currentUser.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600">
                <span>Reg No: <strong className="font-mono text-slate-900">{currentUser.regNumber}</strong></span>
                <span>Profile Code: <strong className="font-mono text-emerald-800">{currentUser.profileCode}</strong></span>
                <span>Gender: <strong className="text-slate-900">{currentUser.gender || 'Not Specified'}</strong></span>
                <span>DOB: <strong className="text-slate-900">{currentUser.dob || 'Not Specified'}</strong></span>
                <span>Phone: <strong className="font-mono text-slate-900">{currentUser.phone || 'Not Specified'}</strong></span>
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Assigned Center: <strong>{currentUser.center}</strong>
              </div>

              {/* Photo Upload Toast or feedback */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-[#006633] hover:underline inline-flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" />
                  <span>Update Passport Photo</span>
                </button>
                {photoSuccess && (
                  <span className="text-[11px] text-emerald-700 font-bold">✓ Photo updated successfully!</span>
                )}
                {photoError && (
                  <span className="text-[11px] text-rose-600 font-bold">{photoError}</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Exam Access Widget */}
          <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-4 w-full md:w-auto text-center flex flex-col items-center justify-center min-w-[220px]">
            <Calendar className="w-5 h-5 text-[#006633] mb-1" />
            <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">CBT Practice Access</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">Flexible / Unlimited</div>
            <div className="text-xs text-emerald-700 font-bold mt-0.5">Take Exams Anytime • On-Demand</div>
          </div>
        </div>

        {/* Malpractice Sanction Banner - Appeals Path Only (Payment Disabled) */}
        {isMalpracticeSanctioned && (
          <div className="bg-gradient-to-r from-rose-500/15 via-red-500/20 to-rose-500/15 border-2 border-rose-500 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-rose-950 uppercase tracking-tight">
                    Account Status: {currentUser.status === 'Banned' ? 'Permanently Banned' : 'Suspended (Exam Malpractice / Disciplinary Sanction)'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                    {currentUser.status === 'Banned' ? 'Banned' : 'Sanction Active'}
                  </span>
                </div>
                <p className="text-xs text-rose-900 mt-1 max-w-xl font-medium leading-relaxed">
                  {currentUser.status === 'Banned' ? (
                    <span>This candidate profile has been permanently banned from the JAMB Practice Platform following administrative review.</span>
                  ) : (
                    <span>
                      Examination access has been suspended due to an infraction. <strong>Paystack payment cannot unlock a sanctioned account.</strong> You must submit a formal appeal to the Board Administrator.
                    </span>
                  )}
                </p>
                {currentUser.appealStatus === 'pending' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 border border-amber-300 text-[11px] font-bold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Appeal Submitted on {currentUser.appealDate ? new Date(currentUser.appealDate).toLocaleDateString() : 'recent date'} — Awaiting Board Review</span>
                  </div>
                )}
              </div>
            </div>

            {currentUser.status !== 'Banned' && (
              <button
                type="button"
                onClick={() => setIsAppealModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-700 to-red-700 hover:from-rose-800 hover:to-red-800 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{currentUser.appealStatus === 'pending' ? 'View Submitted Appeal' : 'Appeal Malpractice Sanction'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Account Pending Approval Banner - Direct Paystack Unlock Option (Normal Registration) */}
        {status === 'Pending' && !isMalpracticeSanctioned && (
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 flex items-center justify-center flex-shrink-0 shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase">
                    Account Status: Pending Portal Activation
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                    Slip & Choices Unlocked
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                  Your <strong>Registration Slip</strong> and <strong>Choices & O'Level</strong> are accessible now. Unlock CBT Mock Simulations and JAMB CAPS tracking instantly by paying the <strong>₦50</strong> activation fee via Paystack.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => triggerPaymentPrompt('all portal features')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#006633] hover:bg-[#004d25] text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 flex-shrink-0"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>Unlock Now (Pay ₦50)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Action Hero: 4 Examination & Practice Modes */}
        <div className="bg-gradient-to-r from-[#004d25] to-[#006633] rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col gap-6 border-2 border-amber-400">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                JAMB UTME Simulation Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1">
                Choose Examination or Practice Mode
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Select your preferred mode below. <strong>Official Notice:</strong> Only the <span className="text-amber-300 font-bold">Full Mock Exam (180 Qs)</span> is officially recorded in the platform's Central Admin Score Log.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isMalpracticeSanctioned) {
                    setIsAppealModalOpen(true);
                    return;
                  }
                  if (status !== 'Approved') {
                    triggerPaymentPrompt('Subject Combination Modification');
                    return;
                  }
                  setPhase('setup');
                }}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white rounded-lg border border-amber-400/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Change Combination</span>
              </button>
            </div>
          </div>

          {/* Mobile Mode Switcher Tabs (< md) */}
          <div className="flex md:hidden items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/15 overflow-x-auto z-10 scrollbar-none">
            <button
              type="button"
              onClick={() => setMobileActiveMode('simulation_standard')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-black uppercase transition-all whitespace-nowrap text-center ${
                mobileActiveMode === 'simulation_standard'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              🎯 Full Mock
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveMode('practice_standard')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-black uppercase transition-all whitespace-nowrap text-center ${
                mobileActiveMode === 'practice_standard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              📖 Practice
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveMode('simulation_quick')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-black uppercase transition-all whitespace-nowrap text-center ${
                mobileActiveMode === 'simulation_quick'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              ⏱️ Quick Test
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveMode('practice_quick')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-black uppercase transition-all whitespace-nowrap text-center ${
                mobileActiveMode === 'practice_quick'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              💡 Drill
            </button>
          </div>

          {/* 4 Exam Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 z-10">
            {/* Mode 1: Full Mock Exam (180 Qs - Simulation) */}
            <div className={`bg-white text-slate-900 rounded-xl p-4 sm:p-5 flex-col justify-between border-2 border-amber-400 shadow-lg relative group hover:shadow-2xl transition-all ${
              mobileActiveMode === 'simulation_standard' ? 'flex' : 'hidden md:flex'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    Official UTME
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Logged to Admin
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-[#006633] flex items-center gap-1.5">
                    <span>🎯 Full Mock Exam</span>
                  </h3>
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    180 Questions • 120 Mins
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Strict 2-hour unified clock, authentic 8-key shortcuts, no answers revealed during exam. Scaled scoring out of 400 marks.
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleStartExamMode('simulation', 'standard')}
                  disabled={status !== 'Approved'}
                  className={`w-full py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    status !== 'Approved'
                      ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow hover:shadow-md active:scale-95'
                  }`}
                >
                  {status !== 'Approved' ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                      <span>{(status === 'Suspended' || currentUser.malpracticeBlocked) ? 'Barred (Malpractice)' : status === 'Pending' ? 'Approval Pending' : 'Disapproved'}</span>
                    </>
                  ) : (
                    <>
                      <span>Sit Full Mock</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode 2: Practice & Study Mode (180 Qs) */}
            <div className={`rounded-xl p-4 sm:p-5 flex-col justify-between border transition-all ${
              !examSettings?.allowStudentPracticeMode || status !== 'Approved'
                ? 'bg-white/80 border-slate-300 opacity-75'
                : 'bg-white text-slate-900 border-white hover:shadow-xl'
            } ${mobileActiveMode === 'practice_standard' ? 'flex' : 'hidden md:flex'}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    Study Mode
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Not Logged
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-blue-800 flex items-center gap-1.5">
                    <span>📖 Full Practice</span>
                  </h3>
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    180 Questions • Self-Paced
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full 180 questions with instant answer reveal and comprehensive step-by-step solution explanations for every question.
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleStartExamMode('practice', 'standard')}
                  disabled={status !== 'Approved' || !examSettings?.allowStudentPracticeMode}
                  className={`w-full py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    status !== 'Approved' || !examSettings?.allowStudentPracticeMode
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow hover:shadow-md active:scale-95'
                  }`}
                >
                  {status !== 'Approved' || !examSettings?.allowStudentPracticeMode ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {(status === 'Suspended' || currentUser.malpracticeBlocked)
                          ? 'Barred (Malpractice)'
                          : !examSettings?.allowStudentPracticeMode
                          ? 'Disabled by Admin'
                          : status === 'Pending'
                          ? 'Approval Pending'
                          : 'Disapproved'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Start Full Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode 3: Quick Sprint Test (45 Qs - Timed Test) */}
            <div className={`rounded-xl p-4 sm:p-5 flex-col justify-between border transition-all ${
              !examSettings?.allowStudentPracticeMode || status !== 'Approved'
                ? 'bg-white/80 border-slate-300 opacity-75'
                : 'bg-white text-slate-900 border-white hover:shadow-xl'
            } ${mobileActiveMode === 'simulation_quick' ? 'flex' : 'hidden md:flex'}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#006633] px-2 py-0.5 rounded-full">
                    Sprint Drill
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Not Logged
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-1.5">
                    <span>⏱️ Quick Sprint Test</span>
                  </h3>
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    45 Questions • 45 Mins
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast 45-question timed simulation (15 English + 10 × 3 electives). Ideal for speed and quick exam-day testing drills.
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleStartExamMode('simulation', 'quick')}
                  disabled={status !== 'Approved' || !examSettings?.allowStudentPracticeMode}
                  className={`w-full py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    status !== 'Approved' || !examSettings?.allowStudentPracticeMode
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow hover:shadow-md active:scale-95'
                  }`}
                >
                  {status !== 'Approved' || !examSettings?.allowStudentPracticeMode ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {(status === 'Suspended' || currentUser.malpracticeBlocked)
                          ? 'Barred (Malpractice)'
                          : !examSettings?.allowStudentPracticeMode
                          ? 'Disabled by Admin'
                          : status === 'Pending'
                          ? 'Approval Pending'
                          : 'Disapproved'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Start Quick Test</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mode 4: Quick Sprint Practice (45 Qs - Study Drill) */}
            <div className={`rounded-xl p-4 sm:p-5 flex-col justify-between border transition-all ${
              !examSettings?.allowStudentPracticeMode || status !== 'Approved'
                ? 'bg-white/80 border-slate-300 opacity-75'
                : 'bg-white text-slate-900 border-white hover:shadow-xl'
            } ${mobileActiveMode === 'practice_quick' ? 'flex' : 'hidden md:flex'}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                    Rapid Revision
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    Not Logged
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-purple-900 flex items-center gap-1.5">
                    <span>💡 Quick Practice Drill</span>
                  </h3>
                  <div className="text-[11px] font-mono font-bold text-slate-500">
                    45 Questions • Instant Explanations
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast 45-question practice with instant solution explanations and answer checks on every question for rapid daily revision.
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleStartExamMode('practice', 'quick')}
                  disabled={status !== 'Approved' || !examSettings?.allowStudentPracticeMode}
                  className={`w-full py-2.5 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    status !== 'Approved' || !examSettings?.allowStudentPracticeMode
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-700 hover:bg-purple-800 text-white shadow hover:shadow-md active:scale-95'
                  }`}
                >
                  {status !== 'Approved' || !examSettings?.allowStudentPracticeMode ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {(status === 'Suspended' || currentUser.malpracticeBlocked)
                          ? 'Barred (Malpractice)'
                          : !examSettings?.allowStudentPracticeMode
                          ? 'Disabled by Admin'
                          : status === 'Pending'
                          ? 'Approval Pending'
                          : 'Disapproved'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Start Quick Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Core JAMB Service Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
            Candidate Practice Services
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Card 1: Print Registration e-Slip */}
            <div
              onClick={handleOpenSlip}
              className={`bg-white p-3 sm:p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase leading-snug">
                    Registration Slip
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5 text-amber-700" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="hidden sm:block text-xs text-slate-500 mt-1">
                  View and print your candidate practice examination slip with center and seat details.
                </p>
              </div>
              <span className={`text-[11px] sm:text-xs font-bold mt-2 sm:mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-[#006633]' : 'text-amber-800'
              }`}>
                <span>{status === 'Approved' ? 'View Slip →' : 'Locked'}</span>
              </span>
            </div>

            {/* Card 2: JAMB CAPS Admission Portal */}
            <div
              onClick={handleOpenCaps}
              className={`bg-white p-3 sm:p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase leading-snug">
                    CAPS Portal
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="hidden sm:block text-xs text-slate-500 mt-1">
                  Check admission status, accept or reject institutional admission offers on Central Processing.
                </p>
              </div>
              <span className={`text-[11px] sm:text-xs font-bold mt-2 sm:mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-blue-700' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? 'Access CAPS →' : 'Locked'}</span>
              </span>
            </div>

            {/* Card 3: Result Notification Slip */}
            <div
              onClick={handleOpenResults}
              className={`bg-white p-3 sm:p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase leading-snug">
                    Check Results
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="hidden sm:block text-xs text-slate-500 mt-1">
                  Print your practice result notification slip and review solution explanations.
                </p>
              </div>
              <span className={`text-[11px] sm:text-xs font-bold mt-2 sm:mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-purple-700' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? (latestScore ? `Latest: ${latestScore}/400 →` : 'Results →') : 'Locked'}</span>
              </span>
            </div>

            {/* Card 4: Choice of Institution & O'Levels */}
            <div
              onClick={handleOpenChoices}
              className={`bg-white p-3 sm:p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex items-start sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase leading-snug">
                    Choices &amp; O'Level
                  </h3>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ${
                    status === 'Approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {status !== 'Approved' && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                    <span>{status === 'Approved' ? '4 Choices' : 'Locked'}</span>
                  </span>
                </div>
                <p className="hidden sm:block text-xs font-bold text-slate-800 mt-1 truncate">
                  1st: {currentUser.firstChoice?.institution}
                </p>
                <p className="hidden sm:block text-[11px] text-emerald-800 font-semibold truncate">
                  {currentUser.firstChoice?.course}
                </p>
              </div>
              <span className={`text-[11px] sm:text-xs font-bold mt-2 sm:mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-[#006633]' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? 'View & Edit →' : 'Frozen'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Registered 4 Subjects Overview */}
        <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Registered UTME 4-Subject Combination
            </h3>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (status !== 'Approved') {
                    triggerPaymentPrompt('Subject Combination Modification');
                    return;
                  }
                  setPhase('setup');
                }}
                className="text-xs font-bold text-[#006633] hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Change Combination</span>
              </button>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentUser.selectedSubjects.map((subId, idx) => {
              const subMeta = AVAILABLE_SUBJECTS.find(s => s.id === subId);
              return (
                <div key={subId} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#006633] text-white flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      {subMeta?.name || subId}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {subMeta?.code} • {subId === 'english' ? '60 Questions' : '40 Questions'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Global Footer with Disclaimer Link */}
      <footer className="mt-8 border-t border-slate-300 bg-white py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl w-full mx-auto rounded-t-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase">JAMB Practice Platform</span>
          <span>•</span>
          <span>JAMB CBT Practice Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDisclaimerOpen(true)}
            className="font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Platform Disclaimer Notice</span>
          </button>
          <span className="text-slate-400">|</span>
          <span className="text-[11px] text-slate-500 font-mono">JAMB Simulation Platform</span>
        </div>
      </footer>

      {/* Tertiary Institutional Choices Modal */}
      <ChoicesModal
        isOpen={isChoicesModalOpen}
        onClose={() => setIsChoicesModalOpen(false)}
      />

      {/* Paystack Portal Activation Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        targetActionName={paymentTargetName}
      />

      {/* Examination Malpractice Appeal Modal */}
      <AppealModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
      />
    </div>
  );
};
