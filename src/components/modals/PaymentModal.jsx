import React, { useState, useEffect } from 'react';
import { useExam } from '../../context/ExamContext';
import { loadPaystackScript, fetchPublicPaymentSettings, verifyPaymentWithServer } from '../../services/paymentService';
import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Lock, Sparkles, X, ArrowRight, Loader2, HelpCircle } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, targetActionName = 'this feature' }) => {
  const { currentUser, updateCurrentUser } = useExam();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    enabled: true,
    accessFeeNaira: 50,
    paystackPublicKey: ''
  });
  const [errorNotice, setErrorNotice] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPaystackScript();
      fetchPublicPaymentSettings().then(setPaymentSettings);
      setErrorNotice(null);
      setSuccessNotice(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const isReactivation = currentUser.appealStatus === 'require_payment';
  const baseFeeNaira = paymentSettings.accessFeeNaira || 50;
  const feeNaira = isReactivation ? Math.round(baseFeeNaira / 2) : baseFeeNaira;
  const hasLiveKey = Boolean(paymentSettings.paystackPublicKey && paymentSettings.paystackPublicKey.trim().startsWith('pk_'));

  const handleInitiatePayment = async () => {
    setErrorNotice(null);
    setLoading(true);

    const scriptLoaded = await loadPaystackScript();

    if (hasLiveKey && scriptLoaded && window.PaystackPop) {
      // Real Paystack Inline Popup
      try {
        const reference = `jamb_${currentUser.id}_${Date.now()}`;
        const handler = window.PaystackPop.setup({
          key: paymentSettings.paystackPublicKey.trim(),
          email: currentUser.email,
          amount: feeNaira * 100, // Paystack amount is in Kobo
          currency: 'NGN',
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
          ref: reference,
          metadata: {
            custom_fields: [
              { display_name: 'Candidate Name', variable_name: 'candidate_name', value: currentUser.name },
              { display_name: 'Registration Number', variable_name: 'reg_number', value: currentUser.regNumber }
            ]
          },
          callback: function (response) {
            setLoading(false);
            setVerifying(true);
            verifyPaymentWithServer(response.reference, currentUser.id).then(function (verified) {
              setVerifying(false);
              if (verified && verified.success) {
                setSuccessNotice('Payment successful! Your account is approved and all services are unlocked.');
                if (verified.candidate) {
                  updateCurrentUser(verified.candidate);
                } else {
                  updateCurrentUser({ ...currentUser, status: 'Approved' });
                }
                setTimeout(() => {
                  onClose();
                }, 2200);
              } else {
                setErrorNotice(verified?.error || 'Payment verification failed. Please contact support.');
              }
            }).catch(function (verifyErr) {
              setVerifying(false);
              setErrorNotice('Payment verification failed. Please contact support.');
            });
          },
          onClose: function () {
            setLoading(false);
            setErrorNotice('Payment cancelled. You can try again whenever you are ready.');
          }
        });
        handler.openIframe();
      } catch (err) {
        console.error('Paystack checkout initialization error:', err);
        setLoading(false);
        setErrorNotice(err?.message || 'Could not initialize Paystack checkout. Please check internet connection or retry.');
      }
    } else {
      // Demonstration / Test Mode (Before admin adds live Paystack public key)
      const simulatedRef = `test_paystack_${Date.now()}`;
      setVerifying(true);
      const verified = await verifyPaymentWithServer(simulatedRef, currentUser.id);
      setVerifying(false);
      setLoading(false);

      if (verified.success) {
        setSuccessNotice('Test payment simulated! Your account is approved and all services are unlocked.');
        if (verified.candidate) {
          updateCurrentUser(verified.candidate);
        } else {
          updateCurrentUser({ ...currentUser, status: 'Approved' });
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorNotice(verified.error || 'Simulation verification failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border-2 border-[#006633] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#004d25] to-[#006633] p-4 sm:p-5 text-white relative">
          <button
            onClick={onClose}
            disabled={verifying}
            className="absolute top-3 right-3 p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Official Clearance Facility</span>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wide">
            Candidate Examination Clearance
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Complete administrative clearance to enable full CBT mock testing and performance tracking.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          
          {/* Price Box */}
          <div className={`${isReactivation ? 'bg-amber-50 border-amber-400' : 'bg-emerald-50 border-emerald-300'} border-2 rounded-xl p-3.5 flex items-center justify-between`}>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {isReactivation ? 'Disciplinary Concession Fee (50% Relief)' : 'Candidate Portal Clearance Fee'}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#006633]">₦{feeNaira}.00</span>
                {isReactivation ? (
                  <>
                    <span className="text-xs text-slate-500 font-semibold line-through">₦{baseFeeNaira}.00</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">50% Board Concession</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Official Subsidized Rate</span>
                )}
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full ${isReactivation ? 'bg-amber-600' : 'bg-emerald-600'} text-white flex items-center justify-center shadow-md`}>
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          {/* Account Details Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Candidate:</span>
              <strong className="text-slate-800 uppercase font-mono">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-800 font-mono">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reg Number:</span>
              <span className="text-slate-800 font-mono font-bold">{currentUser.regNumber}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500">Clearance Status:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isReactivation ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800'
              }`}>
                {isReactivation ? 'Concession Granted (Clearance Due)' : 'Registration Recorded (Clearance Due)'}
              </span>
            </div>
          </div>

          {/* What Unlocking Grants */}
          <div className="space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Examination Services Enabled:
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Unlimited Full Mock CBT Simulations (180 questions with official scaled scoring)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Subject Practice Drills with Step-by-Step Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Performance Slip Generation &amp; Detailed Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>JAMB Central Admission Processing System (CAPS) Integration</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Advisory:</strong> {errorNotice}
              </div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Clearance Confirmed:</strong> {successNotice}
              </div>
            </div>
          )}

          {/* Payment Method Details */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Card • Bank Transfer • USSD</span>
            </span>
            <span className="font-semibold text-slate-600">Secured via Paystack</span>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <button
              onClick={handleInitiatePayment}
              disabled={loading || verifying || Boolean(successNotice)}
              className="w-full py-3 px-4 bg-[#006633] hover:bg-[#00552b] active:bg-[#004422] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Clearance Transaction...</span>
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing Secure Checkout...</span>
                </>
              ) : successNotice ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clearance Verified</span>
                </>
              ) : (
                <>
                  <span>{isReactivation ? `Complete Re-Activation Clearance (₦${feeNaira}.00)` : `Complete Examination Clearance (₦${feeNaira}.00)`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Admin manual approval notice */}
          <div className="text-center text-[10px] text-slate-400">
            Note: Clearance may alternatively be verified manually by an assigned Center Administrator.
          </div>
        </div>

      </div>
    </div>
  );
};
