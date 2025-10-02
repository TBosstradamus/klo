import React from 'react';

interface EditOverlayProps {
  title: string;
  onSwap: () => void;
}

const ActionIcon: React.FC<{ children: React.ReactNode, title: string, onClick: () => void }> = ({ children, title, onClick }) => (
    <button onClick={onClick} title={title} className="p-2 text-gray-300 bg-slate-800/50 rounded-full hover:bg-blue-500 hover:text-white transition-colors">
        {children}
    </button>
);

const EditOverlay: React.FC<EditOverlayProps> = ({ title, onSwap }) => {
  return (
    <div 
      className="absolute inset-0 bg-slate-900/70 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none z-30 flex flex-col p-2"
    >
        <div className="flex items-center justify-between pointer-events-auto">
            <h4 className="text-sm font-bold bg-blue-500 text-white px-2 py-1 rounded">{title}</h4>
            <div className="flex items-center gap-2">
                <ActionIcon title="Position tauschen" onClick={onSwap}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </ActionIcon>
                 <ActionIcon title="Bereich bearbeiten (in Kürze)" onClick={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                    </svg>
                </ActionIcon>
                 <ActionIcon title="Neuen Bereich hinzufügen (in Kürze)" onClick={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </ActionIcon>
            </div>
        </div>
    </div>
  );
};

export default EditOverlay;
