import React, { useState, useRef, useEffect } from 'react';
import { Officer, DragData, DragType, Vehicle } from '../types';

interface OfficerSidebarProps {
  officers: Officer[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onDrop: (data: DragData) => void;
  shotsFiredVehicles: Vehicle[];
  availableOfficersCount: number;
  totalOfficersCount: number;
  onOpenCallsignListModal: () => void;
  funkChannels: { name: string; start: number; end: number; }[];
  onUpdateFunkChannels: (channels: { name: string; start: number; end: number; }[]) => void;
  currentUser: Officer;
}

const DraggableOfficer: React.FC<{ officer: Officer }> = ({ officer }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const dragData: DragData = {
      type: DragType.OfficerFromSidebar,
      officer,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="flex items-center p-2 bg-slate-700/80 rounded-md cursor-grab active:cursor-grabbing hover:bg-slate-600/80 transition-colors h-[44px]"
    >
      <span className="text-2xl mr-3">{officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</span>
      <span className="font-medium text-sm truncate">{`${officer.firstName} ${officer.lastName}`}</span>
    </div>
  );
};

// --- FUNK CHANNEL LIST COMPONENT ---
const FunkChannelList: React.FC<{
  channels: { name: string; start: number; end: number }[];
  onUpdate: (channels: { name: string; start: number; end: number }[]) => void;
  currentUser: Officer;
}> = ({ channels, onUpdate, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChannels, setEditedChannels] = useState(channels);

  const isAdmin = currentUser.departmentRoles.includes('Admin');

  useEffect(() => {
    setEditedChannels(channels);
  }, [channels]);

  const handleEditChange = (index: number, field: 'name' | 'start' | 'end', value: string | number) => {
    const newChannels = [...editedChannels];
    const channel = { ...newChannels[index] };
    if (field === 'name') {
      channel.name = value as string;
    } else {
      channel[field] = Number(value);
    }
    newChannels[index] = channel;
    setEditedChannels(newChannels);
  };

  const handleSave = () => {
    onUpdate(editedChannels);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedChannels(channels);
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-blue-400">Funkkanäle</h2>
        {isAdmin && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-2 py-1 text-xs font-semibold rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
            Bearbeiten
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 text-sm">
          {editedChannels.map(({ name, start, end }, index) => (
            <div key={index} className="flex items-center gap-2">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => handleEditChange(index, 'name', e.target.value)}
                className="w-1/3 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <input 
                type="number" 
                value={start} 
                onChange={(e) => handleEditChange(index, 'start', e.target.value)}
                className="w-1/4 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <span>-</span>
              <input 
                type="number" 
                value={end} 
                onChange={(e) => handleEditChange(index, 'end', e.target.value)}
                className="w-1/4 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={handleCancel} className="px-3 py-1 text-xs font-semibold rounded-md text-slate-300 bg-slate-600 hover:bg-slate-500">Abbrechen</button>
            <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-500">Speichern</button>
          </div>
        </div>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {channels.map(({ name, start, end }) => (
            <li key={name} className="flex justify-between items-center px-1">
              <span className="font-semibold text-slate-300">{name}</span>
              <span className="font-mono text-slate-400 tracking-wider bg-slate-700/50 px-2 py-0.5 rounded">{`${start} - ${end}.9`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const OfficerSidebar: React.FC<OfficerSidebarProps> = ({
  officers,
  searchTerm,
  setSearchTerm,
  onDrop,
  shotsFiredVehicles,
  availableOfficersCount,
  totalOfficersCount,
  onOpenCallsignListModal,
  funkChannels,
  onUpdateFunkChannels,
  currentUser,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef, setSearchTerm]);

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
        try {
            const dragData: DragData = JSON.parse(data);
            if (dragData.type === DragType.OfficerFromVehicle || dragData.type === DragType.OfficerFromHeader) {
                setIsDragOver(true);
            }
        } catch (e) {
            // ignore parse error
        }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const data = e.dataTransfer.getData('application/json');
    if (data) {
        const dragData: DragData = JSON.parse(data);
        if (dragData.type === DragType.OfficerFromVehicle || dragData.type === DragType.OfficerFromHeader) {
            onDrop(dragData);
        }
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-900">
      <aside className="h-full w-full p-4 flex flex-col gap-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col h-[30%] bg-slate-800/50 p-3 rounded-lg border border-slate-700 transition-all duration-200 ${isDragOver ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-3">
                <h2 className="text-xl font-bold text-blue-400">Officer</h2>
                <span className="px-2 py-0.5 text-xs font-semibold text-blue-300 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    Im Dienst: {availableOfficersCount}/{totalOfficersCount}
                </span>
            </div>
          </div>
          <div className="relative" ref={searchContainerRef}>
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm mb-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 p-2 h-[154px]">
                      {officers.length > 0 ? (
                        <div className="space-y-2">
                            {officers.slice(0, 3).map(officer => (
                                <DraggableOfficer key={officer.id} officer={officer} />
                            ))}
                        </div>
                      ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-xs text-center text-gray-500">Kein Officer gefunden.</p>
                          </div>
                      )}
                  </div>
              )}
          </div>
          {/* This container ensures the drop zone covers the available space */}
          <div className="flex-1 min-h-[2rem]"></div>
        </div>
        
        <FunkChannelList 
            channels={funkChannels}
            onUpdate={onUpdateFunkChannels}
            currentUser={currentUser}
        />

        <button
            onClick={onOpenCallsignListModal}
            className="w-full px-4 py-2 text-sm font-semibold rounded-lg text-white bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600"
        >
            Callsign-List
        </button>
        
        <div className="flex-1"></div>

        {shotsFiredVehicles.length > 0 && (
          <div className="p-4 rounded-lg animate-pulse-red-glow bg-red-600 flex flex-col items-center justify-center text-center gap-2 text-white">
            <h2 className="font-extrabold text-5xl tracking-widest py-2" style={{ textShadow: '0 0 10px rgba(0,0,0,0.7)' }}>
              SHOTS FIRED
            </h2>
            {shotsFiredVehicles.map(v => (
              <div key={v.id}>
                <div className="font-bold text-xl tracking-wider uppercase">
                  {v.name}
                </div>
                <div className="text-sm font-semibold">
                  {v.seats
                    .filter((s): s is Officer => s !== null)
                    .map(o => `${o.firstName} ${o.lastName}`)
                    .join(', ')
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};

export default OfficerSidebar;