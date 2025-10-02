

import React from 'react';
import { Vehicle as VehicleType, DragData, Officer, VehicleStatus, HeaderRole } from '../types';
import Vehicle from './Vehicle';

interface VehicleGridProps {
  vehicles: VehicleType[];
  onDropOnVehicle: (vehicleId: string, seatIndex: number, data: DragData) => void;
  onOfficerDragStart: (officer: Officer, vehicleId: string, seatIndex: number) => string;
  onSetStatus: (vehicleId: string, status: VehicleStatus) => void;
  onClearRequest: (vehicle: VehicleType) => void;
  onSetFunkChannel: (vehicleId: string, channel: string) => void;
  onSetCallsign: (vehicleId: string, callsign: string) => void;
  isPinningMode: boolean;
  onTogglePinVehicle: (vehicleId: string) => void;
  pinnedVehicleIds: Set<string>;
  currentUser: Officer;
  headerRoles: Record<HeaderRole, Officer | null>;
}

const VehicleGrid: React.FC<VehicleGridProps> = ({ 
  vehicles, 
  onDropOnVehicle, 
  onOfficerDragStart, 
  onSetStatus, 
  onClearRequest,
  onSetFunkChannel,
  onSetCallsign,
  isPinningMode,
  onTogglePinVehicle,
  pinnedVehicleIds,
  currentUser,
  headerRoles
}) => {

  const commonProps = {
      onDrop: onDropOnVehicle,
      onOfficerDragStart: onOfficerDragStart,
      onSetStatus: onSetStatus,
      onClearRequest: onClearRequest,
      onSetFunkChannel: onSetFunkChannel,
      onSetCallsign: onSetCallsign
  };

  return (
    <div className="relative h-full w-full bg-slate-800">
      <div className="h-full p-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {vehicles.map((vehicle, index) => (
            <Vehicle 
              key={vehicle.id} 
              vehicle={vehicle} 
              index={index} 
              {...commonProps} 
              isPinningMode={isPinningMode}
              onTogglePin={onTogglePinVehicle}
              isPinned={pinnedVehicleIds.has(vehicle.id)}
              currentUser={currentUser}
              headerRoles={headerRoles}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleGrid;