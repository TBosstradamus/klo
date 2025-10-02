import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Vehicle as VehicleType, Officer, DragData, VehicleStatus, HeaderRole } from '../types';

interface VehicleProps {
  vehicle: VehicleType;
  index: number;
  onDrop: (vehicleId: string, seatIndex: number, data: DragData) => void;
  onOfficerDragStart: (officer: Officer, vehicleId: string, seatIndex: number) => string;
  onSetStatus: (vehicleId: string, status: VehicleStatus) => void;
  onClearRequest: (vehicle: VehicleType) => void;
  onSetFunkChannel: (vehicleId: string, channel: string) => void;
  onSetCallsign: (vehicleId: string, callsign: string) => void;
  isPinningMode: boolean;
  isPinned: boolean;
  onTogglePin: (vehicleId: string) => void;
  currentUser: Officer;
  headerRoles: Record<HeaderRole, Officer | null>;
}

const STATUS_CODES: Record<VehicleStatus, { name: string; color: string; borderClassName: string; bgClassName: string; }> = {
  0: { name: 'Code 0', color: 'yellow-400', borderClassName: 'border-yellow-400', bgClassName: 'bg-yellow-400' },
  1: { name: 'Code 1', color: 'green-500', borderClassName: 'border-green-500', bgClassName: 'bg-green-500' },
  2: { name: 'Code 2', color: 'orange-500', borderClassName: 'border-orange-500', bgClassName: 'bg-orange-500' },
  3: { name: 'Code 3', color: 'red-600', borderClassName: 'border-red-600', bgClassName: 'bg-red-600' },
  5: { name: 'Code 5', color: 'amber-500', borderClassName: 'border-amber-500', bgClassName: 'bg-amber-500' },
  6: { name: 'Code 6', color: 'stone-500', borderClassName: 'border-stone-500', bgClassName: 'bg-stone-500' },
  7: { name: 'Shots Fired', color: 'red-500', borderClassName: 'border-red-700', bgClassName: 'bg-red-700' },
};

const CALLSIGN_STYLES: Record<string, { textColor: string; bgColor: string; hoverBgColor: string; dropdownTextColor: string; }> = {
    'Stand-By': { textColor: 'text-white', bgColor: 'bg-slate-600', hoverBgColor: 'hover:bg-slate-500', dropdownTextColor: 'text-white' },
    'BANK':     { textColor: 'text-white', bgColor: 'bg-purple-600', hoverBgColor: 'hover:bg-purple-500', dropdownTextColor: 'text-purple-400' },
    'JUWE':     { textColor: 'text-white', bgColor: 'bg-pink-600', hoverBgColor: 'hover:bg-pink-500', dropdownTextColor: 'text-pink-400' },
    'LADEN':    { textColor: 'text-white', bgColor: 'bg-violet-600', hoverBgColor: 'hover:bg-violet-500', dropdownTextColor: 'text-violet-400' },
    'ATM':      { textColor: 'text-white', bgColor: 'bg-green-600', hoverBgColor: 'hover:bg-green-500', dropdownTextColor: 'text-green-400' },
    'MD':       { textColor: 'text-white', bgColor: 'bg-red-600', hoverBgColor: 'hover:bg-red-500', dropdownTextColor: 'text-red-400' },
    'SG':       { textColor: 'text-white', bgColor: 'bg-orange-600', hoverBgColor: 'hover:bg-orange-500', dropdownTextColor: 'text-orange-400' },
    'DOJ':      { textColor: 'text-white', bgColor: 'bg-yellow-500', hoverBgColor: 'hover:bg-yellow-400', dropdownTextColor: 'text-yellow-400' },
};

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg className={`w-3 h-3 ml-1 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

const portalRoot = document.getElementById('portal-root');

const FunkSelector: React.FC<{
  currentChannel: string | null;
  onSelect: (channel: string) => void;
  isFirstRow: boolean;
  disabled?: boolean;
}> = ({ currentChannel, onSelect, isFirstRow, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 160; // max-h-40
      const spaceBelow = window.innerHeight - rect.bottom;

      if (isFirstRow || spaceBelow > menuHeight) {
        setStyle({
          position: 'fixed',
          top: `${rect.bottom + 2}px`,
          left: `${rect.left}px`,
        });
      } else {
        setStyle({
          position: 'fixed',
          bottom: `${window.innerHeight - rect.top + 2}px`,
          left: `${rect.left}px`,
        });
      }
    }
  }, [isFirstRow]);

  const toggleOpen = useCallback(() => {
      if (!isOpen) {
          calculatePosition();
      }
      setIsOpen(prev => !prev);
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const funkChannels = useMemo(() => {
    const channels = ["1"];
    for (let i = 1; i < 4; i++) {
      for (let j = 1; j < 10; j++) {
        channels.push(`${i}.${j}`);
      }
    }
    return channels;
  }, []);

  if (!currentChannel) return null;

  const DropdownMenu = (
    <div 
        ref={menuRef}
        style={style}
        className="w-28 max-h-40 overflow-y-auto bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 p-1"
    >
      <ul role="menu" className="space-y-1">
        {funkChannels.map(channel => (
          <li key={channel}>
            <button
              onClick={() => { onSelect(`Funk ${channel}`); setIsOpen(false); }}
              className={`w-full text-left px-2 py-1 hover:bg-slate-700 cursor-pointer text-sm transition-colors rounded ${currentChannel === `Funk ${channel}` ? 'bg-blue-500 text-white' : ''}`}
              role="menuitem"
            >
              Funk {channel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="relative" ref={buttonRef}>
      <button 
        onClick={!disabled ? toggleOpen : undefined}
        className={`flex items-center text-sm font-semibold px-2 py-1 rounded-md bg-blue-600 text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
      >
        <span>{currentChannel}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {!disabled && isOpen && portalRoot && ReactDOM.createPortal(DropdownMenu, portalRoot)}
    </div>
  );
};


