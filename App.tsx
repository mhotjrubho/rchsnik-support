import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';
import { SimulatorMode } from './types';
import { 
  FileEdit, 
  MessageSquareReply, 
  BellRing, 
  UserCheck, 
  Store, 
  Newspaper, 
  BookOpen, 
  Home, 
  Mail, 
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle,
  Keyboard,
  ShieldCheck
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  shortTitle: string;
  mode: SimulatorMode;
  icon: React.ReactNode;
  description: string;
  tag: string;
  highlights: string[];
}

const App: React.FC = () => {
  const [activeGuideId, setActiveGuideId] = useState<string>('sim-create');

  const guides: GuideSection[] = [
    {
      id: 'sim-create',
      title: 'איך פותחים נושא חדש ברכוסניק (NodeBB Harmony)?',
      shortTitle: 'פתיחת נושא חדש',
      mode: 'create',
      icon: <FileEdit className="w-5 h-5" />,
      description: 'הדרכה מדויקת על דף הקטגוריה ב-NodeBB Harmony: לחיצה על "נושא חדש", הזנת כותרת, כתיבה בעורך המפוצל (Write/Preview), הוספת תגים ושליחה.',
      tag: 'דף קטגוריה ועורך',
      highlights: [
        'כפתור "נושא חדש" הכחול ממוקם בצד שמאל של סרגל הכלים בדף הקטגוריה',
        'בשורת הכותרת של העורך: בורר קטגוריה מימין, כותרת במרכז, והסתרה/ביטול/שליחה משמאל',
        'העורך חצוי 50/50: תיבת כתיבה מימין ותצוגה מקדימה חיה משמאל + שורת תגים בתחתית'
      ]
    },
    {
      id: 'sim-reply',
      title: 'איך מגיבים ומצטטים בתוך שרשור?',
      shortTitle: 'תגובה וציטוט בשרשור',
      mode: 'reply',
      icon: <MessageSquareReply className="w-5 h-5" />,
      description: 'הכירו את דף השרשור ב-NodeBB Harmony: כפתורי הציטוט והתגובה בתחתית כל פוסט, סרגל הכלים השמאלי של השרשור, וייבוא אוטומטי של ציטוט עם @תיוג.',
      tag: 'שיח וציטוטים',
      highlights: [
        'בתחתית כל פוסט בצד שמאל מופיעים סמלי תגובה (חץ), ציטוט (מרכאות) והצבעות 👍/👎',
        'לחיצה על ציטוט פותחת את העורך עם "@שם_משתמש כתב:" והטקסט המצוטט עם >',
        'ניתן להגיב לשרשור כולו גם דרך כפתור ה"תגובה" הכחול בעמודה השמאלית של השרשור'
      ]
    },
    {
      id: 'sim-follow',
      title: 'ניהול מעקב והתראות אחר נושאים',
      shortTitle: 'מעקב והתראות',
      mode: 'follow',
      icon: <BellRing className="w-5 h-5" />,
      description: 'למדו היכן נמצא תפריט המעקב ב-NodeBB Harmony (בעמודת כלי השרשור משמאל) וכיצד מגיעות התראות לפעמון בסרגל הצד השמאלי הקיצוני.',
      tag: 'סרגל כלים והתראות',
      highlights: [
        'כפתור המעקב נמצא בעמודת כלי השרשור השמאלית מתחת לכפתור "סימון כלא נקרא"',
        '3 מצבי מעקב ב-NodeBB: "במעקב" (עדכון על כל תגובה), "לא במעקב" ו-"התעלמות"',
        'התראות חדשות מופיעות בפעמון ההתראות בסרגל האנכי השמאלי של האתר'
      ]
    },
    {
      id: 'sim-user-info',
      title: 'שורת הכותב, הצבעת 👍 ודף הפרופיל ב-NodeBB Harmony',
      shortTitle: 'פרופיל, דרגות ומוניטין',
      mode: 'user-info',
      icon: <UserCheck className="w-5 h-5" />,
      description: 'ב-NodeBB Harmony פרטי המשתמש מוצגים בשורת הכותרת של הפוסט (עם תג קבוצה כגון "בעלי עסקים"), הצבעת 👍 מעלה מוניטין, ולחיצה פותחת את דף הפרופיל המלא.',
      tag: 'מוניטין ופרופיל',
      highlights: [
        'בראש כל פוסט מופיעים האווטאר (עם נקודה ירוקה למחוברים), שם הכותב ותג הקבוצה שלו',
        'לחיצה על 👍 בתחתית הפוסט הופכת את האימוג׳י מאפור לצבעוני ומעניקה מוניטין לכותב',
        'לחיצה על שם המשתמש מובילה לדף הפרופיל המציג קוביות מוניטין, צפיות, פוסטים ונושאים'
      ]
    }
  ];

  const activeGuide = guides.find(g => g.id === activeGuideId) || guides[0];

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#212529] font-heebo pb-16" dir="rtl">
      
      {/* Rchsnik Classic Gold & Brown Banner */}
      <div className="bg-gradient-to-r from-[#3e2f1c] via-[#4a3a25] to-[#5c4b36] py-10 px-4 text-white shadow-lg border-b-4 border-[#d4a373]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <a
                href="https://rchsnik.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2 rounded-xl shadow-md shrink-0 hover:scale-105 transition"
              >
                <img
                  src="https://rchsnik.com/assets/uploads/system/site-logo.png"
                  alt="פורום רכוסניק"
                  className="h-14 w-auto object-contain"
                />
              </a>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#d4a373]/25 border border-[#d4a373]/50 text-[#ffe8a1] px-3 py-0.5 rounded-full text-xs font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>מותאם 1:1 לממשק NodeBB Harmony של רכוסניק</span>
                </div>
                <h1 className="font-black text-3xl sm:text-4xl drop-shadow-sm">
                  מרכז ההדרכה של <span className="text-[#d4a373]">רכוסניק</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-200 font-medium mt-1">
                  הדמיה חיה ומדויקת של מבנה הפורום: סרגלי הצד של Harmony, דף הקטגוריה, כלי השרשור, העורך המפוצל ודף הפרופיל.
                </p>
              </div>
            </div>

            <a
              href="https://rchsnik.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#d4a373] hover:bg-[#e2b586] text-[#3e2f1c] font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 shrink-0"
            >
              <span>מעבר לפורום רכוסניק החי</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* 4 Guide Mode Selector Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
            {guides.map((guide, idx) => {
              const isActive = guide.id === activeGuideId;
              return (
                <button
                  key={guide.id}
                  onClick={() => setActiveGuideId(guide.id)}
                  className={`flex flex-col items-start p-3.5 rounded-xl text-right transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-white text-[#212529] shadow-lg border-white ring-2 ring-[#d4a373] -translate-y-0.5'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`p-1.5 rounded-lg ${isActive ? 'bg-[#0d6efd] text-white' : 'bg-white/15 text-[#d4a373]'}`}>
                      {guide.icon}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-amber-100 text-[#3e2f1c]' : 'bg-black/25 text-gray-200'
                    }`}>
                      {idx + 1}. {guide.tag}
                    </span>
                  </div>
                  <span className={`font-black text-sm block leading-snug ${isActive ? 'text-[#212529]' : 'text-white'}`}>
                    {guide.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Official Rchsnik Useful Links Pills (Matched to rchsnik.com) */}
      <div className="max-w-5xl mx-auto mt-6 mb-5 px-4">
        <div className="flex flex-wrap justify-center items-center gap-2">
          <a 
            href="https://rchsnik.com/category/55" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-4 py-1.5 text-xs font-bold shadow-2xs hover:text-[#caa34b] hover:border-[#caa34b] transition"
          >
            <Store className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>פרסום עסקים</span>
          </a>
          <a 
            href="https://rchsnik.com/topic/69" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-4 py-1.5 text-xs font-bold shadow-2xs hover:text-[#caa34b] hover:border-[#caa34b] transition"
          >
            <Newspaper className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>חדשות 'מידע רכסים'</span>
          </a>
          <a 
            href="https://rchsnik.com/topic/27" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-4 py-1.5 text-xs font-bold shadow-2xs hover:text-[#caa34b] hover:border-[#caa34b] transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>אינדקס הגמ"חים</span>
          </a>
          <a 
            href="https://rchsnik.com/Apartment-board" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-4 py-1.5 text-xs font-bold shadow-2xs hover:text-[#caa34b] hover:border-[#caa34b] transition"
          >
            <Home className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>לוח דירות</span>
          </a>
          <a 
            href="https://rchsnik.com/contact" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-4 py-1.5 text-xs font-bold shadow-2xs hover:text-[#caa34b] hover:border-[#caa34b] transition"
          >
            <Mail className="w-3.5 h-3.5 text-[#caa34b]" />
            <span>צור קשר</span>
          </a>
        </div>
      </div>

      {/* Main Simulator Card */}
      <div className="max-w-5xl mx-auto space-y-6 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-[#dee2e6] overflow-hidden">
          
          {/* Card Header */}
          <div className="p-5 border-b border-[#dee2e6] bg-[#fffdfa] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0d6efd] animate-pulse"></span>
                <span className="text-xs font-bold text-[#0d6efd]">סימולטור NodeBB v3 Harmony מדויק</span>
              </div>
              <h2 className="font-black text-xl sm:text-2xl text-[#3e2f1c] mb-1">
                {activeGuide.title}
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {activeGuide.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-[#fff8e6] border border-[#d4a373]/50 text-[#3e2f1c] text-xs px-3.5 py-2 rounded-xl font-bold">
              <Info className="w-4 h-4 text-[#b27b3d] shrink-0" />
              <span>ניתן גם להרחיב את סרגל הצד הימני או לעבור בין דפי הפורום</span>
            </div>
          </div>

          {/* Simulator Body */}
          <div className="p-3 sm:p-5 bg-[#f1f3f5]">
            <ForumSimulator mode={activeGuide.mode} />
          </div>

          {/* Key Highlights */}
          <div className="p-5 bg-white border-t border-[#dee2e6]">
            <h4 className="text-xs font-black uppercase text-[#6c757d] tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#0d6efd]" />
              <span>איך זה עובד ב-NodeBB Harmony ברכוסניק:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeGuide.highlights.map((hl, idx) => (
                <div key={idx} className="bg-[#f8f9fa] border border-[#dee2e6] rounded-xl p-3 text-xs text-[#212529] font-semibold flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0d6efd] text-white font-black flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{hl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Reference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#dee2e6] shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-[#e7f1ff] text-[#0d6efd]">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-[#212529]">קיצורי עיצוב בעורך NodeBB</h3>
                <p className="text-xs text-[#6c757d]">סרגל ה-Formatting Bar תומך בתחביר Markdown מלא</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9fa] border border-[#e9ecef]">
                <span className="font-bold">טקסט מודגש (Bold)</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#dee2e6] text-[#0d6efd] font-mono">**טקסט**</code>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9fa] border border-[#e9ecef]">
                <span className="font-bold">ציטוט הודעה עם תיוג</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#dee2e6] text-[#0d6efd] font-mono">@חצקל כתב: &gt; ציטוט</code>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#f8f9fa] border border-[#e9ecef]">
                <span className="font-bold">תיוג משתמש בקהילה</span>
                <code className="bg-white px-2 py-0.5 rounded border border-[#dee2e6] text-[#0d6efd] font-mono">@שם_משתמש</code>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dee2e6] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-[#fff8e6] text-[#b27b3d]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#212529]">מבנה הניווט ב-NodeBB Harmony</h3>
                  <p className="text-xs text-[#6c757d]">היכרות מהירה עם שני סרגלי הצד הקבועים באתר</p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-[#212529]">
                <li className="p-2 rounded bg-[#f8f9fa] border border-[#e9ecef]">
                  <strong>סרגל ימני (ניווט האתר):</strong> דף הבית, קטגוריות, חוקי הפורום, פוסטים אחרונים, פופולרי ולוח דירות (ניתן להרחבה בלחיצה על החצים בתחתית).
                </li>
                <li className="p-2 rounded bg-[#f8f9fa] border border-[#e9ecef]">
                  <strong>סרגל שמאלי (אזור אישי):</strong> תמונת הפרופיל שלכם וסטטוס חיבור, חיפוש מהיר, פעמון התראות וצ׳אטים פרטיים.
                </li>
              </ul>
            </div>
            <div className="mt-3 pt-2 border-t border-[#e9ecef] flex items-center justify-between text-xs">
              <span className="text-[#6c757d]">צריכים סיוע נוסף מצוות האתר?</span>
              <a href="mailto:rchsnik@gmail.com" className="font-bold text-[#0d6efd] hover:underline">
                rchsnik@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;