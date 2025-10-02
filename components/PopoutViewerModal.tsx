import React from 'react';
import { HomepageElement } from '../types';

// Helper function to parse content with formatting (re-used from PlaceholderPage)
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
        if (match[1] && match[2]) {
            elements.push(<strong key={match.index}><span className={colorMap[match[2]] || ''}>{match[1]}</span></strong>);
        } else if (match[3]) {
            elements.push(<strong key={match.index} className="text-slate-100">{match[3]}</strong>);
        } else if (match[4] && match[5]) {
            elements.push(<span key={match.index} className={colorMap[match[5]] || ''}>{match[4]}</span>);
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

const PopoutElementRenderer: React.FC<{ element: HomepageElement }> = ({ element }) => {
    switch (element.type) {
        case 'heading':
            return <h1 className="text-4xl font-bold text-slate-100">{parseFormattedText(element.content)}</h1>;
        case 'text':
            return <div className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{renderTextWithLineBreaks(element.content)}</div>;
        case 'image':
            const style: React.CSSProperties = {
                opacity: (element.opacity || 100) / 100,
                width: element.width ? `${element.width}px` : '100%',
                height: element.height ? `${element.height}px` : 'auto',
                margin: element.isCentered ? '0 auto' : undefined,
            };
            return <img src={element.dataUrl} alt={element.content} style={style} className="object-contain max-w-full rounded-md" />;
        default: return null;
    }
};

interface PopoutViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: HomepageElement[];
    size: 'small' | 'medium' | 'large';
}

const PopoutViewerModal: React.FC<PopoutViewerModalProps> = ({ isOpen, onClose, content, size }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-5xl',
    };
    
    // Sort backgrounds to be rendered as CSS backgrounds perhaps, or just ignore for vertical layout.
    // For simplicity, we'll just render them as normal images in the flow.
    const sortedContent = [...content].sort((a, b) => (a.isBackground ? -1 : b.isBackground ? 1 : 0));

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`bg-gray-900 w-full h-auto max-h-[90vh] rounded-2xl shadow-2xl border border-gray-800 flex flex-col ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-end p-2 flex-shrink-0">
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="px-8 pb-8 flex-1 overflow-y-auto">
                    <div className="w-full h-full flex flex-col gap-6">
                        {sortedContent.map(element => (
                            <PopoutElementRenderer key={element.id} element={element} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PopoutViewerModal;