const CallsignSelector: React.FC<{
  currentCallsign: string | null;
  onSelect: (callsign: string) => void;
  isFirstRow: boolean;
  disabled?: boolean;
}> = ({ currentCallsign, onSelect, isFirstRow, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 200; // Approx height
        const spaceBelow = window.innerHeight - rect.bottom;

        if (isFirstRow || spaceBelow > menuHeight) {
            setStyle({
                position: 'fixed',
                top: `${rect.bottom + 2}px`,
                left: `${rect.right - 96}px`, // 96 is w-24
            });
        } else {
            setStyle({
                position: 'fixed',
                bottom: `${window.innerHeight - rect.top + 2}px`,
                left: `${rect.right - 96}px`,
            });
        }
    }
  }, [isFirstRow]);

  const toggleOpen = useCallback(() => {
      if (!isOpen) {
          calculatePosition();
      }
      setIsOpen(prev => !prev);
  }, [isOpen, calculatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!currentCallsign) return null;

  const buttonStyle = CALLSIGN_STYLES[currentCallsign] || CALLSIGN_STYLES['Stand-By'];

  const DropdownMenu = (
    <div
        ref={menuRef}
        style={style}
        className="w-24 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 p-1"
    >
      <ul role="menu" className="space-y-1">
        {Object.entries(CALLSIGN_STYLES).map(([callsign, {dropdownTextColor}]) => (
          <li key={callsign}>
            <button
              onClick={() => { onSelect(callsign); setIsOpen(false); }}
              className={`w-full text-left px-2 py-1 hover:bg-slate-700 cursor-pointer text-sm font-bold transition-colors rounded ${currentCallsign === callsign ? 'bg-slate-600' : ''} ${dropdownTextColor}`}
              role="menuitem"
            >
              {callsign}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
  
  return (
    <div className="relative" ref={buttonRef}>
       <button 
        onClick={!disabled ? toggleOpen : undefined}
        className={`flex items-center text-sm font-semibold px-2 py-1 rounded-md transition-colors ${buttonStyle.textColor} ${buttonStyle.bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : buttonStyle.hoverBgColor}`}
      >
        <span>{currentCallsign}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>
      {!disabled && isOpen && portalRoot && ReactDOM.createPortal(DropdownMenu, portalRoot)}
    </div>
  );
};

const StatusSelector: React.FC<{
  currentStatus: VehicleStatus | null;
  onSelect: (status: VehicleStatus) => void;
  isFirstRow: boolean;
  disabled?: boolean;
}> = ({ currentStatus, onSelect, isFirstRow, disabled = false }) => {
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

  const dotColorClass = currentStatus !== null ? STATUS_CODES[currentStatus].bgClassName : 'bg-slate-400';
  const menuPositionClasses = isFirstRow ? 'top-full mt-1 origin-top' : 'bottom-full mb-1 origin-bottom';

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)} 
        className={`w-4 h-4 rounded-full ${dotColorClass} border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        disabled={disabled}
      />
      <div className={`absolute w-32 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-10 transition-all duration-200 ease-out p-1 ${menuPositionClasses} ${isOpen && !disabled ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <ul role="menu" className="space-y-1">
            {(Object.keys(STATUS_CODES) as unknown as (keyof typeof STATUS_CODES)[]).map((code) => (
              <li key={code}>
                <button
                  onClick={() => { onSelect(Number(code) as VehicleStatus); setIsOpen(false); }} 
                  className={`w-full text-left px-2 py-1.5 hover:bg-slate-700 cursor-pointer text-sm flex items-center transition-colors rounded ${currentStatus === code ? 'bg-slate-600' : ''}`}
                  role="menuitem"
                >
                  <span className={`w-2.5 h-2.5 rounded-full mr-2 ${STATUS_CODES[code].bgClassName}`}></span>
                  {STATUS_CODES[code].name}
                </button>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
};

const Seat: React.FC<{
  officer: Officer | null;
  vehicleId: string;
  seatIndex: number;
  onDrop: (vehicleId: string, seatIndex: number, data: DragData) => void;
  onOfficerDragStart: (officer: Officer, vehicleId: string, seatIndex: number) => string;
  isShotsFired: boolean;
}> = ({ officer, vehicleId, seatIndex, onDrop, onOfficerDragStart, isShotsFired }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!officer) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!officer) {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        onDrop(vehicleId, seatIndex, JSON.parse(data));
      }
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (officer) {
      const data = onOfficerDragStart(officer, vehicleId, seatIndex);
      e.dataTransfer.setData('application/json', data);
      e.currentTarget.style.opacity = '0.4';
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  const baseClasses = "relative aspect-square rounded-lg flex items-center justify-center transition-all duration-200";
  
  let dropzoneClasses = '';
  if (!officer) {
    if (isShotsFired) {
      dropzoneClasses = 'bg-transparent border-0';
    } else if (isDragOver) {
      dropzoneClasses = 'border-2 border-solid border-blue-400 bg-slate-700 scale-105';
    } else {
      dropzoneClasses = 'bg-slate-900/50 border-2 border-dashed border-slate-600 hover:bg-slate-700/50 hover:border-blue-500';
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      className={`${baseClasses} ${dropzoneClasses}`}
    >
      {officer && (
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`w-full h-full rounded-lg p-1 flex flex-col items-center justify-between text-center cursor-grab active:cursor-grabbing border transition-colors
            ${isShotsFired 
              ? 'bg-transparent border-white/30 text-white' 
              : 'bg-slate-800 border-slate-700 hover:border-blue-500/50'
            }
          `}
        >
          <div className="text-center">
            <div className="text-xl font-bold text-slate-300">{officer.badgeNumber}</div>
            <div className={`text-xs uppercase font-semibold tracking-wide truncate w-full leading-tight ${isShotsFired ? 'text-yellow-300' : 'text-yellow-400'}`}>
              {officer.rank}
            </div>
          </div>
          <div className="flex-grow flex items-center justify-center text-5xl">
            {officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}
          </div>
          <div className={`font-semibold text-lg leading-tight truncate w-full ${isShotsFired ? 'text-white' : 'text-gray-200'}`}>
            {`${officer.firstName} ${officer.lastName}`}
          </div>
        </div>
      )}
    </div>
  );
};

const Vehicle: React.FC<VehicleProps> = ({ vehicle, index, onDrop, onOfficerDragStart, onSetStatus, onClearRequest, onSetFunkChannel, onSetCallsign, isPinningMode, isPinned, onTogglePin, currentUser, headerRoles }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hasDispatchPermissions = useMemo(() => {
    if (!currentUser) return false;
    const dispatchOfficer = headerRoles.dispatch;
    const coDispatchOfficer = headerRoles['co-dispatch'];
    return (dispatchOfficer?.id === currentUser.id) || (coDispatchOfficer?.id === currentUser.id);
  }, [currentUser, headerRoles]);

  const isOccupied = vehicle.seats.some(seat => seat !== null);
  const isFirstRow = index < 5; // A reasonable guess for a 5-column max grid

  const isShotsFired = vehicle.status === 7 && isOccupied;
  const showPinOverlay = isPinningMode && isHovered;

  const borderClass = vehicle.status !== null && isOccupied && !isShotsFired
    ? STATUS_CODES[vehicle.status].borderClassName
    : 'border-slate-600';

  const renderSeats = () => {
    const seatElements = vehicle.seats.map((officer, idx) => (
      <Seat
        key={idx}
        officer={officer}
        vehicleId={vehicle.id}
        seatIndex={idx}
        onDrop={onDrop}
        onOfficerDragStart={onOfficerDragStart}
        isShotsFired={isShotsFired}
      />
    ));
    
    // Simplified logic for seat layout
    if (vehicle.capacity === 4) {
        return <div className="grid grid-cols-2 gap-1">{seatElements}</div>;
    }
    const gridColsClass = `grid-cols-${vehicle.capacity}`;
    const maxWidthClass = vehicle.capacity === 1 ? `max-w-[50%] mx-auto` : '';

    return (
      <div className={`grid ${gridColsClass} ${maxWidthClass} gap-1`}>
        {seatElements}
      </div>
    );
  };
  
  const statusInfo = isOccupied && vehicle.status !== null ? STATUS_CODES[vehicle.status] : null;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-1.5 rounded-lg border-2 shadow-lg flex flex-col gap-1 justify-between transition-all ${!isOccupied ? 'opacity-60' : ''} ${isShotsFired ? 'animate-pulse-red-glow border-transparent bg-red-600 text-white' : `bg-slate-700/50 ${borderClass}`}`}
    >
      {showPinOverlay && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <button 
            onClick={() => onTogglePin(vehicle.id)} 
            className="text-4xl transition-transform hover:scale-125"
            title={isPinned ? "Fixierung aufheben" : "Streife fixieren"}
          >
            <span className={isPinned ? 'text-green-400' : 'text-gray-400'}>📌</span>
          </button>
        </div>
      )}

      <div className={`flex flex-col gap-1 flex-grow ${showPinOverlay ? 'blur-sm' : ''}`}>
        <div className="relative flex items-center justify-center px-1">
          <div className="absolute left-1 top-1/2 -translate-y-1/2">
            {isOccupied && <FunkSelector isFirstRow={isFirstRow} currentChannel={vehicle.funkChannel} onSelect={(channel) => onSetFunkChannel(vehicle.id, channel)} disabled={!hasDispatchPermissions} />}
          </div>
          <div className="text-center flex items-center justify-center">
              {isPinned && (
                <span className="text-blue-400 mr-1.5" title="Angepinnt">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
              )}
              <h3 className={`text-lg font-bold truncate ${isShotsFired ? 'text-white' : 'text-slate-100'}`}>{vehicle.name}</h3>
          </div>
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
              {isOccupied && <CallsignSelector isFirstRow={isFirstRow} currentCallsign={vehicle.callsign} onSelect={(callsign) => onSetCallsign(vehicle.id, callsign)} disabled={!hasDispatchPermissions} />}
          </div>
        </div>

        <div className="text-center">
          <span className={`block text-base font-bold transition-colors ${isShotsFired ? 'text-white' : statusInfo ? `text-${statusInfo.color}` : 'text-gray-400'}`}>
            {isOccupied 
              ? (statusInfo ? statusInfo.name : ' ') 
              : 'Unbesetzt'
            }
          </span>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          {renderSeats()}
        </div>
      </div>


      {isOccupied && (
        <div className="absolute -bottom-2 -left-2 z-20">
          <StatusSelector 
            isFirstRow={isFirstRow}
            currentStatus={vehicle.status}
            onSelect={(status) => onSetStatus(vehicle.id, status)}
            disabled={!hasDispatchPermissions}
          />
        </div>
      )}
      {isOccupied && (
          <div className="absolute -bottom-2 -right-2 z-20">
            <button
              onClick={() => onClearRequest(vehicle)}
              disabled={!hasDispatchPermissions}
              className={`text-red-400 transition-colors rounded-full p-1 bg-slate-900 ${hasDispatchPermissions ? 'hover:text-red-300 hover:bg-red-500/20' : 'opacity-50 cursor-not-allowed'}`}
              title={hasDispatchPermissions ? "Streife auflösen" : "Nur für Dispatch verfügbar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
      )}
    </div>
  );
};

export default Vehicle;