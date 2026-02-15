import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Coordinate } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

// Pacing constants - very slow and professional
const TYPING_SPEED = 120; 
const MOUSE_SPEED = 2800; // Increased for maximum clarity
const READING_PAUSE = 4500;

interface ForumSimulatorProps {
    mode: 'create' | 'reply' | 'follow';
}

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Rchsnik Specific UI Refs
  const btnNewTopicRef = useRef<HTMLButtonElement>(null);
  const btnWatchRef = useRef<HTMLButtonElement>(null);
  const watchMenuOptionWatchingRef = useRef<HTMLDivElement>(null);
  const lastPostTeaserRef = useRef<HTMLDivElement>(null);

  // Composer Refs
  const btnReplyRef = useRef<HTMLButtonElement>(null);
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const btnBoldRef = useRef<HTMLDivElement>(null);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: "ההדרכה תחל בעוד רגע...",
    isComposerOpen: false,
    title: "",
    body: "",
    isSubmitted: false,
    cursorPos: { x: 50, y: 50 },
    isClicking: false,
    activeTool: null,
    selectionRange: null,
  });

  const [watchStatus, setWatchStatus] = useState<'not-watching' | 'watching' | 'ignoring'>('not-watching');
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

  const typeText = async (text: string, startBody: string = "") => {
    let currentText = startBody;
    for (const char of text) {
        currentText += char;
        safeSetState({ body: currentText });
        await wait(TYPING_SPEED);
    }
    return currentText;
  };

  const runScenario = useCallback(async () => {
    while (true) {
        // --- Scenario 1: CREATE TOPIC ---
        if (mode === 'create') {
            safeSetState({ step: 1, instruction: "כדי לפתוח דיון חדש בפורום, לחצו על כפתור 'נושא חדש' הירוק", isComposerOpen: false, isSubmitted: false, title: "", body: "" });
            await wait(1500);

            if (btnNewTopicRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnNewTopicRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(400);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1500);
            }

            safeSetState({ step: 2, instruction: "כעת הזינו כותרת שמתארת את תוכן הנושא. כותרת טובה מושכת קוראים." });
            if (inputTitleRef.current) {
                safeSetState({ cursorPos: getElementCenter(inputTitleRef.current) });
                await wait(MOUSE_SPEED);
                const text = "המלצה על קבלן שיפוצים מצוין ברכסים";
                let t = "";
                for (const char of text) { t += char; safeSetState({ title: t }); await wait(TYPING_SPEED); }
                await wait(1800);
            }

            safeSetState({ step: 3, instruction: "בגוף ההודעה נכתוב את הפרטים. אפשר להשתמש בכלי העיצוב להדגשה." });
            if (editorRef.current && btnBoldRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                let b = await typeText("שלום, רציתי להמליץ על קבלן שעבד אצלי. ");
                
                safeSetState({ instruction: "נלחץ על כפתור ה-B כדי להדגיש את הטקסט הבא." });
                safeSetState({ cursorPos: getElementCenter(btnBoldRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true, activeTool: 'bold' });
                await wait(250);
                safeSetState({ isClicking: false });

                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                b = await typeText("**הוא אמין, זריז וזול!**", b);
                
                safeSetState({ activeTool: null });
                b = await typeText(" למי שצריך פרטים נוספים אשמח לעזור בפרטי.", b);
                await wait(READING_PAUSE);
            }

            safeSetState({ step: 4, instruction: "נראה מעולה. לסיום נלחץ על כפתור 'פרסום נושא'." });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(400);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(READING_PAUSE);
            }
        }

        // --- Scenario 2: REPLY ---
        else if (mode === 'reply') {
            safeSetState({ step: 1, instruction: "כדי להגיב לנושא קיים, לחצו על כפתור 'הגב' הכחול בפינה.", isComposerOpen: false, isSubmitted: false, body: "" });
            await wait(2000);

            if (btnReplyRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnReplyRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(400);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1500);
            }

            safeSetState({ step: 2, instruction: "כתבו את התגובה שלכם. אפשר להוסיף תמונות בקלות." });
            if (editorRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(MOUSE_SPEED);
                let b = await typeText("מצטרף להמלצה! עבד גם אצל השכנים שלי.\nהנה תמונה מהעבודה אצלי:");
                
                b += "\n\n![שיפוץ](https://picsum.photos/450/250)";
                safeSetState({ body: b });
                await wait(READING_PAUSE);
            }

            safeSetState({ step: 3, instruction: "לסיום שלחו את התגובה לפורום." });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(400);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(READING_PAUSE);
            }
        }

        // --- Scenario 3: FOLLOW (ACCURATE) ---
        else if (mode === 'follow') {
            setWatchStatus('not-watching');
            setIsWatchMenuVisible(false);
            safeSetState({ step: 1, instruction: "רוצים לקבל התראות על תגובות חדשות? חפשו את כפתור ה'מעקב' עם הפעמון.", isComposerOpen: false, isSubmitted: false });
            await wait(2500);

            if (btnWatchRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnWatchRef.current) });
                await wait(MOUSE_SPEED);
                safeSetState({ isClicking: true });
                await wait(400);
                safeSetState({ isClicking: false });
                setIsWatchMenuVisible(true);
                await wait(1800);

                safeSetState({ step: 2, instruction: "בתפריט שנפתח, בחרו ב-'עוקב'. כך תקבלו התראה על כל תגובה חדשה." });
                if (watchMenuOptionWatchingRef.current) {
                    safeSetState({ cursorPos: getElementCenter(watchMenuOptionWatchingRef.current) });
                    await wait(MOUSE_SPEED);
                    safeSetState({ isClicking: true });
                    await wait(400);
                    safeSetState({ isClicking: false });
                    setWatchStatus('watching');
                    setIsWatchMenuVisible(false);
                    await wait(1500);
                    safeSetState({ instruction: "בוצע! כעת אתם עוקבים אחרי השרשור ותקבלו עליו התראות." });
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
        className="relative w-full mx-auto bg-white border-2 border-[#d4a373] rounded-2xl shadow-xl overflow-hidden select-none"
        style={{ height: '650px' }}
    >
      {/* Floating Instructions Bubble - Styled to match banner */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-lg">
         <div className="bg-[#3e2f1c] text-white p-5 rounded-2xl shadow-2xl flex items-center gap-5 border-2 border-[#d4a373] backdrop-blur-sm opacity-95">
            <div className="bg-[#d4a373] w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl shrink-0 shadow-inner">
                {simState.step}
            </div>
            <div className="text-lg font-extrabold leading-tight tracking-tight">
                {simState.instruction}
            </div>
         </div>
      </div>

      {/* Forum Layout Simulation */}
      <div className="relative bg-[#f8f9fa] h-full flex flex-col overflow-hidden">
        
        {/* Real-style Header Navbar */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-6 justify-between shrink-0 z-10">
            <div className="flex gap-8 items-center">
                <span className="text-[#3e2f1c] font-black text-2xl">רכוסניק</span>
                <div className="hidden md:flex gap-6 text-sm font-bold text-gray-400">
                    <span className="border-b-2 border-[#d4a373] text-[#3e2f1c] pb-1">נושאים</span>
                    <span>קטגוריות</span>
                    <span>לא נקראו</span>
                </div>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-full border border-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">אני</div>
        </header>

        {/* Content View */}
        <div className={`flex-1 p-4 md:p-10 overflow-y-auto transition-all duration-1000 ${simState.isComposerOpen ? 'opacity-30 blur-[3px]' : 'opacity-100'}`}>
            
            {mode === 'create' ? (
                <div className="max-w-4xl mx-auto">
                    {/* Categories List Item Look */}
                    <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-[#DC9656] rounded-lg flex items-center justify-center text-white"><i className="fa fa-users"></i>💬</span>
                            <h2 className="text-3xl font-black text-[#3e2f1c]">קהילה וחיי היום יום</h2>
                        </div>
                        <button ref={btnNewTopicRef} className="bg-[#27ae60] text-white px-8 py-2.5 rounded-lg font-black text-base shadow-[0_3px_0_#219150] active:translate-y-1 active:shadow-none transition-all">נושא חדש +</button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white p-5 rounded-xl border-b border-gray-200 shadow-sm flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-50 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                        {simState.isSubmitted && (
                             <div className="bg-white p-5 rounded-xl border-r-4 border-r-[#27ae60] shadow-md flex gap-4 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                <div className="w-12 h-12 rounded-full bg-[#d4a373] flex items-center justify-center text-white font-black">ר</div>
                                <div className="flex-1">
                                    <div className="font-extrabold text-xl text-[#3e2f1c]">{simState.title}</div>
                                    <div className="text-xs text-[#27ae60] font-bold">זה עתה • נושא חדש</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-black text-[#3e2f1c] mb-10 leading-tight">משטרה בלב אליהו - בדיקות חגורות</h2>
                    
                    {/* Topic Thread View */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#e91e63] text-white rounded-full flex items-center justify-center font-black">כ</div>
                                <span className="font-extrabold text-[#3e2f1c]">כאן_לעזור</span>
                            </div>
                            <span className="text-xs text-gray-400 font-bold">לפני 26 דקות</span>
                        </div>
                        <div className="p-8 text-xl text-[#3e2f1c] leading-relaxed">
                            בודקים רכב רכב על חגורות בלב אליהו. שימו לב!
                        </div>
                        <div className="p-4 bg-gray-50/20 border-t border-gray-100 flex justify-end gap-3">
                            {mode === 'follow' && (
                                <div className="relative">
                                    <button 
                                        ref={btnWatchRef}
                                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-sm transition-all border ${watchStatus === 'watching' ? 'bg-[#27ae60] text-white border-[#27ae60]' : 'bg-white text-[#5c4b36] border-gray-300 shadow-sm'}`}
                                    >
                                        <span className="text-lg">🔔</span>
                                        {watchStatus === 'watching' ? 'עוקב' : 'מעקב'}
                                    </button>

                                    {isWatchMenuVisible && (
                                        <div className="absolute top-full right-0 mt-3 w-64 bg-white border border-gray-300 rounded-xl shadow-2xl z-50 overflow-hidden ring-8 ring-black/5">
                                            <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs font-black text-gray-400 uppercase tracking-widest">מצב מעקב</div>
                                            <div ref={watchMenuOptionWatchingRef} className="p-5 hover:bg-gray-50 flex items-center gap-4 cursor-pointer">
                                                <div className="w-3 h-3 rounded-full bg-[#27ae60]"></div>
                                                <div className="text-base font-black text-[#3e2f1c]">עוקב</div>
                                            </div>
                                            <div className="p-5 hover:bg-gray-50 flex items-center gap-4 text-base text-gray-400 font-bold">לא עוקב</div>
                                            <div className="p-5 hover:bg-gray-50 flex items-center gap-4 text-base text-gray-400 font-bold">מתעלם</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button ref={btnReplyRef} className="bg-[#2980b9] text-white px-8 py-2 rounded-lg font-black text-sm shadow-[0_3px_0_#20638f] active:translate-y-1 active:shadow-none">הגב ↩</button>
                        </div>
                    </div>

                    {simState.isSubmitted && (
                         <div className="bg-white rounded-2xl shadow-xl border-2 border-[#2980b9] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                             <div className="bg-[#f0f9ff] p-4 border-b border-[#e1f0fa] flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#d4a373] text-white flex items-center justify-center font-black rounded-full shadow-inner">א</div>
                                <span className="font-black text-[#3e2f1c]">אני_המשתמש</span>
                                <span className="text-xs text-blue-500 font-black mr-auto">זה עתה</span>
                             </div>
                             <div className="p-8 text-xl text-[#3e2f1c] leading-relaxed">
                                <MarkdownRenderer text={simState.body} />
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>

        {/* NodeBB-Inspired Composer */}
        <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[96%] max-w-4xl bg-white rounded-t-3xl shadow-[0_-15px_60px_rgba(62,47,28,0.2)] border-t-2 border-x-2 border-[#d4a373] flex flex-col transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) z-40`}
            style={{ height: '460px', transform: simState.isComposerOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)' }}
        >
            <div className="bg-white px-10 py-6 border-b border-gray-100 flex justify-between items-center rounded-t-3xl">
                <div className="font-black text-2xl text-[#3e2f1c]">{mode === 'create' ? 'כתיבת נושא חדש' : 'הוספת תגובה לדיון'}</div>
                <div className="flex gap-3"><div className="w-4 h-4 rounded-full bg-gray-100"></div><div className="w-4 h-4 rounded-full bg-gray-100"></div></div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 border-b border-gray-100">
                     <div ref={btnBoldRef} className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all text-lg font-black ${simState.activeTool === 'bold' ? 'bg-[#d4a373] text-white border-[#d4a373]' : 'bg-white text-gray-400 border-gray-100'}`}>B</div>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-400 border-2 border-gray-100 font-serif italic text-xl">I</div>
                     <div className="w-[3px] h-8 bg-gray-200 mx-3"></div>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-400 border-2 border-gray-100">🖼️</div>
                     <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white text-gray-400 border-2 border-gray-100 text-lg">🔗</div>
                </div>

                {mode === 'create' && (
                     <input ref={inputTitleRef} type="text" className="w-full p-6 bg-white border-b border-gray-50 text-2xl font-black text-[#3e2f1c] focus:outline-none placeholder-gray-200" placeholder="הכותרת שלך כאן..." value={simState.title} readOnly />
                )}
               
                <div ref={editorRef} className="flex-1 p-8 text-xl font-bold text-[#3e2f1c] bg-white overflow-y-auto leading-relaxed">
                     <div className="whitespace-pre-wrap relative min-h-[1em]">
                         {simState.body}
                         <span className="inline-block w-[4px] h-7 bg-[#d4a373] ml-1 align-middle caret-blink"></span>
                     </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-6 rounded-b-2xl">
                <button className="text-gray-400 font-black text-lg">ביטול</button>
                <button ref={btnSubmitRef} className="bg-[#27ae60] text-white px-14 py-3 rounded-2xl font-black text-xl shadow-lg shadow-green-100 active:scale-95 transition-all">
                    {mode === 'create' ? 'פרסם נושא' : 'שלח תגובה'}
                </button>
            </div>
        </div>

        {/* Automated Simulator Cursor */}
        <Cursor position={simState.cursorPos} isClicking={simState.isClicking} />

      </div>
    </div>
  );
};

export default ForumSimulator;