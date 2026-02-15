import React, { useState } from 'react';
import ForumSimulator from './components/ForumSimulator';

const App: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>('sim-create');

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12" dir="rtl">
      
      {/* Real Rchsnik Banner */}
      <div className="modern-banner">
        <div className="banner-content">
          <h1 className="font-black text-4xl mb-3 text-[#3e2f1c]">מרכז ההדרכה של <span className="text-[#d4a373]">רכוסניק</span></h1>
          <p className="text-xl text-[#5c4b36] opacity-90 max-w-2xl mx-auto font-semibold">
            מקום של <strong>שיתוף</strong>, חסד, <strong>עזרה</strong> וידע – תושבי רכסים, ממלכת התורה בצפון.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 px-4">
        {/* Guide Item 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-create' ? null : 'sim-create')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-create' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-extrabold text-xl text-[#3e2f1c]">איך לפתוח נושא חדש ולעצב אותו?</span>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform ${openItem === 'sim-create' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-create' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-8 bg-white border-t border-gray-100">
              {openItem === 'sim-create' && <ForumSimulator mode="create" />}
            </div>
          </div>
        </div>

        {/* Guide Item 2 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-reply' ? null : 'sim-reply')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-reply' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-extrabold text-xl text-[#3e2f1c]">איך להגיב ולצרף תמונות לדיון?</span>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform ${openItem === 'sim-reply' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-reply' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-8 bg-white border-t border-gray-100">
              {openItem === 'sim-reply' && <ForumSimulator mode="reply" />}
            </div>
          </div>
        </div>

        {/* Guide Item 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <button 
            onClick={() => setOpenItem(openItem === 'sim-follow' ? null : 'sim-follow')}
            className={`w-full flex items-center justify-between p-6 text-right transition-all ${openItem === 'sim-follow' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-extrabold text-xl text-[#3e2f1c]">איך להפעיל מעקב אחרי שרשור?</span>
            <svg className={`w-6 h-6 text-[#d4a373] transition-transform ${openItem === 'sim-follow' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div className={`transition-all duration-700 ease-in-out overflow-hidden ${openItem === 'sim-follow' ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-8 bg-white border-t border-gray-100">
              {openItem === 'sim-follow' && <ForumSimulator mode="follow" />}
            </div>
          </div>
        </div>
      </div>

      {/* Real Contact Banner */}
      <div className="contact-banner mx-auto">
        <div className="contact-content">
          <p className="text-xl font-bold">
            ליצירת קשר שלחו מייל: 
            <span className="bg-[#d4a373] text-white px-3 py-1 rounded-lg mr-2 font-mono">rchsnik@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;