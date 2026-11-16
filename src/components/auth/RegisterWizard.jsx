import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { AVAILABLE_SUBJECTS, FACULTY_COMBINATIONS } from '../../data/subjects';
import {
  NIGERIAN_UNIVERSITIES,
  NIGERIAN_POLYTECHNICS,
  NIGERIAN_COLLEGES_OF_EDUCATION
} from '../../data/institutions';
import { SearchableSelect } from '../common/SearchableSelect';
import { requestVerificationOtp, verifyOtpCode, getGoogleAuthUrl } from '../../services/emailService';
import {
  User,
  Mail,
  Lock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Check,
  CheckCircle2,
  Camera,
  Upload,
  Building,
  AlertTriangle,
  RotateCcw,
  Phone,
  Calendar
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
];

export const RegisterWizard = () => {
  const { registerCandidate, setPhase, setIsDisclaimerOpen } = useExam();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2006-05-15');
  const [password, setPassword] = useState('');
  const [passport, setPassport] = useState(AVATAR_PRESETS[0]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Tertiary Institution Choices
  const [firstInst, setFirstInst] = useState(NIGERIAN_UNIVERSITIES[0]); // UI
  const [firstCourse, setFirstCourse] = useState('Medicine and Surgery');

  const [secondInst, setSecondInst] = useState(NIGERIAN_UNIVERSITIES[1] || 'Lagos State University (LASU), Ojo');
  const [secondCourse, setSecondCourse] = useState('Nursing Science');

  const [thirdInst, setThirdInst] = useState(NIGERIAN_POLYTECHNICS[0]); // YABATECH
  const [thirdCourse, setThirdCourse] = useState('Science Laboratory Technology (SLT)');

  const [fourthInst, setFourthInst] = useState(NIGERIAN_COLLEGES_OF_EDUCATION[0]); // FCE Akoka
  const [fourthCourse, setFourthCourse] = useState('Biology Education');

  const [showAdditionalChoices, setShowAdditionalChoices] = useState(false);

  const [selectedSubjects, setSelectedSubjects] = useState([
    'english',
    'biology',
    'chemistry',
    'physics'
  ]);
  const [error, setError] = useState('');

  // Email OTP Verification State (Real Dispatch)
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resentNotice, setResentNotice] = useState(false);
  const [isGatewayConfigured, setIsGatewayConfigured] = useState(false);
  const [deliveryProvider, setDeliveryProvider] = useState('');

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError('Please select an image smaller than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPassport(event.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset, index) => {
    setSelectedPresetIndex(index);
    setSelectedSubjects([...preset.subjects]);

    // Intelligently auto-populate choices based on faculty
    if (preset.faculty === 'Medical') {
      setFirstCourse('Medicine and Surgery');
      setSecondCourse('Nursing Science');
      setThirdCourse('Science Laboratory Technology (SLT)');
      setFourthCourse('Biology Education');
    } else if (preset.faculty === 'Engineering') {
      setFirstCourse('Computer Engineering');
      setSecondCourse('Electrical/Electronics Engineering');
      setThirdCourse('Computer Engineering Technology');
      setFourthCourse('Technical Education');
    } else if (preset.faculty === 'Computing') {
      setFirstCourse('Computer Science');
      setSecondCourse('Software Engineering');
      setThirdCourse('Computer Science Technology');
      setFourthCourse('Computer Science Education');
    } else if (preset.faculty === 'Law') {
      setFirstCourse('Law (Common and Islamic Law)');
      setSecondCourse('International Relations');
      setThirdCourse('Mass Communication');
      setFourthCourse('English Education');
    } else if (preset.faculty === 'Management Sciences') {
      setFirstCourse('Accounting');
      setSecondCourse('Business Administration');
      setThirdCourse('Accountancy (ND)');
      setFourthCourse('Business Education');
    } else if (preset.faculty === 'Social Sciences') {
      setFirstCourse('Mass Communication & Media Studies');
      setSecondCourse('Political Science');
      setThirdCourse('Mass Communication (ND)');
      setFourthCourse('Social Studies Education');
    } else if (preset.faculty === 'Agriculture') {
      setFirstCourse('Agricultural Economics');
      setSecondCourse('Food Science and Technology');
      setThirdCourse('Agricultural Technology (ND)');
      setFourthCourse('Agricultural Science Education');
    }
  };

  // Toggle Custom Subject
  const handleToggleSubject = (subId) => {
    if (subId === 'english') return; // English is compulsory in JAMB

    if (selectedSubjects.includes(subId)) {
      if (selectedSubjects.length > 2) {
        setSelectedSubjects(selectedSubjects.filter(id => id !== subId));
        setSelectedPresetIndex(-1);
      }
    } else {
      if (selectedSubjects.length < 4) {
        setSelectedSubjects([...selectedSubjects, subId]);
        setSelectedPresetIndex(-1);
      }
    }
  };

  const handleProceedToOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setOtpError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 to 11 digits, numbers only).');
      return;
    }
    if (!dob) {
      setError('Please select your date of birth.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (selectedSubjects.length !== 4) {
      setError('Please ensure exactly 4 subjects are selected for your UTME combination.');
      return;
    }

    setUserOtp('');
    setIsSendingOtp(true);

    try {
      const res = await requestVerificationOtp({
        email: email.trim(),
        candidateName: fullName.trim(),
        purpose: 'registration'
      });
      setIsSendingOtp(false);
      if (res.success) {
        setIsGatewayConfigured(!res.notConfigured);
        setDeliveryProvider(res.provider || 'JAMB Central Mail Relay');
        if (res.devOtpCode) {
          setGeneratedOtp(res.devOtpCode);
        }
        setIsOtpStep(true);
      } else {
        setIsGatewayConfigured(false);
        setError(res.error || 'Failed to dispatch verification code to your email. Please try again.');
      }
    } catch (err) {
      setIsSendingOtp(false);
      setIsGatewayConfigured(false);
      setError('Network communication error while dispatching email OTP. Please check your internet connection and try again.');
    }
  };

  const handleAuthorizeGoogle = async () => {
    try {
      const data = await getGoogleAuthUrl();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('Could not generate Google authorization link. Please check that the server is running.');
      }
    } catch (e) {
      alert('Error initiating Google authorization: ' + e.message);
    }
  };

  const handleDirectRegister = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '').trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid phone number (at least 10 to 11 digits, numbers only).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const currentPreset = selectedPresetIndex >= 0 ? FACULTY_COMBINATIONS[selectedPresetIndex] : null;

    registerCandidate({
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender,
      dob,
      password,
      passport,
      status: 'Approved',
      emailVerified: true,
      selectedSubjects,
      targetCourse: firstCourse,
      faculty: currentPreset ? currentPreset.faculty : 'General',
      firstChoice: {
        institution: firstInst,
        course: firstCourse,
        faculty: currentPreset ? currentPreset.faculty : 'Degree'
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
        faculty: 'Education'
      }
    });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!userOtp.trim()) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpError('');
    setIsSendingOtp(true);

    const verifyRes = await verifyOtpCode({
      email: email.trim(),
      otpCode: userOtp.trim(),
      purpose: 'registration'
    });

    setIsSendingOtp(false);

    if (!verifyRes.success) {
      setOtpError(verifyRes.error || 'Invalid OTP code. Please enter the 6-digit code received in your email inbox.');
      return;
    }

    const currentPreset = selectedPresetIndex >= 0 ? FACULTY_COMBINATIONS[selectedPresetIndex] : null;

    registerCandidate({
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender,
      dob,
      password,
      passport,
      status: 'Pending',
      emailVerified: true,
      selectedSubjects,
      targetCourse: firstCourse,
      faculty: currentPreset ? currentPreset.faculty : 'General',
      firstChoice: {
        institution: firstInst,
        course: firstCourse,
        faculty: currentPreset ? currentPreset.faculty : 'Degree'
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
  };

  const handleResendOtp = async () => {
    setUserOtp('');
    setOtpError('');
    setIsSendingOtp(true);
    setResentNotice(false);

    try {
      const res = await requestVerificationOtp({
        email: email.trim(),
        candidateName: fullName.trim(),
        purpose: 'registration'
      });
      setIsSendingOtp(false);
      if (res.success) {
        setIsGatewayConfigured(!res.notConfigured);
        setDeliveryProvider(res.provider || 'JAMB Central Mail Relay');
        if (res.devOtpCode) {
          setGeneratedOtp(res.devOtpCode);
        }
        setResentNotice(true);
        setTimeout(() => setResentNotice(false), 5000);
      } else {
        setOtpError(res.error || 'Failed to dispatch a fresh verification code. Please try again.');
      }
    } catch (err) {
      setIsSendingOtp(false);
      setOtpError('Network error while resending verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003b1d] via-[#006633] to-[#012e17] flex flex-col items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-800 animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-[#004d25] p-6 text-center text-white relative border-b-4 border-amber-400">
          <div className="w-14 h-14 mx-auto rounded-full bg-white p-1 flex items-center justify-center border-2 border-amber-400 shadow-md mb-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="#006633" stroke="#FFB800" strokeWidth="4" />
              <path d="M50 15 L58 35 L80 38 L63 52 L68 74 L50 62 L32 74 L37 52 L20 38 L42 35 Z" fill="#FFB800" />
              <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
              <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#006633">JAMB</text>
            </svg>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
            UTME CBT Preparation
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Candidate Sign Up
          </h1>
          <p className="text-xs text-emerald-200 mt-0.5">
            Create your account on the JAMB Practice Platform
          </p>
        </div>

        {/* Form Body or OTP Verification View */}
        {isOtpStep ? (
          <div className="p-6 md:p-8 space-y-5 animate-in fade-in duration-150">
            {/* Real Email Dispatch Banner - OTP is NEVER shown on screen */}
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#006633] text-white flex items-center justify-center shadow flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-[#006633] tracking-wider">
                      Verification Code Dispatched
                    </h3>
                    <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      via {deliveryProvider || 'Email'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    A 6-digit verification code has been dispatched to your email address:
                  </p>
                  <div className="mt-1">
                    <span className="text-xs font-mono font-bold text-slate-900 bg-white border border-emerald-200 px-2.5 py-1 rounded inline-block shadow-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-[11px] text-slate-600 space-y-1">
                <p>
                  Please open your email inbox and enter the 6-digit code below.
                </p>
                <p className="text-[10px] text-slate-500">
                  If you do not see it in your inbox within a minute, please check your <strong>Spam / Junk</strong> folder.
                </p>
              </div>
            </div>

            {resentNotice && (
              <div className="p-2.5 bg-blue-50 border border-blue-300 rounded-lg text-blue-900 text-xs font-semibold text-center">
                ✓ A new 6-digit OTP code has been dispatched to your email!
              </div>
            )}

            {otpError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter 6-Digit Email OTP Code
                </label>
                <p className="text-xs text-slate-500">
                  Sent to <strong className="text-slate-800">{email}</strong>
                </p>
                <div className="pt-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={userOtp}
                    onChange={(e) => {
                      setUserOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError('');
                    }}
                    placeholder="••••••"
                    autoFocus
                    className="w-full py-3 text-center text-2xl font-mono font-black tracking-[0.4em] rounded-xl border-2 border-slate-300 focus:border-[#006633] focus:ring-4 focus:ring-[#006633]/20 text-slate-900 uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Verify OTP & Submit Registration</span>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="font-bold text-slate-600 hover:text-slate-900 hover:underline"
                >
                  ← Edit Registration Details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSendingOtp}
                  className="font-bold text-[#006633] hover:underline disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSendingOtp && (
                    <div className="w-3 h-3 border-2 border-[#006633] border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>Resend OTP Code</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs font-medium space-y-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{error}</span>
                </div>

                {/* If Gmail API is not yet authorized, provide 1-click Google OAuth and direct register fallback */}
                {error.includes('Gmail API') && (
                  <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleAuthorizeGoogle}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Authorize Gmail API (1-Click Google Sign-in)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectRegister}
                      className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Register Directly (Skip Email Verification)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleProceedToOtp} className="space-y-5">
            {/* 0. Passport Photograph Upload */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Candidate Passport Photograph</span>
                <span className="text-[10px] text-emerald-800 font-semibold">(Biometric Identification)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={passport}
                    alt="Passport Preview"
                    className="w-20 h-24 object-cover rounded-lg border-2 border-[#006633] shadow bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#006633] rounded-full p-1 text-white border-2 border-white shadow">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006633] hover:bg-[#00552b] text-white rounded-lg text-xs font-bold transition-all shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Your Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <span className="text-[10px] text-slate-400">or choose avatar:</span>
                    <div className="flex items-center gap-1">
                      {AVATAR_PRESETS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPassport(p)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                            passport === p ? 'border-[#006633] ring-2 ring-emerald-500/40 scale-110' : 'border-slate-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={p} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    JPG or PNG, max 3MB. Displayed on your exam screen, seat card, and result slip.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Candidate Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  placeholder="e.g. Chukwuemeka Obi Adebayo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900 uppercase font-semibold"
                />
              </div>
            </div>

            {/* 2. Email Address & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setPhone(digits);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key)) return;
                      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g. 08012345678"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Gender, Date of Birth & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900 bg-white font-semibold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    max="2014-12-31"
                    onChange={(e) => { setDob(e.target.value); setError(''); }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* 3. Target Course / Faculty Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Target Course / Faculty Preset</span>
                <span className="text-[10px] text-emerald-800 font-semibold lowercase">
                  (auto-selects subjects)
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FACULTY_COMBINATIONS.slice(0, 6).map((preset, idx) => {
                  const isSelected = selectedPresetIndex === idx;
                  return (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset, idx)}
                      className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="line-clamp-1">{preset.name}</span>
                      <span className={`text-[10px] font-normal mt-1 opacity-80 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {preset.faculty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3b. Choice of Tertiary Institutions */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Choice of Tertiary Institutions</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdditionalChoices(!showAdditionalChoices)}
                  className="text-[11px] font-bold text-[#006633] hover:underline"
                >
                  {showAdditionalChoices ? '▲ Hide 2nd, 3rd, 4th Choices' : '▼ Customize 2nd, 3rd, 4th Choices'}
                </button>
              </div>

              {/* 1st Choice (Primary University) */}
              <div className="p-3 bg-white rounded-lg border border-emerald-300 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-[#006633] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-[#006633] text-white flex items-center justify-center text-[9px]">1</span>
                    <span>1st Choice (Degree Awarding University)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Primary</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Select University (All 240+ Nigerian Universities)
                    </label>
                    <SearchableSelect
                      value={firstInst}
                      onChange={(val) => setFirstInst(val)}
                      placeholder="Type or select university (e.g. UNILAG, FUTA, UI)..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Course of Study</label>
                    <input
                      type="text"
                      value={firstCourse}
                      onChange={(e) => setFirstCourse(e.target.value)}
                      placeholder="e.g. Medicine and Surgery"
                      className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 text-xs focus:border-[#006633] focus:ring-1 focus:ring-[#006633]"
                    />
                  </div>
                </div>
              </div>

              {/* Expandable 2nd, 3rd, 4th Choices */}
              {showAdditionalChoices && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  {/* 2nd Choice */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center text-[9px]">2</span>
                        <span>2nd Choice (Degree or Polytechnic)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <SearchableSelect
                          value={secondInst}
                          onChange={(val) => setSecondInst(val)}
                          placeholder="Search university or polytechnic..."
                          includePolytechnics={true}
                          polytechnicsList={NIGERIAN_POLYTECHNICS}
                        />
                      </div>
                      <input
                        type="text"
                        value={secondCourse}
                        onChange={(e) => setSecondCourse(e.target.value)}
                        placeholder="Course of study"
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 text-xs focus:border-[#006633] focus:ring-1 focus:ring-[#006633]"
                      />
                    </div>
                  </div>

                  {/* 3rd Choice */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center text-[9px]">3</span>
                        <span>3rd Choice (Polytechnic / Monotechnic ND)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={thirdInst}
                        onChange={(e) => setThirdInst(e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 font-semibold text-slate-800 bg-white text-xs"
                      >
                        {NIGERIAN_POLYTECHNICS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={thirdCourse}
                        onChange={(e) => setThirdCourse(e.target.value)}
                        placeholder="Polytechnic course"
                        className="w-full p-1.5 rounded border border-slate-300 font-semibold text-slate-800 text-xs"
                      />
                    </div>
                  </div>

                  {/* 4th Choice */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center text-[9px]">4</span>
                        <span>4th Choice (College of Education NCE)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={fourthInst}
                        onChange={(e) => setFourthInst(e.target.value)}
                        className="w-full p-1.5 rounded border border-slate-300 font-semibold text-slate-800 bg-white text-xs"
                      >
                        {NIGERIAN_COLLEGES_OF_EDUCATION.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={fourthCourse}
                        onChange={(e) => setFourthCourse(e.target.value)}
                        placeholder="Education course"
                        className="w-full p-1.5 rounded border border-slate-300 font-semibold text-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. UTME 4-Subject Combination Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  UTME 4-Subject Combination
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  selectedSubjects.length === 4
                    ? 'bg-emerald-100 text-[#006633]'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {selectedSubjects.length}/4 Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_SUBJECTS.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  const isCompulsory = sub.compulsory;

                  return (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => handleToggleSubject(sub.id)}
                      className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-emerald-50 border-[#006633] text-[#006633] font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{sub.icon}</span>
                        <span className="truncate">{sub.name}</span>
                      </div>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[#006633] stroke-[3] flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit / Proceed Button */}
            <button
              type="submit"
              disabled={isSendingOtp}
              className="w-full py-3.5 bg-[#006633] hover:bg-[#00552b] disabled:bg-emerald-800 disabled:opacity-80 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSendingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Proceed to OTP Verification</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>

            {/* Resend OTP Link below button */}
            <div className="mt-2.5 text-center">
              <button
                type="button"
                onClick={handleProceedToOtp}
                disabled={isSendingOtp}
                className="text-xs font-semibold text-[#006633] hover:text-[#004d25] hover:underline inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Didn't receive code or need to retry? Resend OTP</span>
              </button>
            </div>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-5 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600 mb-1">
              Already have an account?
            </p>
            <button
              type="button"
              onClick={() => setPhase('login')}
              className="text-xs font-bold text-[#006633] hover:underline"
            >
              ← Sign in to Candidate Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Security & Disclaimer Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>JAMB Practice System</span>
        </div>
        <button
          type="button"
          onClick={() => setIsDisclaimerOpen(true)}
          className="font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1"
        >
          <span>Platform Disclaimer</span>
          <span>ℹ️</span>
        </button>
      </div>
    </div>

    {/* Footer Disclaimer Notice */}
    <div className="mt-4 text-center max-w-md">
      <button
        type="button"
        onClick={() => setIsDisclaimerOpen(true)}
        className="text-[11px] text-emerald-200 hover:text-amber-300 font-medium transition-colors underline decoration-dotted"
      >
        Notice: This platform is an independent JAMB Practice &amp; Simulation Platform. Read Full Disclaimer
      </button>
    </div>
  </div>
);
};
