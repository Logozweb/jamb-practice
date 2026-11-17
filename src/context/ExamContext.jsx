import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AVAILABLE_SUBJECTS } from '../data/subjects';
import { getQuestionsForSubject } from '../data/questions';
import { fetchAlocQuestions } from '../services/jambApiService';
import { shuffleQuestions } from '../utils/shuffle';
import {
  apiGetCandidates,
  apiSaveCandidate,
  apiUpdateCandidate,
  apiDeleteCandidate,
  apiLoginCandidate,
  apiSaveExamResult,
  apiGetPlatformSettings,
  apiSavePlatformSettings,
  apiGetAdmins,
  apiLoginAdmin,
  apiLogoutAdmin,
  apiUpdateAdminPassword
} from '../services/dbService';

const ExamContext = createContext(null);

export const ExamProvider = ({ children }) => {
  // Candidate Accounts & Auth State (Real Data only - no mock accounts)
  const sanitizeCandidate = (c) => {
    if (!c) return c;
    const { nin, password, ...rest } = c;
    return {
      ...rest,
      examDate: 'Flexible / Unlimited On-Demand',
      examTime: 'Self-Paced Practice (Unlimited Attempts)',
      gender: rest.gender || 'Not Specified',
      dob: rest.dob || '2006-05-15',
      phone: rest.phone || '080' + Math.floor(10000000 + Math.random() * 90000000)
    };
  };

  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem('jamb_candidates_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(c => c.id !== 'cand_demo_01' && c.nin !== '82910482910')
            .map(sanitizeCandidate);
        }
      }
    } catch (e) {
      console.warn('Error reading stored candidates', e);
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const activeId = localStorage.getItem('jamb_active_candidate_id');
      if (activeId && activeId !== 'cand_demo_01') {
        const saved = localStorage.getItem('jamb_candidates_db');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const found = parsed.find(c => c.id === activeId && c.id !== 'cand_demo_01');
            if (found) return sanitizeCandidate(found);
          }
        }
      }
    } catch (e) {
      console.warn('Error reading active candidate', e);
    }
    return null;
  });

  // App Phase: 'login' (default if not logged in) | 'dashboard' | 'register' | 'registration-slip' | 'caps' | 'setup' | 'instructions' | 'active' | 'result'
  const [phase, setPhase] = useState(() => {
    try {
      const hash = window.location.hash || window.location.pathname;
      if (hash.includes('admin')) return 'admin-login';
      const activeId = localStorage.getItem('jamb_active_candidate_id');
      if (activeId && activeId !== 'cand_demo_01') return 'dashboard';
    } catch (e) {}
    return 'login';
  });

  // Purge any legacy mock candidate accounts from storage on load and persist sanitization
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jamb_candidates_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed
            .filter(c => c.id !== 'cand_demo_01' && c.nin !== '82910482910')
            .map(sanitizeCandidate);
          localStorage.setItem('jamb_candidates_db', JSON.stringify(cleaned));
          setCandidates(cleaned);
        }
      }
      const activeId = localStorage.getItem('jamb_active_candidate_id');
      if (activeId === 'cand_demo_01') {
        localStorage.removeItem('jamb_active_candidate_id');
        setCurrentUser(null);
        setPhase('login');
      }
    } catch (e) {}
  }, []);

  // Load and sync all candidates, settings, and admins from SQLite persistent database
  useEffect(() => {
    async function initDatabaseData() {
      try {
        const [dbCandidates, dbSettings, dbAdmins] = await Promise.all([
          apiGetCandidates(),
          apiGetPlatformSettings(),
          apiGetAdmins()
        ]);

        if (Array.isArray(dbCandidates) && dbCandidates.length > 0) {
          const sanitized = dbCandidates.map(sanitizeCandidate);
          setCandidates(sanitized);
          localStorage.setItem('jamb_candidates_db', JSON.stringify(sanitized));

          const activeId = localStorage.getItem('jamb_active_candidate_id');
          if (activeId) {
            const found = sanitized.find(c => c.id === activeId);
            if (found) setCurrentUser(found);
          }
        }

        if (dbSettings) {
          setExamSettings(prev => ({ ...prev, ...dbSettings }));
          if (dbSettings.apiSource) {
            setApiSource(dbSettings.apiSource);
            localStorage.setItem('jamb_api_source', dbSettings.apiSource);
          }
          if (dbSettings.alocApiKey !== undefined) {
            setAlocApiKey(dbSettings.alocApiKey);
          }
        }

        // Clean up any legacy cleartext API key from client storage
        try {
          localStorage.removeItem('jamb_aloc_api_key');
        } catch (e) {}

        if (Array.isArray(dbAdmins) && dbAdmins.length > 0) {
          setAdminUsers(dbAdmins);
        }
      } catch (err) {
        console.warn('Initial SQLite database sync notice:', err);
      }
    }
    initDatabaseData();
  }, []);

  const [examMode, setExamMode] = useState('simulation'); // 'simulation' (strict JAMB) or 'practice'
  const [examLength, setExamLength] = useState('standard'); // 'standard' (180 questions) or 'quick' (45 questions)

  // Keep candidates in localStorage (strictly without passwords or sensitive credentials)
  useEffect(() => {
    try {
      const sanitizedCandidates = candidates.map(c => {
        const { password, ...safe } = c;
        return safe;
      });
      localStorage.setItem('jamb_candidates_db', JSON.stringify(sanitizedCandidates));
    } catch (e) {
      console.warn('Error writing candidates to storage', e);
    }
  }, [candidates]);

  // Keep active user in sync
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('jamb_active_candidate_id', currentUser.id);
      } catch (e) {}
    } else {
      localStorage.removeItem('jamb_active_candidate_id');
    }
  }, [currentUser]);

  // Active exam selected subjects (synced with logged-in user)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(
    currentUser?.selectedSubjects || ['english', 'biology', 'chemistry', 'physics']
  );
  const [activeSubjectId, setActiveSubjectId] = useState('english');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Exam Data storage: { [subjectId]: { questions: [], answers: {}, flags: {} } }
  const [examData, setExamData] = useState({});

  // Countdown timer: 2 hours = 7200 seconds for standard simulation
  const [timerSeconds, setTimerSeconds] = useState(7200);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // Modals & Tools
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isEightKeyGuideOpen, setIsEightKeyGuideOpen] = useState(false);
  const [activeKeyFeedback, setActiveKeyFeedback] = useState(null);

  // Anti-Malpractice & Fullscreen Security State
  const [malpracticeStrikes, setMalpracticeStrikes] = useState(0);
  const [isMalpracticeModalOpen, setIsMalpracticeModalOpen] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [isPreExamModalOpen, setIsPreExamModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false
  );

  const reEnterFullscreen = useCallback(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
            setIsMalpracticeModalOpen(false);
          })
          .catch((err) => {
            console.warn('Re-enter fullscreen error:', err.message);
          });
      }
    } catch (e) {}
  }, []);

  // Live JAMB API (ALOC) Settings
  const [apiSource, setApiSource] = useState(() => {
    try {
      return localStorage.getItem('jamb_api_source') || 'offline';
    } catch (e) {
      return 'offline';
    }
  });
  // Keep API credentials in memory/DB only - never in unencrypted cleartext localStorage
  const [alocApiKey, setAlocApiKey] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [apiFetchNotice, setApiFetchNotice] = useState(null);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);

  // CBT Exam Global Settings & Rules
  const [examSettings, setExamSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('jamb_exam_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.alocApiKey;
        return parsed;
      }
    } catch (e) {}
    return {
      durationMinutes: 120,
      questionCountMode: 'standard',
      apiSource: 'offline',
      allowStudentPracticeMode: true,
      requireApprovalToSit: false
    };
  });

  const updateExamSettings = (newSettings) => {
    setExamSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try {
        // Exclude sensitive credentials like API keys from persistent cleartext localStorage
        const sanitizedForStorage = { ...merged };
        delete sanitizedForStorage.alocApiKey;
        localStorage.setItem('jamb_exam_settings', JSON.stringify(sanitizedForStorage));

        if (merged.apiSource) {
          localStorage.setItem('jamb_api_source', merged.apiSource);
          setApiSource(merged.apiSource);
        }
        if (merged.alocApiKey !== undefined) {
          setAlocApiKey(merged.alocApiKey);
          localStorage.removeItem('jamb_aloc_api_key');
        }
        if (merged.questionCountMode) {
          setExamLength(merged.questionCountMode);
        }
      } catch (e) {}
      apiSavePlatformSettings(merged);
      return merged;
    });
  };

  // Disclaimer Modal Global State
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  // Real Admin Accounts & Auth State
  const DEFAULT_ADMIN_USERS = [
    {
      id: 'admin_root',
      email: 'hello@pauladisa.com',
      password: 'AdminPassword2026!',
      name: 'CHIEF CBT CONTROLLER',
      role: 'Super Administrator',
      createdAt: '2026-01-01'
    }
  ];

  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('jamb_admin_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migrate legacy admin email to hello@pauladisa.com
          return parsed.map(a => {
            if (a.email.toLowerCase() === 'admin@jamb.gov.ng') {
              return { ...a, email: 'hello@pauladisa.com' };
            }
            return a;
          });
        }
      }
    } catch (e) {}
    return DEFAULT_ADMIN_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('jamb_admin_users', JSON.stringify(adminUsers));
    } catch (e) {}
  }, [adminUsers]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('jamb_is_admin') === 'true';
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('jamb_active_admin_id');
      if (saved) {
        const found = adminUsers.find(a => a.id === saved);
        if (found) return found;
      }
    } catch (e) {}
    return null;
  });

  // Refresh candidates from persistent SQLite database
  const refreshCandidates = async () => {
    try {
      const dbCandidates = await apiGetCandidates();
      if (Array.isArray(dbCandidates)) {
        const sanitized = dbCandidates.map(sanitizeCandidate);
        setCandidates(sanitized);
        return sanitized;
      }
    } catch (e) {
      console.warn('Failed refreshing candidates from DB:', e);
    }
    return [];
  };

  const adminLogin = async (email, password) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const admin = adminUsers.find(
      a => a.email.toLowerCase().trim() === cleanEmail && a.password === password
    );

    if (admin) {
      setIsAdminLoggedIn(true);
      setCurrentAdmin(admin);
      try {
        localStorage.setItem('jamb_is_admin', 'true');
        localStorage.setItem('jamb_active_admin_id', admin.id);
      } catch (e) {}
      await refreshCandidates();
      setPhase('admin');
      return { success: true };
    }

    // Direct SQLite server database check
    const remote = await apiLoginAdmin(cleanEmail, password);
    if (remote.success && remote.admin) {
      setIsAdminLoggedIn(true);
      setCurrentAdmin(remote.admin);
      setAdminUsers(prev => {
        const filtered = prev.filter(a => a.id !== remote.admin.id);
        return [...filtered, remote.admin];
      });
      try {
        localStorage.setItem('jamb_is_admin', 'true');
        localStorage.setItem('jamb_active_admin_id', remote.admin.id);
      } catch (e) {}
      await refreshCandidates();
      setPhase('admin');
      return { success: true };
    }

    return { success: false, error: remote.error || 'Invalid Administrator credentials. Please check your admin email and password.' };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentAdmin(null);
    try {
      localStorage.removeItem('jamb_is_admin');
      localStorage.removeItem('jamb_active_admin_id');
      localStorage.removeItem('jamb_admin_token');
    } catch (e) {}
    apiLogoutAdmin();
    setPhase('admin-login');
  };

  const updateAdminPassword = (email, oldPassword, newPassword) => {
    const target = adminUsers.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (!target) return { success: false, error: 'Admin account not found.' };
    if (target.password !== oldPassword) return { success: false, error: 'Current password does not match.' };
    if (!newPassword || newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters.' };

    const updated = adminUsers.map(a => a.id === target.id ? { ...a, password: newPassword } : a);
    setAdminUsers(updated);
    if (currentAdmin && currentAdmin.id === target.id) {
      setCurrentAdmin(prev => ({ ...prev, password: newPassword }));
    }
    apiUpdateAdminPassword(email, newPassword);
    return { success: true };
  };

  // Direct password update for Admin (set new password without old password required)
  const setAdminDirectPassword = (newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    const adminEmail = currentAdmin?.email || 'hello@pauladisa.com';
    const updated = adminUsers.map(a =>
      a.email.toLowerCase() === adminEmail.toLowerCase() ? { ...a, password: newPassword } : a
    );
    setAdminUsers(updated);
    if (currentAdmin) {
      setCurrentAdmin(prev => ({ ...prev, password: newPassword }));
    }
    apiUpdateAdminPassword(adminEmail, newPassword);
    return { success: true };
  };

  // Find Admin account for password reset OTP verification
  const findAdminForReset = (email) => {
    const clean = (email || '').trim().toLowerCase();
    return adminUsers.find(a => a.email.toLowerCase() === clean);
  };

  // Reset Admin password following successful email OTP verification
  const resetAdminPasswordWithOtp = (email, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    const clean = (email || '').trim().toLowerCase();
    const target = adminUsers.find(a => a.email.toLowerCase() === clean);
    if (!target) {
      return { success: false, error: 'Administrator account not found.' };
    }
    setAdminUsers(prev => prev.map(a => a.id === target.id ? { ...a, password: newPassword } : a));
    apiUpdateAdminPassword(clean, newPassword);
    return { success: true };
  };

  // Find Candidate account for password reset OTP verification
  const findCandidateForReset = (emailOrReg) => {
    const clean = (emailOrReg || '').trim().toLowerCase();
    return candidates.find(
      c => c.email.toLowerCase() === clean || c.regNumber.toLowerCase() === clean
    );
  };

  // Reset Candidate password following successful email OTP verification
  const resetCandidatePasswordWithOtp = (emailOrReg, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }
    const clean = (emailOrReg || '').trim().toLowerCase();
    const target = candidates.find(
      c => c.email.toLowerCase() === clean || c.regNumber.toLowerCase() === clean
    );
    if (!target) {
      return { success: false, error: 'Candidate account not found.' };
    }
    setCandidates(prev => prev.map(c => c.id === target.id ? { ...c, password: newPassword } : c));
    if (currentUser?.id === target.id) {
      setCurrentUser(prev => ({ ...prev, password: newPassword }));
    }
    return { success: true, candidate: target };
  };

  const approveCandidate = (candidateId) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, status: 'Approved', disapprovalReason: null, malpracticeBlocked: false };
      }
      return c;
    }));
    if (currentUser?.id === candidateId) {
      setCurrentUser(prev => ({ ...prev, status: 'Approved', disapprovalReason: null, malpracticeBlocked: false }));
    }
    apiUpdateCandidate(candidateId, { status: 'Approved', disapprovalReason: null, malpracticeBlocked: false });
  };

  const disapproveCandidate = (candidateId, reason) => {
    const defaultReason = 'Passport photo or bio-data verification failed.';
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        return { ...c, status: 'Disapproved', disapprovalReason: reason || defaultReason };
      }
      return c;
    }));
    if (currentUser?.id === candidateId) {
      setCurrentUser(prev => ({ ...prev, status: 'Disapproved', disapprovalReason: reason || defaultReason }));
    }
    apiUpdateCandidate(candidateId, { status: 'Disapproved', disapprovalReason: reason || defaultReason });
  };

  const deleteCandidate = (candidateId) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    if (currentUser?.id === candidateId) {
      setCurrentUser(null);
      setPhase('login');
    }
    apiDeleteCandidate(candidateId);
  };

  const updateCandidatePhoto = (photoDataUrl) => {
    if (!currentUser) return;
    const updated = { ...currentUser, passport: photoDataUrl };
    updateCurrentUser(updated);
  };

  const updateCandidateChoices = (choices) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      ...choices,
      firstChoice: choices.firstChoice || currentUser.firstChoice,
      secondChoice: choices.secondChoice || currentUser.secondChoice,
      thirdChoice: choices.thirdChoice || currentUser.thirdChoice,
      fourthChoice: choices.fourthChoice || currentUser.fourthChoice
    };
    updateCurrentUser(updated);
  };

  // Final Results Data
  const [finalResult, setFinalResult] = useState(() => {
    try {
      const saved = localStorage.getItem('jamb_final_result');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Auth: Login function
  const login = async (emailOrReg, password) => {
    const cleanInput = (emailOrReg || '').trim();
    const candidate = candidates.find(
      c => (c.email.toLowerCase() === cleanInput.toLowerCase() ||
            c.regNumber.toUpperCase() === cleanInput.toUpperCase() ||
            c.profileCode === cleanInput) &&
           c.password === password
    );

    if (candidate) {
      setCurrentUser(candidate);
      setSelectedSubjectIds(candidate.selectedSubjects || ['english', 'biology', 'chemistry', 'physics']);
      setPhase('dashboard');
      return { success: true };
    }

    // Direct SQLite server database check (vital for fresh devices)
    const remote = await apiLoginCandidate(cleanInput, password);
    if (remote.success && remote.candidate) {
      const sanitized = sanitizeCandidate(remote.candidate);
      setCandidates(prev => {
        const filtered = prev.filter(c => c.id !== sanitized.id);
        return [...filtered, sanitized];
      });
      setCurrentUser(sanitized);
      setSelectedSubjectIds(sanitized.selectedSubjects || ['english', 'biology', 'chemistry', 'physics']);
      setPhase('dashboard');
      return { success: true };
    }

    return { success: false, error: remote.error || 'Invalid Email/Reg No or Password. Please try again.' };
  };

  // Auth: Register candidate with simple fast registration
  const registerCandidate = (candidateData) => {
    const regNumber = candidateData.regNumber || ('2026' + Math.floor(10000000 + Math.random() * 90000000) + 'EB');
    const profileCode = candidateData.profileCode || ('55019' + Math.floor(10000 + Math.random() * 90000));
    const seatNumber = candidateData.seatNumber || (`A-0${Math.floor(10 + Math.random() * 89)}`);
    const center = 'ONLINE JAMB CBT SIMULATION';
    const passport = candidateData.passport || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateData.name || 'Candidate')}&background=006633&color=fff&size=200`;

    const newCandidate = {
      ...candidateData,
      id: `cand_${Date.now()}`,
      name: (candidateData.name || 'JAMB CANDIDATE').toUpperCase(),
      email: candidateData.email || `candidate_${Date.now()}@practice.local`,
      password: candidateData.password || 'password123',
      status: 'Pending', // ALWAYS Pending on new registration until official admin approval
      emailVerified: true,
      disapprovalReason: null,
      regNumber,
      profileCode,
      seatNumber,
      center,
      examTown: candidateData.examTown || 'Abuja - Central',
      examDate: 'Flexible / Unlimited On-Demand',
      examTime: 'Self-Paced Practice (Unlimited Attempts)',
      gender: candidateData.gender || 'Not Specified',
      dob: candidateData.dob || '2006-05-15',
      phone: candidateData.phone || '080' + Math.floor(10000000 + Math.random() * 90000000),
      stateOfOrigin: candidateData.stateOfOrigin || 'Lagos',
      lga: candidateData.lga || 'Ikeja',
      passport,
      firstChoice: candidateData.firstChoice || {
        institution: 'University of Ibadan (UI)',
        course: candidateData.targetCourse || 'General Degree Programme',
        faculty: candidateData.faculty || 'Sciences'
      },
      secondChoice: candidateData.secondChoice || {
        institution: 'Lagos State University (LASU), Ojo',
        course: candidateData.targetCourse || 'General Degree Programme',
        faculty: candidateData.faculty || 'Sciences'
      },
      thirdChoice: candidateData.thirdChoice || {
        institution: 'Yaba College of Technology (YABATECH), Lagos',
        course: 'Science Laboratory Technology (SLT)',
        faculty: 'Polytechnic Technology'
      },
      fourthChoice: candidateData.fourthChoice || {
        institution: 'Federal College of Education (Technical), Akoka',
        course: 'Computer Science Education',
        faculty: 'Education'
      },
      selectedSubjects: candidateData.selectedSubjects || ['english', 'mathematics', 'physics', 'chemistry'],
      caps: {
        status: 'Admission in Progress',
        institution: candidateData.firstChoice?.institution || 'University of Ibadan (UI)',
        course: candidateData.targetCourse || 'General Degree Programme',
        accepted: false,
        rejected: false,
        admittedAt: null
      },
      examHistory: []
    };

    setCandidates(prev => [...prev, newCandidate]);
    setCurrentUser(newCandidate);
    setSelectedSubjectIds(newCandidate.selectedSubjects || ['english', 'mathematics', 'physics', 'chemistry']);
    setPhase('dashboard'); // Take the user directly into the candidate dashboard

    // Persist to server SQLite database
    apiSaveCandidate(newCandidate);

    return newCandidate;
  };

  // Auth: Logout
  const logout = () => {
    setCurrentUser(null);
    setPhase('login');
  };

  // CAPS Actions
  const acceptCapsAdmission = () => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      caps: { ...currentUser.caps, accepted: true, rejected: false }
    };
    updateCurrentUser(updated);
  };

  const rejectCapsAdmission = () => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      caps: { ...currentUser.caps, accepted: false, rejected: true }
    };
    updateCurrentUser(updated);
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setCandidates(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
    apiUpdateCandidate(updatedUser.id, updatedUser);
  };

  // Initialize/Start the Examination
  const startExam = useCallback(async (overrideMode = null, overrideLength = null) => {
    if (currentUser?.status === 'Suspended' || currentUser?.malpracticeBlocked) {
      alert(`Access Blocked: Your account was suspended for suspected examination malpractice (${currentUser.disapprovalReason || 'Exceeded allowable screen navigation violations'}). An Administrator must re-approve your account before you can take any exam.`);
      return;
    }

    if (examSettings.requireApprovalToSit && currentUser?.status !== 'Approved') {
      alert(`Access Restricted: Candidate registration status is "${currentUser?.status || 'Pending'}". Platform administrator approval is required before you can sit for the CBT examination.`);
      return;
    }

    setMalpracticeStrikes(0);
    setIsDisqualified(false);
    setIsMalpracticeModalOpen(false);
    setIsFullscreen(true);

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    const mode = overrideMode || examMode;
    const lengthMode = overrideLength || examLength;
    if (overrideLength && overrideLength !== examLength) {
      setExamLength(overrideLength);
    }
    const initialData = {};
    let liveSuccessCount = 0;
    const effectiveSource = examSettings?.apiSource || apiSource;
    const effectiveKey = examSettings?.alocApiKey || alocApiKey;
    const isLiveAloc = ['live_aloc', 'aloc'].includes(effectiveSource);

    // ONLY the Official FULL MOCK EXAM (standard 180 questions simulation) uses the remote ALOC API!
    // Practice, Study, and Quick Sprint modes strictly use the verified local question bank.
    const isFullMock = (mode === 'simulation' && lengthMode === 'standard');
    const shouldFetchFromApi = isFullMock && isLiveAloc && Boolean(effectiveKey);

    setIsLoadingQuestions(true);

    for (const subId of selectedSubjectIds) {
      const subjectMeta = AVAILABLE_SUBJECTS.find(s => s.id === subId);
      let targetCount = lengthMode === 'standard'
        ? (subId === 'english' ? 60 : 40)
        : 15; // Exactly 15 questions across each subject for test exam!

      let questions = [];

      // Fetch from ALOC API ONLY for Official Full Mock Exam
      if (shouldFetchFromApi) {
        try {
          const liveQs = await fetchAlocQuestions(subId, targetCount, effectiveKey);
          if (liveQs && liveQs.length > 0) {
            questions = liveQs;
            liveSuccessCount++;
          }
        } catch (err) {
          console.warn(`ALOC API fetch failed for ${subId}:`, err.message);
        }
      }

      // Top-up or backfill deficit from authentic verified archive to guarantee full JAMB question count (60 English, 40 others)
      if (questions.length < targetCount) {
        const fallbackQs = getQuestionsForSubject(subId, targetCount);
        const existingSignatures = new Set(
          questions.map(q => q.question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35))
        );
        const needed = targetCount - questions.length;
        const additional = fallbackQs.filter(q => {
          const sig = q.question.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 35);
          return !existingSignatures.has(sig);
        }).slice(0, needed);
        questions = [...questions, ...additional];
      }

      // Shuffle questions per exam take so students experience a unique question order every time
      const examQuestions = shuffleQuestions(questions);

      initialData[subId] = {
        subjectId: subId,
        subjectName: subjectMeta ? subjectMeta.name : subId,
        questions: examQuestions,
        answers: {},
        flags: {}
      };
    }

    if (shouldFetchFromApi) {
      if (liveSuccessCount > 0) {
        setApiFetchNotice(`Live ALOC JAMB API connected! Loaded authentic past questions for ${liveSuccessCount} subjects.`);
      } else {
        setApiFetchNotice(`Could not reach ALOC API. Seamlessly loaded verified offline past questions archive.`);
      }
    } else {
      setApiFetchNotice(null);
    }

    setIsLoadingQuestions(false);
    setExamData(initialData);
    setActiveSubjectId(selectedSubjectIds[0] || 'english');
    setCurrentQuestionIndex(0);
    const durationSeconds = lengthMode === 'standard'
      ? (examSettings.durationMinutes || 120) * 60
      : 45 * 60; // 45 minutes for 15 questions per subject (60 questions total)
    setTimerSeconds(durationSeconds);
    setIsTimerRunning(true);
    setPhase('active');
    setIsSubmitModalOpen(false);
  }, [examMode, examLength, selectedSubjectIds, apiSource, alocApiKey, examSettings, currentUser]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning && phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            submitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, phase]);

  // Select Option for active question
  const selectOption = useCallback((optionIndex) => {
    setExamData(prev => {
      const currentSubjectData = prev[activeSubjectId];
      if (!currentSubjectData) return prev;
      return {
        ...prev,
        [activeSubjectId]: {
          ...currentSubjectData,
          answers: {
            ...currentSubjectData.answers,
            [currentQuestionIndex]: optionIndex
          }
        }
      };
    });
  }, [activeSubjectId, currentQuestionIndex]);

  // Toggle Flag for review
  const toggleFlag = useCallback(() => {
    setExamData(prev => {
      const currentSubjectData = prev[activeSubjectId];
      if (!currentSubjectData) return prev;
      const currentFlag = !!currentSubjectData.flags[currentQuestionIndex];
      return {
        ...prev,
        [activeSubjectId]: {
          ...currentSubjectData,
          flags: {
            ...currentSubjectData.flags,
            [currentQuestionIndex]: !currentFlag
          }
        }
      };
    });
  }, [activeSubjectId, currentQuestionIndex]);

  // Navigation: Next & Prev
  const goToNextQuestion = useCallback(() => {
    const currentSubjectData = examData[activeSubjectId];
    if (!currentSubjectData) return;
    if (currentQuestionIndex < currentSubjectData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const currentSubIdx = selectedSubjectIds.indexOf(activeSubjectId);
      if (currentSubIdx < selectedSubjectIds.length - 1) {
        setActiveSubjectId(selectedSubjectIds[currentSubIdx + 1]);
        setCurrentQuestionIndex(0);
      }
    }
  }, [activeSubjectId, currentQuestionIndex, examData, selectedSubjectIds]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      const currentSubIdx = selectedSubjectIds.indexOf(activeSubjectId);
      if (currentSubIdx > 0) {
        const prevSubId = selectedSubjectIds[currentSubIdx - 1];
        setActiveSubjectId(prevSubId);
        const prevQuestions = examData[prevSubId]?.questions || [];
        setCurrentQuestionIndex(Math.max(0, prevQuestions.length - 1));
      }
    }
  }, [activeSubjectId, currentQuestionIndex, examData, selectedSubjectIds]);

  const jumpToQuestion = useCallback((index) => {
    setCurrentQuestionIndex(index);
  }, []);

  const switchSubject = useCallback((subjectId) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setActiveSubjectId(subjectId);
      setCurrentQuestionIndex(0);
    }
  }, [selectedSubjectIds]);

  // Submit Exam & Calculate Authentic JAMB Scores
  const submitExam = useCallback((autoTriggered = false, malpracticeDisqualification = false) => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setIsSubmitModalOpen(false);

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    let totalRawCorrect = 0;
    let totalQuestionsCount = 0;
    const subjectBreakdown = [];

    selectedSubjectIds.forEach(subId => {
      const subData = examData[subId] || { questions: [], answers: {} };
      const questions = subData.questions || [];
      const answers = subData.answers || {};

      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      questions.forEach((q, idx) => {
        const userChoice = answers[idx];
        if (userChoice === undefined || userChoice === null) {
          unansweredCount++;
        } else if (userChoice === q.answer) {
          correctCount++;
        } else {
          wrongCount++;
        }
      });

      const totalSubQ = questions.length;
      const scaledScore = totalSubQ > 0 ? Math.round((correctCount / totalSubQ) * 100) : 0;

      totalRawCorrect += correctCount;
      totalQuestionsCount += totalSubQ;

      subjectBreakdown.push({
        subjectId: subId,
        subjectName: AVAILABLE_SUBJECTS.find(s => s.id === subId)?.name || subId,
        totalQuestions: totalSubQ,
        correctCount,
        wrongCount,
        unansweredCount,
        scaledScore
      });
    });

    const isDisqualifiedAttempt = Boolean(malpracticeDisqualification);
    const calculatedAggregate = subjectBreakdown.reduce((sum, item) => sum + item.scaledScore, 0);
    const aggregateScore = isDisqualifiedAttempt ? 0 : calculatedAggregate;
    const timeSpentSeconds = 7200 - timerSeconds;

    const isFullMock = examMode === 'simulation' && examLength === 'standard';
    const examType = isFullMock ? 'full_mock' : (examMode === 'practice' ? 'practice' : 'test');
    const resultId = `${isFullMock ? 'mock' : 'attempt'}_${Date.now()}`;
    const dateTaken = new Date().toISOString();

    const sanitizedCandidateForSlip = currentUser ? {
      id: currentUser.id,
      name: currentUser.name || 'Candidate',
      regNumber: currentUser.regNumber || 'N/A',
      seatNumber: currentUser.seatNumber || 'N/A',
      center: currentUser.center || 'ONLINE JAMB CBT SIMULATION',
      passport: currentUser.passport || ''
    } : null;

    const resultSummary = {
      id: resultId,
      candidate: sanitizedCandidateForSlip,
      completedAt: dateTaken,
      dateTaken,
      timeSpentSeconds,
      autoTriggered,
      aggregateScore,
      subjectBreakdown,
      totalQuestionsCount,
      totalRawCorrect,
      examMode,
      examLength,
      examType,
      examData,
      disqualified: isDisqualifiedAttempt,
      disqualificationReason: isDisqualifiedAttempt ? 'Disqualified for examination malpractice (3 navigation violations)' : null
    };

    // Save to candidate's history
    if (currentUser) {
      const historyItem = {
        id: resultId,
        date: dateTaken.split('T')[0],
        dateTaken,
        examType,
        examMode,
        examLength,
        aggregateScore,
        subjectBreakdown,
        timeSpentSeconds,
        totalQuestionsCount,
        totalRawCorrect,
        examData,
        disqualified: isDisqualifiedAttempt,
        disqualificationReason: isDisqualifiedAttempt ? 'Disqualified for examination malpractice (3 navigation violations)' : null
      };
      const updatedUser = {
        ...currentUser,
        status: isDisqualifiedAttempt ? 'Disapproved' : currentUser.status,
        malpracticeBlocked: isDisqualifiedAttempt ? true : currentUser.malpracticeBlocked,
        disapprovalReason: isDisqualifiedAttempt ? 'Disapproved for examination malpractice: Exceeded allowable navigation and fullscreen violations (3 strikes).' : currentUser.disapprovalReason,
        examHistory: [
          historyItem,
          ...(currentUser.examHistory || []).filter(h => h.id !== resultId)
        ]
      };
      updateCurrentUser(updatedUser);
    }

    // Persist completed examination to SQLite database
    apiSaveExamResult({
      id: resultId,
      candidateId: currentUser?.id || 'guest',
      candidateName: currentUser?.name || 'JAMB Candidate',
      regNumber: currentUser?.regNumber || 'N/A',
      aggregateScore,
      subjectBreakdown,
      timeSpentSeconds,
      dateTaken,
      examType,
      examLength,
      examMode,
      disqualified: isDisqualifiedAttempt ? 1 : 0,
      disqualificationReason: isDisqualifiedAttempt ? 'Disqualified for examination malpractice (3 navigation violations)' : null,
      examData
    });

    setFinalResult(resultSummary);
    try {
      localStorage.setItem('jamb_final_result', JSON.stringify(resultSummary));
    } catch (e) {}
    setPhase('result');
  }, [currentUser, examData, selectedSubjectIds, timerSeconds, examLength, examMode]);

  // Fullscreen & Anti-Malpractice Navigation Violation Monitor
  useEffect(() => {
    const isExamSessionActive = (phase === 'active' || isLoadingQuestions) && !isDisqualified;
    if (!isExamSessionActive) return;

    let debounceTimer = null;

    const recordViolation = (reason = '') => {
      // Don't trigger if submit modal is open, or already disqualified, or warning modal is already on screen
      if (isSubmitModalOpen || isDisqualified || isMalpracticeModalOpen) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setMalpracticeStrikes(prev => {
          const next = prev + 1;
          setIsMalpracticeModalOpen(true);

          if (next >= 3) {
            setIsDisqualified(true);
            setTimeout(() => {
              submitExam(true, true);
            }, 800);
          }
          return next;
        });
      }, 300);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        recordViolation('tab-switch');
      }
    };

    const handleBlur = () => {
      recordViolation('window-blur');
    };

    const handleFullscreen = () => {
      const inFs = Boolean(document.fullscreenElement);
      setIsFullscreen(inFs);
      if (!inFs) {
        recordViolation('fullscreen-exit');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('right-click-inspect');
    };

    const handleKeyDown = (e) => {
      // 1. Block Escape key fullscreen exit
      if (e.key === 'Escape') {
        if (isSubmitModalOpen || isCalculatorOpen || isMobilePaletteOpen) {
          return;
        }
        e.preventDefault();
        recordViolation('escape-key');
        return;
      }

      // 2. Block F12, DevTools inspector (Ctrl+Shift+I/J/C), View Source (Ctrl+U)
      const isDevToolsKey =
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes((e.key || '').toUpperCase())) ||
        ((e.ctrlKey || e.metaKey) && (e.key || '').toUpperCase() === 'U');

      if (isDevToolsKey) {
        e.preventDefault();
        e.stopPropagation();
        recordViolation('devtools-inspection');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('webkitfullscreenchange', handleFullscreen);
    document.addEventListener('mozfullscreenchange', handleFullscreen);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      clearTimeout(debounceTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      document.removeEventListener('webkitfullscreenchange', handleFullscreen);
      document.removeEventListener('mozfullscreenchange', handleFullscreen);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [phase, isLoadingQuestions, isDisqualified, isSubmitModalOpen, isMalpracticeModalOpen, isCalculatorOpen, isMobilePaletteOpen, submitExam]);

  const triggerKeyFeedback = (key) => {
    setActiveKeyFeedback(key);
    setTimeout(() => setActiveKeyFeedback(null), 300);
  };

  // Keyboard 8-Key Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();

      if (isSubmitModalOpen) {
        if (key === 'S' || e.key === 'Enter') {
          e.preventDefault();
          submitExam();
        } else if (key === 'R' || key === 'ESCAPE') {
          e.preventDefault();
          setIsSubmitModalOpen(false);
        }
        return;
      }

      if (phase === 'active') {
        if (key === 'A') {
          e.preventDefault();
          selectOption(0);
          triggerKeyFeedback('A');
        } else if (key === 'B') {
          e.preventDefault();
          selectOption(1);
          triggerKeyFeedback('B');
        } else if (key === 'C') {
          if (e.altKey || e.ctrlKey) {
            setIsCalculatorOpen(prev => !prev);
          } else {
            e.preventDefault();
            selectOption(2);
            triggerKeyFeedback('C');
          }
        } else if (key === 'D') {
          e.preventDefault();
          selectOption(3);
          triggerKeyFeedback('D');
        } else if (key === 'P') {
          e.preventDefault();
          goToPrevQuestion();
          triggerKeyFeedback('P');
        } else if (key === 'N') {
          e.preventDefault();
          goToNextQuestion();
          triggerKeyFeedback('N');
        } else if (key === 'S') {
          e.preventDefault();
          setIsSubmitModalOpen(true);
          triggerKeyFeedback('S');
        } else if (key === 'R') {
          e.preventDefault();
          toggleFlag();
          triggerKeyFeedback('R');
        } else if (['1', '2', '3', '4'].includes(key)) {
          const subIdx = parseInt(key, 10) - 1;
          if (selectedSubjectIds[subIdx]) {
            switchSubject(selectedSubjectIds[subIdx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isSubmitModalOpen, selectOption, goToNextQuestion, goToPrevQuestion, submitExam, toggleFlag, selectedSubjectIds, switchSubject]);

  return (
    <ExamContext.Provider
      value={{
        phase,
        setPhase,
        examMode,
        setExamMode,
        examLength,
        setExamLength,
        currentUser,
        candidate: currentUser,
        candidates,
        refreshCandidates,
        login,
        registerCandidate,
        logout,
        acceptCapsAdmission,
        rejectCapsAdmission,
        selectedSubjectIds,
        setSelectedSubjectIds,
        activeSubjectId,
        setActiveSubjectId,
        currentQuestionIndex,
        examData,
        timerSeconds,
        isTimerRunning,
        isSubmitModalOpen,
        setIsSubmitModalOpen,
        isCalculatorOpen,
        setIsCalculatorOpen,
        isEightKeyGuideOpen,
        setIsEightKeyGuideOpen,
        activeKeyFeedback,
        finalResult,
        setFinalResult,
        apiSource,
        setApiSource,
        alocApiKey,
        setAlocApiKey,
        isLoadingQuestions,
        apiFetchNotice,
        isApiSettingsOpen,
        setIsApiSettingsOpen,
        isDisclaimerOpen,
        setIsDisclaimerOpen,
        adminUsers,
        currentAdmin,
        updateAdminPassword,
        setAdminDirectPassword,
        findAdminForReset,
        resetAdminPasswordWithOtp,
        findCandidateForReset,
        resetCandidatePasswordWithOtp,
        isAdminLoggedIn,
        adminLogin,
        adminLogout,
        approveCandidate,
        disapproveCandidate,
        deleteCandidate,
        updateCandidatePhoto,
        updateCandidateChoices,
        examSettings,
        updateExamSettings,
        updateCurrentUser,
        malpracticeStrikes,
        setMalpracticeStrikes,
        isMalpracticeModalOpen,
        setIsMalpracticeModalOpen,
        isDisqualified,
        setIsDisqualified,
        isMobilePaletteOpen,
        setIsMobilePaletteOpen,
        isPreExamModalOpen,
        setIsPreExamModalOpen,
        isFullscreen,
        setIsFullscreen,
        reEnterFullscreen,
        startExam,
        selectOption,
        toggleFlag,
        goToNextQuestion,
        goToPrevQuestion,
        jumpToQuestion,
        switchSubject,
        submitExam
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => useContext(ExamContext);
