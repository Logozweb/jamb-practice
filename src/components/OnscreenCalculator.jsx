import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { X, Delete, Calculator as CalcIcon } from 'lucide-react';

export const OnscreenCalculator = () => {
  const { isCalculatorOpen, setIsCalculatorOpen } = useExam();
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [resetNext, setResetNext] = useState(false);

  if (!isCalculatorOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' || resetNext) {
      setDisplay(String(digit));
      setResetNext(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleOperation = (op) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  };

  const handleEquals = () => {
    if (operation === null || prevValue === null) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operation);
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setResetNext(true);
  };

  const handleSquareRoot = () => {
    const current = parseFloat(display);
    if (current >= 0) {
      const res = Math.sqrt(current);
      // clean floating decimals
      const formatted = Math.round(res * 100000000) / 100000000;
      setDisplay(String(formatted));
      setResetNext(true);
    } else {
      setDisplay('Error');
    }
  };

  const handlePercentage = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
    setResetNext(true);
  };

  const handleToggleSign = () => {
    const current = parseFloat(display);
    setDisplay(String(current * -1));
  };

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 w-72 bg-slate-900 text-white rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden font-mono animate-in fade-in zoom-in-95 duration-150">
      {/* Header bar */}
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <CalcIcon className="w-4 h-4" />
          <span>JAMB Onscreen Calculator</span>
        </div>
        <button
          onClick={() => setIsCalculatorOpen(false)}
          className="text-slate-400 hover:text-white p-1 rounded"
          title="Close calculator"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Calculator Display Screen */}
      <div className="p-3 bg-slate-950 text-right">
        <div className="h-4 text-[10px] text-slate-400">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-2xl font-bold tracking-wider text-emerald-400 overflow-x-auto whitespace-nowrap">
          {display}
        </div>
      </div>

      {/* Calculator Buttons Grid */}
      <div className="p-2.5 grid grid-cols-4 gap-1.5 bg-slate-900 text-sm font-bold">
        {/* Row 1 */}
        <button onClick={handleClear} className="p-2.5 bg-rose-700 hover:bg-rose-600 rounded text-white">C</button>
        <button onClick={handleBackspace} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center justify-center">
          <Delete className="w-4 h-4" />
        </button>
        <button onClick={handlePercentage} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded text-amber-300">%</button>
        <button onClick={() => handleOperation('÷')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded text-white">÷</button>

        {/* Row 2 */}
        <button onClick={() => handleDigit('7')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">7</button>
        <button onClick={() => handleDigit('8')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">8</button>
        <button onClick={() => handleDigit('9')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">9</button>
        <button onClick={() => handleOperation('×')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded text-white">×</button>

        {/* Row 3 */}
        <button onClick={() => handleDigit('4')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">4</button>
        <button onClick={() => handleDigit('5')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">5</button>
        <button onClick={() => handleDigit('6')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">6</button>
        <button onClick={() => handleOperation('-')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded text-white">−</button>

        {/* Row 4 */}
        <button onClick={() => handleDigit('1')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">1</button>
        <button onClick={() => handleDigit('2')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">2</button>
        <button onClick={() => handleDigit('3')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">3</button>
        <button onClick={() => handleOperation('+')} className="p-2.5 bg-amber-600 hover:bg-amber-500 rounded text-white">+</button>

        {/* Row 5 */}
        <button onClick={handleToggleSign} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300">±</button>
        <button onClick={() => handleDigit('0')} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">0</button>
        <button onClick={handleDecimal} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-100">.</button>
        <button onClick={handleSquareRoot} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded text-amber-300">√</button>

        {/* Row 6: Equals button spanning full width */}
        <button onClick={handleEquals} className="col-span-4 p-3 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-black text-base shadow mt-1">
          =
        </button>
      </div>
    </div>
  );
};
