import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Coordinate } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

// Constants for pacing
const TYPING_SPEED = 140; 
const MOUSE_SPEED = 2200;
const READING_PAUSE = 4000;

interface ForumSimulatorProps {
    mode: 'create' | 'reply' | 'follow';
}

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Topic Refs
  const btnNewTopicRef = useRef<HTMLButtonElement>(null);
  const btnReplyRef = useRef<HTMLButtonElement>(null);
  const btnWatchRef = useRef<HTMLButtonElement>(null);
  const watchMenuOptionRef = useRef<HTMLDivElement>(null);

  // Composer Refs
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const btnBoldRef = useRef<HTMLDivElement>(null);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: "טוען הדמיה...",
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

  const getElementCenter = (element: HTMLElement): Coordinate => {
    if (!containerRef.current) return { x: 0, y: 0 };
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
        // --- Scenario 1: CREATE TOPIC ---
        if (mode === 'create') {
            safeSetState({ step: 1, instruction: "כדי לפתוח נושא חדש, לחצו על 'נושא חדש'", isComposerOpen: false, isSubmitted: false, title: "", body: "" });
            await wait(2000);

            if (btnNewTopicRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnNewTopicRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1500);
            }

            safeSetState({ step: 2, instruction: "כעת, הזינו כותרת ברורה וממוקדת" });
            if (inputTitleRef.current) {
                safeSetState({ cursorPos: getElementCenter(inputTitleRef.current) });
                await wait(MOUSE_SPEED);
                const text = "המלצה על ספר חדש שיצא לאור השבוע";
                let t = "";
                for (const char of text) { t += char; safeSetState({ title: t }); await wait(TYPING_SPEED); }
                await wait(1500);
            }

            safeSetState({ step: 3, instruction: "בגוף ההודעה, נכתוב את הפרטים ונדגיש את שם הספר" });
            if (editorRef.current && btnBoldRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                
                // Typing text
                let b = "";
                const part1 = "אני רוצה להמליץ לכם על הספר ";
                for (const char of part1) { b += char; safeSetState({ body: b }); await wait(TYPING_SPEED); }
                
                // Clicking Bold
                safeSetState({ instruction: "נלחץ על B כדי להפעיל הדגשה" });
                safeSetState({ cursorPos: getElementCenter(btnBoldRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true, activeTool: 'bold' });
                await wait(200);
                safeSetState({ isClicking: false });
                
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                const part2 = "**'אור הלב'**";
                for (const char of part2) { b += char; safeSetState({ body: b }); await wait(TYPING_SPEED); }
                
                safeSetState({ activeTool: null });
                const part3 = " - ספר מדהים לכל המשפחה.";
                for (const char of part3) { b += char; safeSetState({ body: b }); await wait(TYPING_SPEED); }
                await wait(READING_PAUSE);
            }

            safeSetState({ step: 4, instruction: "לסיום, נלחץ על כפתור השליחה" });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(READING_PAUSE);
            }
        }

        // --- Scenario 2: REPLY ---
        else if (mode === 'reply') {
            safeSetState({ step: 1, instruction: "כדי להגיב להודעה מסוימת, לחצו על כפתור 'הגב'", isComposerOpen: false, isSubmitted: false, body: "" });
            await wait(2000);

            if (btnReplyRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnReplyRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1500);
            }

            safeSetState({ step: 2, instruction: "נכתוב תגובה ונוסיף תמונה להמחשה" });
            if (editorRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                let b = "";
                const msg = "יישר כוח! הנה תמונה של הספר מהחנות:";
                for (const char of msg) { b += char; safeSetState({ body: b }); await wait(TYPING_SPEED); }
                
                b += "\n\n![ספר](https://picsum.photos/400/200)";
                safeSetState({ body: b });
                await wait(2500);
            }

            safeSetState({ step: 3, instruction: "נשלח את התגובה שלנו" });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(READING_PAUSE);
            }
        }

        // --- Scenario 3: FOLLOW (ACCURATE) ---
        else if (mode === 'follow') {
            setWatchStatus('not-watching');
            setIsWatchMenuVisible(false);
            safeSetState({ step: 1, instruction: "רוצים לקבל התראות? חפשו את כפתור המעקב (הפעמון)", isComposerOpen: false, isSubmitted: false });
            await wait(2500);

            if (btnWatchRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnWatchRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false });
                setIsWatchMenuVisible(true);
                await wait(1500);

                safeSetState({ step: 2, instruction: "בתפריט שנפתח, בחרו ב-'עוקב'" });
                if (watchMenuOptionRef.current) {
                    safeSetState({ cursorPos: getElementCenter(watchMenuOptionRef.current) });
                    await wait(MOUSE_SPEED);
                    safeSetState({ isClicking: true });
                    await wait(300);
                    safeSetState({ isClicking: false });
                    setWatchStatus('watching');
                    setIsWatchMenuVisible(false);
                    await wait(1000);
                    safeSetState({ instruction: "מעולה! כעת תקבלו התראה על כל תגובה חדשה בנושא" });
                    await wait(READING_PAUSE);
                }
            }
        }
    }
  }, [mode, safeSetState]);

  useEffect(() => {
    runScenario();
  }, [runScenario]);

  return (
    <div 
        ref={containerRef}
        className="relative w-full mx-auto bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden select-none"
        style={{ height: '620px' }}
    >
      {/* Floating Instructions Bubble */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-lg">
         <div className="bg-[#1a1a1a] text-white p-5 rounded-2xl shadow-2xl flex items-center gap-5 border border-white/10 backdrop-blur-md">
            <div className="bg-[#27ae60] w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shrink-0 shadow-lg border-2 border-white/20">
                {simState.step}
            </div>
            <div className="text-lg font-bold leading-tight tracking-tight">
                {simState.instruction}
            </div>
         </div>
      </div>

      {/* Forum UI Simulation */}
      <div className="relative bg-[#f0f2f5] h-full flex flex-col">
        
        {/* Navbar */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-6 justify-between shrink-0 shadow-sm z-10">
            <div className="flex gap-8 items-center">
                <span className="text-[#333] font-black text-2xl tracking-tighter">רכוסניק</span>
                <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
                    <span>נושאים</span>
                    <span>קטגוריות</span>
                </nav>
            </div>
            <div className="w-9 h-9 bg-[#27ae60] rounded-full shadow-inner border border-gray-100"></div>
        </header>

        {/* Content View */}
        <div className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-1000 ${simState.isComposerOpen ? 'opacity-30 blur-[2px] grayscale-[50%]' : 'opacity-100'}`}>
            
            {mode === 'create' ? (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-200">
                        <h2 className="text-2xl font-black text-[#1a1a1a]">דיבורים וקהילה</h2>
                        <button ref={btnNewTopicRef} className="bg-[#27ae60] text-white px-6 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#219150]">נושא חדש +</button>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100"></div>
                            <div className="flex-1"><div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div><div className="h-3 bg-gray-50 rounded w-1/3"></div></div>
                        </div>
                        {simState.isSubmitted && (
                             <div className="bg-white p-5 rounded-xl border-2 border-[#27ae60] shadow-md flex gap-4 items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <div className="w-12 h-12 rounded-full bg-[#27ae60] flex items-center justify-center text-white font-bold">אני</div>
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-[#1a1a1a]">{simState.title}</div>
                                    <div className="text-sm text-[#27ae60] font-bold">נוצר זה עתה</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-black text-[#1a1a1a] mb-8">משטרה בלב אהליהו - מה קורה שם?</h2>
                    
                    {/* Post Content */}
                    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">מז</div>
                                <span className="font-bold text-[#1a1a1a]">משה_זוכמיר</span>
                            </div>
                            <span className="text-xs font-medium text-gray-400">לפני שעה</span>
                        </div>
                        <div className="p-8 text-lg text-[#444] leading-relaxed">
                            מישהו יודע מה קורה שם? יש חסימות? ניידות חוסמות את הכניסה.
                        </div>
                        <div className="p-4 bg-gray-50/30 border-t border-gray-100 flex justify-end gap-3">
                            {mode === 'follow' && (
                                <div className="relative">
                                    <button 
                                        ref={btnWatchRef}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm transition-all border ${watchStatus === 'watching' ? 'bg-[#27ae60] text-white border-[#219150]' : 'bg-white text-gray-600 border-gray-200 shadow-sm'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                        {watchStatus === 'watching' ? 'עוקב' : 'מעקב'}
                                    </button>

                                    {isWatchMenuVisible && (
                                        <div className="absolute bottom-full right-0 mb-3 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden ring-4 ring-black/5">
                                            <div className="p-3 bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-black text-gray-400 tracking-wider">סטטוס מעקב</div>
                                            <div ref={watchMenuOptionRef} className="p-4 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-[#27ae60]"></div>
                                                <div className="text-sm font-bold text-[#1a1a1a]">עוקב</div>
                                            </div>
                                            <div className="p-4 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-500">לא עוקב</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button ref={btnReplyRef} className="bg-[#2980b9] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#20638f]">הגב ↩</button>
                        </div>
                    </article>

                    {simState.isSubmitted && (
                         <article className="bg-white rounded-2xl shadow-lg border-2 border-[#2980b9] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
                             <div className="bg-[#f0f9ff] p-4 border-b border-[#e1f0fa] flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#27ae60] text-white flex items-center justify-center font-bold rounded-full">אני</div>
                                <span className="font-bold text-[#1a1a1a]">משתמש_קהילה</span>
                                <span className="text-xs text-blue-500 font-bold ml-auto">זה עתה</span>
                             </div>
                             <div className="p-8 text-lg text-[#444] leading-relaxed">
                                <MarkdownRenderer text={simState.body} />
                             </div>
                         </article>
                    )}
                </div>
            )}
        </div>

        {/* NodeBB Composer Simulation */}
        <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[96%] max-w-4xl bg-white rounded-t-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.12)] border border-gray-200 flex flex-col transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) z-40`}
            style={{ height: '440px', transform: simState.isComposerOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)' }}
        >
            <div className="bg-white px-8 py-5 border-b border-gray-100 flex justify-between items-center rounded-t-2xl">
                <div className="font-black text-xl text-[#1a1a1a]">{mode === 'create' ? 'נושא חדש' : 'כתיבת תגובה'}</div>
                <div className="flex gap-2">
                    <button className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"></button>
                    <button className="w-4 h-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"></button>
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
                     <div ref={btnBoldRef} className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all font-black ${simState.activeTool === 'bold' ? 'bg-[#27ae60] text-white border-[#27ae60]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}>B</div>
                     <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-400 border-2 border-gray-100 font-serif italic text-lg">I</div>
                     <div className="w-[2px] h-6 bg-gray-200 mx-2"></div>
                     <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-400 border-2 border-gray-100">🖼️</div>
                     <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-400 border-2 border-gray-100">🔗</div>
                </div>

                {mode === 'create' && (
                     <input ref={inputTitleRef} type="text" className="w-full p-6 bg-white border-b border-gray-50 text-xl font-bold text-[#1a1a1a] focus:outline-none placeholder-gray-200" placeholder="הכנס כותרת כאן..." value={simState.title} readOnly />
                )}
               
                <div ref={editorRef} className="flex-1 p-8 text-xl font-medium text-[#444] bg-white overflow-y-auto leading-relaxed">
                     <div className="whitespace-pre-wrap relative min-h-[1em]">
                         {simState.body}
                         <span className="inline-block w-[3px] h-6 bg-[#2980b9] ml-1 align-middle caret-blink"></span>
                     </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-6 rounded-b-2xl">
                <button className="text-gray-400 font-bold hover:text-gray-600 transition-colors">ביטול</button>
                <button ref={btnSubmitRef} className="bg-[#27ae60] text-white px-12 py-3 rounded-xl font-black text-lg shadow-xl shadow-green-200 hover:bg-[#219150] transition-all active:scale-95">
                    {mode === 'create' ? 'פרסום נושא' : 'שלח תגובה'}
                </button>
            </div>
        </div>

        {/* Simulator Cursor */}
        <Cursor position={simState.cursorPos} isClicking={simState.isClicking} />

      </div>
    </div>
  );
};

export default ForumSimulator;