import React from 'react';

const SupervisoryAccessWarning: React.FC = () => {
  return (
    <div className="relative w-full max-w-4xl mx-auto mb-4">
        <div className="bg-yellow-900/80 backdrop-blur-sm border border-yellow-700 text-yellow-200 text-xs rounded-md p-3 flex items-start gap-3 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
                <strong>Sie haben Zugriff auf diese Seite.</strong> Bitte beachten Sie jedoch, dass Sie keine Berechtigung haben, eigenständig Entscheidungen zu treffen oder Änderungen vorzunehmen, ohne vorher Rücksprache mit Ihrem Vorgesetzten oder der zuständigen Abteilungsleitung zu halten.
            </p>
        </div>
    </div>
  );
};

export default SupervisoryAccessWarning;