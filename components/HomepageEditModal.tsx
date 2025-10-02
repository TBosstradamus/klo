import React, { useState, useEffect, useRef, RefObject } from 'react';
import { HomepageElement } from '../types';
import FormattingHelp from './FormattingHelp';
import PopoutEditorModal from './PopoutEditorModal';

const useAutosizeTextArea = (
  textAreaRef: RefObject<HTMLTextAreaElement>,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};


const EditableElement: React.FC<{
    element: HomepageElement;
    onDelete: (id: string) => void;
    onToggleLock: (id: string) => void;
    onDragInitiate: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
    onUpdate: (id: string, updates: Partial<HomepageElement>) => void;
    onOpenPopoutEditor: (element: HomepageElement) => void;
    isMoveModeActive: boolean;
}> = ({ element, onDelete, onToggleLock, onDragInitiate, onUpdate, onOpenPopoutEditor, isMoveModeActive }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(element.content);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useAutosizeTextArea(textAreaRef, editText);
    
    const handleStartEdit = () => {
        if (!element.isLocked && ['heading', 'text', 'button'].includes(element.type)) {
            setEditText(element.content);
            setIsEditing(true);
        }
    };

    const handleSave = () => {
        if (isEditing) {
            onUpdate(element.id, { content: editText });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(element.content);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (e.key === 'Enter' && !(e.shiftKey && e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };
    
    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const parentElement = target.parentElement;
        if (!parentElement) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.width || parentElement.offsetWidth;
        const startHeight = element.height || parentElement.offsetHeight;

        const doDrag = (moveEvent: MouseEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            const newHeight = startHeight + (moveEvent.clientY - startY);
            onUpdate(element.id, { width: Math.max(20, newWidth), height: Math.max(20, newHeight) });
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    };

    const isDraggable = !element.isLocked && !(element.type === 'image' && element.isCentered);

    const style: React.CSSProperties = {
        position: 'absolute',
        top: `${element.y}px`,
        zIndex: element.isBackground ? 0 : isEditing ? 20 : 10,
        opacity: element.type === 'image' ? (element.opacity || 100) / 100 : undefined,
        width: (element.type === 'image' && element.width) ? `${element.width}px` : (element.type !== 'image' ? 'auto' : undefined),
        height: (element.type === 'image' && element.height) ? `${element.height}px` : 'auto',
    };

    if (element.type === 'image' && element.isCentered) {
        style.left = '50%';
        style.top = '50%';
        style.transform = 'translate(-50%, -50%)';
    } else {
        style.left = `${element.x}px`;
    }
    
    const handleMouseDownForDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only allow dragging when in move mode
        if (isMoveModeActive && isDraggable) {
            onDragInitiate(e, element.id);
        }
    };

    const renderContent = () => {
        switch (element.type) {
            case 'heading':
                return <h1 className="text-4xl font-bold text-blue-400 select-none p-2">{element.content}</h1>;
            case 'text':
                return <div className="text-lg text-gray-300 leading-relaxed select-none p-2 whitespace-pre-wrap max-w-2xl">{element.content}</div>;
            case 'button':
                return <button className="px-5 py-2.5 text-base font-medium text-white bg-blue-600 rounded-lg shadow-lg select-none">{element.content}</button>;
            case 'image':
                const imageClasses = `object-contain select-none w-full h-full ${element.isBackground ? 'ring-4 ring-offset-2 ring-offset-slate-800 ring-purple-500' : ''}`;
                return <img src={element.dataUrl} alt={element.content} style={{ imageRendering: 'auto' }} className={imageClasses} />;
            default:
                return null;
        }
    };
    
    const renderEditableContent = () => {
        const commonProps = {
            value: editText,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditText(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            autoFocus: true,
            onClick: (e: React.MouseEvent) => e.stopPropagation(),
        };
        
        const baseEditClasses = "bg-slate-700 resize-none border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 p-2 z-20";

        switch (element.type) {
            case 'heading':
                return <textarea {...commonProps} ref={textAreaRef} className={`${baseEditClasses} text-4xl font-bold text-blue-400`} rows={1} />;
            case 'text':
                return <textarea {...commonProps} ref={textAreaRef} className={`${baseEditClasses} text-lg text-gray-300 leading-relaxed whitespace-pre-wrap w-[500px]`} rows={3} />;
            case 'button':
                return (
                    <div className="px-5 py-2.5 text-base font-medium text-white bg-blue-600 rounded-lg shadow-lg">
                        <input {...commonProps} type="text" className="bg-transparent text-center border-0 focus:ring-0 p-0 m-0 w-full" />
                    </div>
                );
            default:
                return renderContent();
        }
    };


    return (
        <div
            onDoubleClick={!isMoveModeActive ? handleStartEdit : undefined}
            onMouseDown={handleMouseDownForDrag}
            style={style}
            className={`relative group border-2 border-transparent 
                ${!isMoveModeActive ? 'hover:border-blue-500/50' : ''}
                ${isMoveModeActive && isDraggable ? 'cursor-grab active:cursor-grabbing border-blue-500/50' : ''}
                ${isMoveModeActive && !isDraggable ? 'cursor-not-allowed' : ''}
            `}
        >
            {isEditing ? renderEditableContent() : renderContent()}

            {!isMoveModeActive && (
                <>
                    <div className={`absolute top-0 right-0 -mt-3 -mr-3 flex items-center gap-1.5 p-1 bg-slate-800 rounded-full shadow-lg z-20 transition-opacity ${!isEditing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                        {element.type === 'button' && (
                          <div className="flex items-center gap-2 text-xs p-1">
                              <select value={element.action || 'none'} onChange={e => onUpdate(element.id, { action: e.target.value as any })} className="bg-slate-700 rounded text-xs py-1 px-2 border-slate-600">
                                  <option value="none">Keine Aktion</option>
                                  <option value="openTeamModal">Team-Modal</option>
                                  <option value="openPopout">Popout</option>
                              </select>
                              {element.action === 'openPopout' && (
                                <>
                                  <select value={element.popoutSize || 'medium'} onChange={e => onUpdate(element.id, { popoutSize: e.target.value as any })} className="bg-slate-700 rounded text-xs py-1 px-2 border-slate-600">
                                      <option value="small">Klein</option>
                                      <option value="medium">Mittel</option>
                                      <option value="large">Groß</option>
                                  </select>
                                  <button onClick={() => onOpenPopoutEditor(element)} className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white">Inhalt bearbeiten</button>
                                </>
                              )}
                          </div>
                        )}
                        {!isEditing && (
                          <>
                            <button onClick={() => onToggleLock(element.id)} className="p-1.5 text-white rounded-full hover:bg-slate-700 transition-colors" title={element.isLocked ? 'Entsperren' : 'Fixieren'}>
                                {element.isLocked ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg> :
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" /></svg>
                                }
                            </button>
                             <button onClick={() => onDelete(element.id)} className="p-1.5 text-white rounded-full hover:bg-slate-700 transition-colors" title="Löschen">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                    </div>

                    {!isEditing && element.type === 'image' && !element.isLocked && (
                        <div onMouseDown={handleResizeMouseDown} title="Größe ändern" className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-slate-900 rounded-full cursor-nwse-resize z-30 opacity-0 group-hover:opacity-100"/>
                    )}
                    {!isEditing && element.type === 'image' && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-slate-800/80 rounded-b-md shadow-lg opacity-0 group-hover:opacity-100 z-10 flex flex-col gap-2 text-xs text-white">
                            <div className="flex items-center justify-between"><label>Hintergrund</label><label className="switch"><input type="checkbox" checked={!!element.isBackground} onChange={e => onUpdate(element.id, { isBackground: e.target.checked })} /><span className="slider"></span></label></div>
                            <div className="flex items-center justify-between"><label>Zentrieren</label><label className="switch"><input type="checkbox" checked={!!element.isCentered} onChange={e => onUpdate(element.id, { isCentered: e.target.checked })} /><span className="slider"></span></label></div>
                            <label>Deckkraft</label><input type="range" min="0" max="100" value={element.opacity || 100} onChange={e => onUpdate(element.id, { opacity: parseInt(e.target.value, 10) })}/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


interface HomepageEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    officerContent: HomepageElement[];
    publicContent: HomepageElement[];
    onSave: (newContent: HomepageElement[], type: 'officer' | 'public') => void;
}

const HomepageEditModal: React.FC<HomepageEditModalProps> = ({ isOpen, onClose, officerContent, publicContent, onSave }) => {
    const [editMode, setEditMode] = useState<'officer' | 'public'>('officer');
    const [localContent, setLocalContent] = useState<HomepageElement[]>([]);
    const [showGrid, setShowGrid] = useState(true);
    const [isMoveModeActive, setIsMoveModeActive] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [popoutToEdit, setPopoutToEdit] = useState<HomepageElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            const contentToLoad = editMode === 'officer' ? officerContent : publicContent;
            setLocalContent(JSON.parse(JSON.stringify(contentToLoad)));
            setIsMoveModeActive(false); // Reset move mode when opening/switching
        }
    }, [isOpen, officerContent, publicContent, editMode]);
    
    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const newElement: HomepageElement = { id: `hp-${Date.now()}`, type: 'image', content: file.name, x: 20, y: 20, isLocked: false, dataUrl: event.target?.result as string, isBackground: false, opacity: 100, width: 300, height: (300 * img.height) / img.width };
                    setLocalContent(prev => [...prev, newElement]);
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleAddElement = (type: 'heading' | 'text' | 'button') => {
        const newElement: HomepageElement = { id: `hp-${Date.now()}`, type, content: `Neues Element`, x: 20, y: 20, isLocked: false };
        setLocalContent(prev => [...prev, newElement]);
    };
    
    const handleDeleteElement = (id: string) => setLocalContent(prev => prev.filter(el => el.id !== id));
    const handleToggleLock = (id: string) => setLocalContent(prev => prev.map(el => el.id === id ? { ...el, isLocked: !el.isLocked } : el));
    const handleUpdateElement = (id: string, updates: Partial<HomepageElement>) => setLocalContent(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    const handleUpdatePosition = (id: string, x: number, y: number) => handleUpdateElement(id, { x, y });

    const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
        const element = localContent.find(el => el.id === id);
        if (!element || element.isLocked) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        e.preventDefault(); // Prevent default drag behavior

        const canvasRect = canvas.getBoundingClientRect();
        const elementNode = e.currentTarget;
        if (!elementNode) return;
        
        let isDragging = false;
        const offsetX = e.clientX - elementNode.getBoundingClientRect().left;
        const offsetY = e.clientY - elementNode.getBoundingClientRect().top;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            isDragging = true; // First move triggers drag state
            
            const x = moveEvent.clientX - canvasRect.left - offsetX;
            const y = moveEvent.clientY - canvasRect.top - offsetY;
            handleUpdatePosition(id, x, y);
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (isDragging) {
                const x = upEvent.clientX - canvasRect.left - offsetX;
                const y = upEvent.clientY - canvasRect.top - offsetY;
                handleUpdatePosition(id, showGrid ? Math.round(x / 20) * 20 : x, showGrid ? Math.round(y / 20) * 20 : y);
            }
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleSavePopoutContent = (newContent: HomepageElement[]) => {
        if (popoutToEdit) {
            handleUpdateElement(popoutToEdit.id, { popoutContent: newContent });
        }
        setPopoutToEdit(null);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
                <div className="bg-slate-900 w-11/12 h-5/6 rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                        <h2 className="text-xl font-bold text-blue-400">Homepage bearbeiten</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium">Abbrechen</button>
                            <button onClick={() => onSave(localContent, editMode)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium">Speichern</button>
                        </div>
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 overflow-auto p-8 bg-slate-800" ref={canvasRef}>
                            <div className="relative w-full h-full min-h-[800px] border border-dashed border-slate-600">
                                {showGrid && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)`, backgroundSize: `20px 20px` }} />}
                                {localContent.map(element => (
                                    <EditableElement key={element.id} element={element} onDelete={handleDeleteElement} onToggleLock={handleToggleLock} onDragInitiate={handleElementMouseDown} onUpdate={handleUpdateElement} onOpenPopoutEditor={setPopoutToEdit} isMoveModeActive={isMoveModeActive} />
                                ))}
                            </div>
                        </div>
                        <div className="w-80 bg-slate-800/50 p-6 border-l border-slate-700 overflow-y-auto">
                            <div className="flex items-center bg-slate-800 p-1 rounded-lg mb-4">
                                <button onClick={() => setEditMode('officer')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${editMode === 'officer' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Officer</button>
                                <button onClick={() => setEditMode('public')} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md ${editMode === 'public' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Öffentlich</button>
                            </div>
                            <h3 className="text-lg font-semibold mb-4">Werkzeuge</h3>
                            <div className="space-y-3">
                                <button onClick={() => handleAddElement('heading')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Überschrift</button>
                                <button onClick={() => handleAddElement('text')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Text</button>
                                <button onClick={() => handleAddElement('button')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Button</button>
                                <button onClick={() => imageInputRef.current?.click()} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Bild</button>
                                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileChange} className="hidden" />
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-700">
                               <button onClick={() => setIsMoveModeActive(p => !p)} className={`w-full flex items-center justify-between p-2 rounded-lg mb-2 transition-colors ${isMoveModeActive ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                    <span className="font-medium">Verschiebemodus</span>
                                    <span className="text-xl">🖐️</span>
                                </button>
                               <label className="flex items-center justify-between cursor-pointer"><span className="font-medium">Raster</span><div className="switch"><input type="checkbox" checked={showGrid} onChange={() => setShowGrid(p => !p)} /><span className="slider"></span></div></label>
                            </div>
                            <div className="mt-8"><FormattingHelp /></div>
                        </div>
                    </div>
                </div>
            </div>
            <PopoutEditorModal 
                isOpen={!!popoutToEdit}
                onClose={() => setPopoutToEdit(null)}
                initialContent={popoutToEdit?.popoutContent || []}
                onSave={handleSavePopoutContent}
            />
        </>
    );
};

export default HomepageEditModal;