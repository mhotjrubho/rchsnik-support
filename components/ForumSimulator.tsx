import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Coordinate } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

// Extremely slow and clear animations
const WAIT_TIME_KEYSTROKE = 110; 
const WAIT_TIME_MOVE = 1600;
const WAIT_TIME_READ = 3500;

interface ForumSimulatorProps {
    mode: 'create' | 'reply' | 'follow';
}

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Topic Create Refs
  const btnNewTopicRef = useRef<HTMLButtonElement>(null);
  
  // Topic Reply Refs
  const btnReplyMainRef = useRef<HTMLButtonElement>(null);
  const btnImageRef = useRef<HTMLDivElement>(null);

  // Topic Follow Refs
  const btnFollowBellRef = useRef<HTMLButtonElement>(null);
  const btnWatchingOptionRef = useRef<HTMLDivElement>(null);

  // Common Composer Refs
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const btnBoldRef = useRef<HTMLDivElement>(null);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: "מתחילים...",
    isComposerOpen: false,
    title: "",
    body: "",
    isSubmitted: false,
    cursorPos: { x: 100, y: 100 },
    isClicking: false,
    activeTool: null,
    selectionRange: null,
  });

  const [followStatus, setFollowStatus] = useState<'not-watching' | 'watching'>('not-watching');
  const [isFollowMenuOpen, setIsFollowMenuOpen] = useState(false);

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
        await wait(WAIT_TIME_KEYSTROKE);
    }
    return currentText;
  };

  const runScenario = useCallback(async () => {
    while (true) {
        // --- CREATE TOPIC SCENARIO ---
        if (mode === 'create') {
            safeSetState({ step: 1, instruction: "שלב 1: פתיחת נושא חדש. לחצו על הכפתור הירוק.", isComposerOpen: false, isSubmitted: false, body: "", title: "" });
            await wait(1500);

            if (btnNewTopicRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnNewTopicRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(250);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1000);
            }

            safeSetState({ step: 2, instruction: "שלב 2: כתיבת כותרת ברורה. הכותרת עוזרת לאנשים למצוא את הנושא." });
            if (inputTitleRef.current) {
                safeSetState({ cursorPos: getElementCenter(inputTitleRef.current) });
                await wait(WAIT_TIME_MOVE);
                const titleText = "המלצה על ספר קודש חדש: 'נפש החיים'";
                let t = "";
                for (const char of titleText) { t += char; safeSetState({ title: t }); await wait(WAIT_TIME_KEYSTROKE); }
                await wait(WAIT_TIME_READ);
            }

            safeSetState({ step: 3, instruction: "שלב 3: כתיבת התוכן. נשתמש ב'הדגשה' כדי להבליט חלקים." });
            if (editorRef.current && btnBoldRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(WAIT_TIME_MOVE);
                let b = await typeText("שלום לכולם, רציתי להמליץ על ספר נפלא. ");
                
                safeSetState({ instruction: "נלחץ על כפתור ה-B כדי להדגיש את המילים הבאות." });
                safeSetState({ cursorPos: getElementCenter(btnBoldRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true, activeTool: 'bold' });
                await wait(200);
                safeSetState({ isClicking: false });

                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(WAIT_TIME_MOVE);
                b = await typeText("**ספר חובה לכל יהודי!**", b);
                
                safeSetState({ activeTool: null });
                await wait(WAIT_TIME_READ);
            }

            safeSetState({ step: 4, instruction: "שלב אחרון: פרסום הנושא לפורום." });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(5000);
            }
        }

        // --- REPLY SCENARIO ---
        else if (mode === 'reply') {
            safeSetState({ step: 1, instruction: "כדי להגיב לנושא קיים, נלחץ על כפתור 'הגב'.", isComposerOpen: false, isSubmitted: false, body: "" });
            await wait(1500);

            if (btnReplyMainRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnReplyMainRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(250);
                safeSetState({ isClicking: false, isComposerOpen: true });
                await wait(1000);
            }

            safeSetState({ step: 2, instruction: "נכתוב תגובה קצרה ועניינית." });
            if (editorRef.current) {
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(WAIT_TIME_MOVE);
                let b = await typeText("יישר כוח על ההמלצה! קניתי את הספר בזכותכם.\n");
                
                safeSetState({ step: 3, instruction: "אפשר להוסיף תמונה ע''י לחיצה על האייקון." });
                if (btnImageRef.current) {
                    safeSetState({ cursorPos: getElementCenter(btnImageRef.current) });
                    await wait(WAIT_TIME_MOVE);
                    safeSetState({ isClicking: true });
                    await wait(250);
                    safeSetState({ isClicking: false });
                    b += "![תמונה](https://picsum.photos/300/150)";
                    safeSetState({ body: b });
                    await wait(WAIT_TIME_READ);
                }
            }

            safeSetState({ step: 4, instruction: "שלחו את התגובה כדי שהיא תופיע בשרשור." });
            if (btnSubmitRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(300);
                safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
                await wait(5000);
            }
        }

        // --- FOLLOW SCENARIO ---
        else if (mode === 'follow') {
            setFollowStatus('not-watching');
            setIsFollowMenuOpen(false);
            safeSetState({ step: 1, instruction: "רוצים לדעת מתי יש תגובה חדשה? חפשו את כפתור הפעמון.", isComposerOpen: false, isSubmitted: false });
            await wait(2000);

            if (btnFollowBellRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnFollowBellRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(250);
                safeSetState({ isClicking: false });
                setIsFollowMenuOpen(true);
                await wait(1000);

                safeSetState({ step: 2, instruction: "כעת בחרו באפשרות 'עוקב' כדי לקבל התראות." });
                if (btnWatchingOptionRef.current) {
                    safeSetState({ cursorPos: getElementCenter(btnWatchingOptionRef.current) });
                    await wait(WAIT_TIME_MOVE);
                    safeSetState({ isClicking: true });
                    await wait(250);
                    safeSetState({ isClicking: false });
                    setFollowStatus('watching');
                    setIsFollowMenuOpen(false);
                    await wait(1500);
                    safeSetState({ instruction: "מעולה! כעת תקבלו התראה על כל תגובה חדשה בנושא זה." });
                    await wait(6000);
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
        className="relative w-full mx-auto bg-white border border-[#e0e0e0] rounded-lg shadow-sm overflow-hidden font-sans select-none"
        style={{ height: '620px' }}
    >
      {/* --- Floating Instruction --- */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-[90%] max-w-lg">
         <div className="bg-[#4a3728] text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-5 border border-white/20 backdrop-blur-md">
            <div className="bg-[#f39c12] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 text-xl border-2 border-white/10">
                {simState.step}
            </div>
            <div className="text-base font-semibold leading-relaxed">
                {simState.instruction}
            </div>
         </div>
      </div>

      {/* --- Forum Screen --- */}
      <div className="relative bg-[#f4f7f6] h-full overflow-hidden flex flex-col">
        
        {/* Top Navbar */}
        <div className="bg-white h-16 border-b border-[#eee] flex items-center px-6 justify-between shrink-0">
            <div className="flex gap-6 items-center">
                <div className="text-[#333] font-black text-xl tracking-tighter">רכוסניק</div>
                <div className="hidden md:flex gap-6 text-sm text-gray-500 font-bold uppercase tracking-wide">
                    <span>נושאים</span>
                    <span>קטגוריות</span>
                    <span>חיפוש</span>
                </div>
            </div>
            <div className="w-9 h-9 bg-[#d4a373] rounded-full ring-2 ring-white shadow-sm"></div>
        </div>

        {/* Content Area */}
        <div className={`p-4 md:p-10 flex-1 overflow-y-auto transition-all duration-700 ${simState.isComposerOpen ? 'opacity-30 blur-[2px]' : 'opacity-100'}`}>
            
            {/* Create Mode: Topic List */}
            {mode === 'create' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
                        <h2 className="text-3xl font-extrabold text-[#333]">דיבורים וקהילה</h2>
                        <button ref={btnNewTopicRef} className="bg-[#27ae60] text-white px-5 py-2.5 rounded font-bold shadow-sm hover:bg-[#219150]">נושא חדש +</button>
                    </div>

                    <div className="space-y-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0"></div>
                                <div className="flex-1">
                                    <div className="font-bold text-[#444] text-lg">איך להשיג היתר בניה בבני ברק?</div>
                                    <div className="text-sm text-gray-400">לפני 2 דקות • מדריך שימושי</div>
                                </div>
                            </div>
                        ))}
                        <div className={`bg-white p-5 rounded-lg border-2 border-[#27ae60] shadow-md flex gap-4 items-center transition-all duration-1000 transform ${simState.isSubmitted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="w-12 h-12 rounded-full bg-[#d4a373] flex items-center justify-center text-white font-bold">אני</div>
                            <div className="flex-1">
                                <div className="font-bold text-[#333] text-lg">{simState.title}</div>
                                <div className="text-sm text-[#27ae60] font-bold">נוצר זה עתה</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reply / Follow Mode: Thread View */}
            {(mode === 'reply' || mode === 'follow') && (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-[#333] mb-8 leading-tight">משטרה בלב אליהו - מה קורה שם?</h2>
                    
                    {/* Original Post */}
                    <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">אכ</div>
                                <span className="text-sm font-bold text-[#333]">אבי_כהן</span>
                            </div>
                            <span className="text-xs text-gray-400 italic">אתמול בצהריים</span>
                        </div>
                        <div className="p-6 text-gray-700 text-base leading-relaxed">
                            ראיתי עכשיו כמה ניידות בלב אליהו. מישהו יודע אם זה אימון או משהו רציני?
                            <br/><br/>אשמח לעדכונים.
                        </div>
                        <div className="p-4 bg-gray-50/30 border-t border-gray-100 flex justify-end gap-3">
                             {mode === 'follow' && (
                                <div className="relative">
                                    <button 
                                        ref={btnFollowBellRef} 
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${followStatus === 'watching' ? 'bg-[#f39c12] text-white border-[#e67e22]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
                                        {followStatus === 'watching' ? 'עוקב' : 'מעקב'}
                                    </button>

                                    {/* Follow Dropdown Menu Simulation */}
                                    {isFollowMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                            <div className="p-2 border-b border-gray-100 bg-gray-50 text-[10px] uppercase font-bold text-gray-400">סטטוס מעקב</div>
                                            <div ref={btnWatchingOptionRef} className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group">
                                                <div className="text-sm font-bold text-gray-700">עוקב</div>
                                                <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-blue-400"></div>
                                            </div>
                                            <div className="p-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-500">לא עוקב</div>
                                            <div className="p-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-500">התעלם</div>
                                        </div>
                                    )}
                                </div>
                             )}
                             <button ref={btnReplyMainRef} className="flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-bold bg-[#2980b9] text-white shadow-sm">הגב ↩</button>
                        </div>
                    </div>

                    {/* New Reply Result */}
                    <div className={`bg-white rounded-xl shadow-md border-2 border-[#2980b9] overflow-hidden transition-all duration-1000 transform ${simState.isSubmitted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
                        <div className="bg-[#f0f9ff] p-4 border-b border-[#e1f0fa] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#d4a373] text-white flex items-center justify-center font-bold rounded-full">אני</div>
                                <span className="text-sm font-bold text-[#333]">משתמש_חדש</span>
                            </div>
                            <span className="text-xs text-blue-500 font-bold">זה עתה</span>
                        </div>
                        <div className="p-6 text-gray-700 text-base leading-relaxed">
                             <MarkdownRenderer text={simState.body} />
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- NodeBB Style Composer --- */}
        <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[95%] max-w-4xl bg-white rounded-t-2xl shadow-[0_-10px_50px_rgba(0,0,0,0.15)] border-t border-x border-gray-300 flex flex-col transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) z-40`}
            style={{ height: '420px', transform: simState.isComposerOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)' }}
        >
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
                <div className="font-bold text-[#444]">{mode === 'create' ? 'פתיחת נושא חדש' : 'הוספת תגובה'}</div>
                <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-gray-200"></div><div className="w-3 h-3 rounded-full bg-gray-200"></div></div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-100">
                     <div ref={btnBoldRef} className={`w-9 h-9 flex items-center justify-center rounded border transition-colors ${simState.activeTool === 'bold' ? 'bg-[#d4a373] text-white border-[#bf8f60]' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>B</div>
                     <div className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 text-gray-500 border border-gray-200 italic font-serif">I</div>
                     <div className="w-px h-6 bg-gray-200 mx-2"></div>
                     <div ref={btnImageRef} className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 text-gray-500 border border-gray-200">🖼️</div>
                     <div className="w-9 h-9 flex items-center justify-center rounded bg-gray-50 text-gray-500 border border-gray-200">🔗</div>
                </div>

                {mode === 'create' && (
                     <input ref={inputTitleRef} type="text" className="w-full p-4 bg-white border-b border-gray-100 text-lg font-bold text-[#333] focus:outline-none placeholder-gray-300" placeholder="הכנס כותרת..." value={simState.title} readOnly />
                )}
               
                <div ref={editorRef} className="flex-1 p-6 font-sans text-base text-[#333] bg-white overflow-y-auto leading-relaxed">
                     <div className="whitespace-pre-wrap relative">
                         {simState.body}
                         <span className="inline-block w-0.5 h-5 bg-blue-500 ml-1 align-middle caret-blink"></span>
                     </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-2xl">
                <button className="px-6 py-2 text-gray-500 font-semibold hover:text-gray-700 transition-colors">ביטול</button>
                <button ref={btnSubmitRef} className="bg-[#2980b9] text-white px-10 py-2.5 rounded-lg font-bold shadow-md hover:bg-[#20638f] transition-all active:scale-95">
                    {mode === 'create' ? 'פרסם נושא' : 'שלח תגובה'}
                </button>
            </div>
        </div>

        {/* --- Cursor --- */}
        <Cursor position={simState.cursorPos} isClicking={simState.isClicking} />

      </div>
    </div>
  );
};

export default ForumSimulator;