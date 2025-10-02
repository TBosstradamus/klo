import React, { useMemo } from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={style} />
);

const Confetti: React.FC = () => {
  const pieces = useMemo(() => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const numPieces = 150;
    const newPieces = [];

    for (let i = 0; i < numPieces; i++) {
      const animationName = `fall-${Math.ceil(Math.random() * 3)}`;
      const duration = Math.random() * 2 + 3; // 3 to 5 seconds
      const delay = Math.random() * 2; // 0 to 2 seconds delay
      const style: React.CSSProperties = {
        position: 'absolute',
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        top: `-10%`,
        left: `${Math.random() * 100}%`,
        opacity: 1,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `${animationName} ${duration}s ease-out ${delay}s forwards`,
      };
      newPieces.push({ id: i, style });
    }
    return newPieces;
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      <style>
        {`
          @keyframes fall-1 {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          @keyframes fall-2 {
            0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) translateX(${Math.random() > 0.5 ? '' : '-'}15vw) rotate(1080deg); opacity: 0; }
          }
          @keyframes fall-3 {
            0% { transform: translateY(-10vh) rotateZ(0deg) rotateY(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotateZ(720deg) rotateY(720deg); opacity: 0; }
          }
        `}
      </style>
      {pieces.map(p => <ConfettiPiece key={p.id} style={p.style} />)}
    </div>
  );
};

export default Confetti;
