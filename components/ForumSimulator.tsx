import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Coordinate, SimulatorMode } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

const TYPING_SPEED = 80; 
const MOUSE_SPEED = 2200;
const READING_PAUSE = 4000;

interface ForumSimulatorProps {
    mode: SimulatorMode;
}

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // UI Refs
  const btnNewTopicRef = useRef<HTMLAnchorElement>(null);
  const btnWatchRef = useRef<HTMLButtonElement>(null);
  const watchMenuOptionWatchingRef = useRef<HTMLAnchorElement>(null);
  const btnReplyRef = useRef<HTMLAnchorElement>(null);
  
  // User Info Refs
  const userAvatarRef = useRef<HTMLDivElement>(null);
  const userNameRef = useRef<HTMLAnchorElement>(null);
  const userRepRef = useRef<HTMLSpanElement>(null);
  const userPostsRef = useRef<HTMLSpanElement>(null);

  // Composer Refs
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const btnBoldRef = useRef<HTMLButtonElement>(null);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: "טוען...",
    isComposerOpen: false,
    title: "",
    body: "",
    isSubmitted: false,
    cursorPos: { x: 50, y: 50 },
    isClicking: false,
    activeTool: null,
    selectionRange: null,
  });

  const [watchStatus, setWatchStatus] = useState<'not-watching' | 'watching'>('not-watching');
  const [isWatchMenuVisible, setIsWatchMenuVisible] = useState(false);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getElementCenter = (element: HTMLElement | null): Coordinate => {
    if (!containerRef.current || !element) return { x: 0, y: 0 };
    const containerRect = containerRef.current.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    return {
      x: (elRect.left - containerRect.left) + (elRect.width / 2),
      y: (elRect.top - containerRect.top) + (elRect.height / 2)
    };
  };

  const safeSetState = useCallback((updates: Partial<SimulationState>) => {
    setSimState(prev => ({ ...prev, ...updates }));
  }, []);

  const runScenario = useCallback(async () => {
    while (true) {
        if (mode === 'create') {
            safeSetState({ step: 1, instruction: "לחצו על 'נושא חדש' כדי להתחיל דיון חדש בקטגוריה", isComposerOpen: false, isSubmitted: false, title: "", body: "" });
            await wait(1500);
            safeSetState({ cursorPos: getElementCenter(btnNewTopicRef.current) });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false, isComposerOpen: true }); await wait(1000);

            safeSetState({ step: 2, instruction: "הזינו כותרת ברורה. שימו לב שהעורך מפוצל - מצד שמאל תראו תצוגה מקדימה" });
            safeSetState({ cursorPos: getElementCenter(inputTitleRef.current) });
            await wait(MOUSE_SPEED);
            let t = "";
            for (const char of "שאלה לגבי זמני התפילה ברכסים") { t += char; safeSetState({ title: t }); await wait(TYPING_SPEED); }
            await wait(1000);

            safeSetState({ step: 3, instruction: "כתבו את תוכן ההודעה. נשתמש ב-Markdown לעיצוב טקסט" });
            safeSetState({ cursorPos: getElementCenter(editorRef.current) });
            await wait(MOUSE_SPEED);
            let b = "שלום, מישהו יודע מתי מנחה גדולה בבית הכנסת ";
            for (const char of b) { safeSetState(p => ({ ...p, body: p.body + char })); await wait(TYPING_SPEED); }
            
            safeSetState({ cursorPos: getElementCenter(btnBoldRef.current) });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true, activeTool: 'bold' }); await wait(250);
            safeSetState({ isClicking: false });
            
            safeSetState({ cursorPos: getElementCenter(editorRef.current) });
            await wait(MOUSE_SPEED);
            let b2 = "**המרכזי**";
            for (const char of b2) { safeSetState(p => ({ ...p, body: p.body + char })); await wait(TYPING_SPEED); }
            safeSetState({ activeTool: null });
            await wait(READING_PAUSE);

            safeSetState({ step: 4, instruction: "כפתור השליחה נמצא ב-NodeBB למעלה מצד שמאל", cursorPos: getPosForSubmit() });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
            await wait(READING_PAUSE);

        } else if (mode === 'reply') {
            safeSetState({ step: 1, instruction: "להוספת תגובה, לחצו על כפתור 'הגב' הכחול בפוסט הרצוי", isComposerOpen: false, isSubmitted: false, body: "" });
            await wait(1500);
            safeSetState({ cursorPos: getElementCenter(btnReplyRef.current) });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false, isComposerOpen: true }); await wait(1000);

            safeSetState({ step: 2, instruction: "כתבו את תגובתכם. העורך המפוצל מאפשר לראות איך זה נראה בזמן אמת" });
            safeSetState({ cursorPos: getElementCenter(editorRef.current) });
            await wait(MOUSE_SPEED);
            let b = "";
            for (const char of "בדרך כלל בשעה 13:15. כדאי לבדוק בלוח המודעות.") { b += char; safeSetState({ body: b }); await wait(TYPING_SPEED); }
            await wait(2000);

            safeSetState({ step: 3, instruction: "סיימתם? לחצו על 'שליחה' בראש הקומפוזר משמאל", cursorPos: getPosForSubmit() });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
            await wait(READING_PAUSE);

        } else if (mode === 'follow') {
            setIsWatchMenuVisible(false);
            setWatchStatus('not-watching');
            safeSetState({ step: 1, instruction: "בדיון פעיל, ניתן לנהל מעקב והתראות דרך כפתור המעקב", isComposerOpen: false, isSubmitted: false });
            await wait(1500);
            safeSetState({ cursorPos: getElementCenter(btnWatchRef.current) });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false }); setIsWatchMenuVisible(true); await wait(1500);

            safeSetState({ step: 2, instruction: "בחירה ב-'עוקב' תשלח לכם התראה על כל תגובה חדשה בנושא זה" });
            safeSetState({ cursorPos: getElementCenter(watchMenuOptionWatchingRef.current) });
            await wait(MOUSE_SPEED);
            safeSetState({ isClicking: true }); await wait(300);
            safeSetState({ isClicking: false }); setWatchStatus('watching'); setIsWatchMenuVisible(false);
            await wait(READING_PAUSE);

        } else if (mode === 'user-info') {
            safeSetState({ step: 1, instruction: "בכל פוסט, הצד הימני מוקדש למידע על המשתמש הכותב", isComposerOpen: false });
            await wait(2500);
            
            safeSetState({ step: 2, instruction: "תמונת הפרופיל עוזרת לזהות את המשתמש בקלות בכל רחבי הפורום" });
            safeSetState({ cursorPos: getElementCenter(userAvatarRef.current) });
            await wait(MOUSE_SPEED); await wait(2000);

            safeSetState({ step: 3, instruction: "שם המשתמש הוא ייחודי. לחיצה עליו תוביל לפרופיל המלא שלו" });
            safeSetState({ cursorPos: getElementCenter(userNameRef.current) });
            await wait(MOUSE_SPEED); await wait(2000);

            safeSetState({ step: 4, instruction: "המוניטין מייצג את הערכת הקהילה (לייקים) שהמשתמש צבר" });
            safeSetState({ cursorPos: getElementCenter(userRepRef.current) });
            await wait(MOUSE_SPEED); await wait(2000);

            safeSetState({ step: 5, instruction: "מספר הפוסטים מראה כמה המשתמש תרם לפורום עד היום" });
            safeSetState({ cursorPos: getElementCenter(userPostsRef.current) });
            await wait(MOUSE_SPEED); await wait(4000);
        }
    }
  }, [mode, safeSetState]);

  const getPosForSubmit = () => getElementCenter(btnSubmitRef.current);

  useEffect(() => { runScenario(); }, [runScenario]);

  return (
    <div ref={containerRef} className="relative w-full mx-auto bg-white border-2 border-[#d4a373] rounded-xl shadow-2xl overflow-hidden select-none h-[680px] text-right">
      
      {/* Instruction Overlay */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-lg">
         <div className="bg-[#3e2f1c] text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-[#d4a373]">
            <div className="bg-[#d4a373] w-10 h-10 rounded-full flex items-center justify-center font-black text-xl shrink-0">{simState.step}</div>
            <div className="text-base font-bold leading-tight">{simState.instruction}</div>
         </div>
      </div>

      <div className="relative bg-[#f4f7f9] h-full flex flex-col overflow-hidden">
        
        {/* Mock Rchsnik Navbar */}
        <header className="bg-white h-14 border-b border-gray-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-10">
            <div className="flex gap-6 items-center">
                <span className="text-[#337ab7] font-black text-2xl tracking-tighter">רכוסניק</span>
                <div className="hidden md:flex gap-4 text-xs font-bold text-gray-500 uppercase">
                    <span className="text-[#337ab7] border-b-2 border-[#337ab7] pb-1">נושאים</span>
                    <span>קטגוריות</span>
                    <span>משתמשים</span>
                </div>
            </div>
            <div className="w-8 h-8 bg-[#f44336] rounded-full flex items-center justify-center text-white text-[10px] font-bold">ח</div>
        </header>

        <div className={`flex-1 overflow-y-auto transition-all duration-700 ${simState.isComposerOpen ? 'opacity-20 blur-sm' : ''}`}>
            
            {mode === 'create' ? (
                <div className="p-8 max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                             <span className="bg-[#DC9656] text-white w-8 h-8 rounded flex items-center justify-center"><i className="fa fa-right-left"></i></span>
                             <h2 className="text-2xl font-black text-[#333]">איש את רעהו יעזורו</h2>
                        </div>
                        <a ref={btnNewTopicRef} href="#" className="bg-[#337ab7] text-white px-5 py-2 rounded-md font-bold text-sm shadow hover:bg-[#286090] transition-colors">נושא חדש</a>
                    </div>
                    {simState.isSubmitted && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                             <div className="w-12 h-12 rounded-full bg-[#f44336] flex items-center justify-center text-white font-bold">ח</div>
                             <div className="text-right">
                                <div className="font-bold text-[#337ab7] text-lg">{simState.title}</div>
                                <div className="text-xs text-gray-400">פורסם לפני רגע על ידי "חצקל"</div>
                             </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <div className="p-6 bg-white border-b flex justify-between items-center sticky top-0 z-20">
                        <h1 className="text-2xl font-black text-[#333]">משטרה בלב אליהו</h1>
                        <div className="flex gap-2">
                             <div className="relative">
                                <button ref={btnWatchRef} className={`flex items-center gap-2 px-4 py-1.5 rounded border text-sm font-bold transition-colors ${watchStatus === 'watching' ? 'bg-[#5cb85c] text-white border-[#4cae4c]' : 'bg-white text-gray-600 border-gray-300'}`}>
                                    <span>{watchStatus === 'watching' ? '🔔' : '🔕'}</span> {watchStatus === 'watching' ? 'עוקב' : 'מעקב'}
                                </button>
                                {isWatchMenuVisible && (
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <a ref={watchMenuOptionWatchingRef} href="#" className="block p-3 hover:bg-gray-50 text-sm font-bold text-right border-b border-gray-100">עוקב</a>
                                        <a href="#" className="block p-3 hover:bg-gray-50 text-sm font-bold text-gray-400 text-right">לא עוקב</a>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                    
                    {/* Post structure with Sidebar */}
                    <div className="bg-white border-b border-gray-100 flex group">
                        {/* Sidebar */}
                        <div className="w-32 p-4 bg-gray-50/50 flex flex-col items-center border-l border-gray-100 shrink-0">
                            <div ref={userAvatarRef} className="w-16 h-16 rounded-full bg-[#e91e63] text-white flex items-center justify-center text-2xl font-black mb-2 shadow-sm">כ</div>
                            <a ref={userNameRef} href="#" className="font-bold text-xs text-[#337ab7] text-center mb-1 hover:underline">כאן-לעזור</a>
                            <div className="bg-black text-white text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-tighter mb-4">צוות פיקוח</div>
                            <div className="flex flex-col gap-1 items-center">
                                <span className="text-[9px] text-gray-400">פוסטים: <span ref={userPostsRef} className="text-gray-600 font-bold">62</span></span>
                                <span className="text-[9px] text-gray-400">מוניטין: <span ref={userRepRef} className="text-gray-600 font-bold">89</span></span>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 p-6 relative">
                            <div className="text-xs text-gray-400 mb-4 font-bold flex justify-between flex-row-reverse">
                                <span>#1</span>
                                <span>לפני יום</span>
                            </div>
                            <div className="text-lg text-[#333] leading-relaxed mb-10 text-right">
                                בודקים רכב רכב על חגורות בכיכר הכניסה.
                            </div>
                            <div className="absolute bottom-4 left-6">
                                <a ref={btnReplyRef} href="#" className="text-[#337ab7] font-bold text-sm hover:underline flex items-center gap-1">הגב <i className="fa fa-reply"></i></a>
                            </div>
                        </div>
                    </div>

                    {simState.isSubmitted && (
                         <div className="bg-white border-b-2 border-[#337ab7] flex animate-in fade-in slide-in-from-right-8 duration-700">
                             <div className="w-32 p-4 bg-blue-50/20 flex flex-col items-center border-l border-gray-100 shrink-0">
                                <div className="w-16 h-16 rounded-full bg-[#f44336] text-white flex items-center justify-center text-2xl font-black mb-2 shadow-md">ח</div>
                                <span className="font-bold text-xs text-[#337ab7] text-center mb-1">חצקל</span>
                                <div className="text-[10px] text-green-600 font-bold">מחובר</div>
                             </div>
                             <div className="flex-1 p-6">
                                <div className="text-xs text-blue-400 mb-4 font-bold flex justify-between flex-row-reverse"><span>#2</span><span>זה עתה</span></div>
                                <div className="text-lg text-[#333] text-right">
                                    <MarkdownRenderer text={simState.body} />
                                </div>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>

        {/* NodeBB Split-Pane Composer */}
        <div 
            className={`absolute bottom-0 left-0 w-full bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-gray-200 flex flex-col transition-all duration-700 z-40`}
            style={{ height: '540px', transform: simState.isComposerOpen ? 'translateY(0)' : 'translateY(100%)' }}
        >
            {/* Header with Submit on Top Left as per screenshots */}
            <div className="px-4 py-2 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <div className="flex items-center gap-1">
                    <button ref={btnSubmitRef} className="bg-[#337ab7] text-white px-6 py-1.5 rounded-md font-bold text-sm shadow hover:bg-[#286090] flex items-center gap-2">
                        <i className="fa fa-check"></i> שליחה
                    </button>
                    <button className="text-gray-500 font-bold text-sm px-3 py-1">ביטול</button>
                    <button className="text-gray-400 p-2"><i className="fa fa-angle-down"></i></button>
                </div>
                <div className="flex-1 px-4 text-center truncate">
                    <span className="font-bold text-[#333] text-sm">
                        {mode === 'create' ? 'פתיחת נושא חדש' : 'תגובה ל"משטרה בלב אליהו"'}
                    </span>
                </div>
                <div className="w-10"></div>
            </div>

            {/* Title Row (New Topic only) */}
            {mode === 'create' && (
                <div className="px-4 py-2 border-b bg-white flex items-center gap-2">
                    <div className="bg-[#DC9656] w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] shrink-0">
                        <i className="fa fa-right-left"></i>
                    </div>
                    <input 
                        ref={inputTitleRef} 
                        className="flex-1 border border-gray-300 px-4 py-2 rounded font-bold text-sm focus:outline-none focus:border-[#337ab7]" 
                        placeholder="הכניסו את כותרת הנושא כאן..." 
                        value={simState.title} 
                        readOnly 
                    />
                </div>
            )}

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b bg-gray-50 overflow-x-auto shrink-0">
                 <button ref={btnBoldRef} className={`w-8 h-8 flex items-center justify-center rounded transition-all text-xs font-black ${simState.activeTool === 'bold' ? 'bg-[#337ab7] text-white' : 'text-gray-500 hover:bg-gray-200 border border-transparent'}`}>B</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 italic">I</button>
                 <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>
                 <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500"><i className="fa fa-link"></i></button>
                 <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500"><i className="fa fa-picture-o"></i></button>
                 <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500">≡</button>
                 <div className="flex-1"></div>
                 <div className="flex items-center gap-2 text-[11px] font-bold text-[#337ab7] px-2 cursor-default">
                    <i className="fa fa-eye"></i> הצגת תצוגה מקדימה
                 </div>
            </div>

            {/* Split Editor/Preview Area (50/50) */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Area (Right side in RTL) */}
                <div className="w-1/2 h-full border-l border-gray-200 flex flex-col bg-white overflow-hidden">
                    <textarea 
                        ref={editorRef}
                        className="flex-1 p-4 text-base font-medium focus:outline-none resize-none leading-relaxed text-[#333] placeholder-gray-300 w-full scroll-smooth"
                        placeholder="כתבו את תוכן הפוסט כאן..."
                        value={simState.body}
                        readOnly
                        dir="rtl"
                    />
                </div>
                {/* Preview Area (Left side in RTL) */}
                <div className="w-1/2 h-full bg-gray-50/70 p-4 overflow-y-auto border-r border-gray-100">
                    <div className="prose prose-sm max-w-none text-right">
                        <MarkdownRenderer text={simState.body || "..."} />
                    </div>
                </div>
            </div>
        </div>
        
        <Cursor position={simState.cursorPos} isClicking={simState.isClicking} />
      </div>
    </div>
  );
};

export default ForumSimulator;
