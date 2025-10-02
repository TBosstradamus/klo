import React, { useState, useEffect } from 'react';
import { VehicleCategory, VEHICLE_CATEGORIES } from '../types';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (vehicleData: { name: string, category: VehicleCategory, capacity: number, licensePlate: string, mileage: number }) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<VehicleCategory>(VEHICLE_CATEGORIES[0]);
    const [capacity, setCapacity] = useState(4);
    const [licensePlate, setLicensePlate] = useState('');
    const [mileage, setMileage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setName('');
            setCategory(VEHICLE_CATEGORIES[0]);
            setCapacity(4);
            setLicensePlate('');
            setMileage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && licensePlate.trim() && mileage.trim()) {
            onAdd({
                name,
                category,
                capacity,
                licensePlate,
                mileage: Number(mileage),
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Neues Fahrzeug anlegen</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="veh-name-add" className="block text-sm font-medium mb-1">Streifenname</label>
                          <input id="veh-name-add" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                          <label htmlFor="veh-plate-add" className="block text-sm font-medium mb-1">Kennzeichen</label>
                          <input id="veh-plate-add" type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                          <label htmlFor="veh-category-add" className="block text-sm font-medium mb-1">Kategorie</label>
                          <select id="veh-category-add" value={category} onChange={e => setCategory(e.target.value as VehicleCategory)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {VEHICLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="veh-capacity-add" className="block text-sm font-medium mb-1">Sitzplätze</label>
                          <select id="veh-capacity-add" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value={2}>2</option>
                            <option value={4}>4</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                           <label htmlFor="veh-mileage-add" className="block text-sm font-medium mb-1">Kilometerstand</label>
                           <input id="veh-mileage-add" type="number" value={mileage} onChange={e => setMileage(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddVehicleModal;