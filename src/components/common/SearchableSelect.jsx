import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Building, X } from 'lucide-react';
import { ALL_NIGERIAN_UNIVERSITIES } from '../../data/institutions';
import { loadAllUniversities } from '../../services/institutionService';

export const SearchableSelect = ({
  value,
  onChange,
  placeholder = 'Search & select university...',
  className = '',
  includePolytechnics = false,
  polytechnicsList = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' | 'Federal' | 'State' | 'Private'
  const [allUniversities, setAllUniversities] = useState(ALL_NIGERIAN_UNIVERSITIES);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Load universities and sync with live API on mount
  useEffect(() => {
    let isMounted = true;
    loadAllUniversities().then(list => {
      if (isMounted && Array.isArray(list) && list.length > 0) {
        setAllUniversities(list);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setSearchTerm('');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleSelect = (name) => {
    onChange(name);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Filter universities based on search term & category
  const filteredUniversities = allUniversities.filter(item => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    if (!matchesType) return false;

    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase().trim();
    const nameMatch = item.name.toLowerCase().includes(q);
    const shortMatch = item.shortName && item.shortName.toLowerCase().includes(q);
    const stateMatch = item.state && item.state.toLowerCase().includes(q);

    return nameMatch || shortMatch || stateMatch;
  });

  // Optional polytechnic filtering if enabled
  const filteredPolytechnics = includePolytechnics
    ? polytechnicsList.filter(p => !searchTerm.trim() || p.toLowerCase().includes(searchTerm.toLowerCase().trim()))
    : [];

  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Federal':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'State':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Private':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full text-left p-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800 bg-white text-xs flex items-center justify-between hover:border-[#006633] focus:outline-none focus:ring-2 focus:ring-[#006633]/20 shadow-sm transition-all"
      >
        <span className="truncate pr-2 font-medium">
          {value || <span className="text-slate-400 font-normal">{placeholder}</span>}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in duration-100 flex flex-col max-h-80 w-full min-w-[280px]">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type university name or acronym (e.g. UNILAG, FUTA, UI)..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-[#006633] focus:outline-none focus:ring-1 focus:ring-[#006633]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold">
              {['All', 'Federal', 'State', 'Private'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`px-2 py-0.5 rounded-full transition-colors ${
                    typeFilter === type
                      ? 'bg-[#006633] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 font-normal ml-auto">
                {filteredUniversities.length + filteredPolytechnics.length} found
              </span>
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1 divide-y divide-slate-100 flex-1">
            {/* Custom Option if typed and no exact match */}
            {searchTerm.trim() && !allUniversities.some(u => u.name.toLowerCase() === searchTerm.toLowerCase().trim()) && (
              <button
                type="button"
                onClick={() => handleSelect(searchTerm.trim())}
                className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-xs font-bold text-[#006633] flex items-center justify-between transition-colors bg-emerald-50/40 mb-1 border border-emerald-200"
              >
                <span>Use custom: &quot;{searchTerm.trim()}&quot;</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Custom</span>
              </button>
            )}

            {/* Universities */}
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((item) => {
                const isSelected = value === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelect(item.name)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-[#006633] font-bold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex-1 truncate">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase ${getTypeBadgeStyle(item.type)}`}>
                          {item.type}
                        </span>
                        {item.state && <span>{item.state} State</span>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#006633] flex-shrink-0" />}
                  </button>
                );
              })
            ) : filteredPolytechnics.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching Nigerian universities found.
                {searchTerm && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => handleSelect(searchTerm.trim())}
                      className="px-3 py-1.5 bg-[#006633] text-white rounded-lg text-xs font-bold"
                    >
                      Use &quot;{searchTerm.trim()}&quot; anyway
                    </button>
                  </div>
                )}
              </div>
            ) : null}

            {/* Optional Polytechnics */}
            {includePolytechnics && filteredPolytechnics.length > 0 && (
              <div className="pt-2">
                <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-500 tracking-wider bg-slate-100 rounded">
                  Polytechnics & Monotechnics
                </div>
                {filteredPolytechnics.map(poly => {
                  const isSelected = value === poly;
                  return (
                    <button
                      key={poly}
                      type="button"
                      onClick={() => handleSelect(poly)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-[#006633] font-bold'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="truncate font-medium">{poly}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#006633] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
