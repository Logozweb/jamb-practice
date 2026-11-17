import React, { useState } from 'react';
import { useExam } from '../../context/ExamContext';
import { testAlocApiKey } from '../../services/jambApiService';
import { X, Globe, Database, CheckCircle2, AlertCircle, Key, ExternalLink, Sparkles } from 'lucide-react';

export const ApiSettingsModal = () => {
  const {
    isApiSettingsOpen,
    setIsApiSettingsOpen,
    apiSource,
    setApiSource,
    alocApiKey,
    setAlocApiKey,
    isAdminLoggedIn,
    updateExamSettings
  } = useExam();

  const [tempKey, setTempKey] = useState(alocApiKey || '');
  const [tempSource, setTempSource] = useState(apiSource || 'offline');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isApiSettingsOpen || !isAdminLoggedIn) return null;

  const handleTestKey = async () => {
    if (!tempKey.trim()) {
      setTestResult({ success: false, error: 'Please enter an ALOC Access Token first.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testAlocApiKey(tempKey.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    if (updateExamSettings) {
      updateExamSettings({
        apiSource: tempSource,
        alocApiKey: tempKey.trim()
      });
    } else {
      setApiSource(tempSource);
      setAlocApiKey(tempKey.trim());
    }
    try {
      localStorage.setItem('jamb_api_source', tempSource);
      // Remove sensitive API credentials from cleartext localStorage (prevents CWE-312)
      localStorage.removeItem('jamb_aloc_api_key');
    } catch (e) {}
    setIsApiSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border-2 border-[#006633] overflow-hidden">
        {/* Header */}
        <div className="bg-[#004d25] p-5 text-white flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wide">
                JAMB Past Questions Data Source
              </h2>
              <p className="text-[10px] text-emerald-200">
                Connect live API streams or use the verified offline archive
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsApiSettingsOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Source Selection Tiles */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Question Engine Source:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Live ALOC API */}
              <button
                type="button"
                onClick={() => setTempSource('live_aloc')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  tempSource === 'live_aloc'
                    ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-2 ring-[#006633]/20 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span>Real Live JAMB API</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Pulls thousands of real UTME past questions dynamically from <strong>ALOC Station API</strong>.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
                  {tempSource === 'live_aloc' ? '● Active Selection' : 'Click to Select'}
                </span>
              </button>

              {/* Option 2: Offline Verified Archive */}
              <button
                type="button"
                onClick={() => setTempSource('offline')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all flex flex-col justify-between ${
                  tempSource === 'offline'
                    ? 'bg-emerald-50 border-[#006633] text-[#006633] ring-2 ring-[#006633]/20 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Database className="w-4 h-4 text-blue-700" />
                    <span>Verified Offline Archive</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Instant high-speed loading with guaranteed 100% offline availability & zero latency.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 mt-2 block">
                  {tempSource === 'offline' ? '● Active Selection' : 'Click to Select'}
                </span>
              </button>
            </div>
          </div>

          {/* ALOC API Key Field (if live_aloc selected) */}
          {tempSource === 'live_aloc' && (
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-300 rounded-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-800" />
                  <span>ALOC Access Token (API Key)</span>
                </label>

                <a
                  href="https://aloc.com.ng"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Get Free Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <input
                type="text"
                value={tempKey}
                onChange={(e) => { setTempKey(e.target.value); setTestResult(null); }}
                placeholder="e.g. ALOC-XXXX-XXXX-XXXX or alc_live_..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-xs focus:border-[#006633] focus:ring-2 focus:ring-[#006633]/20 bg-white"
              />

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={testing}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{testing ? 'Testing connection...' : 'Test API Token'}</span>
                </button>

                {testResult && (
                  <div className={`text-xs font-bold flex items-center gap-1 ${
                    testResult.success ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {testResult.success ? (
                      <><CheckCircle2 className="w-4 h-4" /> Connected Successfully!</>
                    ) : (
                      <><AlertCircle className="w-4 h-4" /> {testResult.error || 'Connection failed'}</>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Note: If the live API is ever unreachable or rate-limited during an examination, the simulator will automatically switch to the verified offline archive so you are never interrupted.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsApiSettingsOpen(false)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-[#006633] hover:bg-[#00552b] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow transition-all"
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
