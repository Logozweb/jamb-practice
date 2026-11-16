import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { AVAILABLE_SUBJECTS, FACULTY_COMBINATIONS } from '../data/subjects';
import { BookOpen, User, Sparkles, Check, Clock, Award, ShieldAlert, Globe, ArrowLeft } from 'lucide-react';

export const SetupModal = () => {
  const {
    candidate,
    setCandidate,
    selectedSubjectIds,
    setSelectedSubjectIds,
    examMode,
    setExamMode,
    examLength,
    setExamLength,
    setPhase,
    apiSource
  } = useExam();

  const [activeFacultyIndex, setActiveFacultyIndex] = useState(0);

  const handleApplyPreset = (combination, index) => {
    setActiveFacultyIndex(index);
    setSelectedSubjectIds([...combination.subjects]);
  };

  const handleToggleSubject = (subId) => {
    if (subId === 'english') return; // English is mandatory

    if (selectedSubjectIds.includes(subId)) {
      if (selectedSubjectIds.length > 2) {
        setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subId));
        setActiveFacultyIndex(-1); // custom
      }
    } else {
      if (selectedSubjectIds.length < 4) {
        setSelectedSubjectIds([...selectedSubjectIds, subId]);
        setActiveFacultyIndex(-1);
      }
    }
  };

  const handleProceed = () => {
    if (selectedSubjectIds.length !== 4) {
      alert("A valid JAMB candidate profile requires exactly 4 registered subjects. (Use of English is compulsory).");
      return;
    }
    setPhase('instructions');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#006633] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-amber-400">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-amber-400 shadow-md flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
                <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
                <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
                <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
              </svg>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-300 font-extrabold">
                JAMB Practice Platform
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase">
                JAMB Simulation Platform
              </h1>
              <p className="text-xs text-emerald-100 mt-0.5">
                Configure your 4-Subject Combination & Exam Simulation Settings
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 self-start md:self-auto text-right">
            <div className="text-[10px] text-amber-300 uppercase font-bold tracking-wider">Target Examination</div>
            <div className="text-sm font-black text-white">2026/2027 UTME</div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Section 1: Candidate Verification Info */}
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#006633]" />
              <span>1. Candidate Profile</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  value={candidate.name}
                  onChange={(e) => setCandidate({ ...candidate, name: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 font-bold text-sm text-slate-900 uppercase"
                  placeholder="e.g. OBI CHUKWUEMEKA EMMANUEL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={candidate.regNumber}
                  onChange={(e) => setCandidate({ ...candidate, regNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 font-mono font-bold text-sm text-slate-900"
                  placeholder="e.g. 202610482910EB"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Examination Centre
                </label>
                <input
                  type="text"
                  value={candidate.center}
                  onChange={(e) => setCandidate({ ...candidate, center: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Assigned Seat Number
                </label>
                <input
                  type="text"
                  value={candidate.seatNumber}
                  onChange={(e) => setCandidate({ ...candidate, seatNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 font-mono font-bold text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Subject Combinations */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#006633]" />
                <span>2. 4-Subject Combination Selection</span>
              </h2>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedSubjectIds.length === 4
                  ? 'bg-emerald-100 text-[#006633]'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedSubjectIds.length}/4 Selected
              </span>
            </div>

            {/* Quick Faculty Presets */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Combination Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {FACULTY_COMBINATIONS.map((fac, idx) => {
                  const isPresetActive = activeFacultyIndex === idx;
                  return (
                    <button
                      key={fac.name}
                      onClick={() => handleApplyPreset(fac, idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isPresetActive
                          ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {fac.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Checkbox Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                const isCompulsory = sub.compulsory;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleToggleSubject(sub.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/70 border-[#006633] text-[#006633] shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sub.icon}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold leading-tight">
                          {sub.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sub.code} {isCompulsory && '• Compulsory'}
                        </div>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#006633] border-[#006633] text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Exam Mode & Test Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-[#006633]" />
                <span>3. Simulation Mode</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExamMode('simulation')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    examMode === 'simulation'
                      ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-[#006633] mb-1">
                    🎯 Real JAMB Exam Mode
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    Strict 2-hour countdown clock, no answers revealed during exam. True simulation.
                  </div>
                </button>

                <button
                  onClick={() => setExamMode('practice')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    examMode === 'practice'
                      ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-blue-700 mb-1">
                    📖 Practice & Study Mode
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    Instant answer checks, solution explanations for mistakes, untimed exploration.
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#006633]" />
                <span>4. Question Volume</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExamLength('standard')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    examLength === 'standard'
                      ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-[#006633] mb-1">
                    Full UTME (180 Qs)
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    60 English + 40 × 3 electives. Standard examination length (2 hours).
                  </div>
                </button>

                <button
                  onClick={() => setExamLength('quick')}
                  className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                    examLength === 'quick'
                      ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-blue-700 mb-1">
                    Quick Sprint (45 Qs)
                  </div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    15 English + 10 × 3 electives. Ideal for fast speed and drill revisions.
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Proceed Button */}
        <div className="bg-slate-100 p-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPhase('dashboard')}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Candidate Dashboard</span>
          </button>

          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#006633] hover:bg-[#00552b] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Examination Hall</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
