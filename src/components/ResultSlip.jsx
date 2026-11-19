import React, { useState, useMemo } from 'react';
import { useExam } from '../context/ExamContext';
import {
  Printer,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Filter,
  Check,
  HelpCircle,
  ArrowRight,
  Lock
} from 'lucide-react';

export const ResultSlip = () => {
  const { finalResult, currentUser, setPhase, paymentSettings } = useExam();
  const accessFee = paymentSettings?.accessFeeNaira ?? 50;

  // Helper to determine mode metadata and styling for an exam attempt
  const getAttemptMeta = (att) => {
    if (!att) {
      return {
        key: 'full_mock',
        badge: '🎯 Full Mock',
        title: 'Official Full Mock Exam',
        volumeLabel: '180 Qs • 120 Mins',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        activeBorder: 'border-amber-400 bg-amber-50/40'
      };
    }
    const mode = att.examMode || (att.id?.startsWith('practice_') ? 'practice' : 'simulation');
    const length = att.examLength || (att.totalQuestionsCount > 60 || (att.subjectBreakdown?.[0]?.totalQuestions > 20) ? 'standard' : 'quick');
    const isFullMock = mode === 'simulation' && length === 'standard';

    if (isFullMock) {
      return {
        key: 'full_mock',
        badge: '🎯 Full Mock',
        title: 'Official Full Mock Exam',
        volumeLabel: '180 Qs • 120 Mins',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        activeBorder: 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/40'
      };
    }
    if (mode === 'practice' && length === 'standard') {
      return {
        key: 'full_practice',
        badge: '📖 Full Practice',
        title: 'Full Practice & Study Mode',
        volumeLabel: '180 Qs • Study',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        activeBorder: 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400/40'
      };
    }
    if (mode === 'simulation' && length === 'quick') {
      return {
        key: 'quick_test',
        badge: '⏱️ Quick Test',
        title: 'Quick Sprint Test',
        volumeLabel: '45 Qs • 45 Mins',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        activeBorder: 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/40'
      };
    }
    return {
      key: 'quick_practice',
      badge: '💡 Quick Practice',
      title: 'Quick Practice Drill',
      volumeLabel: '45 Qs • Drill',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      activeBorder: 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-400/40'
    };
  };

  // Consolidate all exam attempts taken by candidate
  const historyList = currentUser?.examHistory || [];
  const allAttempts = useMemo(() => {
    const map = new Map();
    if (finalResult && finalResult.id) {
      map.set(finalResult.id, {
        ...finalResult,
        completedAt: finalResult.completedAt || finalResult.dateTaken || new Date().toISOString()
      });
    }
    historyList.forEach(item => {
      const id = item.id || `hist_${item.dateTaken || item.date || Math.random()}`;
      if (!map.has(id)) {
        map.set(id, {
          ...item,
          id,
          candidate: item.candidate || currentUser,
          completedAt: item.dateTaken || item.date || new Date().toISOString()
        });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.completedAt || b.dateTaken || 0) - new Date(a.completedAt || a.dateTaken || 0)
    );
  }, [historyList, finalResult, currentUser]);

  // Filter & Pagination state for attempts
  const [filterMode, setFilterMode] = useState('all');
  const [selectedAttemptId, setSelectedAttemptId] = useState(allAttempts[0]?.id || null);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const attemptsPerPage = 6;

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setAttemptsPage(1);
  };

  const filteredAttempts = useMemo(() => {
    if (filterMode === 'all') return allAttempts;
    return allAttempts.filter(att => getAttemptMeta(att).key === filterMode);
  }, [allAttempts, filterMode]);

  const totalAttemptPages = Math.max(1, Math.ceil(filteredAttempts.length / attemptsPerPage));
  const paginatedAttempts = useMemo(() => {
    return filteredAttempts.slice((attemptsPage - 1) * attemptsPerPage, attemptsPage * attemptsPerPage);
  }, [filteredAttempts, attemptsPage, attemptsPerPage]);

  // Ensure selected attempt resolves accurately
  const activeAttempt = useMemo(() => {
    if (!allAttempts.length) return null;
    const found = allAttempts.find(a => a.id === selectedAttemptId);
    if (found) return found;
    return filteredAttempts[0] || allAttempts[0];
  }, [allAttempts, selectedAttemptId, filteredAttempts]);

  const [activeReviewSubject, setActiveReviewSubject] = useState('english');
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'incorrect' | 'correct' | 'omitted'
  const [reviewPage, setReviewPage] = useState(1);
  const [expandedExplanations, setExpandedExplanations] = useState({});
  const questionsPerPage = 5;

  const handleSubjectChange = (subjId) => {
    setActiveReviewSubject(subjId);
    setReviewPage(1);
  };

  const handleReviewFilterChange = (filter) => {
    setReviewFilter(filter);
    setReviewPage(1);
  };

  if (!activeAttempt) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] py-12 px-4 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-300 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase text-slate-900">No Examination Result Found</h2>
          <p className="text-xs text-slate-500">
            You have not completed any mock examination yet. Please return to the dashboard and start a simulation.
          </p>
          <button
            onClick={() => setPhase('dashboard')}
            className="px-6 py-2.5 bg-[#006633] text-white font-bold text-xs uppercase rounded-lg shadow hover:bg-[#00552b] transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    candidate = currentUser,
    aggregateScore = 0,
    subjectBreakdown = [],
    timeSpentSeconds = 0,
    autoTriggered = false,
    examData = {},
    completedAt,
    dateTaken
  } = activeAttempt;

  const activeMeta = getAttemptMeta(activeAttempt);
  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;

  // Grade Assessment
  let gradeRemark = 'Fair Performance';
  let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  if (activeAttempt.disqualified) {
    gradeRemark = 'DISQUALIFIED (Examination Malpractice - 0 Marks)';
    badgeColor = 'bg-red-100 text-red-950 border-red-500';
  } else if (aggregateScore >= 280) {
    gradeRemark = 'Outstanding Distinction! (Highly Competitive for Top Tier Programmes)';
    badgeColor = 'bg-emerald-100 text-emerald-950 border-emerald-400';
  } else if (aggregateScore >= 240) {
    gradeRemark = 'Very Good (Competitive for University Admission)';
    badgeColor = 'bg-blue-100 text-blue-950 border-blue-400';
  } else if (aggregateScore >= 200) {
    gradeRemark = 'Good (Eligible for Most Degree Programmes)';
    badgeColor = 'bg-slate-100 text-slate-900 border-slate-300';
  } else {
    gradeRemark = 'Below Average (Requires Dedicated Remedial Revision)';
    badgeColor = 'bg-rose-100 text-rose-950 border-rose-300';
  }

  const reviewSubjectData = examData && examData[activeReviewSubject] ? examData[activeReviewSubject] : null;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handlePrint = () => {
    window.print();
  };

  // Attempt count by mode for filter badges
  const fullMockCount = allAttempts.filter(a => getAttemptMeta(a).key === 'full_mock').length;
  const fullPracticeCount = allAttempts.filter(a => getAttemptMeta(a).key === 'full_practice').length;
  const quickTestCount = allAttempts.filter(a => getAttemptMeta(a).key === 'quick_test').length;
  const quickPracticeCount = allAttempts.filter(a => getAttemptMeta(a).key === 'quick_practice').length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex flex-col items-center">
      {/* Promotional Notice for Unapproved Candidates who used Quick Sprint Trial */}
      {currentUser?.status !== 'Approved' && (
        <div className="max-w-4xl w-full mb-4 p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/15 to-amber-500/10 border-2 border-[#006633] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 no-print shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006633] text-white flex items-center justify-center flex-shrink-0 shadow">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900">
                Quick Sprint Free Trial Completed!
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                You have used your 1 complimentary preview trial. Complete candidate examination clearance to unlock unlimited Full Mock simulations, detailed CAPS admission processing, and all study drill modes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhase('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#006633] hover:bg-[#004d25] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow hover:shadow-md transition-all flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span>Unlock Full Access (₦{accessFee}.00)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action Bar (hidden when printing) - 4 Buttons strictly aligned on a single line */}
      <div className="max-w-4xl w-full mb-4 grid grid-cols-4 gap-2 sm:gap-3 no-print">
        <button
          onClick={() => setPhase('dashboard')}
          className="w-full h-11 flex items-center justify-center gap-1.5 px-2 sm:px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
        >
          <span>← Dashboard</span>
        </button>

        <button
          onClick={() => {
            if (currentUser?.status !== 'Approved') {
              setPhase('dashboard');
            } else {
              setPhase('instructions');
            }
          }}
          className="w-full h-11 flex items-center justify-center gap-1.5 px-2 sm:px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
          <span>{currentUser?.status !== 'Approved' ? 'Unlock Portal' : 'Retake Exam'}</span>
        </button>

        <button
          onClick={() => setShowDetailedReview(prev => !prev)}
          className="w-full h-11 flex items-center justify-center gap-1.5 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
        >
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{showDetailedReview ? 'Hide Review' : 'Solution Review'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="w-full h-11 flex items-center justify-center gap-1.5 px-2 sm:px-3 bg-[#006633] hover:bg-[#00552b] text-white rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all whitespace-nowrap active:scale-95"
        >
          <Printer className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Print Result Slip</span>
        </button>
      </div>

      {/* FILTERABLE EXAM ATTEMPTS SELECTOR (Hidden when printing) */}
      <div className="max-w-4xl w-full mb-6 bg-white rounded-2xl border border-slate-300 p-4 sm:p-5 shadow-sm space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#006633]" />
              <span>Completed Examination History Log ({allAttempts.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any exam attempt below to load its individual scoring notification slip and question solutions.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border self-start sm:self-auto">
            Viewing: <strong className="text-[#006633]">{activeMeta.title}</strong>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>

          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            All Exams ({allAttempts.length})
          </button>

          <button
            onClick={() => handleFilterChange('full_mock')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filterMode === 'full_mock'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            🎯 Full Mock ({fullMockCount})
          </button>

          <button
            onClick={() => handleFilterChange('full_practice')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filterMode === 'full_practice'
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
            }`}
          >
            📖 Full Practice ({fullPracticeCount})
          </button>

          <button
            onClick={() => handleFilterChange('quick_test')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filterMode === 'quick_test'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}
          >
            ⏱️ Quick Test ({quickTestCount})
          </button>

          <button
            onClick={() => handleFilterChange('quick_practice')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap border ${
              filterMode === 'quick_practice'
                ? 'bg-purple-700 text-white border-purple-800 shadow-sm'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
          >
            💡 Quick Practice ({quickPracticeCount})
          </button>
        </div>

        {/* Scrollable Attempt Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredAttempts.length === 0 ? (
            <div className="col-span-full p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No examination attempts found under this mode filter.
            </div>
          ) : (
            paginatedAttempts.map((att, idx) => {
              const meta = getAttemptMeta(att);
              const isSelected = activeAttempt.id === att.id;
              const dateStr = att.completedAt || att.dateTaken || att.date;
              const formattedDate = dateStr
                ? new Date(dateStr).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recent';

              return (
                <div
                  key={att.id || idx}
                  onClick={() => setSelectedAttemptId(att.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? meta.activeBorder + ' shadow-md scale-[1.01]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${meta.badgeClass}`}>
                        {meta.badge}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-[#006633] bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Active Slip</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {meta.volumeLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="text-xl font-black font-mono text-[#006633]">
                        {att.aggregateScore}
                        <span className="text-xs font-normal text-slate-500">/400</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {Math.floor((att.timeSpentSeconds || 0) / 60)}m used
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formattedDate}</span>
                    <span className={`font-bold ${isSelected ? 'text-[#006633]' : 'text-slate-400'}`}>
                      {isSelected ? 'Selected' : 'Click to View →'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Attempt Log Pagination Bar */}
        {totalAttemptPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {(attemptsPage - 1) * attemptsPerPage + 1}–{Math.min(attemptsPage * attemptsPerPage, filteredAttempts.length)} of {filteredAttempts.length} attempts
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAttemptsPage(prev => Math.max(1, prev - 1))}
                disabled={attemptsPage === 1}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                  attemptsPage === 1
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="text-slate-700 font-mono font-bold px-2">
                Page {attemptsPage} of {totalAttemptPages}
              </span>
              <button
                type="button"
                onClick={() => setAttemptsPage(prev => Math.min(totalAttemptPages, prev + 1))}
                disabled={attemptsPage === totalAttemptPages}
                className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                  attemptsPage === totalAttemptPages
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CBT Simulation Mock Result Slip Document for Active Selected Attempt */}
      <div id="printable-result-slip" className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border-2 border-slate-300 overflow-hidden mb-8">
        {/* Document Header */}
        <div className="bg-[#006633] text-white p-6 md:p-8 text-center relative border-b-4 border-amber-400">
          <div className="w-16 h-16 mx-auto rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-amber-400 shadow-md mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">CBT</text>
            </svg>
          </div>
          <div className="text-xs uppercase tracking-widest text-amber-300 font-extrabold">
            JAMB Practice Platform
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">
            UTME CBT Practice & Examination Simulation
          </h1>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300 uppercase tracking-wide">
            <span>{activeMeta.title}</span>
            <span>•</span>
            <span>{activeMeta.volumeLabel}</span>
          </div>
        </div>

        {/* Candidate Bio & Aggregate Score Hero */}
        <div className="p-6 md:p-8 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Passport Photo & Info */}
            <div className="flex flex-col items-center sm:items-start md:flex-row gap-4 md:col-span-2">
              <img
                src={candidate.passport}
                alt="Candidate"
                className="w-24 h-28 object-cover border-2 border-slate-400 rounded-lg shadow-sm bg-slate-200 flex-shrink-0"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=Jamb+Candidate&background=006633&color=fff";
                }}
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Candidate Name</div>
                <div className="text-lg font-black text-slate-900 uppercase">{candidate.name}</div>
                <div className="text-xs text-slate-700">
                  Registration Number: <strong className="font-mono text-slate-900">{candidate.regNumber}</strong>
                </div>
                <div className="text-xs text-slate-700">
                  Seat Number: <strong className="font-mono text-slate-900">{candidate.seatNumber}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  Center: <strong>{candidate.center}</strong>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Session Completed: <strong>{completedAt || dateTaken ? new Date(completedAt || dateTaken).toLocaleString() : 'Recent'}</strong>
                </div>
              </div>
            </div>

            {/* Aggregate Score Ring */}
            <div className="bg-slate-50 border-2 border-[#006633] rounded-2xl p-5 text-center flex flex-col items-center justify-center shadow-inner">
              <div className="text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                Aggregate Score
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono text-[#006633] leading-none">
                {aggregateScore}
                <span className="text-lg font-normal text-slate-400">/400</span>
              </div>
              <div className="text-[11px] font-bold text-slate-500 mt-2">
                Time Used: {minutesSpent}m {secondsSpent}s
              </div>
            </div>
          </div>
        </div>

        {/* Malpractice Disqualification Warning Banner if Disqualified */}
        {activeAttempt.disqualified && (
          <div className="bg-rose-50 border-b-2 border-rose-400 p-4 sm:p-5 flex items-start gap-3 text-rose-950">
            <AlertCircle className="w-6 h-6 text-rose-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300">
                  Official Integrity Infraction Notice
                </span>
                <span className="text-xs font-black uppercase text-rose-900">
                  Zero Score Awarded (0 / 400)
                </span>
              </div>
              <h3 className="text-sm font-black text-rose-950 uppercase">
                Session Terminated: Permissible Navigation Tolerances Exceeded
              </h3>
              <p className="text-xs text-rose-900 leading-relaxed">
                This examination session was automatically concluded after recording three consecutive navigation infractions. In accordance with official CBT integrity regulations, your candidate profile has been placed on <strong>Administrative Hold</strong>. You may submit an official representation through the Candidate Appeals channel on your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Remark Banner */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Performance Status: <strong className="text-slate-900">{gradeRemark}</strong></span>
          </div>
          {autoTriggered && (
            <span className="text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded font-mono text-[10px]">
              Auto-Submitted on Timer Expiry
            </span>
          )}
        </div>

        {/* Subject-by-Subject Score Breakdown Table */}
        <div className="p-6 md:p-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
            Subject Performance Breakdown
          </h2>

          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#006633] text-white font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Registered Subject</th>
                  <th className="p-3 text-center">Questions</th>
                  <th className="p-3 text-center">Correct</th>
                  <th className="p-3 text-center">Wrong</th>
                  <th className="p-3 text-center">Unanswered</th>
                  <th className="p-3 text-right">Scaled Score (/100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subjectBreakdown.map((item) => (
                  <tr key={item.subjectId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{item.subjectName}</td>
                    <td className="p-3 text-center font-mono">{item.totalQuestions}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-700">{item.correctCount}</td>
                    <td className="p-3 text-center font-mono text-rose-700">{item.wrongCount}</td>
                    <td className="p-3 text-center font-mono text-slate-400">{item.unansweredCount}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {item.scaledScore ?? item.score ?? 0}
                    </td>
                  </tr>
                ))}
                {/* Total Summary Row */}
                <tr className="bg-slate-100 font-black">
                  <td className="p-3 uppercase text-xs">Total Aggregate</td>
                  <td className="p-3 text-center font-mono">
                    {subjectBreakdown.reduce((sum, i) => sum + i.totalQuestions, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-emerald-800">
                    {subjectBreakdown.reduce((sum, i) => sum + i.correctCount, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-rose-800">
                    {subjectBreakdown.reduce((sum, i) => sum + i.wrongCount, 0)}
                  </td>
                  <td className="p-3 text-center font-mono text-slate-600">
                    {subjectBreakdown.reduce((sum, i) => sum + i.unansweredCount, 0)}
                  </td>
                  <td className="p-3 text-right font-mono text-base text-[#006633]">
                    {aggregateScore} / 400
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Barcode & Security Stamp Simulation */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
            <div className="space-y-0.5 font-mono text-[10px]">
              <div>AUTHENTICATION CODE: {Math.random().toString(36).substring(2, 12).toUpperCase()}-UTME</div>
              <div>CBT SIMULATION PERFORMANCE SUMMARY • INDEPENDENT PRACTICE RESOURCE</div>
              <div className="text-slate-500 font-semibold">NOT AN OFFICIAL GOVERNMENT DOCUMENT • FOR PRACTICE & PREPARATION ONLY</div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex items-center gap-0.5 h-8">
              {[4,2,3,1,5,2,4,1,3,2,6,1,4,2,3,5,2,1,4,3,2,1,5,3,2].map((w, idx) => (
                <div key={idx} className="bg-slate-700 h-full" style={{ width: `${w * 1.5}px` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Solution Review Section (Expandable) */}
      {showDetailedReview && (() => {
        const allSubjectQuestions = (reviewSubjectData?.questions || []).map((q, idx) => {
          const userAns = reviewSubjectData.answers?.[idx];
          const isCorrect = userAns === q.answer;
          const isUnanswered = userAns === undefined || userAns === null;
          return { q, idx, userAns, isCorrect, isUnanswered };
        });

        const correctReviewCount = allSubjectQuestions.filter(x => x.isCorrect).length;
        const omittedReviewCount = allSubjectQuestions.filter(x => x.isUnanswered).length;
        const incorrectReviewCount = allSubjectQuestions.filter(x => !x.isCorrect && !x.isUnanswered).length;

        const filteredReviewQuestions = allSubjectQuestions.filter(x => {
          if (reviewFilter === 'correct') return x.isCorrect;
          if (reviewFilter === 'incorrect') return !x.isCorrect && !x.isUnanswered;
          if (reviewFilter === 'omitted') return x.isUnanswered;
          return true;
        });

        const totalReviewPages = Math.max(1, Math.ceil(filteredReviewQuestions.length / questionsPerPage));
        const paginatedReviewQuestions = filteredReviewQuestions.slice((reviewPage - 1) * questionsPerPage, reviewPage * questionsPerPage);

        const toggleAllExplanations = () => {
          const anyOpen = Object.values(expandedExplanations).some(Boolean);
          if (anyOpen) {
            setExpandedExplanations({});
          } else {
            const allOpen = {};
            allSubjectQuestions.forEach((_, i) => { allOpen[i] = true; });
            setExpandedExplanations(allOpen);
          }
        };

        return (
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border-2 border-slate-300 p-4 sm:p-6 md:p-8 space-y-5 no-print">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-sm sm:text-base font-black uppercase text-slate-900 tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700" />
                  <span>Question &amp; Solution Review</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paginated solutions &amp; step-by-step explanations for this examination attempt.
                </p>
              </div>

              {/* Subject Selector Tabs */}
              <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto">
                {subjectBreakdown.map((item) => (
                  <button
                    key={item.subjectId}
                    onClick={() => handleSubjectChange(item.subjectId)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all uppercase whitespace-nowrap text-center ${
                      activeReviewSubject === item.subjectId
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {item.subjectName.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters & Pagination Bar */}
            {allSubjectQuestions.length > 0 && (
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleReviewFilterChange('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reviewFilter === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    All ({allSubjectQuestions.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewFilterChange('incorrect')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reviewFilter === 'incorrect'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    ❌ Incorrect ({incorrectReviewCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewFilterChange('correct')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reviewFilter === 'correct'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    ✅ Correct ({correctReviewCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewFilterChange('omitted')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      reviewFilter === 'omitted'
                        ? 'bg-slate-600 text-white shadow-sm'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                    }`}
                  >
                    ⚪ Omitted ({omittedReviewCount})
                  </button>
                </div>

                {/* Right controls: Jump Dropdown & Accordion toggle */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <button
                    type="button"
                    onClick={toggleAllExplanations}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{Object.values(expandedExplanations).some(Boolean) ? 'Collapse Explanations' : 'Expand All'}</span>
                  </button>

                  {totalReviewPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-medium">Page:</span>
                      <select
                        value={reviewPage}
                        onChange={(e) => setReviewPage(Number(e.target.value))}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                      >
                        {Array.from({ length: totalReviewPages }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} of {totalReviewPages}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Question Review List for Active Subject */}
            <div className="space-y-4">
              {allSubjectQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  Detailed question-by-question review is only saved for tests completed during the active session. Aggregate scores and subject breakdown above are securely recorded.
                </div>
              ) : filteredReviewQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  No questions found under the "{reviewFilter}" filter.
                </div>
              ) : (
                paginatedReviewQuestions.map(({ q, idx, userAns, isCorrect, isUnanswered }) => {
                  const isExplanationOpen = !!expandedExplanations[idx];

                  return (
                    <div
                      key={idx}
                      className={`p-4 md:p-5 rounded-xl border-2 transition-all ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : isUnanswered
                          ? 'border-slate-300 bg-slate-50/30'
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Question {idx + 1} of {allSubjectQuestions.length}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Correct (+1)</span>
                            </span>
                          ) : isUnanswered ? (
                            <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                              Omitted (0)
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Incorrect (0)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Passage if comprehension */}
                      {q.passage && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 mb-3 text-xs md:text-sm text-slate-800 font-serif whitespace-pre-line max-h-48 overflow-y-auto">
                          <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5 font-sans text-xs">
                            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                            <span>{typeof q.passage === 'object' ? (q.passage.title || 'Reading Passage') : 'Reading Passage'}</span>
                          </div>
                          <div>{typeof q.passage === 'object' ? q.passage.text : q.passage}</div>
                        </div>
                      )}

                      <div className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 leading-relaxed whitespace-pre-line select-text">
                        {typeof q.question === 'object' ? (q.question.text || JSON.stringify(q.question)) : q.question}
                      </div>

                      {q.image && (
                        <div className="mb-3 flex justify-center">
                          <img src={q.image} alt="Question Diagram" className="max-h-48 object-contain rounded border p-1 bg-white" />
                        </div>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((optText, optIdx) => {
                          const isChosen = userAns === optIdx;
                          const isModelAnswer = q.answer === optIdx;

                          let optClass = 'bg-white border-slate-200 text-slate-700';
                          if (isModelAnswer) {
                            optClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isChosen && !isCorrect) {
                            optClass = 'bg-rose-100 border-rose-400 text-rose-950 font-medium';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-lg border flex items-center gap-2 ${optClass}`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center font-mono text-[10px]">
                                {optionLetters[optIdx]}
                              </span>
                              <span className="flex-1 select-text">
                                {typeof optText === 'object' ? (optText.text || JSON.stringify(optText)) : optText}
                              </span>
                              {isModelAnswer && (
                                <span className="text-[10px] font-bold text-emerald-800 uppercase bg-white px-1.5 py-0.5 rounded border border-emerald-300">
                                  Correct
                                </span>
                              )}
                              {isChosen && !isModelAnswer && (
                                <span className="text-[10px] font-bold text-rose-800 uppercase bg-white px-1.5 py-0.5 rounded border border-rose-300">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Solution Explanation Accordion Toggle */}
                      {q.explanation && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedExplanations(prev => ({ ...prev, [idx]: !prev[idx] }))}
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{isExplanationOpen ? 'Hide Model Explanation ▲' : 'View Model Explanation ▼'}</span>
                          </button>
                          {isExplanationOpen && (
                            <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-xs text-blue-950 select-text leading-relaxed animate-in fade-in">
                              <span className="font-bold">Explanation: </span>
                              <span>{typeof q.explanation === 'object' ? (q.explanation.text || JSON.stringify(q.explanation)) : q.explanation}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Question Pagination Bar */}
            {totalReviewPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(reviewPage - 1) * questionsPerPage + 1}–{Math.min(reviewPage * questionsPerPage, filteredReviewQuestions.length)} of {filteredReviewQuestions.length} questions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewPage(prev => Math.max(1, prev - 1))}
                    disabled={reviewPage === 1}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      reviewPage === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous 5</span>
                  </button>
                  <span className="text-slate-700 font-mono font-bold px-2">
                    Page {reviewPage} of {totalReviewPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                    disabled={reviewPage === totalReviewPages}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      reviewPage === totalReviewPages
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    <span>Next 5</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
