import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'green' | 'red' | 'orange' | 'blue';
  cancelColor?: 'green' | 'red' | 'orange' | 'slate';
  className?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  onConfirm, 
  onCancel, 
  children,
  confirmText = 'Ja',
  cancelText = 'Nein',
  confirmColor = 'blue',
  cancelColor = 'slate',
  className = ''
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    confirm: {
      blue: 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-500',
      green: 'bg-green-600 hover:bg-green-500 focus:ring-green-500',
      red: 'bg-red-600 hover:bg-red-500 focus:ring-red-500',
      orange: 'bg-orange-600 hover:bg-orange-500 focus:ring-orange-500',
    },
    cancel: {
      green: 'bg-green-700 hover:bg-green-600 focus:ring-green-600',
      red: 'bg-red-700 hover:bg-red-600 focus:ring-red-600',
      orange: 'bg-orange-700 hover:bg-orange-600 focus:ring-orange-600',
      slate: 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-600',
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300 ${className}`} 
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div 
        className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-800" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <h3 id="confirmation-title" className="text-xl font-bold text-center mb-2 text-slate-100">{title}</h3>
          <div className="text-center text-slate-400 mb-8">
            {children}
          </div>
          <div className="flex flex-col sm:flex-row-reverse gap-3">
            <button
              onClick={onConfirm}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${colorClasses.confirm[confirmColor]}`}
            >
              {confirmText}
            </button>
            {cancelText && (
              <button
                onClick={onCancel}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${colorClasses.cancel[cancelColor]}`}
              >
                {cancelText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;