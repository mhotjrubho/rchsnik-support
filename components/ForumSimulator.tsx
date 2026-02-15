import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SimulationState, Coordinate } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

// Slower animations for better readability
const WAIT_TIME_KEYSTROKE = 70; 
const WAIT_TIME_MOVE = 900;
const WAIT_TIME_READ = 2000;

interface ForumSimulatorProps {
    mode: 'create' | 'reply';
}

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  // --- Refs ---
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create Mode Refs
  const btnNewTopicRef = useRef<HTMLButtonElement>(null);
  
  // Reply Mode Refs
  const btnReplyMainRef = useRef<HTMLButtonElement>(null);
  const btnQuoteRef = useRef<HTMLButtonElement>(null);

  // Common Refs
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const btnBoldRef = useRef<HTMLDivElement>(null);
  const btnImageRef = useRef<HTMLDivElement>(null);
  const btnSubmitRef = useRef<HTMLButtonElement>(null);

  // --- State ---
  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: "ברוכים הבאים...",
    isComposerOpen: false,
    title: "",
    body: "",
    isSubmitted: false,
    cursorPos: { x: 50, y: 50 },
    isClicking: false,
    activeTool: null,
    selectionRange: null,
  });

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

  // --- Helper to type text ---
  const typeText = async (text: string, safeSetState: any, startBody: string = "") => {
    let currentText = startBody;
    for (const char of text) {
        currentText += char;
        safeSetState({ body: currentText });
        await wait(WAIT_TIME_KEYSTROKE);
    }
    return currentText;
  };

  // --- Scenario 1: Create New Topic ---
  const runCreateScenario = useCallback(async (safeSetState: any) => {
    while (true) {
        // Reset
        safeSetState({ 
            step: 1, 
            instruction: "כדי לפתוח דיון חדש, לחצו על הכפתור 'נושא חדש'",
            title: "", body: "", isComposerOpen: false, isSubmitted: false, activeTool: null 
        });
        await wait(1500);

        // Step 1: Click New Topic
        if (btnNewTopicRef.current) {
            safeSetState({ cursorPos: getElementCenter(btnNewTopicRef.current) });
            await wait(WAIT_TIME_MOVE);
            safeSetState({ isClicking: true });
            await wait(200);
            safeSetState({ isClicking: false, isComposerOpen: true });
            await wait(1000);
        }

        // Step 2: Title
        safeSetState({ step: 2, instruction: "בוחרים כותרת שתתאר היטב את הנושא" });
        if (inputTitleRef.current) {
            safeSetState({ cursorPos: getElementCenter(inputTitleRef.current) });
            await wait(WAIT_TIME_MOVE);
            const title = "המלצה: חנות ספרים חדשה שגיליתי";
            let currentTitle = "";
            for (const char of title) {
                currentTitle += char;
                safeSetState({ title: currentTitle });
                await wait(WAIT_TIME_KEYSTROKE);
            }
            await wait(WAIT_TIME_READ);
        }

        // Step 3: Body & Formatting
        safeSetState({ step: 3, instruction: "כותבים את התוכן. אפשר להדגיש מילים חשובות." });
        if (editorRef.current) {
            safeSetState({ cursorPos: getElementCenter(editorRef.current) });
            await wait(WAIT_TIME_MOVE);
            let body = await typeText("חברים יקרים,\nהייתי אתמול בבני ברק ומצאתי חנות ספרים עם ", safeSetState);
            
            // Bold interaction
            if (btnBoldRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnBoldRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true, activeTool: 'bold' });
                await wait(200);
                safeSetState({ isClicking: false });
                
                safeSetState({ cursorPos: getElementCenter(editorRef.current) });
                await wait(WAIT_TIME_MOVE);
                
                body = await typeText("**מחירים מצוינים**", safeSetState, body);
                
                safeSetState({ activeTool: null }); // Stop bold visualization
                body = await typeText(" ומבחר ענק!\nמומלץ בחום.", safeSetState, body);
            }
        }

        // Step 4: Submit
        safeSetState({ step: 4, instruction: "לסיום, לוחצים על 'שלח' וזהו!" });
        await wait(1000);
        if (btnSubmitRef.current) {
            safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
            await wait(WAIT_TIME_MOVE);
            safeSetState({ isClicking: true });
            await wait(200);
            safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
        }
        
        safeSetState({ instruction: "הנושא פורסם בהצלחה!" });
        await wait(5000);
    }
  }, []);

  // --- Scenario 2: Reply to Post ---
  const runReplyScenario = useCallback(async (safeSetState: any) => {
    while (true) {
         // Reset
         safeSetState({ 
            step: 1, 
            instruction: "כדי להגיב, נגלול לתחתית השרשור או נצטט.",
            title: "תגובה ל: מחפש המלצה לנופש", // Auto filled in reply mode usually
            body: "", isComposerOpen: false, isSubmitted: false, activeTool: null 
        });
        await wait(1500);

        // Step 1: Click Reply
        if (btnReplyMainRef.current) {
            safeSetState({ cursorPos: getElementCenter(btnReplyMainRef.current) });
            await wait(WAIT_TIME_MOVE);
            safeSetState({ isClicking: true });
            await wait(200);
            safeSetState({ isClicking: false, isComposerOpen: true });
            await wait(1000);
        }

        // Step 2: Typing Reply
        safeSetState({ step: 2, instruction: "חלון העריכה נפתח. נכתוב את התגובה שלנו." });
        if (editorRef.current) {
            safeSetState({ cursorPos: getElementCenter(editorRef.current) });
            await wait(WAIT_TIME_MOVE);
            
            let body = await typeText("אני הייתי במלון ציפורי בכינרת וממש נהניתי.\n", safeSetState);
            
            // Add Image demo
            safeSetState({ step: 3, instruction: "אפשר להוסיף תמונה כדי להמחיש" });
            if (btnImageRef.current) {
                safeSetState({ cursorPos: getElementCenter(btnImageRef.current) });
                await wait(WAIT_TIME_MOVE);
                safeSetState({ isClicking: true });
                await wait(200);
                safeSetState({ isClicking: false });
                
                body += "![נוף](https://picsum.photos/200/100)";
                safeSetState({ body });
                await wait(1000);
            }
        }

        // Step 3: Submit
        safeSetState({ step: 4, instruction: "שולחים את התגובה." });
        if (btnSubmitRef.current) {
            safeSetState({ cursorPos: getElementCenter(btnSubmitRef.current) });
            await wait(WAIT_TIME_MOVE);
            safeSetState({ isClicking: true });
            await wait(200);
            safeSetState({ isClicking: false, isSubmitted: true, isComposerOpen: false });
        }

        safeSetState({ instruction: "התגובה נוספה לשרשור!" });
        await wait(5000);
    }
  }, []);

  useEffect(() => {
    const safeSetState = (updates: Partial<SimulationState>) => {
        setSimState(prev => ({ ...prev, ...updates }));
    };

    if (mode === 'create') {
        runCreateScenario(safeSetState);
    } else {
        runReplyScenario(safeSetState);
    }
  }, [mode, runCreateScenario, runReplyScenario]);


  return (
    <div 
        ref={containerRef}
        className="relative w-full mx-auto bg-[#f0f2f5] border-2 border-[#d4a373] rounded-xl shadow-lg overflow-hidden font-sans select-none"
        style={{ height: '600px' }}
    >
      {/* --- Floating Instruction Bubble --- */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-slight pointer-events-none w-[90%] max-w-lg">
         <div className="bg-[#5c4033] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-4 border border-[#d4a373]">
            <div className="bg-[#d4a373] text-[#3e2f1c] w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
                {simState.step}
            </div>
            <div className="text-sm font-medium leading-snug">
                {simState.instruction}
            </div>
         </div>
      </div>

      {/* --- Screen Content --- */}
      <div className="relative bg-[#ece9e6] h-full overflow-hidden flex flex-col">
        
        {/* NodeBB Header Simulation */}
        <div className="bg-white h-14 border-b border-[#e0e0e0] flex items-center px-4 justify-between shrink-0">
            <div className="flex gap-4 items-center">
                <div className="w-6 h-6 bg-[#333] rounded"></div> {/* Logo */}
                <div className="hidden md:flex gap-4 text-xs text-gray-500 font-bold">
                    <span>נושאים אחרונים</span>
                    <span>קטגוריות</span>
                    <span>לא נקראו</span>
                </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div> {/* Avatar */}
        </div>

        {/* Content Area */}
        <div className={`p-4 md:p-8 flex-1 overflow-y-auto transition-all duration-500 ${simState.isComposerOpen ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
            
            {/* VIEW MODE: TOPIC LIST (For Create Scenario) */}
            {mode === 'create' && (
                <>
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-[#333]">קטגוריה: דיבורים</h2>
                        <button 
                            ref={btnNewTopicRef}
                            className={`bg-[#27ae60] text-white px-4 py-2 rounded shadow-sm font-bold text-sm hover:bg-[#219150] transition-colors ${simState.isComposerOpen ? 'opacity-0' : ''}`}
                        >
                        נושא חדש +
                        </button>
                    </div>

                    {/* Topic List Items */}
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-4 rounded border-l-4 border-l-transparent hover:border-l-[#d4a373] shadow-sm flex gap-3 items-center">
                                <div className={`w-10 h-10 rounded-full bg-gray-200 shrink-0`}></div>
                                <div className="flex-1">
                                    <div className="font-bold text-[#333] text-sm">דיון חשוב בנושא הקהילה</div>
                                    <div className="text-xs text-gray-400">נכתב ע"י פלוני • לפני 3 שעות</div>
                                </div>
                                <div className="text-xs text-gray-400 font-mono">14 תגובות</div>
                            </div>
                        ))}
                         {/* The New Post (Result) */}
                        <div 
                        className={`bg-white p-4 rounded border-l-4 border-l-[#27ae60] shadow-md flex gap-3 items-center transition-all duration-700 transform ${simState.isSubmitted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-[#d4a373] text-white flex items-center justify-center font-bold">אני</div>
                            <div className="flex-1">
                                <div className="font-bold text-[#333] text-sm">{simState.title}</div>
                                <div className="text-xs text-gray-400">זה עתה • <span className="text-[#27ae60]">נושא חדש</span></div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* VIEW MODE: THREAD VIEW (For Reply Scenario) */}
            {mode === 'reply' && (
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[#333] mb-6">מחפש המלצה לנופש משפחתי בצפון</h2>
                    
                    {/* Original Post */}
                    <div className="bg-white rounded shadow-sm mb-4 overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-200 rounded-full"></div>
                                <span className="text-sm font-bold text-[#333]">אברהם_כהן</span>
                            </div>
                            <span className="text-xs text-gray-400">אתמול, 14:00</span>
                        </div>
                        <div className="p-4 text-[#333] text-sm leading-relaxed">
                            שלום לכולם, אני מחפש מקום שקט ונחמד למשפחה עם ילדים.
                            <br/>חשוב שיהיה קרוב לבית כנסת. תודה!
                        </div>
                        <div className="p-2 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                             <button ref={btnQuoteRef} className="text-xs text-gray-500 hover:bg-gray-200 px-2 py-1 rounded">צטט</button>
                             <button className="text-xs text-gray-500 hover:bg-gray-200 px-2 py-1 rounded">אהבתי</button>
                        </div>
                    </div>

                    {/* Button Reply Main */}
                    <div className="flex justify-end mb-8">
                         <button 
                            ref={btnReplyMainRef}
                            className={`bg-[#2980b9] text-white px-6 py-2 rounded-full shadow-sm font-bold text-sm hover:bg-[#2573a7] transition-colors ${simState.isComposerOpen ? 'opacity-0' : ''}`}
                        >
                        הגב להודעה ↩
                        </button>
                    </div>

                     {/* The New Reply (Result) */}
                     <div 
                        className={`bg-white rounded shadow-sm mb-4 overflow-hidden border border-[#2980b9] transition-all duration-700 transform ${simState.isSubmitted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                    >
                        <div className="bg-[#f0f8ff] p-3 border-b border-[#e1e8ed] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#d4a373] text-white flex items-center justify-center font-bold rounded-full text-xs">אני</div>
                                <span className="text-sm font-bold text-[#333]">משתמש_חדש</span>
                            </div>
                            <span className="text-xs text-gray-400">עכשיו</span>
                        </div>
                        <div className="p-4 text-[#333] text-sm leading-relaxed">
                             <MarkdownRenderer text={simState.body} />
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* --- Composer Window (NodeBB Style) --- */}
        <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[90%] max-w-3xl bg-white rounded-t-lg shadow-[0_-5px_30px_rgba(0,0,0,0.15)] border border-gray-300 flex flex-col transition-all duration-700 ease-in-out z-30`}
            style={{ 
                height: '400px',
                transform: simState.isComposerOpen ? 'translate(-50%, 0)' : 'translate(-50%, 120%)'
            }}
        >
             {/* Handle bar (Mobile style) */}
             <div className="w-full h-2 bg-gray-100 cursor-row-resize flex justify-center items-center border-b border-gray-200">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
             </div>

            <div className="flex-1 p-0 flex flex-col">
                {/* Composer Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
                     <ToolbarBtn ref={btnBoldRef} label="B" active={simState.activeTool === 'bold'} bold />
                     <ToolbarBtn label="I" italic />
                     <div className="w-px h-5 bg-gray-300 mx-1"></div>
                     <ToolbarBtn label="🔗" />
                     <ToolbarBtn ref={btnImageRef} label="🖼️" />
                     <ToolbarBtn label="❝" />
                </div>

                {/* Title Input (Only for New Topic) */}
                {mode === 'create' && (
                     <input 
                     ref={inputTitleRef}
                     type="text" 
                     className="w-full p-3 bg-white border-b border-gray-100 text-base font-bold text-[#333] focus:outline-none placeholder-gray-400"
                     placeholder="הכנס כותרת לנושא כאן..."
                     value={simState.title}
                     readOnly
                 />
                )}
               
                {/* Editor Area */}
                <div className="flex-1 flex min-h-0">
                    <div 
                        ref={editorRef}
                        className="flex-1 p-4 font-sans text-sm text-[#333] bg-white resize-none focus:outline-none overflow-y-auto"
                    >
                         <div className="whitespace-pre-wrap relative">
                             {simState.body}
                             <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 align-middle caret-blink"></span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button className="text-xs text-gray-500 hover:underline">העלה קבצים</button>
                <div className="flex gap-3">
                     <button className="text-gray-500 text-sm hover:text-gray-700">ביטול</button>
                     <button 
                        ref={btnSubmitRef}
                        className="bg-[#2980b9] text-white px-6 py-2 rounded text-sm font-bold hover:bg-[#20638f] transition-colors"
                    >
                        {mode === 'create' ? 'שלח' : 'הגב'}
                    </button>
                </div>
            </div>
        </div>

        {/* --- Cursor --- */}
        <Cursor position={simState.cursorPos} isClicking={simState.isClicking} />

      </div>
    </div>
  );
};

// Sub-component for buttons
const ToolbarBtn = React.forwardRef<HTMLDivElement, { label: string, active?: boolean, bold?: boolean, italic?: boolean }>(
    ({ label, active, bold, italic }, ref) => (
    <div 
        ref={ref}
        className={`w-8 h-8 flex items-center justify-center rounded cursor-pointer transition-all duration-200 text-sm
        ${active ? 'bg-[#d4a373] text-white' : 'text-gray-600 hover:bg-gray-200'}
        ${bold ? 'font-bold' : ''} ${italic ? 'italic font-serif' : ''}
        `}
    >
        {label}
    </div>
));

export default ForumSimulator;