import React from 'react';

const FormattingHelp: React.FC = () => {
    return (
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-4 w-64 text-left shadow-lg">
            <h4 className="font-bold text-blue-400 mb-2">Formatierungs-Hilfe</h4>
            <ul className="text-sm space-y-2 text-gray-300">
                <li className="flex items-center">
                    <code className="bg-slate-700 px-1.5 py-0.5 rounded-md text-xs mr-2">#Text#</code>
                    <span className="font-bold">Fett</span>
                </li>
                <li className="flex items-center">
                    <code className="bg-slate-700 px-1.5 py-0.5 rounded-md text-xs mr-2">- Text</code>
                    <span>Stichpunkt</span>
                </li>
                <li className="flex items-center">
                    <code className="bg-slate-700 px-1.5 py-0.5 rounded-md text-xs mr-2">Text(farbe)</code>
                    <span>Farbig</span>
                </li>
                <li className="flex items-center">
                    <code className="bg-slate-700 px-1.5 py-0.5 rounded-md text-xs mr-2">#Text(farbe)#</code>
                    <span>Fett & Farbig</span>
                </li>
            </ul>
            <p className="text-xs text-gray-400 mt-3">
                Farben: 
                <span className="text-red-500"> rot</span>, 
                <span className="text-green-500"> grün</span>, 
                <span className="text-blue-500"> blau</span>, 
                <span className="text-orange-500"> orange</span>, 
                <span className="text-yellow-500"> gelb</span>
            </p>
        </div>
    );
};

export default FormattingHelp;