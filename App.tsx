import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';
import { SimulatorMode } from './types';

interface GuideSection {
    id: string;
    title: string;
    mode: SimulatorMode;
}

const App: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('sim-create');

  const guides: GuideSection[] = [
    { id: 'sim-create', title: '1. איך לפתוח נושא חדש ולעצב אותו?', mode: 'create' },
    { id: 'sim-reply', title: '2. איך להגיב עם עורך מפוצל (Split-View)?', mode: 'reply' },
    { id: 'sim-follow', title: '3. ניהול מעקב והתראות אחר נושאים', mode: 'follow' },
    { id: 'user-info', title: '4. הכרת אזור המשתמש והמוניטין', mode: 'user-info' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f9] pb-12" dir="rtl">
      
      {/* Rchsnik Banner - Original Gold/Brown Theme */}
      <div className="bg-gradient-to-r from-[#3e2f1c] to-[#5c4b36] py-16 px-4 text-center text-white mb-10 shadow-lg border-b-4 border-[#d4a373]">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-black text-5xl mb-4 drop-shadow-md">מרכז ההדרכה של <span className="text-[#d4a373]">רכוסניק</span></h1>
          <p className="text-xl opacity-90 font-medium max-w-2xl mx-auto leading-relaxed">
            גלו איך להשתמש בפורום הקהילתי של רכסים בצורה מקצועית.
            <br/>פתיחת נושאים, עריכה מתקדמת עם תצוגה מקדימה והכרת כרטיסי המשתמש.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 px-4">
        {guides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button 
                    onClick={() => setOpenItem(openItem === guide.id ? null : guide.id)}
                    className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === guide.id ? 'bg-[#fffcf5]' : 'hover:bg-gray-50'}`}
                >
                    <span className={`font-black text-xl ${openItem === guide.id ? 'text-[#337ab7]' : 'text-[#3e2f1c]'}`}>{guide.title}</span>
                    <svg className={`w-6 h-6 text-[#337ab7] transition-transform ${openItem === guide.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === guide.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                        {openItem === guide.id && <ForumSimulator mode={guide.mode} />}
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-12 text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-[#3e2f1c] font-bold text-lg mb-2">צריכים עזרה נוספת?</p>
          <a href="mailto:rchsnik@gmail.com" className="bg-[#337ab7] text-white px-8 py-2.5 rounded-lg font-black hover:bg-[#286090] transition-all inline-block shadow-md">rchsnik@gmail.com</a>
      </div>
    </div>
  );
};

export default App;
