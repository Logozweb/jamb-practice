import React, { useRef, useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../../data/subjects';
import { ChoicesModal } from '../modals/ChoicesModal';
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
  Info
} from 'lucide-react';

export const DashboardView = () => {
  const {
    currentUser,
    logout,
    setPhase,
    startExam,
    setExamLength,
    updateCandidatePhoto,
    examSettings,
    setIsDisclaimerOpen
  } = useExam();

  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [isChoicesModalOpen, setIsChoicesModalOpen] = useState(false);

  if (!currentUser) return null;

  const handleLaunchFullCbt = () => {
    if (status === 'Pending') {
      alert('Access Restricted: Your candidate registration is currently awaiting platform administrator approval. Examination features are locked until an administrator approves your registration.');
      return;
    }
    if (status === 'Disapproved') {
      alert(`Access Blocked: Your registration was disapproved. Reason: ${currentUser.disapprovalReason || 'Verification failed.'}`);
      return;
    }
    setExamLength('standard');
    setPhase('instructions');
  };

  const handleLaunchTestExam = () => {
    if (status === 'Pending') {
      alert('Access Restricted: Your candidate registration is currently awaiting platform administrator approval. Examination features are locked until an administrator approves your registration.');
      return;
    }
    if (status === 'Disapproved') {
      alert(`Access Blocked: Your registration was disapproved. Reason: ${currentUser.disapprovalReason || 'Verification failed.'}`);
      return;
    }
    setExamLength('quick');
    setPhase('instructions');
  };

  const handleOpenSlip = () => {
    if (status !== 'Approved') {
      alert('Registration Slip Locked: Your candidate examination slip is unlocked once a platform administrator verifies and approves your registration.');
      return;
    }
    setPhase('registration-slip');
  };

  const handleOpenCaps = () => {
    if (status !== 'Approved') {
      alert('JAMB CAPS Locked: Central Admission Processing System (CAPS) is locked while your account status is Pending.');
      return;
    }
    setPhase('caps');
  };

  const handleOpenResults = () => {
    if (status !== 'Approved') {
      alert('Mock Results Service Locked: Access to test scoring records is locked while your account status is Pending.');
      return;
    }
    if (currentUser.examHistory?.length > 0) {
      setPhase('result');
    } else {
      alert("You have not taken any mock examination yet. Click 'Launch CBT Exam Simulation' to start!");
    }
  };

  const handleOpenChoices = () => {
    if (status !== 'Approved') {
      alert('Institution Choices Locked: Preferred tertiary institutions and courses cannot be modified while your profile is awaiting administrator verification.');
      return;
    }
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
  const status = currentUser.status || 'Approved';

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#004d25] text-white border-b-4 border-amber-400 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
                <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
              </svg>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                JAMB Practice Platform
              </div>
              <div className="text-sm sm:text-base font-black tracking-tight uppercase">
                Candidate CBT Simulation Dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold uppercase">{currentUser.name}</span>
              <span className="text-[10px] text-emerald-200 font-mono">Reg: {currentUser.regNumber}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700/80 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all border border-red-500/50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
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
                  status === 'Approved' ? 'bg-green-600' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-600'
                }`}
                title={`Biometric Status: ${status}`}
              >
                {status === 'Approved' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
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
                  status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : status === 'Pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {status === 'Approved' && '✓ Approved to Sit'}
                  {status === 'Pending' && '⏳ Approval Pending'}
                  {status === 'Disapproved' && '✕ Disapproved'}
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

        {/* Primary Action Hero: Launch CBT Simulator */}
        <div className="bg-gradient-to-r from-[#004d25] to-[#006633] rounded-2xl text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 border-2 border-amber-400">
          <div className="space-y-2 text-center lg:text-left z-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              JAMB Practice Platform Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              Ready to Sit for Your UTME CBT Exam?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Experience the identical 4-subject exam environment with the real 2-hour unified clock, standard 8-key keyboard navigation (A, B, C, D, P, N, S, R), onscreen calculator, comprehension passages, and instant scaled JAMB scoring out of 400 marks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto z-10">
            {/* 15 Questions per Subject Test Exam */}
            <button
              onClick={handleLaunchTestExam}
              disabled={status !== 'Approved'}
              className={`w-full sm:w-auto px-6 py-3.5 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border-2 ${
                status !== 'Approved'
                  ? 'bg-white/10 border-white/20 text-white/50 cursor-not-allowed shadow-none'
                  : 'bg-white hover:bg-emerald-50 text-[#006633] border-white hover:shadow-xl active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Take Test Exam (15 Qs/Subject)</span>
            </button>

            {/* Standard 180 Questions Mock Exam */}
            <button
              onClick={handleLaunchFullCbt}
              disabled={status !== 'Approved'}
              className={`w-full sm:w-auto px-7 py-3.5 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                status === 'Pending'
                  ? 'bg-slate-300 text-slate-700 cursor-not-allowed shadow-none'
                  : status === 'Disapproved'
                  ? 'bg-rose-300 text-rose-900 cursor-not-allowed shadow-none'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 hover:shadow-xl active:scale-95'
              }`}
            >
              {status !== 'Approved' ? (
                <>
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>{status === 'Pending' ? 'Sitting Locked' : 'Sitting Blocked'}</span>
                </>
              ) : (
                <>
                  <span>Full Mock (180 Qs)</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Core JAMB Service Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            Candidate Practice Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Print Registration e-Slip */}
            <div
              onClick={handleOpenSlip}
              className={`bg-white p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    Print Registration Slip
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  View and print your candidate practice examination slip with center and seat details.
                </p>
              </div>
              <span className={`text-xs font-bold mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-[#006633]' : 'text-amber-800'
              }`}>
                <span>{status === 'Approved' ? 'View Slip →' : 'Locked (Pending Approval)'}</span>
              </span>
            </div>

            {/* Card 2: JAMB CAPS Admission Portal */}
            <div
              onClick={handleOpenCaps}
              className={`bg-white p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    JAMB CAPS Portal
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Check admission status, accept or reject institutional admission offers on Central Processing.
                </p>
              </div>
              <span className={`text-xs font-bold mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-blue-700' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? 'Access CAPS →' : 'Locked (Pending Approval)'}</span>
              </span>
            </div>

            {/* Card 3: Result Notification Slip */}
            <div
              onClick={handleOpenResults}
              className={`bg-white p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200 opacity-80'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    Check Mock Results
                  </h3>
                  {status !== 'Approved' && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Print your practice result notification slip and review solution explanations.
                </p>
              </div>
              <span className={`text-xs font-bold mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-purple-700' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? (latestScore ? `Latest: ${latestScore}/400 →` : 'No Results Yet →') : 'Locked (Pending Approval)'}</span>
              </span>
            </div>

            {/* Card 4: Choice of Institution & O'Levels */}
            <div
              onClick={handleOpenChoices}
              className={`bg-white p-5 rounded-xl border shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${
                status === 'Approved' ? 'border-slate-300 hover:shadow-md hover:border-[#006633]' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    Institution Choices
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                    status === 'Approved' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {status !== 'Approved' && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                    <span>{status === 'Approved' ? '4 Choices' : 'Locked'}</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                  1st: {currentUser.firstChoice?.institution}
                </p>
                <p className="text-[11px] text-emerald-800 font-semibold truncate">
                  {currentUser.firstChoice?.course}
                </p>
              </div>
              <span className={`text-xs font-bold mt-4 flex items-center gap-1 ${
                status === 'Approved' ? 'text-[#006633]' : 'text-slate-500'
              }`}>
                <span>{status === 'Approved' ? 'View & Edit Choices →' : 'Choices Frozen (Pending Review)'}</span>
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
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Approved
            </span>
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
    </div>
  );
};
