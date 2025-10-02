import React, { useState, useRef, useEffect } from 'react';
import { Officer } from '../types';

interface UserDisplayProps {
  currentUser: Officer;
  onLogout: () => void;
}

const UserDisplay: React.FC<UserDisplayProps> = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);
  
  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 bg-slate-700/60 rounded-lg hover:bg-slate-700 transition-colors"
      >
        <span className="text-2xl -ml-1">{currentUser.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</span>
        <div className="text-left">
            <span className="block truncate max-w-[120px]">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="text-xs text-blue-400 block">Angemeldet als</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
      </button>

      {isOpen && (
         <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
            <div className="p-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm text-red-400 hover:bg-red-500/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                   <span>Abmelden</span>
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default UserDisplay;
