import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  HelpCircle
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
      title: 'כפתור "נושא חדש" בקטגוריה', 
      instruction: 'בדף הקטגוריה (למשל: "איש את רעהו יעזורו"), לחצו על הכפתור הכחול "נושא חדש" בצד שמאל של סרגל הכלים', 
      targetKey: 'btnNewTopic', 
      tip: 'ב-NodeBB Harmony סרגל הכלים של הקטגוריה כולל סינון תגים ומיון מימין, וכפתור "נושא חדש" משמאל' 
    },
    { 
      id: 2, 
      title: 'הזנת כותרת ובחירת קטגוריה', 
      instruction: 'נפתח עורך ה-Composer של NodeBB בתחתית המסך. הזינו כותרת ברורה בשדה המרכזי', 
      targetKey: 'inputTitle', 
      tip: 'מימין לכותרת מופיע בורר הקטגוריה (איש את רעהו יעזורו), ומשמאל כפתורי הסתרה, ביטול ושליחה' 
    },
    { 
      id: 3, 
      title: 'כתיבה בעורך המפוצל (Write / Preview)', 
      instruction: 'הקלידו את תוכן הפוסט בתיבת הטקסט הימנית. משמאל מוצגת התצוגה המקדימה החיה בזמן אמת', 
      targetKey: 'editor', 
      tip: 'ניתן לגרור ולשחרר תמונות ישירות לתוך תיבת הטקסט או להסתיר את התצוגה המקדימה בלחיצה על "הסתרת תצוגה מקדימה"' 
    },
    { 
      id: 4, 
      title: 'סרגל העיצוב (Formatting Bar)', 
      instruction: 'השתמשו בסרגל האייקונים של NodeBB להדגשה (B), נטייה (I), רשימה, קישור או העלאת תמונה', 
      targetKey: 'btnBold', 
      tip: 'בתחתית העורך ניתן גם להוסיף תגים לנושא (למשל: גמ"חים, רכסים)' 
    },
    { 
      id: 5, 
      title: 'לחיצה על "שליחה" ופרסום', 
      instruction: 'לחצו על הכפתור הכחול "שליחה" בפינה השמאלית העליונה של העורך לפרסום הנושא בפורום', 
      targetKey: 'btnSubmit', 
      tip: 'מיד לאחר השליחה תעברו אוטומטית לדף הנושא החדש שפתחתם' 
    },
  ],
  reply: [
    { 
      id: 1, 
      title: 'כלי הפוסט בשרשור (תגובה וציטוט)', 
      instruction: 'בתחתית כל פוסט בשרשור מופיעים כלי הפוסט של NodeBB: חץ תגובה, מרכאות ציטוט והצבעות 👍/👎', 
      targetKey: 'btnQuote', 
      tip: 'ניתן להגיב גם דרך כפתור ה"תגובה" הכחול בסרגל הצד השמאלי של השרשור (Topic Sidebar Tools)' 
    },
    { 
      id: 2, 
      title: 'ציטוט אוטומטי של הכותב', 
      instruction: 'לחיצה על סמל הציטוט פותחת את העורך ומייבאת אוטומטית את דברי המשתמש עם תיוג @חצקל כתב:', 
      targetKey: 'editor', 
      tip: 'הציטוט מופיע עם סימן > בתחילת השורה ומוצג כתיבת ציטוט אפורה בתצוגה המקדימה משמאל' 
    },
    { 
      id: 3, 
      title: 'כתיבת המענה מתחת לציטוט', 
      instruction: 'הקלידו את התגובה שלכם מתחת לציטוט ובדקו את הנראות בתצוגה המקדימה', 
      targetKey: 'editor', 
      tip: 'המשתמש שציטטתם יקבל התראה ישירה בפעמון ההתראות על כך שהגבתם לדבריו' 
    },
    { 
      id: 4, 
      title: 'שליחת התגובה לשרשור', 
      instruction: 'לחצו על "שליחה" בצד שמאל למעלה של העורך כדי להוסיף את התגובה לסוף השרשור', 
      targetKey: 'btnSubmit', 
      tip: 'הפוסט יתווסף מיד כפוסט #3 בציר הזמן של השרשור' 
    },
  ],
  follow: [
    { 
      id: 1, 
      title: 'סרגל הצד של השרשור (Topic Sidebar Tools)', 
      instruction: 'ב-NodeBB Harmony כלי השרשור נמצאים בעמודה השמאלית הקבועה: תגובה, סימון כלא נקרא, מעקב ומיון', 
      targetKey: 'btnWatch', 
      tip: 'מתחת לכפתורים אלו מופיע גם פס הגלילה האנכי (Timeline Scroller) המציג באיזה פוסט אתם נמצאים' 
    },
    { 
      id: 2, 
      title: 'בחירת "במעקב" בתפריט ההתראות', 
      instruction: 'פתחו את תפריט המעקב ובחרו ב-"במעקב" (עדכנו אותי על תגובות חדשות והציגו ברשימת לא נקראו)', 
      targetKey: 'watchOption', 
      tip: 'קיימות 3 אפשרויות ב-NodeBB: "במעקב", "לא במעקב" ו-"התעלמות"' 
    },
    { 
      id: 3, 
      title: 'פעמון ההתראות בסרגל השמאלי הקיצוני', 
      instruction: 'כאשר מתפרסמת תגובה חדשה, תופיע התראה כחולה בפעמון ההתראות בסרגל הצד השמאלי של האתר', 
      targetKey: 'sidebarNotifications', 
      tip: 'ב-NodeBB Harmony סרגל המשתמש, החיפוש, ההתראות והצ׳אטים נמצא תמיד בעמודה האנכית השמאלית' 
    },
  ],
  'user-info': [
    { 
      id: 1, 
      title: 'שורת הכותב ותג הקבוצה בראש הפוסט', 
      instruction: 'ב-NodeBB Harmony פרטי הכותב מופיעים בראש כל פוסט: אווטאר עגול (48px) עם נקודת חיבור ירוקה, שם משתמש ותג קבוצה', 
      targetKey: 'userBadge', 
      tip: 'ברכוסניק מופיעים תגי קבוצות רשמיים כגון "בעלי עסקים" (בירוק עם סמל כרטיס) לצד מועד הכתיבה' 
    },
    { 
      id: 2, 
      title: 'הצבעת מוניטין חיובי (👍) ייחודית לרכוסניק', 
      instruction: 'בתחתית הפוסט לחצו על כפתור ה-👍 כדי להעניק מוניטין לכותב. הכפתור יהפוך מאפור לצבעוני ויעלה את המונה!', 
      targetKey: 'btnUpvote', 
      tip: 'כל הצבעה חיובית לפוסט מועיל מעלה את דירוג המוניטין הכולל של אותו משתמש בפורום' 
    },
    { 
      id: 3, 
      title: 'מעבר לדף הפרופיל של המשתמש', 
      instruction: 'לחיצה על שם המשתמש ("מידע רכסים") או על האווטאר שלו מובילה לדף הפרופיל המלא שלו ב-NodeBB', 
      targetKey: 'userName', 
      tip: 'ניתן גם לתייג כל משתמש בפוסט באמצעות הקלדת @ ושם המשתמש שלו' 
    },
    { 
      id: 4, 
      title: 'דף הפרופיל והמוניטין ב-NodeBB Harmony', 
      instruction: 'בדף הפרופיל מוצגים תמונת הנושא, האווטאר הגדול, כפתורי מעקב וצ׳אט, וקוביות הסטטיסטיקה: מוניטין, צפיות ופוסטים', 
      targetKey: 'profileReputationCard', 
      tip: 'תפריט הצד הימני בפרופיל מאפשר לעבור בין כל הפוסטים, הנושאים, הקבוצות והעוקבים של המשתמש' 
    },
  ],
};

interface CategoryTopicItem {
  tid: number;
  title: string;
  author: string;
  avatarText: string;
  avatarBg: string;
  timeago: string;
  votes: number;
  posts: number;
  views: string;
  teaserUser: string;
  teaserAvatarText: string;
  teaserAvatarBg: string;
  teaserTime: string;
  teaserText: string;
  isNew?: boolean;
}

const INITIAL_CATEGORY_TOPICS: CategoryTopicItem[] = [
  {
    tid: 235,
    title: 'טראמפיאדה קהילתית',
    author: 'מ דוד',
    avatarText: 'מ',
    avatarBg: '#827717',
    timeago: 'לפני 3 שעות',
    votes: 7,
    posts: 5,
    views: '507',
    teaserUser: 'ינון ואילה כהן',
    teaserAvatarText: 'י',
    teaserAvatarBg: '#00897b',
    teaserTime: 'לפני 25 דקות',
    teaserText: 'יוזמה מבורכת מאוד לתושבי רכסים! אשמח להצטרף לקבוצה.'
  },
  {
    tid: 392,
    title: 'האם השמועות שקו 12 מיום ראשון נכנס לשכונת הפרסה נכונות???',
    author: 'רוצה לעזור',
    avatarText: 'ר',
    avatarBg: '#3f51b5',
    timeago: 'לפני 5 שעות',
    votes: 2,
    posts: 21,
    views: '391',
    teaserUser: 'חצקל',
    teaserAvatarText: 'ח',
    teaserAvatarBg: '#f44336',
    teaserTime: 'לפני שעה',
    teaserText: 'זה יאריך את הדרך! לא הגיע הזמן לעשות קו לכל שכונה?'
  },
  {
    tid: 378,
    title: 'יש כאן סנג\'ר למשלוחים, קניות וכו\'?',
    author: 'תומר אהרוני',
    avatarText: 'ת',
    avatarBg: '#ad1457',
    timeago: 'לפני יום',
    votes: 3,
    posts: 6,
    views: '195',
    teaserUser: 'רוצה לעזור',
    teaserAvatarText: 'ר',
    teaserAvatarBg: '#3f51b5',
    teaserTime: 'לפני 4 שעות',
    teaserText: 'שלחתי לך בפרטי מספר של בחור אמין שעושה משלוחים בתוך היישוב.'
  },
];

