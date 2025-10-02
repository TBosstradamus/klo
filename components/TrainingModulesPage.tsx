import React, { useMemo } from 'react';
import { Module, Officer } from '../types';

interface TrainingModulesPageProps {
  modules: Module[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenModule: (module: Module) => void;
  onOpenAddModule: () => void;
  currentUser: Officer;
}

const ModuleCard: React.FC<{ module: Module; onOpen: () => void; }> = ({ module, onOpen }) => {
    return (
        <div 
            onClick={onOpen}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex flex-col justify-center h-24 cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-all duration-200"
        >
            <h3 className="text-lg font-bold text-blue-400 text-center truncate">{module.title}</h3>
        </div>
    );
};

const TrainingModulesPage: React.FC<TrainingModulesPageProps> = ({ modules, searchTerm, setSearchTerm, onOpenModule, onOpenAddModule, currentUser }) => {

    const canEditModules = useMemo(() => 
        currentUser.departmentRoles.includes('Admin') ||
        currentUser.departmentRoles.includes('Leitung Field Training Officer'), 
    [currentUser.departmentRoles]);

    const filteredModules = useMemo(() => {
        if (!searchTerm) return modules;
        const lowercasedTerm = searchTerm.toLowerCase();
        return modules.filter(module => 
            module.title.toLowerCase().includes(lowercasedTerm) || 
            module.content.toLowerCase().includes(lowercasedTerm)
        );
    }, [modules, searchTerm]);

    return (
    <div className="relative flex flex-col h-full bg-slate-800 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">Ausbildungsmodule</h1>
        {canEditModules && (
          <button
            onClick={onOpenAddModule}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-500 transition-colors"
          >
            Modul Erstellen
          </button>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Module nach Titel oder Inhalt suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700 p-6">
         {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredModules.map(module => (
                    <ModuleCard key={module.id} module={module} onOpen={() => onOpenModule(module)} />
                ))}
            </div>
         ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Keine Module gefunden. Erstellen Sie ein neues!</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default TrainingModulesPage;