import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import { apiGetSupportTickets, apiSubmitSupportTicket } from '../../services/dbService';
import {
  HelpCircle,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Mail,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  BookOpen,
  User,
  Monitor,
  PhoneCall
} from 'lucide-react';

export const SupportDeskModal = ({ isOpen, onClose }) => {
  const { currentUser } = useExam();
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history' | 'direct'
  const [category, setCategory] = useState('payment');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successTicket, setSuccessTicket] = useState(null);

  const [myTickets, setMyTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      loadTickets();
    }
  }, [isOpen, currentUser]);

  const loadTickets = async () => {
    if (!currentUser?.id) return;
    setIsLoadingTickets(true);
    try {
      const tickets = await apiGetSupportTickets(currentUser.id);
      setMyTickets(tickets);
    } catch (e) {
      console.warn('Failed to load candidate support tickets:', e);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('Please enter a brief subject for your inquiry.');
      return;
    }
    if (!message.trim() || message.trim().length < 15) {
      setErrorMsg('Please describe your inquiry in detail (minimum 15 characters).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await apiSubmitSupportTicket({
        candidateId: currentUser.id,
        category,
        subject: subject.trim(),
        message: message.trim()
      });

      if (res && res.success) {
        setSuccessTicket(res.ticket);
        setSubject('');
        setMessage('');
        loadTickets();
      } else {
        setErrorMsg(res?.error || 'Unable to submit support ticket. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error communicating with the support desk.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Support Desk, I am candidate ${currentUser.name} (Practice ID: ${currentUser.practiceId || currentUser.regNumber}). I need assistance regarding: `
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#004d25] p-4 sm:p-5 text-white relative border-b-4 border-amber-400">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/90 text-amber-300 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border border-emerald-400/30">
              <HelpCircle className="w-3 h-3" />
              <span>Candidate Help Desk &amp; Inquiries</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
            Support Desk &amp; Candidate Assistance
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Direct communication channel with CBT simulation administrators
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-emerald-700/60 overflow-x-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('new'); setSuccessTicket(null); setErrorMsg(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white text-[#006633] shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Inquiry</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); loadTickets(); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-[#006633] shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>My Inquiries</span>
              {myTickets.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'history' ? 'bg-emerald-100 text-[#006633]' : 'bg-emerald-800 text-white'
                }`}>
                  {myTickets.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-white text-[#006633] shadow-sm'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Direct Hotlines</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">

          {/* TAB 1: New Ticket */}
          {activeTab === 'new' && (
            <div className="space-y-4">
              {/* Candidate Info Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Candidate Profile:</span>
                  <strong className="text-slate-900 font-bold uppercase">{currentUser.name}</strong>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Practice ID &amp; Reg No:</span>
                  <span className="font-mono font-bold text-[#006633]">{currentUser.practiceId || 'N/A'} • {currentUser.regNumber}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Registered Email:</span>
                  <span className="font-mono text-slate-700">{currentUser.email}</span>
                </div>
              </div>

              {successTicket ? (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-emerald-950">
                      Inquiry Successfully Transmitted
                    </h3>
                    <p className="text-xs text-emerald-800 mt-1">
                      Tracking Reference: <strong className="font-mono">{successTicket.id}</strong>
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    An acknowledgment email has been dispatched to <strong>{currentUser.email}</strong>. A support officer is reviewing your submission and will post the official resolution directly here.
                  </p>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('history')}
                      className="px-4 py-2 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      View Ticket History
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuccessTicket(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                      Inquiry Classification:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setCategory('payment')}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                          category === 'payment'
                            ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-1 ring-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Payment &amp; License</div>
                          <div className="text-[10px] font-normal text-slate-500">Paystack / Concessions</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('academic')}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                          category === 'academic'
                            ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-1 ring-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Subject &amp; Choices</div>
                          <div className="text-[10px] font-normal text-slate-500">Advisory &amp; Combos</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('account')}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                          category === 'account'
                            ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-1 ring-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Bio-Data Correction</div>
                          <div className="text-[10px] font-normal text-slate-500">Profile / Name / Contact</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('exam')}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                          category === 'exam'
                            ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-1 ring-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Exam &amp; Questions</div>
                          <div className="text-[10px] font-normal text-slate-500">Simulator / Feedback</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCategory('technical')}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 sm:col-span-2 ${
                          category === 'technical'
                            ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-1 ring-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Monitor className="w-4 h-4 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Technical &amp; Browser Glitch</div>
                          <div className="text-[10px] font-normal text-slate-500">Fullscreen / Network / Sessions</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Subject / Brief Summary:
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Card debited but portal still shows pending clearance"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633] focus:outline-none"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Detailed Explanation:
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide full details, including any Paystack transaction reference, subject name, or error notification encountered..."
                      className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633] focus:outline-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>Minimum 15 characters required</span>
                      <span>{message.trim().length} characters</span>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !subject.trim() || message.trim().length < 15}
                      className="px-6 py-2.5 bg-[#006633] hover:bg-[#00552b] active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transmitting to Desk...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Support Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: History & Replies */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="text-xs text-slate-600 font-medium">
                  Showing <strong>{myTickets.length}</strong> logged support inquiries for your profile
                </div>
                <button
                  type="button"
                  onClick={loadTickets}
                  disabled={isLoadingTickets}
                  className="text-xs text-[#006633] hover:underline font-bold"
                >
                  {isLoadingTickets ? 'Refreshing...' : 'Refresh List'}
                </button>
              </div>

              {myTickets.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No Support Inquiries Submitted Yet</div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    When you encounter any issue or need assistance, submit an inquiry from the first tab and our desk will respond here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('new')}
                    className="mt-2 px-4 py-2 bg-[#006633] text-white rounded-lg text-xs font-bold uppercase transition-all"
                  >
                    Submit First Inquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myTickets.map((t) => (
                    <div
                      key={t.id}
                      className={`border rounded-xl p-4 transition-all space-y-3 ${
                        t.status === 'resolved'
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : t.status === 'in_progress'
                          ? 'border-blue-300 bg-blue-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#006633]">{t.id}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {t.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{t.subject}</h4>
                        </div>

                        <div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            t.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : t.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {t.status === 'resolved' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Resolved</span>
                              </>
                            ) : t.status === 'in_progress' ? (
                              <>
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>In Review</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Open</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Original Question */}
                      <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Your Submission:</div>
                        <p className="whitespace-pre-wrap">{t.message}</p>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Logged: {new Date(t.createdAt).toLocaleString()}
                        </div>
                      </div>

                      {/* Admin Reply */}
                      {t.adminReply ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-900">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Administrator Resolution ({t.adminRepliedBy || 'Desk Officer'}):</span>
                            </span>
                            <span className="font-mono text-emerald-700 font-normal">
                              {t.resolvedAt ? new Date(t.resolvedAt).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                          <div className="text-emerald-950 font-medium leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-emerald-600">
                            {t.adminReply}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span>Inquiry is currently in queue. You will receive an email resolution as soon as processed.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Direct Hotlines */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="font-bold text-xs uppercase text-emerald-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006633]" />
                  <span>Immediate Candidate Support Service</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  For time-sensitive inquiries during exam sessions or payment verifications, reach out through our official channels with your Candidate Practice ID: <strong>{currentUser.practiceId || currentUser.regNumber}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* WhatsApp Channel */}
                <a
                  href={`https://wa.me/2348000000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#006633] hover:shadow-md transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-[#006633] text-[10px] font-bold uppercase">
                      Fastest Response
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#006633]" />
                  </div>
                  <div className="font-black text-sm text-slate-900 uppercase">
                    WhatsApp Desk Chat
                  </div>
                  <p className="text-xs text-slate-500">
                    Direct instant chat with an active CBT support agent with pre-filled candidate identification.
                  </p>
                  <div className="text-xs font-bold text-[#006633] pt-1">
                    Open WhatsApp Chat &rarr;
                  </div>
                </a>

                {/* Email Channel */}
                <a
                  href={`mailto:hello@pauladisa.com?subject=Candidate%20Support%20Inquiry%20-%20${encodeURIComponent(currentUser.practiceId || currentUser.regNumber)}`}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#006633] hover:shadow-md transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      Official Records
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
                  </div>
                  <div className="font-black text-sm text-slate-900 uppercase">
                    Official Support Email
                  </div>
                  <p className="text-xs text-slate-500">
                    Transmits directly to central administration at <code className="font-mono text-slate-700">hello@pauladisa.com</code>.
                  </p>
                  <div className="text-xs font-bold text-blue-700 pt-1">
                    Compose Support Email &rarr;
                  </div>
                </a>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Operational Hours:</div>
                <p>Monday – Saturday: 8:00 AM – 8:00 PM (WAT). Inquiries submitted outside these hours are answered first thing the following morning.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Independent UTME CBT Simulator • Support Desk</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 uppercase"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
