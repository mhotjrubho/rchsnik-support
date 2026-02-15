import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';

// Helper component for text-based guides
const GuideText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6 bg-white text-[#3e2f1c] leading-relaxed text-sm border-t border-[#f0e6d2]">
        {children}
    </div>
);

const App: React.FC = () => {
  // Using a string to track which accordion item is open (null = all closed)
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#f9f7f1] font-sans text-[#3e2f1c] p-4 md:p-8 dir-rtl" dir="rtl">
      
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-block p-3 rounded-full bg-[#d4a373] text-white font-bold text-2xl mb-4 shadow-lg">R</div>
        <h1 className="text-4xl font-extrabold text-[#5c4033] mb-3">מרכז המידע וההדרכה</h1>
        <p className="text-[#8b7355] text-lg max-w-2xl mx-auto">
          כל מה שצריך לדעת על השימוש בפורום החדש (NodeBB). מדריכים, טיפים וכלים מתקדמים.
        </p>
      </header>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_10px_40px_rgba(92,64,51,0.08)] border border-[#e6ccb2] overflow-hidden">
        
        {/* --- Simulator 1: New Topic --- */}
        <div className="border-b border-[#f0e6d2]">
          <button 
            onClick={() => toggle('sim-create')}
            className={`w-full flex items-center justify-between p-6 text-right hover:bg-[#fff9e6] transition-colors ${openItem === 'sim-create' ? 'bg-[#fffdf5]' : ''}`}
          >
            <div className="flex items-center gap-4">
                <span className="bg-[#27ae60] text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">+</span>
                <span className="font-bold text-lg text-[#5c4033]">איך פותחים נושא חדש ומעוצב?</span>
            </div>
            <span className={`text-[#d4a373] text-2xl transform transition-transform duration-300 ${openItem === 'sim-create' ? 'rotate-45' : ''}`}>+</span>
          </button>
          
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-create' ? 'max-h-[850px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-[#fffdf5] border-t border-[#f0e6d2]">
               {openItem === 'sim-create' && <ForumSimulator mode="create" />}
            </div>
          </div>
        </div>

        {/* --- Simulator 2: Reply --- */}
        <div className="border-b border-[#f0e6d2]">
          <button 
            onClick={() => toggle('sim-reply')}
            className={`w-full flex items-center justify-between p-6 text-right hover:bg-[#fff9e6] transition-colors ${openItem === 'sim-reply' ? 'bg-[#fffdf5]' : ''}`}
          >
             <div className="flex items-center gap-4">
                <span className="bg-[#2980b9] text-white w-8 h-8 rounded flex items-center justify-center font-bold text-lg">↩</span>
                <span className="font-bold text-lg text-[#5c4033]">איך מגיבים ומצטטים הודעה?</span>
            </div>
            <span className={`text-[#d4a373] text-2xl transform transition-transform duration-300 ${openItem === 'sim-reply' ? 'rotate-45' : ''}`}>+</span>
          </button>
          
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-reply' ? 'max-h-[850px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 bg-[#fffdf5] border-t border-[#f0e6d2]">
               {openItem === 'sim-reply' && <ForumSimulator mode="reply" />}
            </div>
          </div>
        </div>

         {/* --- Static Guide 1: Notifications --- */}
         <div className="border-b border-[#f0e6d2]">
          <button onClick={() => toggle('guide-notif')} className="w-full flex items-center justify-between p-6 text-right hover:bg-[#fff9e6] transition-colors">
            <span className="font-semibold text-[#5c4033] pr-12">מערכת ההתראות והמעקב</span>
            <span className={`text-[#d4a373] text-xl transform transition-transform ${openItem === 'guide-notif' ? 'rotate-45' : ''}`}>+</span>
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openItem === 'guide-notif' ? 'max-h-96' : 'max-h-0'}`}>
            <GuideText>
                <h3 className="font-bold mb-2">איך עוקבים אחרי נושא?</h3>
                <p className="mb-4">בתחתית כל שרשור (או בסרגל הצד) קיים כפתור "מעקב". ניתן לבחור בין:</p>
                <ul className="list-disc list-inside space-y-1 mb-4 text-[#5c4033]">
                    <li><strong>עוקב:</strong> קבלת התראה על כל תגובה חדשה.</li>
                    <li><strong>לא עוקב:</strong> ללא התראות, אלא אם כן תויגתם.</li>
                    <li><strong>מתעלם:</strong> הסתרת הנושא מרשימת הנושאים.</li>
                </ul>
                <p>הפעמון בראש העמוד יציג לכם את כל העדכונים בזמן אמת.</p>
            </GuideText>
          </div>
        </div>

        {/* --- Static Guide 2: Chat --- */}
        <div className="border-b border-[#f0e6d2]">
          <button onClick={() => toggle('guide-chat')} className="w-full flex items-center justify-between p-6 text-right hover:bg-[#fff9e6] transition-colors">
            <span className="font-semibold text-[#5c4033] pr-12">צ'אט פרטי וקבוצתי</span>
            <span className={`text-[#d4a373] text-xl transform transition-transform ${openItem === 'guide-chat' ? 'rotate-45' : ''}`}>+</span>
          </button>
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openItem === 'guide-chat' ? 'max-h-96' : 'max-h-0'}`}>
            <GuideText>
                <p className="mb-2">מערכת NodeBB מאפשרת שיחות פרטיות מתקדמות.</p>
                <p className="mb-2">כדי להתחיל שיחה:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>לחצו על תמונת הפרופיל של המשתמש.</li>
                    <li>בחרו בתפריט "שלח הודעה" (אייקון של בועת דיבור).</li>
                    <li>ניתן להוסיף משתתפים נוספים לשיחה בכל שלב.</li>
                </ol>
            </GuideText>
          </div>
        </div>

      </div>
      
      <div className="text-center mt-12 text-[#b0a99f] text-sm">
        &copy; 2024 רכוסניק - הבית של הקהילה
      </div>
    </div>
  );
};

export default App;