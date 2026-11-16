import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import {
  NIGERIAN_UNIVERSITIES,
  NIGERIAN_POLYTECHNICS,
  NIGERIAN_COLLEGES_OF_EDUCATION,
  POPULAR_COURSES
} from '../../data/institutions';
import { SearchableSelect } from '../common/SearchableSelect';
import { X, Building, Check, Sparkles } from 'lucide-react';

export const ChoicesModal = ({ isOpen, onClose }) => {
  const { currentUser, updateCandidateChoices } = useExam();

  const [firstInst, setFirstInst] = useState(currentUser?.firstChoice?.institution || NIGERIAN_UNIVERSITIES[0]);
  const [firstCourse, setFirstCourse] = useState(currentUser?.firstChoice?.course || 'Medicine and Surgery');

  const [secondInst, setSecondInst] = useState(currentUser?.secondChoice?.institution || NIGERIAN_UNIVERSITIES[9]);
  const [secondCourse, setSecondCourse] = useState(currentUser?.secondChoice?.course || 'Medicine and Surgery');

  const [thirdInst, setThirdInst] = useState(currentUser?.thirdChoice?.institution || NIGERIAN_POLYTECHNICS[0]);
  const [thirdCourse, setThirdCourse] = useState(currentUser?.thirdChoice?.course || 'Science Laboratory Technology (SLT)');

  const [fourthInst, setFourthInst] = useState(currentUser?.fourthChoice?.institution || NIGERIAN_COLLEGES_OF_EDUCATION[0]);
  const [fourthCourse, setFourthCourse] = useState(currentUser?.fourthChoice?.course || 'Biology Education');

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateCandidateChoices({
      firstChoice: {
        institution: firstInst,
        course: firstCourse,
        faculty: currentUser?.firstChoice?.faculty || 'Degree'
      },
      secondChoice: {
        institution: secondInst,
        course: secondCourse,
        faculty: 'Degree/Polytechnic'
      },
      thirdChoice: {
        institution: thirdInst,
        course: thirdCourse,
        faculty: 'Polytechnic Technology'
      },
      fourthChoice: {
        institution: fourthInst,
        course: fourthCourse,
        faculty: 'Education/IEI'
      }
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#004d25] p-5 text-white flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <Building className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">
                Tertiary Institution Choices
              </h2>
              <p className="text-xs text-emerald-200">
                Preferred Tertiary Institutions (1st, 2nd, 3rd & 4th Choice)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Institutional choices updated successfully!</span>
            </div>
          )}

          {/* 1st Choice */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-[#006633] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#006633] text-white flex items-center justify-center text-[10px]">1</span>
                <span>1st Choice (Degree Awarding Institution)</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Federal / State University</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Preferred Institution (All 240+ Nigerian Universities)
                </label>
                <SearchableSelect
                  value={firstInst}
                  onChange={(val) => setFirstInst(val)}
                  placeholder="Type or select university..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Programme / Course of Study</label>
                <input
                  type="text"
                  value={firstCourse}
                  onChange={(e) => setFirstCourse(e.target.value)}
                  placeholder="e.g. Medicine and Surgery"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2nd Choice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>2nd Choice (Degree or Polytechnic)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Alternative University / Poly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Preferred Institution</label>
                <SearchableSelect
                  value={secondInst}
                  onChange={(val) => setSecondInst(val)}
                  placeholder="Select university or polytechnic..."
                  includePolytechnics={true}
                  polytechnicsList={NIGERIAN_POLYTECHNICS}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Programme / Course of Study</label>
                <input
                  type="text"
                  value={secondCourse}
                  onChange={(e) => setSecondCourse(e.target.value)}
                  placeholder="e.g. Physiology or Computer Science"
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 3rd Choice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
                <span>3rd Choice (Polytechnic / Monotechnic)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">National Diploma (ND)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Preferred Polytechnic</label>
                <select
                  value={thirdInst}
                  onChange={(e) => setThirdInst(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
                >
                  {NIGERIAN_POLYTECHNICS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Programme / ND Course</label>
                <input
                  type="text"
                  value={thirdCourse}
                  onChange={(e) => setThirdCourse(e.target.value)}
                  placeholder="e.g. Science Laboratory Technology"
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 4th Choice */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">4</span>
                <span>4th Choice (College of Education / IEI)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">NCE / Innovative Enterprise</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Preferred College</label>
                <select
                  value={fourthInst}
                  onChange={(e) => setFourthInst(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white"
                >
                  {NIGERIAN_COLLEGES_OF_EDUCATION.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Programme / NCE Course</label>
                <input
                  type="text"
                  value={fourthCourse}
                  onChange={(e) => setFourthCourse(e.target.value)}
                  placeholder="e.g. Biology Education"
                  className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#006633] hover:bg-[#00552b] text-white font-bold text-xs uppercase rounded-lg shadow transition-all"
            >
              Save Preferred Choices
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
