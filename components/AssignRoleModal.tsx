import React, { useState, useEffect } from 'react';
import { Officer, DepartmentRole, DEPARTMENT_ROLES } from '../types';

interface AssignRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: Officer | null;
    onSave: (officerId: string, roles: DepartmentRole[]) => void;
}

const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ isOpen, onClose, officer, onSave }) => {
    const [selectedRoles, setSelectedRoles] = useState<DepartmentRole[]>([]);

    useEffect(() => {
        if (officer) {
            setSelectedRoles(officer.departmentRoles || []);
        }
    }, [officer]);

    if (!isOpen || !officer) return null;

    const handleToggleRole = (role: DepartmentRole) => {
        setSelectedRoles(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleSave = () => {
        onSave(officer.id, selectedRoles);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[51]" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Ränge zuweisen: {officer.firstName} {officer.lastName}</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {DEPARTMENT_ROLES.map(role => (
                            <label key={role} className="flex items-center p-3 bg-slate-800 rounded-md cursor-pointer hover:bg-slate-700/50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedRoles.includes(role)}
                                    onChange={() => handleToggleRole(role)}
                                    className="h-5 w-5 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-3 font-medium">{role}</span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Abbrechen</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignRoleModal;
