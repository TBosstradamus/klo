import React, { useState, useEffect, useRef } from 'react';
import { HomepageElement } from '../types';
import FormattingHelp from './FormattingHelp';

const useAutosizeTextArea = (textAreaRef: React.RefObject<HTMLTextAreaElement>, value: string) => {
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "0px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textAreaRef, value]);
};

const EditorItem: React.FC<{
    element: HomepageElement;
    onUpdate: (id: string, updates: Partial<HomepageElement>) => void;
    onDelete: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
    onDrop: (e: React.DragEvent) => void;
}> = ({ element, onUpdate, onDelete, onDragStart, onDragOver, onDrop }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(element.content);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useAutosizeTextArea(textAreaRef, editText);

    const handleSave = () => {
        if (isEditing) {
            onUpdate(element.id, { content: editText });
            setIsEditing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !(e.shiftKey && e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') setIsEditing(false);
    };

    const renderView = () => {
        switch (element.type) {
            case 'heading': return <h2 className="text-2xl font-bold text-blue-400">{element.content}</h2>;
            case 'text': return <p className="text-gray-300 whitespace-pre-wrap">{element.content}</p>;
            case 'image': return <img src={element.dataUrl} alt={element.content} className="max-w-full rounded-md" />;
            default: return null;
        }
    };

    const renderEdit = () => {
        const commonProps = { value: editText, onChange: (e: any) => setEditText(e.target.value), onBlur: handleSave, onKeyDown: handleKeyDown, autoFocus: true };
        switch (element.type) {
            case 'heading': return <textarea {...commonProps} ref={textAreaRef} className="w-full bg-slate-700 text-2xl font-bold text-blue-400 p-2 rounded-md resize-none" rows={1} />;
            case 'text': return <textarea {...commonProps} ref={textAreaRef} className="w-full bg-slate-700 text-gray-300 p-2 rounded-md resize-none" rows={5} />;
            case 'image': return <input {...commonProps} className="w-full bg-slate-700 text-sm p-2 rounded-md" placeholder="Alt-Text für Bild" />;
            default: return null;
        }
    };
    
    return (
        <div
            draggable
            onDragStart={e => onDragStart(e, element.id)}
            onDragOver={e => onDragOver(e, element.id)}
            onDrop={onDrop}
            className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-transparent hover:border-blue-500/30 group"
        >
            <div className="cursor-grab text-gray-500 hover:text-white pt-1" title="Verschieben">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </div>
            <div className="flex-1" onDoubleClick={() => setIsEditing(true)}>
                {isEditing ? renderEdit() : renderView()}
            </div>
            <button onClick={() => onDelete(element.id)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Löschen">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};

interface PopoutEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialContent: HomepageElement[];
    onSave: (newContent: HomepageElement[]) => void;
}

const PopoutEditorModal: React.FC<PopoutEditorModalProps> = ({ isOpen, onClose, initialContent, onSave }) => {
    const [localContent, setLocalContent] = useState<HomepageElement[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const dragItemId = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLocalContent(JSON.parse(JSON.stringify(initialContent || [])));
        }
    }, [isOpen, initialContent]);
    
    if (!isOpen) return null;

    const handleUpdate = (id: string, updates: Partial<HomepageElement>) => {
        setLocalContent(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const handleDelete = (id: string) => {
        setLocalContent(prev => prev.filter(el => el.id !== id));
    };
    
    const handleAddElement = (type: 'heading' | 'text' | 'image') => {
        if (type === 'image') {
            imageInputRef.current?.click();
            return;
        }
        const newElement: HomepageElement = { id: `pop-el-${Date.now()}`, type, content: `Neuer ${type === 'heading' ? 'Titel' : 'Text'}`, x: 0, y: 0, isLocked: false };
        setLocalContent(prev => [...prev, newElement]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const newElement: HomepageElement = { id: `pop-el-${Date.now()}`, type: 'image', content: file.name, x: 0, y: 0, isLocked: false, dataUrl: event.target?.result as string, width: 500 };
                setLocalContent(prev => [...prev, newElement]);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        dragItemId.current = id;
    };
    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        const draggedOverItem = localContent.find(item => item.id === id);
        if (!draggedOverItem || dragItemId.current === id) return;
        const items = localContent.filter(item => item.id !== dragItemId.current);
        const draggedItem = localContent.find(item => item.id === dragItemId.current);
        if (!draggedItem) return;
        const overIndex = items.findIndex(item => item.id === id);
        items.splice(overIndex, 0, draggedItem);
        setLocalContent(items);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dragItemId.current = null;
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[51]" onClick={onClose}>
            <div className="bg-slate-900 w-11/12 max-w-6xl h-5/6 rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-blue-400">Popout-Inhalt bearbeiten</h2>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium">Abbrechen</button>
                        <button onClick={() => onSave(localContent)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium">Speichern & Schließen</button>
                    </div>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-3" onDragOver={e => e.preventDefault()}>
                        {localContent.map(element => (
                            <EditorItem 
                                key={element.id} 
                                element={element} 
                                onUpdate={handleUpdate} 
                                onDelete={handleDelete}
                                onDragStart={handleDragStart}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            />
                        ))}
                        {localContent.length === 0 && (
                            <div className="flex items-center justify-center h-full text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
                                Fügen Sie Inhalte aus der Werkzeugleiste hinzu.
                            </div>
                        )}
                    </div>
                    <aside className="w-80 bg-slate-800/50 p-6 border-l border-slate-700">
                        <h3 className="text-lg font-semibold mb-4">Werkzeuge</h3>
                        <div className="space-y-3">
                            <button onClick={() => handleAddElement('heading')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Überschrift</button>
                            <button onClick={() => handleAddElement('text')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Text</button>
                            <button onClick={() => handleAddElement('image')} className="w-full text-left p-3 bg-slate-700 hover:bg-blue-500/20 rounded-lg">Bild</button>
                            <input type="file" accept="image/*" ref={imageInputRef} onChange={handleFileChange} className="hidden" />
                        </div>
                        <div className="mt-8"><FormattingHelp /></div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PopoutEditorModal;