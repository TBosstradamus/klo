import React, { useCallback } from 'react';

interface ResizerHandleProps {
  onResize: (newWidth: number) => void;
}

const ResizerHandle: React.FC<ResizerHandleProps> = ({ onResize }) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      onResize(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className="w-1.5 bg-slate-600 hover:bg-blue-500 cursor-col-resize transition-colors duration-200"
    />
  );
};

export default ResizerHandle;
