import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  EyeOff,
  Bold, 
  Italic, 
  Strikethrough,
  Quote, 
  List, 
  ListOrdered,
  Link2, 
  Check, 
  X, 
  Trash2,
  ChevronDown,
  Search,
  Home,
  Layers,
  Gavel,
  Flame,
  Clock,
  Code,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  Bell,
  CheckCircle2,
  HelpCircle,
  Maximize2,
  Send,
  User,
  Shield,
  Briefcase,
  ChevronRight,
  SlidersHorizontal,
  Plus
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
      title: 'לחיצה על נושא חדש', 
      instruction: 'בראש הקטגוריה לחצו על כפתור "נושא חדש" (כפתור Primary כחול ב-NodeBB)', 
      targetKey: 'btnNewTopic', 
      tip: 'הכפתור נמצא בשורת הכלים של הקטגוריה לצד מסנני המיון' 
    },
    { 
      id: 2, 
      title: 'הזנת כותרת בעורך', 
      instruction: 'נפתח חלון העורך של NodeBB. הזינו כותרת מדויקת לנושא שלכם', 
      targetKey: 'inputTitle', 
      tip: 'שימו לב שלצד הכותרת מופיע תג הקטגוריה הנבחרת' 
    },
    { 
      id: 3, 
      title: 'כתיבה בעורך המפוצל', 
      instruction: 'כתבו את ההודעה בעורך הימני (Write). התצוגה המקדימה משמאל (Preview) מתעדכנת חי!', 
      targetKey: 'editor', 
      tip: 'העורך המפוצל של NodeBB מציג בדיוק איך הפוסט ייראה לקוראים' 
    },
    { 
      id: 4, 
      title: 'סרגל העיצוב (Formatting Bar)', 
      instruction: 'השתמשו בכפתור ההדגשה (B), הציטוט או הקישור כדי לעצב את הפוסט', 
      targetKey: 'btnBold', 
      tip: 'אפשר גם להשתמש בקיצורי מקלדת מוכרים כמו Ctrl+B' 
    },
    { 
      id: 5, 
      title: 'שליחה ופרסום הפוסט', 
      instruction: 'ב-NodeBB כפתור ה"שליחה" הירוק/כחול עם סימון ה-V ממוקם בפינה השמאלית העליונה', 
      targetKey: 'btnSubmit', 
      tip: 'לחיצה מפרסמת את הנושא מיד בראש הקטגוריה ברכוסניק' 
    },
  ],
  reply: [
    { 
      id: 1, 
      title: 'כפתור תגובה בפוסט', 
      instruction: 'בתחתית הפוסט בשרשור לחצו על כפתור "תגובה" (Reply)', 
      targetKey: 'btnReply', 
      tip: 'ב-NodeBB כלי הפוסט מוצגים תמיד בתחתית כל הודעה' 
    },
    { 
      id: 2, 
      title: 'ציטוט דברי הכותב', 
      instruction: 'סמל הציטוט מביא את דברי המשתמש בתוך תיבת ציטוט מעוצבת', 
      targetKey: 'btnQuote', 
      tip: 'ציטוט ממקד את השיח ומאפשר מענה מסודר ומכבד' 
    },
    { 
      id: 3, 
      title: 'הקלדת המענה', 
      instruction: 'הקלידו את התשובה שלכם מתחת לציטוט ובדקו את התצוגה המקדימה', 
      targetKey: 'editor', 
      tip: 'חברי קהילת רכסים זוכים למענה מהיר בזכות התראות המערכת' 
    },
    { 
      id: 4, 
      title: 'שליחת התגובה לשרשור', 
      instruction: 'לחצו על "שליחה" בצד שמאל למעלה לפרסום התשובה בשרשור', 
      targetKey: 'btnSubmit', 
      tip: 'התגובה שלכם תתווסף מיד לסוף השרשור והכותב יקבל התראה' 
    },
  ],
  follow: [
    { 
      id: 1, 
      title: 'תפריט מעקב (Watch Menu)', 
      instruction: 'בראש הנושא לחצו על כפתור המעקב עם סמל הפעמון לפתיחת אפשרויות ההתראה', 
      targetKey: 'btnWatch', 
      tip: 'ב-NodeBB Harmony כפתור המעקב נמצא בשורת הכותרת של כל נושא' 
    },
    { 
      id: 2, 
      title: 'בחירת מצב "עוקב"', 
      instruction: 'בחרו ב-"עוקב" (Watching) כדי לקבל התראה מיידית על כל תגובה חדשה שתפורסם', 
      targetKey: 'watchOption', 
      tip: 'ניתן גם לבחור "התעלם" אם הנושא אינו רלוונטי עבורכם' 
    },
    { 
      id: 3, 
      title: 'אישור הסטטוס בפעמון', 
      instruction: 'כעת הסטטוס התעדכן ל-"עוקב" ירוק, וכל עדכון יופיע בפעמון ההתראות בראש האתר', 
      targetKey: 'watchStatusBadge', 
      tip: 'מספר ההתראות יופיע כעיגול אדום מעל הפעמון בראש הפורום' 
    },
  ],
  'user-info': [
    { 
      id: 1, 
      title: 'תמונת הפרופיל בפוסט', 
      instruction: 'לצד כל פוסט מופיעה תמונת המשתמש ב-NodeBB עם נורית סטטוס ירוקה (מחובר)', 
      targetKey: 'userAvatar', 
      tip: 'משתמשים יכולים לעדכן תמונת פרופיל אישית בהגדרות החשבון' 
    },
    { 
      id: 2, 
      title: 'כרטיס המשתמש המלא (Popover)', 
      instruction: 'לחיצה על שם המשתמש פותחת כרטיס עם כל פרטיו, הדרגה וההיסטוריה שלו', 
      targetKey: 'userName', 
      tip: 'משתמש מזוהה מגביר את האמינות והביטחון בקהילת רכסים' 
    },
    { 
      id: 3, 
      title: 'תג קבוצה ("בעלי עסקים" / "צוות פיקוח")', 
      instruction: 'תגים מיוחדים מעידים על בעל עסק מאומת ביישוב או חבר בצוות הפיקוח והניהול', 
      targetKey: 'userBadge', 
      tip: 'ברכוסניק קיימות קבוצות ייעודיות לבעלי עסקים, גבאים וועדות' 
    },
    { 
      id: 4, 
      title: 'הצבעת מוניטין חיובי (👍)', 
      instruction: 'ברכוסניק הצבעה על פוסט מועיל מעניקה מוניטין לכותב באמצעות האימוג\'י הייחודי של האתר', 
      targetKey: 'btnUpvote', 
      tip: 'המוניטין מעודד את חברי הקהילה להמשיך לסייע ולתרום מידע' 
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
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [showUserPopover, setShowUserPopover] = useState<boolean>(mode === 'user-info');
  const [upvotes, setUpvotes] = useState<number>(8);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);

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
          setShowUserPopover(false);
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

          // Step 2: Enter Title in NodeBB composer
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('inputTitle', 'הזנת כותרת הנושא');
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
          updateTargetPosition('btnBold', 'לחיצה על הדגשה (Bold)');
          await wait(1400);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true, activeTool: 'bold' }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false }));

          updateTargetPosition('editor', 'הקלדת הטקסט המודגש');
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

          // Step 5: Submit NodeBB composer
          setSimState(p => ({ ...p, step: 5, instruction: steps[4].instruction, tip: steps[4].tip }));
          updateTargetPosition('btnSubmit', 'שליחה ופרסום ברכוסניק');
          await wait(1600);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false }));

          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.65 }
          });

          await wait(4500);

        } else if (mode === 'reply') {
          setShowUserPopover(false);
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

          // Step 1: Click Reply in post tools
          updateTargetPosition('btnReply', 'לחיצה על כפתור תגובה');
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
            body: "> מישהו מכיר גמ\"ח כסאות פעיל ברכסים לשבת הקרובה?\n\n" 
          }));
          await wait(800);
          if (isCancelled) break;

          // Step 3: Type Response
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('editor', 'הקלדת המענה בשרשור');
          await wait(1200);
          if (isCancelled) break;

          let rBody = "> מישהו מכיר גמ\"ח כסאות פעיל ברכסים לשבת הקרובה?\n\n";
          const answer = "שלום, אפשר לפנות לגמ\"ח 'חסדי יוסף' ברחוב הרימונים ברכסים, הם שמחים לעזור תמיד!";
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
          updateTargetPosition('btnSubmit', 'שליחת התגובה לפרסום');
          await wait(1500);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false }));
          await wait(4000);

        } else if (mode === 'follow') {
          setShowUserPopover(false);
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
          setIsWatchMenuOpen(false);
          setShowUserPopover(false);
          setSimState(p => ({ ...p, step: 1, instruction: steps[0].instruction, tip: steps[0].tip, isComposerOpen: false }));
          
          // Step 1: Avatar & Online Status
          updateTargetPosition('userAvatar', 'תמונת פרופיל וסטטוס מקוון');
          await wait(2600);
          if (isCancelled) break;

          // Step 2: Open User Popover Card
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('userName', 'לחיצה על שם המשתמש');
          await wait(1800);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ ...p, isClicking: false }));
          setShowUserPopover(true);
          await wait(800);
          if (isCancelled) break;

          // Step 3: Group Badge
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('userPopoverBadge', 'תג קבוצה: בעלי עסקים');
          await wait(2600);
          if (isCancelled) break;

          // Step 4: Upvote with thumbs up
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('btnUpvote', 'הצבעת מוניטין חיובי 👍');
          await wait(2000);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(200);
          setSimState(p => ({ ...p, isClicking: false }));
          setHasUpvoted(true);
          setUpvotes(9);
          await wait(3500);
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

    if (mode === 'user-info' && targetStep.id >= 2) {
      setShowUserPopover(true);
    }

    setTimeout(() => {
      updateTargetPosition(targetStep.targetKey, targetStep.title);
    }, 150);
  };

  const handleFormat = (type: 'bold' | 'italic' | 'strikethrough' | 'quote' | 'list' | 'list-ol' | 'code' | 'link') => {
    if (type === 'bold') {
      setSimState(p => ({ ...p, body: p.body + ' **טקסט מודגש** ' }));
    } else if (type === 'italic') {
      setSimState(p => ({ ...p, body: p.body + ' *טקסט נטוי* ' }));
    } else if (type === 'strikethrough') {
      setSimState(p => ({ ...p, body: p.body + ' ~~טקסט מחוק~~ ' }));
    } else if (type === 'quote') {
      setSimState(p => ({ ...p, body: p.body + '\n> ציטוט כאן\n' }));
    } else if (type === 'list') {
      setSimState(p => ({ ...p, body: p.body + '\n- פריט ראשון\n- פריט שני\n' }));
    } else if (type === 'list-ol') {
      setSimState(p => ({ ...p, body: p.body + '\n1. שלב ראשון\n2. שלב שני\n' }));
    } else if (type === 'code') {
      setSimState(p => ({ ...p, body: p.body + ' `קוד/הדגשה` ' }));
    } else if (type === 'link') {
      setSimState(p => ({ ...p, body: p.body + ' [קישור](https://rchsnik.com) ' }));
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-heebo">
      
      {/* Top Simulator Control Bar */}
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
                    className={`px-2 py-1 text-xs font-bold rounded-md transition cursor-pointer ${speed === s ? 'bg-white shadow text-[#01263c]' : 'text-gray-500 hover:text-gray-900'}`}
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
                  instruction: 'מצב התנסות חופשי: הקלידו כותרת ותוכן, עצבו בסרגל הכלים ונסו ללחוץ על שליחה!'
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
            <span>{isInteractive ? "מצב התנסות פעיל (לחצו לסיום)" : "נסו בעצמכם ב-NodeBB"}</span>
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

      {/* Main Forum View Container - Exact 1:1 replica of NodeBB Harmony on rchsnik.com */}
      <div
        ref={containerRef}
        className="relative w-full bg-white border border-[#dcdcdc] rounded-xl shadow-xl overflow-hidden select-none h-[650px] font-heebo flex flex-col"
      >
        
        {/* Dynamic Instructional Guidance Banner */}
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
            <span className="text-[#caa34b] text-[11px] font-bold">NodeBB Harmony • רכוסניק</span>
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

              {/* NodeBB Authentic Watch Dropdown */}
              {isWatchMenuOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-[#dcdcdc] rounded-lg shadow-xl z-50 py-1.5 text-right">
                  <button
                    ref={el => { targetsRef.current['watchOption'] = el; }}
                    onClick={() => {
                      setWatchStatus('עוקב');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-bold text-gray-800 hover:bg-amber-50 flex items-center justify-between text-right cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">עוקב (Watching)</div>
                      <div className="text-[10px] text-gray-400 font-normal">התראה על כל תגובה חדשה</div>
                    </div>
                    {watchStatus === 'עוקב' && <CheckCircle2 className="w-3.5 h-3.5 text-[#caa34b]" />}
                  </button>
                  <button
                    onClick={() => {
                      setWatchStatus('מעקב');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 text-right cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">מעקב רגיל (Not Watching)</div>
                      <div className="text-[10px] text-gray-400">התראה רק אם יתייגו אותך</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setWatchStatus('התעלם');
                      setIsWatchMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-right cursor-pointer"
                  >
                    <div>
                      <div className="font-bold">התעלם (Ignoring)</div>
                      <div className="text-[10px] text-gray-400">ללא התראות כלל</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar with online dot */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#01263c] text-[#caa34b] font-black flex items-center justify-center text-xs shadow-xs border border-[#caa34b]/40">
                  י
                </div>
                <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
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

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition cursor-pointer">
              <Layers className="w-4 h-4 text-gray-500" />
              <span>קטגוריות</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition cursor-pointer">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>פוסטים אחרונים</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition cursor-pointer">
              <Flame className="w-4 h-4 text-gray-500" />
              <span>פופולרי</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition cursor-pointer">
              <Gavel className="w-4 h-4 text-gray-500" />
              <span>חוקי הפורום</span>
            </div>

            <div className="pt-3 border-t border-gray-200 mt-2">
              <div className="text-[10px] text-gray-400 p-2">לוחות מודעות</div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white text-gray-700 transition cursor-pointer">
                <span>🏠 לוח דירות</span>
              </div>
            </div>
          </aside>

          {/* Main Forum Body Stream */}
          <main className={`flex-1 overflow-y-auto p-4 md:p-6 bg-[#f4f7f9] transition-all duration-500 ${simState.isComposerOpen ? 'opacity-25 blur-[1px]' : 'opacity-100'}`}>
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* Breadcrumb matching NodeBB Harmony */}
              <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
                <span className="hover:underline cursor-pointer">דף הבית</span>
                <span>/</span>
                <span className="hover:underline cursor-pointer">קהילה וחיי היום יום</span>
                <span>/</span>
                <span className="font-bold text-[#01263c]">איש את רעהו יעזורו</span>
              </div>

              {/* NodeBB Category Toolbar (Category 9 Subcategory: איש את רעהו יעזורו) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#dcdcdc] shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-[#DC9656] text-white flex items-center justify-center text-lg font-bold shadow-xs">
                    <i className="fa fa-right-left"></i>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-[#01263c] leading-tight">איש את רעהו יעזורו</h1>
                      <span className="badge bg-[#DC9656]/15 text-[#9e5513] text-[11px] font-bold px-2 py-0.5 rounded border border-[#DC9656]/30">
                        קטגוריה 9
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">כאן ישנן קטגוריות הקשורות לחיי הקהילה ברכסים, סיוע הדדי וגמ"חים</p>
                  </div>
                </div>

                {/* NodeBB Primary Action: "נושא חדש" Button */}
                <button
                  ref={el => { targetsRef.current['btnNewTopic'] = el; }}
                  onClick={() => {
                    setSimState(p => ({ ...p, isComposerOpen: true, isSubmitted: false }));
                  }}
                  className="bg-[#01263c] text-white px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-[#caa34b] hover:text-[#01263c] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>נושא חדש</span>
                </button>
              </div>

              {/* Topic Header & Posts Area */}
              <div className="bg-white rounded-xl border border-[#dcdcdc] shadow-xs overflow-hidden">
                
                {/* Topic Title Bar inside Topic View */}
                <div className="p-4 border-b border-[#eceff1] bg-[#fafbfc]">
                  <h2 className="text-lg font-bold text-[#01263c] tracking-tight">
                    גמ"ח כסאות ושמחות ברכסים לשבתות ולאירועים
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge px-2 py-0.5 text-[11px] font-bold text-white rounded" style={{ backgroundColor: '#DC9656' }}>
                      איש את רעהו יעזורו
                    </span>
                    <span className="badge px-2 py-0.5 text-[11px] font-bold text-gray-600 bg-gray-100 rounded border border-gray-200">
                      רכוסניק
                    </span>
                    <span className="text-xs text-gray-400">• לפני יום • 2 פוסטים</span>
                  </div>
                </div>

                {/* NodeBB Post Component 1: User 'מידערכסים' */}
                <div className="p-5 border-b border-[#eceff1] relative">
                  <div className="flex items-start gap-3">
                    
                    {/* User Avatar with online badge */}
                    <div className="relative shrink-0">
                      <div 
                        ref={el => { targetsRef.current['userAvatar'] = el; }}
                        onClick={() => setShowUserPopover(!showUserPopover)}
                        className="w-12 h-12 rounded-full bg-[#e65100] text-white flex items-center justify-center text-lg font-black shadow-xs cursor-pointer border-2 border-white ring-1 ring-gray-200"
                        title="לחצו לצפייה בכרטיס המשתמש"
                      >
                        מ
                      </div>
                      <span className="absolute bottom-0 left-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" title="מחובר כעת"></span>
                    </div>

                    {/* Post Content & Author details */}
                    <div className="flex-1 min-w-0">
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <button
                            ref={el => { targetsRef.current['userName'] = el; }}
                            onClick={() => setShowUserPopover(!showUserPopover)}
                            className="font-bold text-sm text-[#01263c] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>מידערכסים</span>
                          </button>
                          
                          {/* Group Badge */}
                          <span 
                            ref={el => { targetsRef.current['userBadge'] = el; }}
                            className="badge text-[10px] font-black bg-[#caa34b] text-[#01263c] px-2 py-0.5 rounded shadow-xs"
                          >
                            בעלי עסקים
                          </span>

                          <span className="text-xs text-gray-400">לפני יום</span>
                        </div>

                        <span className="text-xs text-gray-400 font-bold">#1</span>
                      </div>

                      {/* Post Text Body */}
                      <div className="text-gray-800 text-sm leading-relaxed mb-4">
                        תושבי רכסים יקרים, אנו מרכזים כאן מידע לגבי גמ"חים פעילים ביישוב לשמחות, כסאות, ציוד רפואי וסיוע הדדי. מישהו מכיר גמ"ח כסאות פעיל ברכסים לשבת הקרובה?
                      </div>

                      {/* NodeBB Post Tools Footer with custom Rchsnik 👍 emoji upvotes */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                        
                        {/* Upvote & Reactions matching Rchsnik ACP Custom CSS */}
                        <div className="flex items-center gap-3">
                          <button
                            ref={el => { targetsRef.current['btnUpvote'] = el; }}
                            onClick={() => {
                              if (!hasUpvoted) {
                                setUpvotes(upvotes + 1);
                                setHasUpvoted(true);
                              } else {
                                setUpvotes(upvotes - 1);
                                setHasUpvoted(false);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition cursor-pointer font-bold ${
                              hasUpvoted 
                                ? 'bg-amber-100 text-[#caa34b] ring-1 ring-[#caa34b]' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title="הצבעת מוניטין חיובי 👍"
                          >
                            <span className="text-base leading-none">👍</span>
                            <span>{upvotes}</span>
                          </button>

                          <button className="text-gray-500 hover:text-[#01263c] flex items-center gap-1 p-1 cursor-pointer">
                            <Share2 className="w-3.5 h-3.5" /> <span>שתף</span>
                          </button>
                        </div>

                        {/* Reply & Quote actions */}
                        <div className="flex items-center gap-3">
                          <button
                            ref={el => { targetsRef.current['btnQuote'] = el; }}
                            onClick={() => {
                              setSimState(p => ({ 
                                ...p, 
                                isComposerOpen: true, 
                                body: "> מישהו מכיר גמ\"ח כסאות פעיל ברכסים לשבת הקרובה?\n\n" 
                              }));
                            }}
                            className="text-[#01263c] hover:text-[#caa34b] font-bold flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <Quote className="w-3 h-3 text-[#01263c]" />
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

                  {/* NodeBB Authentic User Popover Card */}
                  {showUserPopover && (
                    <div className="absolute top-16 right-16 z-30 w-72 bg-white rounded-xl shadow-2xl border border-[#dcdcdc] p-4 text-right animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <span className="text-[11px] font-bold text-gray-400">כרטיס משתמש • רכוסניק</span>
                        <button onClick={() => setShowUserPopover(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-full bg-[#e65100] text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white">
                          מ
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#01263c]">מידע רכסים</h4>
                          <span className="text-xs text-gray-500 font-medium">@מידערכסים</span>
                          <div className="mt-1">
                            <span 
                              ref={el => { targetsRef.current['userPopoverBadge'] = el; }}
                              className="badge text-[10px] font-black bg-[#caa34b] text-[#01263c] px-2 py-0.5 rounded shadow-xs"
                            >
                              בעלי עסקים
                            </span>
                          </div>
                        </div>
                      </div>

                      <div 
                        ref={el => { targetsRef.current['userRep'] = el; }}
                        className="grid grid-cols-2 gap-2 bg-[#f8f9fa] p-2.5 rounded-lg border border-gray-100 text-xs text-center mb-3"
                      >
                        <div>
                          <span className="block text-[10px] text-gray-400">מוניטין</span>
                          <span className="font-extrabold text-emerald-700 text-sm">+{upvotes * 80 + 4}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-400">פוסטים בפורום</span>
                          <span className="font-extrabold text-[#01263c] text-sm">412</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 space-y-1">
                        <div>📅 הצטרף: <span className="font-bold text-gray-700">לפני שנה</span></div>
                        <div>🟢 סטטוס: <span className="font-bold text-emerald-600">מחובר כעת</span></div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Submitted Post in Thread */}
                {simState.isSubmitted && (
                  <div className="p-5 bg-[#fffdfa] border-t-2 border-[#caa34b] animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#01263c] text-[#caa34b] flex items-center justify-center text-lg font-black shadow-xs shrink-0 border-2 border-white ring-1 ring-gray-200">
                        י
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#01263c]">אתה (משתמש רשום)</span>
                            <span className="badge text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                              חבר קהילה
                            </span>
                            <span className="text-xs text-gray-400">זה עתה</span>
                          </div>
                          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            פורסם בהצלחה ✓
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none text-right">
                          <MarkdownRenderer text={simState.body} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </main>
        </div>

        {/* =========================================================================
            AUTHENTIC NodeBB COMPOSER (nodebb-plugin-composer-default + Harmony)
           ========================================================================= */}
        <div
          className={`absolute bottom-0 left-0 w-full bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.25)] border-t border-[#dcdcdc] flex flex-col transition-transform duration-500 z-40 composer`}
          style={{
            height: '470px',
            transform: simState.isComposerOpen ? 'translateY(0)' : 'translateY(100%)',
          }}
        >
          {/* Top Resizer Handle bar with fa-arrows-up-down */}
          <div className="w-full bg-[#eceff1] h-1.5 flex items-center justify-center cursor-row-resize hover:bg-[#dcdcdc] transition">
            <div className="w-8 h-1 bg-gray-400 rounded-full"></div>
          </div>

          {/* NodeBB Title Container Row (title-container.tpl) */}
          <div className="px-3 py-2 border-b border-[#eceff1] bg-[#f8f9fa] flex items-center justify-between gap-2 shrink-0">
            
            {/* Action Bar: Submit / Hide / Discard (Left side in RTL) */}
            <div className="flex items-center gap-1.5 shrink-0">
              
              {/* NodeBB Primary Submit Button with Checkmark */}
              <button
                ref={el => { targetsRef.current['btnSubmit'] = el; }}
                onClick={() => {
                  setSimState(p => ({ ...p, isSubmitted: true, isComposerOpen: false }));
                  confetti({ particleCount: 65, spread: 70, origin: { y: 0.7 } });
                }}
                className="bg-[#01263c] text-white px-4 py-1.5 rounded text-xs font-bold shadow hover:bg-[#caa34b] hover:text-[#01263c] transition flex items-center gap-1.5 cursor-pointer ring-1 ring-black/10 active:scale-95"
              >
                <Check className="w-3.5 h-3.5" />
                <span>שליחה</span>
              </button>

              <button
                onClick={() => setSimState(p => ({ ...p, isComposerOpen: false }))}
                className="text-gray-600 hover:text-gray-900 text-xs font-semibold px-2 py-1.5 hover:bg-gray-200 rounded transition cursor-pointer flex items-center gap-1"
                title="מזער חלון עריכה"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">מזער</span>
              </button>

              <button
                onClick={() => setSimState(p => ({ ...p, isComposerOpen: false, body: '', title: '' }))}
                className="text-gray-500 hover:text-rose-600 text-xs font-semibold px-2 py-1.5 hover:bg-gray-200 rounded transition cursor-pointer flex items-center gap-1"
                title="בטל עריכה"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">בטל</span>
              </button>
            </div>

            {/* Title Input or Topic Reference (Middle) */}
            {mode === 'create' ? (
              <div className="flex-1 max-w-xl flex items-center gap-2 bg-white border border-[#dcdcdc] rounded px-3 py-1.5 focus-within:border-[#caa34b] focus-within:ring-2 focus-within:ring-[#caa34b]/20 transition">
                <input
                  ref={el => { targetsRef.current['inputTitle'] = el; }}
                  type="text"
                  placeholder="הכניסו את כותרת הנושא כאן..."
                  value={simState.title}
                  onChange={(e) => setSimState(p => ({ ...p, title: e.target.value }))}
                  readOnly={!isInteractive}
                  className="w-full text-xs font-bold text-gray-800 focus:outline-none placeholder-gray-400"
                  dir="rtl"
                />
              </div>
            ) : (
              <div className="text-xs font-bold text-gray-700 flex-1 text-center truncate">
                תגובה ל: <span className="text-[#01263c]">גמ"ח כסאות ושמחות ברכסים לשבתות</span>
              </div>
            )}

            {/* Category Selector Dropdown (Right side) */}
            <div className="shrink-0 flex items-center gap-1.5 bg-white border border-[#dcdcdc] rounded px-2.5 py-1 text-xs font-bold text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#DC9656' }}></span>
              <span>איש את רעהו יעזורו</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

          </div>

          {/* NodeBB Formatting Toolbar (composer-formatting.tpl) */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#eceff1] bg-[#fafafa] shrink-0 text-xs">
            
            {/* Action Tools: Bold, Italic, Strikethrough, Link, Quote, Code, List, List-Ol */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                ref={el => { targetsRef.current['btnBold'] = el; }}
                onClick={() => handleFormat('bold')}
                className={`w-7 h-7 flex items-center justify-center rounded font-extrabold transition cursor-pointer ${
                  simState.activeTool === 'bold' 
                    ? 'bg-[#01263c] text-[#caa34b] shadow-xs' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                title="מודגש (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('italic')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="נטוי (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('strikethrough')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="קו חוצה"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>

              <button
                ref={el => { targetsRef.current['btnQuote'] = el; }}
                onClick={() => handleFormat('quote')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="ציטוט (Quote)"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('code')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="קוד / ציטוט טכני"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('link')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="קישור (Link)"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('list')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="רשימת תבליטים"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleFormat('list-ol')}
                className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="רשימה ממוספרת"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview Toggle Button (Matching NodeBB 'data-action="preview"') */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#01263c] hover:text-[#caa34b] transition cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
              >
                {showPreview ? <Eye className="w-3.5 h-3.5 text-[#caa34b]" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{showPreview ? "הסתר תצוגה מקדימה" : "הצג תצוגה מקדימה"}</span>
              </button>
            </div>

          </div>

          {/* NodeBB Split View 50/50 Area (composer-write-preview.tpl) */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Write Textarea Container (Right side in RTL) */}
            <div className={`${showPreview ? 'w-1/2 border-l border-[#dcdcdc]' : 'w-full'} h-full flex flex-col bg-white p-3 relative`}>
              <div className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-wider flex justify-between">
                <span>עורך תוכן (Write)</span>
                {isInteractive && <span className="text-emerald-600 font-bold">הקלידו חופשי</span>}
              </div>
              <textarea
                ref={el => { targetsRef.current['editor'] = el; }}
                value={simState.body}
                onChange={(e) => setSimState(p => ({ ...p, body: e.target.value }))}
                readOnly={!isInteractive}
                placeholder="כתבו כאן את תוכן הפוסט... השתמשו ב-Markdown או בסרגל הכלים לעיצוב"
                className="flex-1 w-full text-xs md:text-sm font-medium text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed font-heebo"
                dir="rtl"
              />
            </div>

            {/* Preview Container (Left side in RTL) */}
            {showPreview && (
              <div className="w-1/2 h-full bg-[#fbfcfd] p-3 overflow-y-auto">
                <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider border-b border-gray-200 pb-1">
                  תצוגה מקדימה חיה (Preview)
                </div>
                <MarkdownRenderer text={simState.body} />
              </div>
            )}

          </div>

        </div>

        {/* Animated Spotlight Cursor (hidden during interactive playground) */}
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