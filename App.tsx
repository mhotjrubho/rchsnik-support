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
      title: 'איך פותחים נושא חדש ברכוסניק?',
      shortTitle: 'פתיחת נושא חדש',
      mode: 'create',
      icon: <FileEdit className="w-5 h-5" />,
      description: 'הדרכה מעשית צעד-אחר-צעד: בחירת קטגוריה, כתיבת כותרת, עבודה עם העורך המפוצל ב-NodeBB ועיצוב ב-Markdown.',
      tag: 'הבסיס לחבר פורום',
      highlights: [
        'כפתור "נושא חדש" זמין בראש כל קטגוריה בפורום',
        'מסך העריכה מחולק: עורך טקסט מימין ותצוגה מקדימה משמאל',
        'כפתור השליחה ממוקם בפינה השמאלית העליונה של העורך'
      ]
    },
    {
      id: 'sim-reply',
      title: 'איך מגיבים בתוך שרשור ומצטטים נכון?',
      shortTitle: 'מענה וציטוט',
      mode: 'reply',
      icon: <MessageSquareReply className="w-5 h-5" />,
      description: 'למדו כיצד לענות לפוסט קיים, לצטט דברים של משתמש אחר, ולשמור על סדר הדיון בקהילת רכסים.',
      tag: 'אינטראקציה ושיח',
      highlights: [
        'לחיצה על "תגובה" או "ציטוט" בתחתית כל פוסט',
        'סמל הציטוט מייבא את הטקסט ומציג אותו בבלוק מודגש',
        'המחבר המקורי מקבל התראה ישירה על התגובה'
      ]
    },
    {
      id: 'sim-follow',
      title: 'איך לנהל מעקב והתראות אחרי נושאים?',
      shortTitle: 'מעקב והתראות',
      mode: 'follow',
      icon: <BellRing className="w-5 h-5" />,
      description: 'שליטה מלאה בהתראות: בחרו בין "עוקב", "מעקב רגיל" ו-"התעלם" כדי להישאר מעודכנים מבלי להציף את הדואר.',
      tag: 'ניהול תוכן',
      highlights: [
        'כפתור המעקב (הפעמון) נמצא לצד כותרת הנושא',
        'בחירה ב-"עוקב" שולחת התראה על כל תגובה חדשה',
        'ההתראות מופיעות בפעמון ההתראות בראש האתר'
      ]
    },
    {
      id: 'sim-user-info',
      title: 'הכרת כרטיס המשתמש, דרגות ומוניטין',
      shortTitle: 'כרטיס משתמש ומוניטין',
      mode: 'user-info',
      icon: <UserCheck className="w-5 h-5" />,
      description: 'הבנת מבנה הפרופילים ברכוסניק: תגי קבוצות ("בעלי עסקים", "צוות פיקוח"), מוניטין וכמות תגובות.',
      tag: 'אמינות הקהילה',
      highlights: [
        'כרטיס המשתמש מופיע לצד כל פוסט שנכתב',
        'מוניטין נצבר באמצעות הצבעות חיוביות על פוסטים מועילים',
        'תגי דרגה מעידים על תפקיד המשתמש או בעלות על עסק מקומי'
      ]
    }
  ];

  const activeGuide = guides.find(g => g.id === activeGuideId) || guides[0];

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#212529] font-heebo pb-16" dir="rtl">
      
      {/* Top Bar with real Rchsnik Logo and Navigation Links */}
      <header className="bg-white border-b border-[#dcdcdc] sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <a href="https://rchsnik.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
              <img 
                src="https://rchsnik.com/assets/uploads/system/site-logo.png" 
                alt="פורום רכוסניק" 
                className="h-10 w-auto object-contain drop-shadow-xs"
                onError={(e) => {
                  // Fallback if network blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <span className="text-xl font-black text-[#01263c] tracking-tight block leading-none">
                  רכוסניק
                </span>
                <span className="text-[11px] font-bold text-[#caa34b] tracking-wide">
                  הקהילה הדיגיטלית של תושבי רכסים
                </span>
              </div>
            </a>
          </div>

          {/* Quick link to live forum & badge */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#caa34b]/15 text-[#8c6b20] border border-[#caa34b]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#caa34b]" />
              מרכז הדרכה והדמיה רשמי
            </span>

            <a 
              href="https://rchsnik.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#01263c] hover:text-[#caa34b] transition border border-[#dcdcdc] px-3 py-1.5 rounded-full bg-white hover:border-[#caa34b]"
            >
              <span>מעבר לאתר רכוסניק</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </header>

      {/* Official Rchsnik Useful Links Banner - 100% matched to https://rchsnik.com/ */}
      <div className="max-w-5xl mx-auto my-7 px-4">
        <div className="text-center mb-6">
          <h2 className="text-[#caa34b] font-black text-2xl md:text-3xl mb-1 tracking-tight">
            קישורים שימושיים בפורום רכוסניק
          </h2>
          <p className="text-gray-500 text-sm">
            למדו להשתמש בכלים ובאפשרויות של הפורום הקהילתי המוביל ברכסים
          </p>
        </div>

        {/* 5 Official Pills directly from rchsnik.com banner */}
        <div className="flex flex-wrap justify-center items-center gap-2.5">
          <a 
            href="https://rchsnik.com/category/55" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-5 py-2 text-sm font-bold shadow-xs hover:text-[#caa34b] hover:border-[#caa34b] hover:-translate-y-0.5 transition duration-200"
          >
            <Store className="w-4 h-4 text-[#caa34b]" />
            <span>פרסום עסקים</span>
          </a>

          <a 
            href="https://rchsnik.com/topic/69" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-5 py-2 text-sm font-bold shadow-xs hover:text-[#caa34b] hover:border-[#caa34b] hover:-translate-y-0.5 transition duration-200"
          >
            <Newspaper className="w-4 h-4 text-[#caa34b]" />
            <span>חדשות 'מידע רכסים'</span>
          </a>

          <a 
            href="https://rchsnik.com/topic/27" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-5 py-2 text-sm font-bold shadow-xs hover:text-[#caa34b] hover:border-[#caa34b] hover:-translate-y-0.5 transition duration-200"
          >
            <BookOpen className="w-4 h-4 text-[#caa34b]" />
            <span>אינדקס הגמ"חים</span>
          </a>

          <a 
            href="https://rchsnik.com/Apartment-board" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-5 py-2 text-sm font-bold shadow-xs hover:text-[#caa34b] hover:border-[#caa34b] hover:-translate-y-0.5 transition duration-200"
          >
            <Home className="w-4 h-4 text-[#caa34b]" />
            <span>לוח דירות</span>
          </a>

          <a 
            href="https://rchsnik.com/contact" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 bg-white text-[#01263c] border border-[#dcdcdc] rounded-full px-5 py-2 text-sm font-bold shadow-xs hover:text-[#caa34b] hover:border-[#caa34b] hover:-translate-y-0.5 transition duration-200"
          >
            <Mail className="w-4 h-4 text-[#caa34b]" />
            <span>צור קשר</span>
          </a>
        </div>
      </div>

      {/* Guide Modules Tabs */}
      <div className="max-w-5xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {guides.map((guide) => {
            const isActive = guide.id === activeGuideId;
            return (
              <button
                key={guide.id}
                onClick={() => setActiveGuideId(guide.id)}
                className={`flex flex-col items-start p-3.5 rounded-xl text-right transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-[#01263c] text-white shadow-lg border-[#01263c] ring-2 ring-[#caa34b]'
                    : 'bg-white text-gray-800 border-[#dcdcdc] hover:border-[#caa34b] hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className={`p-2 rounded-lg ${isActive ? 'bg-[#caa34b] text-[#01263c]' : 'bg-[#f4f7f9] text-[#01263c]'}`}>
                    {guide.icon}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {guide.tag}
                  </span>
                </div>
                <span className={`font-black text-sm block leading-snug ${isActive ? 'text-white' : 'text-[#01263c]'}`}>
                  {guide.shortTitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Container */}
      <div className="max-w-5xl mx-auto space-y-6 px-4">
        
        {/* Active Guide Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#dcdcdc] overflow-hidden">
          
          {/* Card Header */}
          <div className="p-5 border-b border-[#eceff1] bg-[#fffdfa] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#01263c]">הדמיית ממשק NodeBB של רכוסניק</span>
              </div>
              <h2 className="font-black text-2xl text-[#01263c] mb-1">
                {activeGuide.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                {activeGuide.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-amber-50/80 border border-[#caa34b]/40 text-[#8c6b20] text-xs px-3.5 py-2 rounded-xl font-bold">
              <Info className="w-4 h-4 text-[#caa34b] shrink-0" />
              <span>עקבו אחר הסמן האוטומטי או לחצו "נסו בעצמכם"</span>
            </div>
          </div>

          {/* Simulator Component */}
          <div className="p-4 md:p-6 bg-[#f8fafc]">
            <ForumSimulator mode={activeGuide.mode} />
          </div>

          {/* Key Highlights */}
          <div className="p-5 bg-white border-t border-[#eceff1]">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#caa34b]" />
              <span>דגשים עיקריים שחשוב לזכור:</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activeGuide.highlights.map((hl, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs text-gray-700 font-semibold flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#01263c] text-white font-black flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{hl}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Markdown Quick Cheat Sheet */}
          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-50 text-[#01263c]">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#01263c]">עיצוב בפורום רכוסניק (Markdown)</h3>
                  <p className="text-xs text-gray-500">עורך NodeBB של האתר מאפשר עיצוב מהיר מהמקלדת</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#eceff1]">
                  <span className="font-bold text-gray-800">כתב מודגש</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#01263c] font-mono">**טקסט** או Ctrl+B</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#eceff1]">
                  <span className="font-bold text-gray-800">כתב נטוי</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#01263c] font-mono">*טקסט* או Ctrl+I</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#eceff1]">
                  <span className="font-bold text-gray-800">ציטוט תוכן</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#01263c] font-mono">&gt; תוכן הציטוט</code>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#eceff1]">
                  <span className="font-bold text-gray-800">רשימת נקודות</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-gray-200 text-[#01263c] font-mono">- פריט ברשימה</code>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-[#eceff1]">
              בתצוגה המקדימה בצד שמאל תוכלו לראות תמיד את הפוסט כפי שיופיע לקוראים בפורום.
            </p>
          </div>

          {/* Forum Rules & Ethics */}
          <div className="bg-white p-5 rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-amber-50 text-[#caa34b]">
                  <ShieldCheck className="w-5 h-5 text-[#8c6b20]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#01263c]">תקנון וכללי הקהילה</h3>
                  <p className="text-xs text-gray-500">שמירה על שיח מכבד ומועיל בין תושבי רכסים</p>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-2 p-2 rounded-lg bg-[#f8f9fa]">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>כותרת מדויקת:</strong> ציינו בבירור את הבקשה או המידע בכותרת הנושא.</span>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-lg bg-[#f8f9fa]">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>בחירת קטגוריה מתאימה:</strong> פרסום עסקים בלוח עסקים, גמ"חים ב'איש את רעהו יעזורו'.</span>
                </li>
                <li className="flex items-start gap-2 p-2 rounded-lg bg-[#f8f9fa]">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>הכרת הטוב ומוניטין:</strong> קיבלתם סיוע? הצביעו בעד התגובה להעלאת המוניטין של העוזר.</span>
                </li>
              </ul>
            </div>

            <div className="mt-3 pt-2 border-t border-[#eceff1] flex items-center justify-between text-xs">
              <span className="text-gray-400">פורום רכוסניק • מבוסס NodeBB Harmony</span>
              <a href="https://rchsnik.com/topic/8/תקנון-הפורום" target="_blank" rel="noopener noreferrer" className="font-bold text-[#01263c] hover:underline flex items-center gap-1">
                <span>תקנון הפורום המלא</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Contact Forum Administration */}
        <div className="text-center p-8 bg-white rounded-2xl border border-[#dcdcdc] shadow-xs flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#01263c]/10 text-[#01263c] flex items-center justify-center mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-[#01263c] font-black text-xl mb-1">
            צריכים עזרה נוספת או פנייה להנהלת הפורום?
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            צוות הניהול של רכוסניק זמין לסייע בכל שאלה, בעיה טכנית או הצטרפות לקבוצות המיוחדות.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:rchsnik@gmail.com"
              className="bg-[#01263c] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#caa34b] hover:text-[#01263c] transition-all inline-flex items-center gap-2 shadow-xs text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>דוא"ל: rchsnik@gmail.com</span>
            </a>
            <a
              href="https://rchsnik.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-[#01263c] border border-[#dcdcdc] px-6 py-2.5 rounded-xl font-bold hover:border-[#caa34b] hover:text-[#caa34b] transition-all inline-flex items-center gap-2 shadow-xs text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>טופס יצירת קשר באתר</span>
            </a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 mt-12">
        מרכז ההדרכה הרשמי • מותאם ב-100% לפורום רכוסניק (rchsnik.com) • מבוסס NodeBB Harmony
      </footer>

    </div>
  );
};

export default App;