import React, { useState, useEffect } from 'react';
import { Vehicle, CheckupItem } from '../types';

interface VehicleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    vehicle: Vehicle | null;
    onSave: (vehicle: Vehicle) => void;
}

type Tab = 'details' | 'checkup';

const VehicleEditModal: React.FC<VehicleEditModalProps> = ({ isOpen, onClose, vehicle, onSave }) => {
    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [licensePlate, setLicensePlate] = useState('');
    const [newMileage, setNewMileage] = useState('');
    const [checkupList, setCheckupList] = useState<CheckupItem[]>([]);
    const [newCheckupItemText, setNewCheckupItemText] = useState('');
    const [initialCheckupList, setInitialCheckupList] = useState<CheckupItem[]>([]);
    const [nextCheckup, setNextCheckup] = useState(''); // Stored as YYYY-MM-DD for input

    useEffect(() => {
        if (vehicle) {
            setName(vehicle.name);
            setCapacity(vehicle.capacity);
            setLicensePlate(vehicle.licensePlate || '');
            setNewMileage(''); // Reset new mileage field on open
            
            const initialList = vehicle.checkupList || [];
            setCheckupList(initialList);
            setInitialCheckupList(JSON.parse(JSON.stringify(initialList)));
            
            setNextCheckup(vehicle.nextCheckup ? new Date(vehicle.nextCheckup).toISOString().split('T')[0] : '');
            
            setActiveTab('details');
        }
    }, [vehicle]);

    if (!isOpen || !vehicle) return null;

    const handleSave = () => {
        const hasCheckupChanged = JSON.stringify(checkupList) !== JSON.stringify(initialCheckupList);
        
        const updatedVehicle: Vehicle = {
            ...vehicle,
            name,
            capacity,
            licensePlate,
            mileage: newMileage.trim() ? Number(newMileage) : vehicle.mileage,
            checkupList,
            lastCheckup: hasCheckupChanged ? new Date() : vehicle.lastCheckup,
            nextCheckup: nextCheckup ? new Date(nextCheckup) : null,
        };
        onSave(updatedVehicle);
    };

    const handleToggleCheckupItem = (itemId: string) => {
        setCheckupList(prev => prev.map(item =>
            item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
        ));
    };

    const handleAddCheckupItem = () => {
        if (newCheckupItemText.trim()) {
            const newItem: CheckupItem = {
                id: `chk-${Date.now()}`,
                text: newCheckupItemText.trim(),
                isChecked: false,
            };
            setCheckupList(prev => [...prev, newItem]);
            setNewCheckupItemText('');
        }
    };

    const handleDeleteCheckupItem = (itemId: string) => {
        setCheckupList(prev => prev.filter(item => item.id !== itemId));
    };

    const renderDetailsForm = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="veh-name" className="block text-sm font-medium mb-1">Streifenname</label>
                    <input id="veh-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label htmlFor="veh-plate" className="block text-sm font-medium mb-1">Kennzeichen</label>
                    <input id="veh-plate" type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                 <div>
                    <label htmlFor="veh-current-mileage" className="block text-sm font-medium mb-1">Aktueller KM-Stand</label>
                    <div id="veh-current-mileage" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-gray-400">
                        {vehicle.mileage.toLocaleString('de-DE')}
                    </div>
                </div>
                 <div>
                    <label htmlFor="veh-new-mileage" className="block text-sm font-medium mb-1">Neuen KM-Stand eintragen</label>
                    <input id="veh-new-mileage" type="number" value={newMileage} onChange={e => setNewMileage(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Neuen Wert eingeben" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="veh-capacity" className="block text-sm font-medium mb-1">Sitzplätze</label>
                    <select id="veh-capacity" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={2}>2</option>
                        <option value={4}>4</option>
                    </select>
                </div>
            </div>
        </div>
    );
    
    const renderCheckupList = () => (
        <div className="space-y-3 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Letzter Checkup</label>
                    <div className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm">
                        {vehicle.lastCheckup ? new Date(vehicle.lastCheckup).toLocaleString('de-DE') : 'N/A'}
                    </div>
                </div>
                <div>
                    <label htmlFor="veh-next-checkup" className="block text-sm font-medium mb-1 text-gray-400">Nächster Checkup</label>
                    <input 
                        id="veh-next-checkup" 
                        type="date" 
                        value={nextCheckup} 
                        onChange={e => setNextCheckup(e.target.value)} 
                        className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 border-t border-slate-700 pt-3">
                {checkupList.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-md group mb-1">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" checked={item.isChecked} onChange={() => handleToggleCheckupItem(item.id)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500" />
                            <span className={`ml-3 ${item.isChecked ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                        </label>
                        <button onClick={() => handleDeleteCheckupItem(item.id)} className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
                {checkupList.length === 0 && <p className="text-center text-gray-500 py-4">Keine Checkup-Punkte vorhanden.</p>}
            </div>
            <div className="flex gap-2 pt-3 border-t border-slate-700">
                <input type="text" value={newCheckupItemText} onChange={e => setNewCheckupItemText(e.target.value)} placeholder="Neuer Checkup-Punkt..." className="flex-grow bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button onClick={handleAddCheckupItem} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium transition-colors">Hinzufügen</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-2xl h-auto max-h-[80vh] rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Streife bearbeiten: {vehicle.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div className="border-b border-slate-700">
                    <div className="flex px-4">
                        <button onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${activeTab === 'details' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Fahrzeugdetails</button>
                        <button onClick={() => setActiveTab('checkup')} className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${activeTab === 'checkup' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Checkup</button>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-hidden min-h-[350px]">
                    {activeTab === 'details' ? renderDetailsForm() : renderCheckupList()}
                </div>
                
                <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Abbrechen</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">Speichern</button>
                </div>
            </div>
        </div>
    );
};

export default VehicleEditModal;