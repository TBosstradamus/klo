import React from 'react';
import { Officer, HomepageElement, Rank } from '../types';
import UserDisplay from './UserDisplay';
import HomepageFooter from './HomepageFooter';

// Helper function to parse content with formatting
const colorMap: { [key: string]: string } = {
  rot: 'text-red-500',
  grün: 'text-green-500',
  blau: 'text-blue-400',
  orange: 'text-orange-500',
  gelb: 'text-yellow-500',
};

const parseFormattedText = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const regex = /#([^#()]+)\((rot|grün|blau|orange|gelb)\)#|#([^#]+)#|(\w+)\((rot|grün|blau|orange|gelb)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
        }

        if (match[1] && match[2]) { // Case: #word(color)#
            const word = match[1];
            const color = match[2];
            const colorClass = colorMap[color] || '';
            elements.push(<strong key={match.index}><span className={colorClass}>{word}</span></strong>);
        } else if (match[3]) { // Case: #word#
            elements.push(<strong key={match.index} className="text-slate-100">{match[3]}</strong>);
        } else if (match[4] && match[5]) { // Case: word(color)
            const word = match[4];
            const color = match[5];
            const colorClass = colorMap[color] || '';
            elements.push(<span key={match.index} className={colorClass}>{word}</span>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }
    
    return <>{elements.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
};

const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => {
        if (line.startsWith('- ')) {
            return (
                <div key={index} className="flex items-start pl-4">
                    <span className="mr-2 mt-1 text-blue-400">•</span>
                    <div className="flex-1">{parseFormattedText(line.substring(2))}</div>
                </div>
            );
        }
        return <p key={index}>{parseFormattedText(line)}</p>;
    });
};

const HomepageElementRenderer: React.FC<{
  element: HomepageElement;
  onClick?: () => void;
}> = ({ element, onClick }) => {
    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        zIndex: element.isBackground ? 0 : 1,
    };

    if (element.type === 'image') {
        baseStyle.opacity = (element.opacity || 100) / 100;
    }

    switch (element.type) {
        case 'heading':
            return <h1 style={{...baseStyle, maxWidth: 'calc(100% - 100px)'}} className="text-5xl font-bold text-slate-100 select-none">{parseFormattedText(element.content)}</h1>;
        case 'text':
            return <div style={{...baseStyle, maxWidth: 'calc(100% - 100px)'}} className="text-lg text-slate-400 leading-relaxed select-none whitespace-pre-wrap max-w-2xl">{renderTextWithLineBreaks(element.content)}</div>;
        case 'button':
            return <button style={baseStyle} onClick={onClick} className="px-5 py-2.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-lg select-none">{parseFormattedText(element.content)}</button>;
        case 'image':
            const containerStyle: React.CSSProperties = { ...baseStyle };
            if (element.width) {
                containerStyle.width = `${element.width}px`;
            }
            if (element.height) {
                containerStyle.height = `${element.height}px`;
            }
            if (element.isCentered) {
                containerStyle.left = '50%';
                containerStyle.top = '50%';
                containerStyle.transform = 'translate(-50%, -50%)';
            }
            return (
                <div style={containerStyle}>
                    <img 
                        src={element.dataUrl} 
                        alt={element.content} 
                        style={{ imageRendering: 'auto' }}
                        className="w-full h-full object-contain select-none"
                    />
                </div>
            );
        default:
            return null;
    }
}

interface PlaceholderPageProps {
  title: string;
  content: HomepageElement[];
  currentUser?: Officer;
  onLogout?: () => void;
  onOpenLoginModal?: () => void;
  onOpenTeamModal?: () => void;
  onOpenPopout?: (data: { content: HomepageElement[], size: 'small' | 'medium' | 'large' }) => void;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, content, currentUser, onLogout, onOpenLoginModal, onOpenTeamModal, onOpenPopout }) => {
  // Sort elements to render backgrounds first, ensuring they are lower in the DOM tree.
  const sortedContent = [...content].sort((a, b) => {
    if (a.isBackground && !b.isBackground) return -1;
    if (!a.isBackground && b.isBackground) return 1;
    return 0;
  });

  const getDisplayedRank = (rank: Rank): string => {
    if (rank.startsWith('Police Officer')) {
      return 'Officer';
    }
    return rank;
  };

  const getElementAction = (element: HomepageElement): (() => void) | undefined => {
    if (element.type !== 'button') return undefined;

    if (element.action === 'openTeamModal' && onOpenTeamModal) {
        return onOpenTeamModal;
    }
    if (element.action === 'openPopout' && element.popoutContent && onOpenPopout) {
        return () => onOpenPopout({ content: element.popoutContent!, size: element.popoutSize || 'medium' });
    }
    return undefined;
  };

  return (
    <div className="relative h-full bg-gray-950 p-12 overflow-auto">
      {!currentUser && onOpenLoginModal && (
        <button
          onClick={onOpenLoginModal}
          className="absolute top-6 right-6 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition-colors z-20"
        >
          Anmelden
        </button>
      )}
      {currentUser && onLogout && (
        <div className="absolute top-6 right-6 z-20">
            <UserDisplay currentUser={currentUser} onLogout={onLogout} />
        </div>
      )}
      {currentUser && (
          <h1 style={{ position: 'absolute', left: '70px', top: '50px' }} className="text-5xl font-bold text-slate-100 select-none">
              Willkommen {getDisplayedRank(currentUser.rank)} {currentUser.firstName} {currentUser.lastName}
          </h1>
      )}
      <div className="relative w-full h-full min-h-[800px]">
        {sortedContent.map(element => (
            <HomepageElementRenderer key={element.id} element={element} onClick={getElementAction(element)} />
        ))}
        {content.length === 0 && currentUser && <h1 className="text-4xl font-bold text-blue-400 mb-4 text-center">{title}</h1>}
      </div>
      <HomepageFooter isLoggedIn={!!currentUser} />
    </div>
  );
};

export default PlaceholderPage;