const ForumSimulator: React.FC<ForumSimulatorProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetsRef = useRef<{ [key: string]: HTMLElement | null }>({});

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);
  const [cursorLabel, setCursorLabel] = useState<string>('');

  // NodeBB Harmony UI states
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'category' | 'topic' | 'profile'>(
    mode === 'create' ? 'category' : 'topic'
  );
  const [watchState, setWatchState] = useState<'watching' | 'not-watching' | 'ignoring'>('not-watching');
  const [isWatchMenuOpen, setIsWatchMenuOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [tagsInput, setTagsInput] = useState<string>('');
  const [upvotes, setUpvotes] = useState<number>(11);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);

  const steps = STEPS_BY_MODE[mode];

  const [simState, setSimState] = useState<SimulationState>({
    step: 1,
    instruction: steps[0].instruction,
    tip: steps[0].tip,
    isComposerOpen: false,
    title: '',
    body: '',
    category: 'איש את רעהו יעזורו',
    isSubmitted: false,
    cursorPos: { x: 420, y: 200 },
    isClicking: false,
    activeTool: null,
    targetRect: null,
  });

  // Calculate dynamic element position relative to container
  const getElementPosAndRect = useCallback((key: string): { center: Coordinate; rect: { x: number; y: number; width: number; height: number } | null } => {
    const el = targetsRef.current[key];
    if (!containerRef.current || !el) {
      return {
        center: { x: 450, y: 220 },
        rect: null
      };
    }
    const containerBounds = containerRef.current.getBoundingClientRect();
    const elBounds = el.getBoundingClientRect();

    if (elBounds.width === 0 && elBounds.height === 0) {
      return { center: { x: 450, y: 220 }, rect: null };
    }

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
    requestAnimationFrame(() => {
      const { center, rect } = getElementPosAndRect(targetKey);
      setSimState(prev => ({
        ...prev,
        cursorPos: center,
        targetRect: rect,
      }));
      setCursorLabel(label);
    });
  }, [getElementPosAndRect]);

  const wait = useCallback((ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms / speed));
  }, [speed]);

  // Reset view when mode prop changes
  useEffect(() => {
    setIsWatchMenuOpen(false);
    setIsNotifOpen(false);
    setUnreadNotifCount(0);
    setHasUpvoted(false);
    setUpvotes(11);
    setActiveView(mode === 'create' ? 'category' : 'topic');
    setIsPlaying(true);
    setIsInteractive(false);
  }, [mode]);

  // Automated Simulation Loop
  useEffect(() => {
    if (isInteractive) return;

    let isCancelled = false;

    const runLoop = async () => {
      while (!isCancelled && isPlaying) {
        if (mode === 'create') {
          setActiveView('category');
          setTagsInput('');
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
          await wait(700);
          if (isCancelled) break;

          // Step 1: Click #new_topic on Category page
          updateTargetPosition('btnNewTopic', 'לחיצה על "נושא חדש"');
          await wait(1700);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ ...p, isClicking: false, isComposerOpen: true }));
          await wait(650);
          if (isCancelled) break;

          // Step 2: Enter Title in NodeBB composer
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('inputTitle', 'הקלדת כותרת הנושא');
          await wait(1300);
          if (isCancelled) break;

          const titleText = 'שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה';
          let currentTitle = '';
          for (const char of titleText) {
            if (isCancelled) break;
            currentTitle += char;
            setSimState(p => ({ ...p, title: currentTitle }));
            await wait(40);
          }
          await wait(700);
          if (isCancelled) break;

          // Step 3: Body editor
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('editor', 'כתיבה בעורך המפוצל');
          await wait(1200);
          if (isCancelled) break;

          const bodyText = 'שלום לחברי קהילת רכוסניק! אנו עורכים שמחת שבע ברכות ביישוב ומחפשים להשאיל 30 כסאות מתקפלים ומיחם לשבת.\n\n';
          let currentBody = '';
          for (const char of bodyText) {
            if (isCancelled) break;
            currentBody += char;
            setSimState(p => ({ ...p, body: currentBody }));
            await wait(30);
          }
          await wait(500);
          if (isCancelled) break;

          // Step 4: Formatting Bold + Tags
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('btnBold', 'לחיצה על B להדגשה');
          await wait(1300);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true, activeTool: 'bold' }));
          await wait(240);
          setSimState(p => ({ ...p, isClicking: false }));

          updateTargetPosition('editor', 'הקלדת טקסט מודגש');
          await wait(500);

          const boldPart = '**נודה מאוד לכל מי שיכול לסייע או להפנות לגמ"ח מתאים!**';
          for (const char of boldPart) {
            if (isCancelled) break;
            currentBody += char;
            setSimState(p => ({ ...p, body: currentBody }));
            await wait(32);
          }
          setTagsInput('גמ"חים, שמחות, רכסים');
          setSimState(p => ({ ...p, activeTool: null }));
          await wait(1600);
          if (isCancelled) break;

          // Step 5: Submit NodeBB composer -> navigates to Topic view
          setSimState(p => ({ ...p, step: 5, instruction: steps[4].instruction, tip: steps[4].tip }));
          updateTargetPosition('btnSubmit', 'שליחה ופרסום ברכוסניק');
          await wait(1500);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false, targetRect: null }));
          setActiveView('topic');

          confetti({
            particleCount: 55,
            spread: 65,
            origin: { y: 0.65 }
          });

          await wait(4500);

        } else if (mode === 'reply') {
          setActiveView('topic');
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
          await wait(700);
          if (isCancelled) break;

          // Step 1: Click Quote button in post-tools
          updateTargetPosition('btnQuote', 'לחיצה על "ציטוט" בפוסט של @חצקל');
          await wait(1700);
          if (isCancelled) break;

          const quotedInit = '@חצקל כתב:\n> זה יאריך את הדרך! לא הגיע הזמן לעשות קו לכל שכונה?\n\n';
          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ 
            ...p, 
            isClicking: false, 
            isComposerOpen: true,
            body: quotedInit
          }));
          await wait(700);
          if (isCancelled) break;

          // Step 2: Show imported quote
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('editor', 'ציטוט אוטומטי בעורך');
          await wait(1600);
          if (isCancelled) break;

          // Step 3: Type Response
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('editor', 'הקלדת התגובה מתחת לציטוט');
          await wait(1000);
          if (isCancelled) break;

          let rBody = quotedInit;
          const answer = 'מסכים לגמרי! הבנתי שפנו לוועדת התחבורה במועצה כדי להוסיף קו ישיר מהפרסה.';
          for (const char of answer) {
            if (isCancelled) break;
            rBody += char;
            setSimState(p => ({ ...p, body: rBody }));
            await wait(35);
          }
          await wait(1500);
          if (isCancelled) break;

          // Step 4: Submit reply
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('btnSubmit', 'שליחת התגובה לשרשור');
          await wait(1500);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(250);
          setSimState(p => ({ ...p, isClicking: false, isSubmitted: true, isComposerOpen: false, targetRect: null }));
          await wait(4200);

        } else if (mode === 'follow') {
          setActiveView('topic');
          setIsWatchMenuOpen(false);
          setIsNotifOpen(false);
          setUnreadNotifCount(0);
          setWatchState('not-watching');
          setSimState(p => ({
            ...p,
            step: 1,
            instruction: steps[0].instruction,
            tip: steps[0].tip,
            isComposerOpen: false,
            isSubmitted: false
          }));
          await wait(900);
          if (isCancelled) break;

          // Step 1: Open watch dropdown in topic-sidebar-tools
          updateTargetPosition('btnWatch', 'פתיחת תפריט מעקב בסרגל השרשור');
          await wait(1700);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ ...p, isClicking: false }));
          setIsWatchMenuOpen(true);
          await wait(800);
          if (isCancelled) break;

          // Step 2: Select 'במעקב'
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('watchOption', 'בחירה ב-"במעקב"');
          await wait(1600);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ ...p, isClicking: false }));
          setIsWatchMenuOpen(false);
          setWatchState('watching');
          setUnreadNotifCount(1);
          await wait(700);
          if (isCancelled) break;

          // Step 3: Click notification bell in left sidebar (sidebar/right)
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('sidebarNotifications', 'פתיחת פעמון ההתראות בסרגל השמאלי');
          await wait(1700);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(220);
          setSimState(p => ({ ...p, isClicking: false }));
          setIsNotifOpen(true);
          await wait(4200);

        } else if (mode === 'user-info') {
          setActiveView('topic');
          setHasUpvoted(false);
          setUpvotes(11);
          setSimState(p => ({ ...p, step: 1, instruction: steps[0].instruction, tip: steps[0].tip, isComposerOpen: false }));
          await wait(700);
          if (isCancelled) break;

          // Step 1: Highlight Post Author Header & Group Badge
          updateTargetPosition('userBadge', 'תג קבוצה רשמי: בעלי עסקים');
          await wait(2600);
          if (isCancelled) break;

          // Step 2: Click custom Rchsnik 👍 Upvote button
          setSimState(p => ({ ...p, step: 2, instruction: steps[1].instruction, tip: steps[1].tip }));
          updateTargetPosition('btnUpvote', 'הצבעה חיובית לפוסט 👍');
          await wait(1800);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(240);
          setSimState(p => ({ ...p, isClicking: false }));
          setHasUpvoted(true);
          setUpvotes(12);
          await wait(1400);
          if (isCancelled) break;

          // Step 3: Click Username to navigate to Harmony Profile Page
          setSimState(p => ({ ...p, step: 3, instruction: steps[2].instruction, tip: steps[2].tip }));
          updateTargetPosition('userName', 'לחיצה על שם המשתמש למעבר לפרופיל');
          await wait(1700);
          if (isCancelled) break;

          setSimState(p => ({ ...p, isClicking: true }));
          await wait(240);
          setSimState(p => ({ ...p, isClicking: false }));
          setActiveView('profile');
          await wait(700);
          if (isCancelled) break;

          // Step 4: Highlight Reputation card on Harmony User Profile page
          setSimState(p => ({ ...p, step: 4, instruction: steps[3].instruction, tip: steps[3].tip }));
          updateTargetPosition('profileReputationCard', 'קוביית המוניטין בדף הפרופיל (645)');
          await wait(4500);
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

    if (mode === 'create') {
      setActiveView('category');
      setSimState(prev => ({
        ...prev,
        step: targetStep.id,
        instruction: targetStep.instruction,
        tip: targetStep.tip,
        isComposerOpen: targetStep.id >= 2,
        isSubmitted: false,
        title: targetStep.id >= 2 ? (prev.title || 'שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה') : '',
        body: targetStep.id >= 3 ? (prev.body || 'שלום לחברי קהילת רכוסניק! אנו מחפשים להשאיל 30 כסאות מתקפלים ומיחם לשבת.\n\n**נודה מאוד לכל המסייעים!**') : '',
      }));
    } else if (mode === 'reply') {
      setActiveView('topic');
      setSimState(prev => ({
        ...prev,
        step: targetStep.id,
        instruction: targetStep.instruction,
        tip: targetStep.tip,
        isComposerOpen: targetStep.id >= 2,
        isSubmitted: false,
        body: targetStep.id >= 2 ? (prev.body || '@חצקל כתב:\n> זה יאריך את הדרך! לא הגיע הזמן לעשות קו לכל שכונה?\n\nמסכים לגמרי! הבנתי שפנו לוועדת התחבורה במועצה.') : '',
      }));
    } else if (mode === 'follow') {
      setActiveView('topic');
      setIsWatchMenuOpen(targetStep.id === 2);
      setIsNotifOpen(targetStep.id === 3);
      if (targetStep.id >= 2) {
        setWatchState('watching');
        setUnreadNotifCount(1);
      }
      setSimState(prev => ({
        ...prev,
        step: targetStep.id,
        instruction: targetStep.instruction,
        tip: targetStep.tip,
        isComposerOpen: false,
      }));
    } else if (mode === 'user-info') {
      setActiveView(targetStep.id === 4 ? 'profile' : 'topic');
      if (targetStep.id >= 2) {
        setHasUpvoted(true);
        setUpvotes(12);
      }
      setSimState(prev => ({
        ...prev,
        step: targetStep.id,
        instruction: targetStep.instruction,
        tip: targetStep.tip,
        isComposerOpen: false,
      }));
    }

    setTimeout(() => {
      updateTargetPosition(targetStep.targetKey, targetStep.title);
    }, 150);
  };

  const handleFormat = (type: 'bold' | 'italic' | 'strikethrough' | 'quote' | 'list' | 'code' | 'link') => {
    if (type === 'bold') {
      setSimState(p => ({ ...p, body: p.body + ' **טקסט מודגש** ' }));
    } else if (type === 'italic') {
      setSimState(p => ({ ...p, body: p.body + ' *טקסט נטוי* ' }));
    } else if (type === 'strikethrough') {
      setSimState(p => ({ ...p, body: p.body + ' ~~טקסט מחוק~~ ' }));
    } else if (type === 'quote') {
      setSimState(p => ({ ...p, body: p.body + '\n> ציטוט כאן\n\n' }));
    } else if (type === 'list') {
      setSimState(p => ({ ...p, body: p.body + '\n- פריט ראשון\n- פריט שני\n' }));
    } else if (type === 'code') {
      setSimState(p => ({ ...p, body: p.body + ' `קוד` ' }));
    } else if (type === 'link') {
      setSimState(p => ({ ...p, body: p.body + ' [קישור](https://rchsnik.com) ' }));
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 font-heebo">
      
      {/* Top Simulator Control Bar */}
      <div className="bg-white border border-[#dee2e6] rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Play/Pause & Replay */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isInteractive && (
            <>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0d6efd] text-white font-bold hover:bg-[#0b5ed7] transition shadow-xs cursor-pointer text-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'השהה הדמיה' : 'המשך הדמיה'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(true);
                  handleJumpToStep(1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-[#dee2e6] text-[#212529] font-semibold hover:bg-[#f8f9fa] transition cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>התחל מחדש</span>
              </button>

              {/* Speed Toggler */}
              <div className="flex items-center bg-[#f8f9fa] rounded-md p-0.5 border border-[#dee2e6]">
                {[1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 text-xs font-bold rounded transition cursor-pointer ${
                      speed === s ? 'bg-white shadow-xs text-[#0d6efd]' : 'text-[#6c757d] hover:text-[#212529]'
                    }`}
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
              const nextInteractive = !isInteractive;
              setIsInteractive(nextInteractive);
              if (nextInteractive) {
                setIsPlaying(false);
                setSimState(p => ({
                  ...p,
                  isComposerOpen: mode === 'create' || mode === 'reply',
                  targetRect: null,
                  instruction: 'מצב התנסות חופשי פעיל: לחצו בעצמכם על כפתורי NodeBB, הקלידו בעורך או עברו בין הקטגוריה, השרשור והפרופיל!'
                }));
              } else {
                setIsPlaying(true);
                handleJumpToStep(1);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition text-xs cursor-pointer ${
              isInteractive 
                ? 'bg-[#198754] text-white shadow-xs ring-2 ring-[#198754]/30' 
                : 'bg-[#fff8e6] text-[#8c6b20] border border-[#d4a373] hover:bg-[#ffefcc]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isInteractive ? 'מצב התנסות חופשי פעיל (לחצו לחזרה להדמיה)' : 'נסו בעצמכם (מצב אינטראקטיבי חי)'}</span>
          </button>
        </div>

        {/* Step Navigation Chips */}
        {!isInteractive && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-xs font-bold text-[#6c757d] ml-1">שלבים:</span>
            {steps.map((st) => (
              <button
                key={st.id}
                onClick={() => handleJumpToStep(st.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  simState.step === st.id
                    ? 'bg-[#0d6efd] text-white shadow-xs'
                    : 'bg-[#f8f9fa] text-[#495057] border border-[#dee2e6] hover:bg-[#e9ecef]'
                }`}
              >
                <span>{st.id}.</span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          AUTHENTIC NodeBB v3 Harmony Viewport (1:1 to https://rchsnik.com/)
         ========================================================================= */}
      <div
        ref={containerRef}
        className="relative w-full bg-white border border-[#dee2e6] rounded-xl shadow-xl overflow-hidden select-none h-[680px] flex flex-col"
      >
        
        {/* Top Instructional Guidance Strip */}
        <div className="relative z-30 bg-[#212529] text-white px-4 py-2.5 shadow-sm border-b border-[#343a40] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-[#0d6efd] text-white font-black flex items-center justify-center text-xs shadow shrink-0">
              {simState.step}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                {simState.instruction}
              </p>
              {simState.tip && (
                <p className="text-[11px] text-[#ffc107] font-medium flex items-center gap-1 mt-0.5">
                  <HelpCircle className="w-3 h-3 text-[#ffc107] inline shrink-0" />
                  <span>{simState.tip}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick View Switcher inside Simulator */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-md text-[11px] shrink-0">
            <button
              onClick={() => { setIsPlaying(false); setActiveView('category'); }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${activeView === 'category' ? 'bg-[#0d6efd] text-white font-bold' : 'text-gray-300 hover:text-white'}`}
            >
              דף קטגוריה
            </button>
            <button
              onClick={() => { setIsPlaying(false); setActiveView('topic'); }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${activeView === 'topic' ? 'bg-[#0d6efd] text-white font-bold' : 'text-gray-300 hover:text-white'}`}
            >
              דף שרשור
            </button>
            <button
              onClick={() => { setIsPlaying(false); setActiveView('profile'); }}
              className={`px-2 py-0.5 rounded cursor-pointer transition ${activeView === 'profile' ? 'bg-[#0d6efd] text-white font-bold' : 'text-gray-300 hover:text-white'}`}
            >
              דף פרופיל
            </button>
          </div>
        </div>

        {/* =====================================================================
            NodeBB Harmony `div.layout-container.d-flex.justify-content-between`
            In RTL:
            1st child = `nav[component="sidebar/left"]` (on the RIGHT)
            2nd child = `main#panel` (in the CENTER)
            3rd child = `nav[component="sidebar/right"]` (on the LEFT)
           ===================================================================== */}
        <div className="layout-container flex justify-between flex-1 overflow-hidden relative bg-white">
          
          {/* 1. RIGHT SIDEBAR (`nav[component="sidebar/left"]` in RTL) */}
          <nav
            component="sidebar/left"
            className={`${
              leftSidebarExpanded ? 'w-48' : 'w-12'
            } bg-[#f8f9fa] text-[#212529] border-l border-[#dee2e6] flex flex-col justify-between shrink-0 transition-all duration-200 z-20 select-none`}
          >
            {/* #main-nav */}
            <ul id="main-nav" className="flex flex-col w-full gap-1 mt-2 px-1.5">
              {[
                { icon: 'fa-house fa-solid', label: 'דף הבית', view: 'category' as const },
                { icon: 'fa-list fa-solid', label: 'קטגוריות', view: 'category' as const, active: activeView === 'category' },
                { icon: 'fa-gavel fa-solid', label: 'חוקי הפורום', view: 'topic' as const },
                { icon: 'fa-clock fa-solid', label: 'פוסטים אחרונים', view: 'topic' as const, active: activeView === 'topic' },
                { icon: 'fa-fire fa-solid', label: 'פופולרי', view: 'topic' as const },
                { icon: 'fa-building fa-solid', label: 'לוח דירות', view: 'category' as const },
                { icon: 'fa-envelope fa-solid', label: 'צור קשר', view: 'category' as const },
              ].map((item, idx) => (
                <li key={idx} title={item.label}>
                  <button
                    onClick={() => setActiveView(item.view)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded text-xs font-semibold transition cursor-pointer ${
                      item.active 
                        ? 'bg-[#e9ecef] text-[#0d6efd]' 
                        : 'text-[#495057] hover:bg-[#e9ecef] hover:text-[#212529]'
                    }`}
                  >
                    <i className={`fa fa-fw ${item.icon} text-sm shrink-0 mx-auto ${leftSidebarExpanded ? 'mx-0' : ''}`}></i>
                    {leftSidebarExpanded && <span className="truncate">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>

            {/* Bottom sidebar-toggle-container (`skinSwitcher` + `sidebar/toggle`) */}
            <div className="flex flex-col gap-1 p-1.5 border-t border-[#dee2e6]">
              <button
                title="ערכות עיצוב"
                className="w-full flex items-center gap-2.5 p-2 rounded text-xs font-semibold text-[#495057] hover:bg-[#e9ecef] cursor-pointer"
              >
                <i className={`fa fa-fw fa-paintbrush text-sm shrink-0 ${leftSidebarExpanded ? '' : 'mx-auto'}`}></i>
                {leftSidebarExpanded && <span>ערכות עיצוב</span>}
              </button>
              <button
                onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
                title={leftSidebarExpanded ? 'צמצום' : 'הרחבה'}
                className="w-full flex items-center gap-2.5 p-2 rounded text-xs font-semibold text-[#495057] hover:bg-[#e9ecef] cursor-pointer"
              >
                <i className={`fa fa-fw ${leftSidebarExpanded ? 'fa-angles-right' : 'fa-angles-left'} text-sm shrink-0 ${leftSidebarExpanded ? '' : 'mx-auto'}`}></i>
                {leftSidebarExpanded && <span>צמצום</span>}
              </button>
            </div>
          </nav>

          {/* 2. CENTER MAIN PANEL (`main#panel`) */}
          <main
            id="panel"
            className={`flex-1 flex flex-col overflow-y-auto bg-white transition-all duration-300 ${
              simState.isComposerOpen ? 'pb-[360px]' : ''
            }`}
          >
            {/* `.brand-container` at the top of `main#panel` */}
            <div className="px-4 md:px-6 pt-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dee2e6] pb-2.5">
                {/* `[component="brand/wrapper"]` */}
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://rchsnik.com/assets/uploads/system/site-logo.png"
                    alt="פורום רכוסניק"
                    className="h-11 w-auto object-contain cursor-pointer"
                    onClick={() => setActiveView('category')}
                  />
                </div>

                {/* `data-widget-area="brand-header"` — Official Rchsnik Useful Links Pills */}
                <div className="hidden xl:flex items-center gap-1.5 flex-wrap">
                  {[
                    { icon: 'fa-store', label: 'פרסום עסקים' },
                    { icon: 'fa-newspaper', label: "חדשות 'מידע רכסים'" },
                    { icon: 'fa-address-book', label: 'אינדקס הגמ"חים' },
                    { icon: 'fa-home', label: 'לוח דירות' },
                  ].map((pill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-3 py-1 text-[11px] font-semibold shadow-2xs hover:border-[#caa34b] hover:text-[#caa34b] transition cursor-pointer"
                    >
                      <i className={`fas ${pill.icon} text-[10px]`}></i>
                      <span>{pill.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* `#content.container-lg` */}
            <div id="content" className="px-4 md:px-6 py-3 flex-1 flex flex-col gap-3">
              
              {/* ===============================================================
                  VIEW 1: AUTHENTIC NodeBB Harmony Category View (`category.tpl`)
                 =============================================================== */}
              {activeView === 'category' && (
                <>
                  {/* `<ol class="breadcrumb mb-0">` with `←` separator */}
                  <ol className="flex items-center flex-wrap text-xs font-semibold text-[#6c757d] mb-0">
                    <li className="harmony-breadcrumb-item hover:underline cursor-pointer">דף הבית</li>
                    <li className="harmony-breadcrumb-item hover:underline cursor-pointer">קטגוריות</li>
                    <li className="harmony-breadcrumb-item hover:underline cursor-pointer">קהילה וחיי היום יום</li>
                    <li className="harmony-breadcrumb-item text-[#212529] font-bold">איש את רעהו יעזורו</li>
                  </ol>

                  {/* `.category-header` */}
                  <div className="category-header flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      {/* `buildCategoryIcon(@value, "60px", "rounded-1 flex-shrink-0")` */}
                      <div
                        className="w-[56px] h-[56px] rounded flex items-center justify-center text-white text-xl shrink-0 shadow-2xs"
                        style={{ backgroundColor: '#DC9656' }}
                      >
                        <i className="fa-solid fa-right-left"></i>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h1 className="tracking-tight text-xl font-semibold text-[#212529] mb-0">
                          איש את רעהו יעזורו
                        </h1>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                            <b className="font-bold">161</b> נושאים
                          </span>
                          <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                            <b className="font-bold">851</b> פוסטים
                          </span>
                          <span className="px-1.5 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#6c757d]">
                            <i className="fa fa-rss"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#6c757d] leading-snug">
                      חסד וסיוע זה הוא א.ב של יישוב מוצלח, צריכים משהו? נתקעתם? כתבו כאן! המידע יגיע במהירות!
                    </p>
                  </div>

                  {/* `.sticky-tools` -> `nav.topic-main-buttons` */}
                  <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded p-1.5 flex items-center justify-between gap-2">
                    {/* Right side: `component="category/controls"` */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button className="harmony-btn-ghost px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                        <i className="fa fa-fw fa-clock-o text-[#0d6efd]"></i>
                        <span>לא עוקב</span>
                        <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                      </button>
                      <button className="harmony-btn-ghost px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                        <i className="fa fa-fw fa-tags text-[#0d6efd]"></i>
                        <span className="hidden sm:inline">כל התגים</span>
                        <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                      </button>
                      <button className="harmony-btn-ghost px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                        <i className="fa fa-fw fa-arrow-down-wide-short text-[#0d6efd]"></i>
                        <span className="hidden sm:inline">פורסם לאחרונה</span>
                        <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                      </button>
                    </div>

                    {/* Left side: `id="new_topic" component="category/post"` */}
                    <button
                      id="new_topic"
                      ref={el => { targetsRef.current['btnNewTopic'] = el; }}
                      onClick={() => setSimState(p => ({ ...p, isComposerOpen: true, isSubmitted: false }))}
                      className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-semibold px-3.5 py-1.5 rounded transition cursor-pointer shadow-2xs"
                    >
                      נושא חדש
                    </button>
                  </div>

                  {/* `<ul component="category" class="topics-list list-unstyled">` */}
                  <ul className="divide-y divide-[#dee2e6] border-t border-b border-[#dee2e6]">
                    {INITIAL_CATEGORY_TOPICS.map((t) => (
                      <li
                        key={t.tid}
                        onClick={() => setActiveView('topic')}
                        className="py-3 px-2 hover:bg-[#f8f9fa] transition flex items-center justify-between gap-3 cursor-pointer"
                      >
                        {/* Col 1: Avatar + Title + Author/Time (`col-lg-6`) */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-base shrink-0"
                            style={{ backgroundColor: t.avatarBg }}
                          >
                            {t.avatarText}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-[#212529] hover:text-[#0d6efd] truncate mb-1">
                              {t.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#6c757d] flex-wrap">
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px] font-semibold text-white"
                                style={{ backgroundColor: '#DC9656' }}
                              >
                                איש את רעהו יעזורו
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-[#495057]">{t.author}</span>
                              <span>פורסם {t.timeago}</span>
                            </div>
                          </div>
                        </div>

                        {/* Col 2: 3 Harmony Stat Boxes (`הצבעות`, `פוסטים`, `צפיות`) */}
                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded px-2.5 py-1 flex flex-col items-center min-w-[52px]">
                            <span className="text-sm font-semibold text-[#212529] leading-none">{t.votes}</span>
                            <span className="text-[10px] text-[#6c757d] mt-0.5">הצבעות</span>
                          </div>
                          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded px-2.5 py-1 flex flex-col items-center min-w-[52px]">
                            <span className="text-sm font-semibold text-[#212529] leading-none">{t.posts}</span>
                            <span className="text-[10px] text-[#6c757d] mt-0.5">פוסטים</span>
                          </div>
                          <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded px-2.5 py-1 flex flex-col items-center min-w-[52px]">
                            <span className="text-sm font-semibold text-[#212529] leading-none">{t.views}</span>
                            <span className="text-[10px] text-[#6c757d] mt-0.5">צפיות</span>
                          </div>
                        </div>

                        {/* Col 3: `component="topic/teaser"` with right border `#DC9656` */}
                        <div
                          className="hidden md:flex flex-col justify-center pr-3 border-r-2 w-56 shrink-0 text-xs"
                          style={{ borderColor: '#DC9656' }}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className="w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                              style={{ backgroundColor: t.teaserAvatarBg }}
                            >
                              {t.teaserAvatarText}
                            </span>
                            <span className="font-semibold text-[#495057] text-[11px]">{t.teaserUser}</span>
                            <span className="text-[10px] text-[#6c757d]">{t.teaserTime}</span>
                          </div>
                          <p className="text-[11px] text-[#6c757d] truncate">{t.teaserText}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ===============================================================
                  VIEW 2: AUTHENTIC NodeBB Harmony Topic View (`topic.tpl`)
                 =============================================================== */}
              {activeView === 'topic' && (
                <>
                  {/* Breadcrumbs */}
                  <ol className="flex items-center flex-wrap text-xs font-semibold text-[#6c757d] mb-0">
                    <li onClick={() => setActiveView('category')} className="harmony-breadcrumb-item hover:underline cursor-pointer">דף הבית</li>
                    <li onClick={() => setActiveView('category')} className="harmony-breadcrumb-item hover:underline cursor-pointer">קטגוריות</li>
                    <li onClick={() => setActiveView('category')} className="harmony-breadcrumb-item hover:underline cursor-pointer">
                      {mode === 'user-info' ? 'מידע רכסים' : 'איש את רעהו יעזורו'}
                    </li>
                    <li className="harmony-breadcrumb-item text-[#212529] font-bold truncate max-w-xs">
                      {mode === 'create' && simState.isSubmitted
                        ? (simState.title || 'שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה')
                        : mode === 'user-info'
                        ? "חדשות 'מידע רכסים' עדכונים ומידע על הנעשה ביישוב - מתעדכן."
                        : 'האם השמועות שקו 12 מיום ראשון נכנס לשכונת הפרסה נכונות???'}
                    </li>
                  </ol>

                  {/* Topic Title & `.topic-info` */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-[#dee2e6]">
                    <h1 component="post/header" className="tracking-tight font-semibold text-lg md:text-xl text-[#212529] mb-0">
                      {mode === 'create' && simState.isSubmitted
                        ? (simState.title || 'שאלה לגבי השאלת ציוד שמחות ברכסים לשבת הקרובה')
                        : mode === 'user-info'
                        ? "חדשות 'מידע רכסים' עדכונים ומידע על הנעשה ביישוב - מתעדכן."
                        : 'האם השמועות שקו 12 מיום ראשון נכנס לשכונת הפרסה נכונות???'}
                    </h1>

                    <div className="topic-info flex items-center gap-1.5 flex-wrap text-xs">
                      {/* Category Badge */}
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                        style={{ backgroundColor: mode === 'user-info' ? '#810ecd' : '#DC9656' }}
                      >
                        {mode === 'user-info' ? 'מידע רכסים' : 'איש את רעהו יעזורו'}
                      </span>

                      {/* Tags (`component="topic/tags"`) */}
                      <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#495057] bg-[#f8f9fa]">
                        רכוסניק
                      </span>
                      <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#495057] bg-[#f8f9fa]">
                        {mode === 'user-info' ? 'חדשות רכסים' : 'גמ"חים וקהילה'}
                      </span>

                      {/* `component="topic/stats"` */}
                      <div className="flex items-center gap-1.5 mr-1">
                        <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                          <b className="font-bold">{simState.isSubmitted ? 3 : 2}</b> פוסטים
                        </span>
                        <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                          <b className="font-bold">2</b> כותבים
                        </span>
                        <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                          <b className="font-bold">391</b> צפיות
                        </span>
                        <span className="px-2 py-0.5 rounded border border-[#dee2e6] text-[11px] text-[#212529]">
                          <b className="font-bold">{watchState === 'watching' ? 5 : 4}</b> עוקבים
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Harmony Topic Body: Posts Stream (Right) + `topic-sidebar-tools` (Left) */}
                  <div className="flex gap-5 items-start flex-1">
                    
                    {/* Posts Stream (`<ul component="topic" class="posts timeline">`) */}
                    <ul className="flex-1 flex flex-col gap-4 min-w-0">
                      
                      {/* If Mode === 'create' and submitted, show the newly created topic OP post */}
                      {mode === 'create' && simState.isSubmitted ? (
                        <li component="post" className="bg-[#f8fbff] p-3 rounded border border-[#b6d4fe]">
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div className="w-11 h-11 rounded-full bg-[#f44336] text-white font-bold flex items-center justify-center text-base">
                                ח
                              </div>
                              <span className="w-3 h-3 rounded-full bg-[#198754] border-2 border-white absolute bottom-0 left-0" title="מחובר"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-[#212529]">חצקל</span>
                                  <span className="text-xs text-[#6c757d]">כתב ב זה עתה</span>
                                  <span className="text-[11px] font-bold text-[#198754] bg-[#d1e7dd] px-2 py-0.5 rounded">
                                    הנושא החדש פורסם בהצלחה ✓
                                  </span>
                                </div>
                                <span className="text-xs text-[#6c757d]">#1</span>
                              </div>
                              <MarkdownRenderer text={simState.body} />
                            </div>
                          </div>
                        </li>
                      ) : (
                        <>
                          {/* POST #1: `מידע רכסים` (with `בעלי עסקים` badge) or `רוצה לעזור` */}
                          <li component="post" className="pt-1">
                            <div className="flex items-start gap-3">
                              {/* 48px circular avatar + status dot */}
                              <div className="relative shrink-0">
                                <div
                                  ref={el => { targetsRef.current['userAvatar'] = el; }}
                                  onClick={() => setActiveView('profile')}
                                  className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-base cursor-pointer shadow-2xs"
                                  style={{ backgroundColor: mode === 'user-info' ? '#e65100' : '#3f51b5' }}
                                  title="מעבר לדף הפרופיל"
                                >
                                  {mode === 'user-info' ? 'מ' : 'ר'}
                                </div>
                                <span
                                  className="w-3 h-3 rounded-full bg-[#198754] border-2 border-white absolute bottom-0 left-0"
                                  title="מחובר"
                                ></span>
                              </div>

                              {/* `.post-container` */}
                              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                {/* `.post-header` */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                      ref={el => { targetsRef.current['userName'] = el; }}
                                      onClick={() => setActiveView('profile')}
                                      className="font-bold text-sm text-[#212529] hover:underline cursor-pointer"
                                    >
                                      {mode === 'user-info' ? 'מידע רכסים' : 'רוצה לעזור'}
                                    </button>

                                    {/* Real Rchsnik Group Badge (`#39a74f`, `fa-credit-card`, `בעלי עסקים`) */}
                                    <span
                                      ref={el => { targetsRef.current['userBadge'] = el; }}
                                      onClick={() => setActiveView('profile')}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-bold text-white uppercase cursor-pointer"
                                      style={{ backgroundColor: '#39a74f' }}
                                    >
                                      <i className="fa fa-credit-card fa-solid text-[9px]"></i>
                                      <span>בעלי עסקים</span>
                                    </span>

                                    <span className="text-xs text-[#6c757d]">כתב ב לפני 3 שעות</span>
                                    <i className="fa fa-edit text-xs text-[#6c757d]" title="נערך"></i>
                                  </div>

                                  <span className="text-xs text-[#6c757d]">#1</span>
                                </div>

                                {/* `.content` */}
                                <div className="text-sm text-[#212529] leading-relaxed py-1">
                                  {mode === 'user-info' ? (
                                    <p>
                                      בקטגוריה זו יעלו חדשות ועדכונים חשובים מהיישוב ע"י המשתמש{' '}
                                      <span className="text-[#0d6efd] font-semibold">@מידע-רכסים</span>.
                                      <br />
                                      אם המידע סייע לכם, ניתן ללחוץ על כפתור ה-👍 בתחתית הפוסט לחיזוק המוניטין!
                                    </p>
                                  ) : (
                                    <p>
                                      שלום לתושבים, האם השמועות שקו 12 מיום ראשון הקרוב נכנס לתוך שכונת הפרסה נכונות? נשמח למידע מדויק.
                                    </p>
                                  )}
                                </div>

                                {/* `.post-footer.border-bottom.pb-2` */}
                                <div className="post-footer border-b border-[#dee2e6] pb-2 flex items-center justify-between gap-2">
                                  {/* Right: `component="post/reply-count"` */}
                                  <button className="harmony-btn-ghost border border-[#dee2e6] rounded px-2 py-0.5 text-[11px] text-[#6c757d] font-semibold flex items-center gap-1.5 cursor-pointer">
                                    <span className="w-4 h-4 rounded-full bg-[#f44336] text-white text-[9px] font-bold flex items-center justify-center">
                                      ח
                                    </span>
                                    <span>תגובה 1</span>
                                    <i className="fa fa-chevron-down text-[9px]"></i>
                                  </button>

                                  {/* Left: `component="post/actions" .post-tools` */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setSimState(p => ({ ...p, isComposerOpen: true }))}
                                      className="harmony-btn-ghost px-2 py-1 rounded text-xs cursor-pointer"
                                      title="תגובה"
                                    >
                                      <i className="fa fa-fw fa-reply text-[#0d6efd]"></i>
                                    </button>
                                    <button
                                      onClick={() => setSimState(p => ({ ...p, isComposerOpen: true }))}
                                      className="harmony-btn-ghost px-2 py-1 rounded text-xs cursor-pointer"
                                      title="ציטוט"
                                    >
                                      <i className="fa fa-fw fa-quote-right text-[#0d6efd]"></i>
                                    </button>

                                    {/* `.votes` with Rchsnik custom grayscale/color 👍 and 👎 */}
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        ref={el => { targetsRef.current['btnUpvote'] = el; }}
                                        onClick={() => {
                                          const next = !hasUpvoted;
                                          setHasUpvoted(next);
                                          setUpvotes(next ? 12 : 11);
                                        }}
                                        className="harmony-btn-ghost px-1.5 py-1 rounded cursor-pointer"
                                        title="הצבעה לפוסט"
                                      >
                                        <span className={`rchsnik-vote-emoji ${hasUpvoted ? 'active' : ''}`}>👍</span>
                                      </button>
                                      <span className="px-1.5 text-xs font-bold text-[#212529]" title="מצביעים">
                                        {upvotes}
                                      </span>
                                      <button className="harmony-btn-ghost px-1.5 py-1 rounded cursor-pointer" title="הצבעה נגד פוסט">
                                        <span className="rchsnik-vote-emoji">👎</span>
                                      </button>
                                    </div>

                                    <button className="harmony-btn-ghost px-1.5 py-1 rounded text-xs cursor-pointer" title="כלי פוסט">
                                      <i className="fa fa-fw fa-ellipsis-v text-[#0d6efd]"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>

                          {/* POST #2: `חצקל` */}
                          <li component="post" className="pt-1">
                            <div className="flex items-start gap-3">
                              <div className="relative shrink-0">
                                <div className="w-11 h-11 rounded-full bg-[#f44336] text-white font-bold flex items-center justify-center text-base">
                                  ח
                                </div>
                                <span className="w-3 h-3 rounded-full bg-[#198754] border-2 border-white absolute bottom-0 left-0"></span>
                              </div>

                              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-sm text-[#212529]">חצקל</span>
                                    <span className="text-xs text-[#6c757d]">כתב ב לפני שעה</span>
                                  </div>
                                  <span className="text-xs text-[#6c757d]">#2</span>
                                </div>

                                <div className="text-sm text-[#212529] leading-relaxed py-1">
                                  זה יאריך את הדרך! לא הגיע הזמן לעשות קו לכל שכונה?
                                </div>

                                <div className="post-footer border-b border-[#dee2e6] pb-2 flex items-center justify-end gap-1">
                                  <button
                                    ref={el => { targetsRef.current['btnReply'] = el; }}
                                    onClick={() => setSimState(p => ({ ...p, isComposerOpen: true }))}
                                    className="harmony-btn-ghost px-2 py-1 rounded text-xs cursor-pointer"
                                    title="תגובה"
                                  >
                                    <i className="fa fa-fw fa-reply text-[#0d6efd]"></i>
                                  </button>
                                  <button
                                    ref={el => { targetsRef.current['btnQuote'] = el; }}
                                    onClick={() =>
                                      setSimState(p => ({
                                        ...p,
                                        isComposerOpen: true,
                                        body: '@חצקל כתב:\n> זה יאריך את הדרך! לא הגיע הזמן לעשות קו לכל שכונה?\n\n',
                                      }))
                                    }
                                    className="harmony-btn-ghost px-2 py-1 rounded text-xs cursor-pointer"
                                    title="ציטוט"
                                  >
                                    <i className="fa fa-fw fa-quote-right text-[#0d6efd]"></i>
                                  </button>
                                  <div className="flex items-center gap-0.5">
                                    <button className="harmony-btn-ghost px-1.5 py-1 rounded cursor-pointer">
                                      <span className="rchsnik-vote-emoji">👍</span>
                                    </button>
                                    <span className="px-1 text-xs font-semibold text-[#212529]">3</span>
                                    <button className="harmony-btn-ghost px-1.5 py-1 rounded cursor-pointer">
                                      <span className="rchsnik-vote-emoji">👎</span>
                                    </button>
                                  </div>
                                  <button className="harmony-btn-ghost px-1.5 py-1 rounded text-xs cursor-pointer">
                                    <i className="fa fa-fw fa-ellipsis-v text-[#0d6efd]"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>

                          {/* POST #3: Newly submitted reply in Reply mode */}
                          {mode === 'reply' && simState.isSubmitted && (
                            <li component="post" className="pt-2 bg-[#f8fbff] p-3 rounded border border-[#b6d4fe] animate-in fade-in duration-300">
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-full bg-[#00897b] text-white font-bold flex items-center justify-center text-base shrink-0">
                                  י
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-[#212529]">ינון כהן</span>
                                      <span className="text-xs text-[#6c757d]">כתב ב זה עתה</span>
                                    </div>
                                    <span className="text-xs text-[#0d6efd] font-bold">#3</span>
                                  </div>
                                  <MarkdownRenderer text={simState.body} />
                                </div>
                              </div>
                            </li>
                          )}
                        </>
                      )}
                    </ul>

                    {/* ===========================================================
                        LEFT STICKY COLUMN: `div.topic-sidebar-tools` (`width: 170px`)
                        Exact NodeBB Harmony Topic Sidebar Tools + Scroller
                       =========================================================== */}
                    <div className="hidden md:flex flex-col gap-2.5 w-[170px] shrink-0 sticky top-2">
                      
                      {/* 1. Split Primary Reply Button (`component="topic/reply/container"`) */}
                      <div className="flex w-full rounded overflow-hidden shadow-2xs">
                        <button
                          onClick={() => setSimState(p => ({ ...p, isComposerOpen: true }))}
                          className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-semibold px-3 py-1.5 flex-1 flex items-center gap-2 cursor-pointer"
                        >
                          <i className="fa fa-fw fa-reply"></i>
                          <span>תגובה</span>
                        </button>
                        <button className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs px-2 py-1.5 border-r border-white/25 cursor-pointer">
                          <i className="fa fa-caret-down"></i>
                        </button>
                      </div>

                      {/* 2. `component="topic/mark-unread"` */}
                      <button className="harmony-btn-ghost w-full px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-2 text-right cursor-pointer">
                        <i className="fa fa-fw fa-inbox text-[#0d6efd]"></i>
                        <span>סימון כלא נקרא</span>
                      </button>

                      {/* 3. `component="topic/watch"` Dropdown */}
                      <div className="relative w-full" component="topic/watch">
                        <button
                          ref={el => { targetsRef.current['btnWatch'] = el; }}
                          onClick={() => setIsWatchMenuOpen(!isWatchMenuOpen)}
                          className="harmony-btn-ghost w-full px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer border border-transparent hover:border-[#dee2e6]"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <i
                              className={`fa fa-fw ${
                                watchState === 'watching'
                                  ? 'fa-bell-o'
                                  : watchState === 'not-watching'
                                  ? 'fa-bell-slash-o'
                                  : 'fa-eye-slash'
                              } text-[#0d6efd]`}
                            ></i>
                            <span ref={el => { targetsRef.current['watchStatusBadge'] = el; }}>
                              {watchState === 'watching'
                                ? 'במעקב'
                                : watchState === 'not-watching'
                                ? 'לא במעקב'
                                : 'התעלמות'}
                            </span>
                          </span>
                          <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                        </button>

                        {/* Exact NodeBB Harmony Watch Dropdown Menu (`he/topic.json`) */}
                        {isWatchMenuOpen && (
                          <ul className="absolute left-0 top-full mt-1 w-64 bg-white border border-[#dee2e6] rounded-md shadow-xl p-1 z-50 text-right">
                            <li>
                              <button
                                ref={el => { targetsRef.current['watchOption'] = el; }}
                                onClick={() => {
                                  setWatchState('watching');
                                  setIsWatchMenuOpen(false);
                                  setUnreadNotifCount(1);
                                }}
                                className="w-full rounded p-2 hover:bg-[#f8f9fa] flex items-center justify-between gap-2 text-right cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-2 text-xs font-bold text-[#212529]">
                                    <i className="fa fa-fw fa-bell-o text-[#6c757d]"></i>
                                    <span>במעקב</span>
                                  </span>
                                  <span className="text-[11px] text-[#6c757d] leading-tight mt-0.5">
                                    עדכנו אותי על תגובות חדשות. הצגת נושא ברשימת לא נקראו.
                                  </span>
                                </div>
                                {watchState === 'watching' && <i className="fa fa-check text-[#0d6efd] text-xs"></i>}
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  setWatchState('not-watching');
                                  setIsWatchMenuOpen(false);
                                }}
                                className="w-full rounded p-2 hover:bg-[#f8f9fa] flex items-center justify-between gap-2 text-right cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-2 text-xs font-bold text-[#212529]">
                                    <i className="fa fa-fw fa-bell-slash-o text-[#6c757d]"></i>
                                    <span>לא במעקב</span>
                                  </span>
                                  <span className="text-[11px] text-[#6c757d] leading-tight mt-0.5">
                                    אל תעדכנו אותי על תגובות חדשות.
                                  </span>
                                </div>
                                {watchState === 'not-watching' && <i className="fa fa-check text-[#0d6efd] text-xs"></i>}
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => {
                                  setWatchState('ignoring');
                                  setIsWatchMenuOpen(false);
                                }}
                                className="w-full rounded p-2 hover:bg-[#f8f9fa] flex items-center justify-between gap-2 text-right cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="flex items-center gap-2 text-xs font-bold text-[#212529]">
                                    <i className="fa fa-fw fa-eye-slash text-[#6c757d]"></i>
                                    <span>התעלמות</span>
                                  </span>
                                  <span className="text-[11px] text-[#6c757d] leading-tight mt-0.5">
                                    אל תציגו את הנושא ברשימת לא נקראו.
                                  </span>
                                </div>
                                {watchState === 'ignoring' && <i className="fa fa-check text-[#0d6efd] text-xs"></i>}
                              </button>
                            </li>
                          </ul>
                        )}
                      </div>

                      {/* 4. `component="thread/sort"` */}
                      <button className="harmony-btn-ghost w-full px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between cursor-pointer">
                        <span className="flex items-center gap-2 truncate">
                          <i className="fa fa-fw fa-arrow-down-wide-short text-[#0d6efd]"></i>
                          <span>מהישן לחדש</span>
                        </span>
                        <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                      </button>

                      <hr className="border-[#dee2e6] my-0.5" />

                      {/* 5. `.pagination-block` — NodeBB Harmony Vertical Timeline Scroller */}
                      <div className="pagination-block flex flex-col items-start gap-1.5 pr-1">
                        <button className="text-[11px] text-[#6c757d] hover:text-[#212529] flex items-center gap-1.5">
                          <i className="fa fa-fw fa-chevron-up"></i>
                          <span>דצמ׳ 2025</span>
                        </button>

                        <div className="flex items-center gap-2.5 py-1 pr-1.5 border-r-2 border-[#e9ecef]">
                          <div className="w-[9px] h-[38px] bg-[#0d6efd] rounded"></div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#212529] leading-none mb-0.5">
                              {simState.isSubmitted ? '3 מתוך 3' : '2 מתוך 2'}
                            </p>
                            <p className="text-[10px] text-[#6c757d] leading-none">אוק׳ 2026</p>
                          </div>
                        </div>

                        <button className="text-[11px] text-[#6c757d] hover:text-[#212529] flex items-center gap-1.5">
                          <i className="fa fa-fw fa-chevron-down"></i>
                          <span>אוק׳ 2026</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </>
              )}

              {/* ===============================================================
                  VIEW 3: AUTHENTIC NodeBB Harmony User Profile (`account/profile.tpl`)
                 =============================================================== */}
              {activeView === 'profile' && (
                <div className="account w-full animate-in fade-in duration-300">
                  {/* `.cover` banner */}
                  <div
                    className="h-28 w-full rounded-t-lg bg-cover bg-center relative"
                    style={{
                      background: 'linear-gradient(120deg, #3e2f1c 0%, #5c4b36 55%, #d4a373 100%)',
                    }}
                  >
                    <button
                      onClick={() => setActiveView('topic')}
                      className="absolute top-2.5 left-2.5 bg-white/90 hover:bg-white text-[#212529] text-xs font-bold px-2.5 py-1 rounded shadow-xs cursor-pointer"
                    >
                      חזרה לשרשור ←
                    </button>
                  </div>

                  {/* Profile Header Row */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 pb-4 mb-4 border-b border-[#dee2e6] px-3">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3">
                      {/* `110px` overlapping `.avatar-wrapper` */}
                      <div className="w-24 h-24 rounded-full bg-white p-1 -mt-12 relative shadow-md">
                        <div className="w-full h-full rounded-full bg-[#e65100] text-white text-3xl font-black flex items-center justify-center">
                          מ
                        </div>
                        <span className="w-4 h-4 rounded-full bg-[#198754] border-2 border-white absolute bottom-1 left-1" title="מחובר"></span>
                      </div>

                      <div className="text-center sm:text-right">
                        <h2 className="text-xl font-bold text-[#212529] tracking-tight mb-0.5">מידע רכסים</h2>
                        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#6c757d]">@מידערכסים</span>
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold text-white uppercase"
                            style={{ backgroundColor: '#39a74f' }}
                          >
                            <i className="fa fa-credit-card fa-solid"></i>
                            <span>בעלי עסקים</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Follow & Chat buttons */}
                    <div className="flex items-center gap-2">
                      <button className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-semibold px-4 py-1.5 rounded cursor-pointer">
                        מעקב
                      </button>
                      <button className="bg-[#f8f9fa] hover:bg-[#e9ecef] border border-[#dee2e6] text-[#212529] text-xs font-semibold px-4 py-1.5 rounded cursor-pointer">
                        צ'אט
                      </button>
                    </div>
                  </div>

                  {/* Two-Column Profile Body: Right Nav + Left `.account-stats` */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Right Profile Menu (`flex-basis-md-200 border-end-md`) */}
                    <div className="w-full md:w-44 border-l border-[#dee2e6] pl-3 flex flex-row md:flex-col gap-1 overflow-x-auto shrink-0">
                      <button className="harmony-btn-ghost bg-[#e9ecef] px-3 py-1.5 rounded text-xs font-bold text-[#212529] text-right">
                        אודות
                      </button>
                      <button className="harmony-btn-ghost px-3 py-1.5 rounded text-xs font-semibold text-[#495057] flex items-center justify-between">
                        <span>פוסטים</span>
                        <span className="text-[11px] text-[#6c757d]">334</span>
                      </button>
                      <button className="harmony-btn-ghost px-3 py-1.5 rounded text-xs font-semibold text-[#495057] flex items-center justify-between">
                        <span>נושאים</span>
                        <span className="text-[11px] text-[#6c757d]">12</span>
                      </button>
                      <button className="harmony-btn-ghost px-3 py-1.5 rounded text-xs font-semibold text-[#495057] flex items-center justify-between">
                        <span>קבוצות</span>
                        <span className="text-[11px] text-[#6c757d]">1</span>
                      </button>
                      <button className="harmony-btn-ghost px-3 py-1.5 rounded text-xs font-semibold text-[#495057] flex items-center justify-between">
                        <span>עוקבים</span>
                        <span className="text-[11px] text-[#6c757d]">27</span>
                      </button>
                    </div>

                    {/* Left `.account-stats` grid (`card card-header p-3 border-0 rounded-1`) */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div
                        ref={el => { targetsRef.current['profileReputationCard'] = el; }}
                        className="bg-[#f8f9fa] border border-[#e9ecef] rounded p-4 flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-xs font-semibold text-[#6c757d] mb-1">מוניטין</span>
                        <span className="text-2xl font-bold text-[#212529]">{hasUpvoted ? 645 : 644}</span>
                      </div>

                      <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-semibold text-[#6c757d] mb-1">צפיות בפרופיל</span>
                        <span className="text-2xl font-bold text-[#212529]">1.2k</span>
                      </div>

                      <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-semibold text-[#6c757d] mb-1">
                          <i className="fa-solid fa-user-plus ml-1 text-[#6c757d]"></i> הצטרף
                        </span>
                        <span className="text-sm font-bold text-[#212529]">דצמ׳ 2025</span>
                      </div>

                      <div className="bg-[#f8f9fa] border border-[#e9ecef] rounded p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-semibold text-[#6c757d] mb-1">
                          <i className="fa-solid fa-clock ml-1 text-[#6c757d]"></i> נראה לאחרונה
                        </span>
                        <span className="text-sm font-bold text-[#198754]">מחובר כעת</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>

          {/* 3. LEFT SIDEBAR (`nav[component="sidebar/right"]` in RTL) */}
          <nav
            component="sidebar/right"
            className="w-12 bg-[#f8f9fa] text-[#212529] border-r border-[#dee2e6] flex flex-col items-center py-2 gap-2 shrink-0 z-20 relative"
          >
            {/* Logged-in User Avatar (`28px`) */}
            <button
              onClick={() => setActiveView('profile')}
              className="relative p-1 rounded hover:bg-[#e9ecef] cursor-pointer"
              title="חצקל (פרופיל אישי)"
            >
              <div className="w-7 h-7 rounded-full bg-[#f44336] text-white text-xs font-bold flex items-center justify-center">
                ח
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#198754] border-2 border-white absolute bottom-0.5 left-0.5"></span>
            </button>

            {/* Search Icon (`component="sidebar/search"`) */}
            <button
              className="w-9 h-9 rounded flex items-center justify-center text-[#495057] hover:bg-[#e9ecef] cursor-pointer"
              title="חיפוש בפורום"
            >
              <i className="fa fa-search fa-fw text-sm"></i>
            </button>

            {/* Notifications Icon (`component="notifications"`) */}
            <div className="relative">
              <button
                ref={el => { targetsRef.current['sidebarNotifications'] = el; }}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="w-9 h-9 rounded flex items-center justify-center text-[#495057] hover:bg-[#e9ecef] cursor-pointer relative"
                title="התראות"
              >
                <i className={`fa fa-fw ${unreadNotifCount > 0 ? 'fa-bell text-[#0d6efd]' : 'fa-bell-o'} text-sm`}></i>
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#0d6efd] text-white text-[9px] font-bold px-1 rounded">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Authentic NodeBB Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute left-full top-0 ml-2 w-72 bg-white border border-[#dee2e6] rounded-md shadow-2xl p-2 z-50 text-right">
                  <div className="flex items-center justify-between border-b border-[#dee2e6] pb-1.5 mb-1.5 text-xs font-bold text-[#212529]">
                    <span>התראות</span>
                    <span className="text-[11px] text-[#0d6efd] cursor-pointer">סימון הכל כנקרא</span>
                  </div>
                  <div className="p-2 rounded bg-[#f0f7ff] border border-[#cfe2ff] flex items-start gap-2.5 text-xs">
                    <span className="w-7 h-7 rounded-full bg-[#f44336] text-white font-bold flex items-center justify-center shrink-0">
                      ח
                    </span>
                    <div>
                      <p className="text-[#212529] leading-snug">
                        <b>חצקל</b> פרסם תגובה חדשה בנושא שעוקבים אחריו: <b>קו 12 לשכונת הפרסה</b>
                      </p>
                      <span className="text-[10px] text-[#6c757d]">זה עתה</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Icon (`component="chat/icon"`) */}
            <button
              className="w-9 h-9 rounded flex items-center justify-center text-[#495057] hover:bg-[#e9ecef] cursor-pointer"
              title="צ'אטים"
            >
              <i className="fa fa-comment-o fa-fw text-sm"></i>
            </button>
          </nav>

        </div>

        {/* =====================================================================
            AUTHENTIC NodeBB Composer (`composer.tpl` on rchsnik.com)
            Exact RTL flex order in `.title-container`:
            1. Right: `.category-list-container` (Category selector)
            2. Middle: `data-component="composer/title"` (Title input)
            3. Left: `.action-bar` (`הסתרה`, `ביטול`, Split Blue `שליחה`)
           ===================================================================== */}
        <div
          component="composer"
          className="absolute bottom-0 left-0 w-full bg-white shadow-[0_-12px_36px_rgba(0,0,0,0.18)] border-t border-[#dee2e6] flex flex-col transition-transform duration-500 z-40"
          style={{
            height: '360px',
            transform: simState.isComposerOpen ? 'translateY(0)' : 'translateY(105%)',
          }}
        >
          {/* `.resizer` handle sticking out at top center (`bottom-100`) */}
          <div className="resizer absolute w-full bottom-full left-0 text-center pointer-events-none">
            <div className="handle inline-block px-3 py-0.5 border border-b-0 border-[#dee2e6] bg-white rounded-t text-xs text-[#6c757d] shadow-2xs">
              <i className="fa-solid fa-arrows-up-down"></i>
            </div>
          </div>

          <div className="p-2.5 flex flex-col gap-1.5 h-full">
            
            {/* 1. `partials/composer-title-container.tpl` */}
            <div className="title-container flex items-center gap-2 shrink-0">
              
              {/* FIRST CHILD (Right side in RTL): Category Selector */}
              {mode === 'create' && (
                <div className="category-list-container hidden sm:block shrink-0">
                  <button className="harmony-btn-ghost border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                    <span
                      className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px]"
                      style={{ backgroundColor: '#DC9656' }}
                    >
                      <i className="fa-solid fa-right-left"></i>
                    </span>
                    <span>איש את רעהו יעזורו</span>
                    <i className="fa fa-caret-down text-[10px] text-[#6c757d]"></i>
                  </button>
                </div>
              )}

              {/* SECOND CHILD (Middle flex-1): Title Input or Replying-To label */}
              <div data-component="composer/title" className="flex-1 min-w-0">
                {mode === 'create' ? (
                  <input
                    ref={el => { targetsRef.current['inputTitle'] = el; }}
                    type="text"
                    placeholder="הכניסו את כותרת הנושא כאן..."
                    value={simState.title}
                    onChange={(e) => setSimState(p => ({ ...p, title: e.target.value }))}
                    readOnly={!isInteractive}
                    className="w-full border border-[#dee2e6] rounded px-3 py-1.5 text-xs font-semibold text-[#212529] placeholder-[#6c757d] focus:border-[#86b7fe] focus:outline-none"
                    dir="rtl"
                  />
                ) : (
                  <span className="text-xs font-semibold text-[#212529] block truncate px-2">
                    תגובה ל"האם השמועות שקו 12 מיום ראשון נכנס לשכונת הפרסה נכונות???"
                  </span>
                )}
              </div>

              {/* THIRD CHILD (Left side in RTL): `.action-bar` (`הסתרה`, `ביטול`, `שליחה`) */}
              <div className="action-bar flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSimState(p => ({ ...p, isComposerOpen: false }))}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#212529] hover:text-[#0d6efd] flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa fa-angle-down"></i>
                  <span className="hidden sm:inline">הסתרה</span>
                </button>

                <button
                  onClick={() => setSimState(p => ({ ...p, isComposerOpen: false, body: '', title: '' }))}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#212529] hover:text-[#dc3545] flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa fa-trash"></i>
                  <span className="hidden sm:inline">ביטול</span>
                </button>

                {/* `component="composer/submit/container"` Split Blue Button */}
                <div className="flex rounded overflow-hidden shadow-2xs">
                  <button
                    ref={el => { targetsRef.current['btnSubmit'] = el; }}
                    onClick={() => {
                      setSimState(p => ({ ...p, isSubmitted: true, isComposerOpen: false }));
                      setActiveView('topic');
                      confetti({ particleCount: 55, spread: 65, origin: { y: 0.7 } });
                    }}
                    className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa fa-check"></i>
                    <span>שליחה</span>
                  </button>
                  <button className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white text-xs px-2 py-1.5 border-r border-white/25 cursor-pointer">
                    <i className="fa fa-caret-down"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. `partials/composer-formatting.tpl` */}
            <div className="formatting-bar flex items-center justify-between gap-2 py-0.5 shrink-0">
              {/* Right: `ul.formatting-group` */}
              <ul className="flex items-center gap-1 overflow-x-auto">
                <li>
                  <button
                    ref={el => { targetsRef.current['btnBold'] = el; }}
                    onClick={() => handleFormat('bold')}
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs transition cursor-pointer ${
                      simState.activeTool === 'bold'
                        ? 'bg-[#0d6efd] text-white'
                        : 'text-[#212529] hover:bg-[#f8f9fa]'
                    }`}
                    title="מודגש"
                  >
                    <i className="fa fa-bold"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('italic')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="נטוי"
                  >
                    <i className="fa fa-italic"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('list')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="רשימה"
                  >
                    <i className="fa fa-list-ul"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('strikethrough')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="קו חוצה"
                  >
                    <i className="fa fa-strikethrough"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('code')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="קוד"
                  >
                    <i className="fa fa-code"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('link')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="קישור"
                  >
                    <i className="fa fa-link"></i>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleFormat('quote')}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="ציטוט"
                  >
                    <i className="fa fa-quote-right"></i>
                  </button>
                </li>
                <li>
                  <button
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="העלאת תמונה"
                  >
                    <i className="fa fa-picture-o"></i>
                  </button>
                </li>
                <li>
                  <button
                    className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#212529] hover:bg-[#f8f9fa] cursor-pointer"
                    title="אימוג'י"
                  >
                    <i className="fa-regular fa-face-smile"></i>
                  </button>
                </li>
              </ul>

              {/* Left: `הסתרת תצוגה מקדימה` + `עזרה` */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs font-semibold text-[#212529] hover:text-[#0d6efd] flex items-center gap-1 cursor-pointer px-1.5 py-1"
                >
                  <i className="fa fa-eye text-[#0d6efd]"></i>
                  <span className="hidden sm:inline">
                    {showPreview ? 'הסתרת תצוגה מקדימה' : 'הצגת תצוגה מקדימה'}
                  </span>
                </button>
                <button className="text-xs font-semibold text-[#212529] hover:text-[#0d6efd] flex items-center gap-1 cursor-pointer px-1.5 py-1">
                  <i className="fa fa-question"></i>
                  <span className="hidden sm:inline">עזרה</span>
                </button>
              </div>
            </div>

            {/* 3. `partials/composer-write-preview.tpl` (50/50 split) */}
            <div className="write-preview-container flex gap-2 flex-1 min-h-0">
              {/* Right half: `.write-container` */}
              <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full flex flex-col`}>
                <textarea
                  ref={el => { targetsRef.current['editor'] = el; }}
                  value={simState.body}
                  onChange={(e) => setSimState(p => ({ ...p, body: e.target.value }))}
                  readOnly={!isInteractive}
                  placeholder="כתבו את תוכן הפוסט כאן. ניתן לגרור ולשחרר כאן תמונות."
                  className="write w-full h-full border border-[#dee2e6] rounded p-2.5 text-xs md:text-sm text-[#212529] placeholder-[#6c757d] focus:border-[#86b7fe] focus:outline-none resize-none leading-relaxed"
                  dir="rtl"
                />
              </div>

              {/* Left half: `.preview-container` */}
              {showPreview && (
                <div className="preview-container w-1/2 h-full border border-[#f1f3f5] bg-[#fcfcfd] rounded p-2.5 overflow-y-auto">
                  <div className="preview w-full">
                    <MarkdownRenderer text={simState.body} />
                  </div>
                </div>
              )}
            </div>

            {/* 4. `partials/composer-tags.tpl` (shown when creating a topic) */}
            {mode === 'create' && (
              <div className="tag-row flex items-center gap-2 pt-1 border-t border-[#f1f3f5] text-xs shrink-0">
                <button className="text-[#212529] font-semibold flex items-center gap-1 px-2 py-0.5 hover:bg-[#f8f9fa] rounded">
                  <i className="fa fa-tags text-[#6c757d]"></i>
                  <span>בחירת תגים</span>
                </button>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  readOnly={!isInteractive}
                  placeholder="הכניסו תגים כאן, בין 3 ל 20 תווים כל אחד."
                  className="flex-1 text-xs text-[#212529] placeholder-[#6c757d] focus:outline-none"
                  dir="rtl"
                />
              </div>
            )}

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