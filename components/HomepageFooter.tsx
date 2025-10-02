import React from 'react';

interface HomepageFooterProps {
    isLoggedIn: boolean;
}

const HomepageFooter: React.FC<HomepageFooterProps> = ({ isLoggedIn }) => {
  const textParts = [
    { text: 'Copyright © ', color: 'text-green-500' },
    { text: '2025 ', color: 'text-red-500' },
    { text: 'lspd-xrp | ', color: 'text-slate-300' },
    { text: 'Design & ', color: 'text-green-500' },
    { text: 'Development: ', color: 'text-red-500' },
    { text: 'ChuckAbi | ', color: 'text-slate-300' },
    { text: 'Hosted by: ', color: 'text-green-500' },
    { text: 'BOSSTRADAMUS | ', color: 'text-slate-300' },
    { text: 'Version ', color: 'text-green-500' },
    { text: '1.0 ', color: 'text-red-500' },
    { text: '| ', color: 'text-slate-300' },
    { text: 'Beta', color: 'text-green-500' },
  ];
  
  const leftClass = isLoggedIn ? 'left-24' : 'left-0';

  return (
    <footer className={`fixed bottom-0 ${leftClass} right-0 p-2 text-center text-xs font-mono bg-black/20 backdrop-blur-sm border-t border-white/10 z-30`}>
      {textParts.map((part, index) => (
        <span key={index} className={part.color}>{part.text}</span>
      ))}
    </footer>
  );
};

export default HomepageFooter;
