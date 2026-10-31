import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  Bold, 
  Italic, 
  Quote, 
  List, 
  Link2, 
  Send, 
  X, 
  Bell, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Search,
  Home,
  Layers,
  Gavel,
  Flame,
  Clock,
  Code
} from 'lucide-react';
import { SimulationState, Coordinate, SimulatorMode, StepDefinition } from '../types';
import Cursor from './Cursor';
import MarkdownRenderer from './MarkdownRenderer';

interface ForumSimulatorProps {
  mode: SimulatorMode;
  onModeChange?: (mode: SimulatorMode) => void;
}

const STEPS_BY_MODE: Record<SimulatorMode, StepDefinition[]> = {
  create: [
    { 
      id: 1, 
      title: 'כפתור נושא חדש', 
      instruction: 'לפתיחת נושא חדש, לחצו על כפתור "נושא חדש" בראש הקטגוריה', 
      targetKey: 'btnNewTopic', 
      tip: 'ברכוסניק הכפתור זמין בראש כל קטגוריה כשאתם מחוברים' 
    },
    { 
      id: 2, 
      title: 'הזנת כותרת', 
      instruction: 'הזינו כותרת תמציתית וברורה המתארת את השאלה או הצורך שלכם', 
      targetKey: 'inputTitle', 
      tip: 'כותרת ברורה כמו "השאלת מקרן לשבת" תביא מענה מהיר בהרבה' 
    },
    { 
      id: 3, 
      title: 'עורך מפוצל (Split-View)', 
      instruction: 'כתבו את ההודעה בעורך מימין. התצוגה המקדימה משמאל מתעדכנת בזמן אמת!', 
      targetKey: 'editor', 
      tip: 'עורך ה-NodeBB המפוצל מאפשר לראות את העיצוב המדויק לפני הפרסום' 
    },
    { 
      id: 4, 
      title: 'עיצוב בעזרת סרגל הכלים', 
      instruction: 'השתמשו בכפתור ההדגשה (B) או בקיצור Ctrl+B כדי להדגיש מילים חשובות', 
      targetKey: 'btnBold', 
      tip: 'ניתן גם להוסיף ציטוטים, רשימות וקישורים בלחיצה אחת' 
    },
    { 
      id: 5, 
      title: 'שליחה ופרסום הפוסט', 
      instruction: 'סיימתם לערוך? כפתור ה"שליחה" נמצא למעלה בצד שמאל', 
      targetKey: 'btnSubmit', 
      tip: 'הפוסט יתפרסם מיד ויופיע לכל תושבי רכסים בקטגוריה ובפיד הראשי' 
    },
  ],
  reply: [
    { 
      id: 1, 
      title: 'איתור כפתור תגובה', 
      instruction: 'בתחתית הפוסט אליו תרצו להגיב, לחצו על כפתור "תגובה"', 
      targetKey: 'btnReply', 
      tip: 'אפשר להגיב לפוסט ספציפי או לשרשור כולו בתחתית העמוד' 
    },
    { 
      id: 2, 
      title: 'שימוש בציטוט דברי הכותב', 
      instruction: 'לחצו על סמל הציטוט כדי להביא דברים בשם אומרם בצורה מסודרת', 
      targetKey: 'btnQuote', 
      tip: 'ציטוט מסייע למיקוד הדיון במענה לחלק מסוים מההודעה' 
    },
    { 
      id: 3, 
      title: 'כתיבת המענה', 
      instruction: 'הקלידו את התשובה והעזרו בתצוגה המקדימה משמאל', 
      targetKey: 'editor', 
      tip: 'פורום רכוסניק מעודד שיח קהילתי, מכבד ועזרה הדדית' 
    },
    { 
      id: 4, 
      title: 'אישור ושליחה', 
      instruction: 'לחצו על "שליחה" בצד שמאל למעלה לפרסום התגובה בשרשור', 
      targetKey: 'btnSubmit', 
      tip: 'הכותב המקורי יקבל התראה מיידית על התגובה שלכם' 
    },
  ],
  follow: [
    { 
      id: 1, 
      title: 'כפתור מעקב אחר נושא', 
      instruction: 'בראש הנושא לחצו על כפתור המעקב (הפעמון) לפתיחת תפריט ההתראות', 
      targetKey: 'btnWatch', 
      tip: 'הכפתור מופיע ליד כותרת הנושא בכל דפי השרשורים ברכוסניק' 
    },
    { 
      id: 2, 
      title: 'בחירת מצב "עוקב"', 
      instruction: 'בחרו ב-"עוקב" כדי לקבל התראה מיידית על כל תגובה חדשה שתפורסם', 
      targetKey: 'watchOption', 
      tip: 'אם הנושא כבר אינו רלוונטי עבורכם, תוכלו לבחור "התעלם"' 
    },
    { 
      id: 3, 
      title: 'אישור סטטוס המעקב', 
      instruction: 'כעת הנושא מוגדר כ-"עוקב" ותקבלו הודעות בפעמון ההתראות באתר', 
      targetKey: 'watchStatusBadge', 
      tip: 'ההתראות מופיעות בראש האתר ליד תמונת הפרופיל שלכם' 
    },
  ],
  'user-info': [
    { 
      id: 1, 
      title: 'תמונת פרופיל וצבע אישי', 
      instruction: 'בצד ימין של כל הודעה מופיעה תמונת המשתמש עם האות הראשונה של שמו', 
      targetKey: 'userAvatar', 
      tip: 'לחיצה על התמונה פותחת את כרטיס המשתמש המלא שלו ברכוסניק' 
    },
    { 
      id: 2, 
      title: 'שם משתמש מזוהה', 
      instruction: 'שם המשתמש בפורום. משתמשים מזוהים תורמים לאמינות המידע ביישוב', 
      targetKey: 'userName', 
      tip: 'ניתן לתייג משתמש בכל פוסט ע"י הקלדת הסימן @ ושמו' 
    },
    { 
      id: 3, 
      title: 'תגי דרגה ("בעלי עסקים" / "צוות פיקוח")', 
      instruction: 'תוויות מיוחדות מעידות על עסקים מאומתים ברכסים או על חברי צוות הפיקוח', 
      targetKey: 'userBadge', 
      tip: 'חברי צוות הפיקוח מסייעים בשמירה על תקנון הקהילה' 
    },
    { 
      id: 4, 
      title: 'מוניטין ותרומה לקהילה', 
      instruction: 'מונה המוניטין משקף כמה הערכות (לייקים) קיבל המשתמש על סיוע לשכנים', 
      targetKey: 'userRep', 
      tip: 'פרסום תשובות מועילות יעלה את המוניטין שלכם בקרב תושבי רכסים' 
    },
  ],
};

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [watchStatus, setWatchStatus] = useState<string>('מעקב');
  const [isWatchMenuOpen, setIsWatchMenuOpen] = useState<boolean>(false);

  const steps = STEPS_BY_MODE[mode];

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: steps[0].instruction,
    tip: steps[0].tip,
    isComposerOpen: false,
    title: "",
    body: "",
    category: "איש את רעהו יעזורו",
    isSubmitted: false,
    cursorPos: { x: 500, y: 180 },
    isClicking: false,
    activeTool: null,
    targetRect: null,
  });

  // Calculate dynamic element position relative to container
  const getElementPosAndRect = useCallback((key: string): { center: Coordinate; rect: { x: number; y: number; width: number; height: number } } => {
    const el = targetsRef.current[key];
    if (!containerRef.current || !el) {
      return {
        center: { x: 450, y: 220 },
        rect: { x: 400, y: 200, width: 100, height: 40 }
      };
    }
    const containerBounds = containerRef.current.getBoundingClientRect();
    const elBounds = el.getBoundingClientRect();

    const rect = {
      x: elBounds.left - containerBounds.left,
      y: elBounds.top - containerBounds.top,
      width: elBounds.width,
      height: elBounds.height,
    };

    const center = {
      x: rect.x + (rect.width / 2),
      y: rect.y + (rect.height / 2),
    };

    return { center, rect };
  }, []);

  const updateTargetPosition = useCallback((targetKey: string, label: string = '') => {
    const { center, rect } = getElementPosAndRect(targetKey);
    setSimState(prev => ({
      ...prev,
      cursorPos: center,
      targetRect: rect,
    }));
    setCursorLabel(label);
  }, [getElementPosAndRect]);

  const wait = useCallback((ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms / speed));
  }, [speed]);

  // Automated Simulation Loop
  useEffect(() => {
    if (isInteractive) return;

    let isCancelled = false;

    const runLoop = async () => {
      while (!isCancelled && isPlaying) {
        if (mode === 'create') {
          setSimState(prev => ({
            ...prev,
            step: 1,
            instruction: steps[0].instruction,
            tip: steps[0].tip,
            isComposerOpen: false,
            isSubmitted: false,
            title: '',
            body: '',
            activeTool: null,
          }));
          await wait(800);
          if (isCancelled) break;

          // Step 1: Click New Topic
          updateTargetPosition('btnNewTopic', 'לחיצה על נושא חדש');
          await wait(1800);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ ...p, isClicking: false, isComposerOpen: true }));
          await wait(600);
          if (isCancelled) break;

          // Step 2: Enter Title
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('inputTitle', 'הקלדת כותרת הנושא');
          await wait(1500);
          if (isCancelled) break;

          const titleText = "שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה";
          let currentTitle = "";
          for (const char of titleText) {
            if (isCancelled) break;
            currentTitle += char;
            setSimState(p => ({ ...p, title: currentTitle }));
            await wait(45);
          }
          await wait(800);
          if (isCancelled) break;

          // Step 3: Body editor
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('editor', 'כתיבת תוכן ההודעה בעורך');
          await wait(1400);
          if (isCancelled) break;

          const bodyText = "שלום לחברי קהילת רכוסניק! אנו מחפשים להשאיל 30 כסאות מתקפלים ומחמם מים (מיחם) לשמחת שבע ברכות ביישוב. ";
          let currentBody = "";
          for (const char of bodyText) {
            if (isCancelled) break;
            currentBody += char;
            setSimState(p => ({ ...p, body: currentBody }));
            await wait(35);
          }
          await wait(600);
          if (isCancelled) break;

          // Step 4: Formatting Bold
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('btnBold', 'הדגשת טקסט חשוב (B)');
          await wait(1400);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true, activeTool: 'bold' }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false }));

          updateTargetPosition('editor', 'המשך הקלדה');
          await wait(600);

          const boldPart = "**נודה מאוד לכל מי שיכול לסייע!**";
          for (const char of boldPart) {
            if (isCancelled) break;
            currentBody += char;
            setSimState(p => ({ ...p, body: currentBody }));
            await wait(35);
          }
          setSimState(p => ({ ...p, activeTool: null }));
          await wait(1800);
          if (isCancelled) break;

          // Step 5: Submit
          setSimState(p => ({ ...p, step: 5, instruction: steps[4].instruction, tip: steps[4].tip }));
          updateTargetPosition('btnSubmit', 'שליחה ופרסום ברכוסניק');
          await wait(1600);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false }));

          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 }
          });

          await wait(4500);

        } else if (mode === 'reply') {
          setSimState(prev => ({
            ...prev,
            step: 1,
            instruction: steps[0].instruction,
            tip: steps[0].tip,
            isComposerOpen: false,
            isSubmitted: false,
            title: '',
            body: '',
          }));
          await wait(800);
          if (isCancelled) break;

          // Step 1: Click Reply
          updateTargetPosition('btnReply', 'לחיצה על תגובה');
          await wait(1600);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ ...p, isClicking: false, isComposerOpen: true }));
          await wait(600);
          if (isCancelled) break;

          // Step 2: Quote
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('btnQuote', 'ציטוט דברי חבר הקהילה');
          await wait(1400);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ 
            ...p, 
            isClicking: false, 
            body: "> מישהו מכיר גמ\"ח כסאות פעיל ברכסים?\n\n" 
          }));
          await wait(800);
          if (isCancelled) break;

          // Step 3: Type Response
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('editor', 'הקלדת תשובה');
          await wait(1200);
          if (isCancelled) break;

          let rBody = "> מישהו מכיר גמ\"ח כסאות פעיל ברכסים?\n\n";
          const answer = "שלום, אפשר לפנות לגמ\"ח 'חסדי יוסף' ברחוב הרימונים ברכסים, הם זמינים תמיד בשמחה!";
          for (const char of answer) {
            if (isCancelled) break;
            rBody += char;
            setSimState(p => ({ ...p, body: rBody }));
            await wait(40);
          }
          await wait(1400);
          if (isCancelled) break;

          // Step 4: Submit reply
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('btnSubmit', 'פרסום התגובה בשרשור');
          await wait(1500);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false }));
          await wait(4000);

        } else if (mode === 'follow') {
          setIsWatchMenuOpen(false);
          setWatchStatus('מעקב');
          setSimState(p => ({
            ...p,
            step: 1,
            instruction: steps[0].instruction,
            tip: steps[0].tip,
            isComposerOpen: false,
            isSubmitted: false
          }));
          await wait(1200);
          if (isCancelled) break;

          // Step 1: Open watch dropdown
          updateTargetPosition('btnWatch', 'פתיחת אפשרויות מעקב');
          await wait(1600);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ ...p, isClicking: false }));
          setIsWatchMenuOpen(true);
          await wait(900);
          if (isCancelled) break;

          // Step 2: Select 'Watching'
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('watchOption', 'בחירת עוקב (כל התגובות)');
          await wait(1500);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ ...p, isClicking: false }));
          setIsWatchMenuOpen(false);
          setWatchStatus('עוקב');
          await wait(600);
          if (isCancelled) break;

          // Step 3: Highlight confirmed status
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('watchStatusBadge', 'נושא זה כעת במעקב מלא');
          await wait(4500);

        } else if (mode === 'user-info') {
          // Step 1: Avatar
          setSimState(p => ({ ...p, step: 1, instruction: steps[0].instruction, tip: steps[0].tip }));
          updateTargetPosition('userAvatar', 'תמונת פרופיל של חבר הקהילה');
          await wait(2600);
          if (isCancelled) break;

          // Step 2: Name
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('userName', 'שם המשתמש (מידערכסים)');
          await wait(2600);
          if (isCancelled) break;

          // Step 3: Badge
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('userBadge', 'תג דרגה: בעלי עסקים');
          await wait(2600);
          if (isCancelled) break;

          // Step 4: Reputation
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('userRep', 'מוניטין: +644 נקודות הערכה');
          await wait(4000);
        }
      }
    };

    runLoop();

    return () => {
      isCancelled = true;
    };
  }, [mode, isPlaying, isInteractive, speed, steps, updateTargetPosition, wait]);

  const handleJumpToStep = (stepNumber: number) => {
    setIsPlaying(false);
    const targetStep = steps.find(s => s.id === stepNumber) || steps[0];
    setSimState(prev => ({
      ...prev,
      step: targetStep.id,
      instruction: targetStep.instruction,
      tip: targetStep.tip,
      isComposerOpen: targetStep.id >= 2 && (mode === 'create' || mode === 'reply'),
      title: prev.title || "שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה",
      body: prev.body || "שלום לחברי קהילת רכוסניק! אנו מחפשים להשאיל 30 כסאות מתקפלים ומחמם מים לשמחת שבע ברכות. **נודה מאוד לכל המסייעים!**",
    }));

    setTimeout(() => {
      updateTargetPosition(targetStep.targetKey, targetStep.title);
    }, 150);
  };

  const handleFormat = (type: 'bold' | 'italic' | 'quote' | 'list' | 'code') => {
    if (type === 'bold') {
      setSimState(p => ({ ...p, body: p.body + ' **טקסט מודגש** ' }));
    } else if (type === 'italic') {
      setSimState(p => ({ ...p, body: p.body + ' *טקסט נטוי* ' }));
    } else if (type === 'quote') {
      setSimState(p => ({ ...p, body: p.body + '\n> ציטוט כאן\n' }));
    } else if (type === 'list') {
      setSimState(p => ({ ...p, body: p.body + '\n- פריט ראשון\n- פריט שני\n' }));
    } else if (type === 'code') {
      setSimState(p => ({ ...p, body: p.body + ' `קוד/הדגשה` ' }));
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* Control Panel: Simulator Bar */}
      <div className="bg-white border border-[#dcdcdc] rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Play/Pause & Replay */}
        <div className="flex items-center gap-2">
          {!isInteractive && (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#01263c] text-white font-bold hover:bg-[#caa34b] hover:text-[#01263c] transition shadow-xs cursor-pointer text-xs"
                title={isPlaying ? "השהיית הדמיה" : "הפעלת הדמיה"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? "השהה" : "הפעל"}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(true);
                  handleJumpToStep(1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#dcdcdc] text-gray-700 font-semibold hover:bg-gray-100 transition cursor-pointer text-xs"
                title="הפעלה מחדש"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>התחל מחדש</span>
              </button>

              {/* Speed Toggler */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 text-xs font-bold rounded-md transition ${speed === s ? 'bg-white shadow text-[#01263c]' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Interactive Playground Toggle */}
          <button
            onClick={() => {
              setIsInteractive(!isInteractive);
              if (!isInteractive) {
                setIsPlaying(false);
                setSimState(p => ({
                  ...p,
                  isComposerOpen: true,
                  targetRect: null,
                  instruction: 'מצב התנסות פעיל: הקלידו כותרת ותוכן, בדקו את התצוגה המקדימה ונסו לשלוח!'
                }));
              } else {
                setIsPlaying(true);
                handleJumpToStep(1);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition text-xs cursor-pointer ${
              isInteractive 
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300' 
                : 'bg-amber-50 text-[#8c6b20] border border-[#caa34b]/40 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>{isInteractive ? "מצב התנסות חופשי פעיל (לחצו לסיום)" : "נסו בעצמכם (מצב חופשי)"}</span>
          </button>
        </div>

        {/* Step Navigation Chips */}
        {!isInteractive && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-bold text-gray-400 ml-1">שלבים:</span>
            {steps.map((st) => (
              <button
                key={st.id}
                onClick={() => handleJumpToStep(st.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  simState.step === st.id
                    ? 'bg-[#01263c] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{st.id}.</span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Forum View Container - Exact 1:1 layout to rchsnik.com */}
      <div
        ref={containerRef}
        className="relative w-full bg-white border border-[#dcdcdc] rounded-xl shadow-lg overflow-hidden select-none h-[640px] font-heebo flex flex-col"
      >
        
        {/* Dynamic Instructional Banner */}
        <div className="relative z-30 bg-[#01263c] text-white px-4 py-2.5 shadow-md border-b border-[#caa34b]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#caa34b] text-[#01263c] font-black flex items-center justify-center text-xs shadow ring-1 ring-white/20 shrink-0">
              {simState.step}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white tracking-wide leading-tight">
                {simState.instruction}
              </p>
              {simState.tip && (
                <p className="text-[11px] text-[#caa34b] font-medium flex items-center gap-1 mt-0.5">
                  <HelpCircle className="w-3 h-3 text-[#caa34b] inline shrink-0" />
                  <span>טיפ לרכוסניק: {simState.tip}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#caa34b] animate-ping"></span>
            <span className="text-[#caa34b] text-[11px] font-bold">הדמיית rchsnik.com</span>
          </div>
        </div>

        {/* NodeBB Harmony Top Bar */}
        <header className="bg-white h-13 border-b border-[#dcdcdc] flex items-center px-4 justify-between shrink-0 shadow-xs z-10">
          
          {/* Right side: Real Rchsnik Logo + Search input with placeholder 'הקלידו כדי לחפש' */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <img 
                src="https://rchsnik.com/assets/uploads/system/site-logo.png" 
                alt="רכוסניק" 
                className="h-8 w-auto object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span className="text-lg font-black text-[#01263c] tracking-tight">רכוסניק</span>
            </div>

            {/* Harmony Search Bar matching rchsnik.com */}
            <div className="hidden sm:flex items-center gap-2 bg-[#f8f9fa] border border-[#dcdcdc] rounded-full px-3 py-1 max-w-xs w-full text-xs text-gray-500">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder="הקלידו כדי לחפש..." 
                disabled 
                className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Left side actions: Watch bell, user login indicator */}
          <div className="flex items-center gap-3">
            
            {/* Watch Topic Menu */}
            <div className="relative">
              <button 
                ref={el => { targetsRef.current['btnWatch'] = el; }}
                onClick={() => setIsWatchMenuOpen(!isWatchMenuOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
                  watchStatus === 'עוקב' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white text-gray-700 border-[#dcdcdc] hover:border-[#caa34b]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span ref={el => { targetsRef.current['watchStatusBadge'] = el; }}>{watchStatus}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isWatchMenuOpen && (
                <div className="absolute left-0 mt-1 w-44 bg-white border border-[#dcdcdc] rounded-lg shadow-xl z-50 py-1 text-right">
                  <button
                    ref={el => { targetsRef.current['watchOption'] = el; }}
                    onClick={() => {
                      setWatchStatus('עוקב');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 hover:bg-amber-50 flex items-center justify-between text-right cursor-pointer"
                  >
                    <span>עוקב (כל התגובות)</span>
                    {watchStatus === 'עוקב' && <CheckCircle2 className="w-3.5 h-3.5 text-[#caa34b]" />}
                  </button>
                  <button
                    onClick={() => {
                      setWatchStatus('מעקב');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 text-right cursor-pointer"
                  >
                    מעקב רגיל
                  </button>
                  <button
                    onClick={() => {
                      setWatchStatus('התעלם');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-right cursor-pointer"
                  >
                    התעלם מהנושא
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar with initial */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#01263c] text-[#caa34b] font-black flex items-center justify-center text-xs shadow-xs border border-[#caa34b]/40">
                י
              </div>
            </div>

          </div>
        </header>

        {/* Layout with authentic Harmony Left Sidebar + Main forum stream */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Harmony Sidebar - 100% matched to rchsnik.com nav items */}
          <aside className="hidden lg:flex flex-col w-44 bg-[#f8f9fa] border-l border-[#dcdcdc] p-2 space-y-1 shrink-0 text-xs font-bold text-gray-700">
            <div className="p-2 text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">
              ניווט בפורום
            </div>
            
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white shadow-xs text-[#01263c] border border-[#dcdcdc]">
              <Home className="w-4 h-4 text-[#caa34b]" />
              <span>דף הבית</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition">
              <Layers className="w-4 h-4 text-gray-500" />
              <span>קטגוריות</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>פוסטים אחרונים</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition">
              <Flame className="w-4 h-4 text-gray-500" />
              <span>פופולרי</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition">
              <Gavel className="w-4 h-4 text-gray-500" />
              <span>חוקי הפורום</span>
            </div>

            <div className="pt-3 border-t border-gray-200 mt-2">
              <div className="text-[10px] text-gray-400 p-2">לוחות מודעות</div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition">
                <span>🏠 לוח דירות</span>
              </div>
            </div>
          </aside>

          {/* Main Forum Body Stream */}
          <main className={`flex-1 overflow-y-auto p-4 md:p-6 bg-[#f4f7f9] transition-all duration-500 ${simState.isComposerOpen ? 'opacity-30 blur-[1px]' : 'opacity-100'}`}>
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Breadcrumb matching NodeBB */}
              <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                <span>דף הבית</span>
                <span>/</span>
                <span>קהילה וחיי היום יום</span>
                <span>/</span>
                <span className="font-bold text-[#01263c]">איש את רעהו יעזורו</span>
              </div>

              {/* Category Header: Matches Category 9 subcategory 'איש את רעהו יעזורו' (#DC9656) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#dcdcdc] shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#DC9656] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                    <i className="fa fa-right-left"></i>
                  </span>
                  <div>
                    <h1 className="text-xl font-bold text-[#01263c] leading-tight">איש את רעהו יעזורו</h1>
                    <p className="text-xs text-gray-500">גמ"חים, סיוע הדדי, בקשות עזרה ומידע לתושבי רכסים והסביבה</p>
                  </div>
                </div>

                {/* Primary Button: 'נושא חדש' */}
                <button
                  ref={el => { targetsRef.current['btnNewTopic'] = el; }}
                  onClick={() => {
                    setSimState(p => ({ ...p, isComposerOpen: true, isSubmitted: false }));
                  }}
                  className="bg-[#01263c] text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-[#caa34b] hover:text-[#01263c] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>נושא חדש</span>
                  <span className="text-xs font-extrabold">+</span>
                </button>
              </div>

              {/* Thread Posts Box */}
              <div className="bg-white rounded-xl border border-[#dcdcdc] shadow-xs overflow-hidden">
                
                {/* Authentic Post 1: User 'מידערכסים' (reputation 644, group 'בעלי עסקים') */}
                <div className="flex flex-col md:flex-row border-b border-gray-100">
                  {/* User Column */}
                  <div className="w-full md:w-36 p-4 bg-gray-50/70 border-b md:border-b-0 md:border-l border-[#dcdcdc] flex md:flex-col items-center md:items-center justify-between md:justify-start gap-2 shrink-0">
                    <div 
                      ref={el => { targetsRef.current['userAvatar'] = el; }}
                      className="w-14 h-14 rounded-full bg-[#e65100] text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white"
                    >
                      מ
                    </div>
                    <div className="text-center">
                      <span 
                        ref={el => { targetsRef.current['userName'] = el; }}
                        className="block font-black text-xs text-[#01263c] hover:underline cursor-pointer"
                      >
                        מידערכסים
                      </span>
                      <span 
                        ref={el => { targetsRef.current['userBadge'] = el; }}
                        className="inline-block mt-1 bg-[#caa34b] text-[#01263c] text-[9px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-tight"
                      >
                        בעלי עסקים
                      </span>
                    </div>
                    
                    <div 
                      ref={el => { targetsRef.current['userRep'] = el; }}
                      className="flex md:flex-col items-center gap-2 md:gap-0.5 text-[10px] text-gray-500 font-medium mt-1"
                    >
                      <span>פוסטים: <b className="text-gray-800">412</b></span>
                      <span>מוניטין: <b className="text-emerald-700 font-bold">+644</b></span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1 p-5 text-right flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span className="font-bold text-gray-600">נושא: מידע על גמ"חים ושירותים ברכסים</span>
                        <span>לפני יום • #1</span>
                      </div>
                      <div className="text-gray-800 text-sm leading-relaxed mb-4">
                        תושבי רכסים יקרים, אנו מרכזים כאן מידע לגבי גמ"חים פעילים ביישוב לשמחות, כסאות, ציוד רפואי וסיוע הדדי. אם יש לכם שאלה או צורך ספציפי - מוזמנים לפרסם כאן בשרשור.
                      </div>
                    </div>

                    {/* NodeBB Authentic Actions (תגובה, ציטוט, vote count) */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-3 text-gray-500 font-semibold">
                        <button className="flex items-center gap-1 text-[#01263c] hover:text-[#caa34b] transition">
                          <ThumbsUp className="w-3.5 h-3.5" /> <span>8</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-[#01263c] transition">
                          <Share2 className="w-3.5 h-3.5" /> <span>שתף</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          ref={el => { targetsRef.current['btnQuote'] = el; }}
                          onClick={() => {
                            setSimState(p => ({ 
                              ...p, 
                              isComposerOpen: true, 
                              body: "> אנו מרכזים כאן מידע לגבי גמ\"חים פעילים ביישוב לשמחות...\n\n" 
                            }));
                          }}
                          className="text-[#01263c] hover:text-[#caa34b] font-bold flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <Quote className="w-3 h-3" />
                          <span>ציטוט</span>
                        </button>

                        <button
                          ref={el => { targetsRef.current['btnReply'] = el; }}
                          onClick={() => {
                            setSimState(p => ({ ...p, isComposerOpen: true }));
                          }}
                          className="bg-[#01263c] text-white px-3 py-1 rounded text-xs font-bold hover:bg-[#caa34b] hover:text-[#01263c] transition flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>תגובה</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Newly Submitted Response in the thread */}
                {simState.isSubmitted && (
                  <div className="flex flex-col md:flex-row bg-[#fffdfa] border-t-2 border-[#caa34b] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="w-full md:w-36 p-4 bg-amber-50/30 border-b md:border-b-0 md:border-l border-amber-100 flex md:flex-col items-center justify-between md:justify-start gap-2 shrink-0">
                      <div className="w-14 h-14 rounded-full bg-[#01263c] text-[#caa34b] flex items-center justify-center text-xl font-black shadow-md border-2 border-white">
                        י
                      </div>
                      <div className="text-center">
                        <span className="block font-black text-xs text-[#01263c]">אתה (חבר קהילה)</span>
                        <span className="inline-block mt-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          משתמש רשום
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-1">
                        <span>פוסטים: <b className="text-gray-800">1</b></span>
                      </div>
                    </div>

                    <div className="flex-1 p-5 text-right">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span className="font-bold text-[#01263c]">
                          {mode === 'create' ? simState.title || "נושא חדש" : "תגובה לשרשור"}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">זה עתה פורסם בפורום ✓</span>
                      </div>
                      <div className="prose prose-sm max-w-none text-right">
                        <MarkdownRenderer text={simState.body} />
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </main>
        </div>

        {/* NodeBB Harmony Split-View Composer Drawer (Bottom drawer matching rchsnik.com) */}
        <div
          className="absolute bottom-0 left-0 w-full bg-white shadow-[0_-15px_40px_rgba(0,0,0,0.22)] border-t border-[#dcdcdc] flex flex-col transition-transform duration-500 z-40"
          style={{
            height: '460px',
            transform: simState.isComposerOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Header Action Row: Submit button is top-left in NodeBB RTL */}
          <div className="px-4 py-2 border-b bg-[#f8f9fa] flex items-center justify-between gap-3 shrink-0">
            
            {/* Primary Action Button: 'שליחה' (Top Left in RTL) */}
            <div className="flex items-center gap-2">
              <button
                ref={el => { targetsRef.current['btnSubmit'] = el; }}
                onClick={() => {
                  setSimState(p => ({ ...p, isSubmitted: true, isComposerOpen: false }));
                  confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
                }}
                className="bg-[#01263c] text-white px-5 py-1.5 rounded-md font-bold text-xs shadow hover:bg-[#caa34b] hover:text-[#01263c] transition flex items-center gap-1.5 cursor-pointer ring-1 ring-black/10 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>שליחה</span>
              </button>

              <button
                onClick={() => setSimState(p => ({ ...p, isComposerOpen: false }))}
                className="text-gray-600 hover:text-gray-900 text-xs font-semibold px-2 py-1.5 hover:bg-gray-200 rounded transition cursor-pointer"
              >
                ביטול
              </button>
            </div>

            {/* Center: Title input (or subject) */}
            {mode === 'create' ? (
              <div className="flex-1 max-w-xl flex items-center gap-2 bg-white border border-[#dcdcdc] rounded-md px-3 py-1 focus-within:border-[#caa34b] focus-within:ring-2 focus-within:ring-[#caa34b]/20 transition">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DC9656] shrink-0"></span>
                <input
                  ref={el => { targetsRef.current['inputTitle'] = el; }}
                  type="text"
                  placeholder="הכניסו את כותרת הנושא כאן..."
                  value={simState.title}
                  onChange={(e) => setSimState(p => ({ ...p, title: e.target.value }))}
                  readOnly={!isInteractive}
                  className="w-full text-xs font-bold text-gray-800 focus:outline-none"
                  dir="rtl"
                />
              </div>
            ) : (
              <div className="text-xs font-bold text-gray-700">
                מענה לנושא: <span className="text-[#01263c]">מידע על גמ"חים ושירותים ברכסים</span>
              </div>
            )}

            {/* Right side: Category badge & Close */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block bg-[#DC9656]/15 text-[#9e5513] border border-[#DC9656]/30 text-[11px] font-bold px-2 py-0.5 rounded">
                איש את רעהו יעזורו
              </span>
              <button
                onClick={() => setSimState(p => ({ ...p, isComposerOpen: false }))}
                className="text-gray-400 hover:text-gray-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* NodeBB Formatting Toolbar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-b bg-[#fafafa] shrink-0 text-xs">
            <div className="flex items-center gap-1">
              <button
                ref={el => { targetsRef.current['btnBold'] = el; }}
                onClick={() => handleFormat('bold')}
                className={`w-7 h-7 flex items-center justify-center rounded font-extrabold transition cursor-pointer ${
                  simState.activeTool === 'bold' 
                    ? 'bg-[#01263c] text-[#caa34b] shadow-xs' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="מודגש (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('italic')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="נטוי (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

              <button
                onClick={() => handleFormat('quote')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="ציטוט"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('list')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="רשימה"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('code')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="קוד"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSimState(p => ({ ...p, body: p.body + ' [קישור](https://) ' }))}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="הוספת קישור"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-bold text-[#01263c]">
              <Eye className="w-3.5 h-3.5 text-[#caa34b]" />
              <span>עורך מפוצל 50/50 (תצוגה מקדימה פעילה)</span>
            </div>
          </div>

          {/* Split View 50/50: Textarea (Right) vs Preview (Left) */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Textarea */}
            <div className="w-1/2 h-full border-l border-[#dcdcdc] flex flex-col bg-white p-3 relative">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider flex justify-between">
                <span>עורך טקסט (Markdown)</span>
                {isInteractive && <span className="text-emerald-600 font-bold">מצב הקלדה חופשי פעיל</span>}
              </div>
              <textarea
                ref={el => { targetsRef.current['editor'] = el; }}
                value={simState.body}
                onChange={(e) => setSimState(p => ({ ...p, body: e.target.value }))}
                readOnly={!isInteractive}
                placeholder="כתבו כאן את תוכן ההודעה. השתמשו ב-Markdown או בסרגל הכלים לעיצוב..."
                className="flex-1 w-full text-xs md:text-sm font-medium text-gray-800 placeholder-gray-300 resize-none focus:outline-none leading-relaxed font-heebo"
                dir="rtl"
              />
            </div>

            {/* Live Markdown Preview */}
            <div className="w-1/2 h-full bg-[#fbfcfd] p-3 overflow-y-auto">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider border-b border-gray-200 pb-1">
                תצוגה מקדימה כפי שתיראה בפורום רכוסניק
              </div>
              <MarkdownRenderer text={simState.body} />
            </div>
          </div>
        </div>

        {/* Animated Spotlight Cursor */}
        {!isInteractive && (
          <Cursor
            position={simState.cursorPos}
            isClicking={simState.isClicking}
            label={cursorLabel}
            targetRect={simState.targetRect}
          />
        )}
      </div>

    </div>
  );
};

export default ForumSimulator;