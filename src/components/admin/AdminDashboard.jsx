import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS } from '../../data/subjects';
import { testAlocApiKey } from '../../services/jambApiService';
import { apiGetExamResults } from '../../services/dbService';
import {
  getEmailSettings,
  fetchEmailSettings,
  saveEmailSettings,
  getOtpOutboxLogs,
  fetchOtpOutboxLogs,
  clearOutboxLogs,
  sendTestEmail,
  getGoogleAuthStatus,
  getGoogleAuthUrl,
  saveGoogleManualToken,
  disconnectGoogleAuth
} from '../../services/emailService';
import {
  fetchAdminPaymentSettings,
  saveAdminPaymentSettings,
  fetchPaymentTransactions
} from '../../services/paymentService';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Settings,
  Award,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Key,
  LogOut,
  ArrowLeft,
  Check,
  Filter,
  Mail,
  Send,
  RefreshCw,
  Inbox,
  UserPlus,
  Plus,
  Copy,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { SearchableSelect } from '../common/SearchableSelect';

export const AdminDashboard = () => {
  const {
    candidates,
    refreshCandidates,
    approveCandidate,
    disapproveCandidate,
    deleteCandidate,
    registerCandidate,
    adminLogout,
    setPhase,
    examSettings,
    updateExamSettings,
    currentAdmin,
    updateAdminPassword,
    setAdminDirectPassword
  } = useExam();

  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' | 'email' | 'api' | 'settings' | 'results'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Email & OTP Gateway State
  const [emailConfig, setEmailConfig] = useState(getEmailSettings);
  const [outboxLogs, setOutboxLogs] = useState(getOtpOutboxLogs);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [emailSettingsSaved, setEmailSettingsSaved] = useState(false);

  // Google Gmail API OAuth State
  const [googleAuthStatus, setGoogleAuthStatus] = useState({ configured: true, connected: false });
  const [googleManualRefreshToken, setGoogleManualRefreshToken] = useState('');
  const [googleManualEmail, setGoogleManualEmail] = useState('hello@pauladisa.com');
  const [isVerifyingGoogleToken, setIsVerifyingGoogleToken] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(null);
  const [copiedRedirectUri, setCopiedRedirectUri] = useState(false);

  // Persistent SQLite Exam Results Log
  const [dbExamResults, setDbExamResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const loadExamResults = async () => {
    setIsLoadingResults(true);
    try {
      const rows = await apiGetExamResults();
      if (Array.isArray(rows)) {
        setDbExamResults(rows);
      }
    } catch (e) {
      console.warn('Failed loading exam results:', e);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Paystack Payment & Gateway State
  const [paymentConfig, setPaymentConfig] = useState({
    enabled: true,
    accessFeeNaira: 50,
    paystackPublicKey: '',
    paystackSecretKey: ''
  });
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentSavedNotice, setPaymentSavedNotice] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const loadPaymentData = async () => {
    setIsLoadingPayments(true);
    try {
      const [settings, txs] = await Promise.all([
        fetchAdminPaymentSettings(),
        fetchPaymentTransactions()
      ]);
      if (settings) setPaymentConfig(settings);
      if (Array.isArray(txs)) setPaymentTransactions(txs);
    } catch (e) {
      console.warn('Failed loading payment data:', e);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    refreshCandidates();
    loadPaymentData();
  }, []);

  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    const updated = await saveAdminPaymentSettings(paymentConfig);
    if (updated) setPaymentConfig(updated);
    setPaymentSavedNotice(true);
    setTimeout(() => setPaymentSavedNotice(false), 3000);
  };

  // Disapproval modal state
  const [disapproveTargetId, setDisapproveTargetId] = useState(null);
  const [disapprovalReason, setDisapprovalReason] = useState('Passport photo or bio-data verification failed.');

  // Candidate detail inspect modal state
  const [inspectTarget, setInspectTarget] = useState(null);

  // Admin add candidate modal state
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [newCandName, setNewCandName] = useState('');
  const [newCandEmail, setNewCandEmail] = useState('');
  const [newCandPhone, setNewCandPhone] = useState('');
  const [newCandGender, setNewCandGender] = useState('Male');
  const [newCandDob, setNewCandDob] = useState('2006-05-15');
  const [newCandPass, setNewCandPass] = useState('password123');
  const [newCandCourse, setNewCandCourse] = useState('Medicine and Surgery');
  const [newCandInst, setNewCandInst] = useState('University of Ibadan (UI)');
  const [newCandSubs, setNewCandSubs] = useState(['english', 'biology', 'chemistry', 'physics']);
  const [newCandError, setNewCandError] = useState('');
  const [newCandSuccess, setNewCandSuccess] = useState(false);

  // Local settings copy for editing
  const [tempSettings, setTempSettings] = useState({ ...examSettings });
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    setTempSettings({ ...examSettings });
  }, [examSettings]);

  // Admin password change state
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      setPassError('New password must be at least 6 characters in length.');
      return;
    }
    let res;
    if (oldPass) {
      res = updateAdminPassword(currentAdmin?.email || 'hello@pauladisa.com', oldPass, newPass);
    } else {
      res = setAdminDirectPassword(newPass);
    }

    if (res.success) {
      setPassSuccess(true);
      setPassError('');
      setOldPass('');
      setNewPass('');
      setTimeout(() => setPassSuccess(false), 4000);
    } else {
      setPassError(res.error);
    }
  };

  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    await saveEmailSettings(emailConfig);
    setEmailSettingsSaved(true);
    setTimeout(() => setEmailSettingsSaved(false), 3500);
  };

  useEffect(() => {
    fetchEmailSettings().then(setEmailConfig);
    fetchOtpOutboxLogs().then(setOutboxLogs);
    loadExamResults();

    const hash = window.location.hash || '';
    if (hash.includes('gmail_connected=true')) {
      setActiveTab('email');
      const emailParam = decodeURIComponent(hash.split('email=')[1]?.split('&')[0] || 'hello@pauladisa.com');
      setGoogleNotice({
        type: 'success',
        message: `Google Gmail API authorized and connected successfully! Sending from ${emailParam}.`
      });
      getGoogleAuthStatus().then(setGoogleAuthStatus);
    } else if (hash.includes('gmail_error=')) {
      setActiveTab('email');
      const errorMsg = decodeURIComponent(hash.split('gmail_error=')[1]?.split('&')[0] || 'Unknown error');
      setGoogleNotice({
        type: 'error',
        message: `Google Authorization Notice: ${errorMsg}`
      });
      getGoogleAuthStatus().then(setGoogleAuthStatus);
    }

    getGoogleAuthStatus().then(setGoogleAuthStatus);
  }, []);

  const handleStartGoogleAuth = async () => {
    try {
      const data = await getGoogleAuthUrl();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setGoogleNotice({ type: 'error', message: `Failed to initiate Google authorization: ${e.message}` });
    }
  };

  const handleSaveManualGoogleToken = async (e) => {
    e.preventDefault();
    if (!googleManualRefreshToken.trim()) return;
    setIsVerifyingGoogleToken(true);
    setGoogleNotice(null);

    const res = await saveGoogleManualToken(googleManualRefreshToken.trim(), googleManualEmail.trim());
    setIsVerifyingGoogleToken(false);
    if (res.success) {
      setGoogleNotice({ type: 'success', message: `Google Refresh Token verified! Sending from ${res.email}.` });
      setGoogleManualRefreshToken('');
      getGoogleAuthStatus().then(setGoogleAuthStatus);
    } else {
      setGoogleNotice({ type: 'error', message: `Token verification failed: ${res.error}` });
    }
  };

  const handleDisconnectGoogle = async () => {
    if (confirm('Disconnect Google Gmail API? Emails will fall back to other providers.')) {
      await disconnectGoogleAuth();
      getGoogleAuthStatus().then(setGoogleAuthStatus);
      setGoogleNotice({ type: 'info', message: 'Gmail API disconnected.' });
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setTestEmailResult({ success: false, error: 'Please enter a valid recipient email address.' });
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult(null);

    const res = await sendTestEmail(testEmailAddress);
    setIsSendingTestEmail(false);
    setTestEmailResult(res);
    const logs = await fetchOtpOutboxLogs();
    setOutboxLogs(logs);
  };

  const handleClearOutbox = async () => {
    if (confirm('Clear all OTP dispatch outbox logs?')) {
      await clearOutboxLogs();
      setOutboxLogs([]);
    }
  };

  const handleRefreshOutbox = async () => {
    const logs = await fetchOtpOutboxLogs();
    setOutboxLogs(logs);
  };

  // Calculations for KPI Cards
  const totalCandidates = candidates.length;
  const approvedCount = candidates.filter(c => c.status === 'Approved').length;
  const pendingCount = candidates.filter(c => c.status === 'Pending').length;
  const disapprovedCount = candidates.filter(c => c.status === 'Disapproved').length;

  // Combine persistent SQLite database results and local candidate histories (FILTERED TO FULL MOCK EXAMS ONLY)
  const allExamSubmissions = (dbExamResults.length > 0
    ? dbExamResults
    : candidates.flatMap(c =>
        (c.examHistory || []).map(h => ({
          ...h,
          candidateName: c.name,
          candidateReg: c.regNumber,
          regNumber: c.regNumber,
          candidateEmail: c.email
        }))
      )
  )
    .filter(sub => {
      // Exclude test / quick exams: only log Full Mock exams
      if (sub.examType === 'test' || sub.examLength === 'quick') return false;
      if (String(sub.id || '').startsWith('test_')) return false;
      const totalQ = (sub.subjectBreakdown || []).reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
      if (totalQ > 0 && totalQ <= 60) return false;
      return true;
    })
    .sort((a, b) => new Date(b.dateTaken || b.date || 0) - new Date(a.dateTaken || a.date || 0));

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (c.status || 'Approved') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination states & slices
  const [candPage, setCandPage] = useState(1);
  const candPerPage = 10;
  const totalCandPages = Math.max(1, Math.ceil(filteredCandidates.length / candPerPage));
  const paginatedCandidates = filteredCandidates.slice((candPage - 1) * candPerPage, candPage * candPerPage);

  const [outboxPage, setOutboxPage] = useState(1);
  const outboxPerPage = 10;
  const totalOutboxPages = Math.max(1, Math.ceil(outboxLogs.length / outboxPerPage));
  const paginatedOutbox = outboxLogs.slice((outboxPage - 1) * outboxPerPage, outboxPage * outboxPerPage);

  const [resultsPage, setResultsPage] = useState(1);
  const resultsPerPage = 10;
  const totalResultsPages = Math.max(1, Math.ceil(allExamSubmissions.length / resultsPerPage));
  const paginatedResults = allExamSubmissions.slice((resultsPage - 1) * resultsPerPage, resultsPage * resultsPerPage);

  const filteredPayments = paymentTransactions.filter(p => {
    const term = paymentSearchTerm.toLowerCase();
    return (
      (p.reference || '').toLowerCase().includes(term) ||
      (p.candidateName || '').toLowerCase().includes(term) ||
      (p.candidateEmail || '').toLowerCase().includes(term)
    );
  });
  const paymentPerPage = 10;
  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / paymentPerPage));
  const paginatedPayments = filteredPayments.slice((paymentPage - 1) * paymentPerPage, paymentPage * paymentPerPage);
  const totalRevenueKobo = paymentTransactions
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + (p.amountKobo || 0), 0);

  const handleConfirmDisapprove = () => {
    if (disapproveTargetId) {
      disapproveCandidate(disapproveTargetId, disapprovalReason);
      setDisapproveTargetId(null);
    }
  };

  const handleCreateCandidate = (e) => {
    e.preventDefault();
    if (!newCandName.trim()) {
      setNewCandError('Please enter candidate full name.');
      return;
    }
    if (!newCandEmail.trim() || !newCandEmail.includes('@')) {
      setNewCandError('Please enter a valid candidate email address.');
      return;
    }
    if (newCandSubs.length !== 4) {
      setNewCandError('Candidate must have exactly 4 UTME subjects (English is compulsory).');
      return;
    }

    registerCandidate({
      name: newCandName.trim(),
      email: newCandEmail.trim(),
      phone: newCandPhone.trim() || '080' + Math.floor(10000000 + Math.random() * 90000000),
      gender: newCandGender,
      dob: newCandDob,
      password: newCandPass || 'password123',
      status: 'Approved',
      emailVerified: true,
      selectedSubjects: newCandSubs,
      targetCourse: newCandCourse,
      firstChoice: {
        institution: newCandInst,
        course: newCandCourse,
        faculty: 'Degree'
      }
    });

    setNewCandSuccess(true);
    setTimeout(() => {
      setNewCandSuccess(false);
      setIsAddCandidateOpen(false);
      setNewCandName('');
      setNewCandEmail('');
      setNewCandPhone('');
      setNewCandPass('password123');
    }, 1200);
  };

  const handleTestApiKey = async () => {
    if (!tempSettings.alocApiKey) {
      setTestResult({ success: false, error: 'Please enter an ALOC API Key first.' });
      return;
    }
    setTestingApi(true);
    setTestResult(null);
    const res = await testAlocApiKey(tempSettings.alocApiKey.trim());
    setTestingApi(false);
    setTestResult(res);
  };

  const handleSaveSettings = () => {
    updateExamSettings(tempSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b-4 border-amber-400 sticky top-0 z-30 shadow-md">
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
                Joint Admissions and Matriculation Board
              </div>
              <div className="text-sm sm:text-base font-black tracking-tight uppercase flex items-center gap-2">
                <span>JAMB Central Admin & CBT Command Console</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-mono font-normal">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold uppercase text-white">{currentAdmin?.name || 'Chief CBT Controller'}</span>
              <span className="text-[10px] text-amber-300 font-mono">{currentAdmin?.email || 'hello@pauladisa.com'}</span>
            </div>

            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                setPhase('dashboard');
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student Portal View</span>
            </button>

            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Sign Out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Total Candidates</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalCandidates}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/30">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Approved</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm bg-amber-50/30">
            <div className="text-[11px] font-bold text-amber-800 uppercase">Pending</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm bg-rose-50/30">
            <div className="text-[11px] font-bold text-rose-800 uppercase">Disapproved</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{disapprovedCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Mock Submissions</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{allExamSubmissions.length}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Question Engine</div>
            <div className="text-xs font-black text-[#006633] mt-2 uppercase truncate">
              {examSettings.apiSource === 'live_aloc' ? 'Live ALOC API' : 'Offline Archive'}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-300 gap-1 sm:gap-2 overflow-x-auto bg-white px-2 sm:px-4 pt-1.5 sm:pt-2 rounded-t-xl shadow-sm">
          <button
            onClick={() => { setActiveTab('candidates'); refreshCandidates(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'candidates'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Candidate Registrations</span>
            <span className="sm:hidden">Candidates</span>
            <span>({totalCandidates})</span>
          </button>

          <button
            onClick={() => { setActiveTab('payments'); loadPaymentData(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Paystack Gateway &amp; Revenue</span>
            <span className="sm:hidden">Paystack</span>
            <span>({paymentTransactions.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('email'); handleRefreshOutbox(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Email &amp; OTP Dispatch Center</span>
            <span className="sm:hidden">Email &amp; OTP</span>
            <span>({outboxLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'api'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">JAMB Question API &amp; Sources</span>
            <span className="sm:hidden">Question API</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">CBT Rules &amp; Exam Control</span>
            <span className="sm:hidden">CBT Rules</span>
          </button>

          <button
            onClick={() => { setActiveTab('results'); loadExamResults(); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-[#006633] text-[#006633] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Examination Results Log</span>
            <span className="sm:hidden">Results Log</span>
            <span>({allExamSubmissions.length})</span>
          </button>
        </div>

        {/* TAB 1: Candidates Management & Approvals */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-5 shadow-sm space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCandPage(1); }}
                  placeholder="Search by name, reg number, email..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-[#006633]/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCandPage(1); }}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 bg-slate-50"
                  >
                    <option value="all">All Approval Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Disapproved">Disapproved</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={refreshCandidates}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap ml-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                  <span>Refresh List</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setIsAddCandidateOpen(true); setNewCandError(''); }}
                  className="px-3.5 py-2 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Candidate</span>
                </button>
              </div>
            </div>

            {/* Candidates Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#004d25] text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Registration No.</th>
                    <th className="p-3">Target Programme</th>
                    <th className="p-3">4-Subject Combination</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Users className="w-6 h-6" />
                          </div>
                          <div className="font-bold text-slate-800 text-sm">No Registered Candidates Found</div>
                          <p className="text-xs text-slate-500 max-w-sm">
                            Mock test accounts have been purged. Genuine candidate registrations will appear here when students register.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No candidates match the specified search or status filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedCandidates.map(cand => {
                      const status = cand.status || 'Approved';

                      return (
                        <tr key={cand.id} className="hover:bg-slate-50">
                          {/* Candidate Bio */}
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={cand.passport}
                                alt={cand.name}
                                className="w-10 h-12 object-cover rounded border border-slate-300 bg-slate-100 flex-shrink-0"
                                onError={(e) => {
                                  e.target.src = "https://ui-avatars.com/api/?name=Candidate&background=006633&color=fff";
                                }}
                              />
                              <div>
                                <div className="font-black text-slate-900 uppercase text-xs">
                                  {cand.name}
                                </div>
                                <div className="text-[11px] text-slate-600 font-mono">
                                  {cand.email}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  Tel: {cand.phone || 'N/A'} • {cand.gender || 'N/A'} • DOB: {cand.dob || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Reg Number */}
                          <td className="p-3 font-mono font-bold text-slate-800">
                            {cand.regNumber}
                          </td>

                          {/* Target Course */}
                          <td className="p-3">
                            <div className="font-bold text-slate-800">
                              {cand.firstChoice?.course || 'General Programme'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {cand.firstChoice?.institution}
                            </div>
                          </td>

                          {/* 4 Subjects */}
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {cand.selectedSubjects.map(subId => (
                                <span
                                  key={subId}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                                >
                                  {AVAILABLE_SUBJECTS.find(s => s.id === subId)?.code || subId}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3 text-center">
                            {(cand.status === 'Suspended' || cand.malpracticeBlocked) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-[10px] uppercase bg-red-100 text-red-800 border border-red-300">
                                <ShieldAlert className="w-3 h-3 text-red-600" />
                                <span>Malpractice Locked</span>
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                                {status === 'Pending' && <Clock className="w-3 h-3" />}
                                {status === 'Disapproved' && <XCircle className="w-3 h-3" />}
                                <span>{status}</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect details */}
                              <button
                                onClick={() => setInspectTarget(cand)}
                                className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                                title="Inspect Candidate File & History"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Malpractice Re-instate or Approve Button */}
                              {(cand.status === 'Suspended' || cand.malpracticeBlocked) ? (
                                <button
                                  onClick={() => approveCandidate(cand.id)}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                                  title="Clear Malpractice Suspension & Re-instate Candidate"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Re-instate Clearance</span>
                                </button>
                              ) : status !== 'Approved' && (
                                <button
                                  onClick={() => approveCandidate(cand.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm transition-all flex items-center gap-1"
                                  title="Approve Candidate Registration"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {/* Disapprove Button */}
                              {status !== 'Disapproved' && !(cand.status === 'Suspended' || cand.malpracticeBlocked) && (
                                <button
                                  onClick={() => setDisapproveTargetId(cand.id)}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold shadow-sm transition-all"
                                  title="Disapprove Candidate Registration"
                                >
                                  Disapprove
                                </button>
                              )}

                              {/* Delete Candidate */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete candidate ${cand.name}?`)) {
                                    deleteCandidate(cand.id);
                                  }
                                }}
                                className="p-1.5 rounded hover:bg-rose-100 text-rose-600"
                                title="Delete Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Candidate Table Pagination Bar */}
            {totalCandPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(candPage - 1) * candPerPage + 1}–{Math.min(candPage * candPerPage, filteredCandidates.length)} of {filteredCandidates.length} candidates
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCandPage(prev => Math.max(1, prev - 1))}
                    disabled={candPage === 1}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      candPage === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <span className="text-slate-700 font-mono font-bold px-2">
                    Page {candPage} of {totalCandPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCandPage(prev => Math.min(totalCandPages, prev + 1))}
                    disabled={candPage === totalCandPages}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      candPage === totalCandPages
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
        )}

        {/* TAB: Paystack Payments & Revenue */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-4 sm:p-6 shadow-sm space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#006633]" />
                  <span>Paystack Gateway &amp; Revenue Ledger</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure student portal activation fees, manage Paystack API keys, and track real-time transaction verifications.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPaymentData}
                disabled={isLoadingPayments}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPayments ? 'animate-spin' : ''}`} />
                <span>Refresh Payments</span>
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Revenue</div>
                <div className="text-xl sm:text-2xl font-black text-[#006633] mt-1 font-mono">
                  ₦{(totalRevenueKobo / 100).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">Verified Paystack Collections</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Attempts</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
                  {paymentTransactions.length}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Total processed transactions</div>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Successful</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 font-mono">
                  {paymentTransactions.filter(p => p.status === 'success').length}
                </div>
                <div className="text-[10px] text-emerald-600 mt-0.5">Accounts unlocked automatically</div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Current Fee</div>
                <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1 font-mono">
                  ₦{paymentConfig.accessFeeNaira || 50}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">Configured per student registration</div>
              </div>
            </div>

            {/* Paystack Gateway Configuration Card */}
            <div className="bg-slate-50 border-2 border-[#006633]/20 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#006633] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    P
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900">
                      Paystack API Configuration
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Keys are encrypted in SQLite on your server and verified server-to-server.
                    </p>
                  </div>
                </div>

                {paymentSavedNotice && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full animate-in fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Paystack Settings Saved Successfully!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSavePaymentConfig} className="space-y-4">
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="enablePaystack"
                    checked={paymentConfig.enabled}
                    onChange={(e) => setPaymentConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="w-4 h-4 text-[#006633] rounded border-slate-300 focus:ring-[#006633]"
                  />
                  <label htmlFor="enablePaystack" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Require Paystack Activation to Unlock Student Portal
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Portal Unlock Fee (₦)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={paymentConfig.accessFeeNaira || 50}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, accessFeeNaira: parseInt(e.target.value, 10) || 50 }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white focus:outline-none focus:border-[#006633]"
                      placeholder="50"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Test fee is currently ₦50</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Paystack Public Key (Frontend)
                    </label>
                    <input
                      type="text"
                      value={paymentConfig.paystackPublicKey || ''}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, paystackPublicKey: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-[#006633]"
                      placeholder="pk_test_... or pk_live_..."
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used to initiate inline popup</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase">
                        Paystack Secret Key (Server)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="text-[10px] text-emerald-800 font-bold hover:underline"
                      >
                        {showSecretKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={paymentConfig.paystackSecretKey || ''}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, paystackSecretKey: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-[#006633]"
                      placeholder="sk_test_... or sk_live_..."
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Used for backend server verification</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500">
                    Get your keys from{' '}
                    <a
                      href="https://dashboard.paystack.com/#/settings/developer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006633] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Paystack Dashboard Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#006633] hover:bg-[#004d25] text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Gateway Settings</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Transactions Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                  Transaction Audit History ({paymentTransactions.length})
                </h3>

                <div className="w-full sm:w-72 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentSearchTerm}
                    onChange={(e) => { setPaymentSearchTerm(e.target.value); setPaymentPage(1); }}
                    placeholder="Search reference, student, or email..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-[#006633]"
                  />
                </div>
              </div>

              {paginatedPayments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-600">No payment transactions recorded yet</div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                    When registered candidates initiate and complete Paystack portal activation payments, all verified records and timestamps will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-3">Reference ID</th>
                          <th className="p-3">Candidate</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center">Channel</th>
                          <th className="p-3">Date &amp; Time</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paginatedPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {p.reference}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900 uppercase">{p.candidateName || 'Candidate'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{p.candidateEmail}</div>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              ₦{(p.amountKobo / 100).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase font-mono text-[10px] font-bold">
                                {p.channel || 'card'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 font-mono text-[11px]">
                              {p.paidAt ? new Date(p.paidAt).toLocaleString() : new Date(p.createdAt).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                                p.status === 'success'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {p.status === 'success' ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Failed</span>
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPaymentPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                      <div>
                        Showing <strong>{(paymentPage - 1) * paymentPerPage + 1}</strong> to{' '}
                        <strong>{Math.min(paymentPage * paymentPerPage, filteredPayments.length)}</strong> of{' '}
                        <strong>{filteredPayments.length}</strong> transactions
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                          disabled={paymentPage === 1}
                          className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                            paymentPage === 1
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Prev</span>
                        </button>
                        <span className="font-mono text-xs px-2">
                          Page {paymentPage} of {totalPaymentPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPaymentPage(p => Math.min(totalPaymentPages, p + 1))}
                          disabled={paymentPage === totalPaymentPages}
                          className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                            paymentPage === totalPaymentPages
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
              )}
            </div>
          </div>
        )}

        {/* TAB: Email & OTP Dispatch Center */}
        {activeTab === 'email' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#006633]" />
                  <span>Email & OTP Dispatch Center</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage real candidate verification OTP email gateways, test mail delivery, and audit dispatch outbox logs.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefreshOutbox}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Outbox</span>
                </button>
              </div>
            </div>

            {emailSettingsSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Email gateway configuration saved successfully!</span>
              </div>
            )}

            {/* Grid: Gateway Settings + Test Dispatch Tool */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Gateway Configuration Form */}
              <div className="lg:col-span-2 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-[#006633]" />
                    <span>Transactional Email Provider Setup</span>
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-[#006633] px-2 py-0.5 rounded">
                    Active: {emailConfig.provider.toUpperCase()}
                  </span>
                </div>

                {googleNotice && (
                  <div
                    className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-between animate-in fade-in ${
                      googleNotice.type === 'success'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                        : googleNotice.type === 'error'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-blue-50 border-blue-400 text-blue-900'
                    }`}
                  >
                    <span>{googleNotice.message}</span>
                    <button
                      type="button"
                      onClick={() => setGoogleNotice(null)}
                      className="text-slate-500 hover:text-slate-800 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <form onSubmit={handleSaveEmailConfig} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Email Dispatch Provider
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <button
                        type="button"
                        onClick={() => setEmailConfig({ ...emailConfig, provider: 'gmail_api' })}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          emailConfig.provider === 'gmail_api'
                            ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Gmail API</span>
                          {emailConfig.provider === 'gmail_api' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-normal block mt-0.5 ${emailConfig.provider === 'gmail_api' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Google OAuth 2.0
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailConfig({ ...emailConfig, provider: 'smtp' })}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          emailConfig.provider === 'smtp'
                            ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Direct SMTP</span>
                          {emailConfig.provider === 'smtp' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-normal block mt-0.5 ${emailConfig.provider === 'smtp' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Gmail App Pass / Custom
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailConfig({ ...emailConfig, provider: 'resend' })}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          emailConfig.provider === 'resend'
                            ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Resend API</span>
                          {emailConfig.provider === 'resend' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-normal block mt-0.5 ${emailConfig.provider === 'resend' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Instant API Key
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailConfig({ ...emailConfig, provider: 'emailjs' })}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          emailConfig.provider === 'emailjs'
                            ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>EmailJS</span>
                          {emailConfig.provider === 'emailjs' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-normal block mt-0.5 ${emailConfig.provider === 'emailjs' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Client Web SDK
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEmailConfig({ ...emailConfig, provider: 'webhook' })}
                        className={`p-2 rounded-lg border text-left text-xs font-bold transition-all ${
                          emailConfig.provider === 'webhook'
                            ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>Webhook</span>
                          {emailConfig.provider === 'webhook' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-[10px] font-normal block mt-0.5 ${emailConfig.provider === 'webhook' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          Custom Endpoint
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Google Gmail API (OAuth 2.0) Panel */}
                  {emailConfig.provider === 'gmail_api' && (
                    <div className="space-y-3.5 p-4 bg-white rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span className="text-xs font-black uppercase text-slate-800">
                            Google Cloud Gmail API (OAuth 2.0)
                          </span>
                        </div>
                        {googleAuthStatus.connected ? (
                          <span className="text-[10px] font-bold bg-emerald-100 text-[#006633] px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Authenticated</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                            Authorization Needed
                          </span>
                        )}
                      </div>

                      {googleAuthStatus.connected ? (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-black uppercase text-emerald-900">
                                Live Gmail API Gateway Active
                              </div>
                              <div className="text-xs text-emerald-800 font-mono font-bold mt-0.5">
                                Dispatched via: {googleAuthStatus.userEmail || 'hello@pauladisa.com'}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleDisconnectGoogle}
                              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded text-xs font-bold transition-all shadow-xs"
                            >
                              Disconnect
                            </button>
                          </div>
                          <p className="text-[11px] text-emerald-800 leading-relaxed">
                            Candidate OTP codes and password reset emails are dispatched live through your authorized Google Account.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1.5">
                            <div className="font-bold text-[11px] uppercase tracking-wider text-blue-950">
                              2-Step Setup Instructions:
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900">
                              <li>
                                In your <strong>Google Cloud Console</strong> &gt; <strong>Credentials</strong>, open your OAuth Client and ensure this Redirect URI is added to <strong>Authorized redirect URIs</strong>:
                              </li>
                            </ol>
                            <div className="mt-1 flex items-center justify-between bg-white border border-blue-300 p-2 rounded text-[11px] font-mono font-bold text-slate-800">
                              <span className="truncate">http://localhost:3000/api/auth/google/callback</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('http://localhost:3000/api/auth/google/callback');
                                  setCopiedRedirectUri(true);
                                  setTimeout(() => setCopiedRedirectUri(false), 2500);
                                }}
                                className="ml-2 px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded text-[10px] font-bold flex items-center gap-1 flex-shrink-0"
                              >
                                <Copy className="w-3 h-3" />
                                <span>{copiedRedirectUri ? 'Copied!' : 'Copy URI'}</span>
                              </button>
                            </div>
                            <div className="text-[11px] text-blue-900 pt-0.5">
                              2. Click the blue <strong>Authorize with Google</strong> button below to sign in and grant email dispatch permission!
                            </div>
                          </div>

                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={handleStartGoogleAuth}
                              className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                              </svg>
                              <span>Authorize with Google (1-Click OAuth)</span>
                            </button>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">
                              Alternative: Paste Google Refresh Token (e.g. from OAuth Playground):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-2">
                                <input
                                  type="text"
                                  value={googleManualRefreshToken}
                                  onChange={(e) => setGoogleManualRefreshToken(e.target.value)}
                                  placeholder="1//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                  className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                                />
                              </div>
                              <div>
                                <input
                                  type="email"
                                  value={googleManualEmail}
                                  onChange={(e) => setGoogleManualEmail(e.target.value)}
                                  placeholder="hello@pauladisa.com"
                                  className="w-full p-2 rounded border border-slate-300 text-xs"
                                />
                              </div>
                            </div>
                            <div className="pt-1.5 flex justify-end">
                              <button
                                type="button"
                                onClick={handleSaveManualGoogleToken}
                                disabled={isVerifyingGoogleToken || !googleManualRefreshToken.trim()}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                              >
                                {isVerifyingGoogleToken ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying Token...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify &amp; Save Refresh Token</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Direct SMTP Credentials (Gmail, Zoho, cPanel, Custom) */}
                  {emailConfig.provider === 'smtp' && (
                    <div className="space-y-3 p-3.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
                        <span>Direct SMTP Relay Settings</span>
                        <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Recommended for Gmail &amp; Domain Mail
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            SMTP Host
                          </label>
                          <input
                            type="text"
                            value={emailConfig.smtp?.host || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              smtp: { ...emailConfig.smtp, host: e.target.value.trim() }
                            })}
                            placeholder="e.g. smtp.gmail.com or mail.pauladisa.com"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            SMTP Port
                          </label>
                          <input
                            type="text"
                            value={emailConfig.smtp?.port || '587'}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              smtp: { ...emailConfig.smtp, port: e.target.value.trim() }
                            })}
                            placeholder="587 (TLS) or 465 (SSL)"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            SMTP Username / Email
                          </label>
                          <input
                            type="text"
                            value={emailConfig.smtp?.user || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              smtp: { ...emailConfig.smtp, user: e.target.value.trim() }
                            })}
                            placeholder="e.g. yourname@gmail.com or hello@pauladisa.com"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            SMTP Password / App Password
                          </label>
                          <input
                            type="password"
                            value={emailConfig.smtp?.pass || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              smtp: { ...emailConfig.smtp, pass: e.target.value.trim() }
                            })}
                            placeholder="e.g. 16-character Google App Password"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-900 space-y-1">
                        <div className="font-bold">Gmail Setup Tip:</div>
                        <p>
                          To use Gmail: Enable 2-Step Verification in your Google Account, generate an <strong>App Password</strong> at <code>myaccount.google.com/apppasswords</code>, and paste the 16-letter code into SMTP Password above.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resend API Key */}
                  {emailConfig.provider === 'resend' && (
                    <div className="space-y-3 p-3.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
                        <span>Resend API Gateway</span>
                        <a
                          href="https://resend.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-[#006633] hover:underline flex items-center gap-1"
                        >
                          <span>Get Free Resend API Key</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Resend API Key
                        </label>
                        <input
                          type="password"
                          value={emailConfig.resendApiKey || ''}
                          onChange={(e) => setEmailConfig({
                            ...emailConfig,
                            resendApiKey: e.target.value.trim()
                          })}
                          placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                          className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                        />
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Resend delivers transactional emails in milliseconds with 3,000 free emails per month.
                      </p>
                    </div>
                  )}

                  {/* EmailJS Credentials */}
                  {emailConfig.provider === 'emailjs' && (
                    <div className="space-y-3 p-3.5 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-800 uppercase flex items-center justify-between">
                        <span>EmailJS Account Credentials</span>
                        <a
                          href="https://www.emailjs.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-semibold text-[#006633] hover:underline flex items-center gap-1"
                        >
                          <span>Get Free EmailJS Keys</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Service ID
                          </label>
                          <input
                            type="text"
                            value={emailConfig.emailjs?.serviceId || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              emailjs: { ...emailConfig.emailjs, serviceId: e.target.value.trim() }
                            })}
                            placeholder="e.g. service_xxxxxx"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Template ID
                          </label>
                          <input
                            type="text"
                            value={emailConfig.emailjs?.templateId || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              emailjs: { ...emailConfig.emailjs, templateId: e.target.value.trim() }
                            })}
                            placeholder="e.g. template_xxxxxx"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Public Key (User ID)
                          </label>
                          <input
                            type="text"
                            value={emailConfig.emailjs?.publicKey || ''}
                            onChange={(e) => setEmailConfig({
                              ...emailConfig,
                              emailjs: { ...emailConfig.emailjs, publicKey: e.target.value.trim() }
                            })}
                            placeholder="e.g. pub_key_xxxxxxxxxxxxxxxx"
                            className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook Endpoint */}
                  {emailConfig.provider === 'webhook' && (
                    <div className="space-y-3 p-3.5 bg-white rounded-lg border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          HTTP Webhook Endpoint URL
                        </label>
                        <input
                          type="url"
                          value={emailConfig.webhook?.endpointUrl || ''}
                          onChange={(e) => setEmailConfig({
                            ...emailConfig,
                            webhook: { ...emailConfig.webhook, endpointUrl: e.target.value.trim() }
                          })}
                          placeholder="https://formspree.io/f/... or custom API URL"
                          className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                          Authorization Header (Optional)
                        </label>
                        <input
                          type="text"
                          value={emailConfig.webhook?.authHeader || ''}
                          onChange={(e) => setEmailConfig({
                            ...emailConfig,
                            webhook: { ...emailConfig.webhook, authHeader: e.target.value.trim() }
                          })}
                          placeholder="Bearer xxxxxxxxxxxx"
                          className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#006633] hover:bg-[#00552b] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all"
                    >
                      Save Gateway Configuration
                    </button>
                  </div>
                </form>
              </div>

              {/* Column 3: Test Dispatch Utility */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Test Email Dispatch</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Send an authentic verification test email to any mailbox to verify deliverability.
                    </p>
                  </div>

                  <form onSubmit={handleSendTestEmail} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Recipient Test Email Address
                      </label>
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="e.g. admin@gmail.com"
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingTestEmail}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase rounded-lg shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSendingTestEmail ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching Test Email...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Test Email</span>
                        </>
                      )}
                    </button>
                  </form>

                  {testEmailResult && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${
                      testEmailResult.success
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border border-rose-300 text-rose-800'
                    }`}>
                      {testEmailResult.success ? (
                        <div className="space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Test Email Successfully Dispatched!</span>
                          </div>
                          <p className="text-[11px] text-emerald-800">
                            Check {testEmailAddress} (including spam/junk folder). Dispatched via {testEmailResult.provider}.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold">Dispatch Error:</div>
                          <div>{testEmailResult.error}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">Administrator Note:</div>
                  <p>
                    On candidate registration, the 6-digit OTP is <strong>never revealed on screen</strong>. It is delivered directly to their genuine email address.
                  </p>
                </div>
              </div>
            </div>

            {/* Outbox Audit Logs Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                    <Inbox className="w-4 h-4 text-[#006633]" />
                    <span>Real-Time OTP Dispatch Outbox & Audit Logs</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Live log of all generated verification codes and dispatch statuses for candidate audit & assistance.
                  </p>
                </div>
                {outboxLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearOutbox}
                    className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-semibold"
                  >
                    Clear Outbox Logs
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#004d25] text-white uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Recipient Email</th>
                      <th className="p-3">Candidate Name</th>
                      <th className="p-3 text-center">OTP Code</th>
                      <th className="p-3">Provider / Gateway</th>
                      <th className="p-3 text-center">Delivery Status</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {outboxLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                          No OTP codes have been dispatched yet. When students submit registrations, logs will appear here.
                        </td>
                      </tr>
                    ) : (
                      paginatedOutbox.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {log.recipientEmail}
                          </td>
                          <td className="p-3 uppercase font-medium text-slate-800">
                            {log.candidateName}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-sm text-[#006633] bg-emerald-50/50">
                            {log.otpCode}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 text-[11px]">
                            {log.provider}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'Provider Error'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate">
                            {log.details || 'Dispatched'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Outbox Table Pagination Bar */}
              {totalOutboxPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing {(outboxPage - 1) * outboxPerPage + 1}–{Math.min(outboxPage * outboxPerPage, outboxLogs.length)} of {outboxLogs.length} logs
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOutboxPage(prev => Math.max(1, prev - 1))}
                      disabled={outboxPage === 1}
                      className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                        outboxPage === 1
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <span className="text-slate-700 font-mono font-bold px-2">
                      Page {outboxPage} of {totalOutboxPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOutboxPage(prev => Math.min(totalOutboxPages, prev + 1))}
                      disabled={outboxPage === totalOutboxPages}
                      className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                        outboxPage === totalOutboxPages
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
          </div>
        )}

        {/* TAB 2: Question Engine & Live ALOC API Management */}
        {activeTab === 'api' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                JAMB Past Question Data Stream Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage the question engine that powers CBT examinations for all candidates.
              </p>
            </div>

            {settingsSavedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Question Engine & API Configuration successfully saved!</span>
              </div>
            )}

            {/* Source Switcher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setTempSettings({ ...tempSettings, apiSource: 'live_aloc' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tempSettings.apiSource === 'live_aloc'
                    ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-sm text-[#006633] uppercase">
                    <Globe className="w-5 h-5 text-emerald-700" />
                    <span>Real Live ALOC JAMB API</span>
                  </div>
                  {tempSettings.apiSource === 'live_aloc' && (
                    <span className="text-[10px] font-bold bg-[#006633] text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pulls real Nigerian UTME past questions dynamically across all registered subjects from the ALOC Station remote API.
                </p>
              </div>

              <div
                onClick={() => setTempSettings({ ...tempSettings, apiSource: 'offline' })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tempSettings.apiSource === 'offline'
                    ? 'bg-emerald-50 border-[#006633] text-slate-900 ring-2 ring-[#006633]/20 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-black text-sm text-blue-900 uppercase">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    <span>Verified Offline Archive</span>
                  </div>
                  {tempSettings.apiSource === 'offline' && (
                    <span className="text-[10px] font-bold bg-blue-700 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instant loading from the verified local question pool with zero latency. 100% resilient when offline.
                </p>
              </div>
            </div>

            {/* ALOC Key Input */}
            <div className="p-5 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-700" />
                  <span>ALOC Station Access Token (API Key)</span>
                </label>
                <a
                  href="https://aloc.com.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>aloc.com.ng</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="text"
                value={tempSettings.alocApiKey}
                onChange={(e) => {
                  setTempSettings({ ...tempSettings, alocApiKey: e.target.value.trim().replace(/^["']|["']$/g, '') });
                  setTestResult(null);
                }}
                placeholder="e.g. aloc_live_xxxxxxxxxxxxxxxxxxxxxxxx or ALOC-XXXX..."
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#006633]/20 bg-white"
              />

              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Keys created on modern <a href="https://aloc.com.ng" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">aloc.com.ng</a> start with <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">aloc_live_</code>. Please ensure your email address on ALOC is verified to activate your API key credits.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={testingApi}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>{testingApi ? 'Testing API connection...' : 'Test ALOC API Connection'}</span>
                </button>

                {testResult && (
                  <div className={`text-xs font-bold flex items-center gap-1.5 ${
                    testResult.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Connected via {testResult.provider || 'ALOC API'} ({testResult.count} sample questions retrieved)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="max-w-md">{testResult.error || 'Connection failed'}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all"
              >
                Save Engine Configuration
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CBT Rules & Exam Controls */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                Examination Rules & Candidate Access Control
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure exam duration, volume, and approval enforcement.
              </p>
            </div>

            {settingsSavedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Exam Rules successfully updated!</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration Setting */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <label className="text-xs font-bold uppercase text-slate-800 block">
                  Standard Exam Duration (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={tempSettings.durationMinutes}
                    onChange={(e) => setTempSettings({ ...tempSettings, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-32 p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-sm bg-white"
                  />
                  <span className="text-xs text-slate-500 font-bold">Minutes (Standard JAMB: 120 mins)</span>
                </div>
              </div>

              {/* Question Volume Setting */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <label className="text-xs font-bold uppercase text-slate-800 block">
                  Default Question Volume
                </label>
                <select
                  value={tempSettings.questionCountMode}
                  onChange={(e) => setTempSettings({ ...tempSettings, questionCountMode: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="standard">Full UTME (180 Questions: 60 English + 40 × 3 electives)</option>
                  <option value="quick">Quick Sprint Drill (45 Questions: 15 English + 10 × 3 electives)</option>
                </select>
              </div>

              {/* Require Approval Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Require Admin Approval to Take Exam
                  </div>
                  <div className="text-[11px] text-slate-500">
                    If enabled, candidates with 'Pending' or 'Disapproved' status cannot start exams.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={tempSettings.requireApprovalToSit}
                  onChange={(e) => setTempSettings({ ...tempSettings, requireApprovalToSit: e.target.checked })}
                  className="w-5 h-5 accent-[#006633] rounded"
                />
              </div>

              {/* Allow Student Practice Mode Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">
                    Allow Student Practice Mode
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Controls candidate access to the Test Exam (Practice Mode) button on student dashboards. When checked, candidates can click and take Test Exams; when unchecked, only the Full Mock Exam is available.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(tempSettings.allowStudentPracticeMode)}
                  onChange={(e) => setTempSettings({ ...tempSettings, allowStudentPracticeMode: e.target.checked })}
                  className="w-5 h-5 accent-[#006633] rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all"
              >
                Save Exam Rules
              </button>
            </div>

            {/* Administrator Profile & Password Security */}
            <div className="mt-6 pt-6 border-t border-slate-300">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-1 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-700" />
                <span>Administrator Profile & Security Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Manage your administrative access password.
              </p>

              {passSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Administrator password successfully updated!</span>
                </div>
              )}

              {passError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold">
                  {passError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="p-4 bg-slate-50 rounded-xl border border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Current Password <span className="text-[10px] text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    placeholder="Leave blank to set directly"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    New Security Password <span className="text-[10px] text-slate-400 font-normal">(Min 6 chars)</span>
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase rounded-lg shadow transition-all"
                  >
                    Set New Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: Examination Results Log */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-300 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  Completed Mock Examinations Log
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Central SQLite persistent database log of all candidate submissions and aggregate scores out of 400 marks.
                </p>
              </div>

              <button
                type="button"
                onClick={loadExamResults}
                disabled={isLoadingResults}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingResults ? 'animate-spin' : ''}`} />
                <span>Refresh Results Log</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#004d25] text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Registration Number</th>
                    <th className="p-3 text-center">Score (/400)</th>
                    <th className="p-3">Subject Breakdown</th>
                    <th className="p-3 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allExamSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                        No examination submissions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((sub, idx) => (
                      <tr key={sub.id || idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 uppercase">
                          {sub.candidateName || 'JAMB Candidate'}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {sub.regNumber || sub.candidateReg || 'N/A'}
                        </td>
                        <td className="p-3 text-center font-mono font-black text-sm text-[#006633]">
                          {sub.aggregateScore} / 400
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                            {sub.subjectBreakdown?.map((b, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border">
                                {b.subjectName || b.subjectId}: <strong>{b.scaledScore ?? b.score ?? 0}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right text-slate-500 font-mono text-[11px]">
                          {sub.dateTaken ? new Date(sub.dateTaken).toLocaleString() : (sub.date || 'Recent')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Log Pagination Bar */}
            {totalResultsPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing {(resultsPage - 1) * resultsPerPage + 1}–{Math.min(resultsPage * resultsPerPage, allExamSubmissions.length)} of {allExamSubmissions.length} submissions
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResultsPage(prev => Math.max(1, prev - 1))}
                    disabled={resultsPage === 1}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      resultsPage === 1
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <span className="text-slate-700 font-mono font-bold px-2">
                    Page {resultsPage} of {totalResultsPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setResultsPage(prev => Math.min(totalResultsPages, prev + 1))}
                    disabled={resultsPage === totalResultsPages}
                    className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all ${
                      resultsPage === totalResultsPages
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
        )}
      </main>

      {/* Disapproval Modal */}
      {disapproveTargetId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border-2 border-rose-500 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-black uppercase">
                Disapprove Candidate Registration
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Please state the reason for rejecting or flagging this candidate's registration:
            </p>

            <textarea
              rows={3}
              value={disapprovalReason}
              onChange={(e) => setDisapprovalReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDisapproveTargetId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisapprove}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow"
              >
                Confirm Disapproval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Candidate Modal */}
      {inspectTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border-2 border-[#006633] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black uppercase text-slate-900">
                Candidate File Inspection
              </h3>
              <button onClick={() => setInspectTarget(null)} className="text-slate-400 hover:text-slate-700 text-xs font-bold">
                ✕ Close
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={inspectTarget.passport}
                alt="Passport"
                className="w-20 h-24 object-cover rounded-lg border-2 border-slate-400 bg-slate-100 shadow"
              />
              <div className="space-y-1 text-xs">
                <div className="text-base font-black uppercase text-slate-900">{inspectTarget.name}</div>
                <div>Reg No: <strong className="font-mono text-[#006633]">{inspectTarget.regNumber}</strong></div>
                <div>Profile Code: <strong className="font-mono">{inspectTarget.profileCode}</strong></div>
                <div>Email: <span className="font-mono">{inspectTarget.email}</span></div>
                <div>Phone: <span className="font-mono">{inspectTarget.phone || 'Not Specified'}</span></div>
                <div>Gender: <strong>{inspectTarget.gender || 'Not Specified'}</strong> • DOB: <strong>{inspectTarget.dob || 'Not Specified'}</strong></div>
                <div>
                  Status:{' '}
                  {(inspectTarget.status === 'Suspended' || inspectTarget.malpracticeBlocked) ? (
                    <span className="font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">Suspended (Malpractice Violation)</span>
                  ) : (
                    <strong className="uppercase text-emerald-800">{inspectTarget.status || 'Approved'}</strong>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t text-xs space-y-2">
              <div><strong>1st Choice:</strong> {inspectTarget.firstChoice?.institution} — {inspectTarget.firstChoice?.course}</div>
              <div><strong>Assigned Center:</strong> {inspectTarget.center}</div>
              <div><strong>Workstation Seat:</strong> {inspectTarget.seatNumber}</div>
              <div><strong>Practice Schedule:</strong> {inspectTarget.examDate || 'Flexible / Unlimited On-Demand'}</div>
              <div>
                <strong>UTME 4-Subject Combo:</strong>{' '}
                {inspectTarget.selectedSubjects?.map(s => AVAILABLE_SUBJECTS.find(sub => sub.id === s)?.name || s).join(', ')}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              {(inspectTarget.status === 'Suspended' || inspectTarget.malpracticeBlocked) ? (
                <button
                  onClick={() => {
                    approveCandidate(inspectTarget.id);
                    setInspectTarget(prev => ({ ...prev, status: 'Approved', malpracticeBlocked: false }));
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Re-instate Candidate Clearance</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setInspectTarget(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Register Candidate Modal */}
      {isAddCandidateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl p-6 border-2 border-[#006633] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#006633]" />
                <h3 className="text-sm font-black uppercase text-slate-900">
                  Register CBT Candidate
                </h3>
              </div>
              <button
                onClick={() => setIsAddCandidateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {newCandSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-400 rounded-lg text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Candidate successfully registered and approved for CBT examination!</span>
              </div>
            )}

            {newCandError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold">
                {newCandError}
              </div>
            )}

            <form onSubmit={handleCreateCandidate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    value={newCandName}
                    onChange={(e) => { setNewCandName(e.target.value); setNewCandError(''); }}
                    placeholder="e.g. CHUKWUEMEKA EMMANUEL ADEBAYO"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold uppercase"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Candidate Email Address *
                  </label>
                  <input
                    type="email"
                    value={newCandEmail}
                    onChange={(e) => { setNewCandEmail(e.target.value); setNewCandError(''); }}
                    placeholder="student@example.com"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Phone / Telephone No.
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    value={newCandPhone}
                    onChange={(e) => setNewCandPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)) return;
                      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g. 08012345678"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Gender
                  </label>
                  <select
                    value={newCandGender}
                    onChange={(e) => setNewCandGender(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newCandDob}
                    onChange={(e) => setNewCandDob(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Candidate Password
                  </label>
                  <input
                    type="text"
                    value={newCandPass}
                    onChange={(e) => setNewCandPass(e.target.value)}
                    placeholder="Default: password123"
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target Programme / Course of Study
                  </label>
                  <input
                    type="text"
                    value={newCandCourse}
                    onChange={(e) => setNewCandCourse(e.target.value)}
                    placeholder="e.g. Medicine and Surgery"
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  1st Choice Institution (All 240+ Nigerian Universities)
                </label>
                <SearchableSelect
                  value={newCandInst}
                  onChange={(val) => setNewCandInst(val)}
                  placeholder="Select university..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>UTME 4-Subject Combination</span>
                  <span className="text-[10px] text-emerald-800 font-bold">
                    {newCandSubs.length}/4 Selected
                  </span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_SUBJECTS.map(sub => {
                    const isEnglish = sub.id === 'english';
                    const isSelected = newCandSubs.includes(sub.id);

                    return (
                      <button
                        type="button"
                        key={sub.id}
                        disabled={isEnglish}
                        onClick={() => {
                          if (isSelected) {
                            if (newCandSubs.length > 2) {
                              setNewCandSubs(newCandSubs.filter(s => s !== sub.id));
                            }
                          } else {
                            if (newCandSubs.length < 4) {
                              setNewCandSubs([...newCandSubs, sub.id]);
                            }
                          }
                        }}
                        className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-[#006633]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        } ${isEnglish ? 'opacity-90 cursor-default' : ''}`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#006633] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddCandidateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register & Approve Candidate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
